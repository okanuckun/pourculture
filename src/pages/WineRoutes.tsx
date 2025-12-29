import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { MapPin, Calendar, Heart, CheckCircle, Plus, Loader2, Star, BadgeCheck, Filter, X, ArrowUpDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type SortOption = 'newest' | 'oldest' | 'venues_high' | 'venues_low' | 'days_short' | 'days_long';

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
  created_at?: string;
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
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  // Sort function
  const sortRoutes = (routeList: WineRoute[]): WineRoute[] => {
    return [...routeList].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'venues_high':
          return b.venue_count - a.venue_count;
        case 'venues_low':
          return a.venue_count - b.venue_count;
        case 'days_short':
          return a.estimated_days - b.estimated_days;
        case 'days_long':
          return b.estimated_days - a.estimated_days;
        default:
          return 0;
      }
    });
  };

  // Extract unique countries, regions, and difficulties for filters
  const allRoutes = useMemo(() => [...curatedRoutes, ...routes], [curatedRoutes, routes]);
  
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(allRoutes.map(r => r.country))].sort();
    return uniqueCountries;
  }, [allRoutes]);

  const regions = useMemo(() => {
    const filteredRoutes = selectedCountry === 'all' 
      ? allRoutes 
      : allRoutes.filter(r => r.country === selectedCountry);
    const uniqueRegions = [...new Set(filteredRoutes.map(r => r.region))].sort();
    return uniqueRegions;
  }, [allRoutes, selectedCountry]);

  const difficulties = useMemo(() => {
    const uniqueDifficulties = [...new Set(allRoutes.map(r => r.difficulty))];
    return uniqueDifficulties;
  }, [allRoutes]);

  // Filter and sort routes based on selections
  const filteredCuratedRoutes = useMemo(() => {
    const filtered = curatedRoutes.filter(route => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          route.title.toLowerCase().includes(query) ||
          route.region.toLowerCase().includes(query) ||
          route.country.toLowerCase().includes(query) ||
          (route.description?.toLowerCase().includes(query) ?? false);
        if (!matchesSearch) return false;
      }
      if (selectedCountry !== 'all' && route.country !== selectedCountry) return false;
      if (selectedRegion !== 'all' && route.region !== selectedRegion) return false;
      if (selectedDifficulty !== 'all' && route.difficulty !== selectedDifficulty) return false;
      return true;
    });
    return sortRoutes(filtered);
  }, [curatedRoutes, selectedCountry, selectedRegion, selectedDifficulty, sortBy, searchQuery]);

  const filteredRoutes = useMemo(() => {
    const filtered = routes.filter(route => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          route.title.toLowerCase().includes(query) ||
          route.region.toLowerCase().includes(query) ||
          route.country.toLowerCase().includes(query) ||
          (route.description?.toLowerCase().includes(query) ?? false);
        if (!matchesSearch) return false;
      }
      if (selectedCountry !== 'all' && route.country !== selectedCountry) return false;
      if (selectedRegion !== 'all' && route.region !== selectedRegion) return false;
      if (selectedDifficulty !== 'all' && route.difficulty !== selectedDifficulty) return false;
      return true;
    });
    return sortRoutes(filtered);
  }, [routes, selectedCountry, selectedRegion, selectedDifficulty, sortBy, searchQuery]);

  const hasActiveFilters = selectedCountry !== 'all' || selectedRegion !== 'all' || selectedDifficulty !== 'all' || searchQuery !== '';

  const clearFilters = () => {
    setSelectedCountry('all');
    setSelectedRegion('all');
    setSelectedDifficulty('all');
    setSortBy('newest');
    setSearchQuery('');
  };

  // Reset region when country changes
  useEffect(() => {
    setSelectedRegion('all');
  }, [selectedCountry]);

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
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search routes by name, region, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm border-2 border-foreground/30 bg-background focus:border-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters and Create Route Button */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
            </div>
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[160px] h-9 text-xs border-2 border-foreground/30 bg-background">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-background border-2 border-foreground/30">
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[160px] h-9 text-xs border-2 border-foreground/30 bg-background">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="bg-background border-2 border-foreground/30">
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[140px] h-9 text-xs border-2 border-foreground/30 bg-background capitalize">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-background border-2 border-foreground/30">
                <SelectItem value="all">All Levels</SelectItem>
                {difficulties.map(diff => (
                  <SelectItem key={diff} value={diff} className="capitalize">{diff}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-foreground/20 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">Sort</span>
            </div>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[150px] h-9 text-xs border-2 border-foreground/30 bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-background border-2 border-foreground/30">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="venues_high">Most Venues</SelectItem>
                <SelectItem value="venues_low">Fewest Venues</SelectItem>
                <SelectItem value="days_short">Shortest Trip</SelectItem>
                <SelectItem value="days_long">Longest Trip</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}

            {/* Create Route Button - only for verified users */}
            {user && profile?.is_verified && (
              <button
                onClick={() => navigate('/wine-routes/create')}
                className="ml-auto flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Route
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-foreground" />
          </div>
        ) : (
          <>
            {/* Curated Routes Section */}
            {filteredCuratedRoutes.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-5 h-5 text-foreground" />
                  <h2 className="text-xl font-bold tracking-tight">CURATED ROUTES</h2>
                  <span className="text-xs text-muted-foreground">({filteredCuratedRoutes.length})</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                  Hand-picked wine journeys curated by sommeliers, winemakers, and wine enthusiasts.
                  Complete a route to earn a badge on your profile.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCuratedRoutes.map((route) => (
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
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold tracking-tight">ALL ROUTES</h2>
                <span className="text-xs text-muted-foreground">({filteredRoutes.length})</span>
              </div>
              {filteredRoutes.length === 0 && filteredCuratedRoutes.length === 0 ? (
                <div className="text-center py-16 border-2 border-foreground/30 bg-background">
                  <p className="text-muted-foreground text-sm mb-4">
                    {hasActiveFilters 
                      ? 'No routes match your filters' 
                      : 'No wine routes available yet'}
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  ) : user && (
                    <button
                      onClick={() => navigate('/wine-routes/create')}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create the first route
                    </button>
                  )}
                </div>
              ) : filteredRoutes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRoutes.map((route) => (
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
              ) : null}
            </section>
          </>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default WineRoutes;
