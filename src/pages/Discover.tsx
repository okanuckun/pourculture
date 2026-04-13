import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DiscoverMap } from '@/components/discover/DiscoverMap';
import { LocationBanner } from '@/components/discover/LocationBanner';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
}

interface Venue {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  country: string;
  image_url: string | null;
  is_open: boolean | null;
  latitude: number | null;
  longitude: number | null;
}

const categoryOptions = [
  { value: 'all', label: 'ALL VENUES' },
  { value: 'bar', label: 'WINE BARS' },
  { value: 'wine_shop', label: 'WINE SHOPS' },
  { value: 'restaurant', label: 'RESTAURANTS' },
  { value: 'events', label: 'EVENTS' },
];

const haversine = (lat1: number, lng1: number, lat2: number | null, lng2: number | null): number => {
  if (lat2 === null || lng2 === null) return Infinity;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Discover = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('view') === 'events' ? 'events' : initialCategory
  );
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userCity, setUserCity] = useState('');
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const navigate = useNavigate();

  const isEventsView = selectedCategory === 'events';

  useEffect(() => {
    const hasConsent = localStorage.getItem('pourculture_location_consent');
    const dismissed = localStorage.getItem('pourculture_location_dismissed');
    if (hasConsent) {
      requestLocation();
    } else if (!dismissed) {
      setShowLocationBanner(true);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserCoords(coords);
        localStorage.setItem('pourculture_location_consent', 'true');
        setShowLocationBanner(false);
        try {
          const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
          if (tokenData?.token) {
            const res = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?types=place&access_token=${tokenData.token}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.features?.[0]) setUserCity(data.features[0].text);
            }
          }
        } catch { /* silent */ }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const handleLocationAllow = () => requestLocation();
  const handleLocationDismiss = () => {
    setShowLocationBanner(false);
    localStorage.setItem('pourculture_location_dismissed', 'true');
  };

  useEffect(() => {
    if (isEventsView) {
      fetchEvents();
    } else {
      fetchVenues();
    }
  }, [selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, background_image_url, target_date, address')
        .order('target_date', { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('venues')
        .select('id, name, slug, category, city, country, image_url, is_open, latitude, longitude')
        .order('name');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as 'bar' | 'wine_shop' | 'restaurant' | 'winemaker');
      }

      const { data, error } = await query;
      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedVenues = userCoords
    ? [...venues].sort((a, b) =>
        haversine(userCoords.lat, userCoords.lng, a.latitude, a.longitude) -
        haversine(userCoords.lat, userCoords.lng, b.latitude, b.longitude)
      )
    : venues;

  const filteredEvents = events.filter((event) => {
    const now = new Date().getTime();
    const target = new Date(event.target_date).getTime();
    if (target < now - 3600000) return false;
    if (!date) return true;
    const eventDate = new Date(event.target_date);
    return eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate();
  });

  return (
    <BrutalistLayout>
      <SEOHead
        title="Discover | POURCULTURE"
        description="Explore natural wine venues and events near you."
      />

      {/* Map with overlaid title */}
      <div className="relative border-b border-foreground/20">
        <DiscoverMap
          venues={isEventsView ? [] : sortedVenues}
          userCoords={userCoords}
          onVenueClick={(slug) => navigate(`/venue/${slug}`)}
        />
        {/* Overlay: title + location */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <div className="bg-gradient-to-t from-background/90 via-background/50 to-transparent pt-12 pb-3 px-4">
            <div className="flex items-end gap-2">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-none">
                Discover
              </h1>
              {userCity && (
                <span className="text-[10px] tracking-wider text-muted-foreground flex items-center gap-1 pb-0.5">
                  <MapPin className="w-3 h-3" />
                  NEAR {userCity.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-foreground/20 py-3 px-4 md:px-6 sticky top-12 bg-background z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-1.5 text-[10px] tracking-wider transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-foreground text-background'
                    : 'border border-foreground/20 hover:border-foreground/50'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Date picker for events */}
            {isEventsView && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 text-[10px] tracking-wider border border-foreground/20 hover:border-foreground/50 transition-colors",
                      date && "border-foreground"
                    )}
                  >
                    <CalendarIcon className="w-3 h-3" />
                    {date ? format(date, "MMM d, yyyy").toUpperCase() : 'PICK A DATE'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-foreground/20" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <span className="text-[10px] tracking-wider text-muted-foreground">
            {isEventsView
              ? `${filteredEvents.length} EVENTS`
              : `${sortedVenues.length} VENUES`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-foreground/20 aspect-[4/3] animate-pulse bg-muted" />
            ))}
          </div>
        ) : isEventsView ? (
          filteredEvents.length === 0 ? (
            <div className="text-center py-16 border border-foreground/20">
              <p className="text-muted-foreground">
                {date ? `No events on ${format(date, 'MMMM d, yyyy')}` : 'No upcoming events'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {filteredEvents.map((event, index) => (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="border border-foreground/20 cursor-pointer group"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img loading="lazy"
                      src={event.background_image_url}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-0">
                      <div className="bg-background border border-foreground/20 px-3 h-6 flex items-center">
                        <span className="text-[10px] tracking-wider uppercase">{event.date}</span>
                      </div>
                      <div className="bg-background border border-t-0 border-foreground/20 px-3 h-6 flex items-center">
                        <span className="text-[10px] tracking-wider">{event.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold tracking-tight mb-1 group-hover:text-muted-foreground transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {event.address}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )
        ) : (
          sortedVenues.length === 0 ? (
            <div className="text-center py-16 border border-foreground/20">
              <p className="text-muted-foreground">No venues found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {sortedVenues.map((venue, index) => {
                const dist = userCoords
                  ? haversine(userCoords.lat, userCoords.lng, venue.latitude, venue.longitude)
                  : null;
                return (
                  <motion.article
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                    onClick={() => navigate(`/venue/${venue.slug}`)}
                    className="border border-foreground/20 cursor-pointer group"
                  >
                    {venue.image_url ? (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img loading="lazy"
                          src={venue.image_url}
                          alt={venue.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                        <span className="text-4xl">🍷</span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${venue.is_open ? 'bg-status-open' : 'bg-status-closed'}`} />
                        <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                          {venue.category.replace('_', ' ')}
                        </span>
                        {dist !== null && dist !== Infinity && (
                          <span className="text-[10px] tracking-wider text-muted-foreground ml-auto">
                            {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold tracking-tight mb-1 group-hover:text-muted-foreground transition-colors">
                        {venue.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {venue.city}, {venue.country}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )
        )}
      </div>

      {showLocationBanner && (
        <LocationBanner onAllow={handleLocationAllow} onDismiss={handleLocationDismiss} />
      )}
    </BrutalistLayout>
  );
};

export default Discover;
