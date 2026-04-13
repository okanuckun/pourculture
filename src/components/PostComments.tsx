import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  author_name?: string;
}

interface PostCommentsProps {
  postId: string;
  userId: string | null;
  commentCount: number;
  onCommentCountChange: (postId: string, delta: number) => void;
}

export function PostComments({ postId, userId, commentCount, onCommentCountChange }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, post_id, user_id, comment_text, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
      return;
    }

    // Fetch author names
    const userIds = [...new Set((data || []).map(c => c.user_id))];
    let profileMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      (profiles || []).forEach(p => {
        profileMap.set(p.user_id, p.display_name || 'Anonymous');
      });
    }

    setComments((data || []).map(c => ({
      ...c,
      author_name: profileMap.get(c.user_id) || 'Anonymous',
    })));
    setLoading(false);
  };

  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [expanded]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !userId) {
      if (!userId) toast.error('Yorum yapmak için giriş yapın');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('post_comments').insert({
      post_id: postId,
      user_id: userId,
      comment_text: newComment.trim(),
    } as any);

    if (error) {
      toast.error('Yorum gönderilemedi');
      console.error(error);
    } else {
      setNewComment('');
      onCommentCountChange(postId, 1);
      await fetchComments();
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
    if (error) {
      toast.error('Yorum silinemedi');
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId));
      onCommentCountChange(postId, -1);
    }
  };

  return (
    <div className="border-t border-border">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>{commentCount} yorum</span>
        {expanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {/* Comments list */}
          {loading ? (
            <p className="text-[10px] text-muted-foreground">Yükleniyor...</p>
          ) : comments.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">Henüz yorum yok</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">
                      <span className="font-semibold mr-1">{c.author_name}</span>
                      {c.comment_text}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {userId === c.user_id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="flex gap-2 pt-1">
            <Input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={userId ? "Yorum yaz..." : "Giriş yapın"}
              className="h-8 text-xs"
              disabled={!userId || submitting}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSubmit}
              disabled={!userId || !newComment.trim() || submitting}
              className="h-8 w-8 p-0 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
