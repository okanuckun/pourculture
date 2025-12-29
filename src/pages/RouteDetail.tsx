import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { MapPin, Calendar, Heart, CheckCircle, Check, Star, ArrowLeft, Loader2, Edit } from 'lucide-react';
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
  venue_ids: string[];
  venue_count: number;
  difficulty: string;
  estimated_days: number;
  is_curated: boolean;
  curator_id: string | null;
  curator_name: string | null;
  curator_title: string | null;
  slug: string;
  created_by: string | null;
}

interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  slug: string;
  image_url: string | null;
}

interface UserProgress {
  id: string;
  visited_venue_ids: string[];
  is_completed: boolean;
  completed_at: string | null;
}

const RouteDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<WineRoute | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (slug) {
      fetchRoute();
    }
  }, [slug]);

  useEffect(() => {
    if (user && route) {
      fetchUserData();
    }
  }, [user, route]);

  const fetchRoute = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wine_routes')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/wine-routes');
        return;
      }

      setRoute(data as WineRoute);

      // Fetch venues if there are any
      if (data.venue_ids && data.venue_ids.length > 0) {
        const { data: venueData } = await supabase
          .from('venues')
          .select('id, name, city, country, category, slug, image_url')
          .in('id', data.venue_ids);

        if (venueData) {
          setVenues(venueData as Venue[]);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching route:', error);
      toast.error('Failed to load route');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!user || !route) return;

    try {
      const [progressRes, wishlistRes] = await Promise.all([
        supabase
          .from('user_route_progress')
          .select('id, visited_venue_ids, is_completed, completed_at')
          .eq('user_id', user.id)
          .eq('route_id', route.id)
          .maybeSingle(),
        supabase
          .from('user_route_wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('route_id', route.id)
          .maybeSingle(),
      ]);

      if (progressRes.data) setProgress(progressRes.data as UserProgress);
      setIsInWishlist(!!wishlistRes.data);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching user data:', error);
    }
  };

  const toggleVenueVisit = async (venueId: string) => {
    if (!user || !route) {
      toast.error('Sign in to track your progress');
      return;
    }

    const currentVisited = progress?.visited_venue_ids || [];
    const isVisited = currentVisited.includes(venueId);
    let newVisited: string[];

    if (isVisited) {
      newVisited = currentVisited.filter((id) => id !== venueId);
    } else {
      newVisited = [...currentVisited, venueId];
    }

    const isNowCompleted = newVisited.length >= route.venue_count;

    try {
      if (progress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_route_progress')
          .update({
            visited_venue_ids: newVisited,
            is_completed: isNowCompleted,
            completed_at: isNowCompleted ? new Date().toISOString() : null,
          })
          .eq('id', progress.id);

        if (error) throw error;
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('user_route_progress')
          .insert({
            user_id: user.id,
            route_id: route.id,
            visited_venue_ids: newVisited,
            is_completed: isNowCompleted,
            completed_at: isNowCompleted ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        setProgress(data as UserProgress);
        return;
      }

      setProgress((prev) =>
        prev
          ? {
              ...prev,
              visited_venue_ids: newVisited,
              is_completed: isNowCompleted,
              completed_at: isNowCompleted ? new Date().toISOString() : null,
            }
          : null
      );

      if (isNowCompleted && !progress?.is_completed) {
        toast.success('Congratulations! You completed this route!');
      } else {
        toast.success(isVisited ? 'Venue unmarked' : 'Venue marked as visited');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const toggleWishlist = async () => {
    if (!user || !route) {
      toast.error('Sign in to add to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await supabase
          .from('user_route_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('route_id', route.id);

        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await supabase.from('user_route_wishlist').insert({
          user_id: user.id,
          route_id: route.id,
        });

        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
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

  if (!route) {
    return (
      <BrutalistLayout>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 text-center">
          <p className="text-muted-foreground">Route not found</p>
          <Link to="/wine-routes" className="text-sm underline mt-4 inline-block">
            Back to Wine Routes
          </Link>
        </div>
      </BrutalistLayout>
    );
  }

  const visitedCount = progress?.visited_venue_ids?.length || 0;
  const progressPercent = route.venue_count > 0 ? Math.round((visitedCount / route.venue_count) * 100) : 0;

  return (
    <BrutalistLayout>
      <SEOHead
        title={`${route.title} | Wine Routes | PourCulture`}
        description={route.description || `Explore the ${route.title} wine route in ${route.region}, ${route.country}`}
      />

      {/* Hero Image */}
      <div
        className="h-64 md:h-80 bg-muted bg-cover bg-center relative"
        style={{
          backgroundImage: route.image_url
            ? `url(${route.image_url})`
            : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground)/0.2) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Link
              to="/wine-routes"
              className="inline-flex items-center gap-2 text-[10px] tracking-wider text-foreground/80 hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-3 h-3" />
              WINE ROUTES
            </Link>
            <div className="flex items-center gap-3 mb-2">
              {route.is_curated && (
                <span className="inline-flex items-center gap-1 bg-foreground text-background px-2 py-1 text-[9px] font-bold uppercase tracking-wider">
                  <Star className="w-3 h-3" />
                  Curated
                </span>
              )}
              {progress?.is_completed && (
                <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {route.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Route Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{route.region}, {route.country}</span>
              </div>
              <span>{route.venue_count} venues</span>
              <span>~{route.estimated_days} days</span>
              <span className="capitalize">{route.difficulty}</span>
            </div>

            {route.description && (
              <p className="text-muted-foreground mb-8">{route.description}</p>
            )}

            {route.curator_name && (
              <div className="border-2 border-foreground/20 p-4 mb-8">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Curated by</p>
                <p className="font-medium">{route.curator_name}</p>
                {route.curator_title && (
                  <p className="text-sm text-muted-foreground">{route.curator_title}</p>
                )}
              </div>
            )}

            {/* Venues List */}
            <h2 className="text-xl font-bold tracking-tight mb-4">VENUES ON THIS ROUTE</h2>
            {venues.length === 0 ? (
              <div className="border-2 border-foreground/30 p-8 text-center">
                <p className="text-muted-foreground text-sm">No venues added to this route yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.map((venue, index) => {
                  const isVisited = progress?.visited_venue_ids?.includes(venue.id);
                  return (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-2 transition-colors ${
                        isVisited
                          ? 'border-green-500 bg-green-500/5'
                          : 'border-foreground/30 hover:border-foreground'
                      }`}
                    >
                      <div className="flex items-stretch">
                        <div className="w-24 md:w-32 flex-shrink-0">
                          <div
                            className="h-full min-h-[80px] bg-muted bg-cover bg-center"
                            style={{
                              backgroundImage: venue.image_url
                                ? `url(${venue.image_url})`
                                : 'none',
                            }}
                          />
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {index + 1}. {venue.category.replace('_', ' ')}
                              </span>
                              {isVisited && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <Link
                              to={`/venue/${venue.slug}`}
                              className="font-bold hover:underline"
                            >
                              {venue.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {venue.city}, {venue.country}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleVenueVisit(venue.id)}
                            className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-2 transition-colors ${
                              isVisited
                                ? 'border-green-500 bg-green-500 text-white hover:bg-transparent hover:text-green-500'
                                : 'border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            {isVisited ? 'Visited' : 'Mark Visited'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Progress Card */}
              {user && (
                <div className="border-2 border-foreground/30 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Your Progress</h3>
                  <div className="text-3xl font-bold mb-2">{progressPercent}%</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        progress?.is_completed ? 'bg-green-500' : 'bg-foreground'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {visitedCount} of {route.venue_count} venues visited
                  </p>
                  {progress?.is_completed && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-center">
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-600">Route Completed!</p>
                      <p className="text-[10px] text-muted-foreground">Badge earned</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-2 border-foreground/30 p-4 space-y-3">
                <button
                  onClick={toggleWishlist}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-2 transition-colors ${
                    isInWishlist
                      ? 'border-red-500 bg-red-500 text-white hover:bg-transparent hover:text-red-500'
                      : 'border-foreground hover:bg-foreground hover:text-background'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>

                {/* Edit Button - only for route owner */}
                {user && route.created_by === user.id && (
                  <Link
                    to={`/wine-routes/${route.slug}/edit`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Route
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrutalistLayout>
  );
};

export default RouteDetail;
