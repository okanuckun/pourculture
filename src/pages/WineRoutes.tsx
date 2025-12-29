import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { MapPin, Calendar, Heart, CheckCircle, Plus, Loader2, Star, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';

interface WineRoute {
  id: string;
  title: string;
  description: string | null;
  region: string;
  country: string;
  image_url: string | null;
  venue_count: number;
  difficulty: string;
  estimated_days: number;
  is_curated: boolean;
  curator_name: string | null;
  curator_title: string | null;
  curator_user_id: string | null;
  slug: string;
}

interface UserProgress {
  route_id: string;
  visited_venue_ids: string[];
  is_completed: boolean;
}

interface UserWishlist {
  route_id: string;
}

interface UserProfile {
  is_verified: boolean;
}

const RouteCard = ({
  route,
  isInWishlist,
  progress,
  onToggleWishlist,
  user,
}: {
  route: WineRoute;
  isInWishlist: boolean;
  progress?: UserProgress;
  onToggleWishlist: (routeId: string) => void;
  user: User | null;
}) => {
  const navigate = useNavigate();
  const visitedCount = progress?.visited_venue_ids?.length || 0;
  const progressPercent = route.venue_count > 0 ? Math.round((visitedCount / route.venue_count) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group border-2 border-foreground/30 hover:border-foreground transition-colors bg-background"
    >
      <div
        className="cursor-pointer"
        onClick={() => navigate(`/wine-routes/${route.slug}`)}
      >
        <div className="relative overflow-hidden">
          <div
            className="aspect-[16/9] bg-muted bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
            style={{
              backgroundImage: route.image_url
                ? `url(${route.image_url})`
                : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground)/0.2) 100%)',
            }}
          />
          {route.is_curated && (
            <div className="absolute top-3 left-3 bg-foreground text-background px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Curated</span>
            </div>
          )}
          {progress?.is_completed && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Completed</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            <span>{route.region}, {route.country}</span>
          </div>
          <h3 className="font-bold text-lg tracking-tight mb-1 group-hover:underline">
            {route.title}
          </h3>
          {route.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {route.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3">
            <span>{route.venue_count} venues</span>
            <span>~{route.estimated_days} days</span>
            <span className="capitalize">{route.difficulty}</span>
          </div>

          {user && visitedCount > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {route.curator_name && (
            <div className="border-t border-foreground/10 pt-3">
              <p className="text-[10px] text-muted-foreground">
                Curated by{' '}
                {route.curator_user_id ? (
                  <Link
                    to={`/profile/${route.curator_user_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-foreground font-medium hover:underline inline-flex items-center gap-1"
                  >
                    {route.curator_name}
                    <BadgeCheck className="w-3 h-3 text-primary" />
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{route.curator_name}</span>
                )}
                {route.curator_title && `, ${route.curator_title}`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-foreground/30 p-3 flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              toast.error('Sign in to add to wishlist');
              return;
            }
            onToggleWishlist(route.id);
          }}
          className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${
            isInWishlist
              ? 'text-red-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
          {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </button>
      </div>
    </motion.div>
  );
};

const WineRoutes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [routes, setRoutes] = useState<WineRoute[]>([]);
  const [curatedRoutes, setCuratedRoutes] = useState<WineRoute[]>([]);
  const [wishlist, setWishlist] = useState<UserWishlist[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setProfile(data as UserProfile);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching profile:', error);
    }
  };

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wine_routes')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allRoutes = (data || []) as WineRoute[];
      setCuratedRoutes(allRoutes.filter((r) => r.is_curated));
      setRoutes(allRoutes.filter((r) => !r.is_curated));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const [wishlistRes, progressRes] = await Promise.all([
        supabase.from('user_route_wishlist').select('route_id').eq('user_id', user.id),
        supabase.from('user_route_progress').select('route_id, visited_venue_ids, is_completed').eq('user_id', user.id),
      ]);

      if (wishlistRes.data) setWishlist(wishlistRes.data);
      if (progressRes.data) setProgress(progressRes.data as UserProgress[]);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching user data:', error);
    }
  };

  const toggleWishlist = async (routeId: string) => {
    if (!user) return;

    const isInWishlist = wishlist.some((w) => w.route_id === routeId);

    try {
      if (isInWishlist) {
        await supabase
          .from('user_route_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('route_id', routeId);

        setWishlist((prev) => prev.filter((w) => w.route_id !== routeId));
        toast.success('Removed from wishlist');
      } else {
        await supabase.from('user_route_wishlist').insert({
          user_id: user.id,
          route_id: routeId,
        });

        setWishlist((prev) => [...prev, { route_id: routeId }]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <BrutalistLayout
      title="WINE ROUTES"
      subtitle="Explore curated wine journeys around the world"
    >
      <SEOHead
        title="Wine Routes | PourCulture"
        description="Discover curated wine routes and journeys through the world's best natural wine regions"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Create Route Button - only for verified users */}
        {user && profile?.is_verified && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => navigate('/wine-routes/create')}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Route
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-foreground" />
          </div>
        ) : (
          <>
            {/* Curated Routes Section */}
            {curatedRoutes.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-5 h-5 text-foreground" />
                  <h2 className="text-xl font-bold tracking-tight">CURATED ROUTES</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                  Hand-picked wine journeys curated by sommeliers, winemakers, and wine enthusiasts.
                  Complete a route to earn a badge on your profile.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {curatedRoutes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isInWishlist={wishlist.some((w) => w.route_id === route.id)}
                      progress={progress.find((p) => p.route_id === route.id)}
                      onToggleWishlist={toggleWishlist}
                      user={user}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Routes Section */}
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-6">ALL ROUTES</h2>
              {routes.length === 0 && curatedRoutes.length === 0 ? (
                <div className="text-center py-16 border-2 border-foreground/30 bg-background">
                  <p className="text-muted-foreground text-sm mb-4">
                    No wine routes available yet
                  </p>
                  {user && (
                    <button
                      onClick={() => navigate('/wine-routes/create')}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create the first route
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {routes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isInWishlist={wishlist.some((w) => w.route_id === route.id)}
                      progress={progress.find((p) => p.route_id === route.id)}
                      onToggleWishlist={toggleWishlist}
                      user={user}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default WineRoutes;
