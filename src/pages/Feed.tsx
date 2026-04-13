import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart, MessageCircle, MapPin, Wine, Camera, Loader2, Plus, X, Send, ChevronDown, UserPlus, UserCheck,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';

interface Post {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  wine_name: string | null;
  wine_type: string | null;
  winery: string | null;
  vintage: string | null;
  rating: number | null;
  venue_name: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
  tasting_notes: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string;
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
  is_following?: boolean;
}

const WINE_TYPES = [
  { value: 'natural', label: 'Natural' },
  { value: 'biodynamic', label: 'Biodynamic' },
  { value: 'orange', label: 'Orange' },
  { value: 'pet-nat', label: 'Pét-Nat' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'unknown', label: 'Other' },
];

const PAGE_SIZE = 20;

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('all');
  const [cities, setCities] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Create post form
  const [newPost, setNewPost] = useState({
    caption: '',
    wine_name: '',
    wine_type: 'natural',
    winery: '',
    vintage: '',
    rating: 0,
    venue_name: '',
    city: '',
    country: '',
    post_type: 'bottle',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const venueInputRef = useRef<HTMLInputElement>(null);
  const { isLoaded: placesLoaded, onPlaceSelected } = useGooglePlacesAutocomplete(venueInputRef);

  // Google Places venue callback
  useEffect(() => {
    if (!placesLoaded) return;
    onPlaceSelected((place) => {
      const name = place.name || '';
      const address = place.formatted_address || '';
      // Extract city from address (rough parse — usually 2nd to last comma segment)
      const parts = address.split(',').map(s => s.trim());
      const city = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
      const country = parts.length >= 1 ? parts[parts.length - 1] : '';

      setNewPost(p => ({
        ...p,
        venue_name: name,
        city: city.replace(/\d/g, '').trim(), // Remove postal codes
        country: country.trim(),
      }));
    });
  }, [placesLoaded]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchPosts(0);
    fetchCities();
  }, [selectedCity, userId]);

  const fetchCities = async () => {
    const { data } = await supabase
      .from('posts')
      .select('city')
      .order('city');
    if (data) {
      const unique = [...new Set(data.map(d => d.city).filter(Boolean))];
      setCities(unique);
    }
  };

  const fetchPosts = async (offset: number, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (selectedCity !== 'all') {
        query = query.eq('city', selectedCity);
      }

      const { data: postsData } = await query;
      const items = postsData || [];
      setHasMore(items.length === PAGE_SIZE);

      // Batch fetch: profiles, likes, comments
      const postIds = items.map(p => p.id);
      const userIds = [...new Set(items.map(p => p.user_id))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));

      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds);
      const likeCountMap = new Map<string, number>();
      (likes || []).forEach(l => {
        likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1);
      });

      let userLikeSet = new Set<string>();
      if (userId) {
        const { data: userLikes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds);
        userLikeSet = new Set((userLikes || []).map(l => l.post_id));
      }

      const { data: comments } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds);
      const commentCountMap = new Map<string, number>();
      (comments || []).forEach(c => {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
      });

      // Fetch who user follows (from post authors)
      let followingSet = new Set<string>();
      if (userId) {
        const { data: following } = await (supabase as any)
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)
          .in('following_id', userIds);
        followingSet = new Set((following || []).map((f: any) => f.following_id));
      }

      const enriched: Post[] = items.map(post => ({
        ...post,
        author_name: profileMap.get(post.user_id) || 'Anonymous',
        like_count: likeCountMap.get(post.id) || 0,
        comment_count: commentCountMap.get(post.id) || 0,
        is_liked: userLikeSet.has(post.id),
        is_following: followingSet.has(post.user_id),
      }));

      setPosts(prev => append ? [...prev, ...enriched] : enriched);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
    if (!userId) { toast.error('Sign in to follow'); return; }
    if (targetUserId === userId) return;

    if (isFollowing) {
      await (supabase as any).from('follows').delete().eq('follower_id', userId).eq('following_id', targetUserId);
    } else {
      await (supabase as any).from('follows').insert({ follower_id: userId, following_id: targetUserId });
    }

    setPosts(prev => prev.map(p =>
      p.user_id === targetUserId ? { ...p, is_following: !isFollowing } : p
    ));
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!userId) { toast.error('Sign in to like posts'); return; }

    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    }

    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, is_liked: !isLiked, like_count: (p.like_count || 0) + (isLiked ? -1 : 1) }
        : p
    ));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreatePost = async () => {
    if (!userId) { toast.error('Sign in to post'); return; }
    if (!selectedImage) { toast.error('Add a photo'); return; }
    if (!newPost.city) { toast.error('Enter your city'); return; }

    setUploading(true);
    try {
      // Upload image
      const fileName = `${Date.now()}-${selectedImage.name}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      // Create post
      const { error: postError } = await supabase.from('posts').insert({
        user_id: userId,
        image_url: urlData.publicUrl,
        caption: newPost.caption || null,
        wine_name: newPost.wine_name || null,
        wine_type: newPost.wine_type || null,
        winery: newPost.winery || null,
        vintage: newPost.vintage || null,
        rating: newPost.rating || null,
        venue_name: newPost.venue_name || null,
        city: newPost.city,
        country: newPost.country || '',
      });

      if (postError) throw postError;

      toast.success('Posted!');
      setIsCreateOpen(false);
      setNewPost({ caption: '', wine_name: '', wine_type: 'natural', winery: '', vintage: '', rating: 0, venue_name: '', city: '', country: '', post_type: 'bottle' });
      setSelectedImage(null);
      setImagePreview(null);
      fetchPosts(0);
      fetchCities();
    } catch (err: any) {
      const msg = err?.message || 'Failed to create post';
      if (msg.includes('storage') || msg.includes('bucket')) {
        toast.error('Image upload not configured. Contact support.');
      } else {
        toast.error(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <BrutalistLayout>
      <SEOHead title="Feed | POURCULTURE" description="See what people are drinking near you" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-lg tracking-tight">Feed</h1>
            <p className="text-xs text-muted-foreground">What people are drinking near you</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-bold tracking-tight">Share a Moment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Photo */}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full aspect-square object-cover rounded-lg" />
                    <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-foreground/20 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-foreground/40 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add photo</span>
                  </button>
                )}

                <Textarea
                  placeholder="What are you drinking? Share your thoughts..."
                  value={newPost.caption}
                  onChange={(e) => setNewPost(p => ({ ...p, caption: e.target.value }))}
                  className="h-20 text-sm resize-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Wine Name</label>
                    <Input
                      placeholder="e.g. Gut Oggau Theodora"
                      value={newPost.wine_name}
                      onChange={(e) => setNewPost(p => ({ ...p, wine_name: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Type</label>
                    <Select value={newPost.wine_type} onValueChange={(v) => setNewPost(p => ({ ...p, wine_type: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WINE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">City *</label>
                    <Input
                      placeholder="Auto-filled from venue or type manually"
                      value={newPost.city}
                      onChange={(e) => setNewPost(p => ({ ...p, city: e.target.value }))}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Venue (Google search)</label>
                    <Input
                      ref={venueInputRef}
                      placeholder="Search venue..."
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewPost(p => ({ ...p, rating: p.rating === star ? 0 : star }))}
                        className="p-1"
                      >
                        <Wine className={`w-5 h-5 ${newPost.rating >= star ? 'text-foreground fill-current' : 'text-muted-foreground/30'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleCreatePost} disabled={uploading || !selectedImage || !newPost.city} className="w-full h-10 gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {uploading ? 'Posting...' : 'Share'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* City filter */}
        <div className="mb-6 flex gap-1.5">
          <button
            onClick={() => setSelectedCity('all')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-colors whitespace-nowrap ${
              selectedCity === 'all' ? 'border-foreground bg-foreground text-background' : 'border-foreground/20 hover:border-foreground/50'
            }`}
          >
            All
          </button>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border border-foreground/10">
            <Wine className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              {selectedCity !== 'all' ? `No posts from ${selectedCity} yet.` : 'No posts yet.'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">Be the first to share what you're drinking.</p>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create Post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-foreground/10"
              >
                {/* Post image */}
                <div className="aspect-square overflow-hidden">
                  <img loading="lazy" src={post.image_url} alt={post.wine_name || 'Wine post'} className="w-full h-full object-cover" />
                </div>

                <div className="p-4">
                  {/* Actions */}
                  <div className="flex items-center gap-4 mb-3">
                    <button
                      onClick={() => handleLike(post.id, !!post.is_liked)}
                      className={`flex items-center gap-1 transition-colors ${post.is_liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                      {(post.like_count || 0) > 0 && <span className="text-xs">{post.like_count}</span>}
                    </button>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="w-5 h-5" />
                      {(post.comment_count || 0) > 0 && <span className="text-xs">{post.comment_count}</span>}
                    </div>
                  </div>

                  {/* Author + location */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{post.author_name}</span>
                      {post.is_following && (
                        <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Following</span>
                      )}
                      {userId && post.user_id !== userId && !post.is_following && (
                        <button
                          onClick={() => handleFollow(post.user_id, false)}
                          className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                          Follow
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {post.venue_name ? `${post.venue_name}, ${post.city}` : post.city}
                    </span>
                  </div>

                  {/* Wine info */}
                  {post.wine_name && (
                    <div className="flex items-center gap-2 mb-2">
                      <Wine className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{post.wine_name}</span>
                      {post.wine_type && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{post.wine_type}</Badge>
                      )}
                      {post.rating && (
                        <span className="text-[10px] font-medium text-muted-foreground">{post.rating}/100</span>
                      )}
                    </div>
                  )}

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-xs leading-relaxed">{post.caption}</p>
                  )}

                  {/* Timestamp */}
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPosts(posts.length, true)}
                  disabled={loadingMore}
                  className="text-xs tracking-wider"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </BrutalistLayout>
  );
}
