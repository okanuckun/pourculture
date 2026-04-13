import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Trophy, Loader2, Award, Star, Wine, Grape, Camera, Heart, StickyNote } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';
import { WineDetailModal } from '@/components/WineDetailModal';

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
  is_favorite: boolean;
  user_notes: string | null;
  tasting_notes: {
    aroma?: string[];
    palate?: string[];
    finish?: string;
  } | null;
  created_at: string;
}

const Journal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [completedRoutes, setCompletedRoutes] = useState<CompletedRoute[]>([]);
  const [wines, setWines] = useState<FavoriteWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWine, setSelectedWine] = useState<FavoriteWine | null>(null);
  const [wineModalOpen, setWineModalOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchJournalData();
    } else if (user === null && !loading) {
      navigate('/auth');
    }
  }, [user]);

  const fetchJournalData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch completed routes
      const { data: progressData } = await supabase
        .from('user_route_progress')
        .select(`
          id, route_id, completed_at,
          wine_routes (title, slug, region, country, is_curated)
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });

      if (progressData) {
        setCompletedRoutes(
          progressData
            .filter((p: any) => p.wine_routes)
            .map((p: any) => ({
              id: p.id,
              route_id: p.route_id,
              completed_at: p.completed_at,
              route: p.wine_routes,
            }))
        );
      }

      // Fetch scanned wines
      const { data: winesData } = await supabase
        .from('wine_scan_history')
        .select('id, wine_name, winery, region, country, grape_variety, wine_type, vintage, image_url, quick_summary, detailed_description, serving_temperature, aging_potential, food_pairing, rating, tasting_notes, is_favorite, user_notes, created_at')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (winesData) {
        setWines(winesData as FavoriteWine[]);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching journal:', error);
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

  return (
    <BrutalistLayout>
      <SEOHead title="My Wine Journal | PourCulture" description="Track your wine discoveries, tasting notes and completed routes." />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">MY WINE JOURNAL</h1>
        <p className="text-sm text-muted-foreground mb-6">Your scanned wines, tasting notes & completed routes.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-foreground/30 p-4 text-center">
            <div className="text-2xl font-bold">{wines.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wines Scanned</div>
          </div>
          <div className="border-2 border-foreground/30 p-4 text-center">
            <div className="text-2xl font-bold">{completedRoutes.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Routes Done</div>
          </div>
        </div>

        {/* Completed Routes Badges */}
        {completedRoutes.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold tracking-tight">COMPLETED ROUTES</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {completedRoutes.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                >
                  <Link to={`/wine-routes/${item.route.slug}`} className="group block text-center">
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
                    <h3 className="font-bold text-sm leading-tight group-hover:underline line-clamp-2">{item.route.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">{item.route.region}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Wines */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Wine className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold tracking-tight">SCANNED WINES</h2>
            {wines.length > 0 && (
              <span className="text-sm text-muted-foreground">({wines.length})</span>
            )}
          </div>

          {wines.length === 0 ? (
            <div className="border-2 border-dashed border-foreground/20 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30 rounded-full flex items-center justify-center">
                <Wine className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="font-bold text-sm mb-2">No scanned wines yet</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                Use the Wine Scanner to scan wine labels and build your journal.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium">
                <Camera className="w-4 h-4" />
                Use the Wine Scanner button
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {wines.map((wine, index) => (
                <motion.div
                  key={wine.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 ${wine.is_favorite ? 'border-rose-500/40' : 'border-foreground/20'} hover:border-foreground/40 p-3 transition-colors cursor-pointer relative`}
                  onClick={() => {
                    setSelectedWine(wine);
                    setWineModalOpen(true);
                  }}
                >
                  {wine.is_favorite && (
                    <div className="absolute top-2 right-2 z-10">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </div>
                  )}
                  {wine.image_url ? (
                    <div className="aspect-square mb-2 bg-muted overflow-hidden">
                      <img src={wine.image_url} alt={wine.wine_name} className="w-full h-full object-cover" />
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
                  {wine.user_notes && (
                    <div className="mt-2 flex items-start gap-1 text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
                      <StickyNote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">{wine.user_notes}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <WineDetailModal
            wine={selectedWine}
            open={wineModalOpen}
            onOpenChange={setWineModalOpen}
            isOwnProfile={true}
            onUpdate={(updatedWine) => {
              setWines(prev => prev.map(w => w.id === updatedWine.id ? { ...w, ...updatedWine } : w));
              setSelectedWine(prev => prev ? { ...prev, ...updatedWine } : prev);
            }}
          />
        </section>
      </div>
    </BrutalistLayout>
  );
};

export default Journal;
