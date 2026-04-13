import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
  };
}

interface VenueReviewsProps {
  venueId: string;
  venueType: 'venue' | 'winemaker';
  userId?: string;
}

export const VenueReviews: React.FC<VenueReviewsProps> = ({ venueId, venueType, userId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [venueId]);

  const fetchReviews = async () => {
    setLoading(true);
    
    let reviewsData: any[] = [];
    let error = null;

    if (venueType === 'venue') {
      const result = await supabase
        .from('venue_reviews')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });
      reviewsData = result.data || [];
      error = result.error;
    } else {
      const result = await supabase
        .from('winemaker_reviews')
        .select('*')
        .eq('winemaker_id', venueId)
        .order('created_at', { ascending: false });
      reviewsData = result.data || [];
      error = result.error;
    }

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      const userIds = reviewsData.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      
      const formattedReviews = reviewsData.map(review => ({
        ...review,
        profile: profileMap.get(review.user_id)
      }));
      setReviews(formattedReviews as Review[]);
      
      if (userId) {
        const existing = formattedReviews.find(r => r.user_id === userId);
        if (existing) {
          setUserReview(existing as Review);
          setNewRating(existing.rating);
          setNewComment(existing.comment || '');
        }
      }
    }
    
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "Yorum yapmak için lütfen giriş yapın.",
        variant: "destructive"
      });
      return;
    }

    if (newRating === 0) {
      toast({
        title: "Puan seçin",
        description: "Lütfen 1-5 arasında bir puan seçin.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    let result;
    if (userReview) {
      if (venueType === 'venue') {
        result = await supabase
          .from('venue_reviews')
          .update({ rating: newRating, comment: newComment.trim() || null })
          .eq('id', userReview.id);
      } else {
        result = await supabase
          .from('winemaker_reviews')
          .update({ rating: newRating, comment: newComment.trim() || null })
          .eq('id', userReview.id);
      }
    } else {
      if (venueType === 'venue') {
        result = await supabase
          .from('venue_reviews')
          .insert({
            venue_id: venueId,
            user_id: userId,
            rating: newRating,
            comment: newComment.trim() || null
          });
      } else {
        result = await supabase
          .from('winemaker_reviews')
          .insert({
            winemaker_id: venueId,
            user_id: userId,
            rating: newRating,
            comment: newComment.trim() || null
          });
      }
    }

    if (result.error) {
      toast({
        title: "Hata",
        description: "Yorumunuz kaydedilemedi. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } else {
      toast({
        title: userReview ? "Updated" : "Review added",
        description: userReview ? "Yorumunuz güncellendi." : "Yorumunuz başarıyla eklendi."
      });
      fetchReviews();
    }

    setSubmitting(false);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Müşteri Yorumları</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({reviews.length} yorum)</span>
          </div>
        )}
      </div>

      {userId && (
        <div className="p-4 rounded-lg bg-muted/50 mb-4">
          <p className="text-sm font-medium text-foreground mb-2">
            {userReview ? 'Yorumunuzu güncelleyin' : 'Yorum ekleyin'}
          </p>
          
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star 
                  className={`w-6 h-6 ${
                    star <= (hoverRating || newRating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          
          <Textarea
            placeholder="Share your experience..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="mb-3"
          />
          
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || newRating === 0}
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : (userReview ? 'Update' : 'Submit')}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground text-sm">Yükeniyor...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Henüz yorum yok. İlk yorumu siz yapın!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {review.profile?.display_name || 'Anonim'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: tr })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-muted-foreground text-sm">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
