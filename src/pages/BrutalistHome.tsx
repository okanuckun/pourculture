import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { BrutalistHero, CategoryType, UserCoordinates } from '@/components/grid/BrutalistHero';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import CategorySection from '@/components/home/CategorySection';
import EventsSection from '@/components/home/EventsSection';
import FooterSection from '@/components/home/FooterSection';
import { toast } from 'sonner';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WineFairMarker } from '@/components/WineMap/types';
import { SEOHead } from '@/components/SEOHead';

type Venue = Tables<'venues'>;
type Winemaker = Tables<'winemakers'>;
type WineFair = Tables<'wine_fairs'>;

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number | null, lng2: number | null): number => {
  if (lat2 === null || lng2 === null) return Infinity;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Sort items by distance from user
const sortByDistance = <T extends { latitude?: number | null; longitude?: number | null }>(
  items: T[],
  userCoords: UserCoordinates | null
): T[] => {
  if (!userCoords) return items;
  
  return [...items].sort((a, b) => {
    const distA = calculateDistance(userCoords.lat, userCoords.lng, a.latitude ?? null, a.longitude ?? null);
    const distB = calculateDistance(userCoords.lat, userCoords.lng, b.latitude ?? null, b.longitude ?? null);
    return distA - distB;
  });
};

const BrutalistHome = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('overview');
  const [userLocation, setUserLocation] = useState<string>('');
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationRequested, setLocationRequested] = useState(false);
  const [showLocationBanner, setShowLocationBanner] = useState(
    !localStorage.getItem('pourculture_location_consent') && !localStorage.getItem('pourculture_location_dismissed')
  );

  // Data states
  const [wineBars, setWineBars] = useState<Venue[]>([]);
  const [wineShops, setWineShops] = useState<Venue[]>([]);
  const [restaurants, setRestaurants] = useState<Venue[]>([]);
  const [winemakers, setWinemakers] = useState<Winemaker[]>([]);
  const [wineFairs, setWineFairs] = useState<WineFair[]>([]);

  // Fetch data function
  const fetchData = useCallback(async (coords: UserCoordinates | null) => {
    setLoading(true);
    try {
      const [barsResult, shopsResult, restaurantsResult, winemakersResult, fairsResult] = await Promise.all([
        supabase
          .from('venues')
          .select('*')
          .eq('category', 'bar')
          .order('is_featured', { ascending: false })
          .limit(16),
        supabase
          .from('venues')
          .select('*')
          .eq('category', 'wine_shop')
          .order('is_featured', { ascending: false })
          .limit(16),
        supabase
          .from('venues')
          .select('*')
          .eq('category', 'restaurant')
          .order('is_featured', { ascending: false })
          .limit(16),
        supabase
          .from('winemakers')
          .select('*')
          .order('is_featured', { ascending: false })
          .limit(16),
        supabase
          .from('wine_fairs')
          .select('*')
          .gte('start_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(8),
      ]);

      // Sort by distance if user location is available
      if (barsResult.data) {
        setWineBars(sortByDistance(barsResult.data, coords).slice(0, 8));
      }
      if (shopsResult.data) {
        setWineShops(sortByDistance(shopsResult.data, coords).slice(0, 8));
      }
      if (restaurantsResult.data) {
        setRestaurants(sortByDistance(restaurantsResult.data, coords).slice(0, 8));
      }
      if (winemakersResult.data) {
        setWinemakers(sortByDistance(winemakersResult.data, coords).slice(0, 8));
      }
      if (fairsResult.data) {
        // Sort events by distance too
        setWineFairs(sortByDistance(fairsResult.data, coords));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Request location — only if user previously consented
  useEffect(() => {
    if (locationRequested) return;
    setLocationRequested(true);

    // Check if user already granted location consent
    const hasConsent = localStorage.getItem('pourculture_location_consent');
    if (!hasConsent) return;

    const requestLocation = async () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserCoords(coords);

            // Reverse geocode to get city name
            try {
              const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
              if (tokenData?.token) {
                const response = await fetch(
                  `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?types=place&access_token=${tokenData.token}`
                );
                if (response.ok) {
                  const data = await response.json();
                  if (data.features && data.features.length > 0) {
                    setUserLocation(data.features[0].text);
                  }
                }
              }
            } catch (error) {
              console.log('Could not get location name');
            }

            // Fetch data with user coordinates
            fetchData(coords);
          },
          () => {
            console.log('Location permission denied');
            // Fetch data without location
            fetchData(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          }
        );
      } else {
        // Geolocation not supported
        fetchData(null);
      }
    };

    requestLocation();
  }, [locationRequested, fetchData]);

  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
  };

  // Render content based on active category
  const renderContent = () => {
    const locationSubtitle = userLocation ? `NEAR ${userLocation.toUpperCase()}` : 'DISCOVER';

    if (activeCategory === 'overview') {
      return (
        <>
          <CategorySection
            title="WINE BARS"
            subtitle={locationSubtitle}
            description="Discover the best natural wine bars where passion meets craft. Each venue curated for authentic experiences."
            items={wineBars}
            type="venue"
            linkPrefix="/venue"
            loading={loading}
            viewAllLink="/discover?category=bar"
          />
          <CategorySection
            title="WINE SHOPS"
            subtitle={userLocation ? `NEAR ${userLocation.toUpperCase()}` : 'EXPLORE'}
            description="Find your next bottle at carefully selected shops specializing in natural, organic and biodynamic wines."
            items={wineShops}
            type="venue"
            linkPrefix="/venue"
            loading={loading}
            viewAllLink="/discover?category=wine_shop"
          />
          <CategorySection
            title="RESTAURANTS"
            subtitle={userLocation ? `NEAR ${userLocation.toUpperCase()}` : 'DINE'}
            description="Exceptional dining experiences paired with thoughtfully curated natural wine selections."
            items={restaurants}
            type="venue"
            linkPrefix="/venue"
            loading={loading}
            viewAllLink="/discover?category=restaurant"
          />
          <CategorySection
            title="WINEMAKERS"
            subtitle={userLocation ? `NEAR ${userLocation.toUpperCase()}` : 'MEET'}
            description="Meet the artisans behind your favorite bottles. Independent producers crafting wines with soul."
            items={winemakers}
            type="winemaker"
            linkPrefix="/winemaker"
            loading={loading}
            viewAllLink="/explore/winemakers"
          />
          <EventsSection
            events={wineFairs}
            loading={loading}
          />
        </>
      );
    }

    if (activeCategory === 'bar') {
      return (
        <CategorySection
          title="WINE BARS"
          subtitle={locationSubtitle}
          description="Discover the best natural wine bars where passion meets craft. Each venue curated for authentic experiences."
          items={wineBars}
          type="venue"
          linkPrefix="/venue"
          loading={loading}
          viewAllLink="/discover?category=bar"
        />
      );
    }

    if (activeCategory === 'wine_shop') {
      return (
        <CategorySection
          title="WINE SHOPS"
          subtitle={locationSubtitle}
          description="Find your next bottle at carefully selected shops specializing in natural, organic and biodynamic wines."
          items={wineShops}
          type="venue"
          linkPrefix="/venue"
          loading={loading}
          viewAllLink="/discover?category=wine_shop"
        />
      );
    }

    if (activeCategory === 'restaurant') {
      return (
        <CategorySection
          title="RESTAURANTS"
          subtitle={locationSubtitle}
          description="Exceptional dining experiences paired with thoughtfully curated natural wine selections."
          items={restaurants}
          type="venue"
          linkPrefix="/venue"
          loading={loading}
          viewAllLink="/discover?category=restaurant"
        />
      );
    }

    if (activeCategory === 'winemaker') {
      return (
        <CategorySection
          title="WINEMAKERS"
          subtitle={locationSubtitle}
          description="Meet the artisans behind your favorite bottles. Independent producers crafting wines with soul."
          items={winemakers}
          type="winemaker"
          linkPrefix="/winemaker"
          loading={loading}
          viewAllLink="/explore/winemakers"
        />
      );
    }

    if (activeCategory === 'events') {
      return (
        <EventsSection
          events={wineFairs}
          loading={loading}
          showSidebar={true}
        />
      );
    }

    return null;
  };

  // Convert wineFairs to WineFairMarker format for the map
  const wineFairMarkers: WineFairMarker[] = useMemo(() => {
    return wineFairs
      .filter(fair => fair.latitude && fair.longitude)
      .map(fair => ({
        id: fair.id,
        title: fair.title,
        lat: Number(fair.latitude),
        lng: Number(fair.longitude),
        city: fair.city,
        country: fair.country,
        startDate: fair.start_date,
        endDate: fair.end_date || undefined,
        slug: fair.slug,
      }));
  }, [wineFairs]);

  const handleAllowLocation = () => {
    localStorage.setItem('pourculture_location_consent', 'true');
    setShowLocationBanner(false);
    // Trigger location request
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserCoords(coords);
          fetchData(coords);
        },
        () => { /* User denied browser prompt — that's fine */ }
      );
    }
  };

  const handleDismissLocation = () => {
    localStorage.setItem('pourculture_location_dismissed', 'true');
    setShowLocationBanner(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-grotesk">
      <SEOHead
        title="POURCULTURE — Discover Natural Wine"
        description="Explore natural wine venues, winemakers, and events worldwide. Your guide to the natural wine community."
      />
      {/* Location Consent Banner */}
      {showLocationBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card border border-border rounded-xl p-4 shadow-xl animate-in slide-in-from-bottom-4">
          <div className="flex gap-3">
            <div className="p-2 bg-primary/10 rounded-lg h-fit shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Enable location?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                See nearby wine bars, shops, and winemakers. Your location is never stored.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="h-8 text-xs" onClick={handleAllowLocation}>
                  Allow
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={handleDismissLocation}>
                  Not now
                </Button>
              </div>
            </div>
            <button onClick={handleDismissLocation} className="text-muted-foreground hover:text-foreground h-fit">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section with Map and Category Tabs */}
      <BrutalistHero
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        userLocation={userLocation}
        userCoords={userCoords}
        wineFairs={wineFairMarkers}
      />

      {/* Dynamic Content Based on Category */}
      {renderContent()}

      {/* Fixed Footer Section */}
      <FooterSection />
    </div>
  );
};

export default BrutalistHome;
