import React, { useEffect, useState } from 'react';
import { BrutalistHero, CategoryType } from '@/components/grid/BrutalistHero';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import CategorySection from '@/components/home/CategorySection';
import EventsSection from '@/components/home/EventsSection';
import FooterSection from '@/components/home/FooterSection';

type Venue = Tables<'venues'>;
type Winemaker = Tables<'winemakers'>;
type WineFair = Tables<'wine_fairs'>;

const BrutalistHome = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('overview');
  const [userLocation, setUserLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [wineBars, setWineBars] = useState<Venue[]>([]);
  const [wineShops, setWineShops] = useState<Venue[]>([]);
  const [restaurants, setRestaurants] = useState<Venue[]>([]);
  const [winemakers, setWinemakers] = useState<Winemaker[]>([]);
  const [wineFairs, setWineFairs] = useState<WineFair[]>([]);

  // Request location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Reverse geocode to get city name
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?types=place&access_token=${import.meta.env.VITE_MAPBOX_TOKEN || ''}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.features && data.features.length > 0) {
                setUserLocation(data.features[0].text);
              }
            }
          } catch (error) {
            console.log('Could not get location name');
          }
        },
        () => {
          console.log('Location permission denied');
        }
      );
    }
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [barsResult, shopsResult, restaurantsResult, winemakersResult, fairsResult] = await Promise.all([
          supabase
            .from('venues')
            .select('*')
            .eq('category', 'bar')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('venues')
            .select('*')
            .eq('category', 'wine_shop')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('venues')
            .select('*')
            .eq('category', 'restaurant')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('winemakers')
            .select('*')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('wine_fairs')
            .select('*')
            .gte('start_date', new Date().toISOString().split('T')[0])
            .order('start_date', { ascending: true })
            .limit(8),
        ]);

        if (barsResult.data) setWineBars(barsResult.data);
        if (shopsResult.data) setWineShops(shopsResult.data);
        if (restaurantsResult.data) setRestaurants(restaurantsResult.data);
        if (winemakersResult.data) setWinemakers(winemakersResult.data);
        if (fairsResult.data) setWineFairs(fairsResult.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
  };

  // Render content based on active category
  const renderContent = () => {
    if (activeCategory === 'overview') {
      return (
        <>
          <CategorySection
            title="WINE BARS"
            subtitle="DISCOVER"
            items={wineBars}
            type="venue"
            linkPrefix="/venue"
            loading={loading}
            viewAllLink="/discover?category=bar"
          />
          <CategorySection
            title="WINE SHOPS"
            subtitle="EXPLORE"
            items={wineShops}
            type="venue"
            linkPrefix="/venue"
            loading={loading}
            viewAllLink="/discover?category=wine_shop"
          />
          <CategorySection
            title="RESTAURANTS"
            subtitle="DINE"
            items={restaurants}
            type="venue"
            linkPrefix="/venue"
            loading={loading}
            viewAllLink="/discover?category=restaurant"
          />
          <CategorySection
            title="WINEMAKERS"
            subtitle="MEET"
            items={winemakers}
            type="winemaker"
            linkPrefix="/winemaker"
            loading={loading}
            viewAllLink="/winemakers"
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
          subtitle="ALL"
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
          subtitle="ALL"
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
          subtitle="ALL"
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
          subtitle="ALL"
          items={winemakers}
          type="winemaker"
          linkPrefix="/winemaker"
          loading={loading}
          viewAllLink="/winemakers"
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

  return (
    <div className="min-h-screen bg-background text-foreground font-grotesk">
      {/* Hero Section with Map and Category Tabs */}
      <BrutalistHero
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        userLocation={userLocation}
      />

      {/* Dynamic Content Based on Category */}
      {renderContent()}

      {/* Fixed Footer Section */}
      <FooterSection />
    </div>
  );
};

export default BrutalistHome;
