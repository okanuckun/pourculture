import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Clock, MessageCircle, Loader2, Trash2, MessageSquare, Lightbulb, HelpCircle, Heart } from 'lucide-react';
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

const categoryLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  general: { label: 'Genel', color: 'bg-blue-500/10 text-blue-600', icon: MessageSquare },
  suggestion: { label: 'Öneri', color: 'bg-amber-500/10 text-amber-600', icon: Lightbulb },
  question: { label: 'Soru', color: 'bg-green-500/10 text-green-600', icon: HelpCircle },
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
    // Check auth state
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

    // Get like count
    const { count: likeCount } = await supabase
      .from('forum_likes')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', id);

    // Check if current user liked this topic
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

    // Get author name
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

    // Get author names for all comments
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
        title: 'Giriş gerekli',
        description: 'Yorum yapmak için lütfen giriş yapın',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Hata',
        description: 'Yorum boş olamaz',
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
        title: 'Hata',
        description: 'Yorum eklenemedi',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: 'Başarılı',
      description: 'Yorumunuz eklendi',
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
        title: 'Hata',
        description: 'Yorum silinemedi',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Silindi',
      description: 'Yorum başarıyla silindi',
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
        title: 'Hata',
        description: 'Konu silinemedi',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Silindi',
      description: 'Konu başarıyla silindi',
    });

    navigate('/forum');
  };

  const handleToggleLike = async () => {
    if (!userId) {
      toast({
        title: 'Giriş gerekli',
        description: 'Beğenmek için lütfen giriş yapın',
        variant: 'destructive',
      });
      return;
    }

    if (!topic) return;

    if (topic.is_liked) {
      // Remove like
      await supabase
        .from('forum_likes')
        .delete()
        .eq('topic_id', id)
        .eq('user_id', userId);
    } else {
      // Add like
      await supabase
        .from('forum_likes')
        .insert({
          topic_id: id,
          user_id: userId,
        });
    }

    // Update local state
    setTopic({
      ...topic,
      is_liked: !topic.is_liked,
      like_count: topic.is_liked ? topic.like_count - 1 : topic.like_count + 1,
    });
  };

  if (loading) {
    return (
      <>
        <RaisinNavbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  if (!topic) {
    return null;
  }

  return (
    <>
      <SEOHead
        title={`${topic.title} | Forum`}
        description={topic.content.substring(0, 160)}
      />
      <RaisinNavbar />
      
      <main className="min-h-screen bg-background pt-20">
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
          {/* Back Button */}
          <Link to="/forum" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Foruma Dön
          </Link>

          {/* Topic */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 mb-8"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {topic.category && categoryLabels[topic.category] && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full mb-3 ${categoryLabels[topic.category].color}`}>
                    {React.createElement(categoryLabels[topic.category].icon, { className: 'w-3.5 h-3.5' })}
                    {categoryLabels[topic.category].label}
                  </span>
                )}
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
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
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konuyu Sil</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu konuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm yorumlar da silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteTopic} className="bg-destructive text-destructive-foreground">
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
                {comments.length} yorum
              </span>
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1 transition-colors ${
                  topic.is_liked ? 'text-red-500' : 'hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${topic.is_liked ? 'fill-current' : ''}`} />
                {topic.like_count} beğeni
              </button>
            </div>

            {topic.image_url && (
              <div className="mb-4">
                <img
                  src={topic.image_url}
                  alt={topic.title}
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{topic.content}</p>
            </div>
          </motion.article>

          {/* Comments Section */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Yorumlar ({comments.length})
            </h2>

            {/* Add Comment */}
            <div className="bg-card border border-border rounded-xl p-4">
              <Textarea
                placeholder={userId ? "Yorumunuzu yazın..." : "Yorum yapmak için giriş yapın"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                disabled={!userId}
              />
              <div className="flex justify-end mt-3">
                <Button onClick={handleAddComment} disabled={submitting || !userId}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yorum Ekle'}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz yorum yok. İlk yorumu sen yap!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground text-sm">{comment.author_name}</span>
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
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Yorumu Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu yorumu silmek istediğinizden emin misiniz?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive text-destructive-foreground">
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    
                    <p className="text-foreground text-sm mt-3 whitespace-pre-wrap pl-11">
                      {comment.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ForumTopic;
