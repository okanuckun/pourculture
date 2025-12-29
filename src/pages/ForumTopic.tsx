import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Clock, MessageCircle, Loader2, Trash2, MessageSquare, Lightbulb, HelpCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const categoryLabels: Record<string, { label: string; icon: React.ElementType }> = {
  general: { label: 'GENERAL', icon: MessageSquare },
  suggestion: { label: 'SUGGESTION', icon: Lightbulb },
  question: { label: 'QUESTION', icon: HelpCircle },
};

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
  author_name: string;
  like_count: number;
  is_liked: boolean;
  image_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  author_name: string;
}

const ForumTopic = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchTopic();
      fetchComments();
    }
  }, [id, userId]);

  const fetchTopic = async () => {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      navigate('/forum');
      return;
    }

    const { count: likeCount } = await supabase
      .from('forum_likes')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', id);

    let isLiked = false;
    if (userId) {
      const { data: likeData } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('topic_id', id)
        .eq('user_id', userId)
        .maybeSingle();
      isLiked = !!likeData;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', data.user_id)
      .single();

    setTopic({
      ...data,
      author_name: profile?.display_name || 'Anonymous',
      like_count: likeCount || 0,
      is_liked: isLiked,
      image_url: data.image_url,
    });
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('topic_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    const commentsWithAuthors = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', comment.user_id)
          .single();

        return {
          ...comment,
          author_name: profile?.display_name || 'Anonymous',
        };
      })
    );

    setComments(commentsWithAuthors);
  };

  const handleAddComment = async () => {
    if (!userId) {
      toast({
        title: 'Login required',
        description: 'Please sign in to comment',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('forum_comments')
      .insert({
        topic_id: id,
        content: newComment.trim(),
        user_id: userId,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: 'Success',
      description: 'Your comment has been added',
    });

    setNewComment('');
    setSubmitting(false);
    fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('forum_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: 'Comment deleted successfully',
    });

    fetchComments();
  };

  const handleDeleteTopic = async () => {
    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete topic',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: 'Topic deleted successfully',
    });

    navigate('/forum');
  };

  const handleToggleLike = async () => {
    if (!userId) {
      toast({
        title: 'Login required',
        description: 'Please sign in to like topics',
        variant: 'destructive',
      });
      return;
    }

    if (!topic) return;

    if (topic.is_liked) {
      await supabase
        .from('forum_likes')
        .delete()
        .eq('topic_id', id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('forum_likes')
        .insert({
          topic_id: id,
          user_id: userId,
        });
    }

    setTopic({
      ...topic,
      is_liked: !topic.is_liked,
      like_count: topic.is_liked ? topic.like_count - 1 : topic.like_count + 1,
    });
  };

  if (loading) {
    return (
      <BrutalistLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </BrutalistLayout>
    );
  }

  if (!topic) {
    return null;
  }

  const categoryInfo = categoryLabels[topic.category] || categoryLabels.general;
  const CategoryIcon = categoryInfo.icon;

  return (
    <BrutalistLayout showBackButton backPath="/forum" backLabel="Forum">
      <SEOHead
        title={`${topic.title} | Forum`}
        description={topic.content.substring(0, 160)}
      />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Topic */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-foreground/20 p-6 mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-wider border border-foreground/20 mb-3">
                <CategoryIcon className="w-3 h-3" />
                {categoryInfo.label}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {topic.title}
              </h1>
            </div>
            
            {userId === topic.user_id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-2 border-foreground/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this topic? This action cannot be undone and all comments will be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-foreground/20">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTopic} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {topic.author_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {comments.length} comments
            </span>
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1 transition-colors ${
                topic.is_liked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${topic.is_liked ? 'fill-current' : ''}`} />
              {topic.like_count} likes
            </button>
          </div>

          {topic.image_url && (
            <div className="mb-4">
              <img
                src={topic.image_url}
                alt={topic.title}
                className="w-full max-h-96 object-cover border border-foreground/20"
              />
            </div>
          )}

          <div className="text-foreground leading-relaxed">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>
        </motion.article>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            COMMENTS ({comments.length})
          </h2>

          {/* Add Comment */}
          <div className="border-2 border-foreground/20 p-4">
            <Textarea
              placeholder={userId ? "Write a comment..." : "Sign in to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={!userId}
              className="border-foreground/20 mb-3"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddComment} 
                disabled={submitting || !userId}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ADD COMMENT'}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-8 border border-foreground/20 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-foreground/20 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    {userId === comment.user_id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-2 border-foreground/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this comment?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-foreground/20">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive text-destructive-foreground">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  
                  <p className="text-sm mt-3 whitespace-pre-wrap pl-11">
                    {comment.content}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BrutalistLayout>
  );
};

export default ForumTopic;
