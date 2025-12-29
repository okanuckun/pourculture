import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { MapPin, Link as LinkIcon, Instagram, Twitter, CheckCircle, Calendar, Trophy, Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';

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

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completedRoutes, setCompletedRoutes] = useState<CompletedRoute[]>([]);
  const [createdRoutes, setCreatedRoutes] = useState<CreatedRoute[]>([]);
  const [loading, setLoading] = useState(true);

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

        {/* Completed Routes */}
        {completedRoutes.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-foreground" />
              <h2 className="text-lg font-bold tracking-tight">COMPLETED ROUTES</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedRoutes.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/wine-routes/${item.route.slug}`}
                    className="block border-2 border-green-500/50 hover:border-green-500 p-4 transition-colors bg-green-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {item.route.is_curated && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">Curated</span>
                          )}
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="font-bold hover:underline">{item.route.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.route.region}, {item.route.country}
                        </p>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(item.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
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
