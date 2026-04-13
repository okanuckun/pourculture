import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Eye, MapPin, Star, Image as ImageIcon, X, Store, User, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PostComments } from '@/components/PostComments';

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  wine_name: string | null;
  winery: string | null;
  vintage: string | null;
  wine_type: string | null;
  rating: number | null;
  caption: string | null;
  city: string;
  country: string;
  venue_name: string | null;
  venue_id: string | null;
  post_type: string;
  view_count: number;
  created_at: string;
  posted_as_venue_id: string | null;
  // joined
  author_name?: string;
  author_avatar?: string;
  is_verified?: boolean;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;
  posted_as_venue_name?: string;
}

interface OwnedVenue {
  id: string;
  name: string;
  city: string;
  country: string;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // create post form
  const [wineName, setWineName] = useState('');
  const [winery, setWinery] = useState('');
  const [vintage, setVintage] = useState('');
  const [wineType, setWineType] = useState('');
  const [rating, setRating] = useState('');
  const [caption, setCaption] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [venueName, setVenueName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Post as venue
  const [ownedVenues, setOwnedVenues] = useState<OwnedVenue[]>([]);
  const [postAsVenueId, setPostAsVenueId] = useState<string | null>(null);

  // Venue search
  const [venueSearch, setVenueSearch] = useState('');
  const [venueResults, setVenueResults] = useState<{ id: string; name: string; city: string; country: string }[]>([]);
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  const venueSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchVenues = async (query: string) => {
    if (query.length < 2) { setVenueResults([]); setShowVenueDropdown(false); return; }
    const { data } = await supabase
      .from('venues')
      .select('id, name, city, country')
      .ilike('name', `%${query}%`)
      .limit(5);
    setVenueResults(data || []);
    setShowVenueDropdown((data || []).length > 0);
  };

  const handleVenueSearchChange = (val: string) => {
    setVenueSearch(val);
    setVenueName(val);
    if (venueSearchTimeout.current) clearTimeout(venueSearchTimeout.current);
    venueSearchTimeout.current = setTimeout(() => searchVenues(val), 300);
  };

  const selectSearchedVenue = (v: { id: string; name: string; city: string; country: string }) => {
    setVenueName(v.name);
    setVenueSearch(v.name);
    setCity(v.city);
    setCountry(v.country);
    setShowVenueDropdown(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || null;
      setUserId(uid);
      if (uid) loadOwnedVenues(uid);
    });
    loadPosts();
  }, []);

  const loadOwnedVenues = async (uid: string) => {
    const { data } = await supabase
      .from('venues')
      .select('id, name, city, country')
      .eq('owner_id', uid)
      .eq('is_claimed', true);
    setOwnedVenues(data || []);
  };

  const loadPosts = async () => {
    setLoading(true);
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Gather user IDs + venue IDs
    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const venueIds = [...new Set(postsData.filter(p => p.posted_as_venue_id).map(p => p.posted_as_venue_id!))];
    const postIds = postsData.map(p => p.id);

    const [profilesRes, likesRes, commentsRes, myLikesRes, venuesRes] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name, avatar_url, is_verified').in('user_id', userIds),
      supabase.from('post_likes').select('post_id').in('post_id', postIds),
      supabase.from('post_comments').select('post_id').in('post_id', postIds),
      userId
        ? supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', postIds)
        : Promise.resolve({ data: [] }),
      venueIds.length > 0
        ? supabase.from('venues').select('id, name').in('id', venueIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map<string, any>();
    (profilesRes.data || []).forEach(p => profileMap.set(p.user_id, p));

    const venueMap = new Map<string, string>();
    (venuesRes.data || []).forEach((v: any) => venueMap.set(v.id, v.name));

    const likeCounts = new Map<string, number>();
    (likesRes.data || []).forEach((l: any) => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1));

    const commentCounts = new Map<string, number>();
    (commentsRes.data || []).forEach((c: any) => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1));

    const myLikedPosts = new Set((myLikesRes.data || []).map((l: any) => l.post_id));

    const enriched: Post[] = postsData.map(p => {
      const profile = profileMap.get(p.user_id);
      return {
        ...p,
        author_name: profile?.display_name || 'Anonymous',
        author_avatar: profile?.avatar_url,
        is_verified: profile?.is_verified || false,
        like_count: likeCounts.get(p.id) || 0,
        comment_count: commentCounts.get(p.id) || 0,
        liked_by_me: myLikedPosts.has(p.id),
        posted_as_venue_name: p.posted_as_venue_id ? venueMap.get(p.posted_as_venue_id) : undefined,
      };
    });

    setPosts(enriched);
    setLoading(false);
  };



  const selectVenueForPost = (venue: OwnedVenue | null) => {
    if (venue) {
      setPostAsVenueId(venue.id);
      setVenueName(venue.name);
      setCity(venue.city);
      setCountry(venue.country);
    } else {
      setPostAsVenueId(null);
      setVenueName('');
      setCity('');
      setCountry('');
    }
  };

  const handleCreatePost = async () => {
    if (!userId) return;
    if (!imageFile) { toast.error('Fotoğraf ekleyin'); return; }
    if (!city.trim() || !country.trim()) { toast.error('Şehir ve ülke gerekli'); return; }

    setCreating(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('post-images').upload(path, imageFile);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path);
      const image_url = urlData.publicUrl;

      const { error: insertErr } = await supabase.from('posts').insert({
        user_id: userId,
        image_url,
        wine_name: wineName.trim() || null,
        winery: winery.trim() || null,
        vintage: vintage.trim() || null,
        wine_type: wineType.trim() || null,
        rating: rating ? parseInt(rating) : null,
        caption: caption.trim() || null,
        city: city.trim(),
        country: country.trim(),
        venue_name: venueName.trim() || null,
        posted_as_venue_id: postAsVenueId,
      } as any);

      if (insertErr) throw insertErr;

      toast.success('Post paylaşıldı!');
      setDialogOpen(false);
      resetForm();
      loadPosts();
    } catch (err: any) {
      toast.error(err.message || 'Hata oluştu');
    }
    setCreating(false);
  };

  const resetForm = () => {
    setWineName(''); setWinery(''); setVintage(''); setWineType('');
    setRating(''); setCaption(''); setCity(''); setCountry('');
    setVenueName(''); setImageFile(null); setImagePreview(null);
    setPostAsVenueId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-lg font-bold tracking-tight">Feed</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> Paylaş
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Post</DialogTitle>
              </DialogHeader>

              {/* Post As selector */}
              {ownedVenues.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Olarak paylaş</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => selectVenueForPost(null)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        !postAsVenueId
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      <User className="w-3 h-3" /> Kendim
                    </button>
                    {ownedVenues.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => selectVenueForPost(v)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          postAsVenueId === v.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        <Store className="w-3 h-3" /> {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image upload */}
              <div className="space-y-2">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Fotoğraf seç</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Wine info */}
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Şarap adı" value={wineName} onChange={e => setWineName(e.target.value)} className="text-sm" />
                <Input placeholder="Üretici" value={winery} onChange={e => setWinery(e.target.value)} className="text-sm" />
                <Input placeholder="Yıl" value={vintage} onChange={e => setVintage(e.target.value)} className="text-sm" />
                <Input placeholder="Tür (Red, White...)" value={wineType} onChange={e => setWineType(e.target.value)} className="text-sm" />
                <Input placeholder="Puan (0-100)" type="number" value={rating} onChange={e => setRating(e.target.value)} className="text-sm" />
                <Input placeholder="Mekan adı" value={venueName} onChange={e => setVenueName(e.target.value)} className="text-sm" disabled={!!postAsVenueId} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Şehir *" value={city} onChange={e => setCity(e.target.value)} className="text-sm" disabled={!!postAsVenueId} />
                <Input placeholder="Ülke *" value={country} onChange={e => setCountry(e.target.value)} className="text-sm" disabled={!!postAsVenueId} />
              </div>

              <Textarea placeholder="Notlar..." value={caption} onChange={e => setCaption(e.target.value)} className="text-sm" rows={2} />

              <Button onClick={handleCreatePost} disabled={creating} className="w-full">
                {creating ? 'Paylaşılıyor...' : 'Paylaş'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">Henüz post yok</p>
            <p className="text-xs mt-1">İlk postu sen paylaş!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="border-b border-border">
              {/* Post header */}
              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">
                      {(post.posted_as_venue_name || post.author_name || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold truncate">
                      {post.posted_as_venue_name || post.author_name}
                    </span>
                    {post.is_verified && !post.posted_as_venue_name && (
                      <span className="text-[10px] text-primary">🍷 PRO</span>
                    )}
                    {post.posted_as_venue_name && (
                      <Store className="w-3 h-3 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{post.city}, {post.country}</span>
                    {post.venue_name && <span>· {post.venue_name}</span>}
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="aspect-square bg-muted">
                <img src={post.image_url} alt={post.wine_name || ''} className="w-full h-full object-cover" loading="lazy" />
              </div>

              {/* Actions */}
              <div className="px-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">{post.view_count}</span>
                  </div>
                  <button onClick={() => {
                    const el = document.getElementById(`comments-${post.id}`);
                    if (el) el.click();
                  }} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{post.comment_count || 0}</span>
                  </button>
                  {post.rating && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold">{post.rating}/100</span>
                    </div>
                  )}
                </div>

                {/* Wine info */}
                {post.wine_name && (
                  <p className="text-sm font-semibold mt-1.5">{post.wine_name}</p>
                )}
                {(post.winery || post.vintage || post.wine_type) && (
                  <p className="text-xs text-muted-foreground">
                    {[post.winery, post.vintage, post.wine_type].filter(Boolean).join(' · ')}
                  </p>
                )}
                {post.caption && (
                  <p className="text-xs mt-1">
                    <span className="font-semibold mr-1">{post.posted_as_venue_name || post.author_name}</span>
                    {post.caption}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Comments */}
              <PostComments
                postId={post.id}
                userId={userId}
                commentCount={post.comment_count || 0}
                onCommentCountChange={(pid, delta) => {
                  setPosts(prev => prev.map(p =>
                    p.id === pid ? { ...p, comment_count: (p.comment_count || 0) + delta } : p
                  ));
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}