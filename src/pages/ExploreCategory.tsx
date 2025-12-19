import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { VenueCard } from '@/components/VenueCard';
import { WinemakerCard } from '@/components/WinemakerCard';
import { WineFairCard } from '@/components/WineFairCard';
import { ArrowLeft } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type VenueCategory = Database['public']['Enums']['venue_category'];
type CategoryType = 'restaurants' | 'bars' | 'wine-shops' | 'accommodations' | 'winemakers' | 'events';

const categoryConfig: Record<CategoryType, { title: string; description: string; dbCategory?: VenueCategory; table: string }> = {
  restaurants: {
    title: 'Restaurants',
    description: 'Discover restaurants serving natural wines',
    dbCategory: 'restaurant',
    table: 'venues'
  },
  bars: {
    title: 'Wine Bars',
    description: 'Find the best natural wine bars',
    dbCategory: 'bar',
    table: 'venues'
  },
  'wine-shops': {
    title: 'Wine Shops',
    description: 'Browse natural wine shops near you',
    dbCategory: 'wine_shop',
    table: 'venues'
  },
  accommodations: {
    title: 'Accommodations',
    description: 'Stay at wine-friendly accommodations',
    dbCategory: 'accommodation',
    table: 'venues'
  },
  winemakers: {
    title: 'Winemakers',
    description: 'Meet the artisans behind natural wines',
    table: 'winemakers'
  },
  events: {
    title: 'Wine Fairs & Events',
    description: 'Upcoming natural wine events and fairs',
    table: 'wine_fairs'
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
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${config.title} | RAW CELLAR`}
        description={config.description}
      />
      <RaisinNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-foreground mb-2">{config.title}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No {config.title.toLowerCase()} found yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for new additions!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.table === 'venues' && data.map((venue: any) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name}
                  address={venue.address}
                  city={venue.city}
                  category={venue.category}
                  imageUrl={venue.image_url}
                  isOpen={venue.is_open}
                  openingHours={venue.opening_hours}
                />
              ))}
              {config.table === 'winemakers' && data.map((winemaker: any) => (
                <WinemakerCard
                  key={winemaker.id}
                  id={winemaker.id}
                  name={winemaker.name}
                  domainName={winemaker.domain_name}
                  region={winemaker.region}
                  country={winemaker.country}
                  imageUrl={winemaker.image_url}
                  isNew={winemaker.is_new}
                />
              ))}
              {config.table === 'wine_fairs' && data.map((fair: any) => (
                <WineFairCard
                  key={fair.id}
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExploreCategory;
