import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { CategoryFilter, VenueCategory } from '@/components/CategoryFilter';
import { MapSearchBar } from '@/components/MapSearchBar';
import { VenueCard } from '@/components/VenueCard';
import { WinemakerCard } from '@/components/WinemakerCard';
import { WineFairCard } from '@/components/WineFairCard';
import { NewsCard } from '@/components/NewsCard';
import { OpenNowToggle } from '@/components/OpenNowToggle';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Wine } from 'lucide-react';

const RaisinHome = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VenueCategory>('all');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [winemakers, setWinemakers] = useState<any[]>([]);
  const [wineFairs, setWineFairs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [userCity, setUserCity] = useState('your area');

  useEffect(() => {
    fetchData();
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const data = await response.text();
      const locMatch = data.match(/loc=([A-Z]{2})/);
      if (locMatch) {
        const countryNames: Record<string, string> = {
          'US': 'Washington', 'GB': 'London', 'FR': 'Paris', 'DE': 'Berlin',
          'IT': 'Rome', 'ES': 'Madrid', 'TR': 'Istanbul', 'JP': 'Tokyo'
        };
        setUserCity(countryNames[locMatch[1]] || 'your area');
      }
    } catch (e) {
      console.error('Location detection failed');
    }
  };

  const fetchData = async () => {
    const [venuesRes, winemakersRes, fairsRes, newsRes, countriesRes] = await Promise.all([
      supabase.from('venues').select('*').eq('is_featured', true).limit(6),
      supabase.from('winemakers').select('*').limit(8),
      supabase.from('wine_fairs').select('*').gte('start_date', new Date().toISOString().split('T')[0]).order('start_date').limit(10),
      supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(8),
      supabase.from('countries').select('*').order('venue_count', { ascending: false }).limit(7),
    ]);
    
    setVenues(venuesRes.data || []);
    setWinemakers(winemakersRes.data || []);
    setWineFairs(fairsRes.data || []);
    setNews(newsRes.data || []);
    setCountries(countriesRes.data || []);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="RAW CELLAR - Natural Wine & Food Lovers"
        description="Discover natural wine bars, restaurants, wine shops and winemakers near you. RAW CELLAR is your guide to the best natural wine spots."
        keywords="natural wine, organic wine, wine bars, restaurants, winemakers, raw cellar"
      />
      <RaisinNavbar />

      {/* Hero Map Section */}
      <section className="relative h-[60vh] min-h-[500px] bg-[#f5f1eb] pt-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Wine className="w-16 h-16 mx-auto text-accent mb-4 animate-wine-swirl" />
            <p className="text-muted-foreground">Map will display here</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="absolute top-20 left-4 right-4 z-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <CategoryFilter 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
            />
            <OpenNowToggle checked={showOpenOnly} onCheckedChange={setShowOpenOnly} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="absolute bottom-8 left-4 right-4 z-10">
          <MapSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-header">LOCAL & UNIQUE BARS, RESTAURANT & WINE SHOPS</p>
              <h2 className="section-title">FEATURED VENUES NEARBY IN {userCity.toUpperCase()}</h2>
              <p className="text-muted-foreground max-w-2xl">
                When looking for local, seasonal and organic restaurants, bars and wine shops, RAW CELLAR is your best option.
              </p>
            </div>
            <button 
              onClick={() => navigate('/explore')}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              All venues in {userCity} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {venues.length > 0 ? venues.map((venue) => (
              <VenueCard
                key={venue.id}
                id={venue.id}
                name={venue.name}
                category={venue.category}
                address={venue.address}
                city={venue.city}
                imageUrl={venue.image_url}
                isOpen={venue.is_open}
                onClick={() => navigate(`/venue/${venue.slug}`)}
              />
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No venues yet. Be the first to add one!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Winemakers Section */}
      <section className="py-16 px-4 md:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-header">FEATURED NATURAL WINEMAKERS</p>
              <h2 className="section-title">Meet the Winemakers</h2>
            </div>
            <button 
              onClick={() => navigate('/winemakers')}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              All Winemakers <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {winemakers.length > 0 ? winemakers.map((winemaker) => (
              <WinemakerCard
                key={winemaker.id}
                id={winemaker.id}
                name={winemaker.name}
                domainName={winemaker.domain_name}
                region={winemaker.region}
                country={winemaker.country}
                imageUrl={winemaker.image_url}
                isNew={winemaker.is_new}
                onClick={() => navigate(`/winemaker/${winemaker.slug}`)}
              />
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No winemakers yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Wine Fairs Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="section-header">MEET THE NATURAL WINEMAKERS, TASTE THEIR WINES</p>
            <h2 className="section-title">Upcoming Natural Wine Fairs!</h2>
            <p className="text-muted-foreground">
              Discover the upcoming natural wine fairs, exhibits & wine tastings around the world!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wineFairs.length > 0 ? wineFairs.slice(0, 4).map((fair) => (
              <WineFairCard
                key={fair.id}
                id={fair.id}
                title={fair.title}
                description={fair.description}
                posterUrl={fair.poster_url}
                price={fair.price}
                ticketUrl={fair.ticket_url}
                startDate={fair.start_date}
                endDate={fair.end_date}
                city={fair.city}
                country={fair.country}
                isProOnly={fair.is_pro_only}
                onClick={() => navigate(`/event/${fair.slug}`)}
              />
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No upcoming wine fairs.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 px-4 md:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="section-header">NATURAL WINE & FOOD NEWS</p>
            <h2 className="section-title">Latest News</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {news.length > 0 ? news.map((article) => (
              <NewsCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.excerpt}
                imageUrl={article.image_url}
                publishedAt={article.published_at}
                onClick={() => navigate(`/news/${article.slug}`)}
              />
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No news articles yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="section-header">TRAVELING THE WORLD LIKE A LOCAL!</p>
            <h2 className="section-title">Explore by Country</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => navigate(`/explore/${country.slug}`)}
                className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium"
              >
                {country.flag_emoji} {country.name} <span className="text-muted-foreground ml-1">{country.venue_count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2025 RAW CELLAR. Natural Wine & Food Lovers.</p>
        </div>
      </footer>
    </div>
  );
};

export default RaisinHome;
