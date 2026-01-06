import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { MapPin, Link as LinkIcon, Instagram, Twitter, CheckCircle, Calendar, Trophy, Loader2, Award, Star, Wine, Grape } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';
import { WineDetailModal } from '@/components/WineDetailModal';

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

interface CompletedRoute {
  id: string;
  route_id: string;
  completed_at: string;
  route: {
    title: string;
    slug: string;
    region: string;
    country: string;
    is_curated: boolean;
  };
}

interface CreatedRoute {
  id: string;
  title: string;
  slug: string;
  region: string;
  country: string;
  is_curated: boolean;
  venue_count: number;
}

interface FavoriteWine {
  id: string;
  wine_name: string;
  winery: string | null;
  region: string | null;
  country: string | null;
  grape_variety: string | null;
  wine_type: string | null;
  vintage: string | null;
  image_url: string | null;
  quick_summary: string | null;
  detailed_description: string | null;
  serving_temperature: string | null;
  aging_potential: string | null;
  food_pairing: string[] | null;
  rating: number | null;
  tasting_notes: {
    aroma?: string[];
    palate?: string[];
    finish?: string;
  } | null;
  created_at: string;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completedRoutes, setCompletedRoutes] = useState<CompletedRoute[]>([]);
  const [createdRoutes, setCreatedRoutes] = useState<CreatedRoute[]>([]);
  const [favoriteWines, setFavoriteWines] = useState<FavoriteWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWine, setSelectedWine] = useState<FavoriteWine | null>(null);
  const [wineModalOpen, setWineModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData as Profile);

      // Fetch completed routes
      const { data: progressData } = await supabase
        .from('user_route_progress')
        .select(`
          id,
          route_id,
          completed_at,
          wine_routes (
            title,
            slug,
            region,
            country,
            is_curated
          )
        `)
        .eq('user_id', userId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });

      if (progressData) {
        const completed = progressData
          .filter((p: any) => p.wine_routes)
          .map((p: any) => ({
            id: p.id,
            route_id: p.route_id,
            completed_at: p.completed_at,
            route: p.wine_routes,
          }));
        setCompletedRoutes(completed);
      }

      // Fetch created routes (if verified)
      if (profileData.is_verified) {
        const { data: routesData } = await supabase
          .from('wine_routes')
          .select('id, title, slug, region, country, is_curated, venue_count')
          .eq('created_by', userId)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (routesData) {
          setCreatedRoutes(routesData as CreatedRoute[]);
        }
      }

      // Fetch favorite wines (only for own profile)
      if (currentUser?.id === userId) {
        const { data: winesData } = await supabase
          .from('wine_scan_history')
          .select('id, wine_name, winery, region, country, grape_variety, wine_type, vintage, image_url, quick_summary, detailed_description, serving_temperature, aging_potential, food_pairing, rating, tasting_notes, created_at')
          .eq('user_id', userId)
          .eq('is_favorite', true)
          .order('created_at', { ascending: false })
          .limit(12);

        if (winesData) {
          setFavoriteWines(winesData as FavoriteWine[]);
        }
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
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-muted flex-shrink-0 flex items-center justify-center border-2 border-foreground/20 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-muted-foreground">
                  {(profile.display_name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
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

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>@{profile.instagram}</span>
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>@{profile.twitter}</span>
                  </a>
                )}
              </div>

              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="inline-block mt-4 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground/30 hover:border-foreground transition-colors"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="border-2 border-foreground/30 p-4 text-center">
            <div className="text-2xl font-bold">{completedRoutes.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Routes Completed</div>
          </div>
          {profile.is_verified && (
            <div className="border-2 border-foreground/30 p-4 text-center">
              <div className="text-2xl font-bold">{createdRoutes.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Routes Created</div>
            </div>
          )}
          <div className="border-2 border-foreground/30 p-4 text-center">
            <div className="text-2xl font-bold">
              {new Date(profile.created_at).getFullYear()}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Member Since</div>
          </div>
        </div>

        {/* Completed Routes Badges */}
        {completedRoutes.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold tracking-tight">COMPLETED ROUTES</h2>
              <span className="text-sm text-muted-foreground">({completedRoutes.length} badges earned)</span>
            </div>
            
            {/* Badge Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {completedRoutes.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                >
                  <Link
                    to={`/wine-routes/${item.route.slug}`}
                    className="group block text-center"
                  >
                    {/* Badge Circle */}
                    <div className={`relative w-20 h-20 mx-auto mb-2 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                      item.route.is_curated 
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                        : 'bg-gradient-to-br from-green-400 to-green-600'
                    }`}>
                      <Award className="w-10 h-10 text-white" />
                      {item.route.is_curated && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Star className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Badge Info */}
                    <h3 className="font-bold text-sm leading-tight group-hover:underline line-clamp-2">
                      {item.route.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {item.route.region}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Favorite Wines (only visible on own profile) */}
        {isOwnProfile && favoriteWines.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Wine className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold tracking-tight">FAVORİ ŞARAPLARIM</h2>
              <span className="text-sm text-muted-foreground">({favoriteWines.length} şarap)</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favoriteWines.map((wine, index) => (
                <motion.div
                  key={wine.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-2 border-foreground/20 hover:border-foreground/40 p-3 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedWine(wine);
                    setWineModalOpen(true);
                  }}
                >
                  {wine.image_url ? (
                    <div className="aspect-square mb-2 bg-muted overflow-hidden">
                      <img 
                        src={wine.image_url} 
                        alt={wine.wine_name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square mb-2 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30 flex items-center justify-center">
                      <Wine className="w-8 h-8 text-rose-400" />
                    </div>
                  )}
                  <h3 className="font-bold text-sm leading-tight line-clamp-2">{wine.wine_name}</h3>
                  {wine.winery && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{wine.winery}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {wine.grape_variety && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
                        <Grape className="w-3 h-3" />
                        {wine.grape_variety}
                      </span>
                    )}
                  </div>
                  {wine.region && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {wine.region}{wine.country ? `, ${wine.country}` : ''}
                    </p>
                  )}
                  {wine.vintage && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-muted text-[9px] font-medium">
                      {wine.vintage}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Wine Detail Modal */}
            <WineDetailModal
              wine={selectedWine}
              open={wineModalOpen}
              onOpenChange={setWineModalOpen}
            />
          </section>
        )}

        {/* Created Routes (for verified users) */}
        {profile.is_verified && createdRoutes.length > 0 && (
          <section>
            <h2 className="text-lg font-bold tracking-tight mb-4">CREATED ROUTES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {createdRoutes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/wine-routes/${route.slug}`}
                    className="block border-2 border-foreground/30 hover:border-foreground p-4 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {route.is_curated && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">Curated</span>
                      )}
                    </div>
                    <h3 className="font-bold hover:underline">{route.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {route.region}, {route.country} • {route.venue_count} venues
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default UserProfile;
