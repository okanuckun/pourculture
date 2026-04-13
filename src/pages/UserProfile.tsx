import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { MapPin, Link as LinkIcon, Instagram, Twitter, CheckCircle, Loader2, Wine, Store, Edit, ExternalLink, Plus, UserPlus, UserCheck } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  is_verified: boolean;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  instagram: string | null;
  twitter: string | null;
  created_at: string;
}

interface OwnedVenue {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  country: string;
  image_url: string | null;
}

interface OwnedWinemaker {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  country: string;
  image_url: string | null;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ownedVenues, setOwnedVenues] = useState<OwnedVenue[]>([]);
  const [ownedWinemakers, setOwnedWinemakers] = useState<OwnedWinemaker[]>([]);
  const [wineCount, setWineCount] = useState(0);
  const [favoriteWines, setFavoriteWines] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId, currentUser?.id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      let effectiveProfile = (profileData as Profile | null) ?? null;

      if (!effectiveProfile && currentUser?.id === userId) {
        const displayName =
          (currentUser.user_metadata as any)?.display_name ??
          currentUser.email?.split('@')?.[0] ?? null;

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({ user_id: userId, display_name: displayName })
          .select('*')
          .single();

        if (createError) throw createError;
        effectiveProfile = created as Profile;
      }

      if (!effectiveProfile) return;
      setProfile(effectiveProfile);

      // Wine count + favorites
      const { count } = await supabase
        .from('wine_scan_history')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId!);
      setWineCount(count ?? 0);

      const { data: favWines } = await supabase
        .from('wine_scan_history')
        .select('id, wine_name, winery, region, country, wine_type, vintage, rating, image_url, created_at')
        .eq('user_id', userId!)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false })
        .limit(12);
      setFavoriteWines(favWines || []);

      // Owned venues & winemakers (only for own profile)
      if (currentUser?.id === userId) {
        const { data: venuesData } = await supabase
          .from('venues')
          .select('id, name, slug, category, city, country, image_url')
          .eq('owner_id', userId);
        if (venuesData) setOwnedVenues(venuesData as OwnedVenue[]);

        const { data: winemakersData } = await supabase
          .from('winemakers')
          .select('id, name, slug, region, country, image_url')
          .eq('owner_id', userId);
        if (winemakersData) setOwnedWinemakers(winemakersData as OwnedWinemaker[]);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BrutalistLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-foreground" />
        </div>
      </BrutalistLayout>
    );
  }

  if (!profile) {
    return (
      <BrutalistLayout>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </BrutalistLayout>
    );
  }

  const isOwnProfile = currentUser?.id === profile.user_id;

  return (
    <BrutalistLayout>
      <SEOHead
        title={`${profile.display_name || 'User'} | PourCulture`}
        description={profile.bio || `View ${profile.display_name}'s profile on PourCulture`}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Profile Header */}
        <div className="border-2 border-foreground/30 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-muted flex-shrink-0 flex items-center justify-center border-2 border-foreground/20 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-muted-foreground">
                  {(profile.display_name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {profile.display_name || 'Anonymous'}
                </h1>
                {profile.is_verified && (
                  <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Verified</span>
                  </div>
                )}
              </div>

              {profile.bio && <p className="text-muted-foreground mb-4">{profile.bio}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /><span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <LinkIcon className="w-4 h-4" /><span>Website</span>
                  </a>
                )}
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Instagram className="w-4 h-4" /><span>@{profile.instagram}</span>
                  </a>
                )}
                {profile.twitter && (
                  <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Twitter className="w-4 h-4" /><span>@{profile.twitter}</span>
                  </a>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {isOwnProfile && (
                  <Link to="/profile/edit" className="inline-block px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground/30 hover:border-foreground transition-colors">
                    Edit Profile
                  </Link>
                )}
                {isOwnProfile && (
                  <Link to="/journal" className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground/30 hover:border-foreground transition-colors">
                    <Wine className="w-3.5 h-3.5" />
                    Journal ({wineCount})
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-foreground/30 p-4 text-center">
            <div className="text-2xl font-bold">{wineCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wines Scanned</div>
          </div>
          <div className="border-2 border-foreground/30 p-4 text-center">
            <div className="text-2xl font-bold">{new Date(profile.created_at).getFullYear()}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Member Since</div>
          </div>
        </div>

        {/* Owned Venues & Winemakers */}
        {isOwnProfile && (ownedVenues.length > 0 || ownedWinemakers.length > 0) && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5" />
              <h2 className="text-lg font-bold tracking-tight">MY BUSINESSES</h2>
            </div>

            {ownedVenues.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Venues ({ownedVenues.length})</h3>
                <div className="space-y-3">
                  {ownedVenues.map((venue, index) => (
                    <motion.div key={venue.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-2 border-foreground/20 hover:border-foreground transition-colors">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-16 h-16 border border-foreground/20 overflow-hidden flex-shrink-0">
                          {venue.image_url ? (
                            <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl bg-muted">🍷</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{venue.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">{venue.category.replace('_', ' ')}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {venue.city}, {venue.country}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/profile/venue/${venue.id}/edit`}>
                            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                              <Edit className="w-4 h-4 mr-1" /> EDIT
                            </Button>
                          </Link>
                          <Link to={`/venue/${venue.slug}`} target="_blank">
                            <Button size="sm" variant="outline" className="border-2 border-foreground/20 hover:border-foreground">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {ownedWinemakers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Winemakers ({ownedWinemakers.length})</h3>
                <div className="space-y-3">
                  {ownedWinemakers.map((winemaker, index) => (
                    <motion.div key={winemaker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-2 border-foreground/20 hover:border-foreground transition-colors">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-16 h-16 border border-foreground/20 overflow-hidden flex-shrink-0">
                          {winemaker.image_url ? (
                            <img src={winemaker.image_url} alt={winemaker.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl bg-muted">🍇</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{winemaker.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {winemaker.region && `${winemaker.region}, `}{winemaker.country}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/profile/winemaker/${winemaker.id}/edit`}>
                            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                              <Edit className="w-4 h-4 mr-1" /> EDIT
                            </Button>
                          </Link>
                          <Link to={`/winemaker/${winemaker.slug}`} target="_blank">
                            <Button size="sm" variant="outline" className="border-2 border-foreground/20 hover:border-foreground">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Favorite Wines */}
        {favoriteWines.length > 0 && (
          <section className="mb-8">
            <div className="border-2 border-foreground/30 p-6">
              <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">
                Favorite Wines ({favoriteWines.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {favoriteWines.map((wine) => (
                  <motion.div
                    key={wine.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-foreground/10 overflow-hidden"
                  >
                    {wine.image_url ? (
                      <div className="aspect-square bg-muted overflow-hidden">
                        <img loading="lazy" src={wine.image_url} alt={wine.wine_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted/30 flex items-center justify-center">
                        <Wine className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{wine.wine_name}</p>
                      {wine.winery && (
                        <p className="text-[10px] text-muted-foreground truncate">{wine.winery}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        {wine.wine_type && (
                          <span className="text-[8px] uppercase tracking-wider border border-foreground/20 px-1 py-0.5">{wine.wine_type}</span>
                        )}
                        {wine.vintage && (
                          <span className="text-[8px] text-muted-foreground">{wine.vintage}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty state for business owners */}
        {isOwnProfile && ownedVenues.length === 0 && ownedWinemakers.length === 0 && (
          <section className="mb-8">
            <div className="border-2 border-dashed border-foreground/20 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-foreground/20 flex items-center justify-center">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm mb-2">Own a business?</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                Claim your venue or register as a winemaker to start managing your profile.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/claim-venue">
                  <Button className="bg-foreground text-background hover:bg-foreground/90">
                    <Plus className="w-4 h-4 mr-2" /> CLAIM VENUE
                  </Button>
                </Link>
                <Link to="/submit/winemaker">
                  <Button variant="outline" className="border-2 border-foreground hover:bg-foreground hover:text-background">
                    <Wine className="w-4 h-4 mr-2" /> REGISTER WINEMAKER
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default UserProfile;
