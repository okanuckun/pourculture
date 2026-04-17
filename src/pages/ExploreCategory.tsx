import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { VenueCard } from '@/components/VenueCard';
import { WinemakerCard } from '@/components/WinemakerCard';
import { WineFairCard } from '@/components/WineFairCard';
import { motion } from 'framer-motion';
import { Store, Wine, Utensils, Home, Grape, Calendar } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type VenueCategory = Database['public']['Enums']['venue_category'];
type CategoryType = 'restaurants' | 'bars' | 'wine-shops' | 'accommodations' | 'winemakers' | 'events';

const categoryConfig: Record<CategoryType, { 
  title: string; 
  description: string; 
  dbCategory?: VenueCategory; 
  table: string;
  icon: React.ReactNode;
}> = {
  restaurants: {
    title: 'RESTAURANTS',
    description: 'Discover restaurants serving natural wines',
    dbCategory: 'restaurant',
    table: 'venues',
    icon: <Utensils className="w-6 h-6" />
  },
  bars: {
    title: 'WINE BARS',
    description: 'Find the best natural wine bars',
    dbCategory: 'bar',
    table: 'venues',
    icon: <Wine className="w-6 h-6" />
  },
  'wine-shops': {
    title: 'WINE SHOPS',
    description: 'Browse natural wine shops near you',
    dbCategory: 'wine_shop',
    table: 'venues',
    icon: <Store className="w-6 h-6" />
  },
  accommodations: {
    title: 'ACCOMMODATIONS',
    description: 'Stay at wine-friendly accommodations',
    dbCategory: 'accommodation',
    table: 'venues',
    icon: <Home className="w-6 h-6" />
  },
  winemakers: {
    title: 'WINEMAKERS',
    description: 'Meet the artisans behind natural wines',
    table: 'winemakers',
    icon: <Grape className="w-6 h-6" />
  },
  events: {
    title: 'WINE FAIRS & EVENTS',
    description: 'Upcoming natural wine events and fairs',
    table: 'wine_fairs',
    icon: <Calendar className="w-6 h-6" />
  }
};

const ExploreCategory = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const config = categoryConfig[category as CategoryType];

  useEffect(() => {
    if (!config) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (config.table === 'venues' && config.dbCategory) {
          const { data: venues } = await supabase
            .from('venues')
            .select('*')
            .eq('category', config.dbCategory)
            .order('created_at', { ascending: false });
          setData(venues || []);
        } else if (config.table === 'winemakers') {
          const { data: winemakers } = await supabase
            .from('winemakers')
            .select('*')
            .order('created_at', { ascending: false });
          setData(winemakers || []);
        } else if (config.table === 'wine_fairs') {
          const today = new Date().toISOString().split('T')[0];
          const { data: fairs } = await supabase
            .from('wine_fairs')
            .select('*')
            .gte('start_date', today)
            .order('start_date', { ascending: true });
          setData(fairs || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, config, navigate]);

  if (!config) {
    return null;
  }

  return (
    <BrutalistLayout
      showBackButton
      backPath="/"
      backLabel="Back to Home"
    >
      <SEOHead 
        title={`${config.title} | PourCulture`}
        description={config.description}
      />
      
      <div className="px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-12"
        >
          <div className="border-2 border-foreground p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 border-2 border-foreground flex items-center justify-center">
                {config.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{config.title}</h1>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t-2 border-foreground/20 pt-4 mt-4">
              <span className="font-medium">{loading ? '...' : data.length} RESULTS</span>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 border-2 border-foreground/20 animate-pulse" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-foreground/20 p-12 text-center"
            >
              <div className="w-16 h-16 border-2 border-foreground/20 flex items-center justify-center mx-auto mb-4">
                {config.icon}
              </div>
              <p className="text-xl font-bold mb-2">NO {config.title} FOUND YET</p>
              <p className="text-muted-foreground">Check back soon for new additions!</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {config.table === 'venues' && data.map((venue: any, index: number) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <VenueCard
                    id={venue.id}
                    name={venue.name}
                    address={venue.address}
                    city={venue.city}
                    category={venue.category}
                    imageUrl={resolveVenueImage(venue, 800)}
                    isOpen={venue.is_open}
                    isClaimed={venue.is_claimed}
                    googleRating={venue.google_rating}
                    openingHours={venue.opening_hours}
                  />
                </motion.div>
              ))}
              {config.table === 'winemakers' && data.map((winemaker: any, index: number) => (
                <motion.div
                  key={winemaker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <WinemakerCard
                    id={winemaker.id}
                    name={winemaker.name}
                    domainName={winemaker.domain_name}
                    region={winemaker.region}
                    country={winemaker.country}
                    imageUrl={winemaker.image_url}
                    isNew={winemaker.is_new}
                  />
                </motion.div>
              ))}
              {config.table === 'wine_fairs' && data.map((fair: any, index: number) => (
                <motion.div
                  key={fair.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <WineFairCard
                    id={fair.id}
                    title={fair.title}
                    startDate={fair.start_date}
                    endDate={fair.end_date}
                    city={fair.city}
                    country={fair.country}
                    price={fair.price}
                    ticketUrl={fair.ticket_url}
                    posterUrl={fair.poster_url}
                    isProOnly={fair.is_pro_only}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </BrutalistLayout>
  );
};

export default ExploreCategory;
