import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Wine, Database, Search, MapPin, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { WineVenue, WineVenueCategory, MapBounds, CATEGORY_CONFIG } from './types';
import { fetchWineVenuesFromGoogle } from './googlePlacesApi';
import { fetchAllDatabaseVenues } from './databaseApi';
import { CategoryFilter } from './CategoryFilter';
import { supabase } from '@/integrations/supabase/client';

interface MapboxMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

const DEFAULT_CENTER: [number, number] = [-73.9857, 40.7484]; // NYC [lng, lat]
const TOKEN_FETCH_TIMEOUT = 10000; // 10 seconds

export const MapboxMap: React.FC<MapboxMapProps> = ({
  className = '',
  initialCenter = DEFAULT_CENTER,
  initialZoom = 12,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [googleVenues, setGoogleVenues] = useState<WineVenue[]>([]);
  const [dbVenues, setDbVenues] = useState<WineVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<WineVenueCategory>('all');
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  // App always searches for natural wine venues only
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch Mapbox token from edge function with timeout
  const fetchToken = useCallback(async () => {
    setTokenLoading(true);
    setTokenError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TOKEN_FETCH_TIMEOUT);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
        body: {},
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch token');
      }
      
      if (!data?.token) {
        throw new Error('Token not configured in backend');
      }
      
      setMapboxToken(data.token);
      setTokenError(null);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = error.name === 'AbortError';
      const errorMessage = isTimeout 
        ? 'Token fetch timed out. Please try again.' 
        : (error.message || 'Failed to load map configuration');
      
      console.error('Error fetching Mapbox token:', error);
      setTokenError(errorMessage);
      
      toast.error('Map Loading Error', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setTokenLoading(false);
    }
  }, []);

  // Initial token fetch
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Load database venues with limit
  useEffect(() => {
    const loadDbVenues = async () => {
      setDbLoading(true);
      try {
        const venues = await fetchAllDatabaseVenues();
        setDbVenues(venues);
      } catch (error) {
        console.error('Error loading database venues:', error);
      } finally {
        setDbLoading(false);
      }
    };
    loadDbVenues();
  }, []); // Initial load — limited to 500 per table by databaseApi

  const [centerLng, centerLat] = initialCenter;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      // Use Mapbox's maintained base style for stability.
      // Our custom style was throwing "source-layer does not exist" errors and causing flicker.
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [centerLng, centerLat],
      zoom: initialZoom,
      pitch: 45,
      bearing: -10,
      antialias: true,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere effect
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(26, 26, 46)',
        'high-color': 'rgb(40, 40, 80)',
        'horizon-blend': 0.1,
        'space-color': 'rgb(15, 15, 30)',
        'star-intensity': 0.15,
      });
      setMapReady(true);

      // Auto-fetch OSM venues on initial load
      if (map.current) {
        const bounds = map.current.getBounds();
        const initialBounds = {
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast(),
        };
        setCurrentBounds(initialBounds);
      }
    });

    // Update bounds on move
    map.current.on('moveend', () => {
      if (!map.current) return;
      const bounds = map.current.getBounds();
      setCurrentBounds({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, centerLng, centerLat, initialZoom]);

  // Combine Google Places and database venues
  const allVenues = useMemo(() => {
    const combined = [...dbVenues];
    const seenLocations = new Set(dbVenues.map(v => `${v.lat.toFixed(4)},${v.lng.toFixed(4)}`));
    
    googleVenues.forEach(venue => {
      const locationKey = `${venue.lat.toFixed(4)},${venue.lng.toFixed(4)}`;
      if (!seenLocations.has(locationKey)) {
        combined.push(venue);
        seenLocations.add(locationKey);
      }
    });
    
    return combined;
  }, [googleVenues, dbVenues]);

  // Calculate venue counts
  const venueCounts = useMemo(() => {
    const counts: Record<WineVenueCategory, number> = {
      all: 0,
      wine_shop: 0,
      wine_bar: 0,
      winery: 0,
      restaurant: 0,
    };
    
    allVenues.forEach(venue => {
      counts[venue.category]++;
      counts.all++;
    });
    
    return counts;
  }, [allVenues]);

  // Filter venues
  const filteredVenues = useMemo(() => {
    if (selectedCategory === 'all') return allVenues;
    return allVenues.filter(v => v.category === selectedCategory);
  }, [allVenues, selectedCategory]);

  // Update markers when venues or map changes
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredVenues.forEach(venue => {
      const config = CATEGORY_CONFIG[venue.category];
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'wine-marker';
      el.innerHTML = `
        <div class="wine-marker-inner" style="
          background: linear-gradient(135deg, ${config.color}, ${config.color}dd);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 20px ${config.color}44;
          border: 2px solid rgba(255,255,255,0.9);
          cursor: pointer;
          transform-origin: center center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        ">
          ${config.icon}
        </div>
      `;

      const inner = el.querySelector('.wine-marker-inner') as HTMLDivElement | null;

      // Add hover effect (IMPORTANT: never mutate `el.style.transform` since Mapbox uses it for positioning)
      el.addEventListener('mouseenter', () => {
        if (inner) inner.style.transform = 'scale(1.15)';
        el.style.zIndex = '1000';
      });
      el.addEventListener('mouseleave', () => {
        if (inner) inner.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Generate detail page URL for database venues
      const getDetailUrl = () => {
        if (venue.source !== 'database' || !venue.slug) return null;
        switch (venue.venueType) {
          case 'venue': return `/venue/${venue.slug}`;
          case 'winemaker': return `/winemaker/${venue.slug}`;
          case 'wine_fair': return `/wine-fair/${venue.slug}`;
          default: return null;
        }
      };
      const detailUrl = getDetailUrl();

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: 'wine-popup',
      }).setHTML(`
        <div style="padding: 8px; min-width: 200px; max-width: 280px;">
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
            <span style="
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              color: white;
              background: ${config.color};
            ">
              ${config.icon} ${config.label}
            </span>
            ${venue.source === 'database' ? `
              <span style="
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                color: #8b5cf6;
                background: rgba(139, 92, 246, 0.1);
              ">
                ✓ Verified
              </span>
            ` : ''}
            ${venue.isEvent ? `
              <span style="
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                color: #f59e0b;
                background: rgba(245, 158, 11, 0.1);
              ">
                🎉 Event
              </span>
            ` : ''}
          </div>
          <h3 style="font-weight: 600; color: #1a1a2e; font-size: 14px; margin-bottom: 8px;">
            ${venue.name}
          </h3>
          ${venue.address ? `
            <div style="display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #666; margin-bottom: 4px;">
              <span>📍</span>
              <span>${venue.address}${venue.city ? `, ${venue.city}` : ''}</span>
            </div>
          ` : ''}
          ${venue.openingHours ? `
            <div style="display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #666; margin-bottom: 4px;">
              <span>🕐</span>
              <span>${venue.openingHours}</span>
            </div>
          ` : ''}
          ${venue.phone ? `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #666; margin-bottom: 4px;">
              <span>📞</span>
              <a href="tel:${venue.phone}" style="color: #8b5cf6;">${venue.phone}</a>
            </div>
          ` : ''}
          <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            ${detailUrl ? `
              <a href="${detailUrl}" 
                 style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: white; background: linear-gradient(135deg, #8b5cf6, #a855f7); padding: 6px 12px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                👁️ View Details
              </a>
            ` : ''}
            ${!detailUrl && venue.source === 'google' && venue.googlePlaceId ? `
              <a href="/place/google/${venue.googlePlaceId.replace(/^(google_|foursquare_)/, '')}"
                 style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: white; background: linear-gradient(135deg, #8b5cf6, #a855f7); padding: 6px 12px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                👁️ View Details
              </a>
            ` : ''}
            ${venue.website ? `
              <a href="${venue.website.startsWith('http') ? venue.website : `https://${venue.website}`}" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #8b5cf6; padding: 6px 12px; border-radius: 8px; border: 1px solid #8b5cf6; text-decoration: none;">
                🔗 Website
              </a>
            ` : ''}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([venue.lng, venue.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [filteredVenues, mapReady]);

  // Fetch Google Places venues (always natural wine only)
  const fetchVenues = useCallback(async (bounds: MapBounds) => {
    setLoading(true);
    try {
      const centerLat = (bounds.north + bounds.south) / 2;
      const centerLng = (bounds.east + bounds.west) / 2;
      
      const latDiff = bounds.north - bounds.south;
      const lngDiff = bounds.east - bounds.west;
      const radiusKm = Math.max(latDiff, lngDiff) * 111 / 2;
      const radiusM = Math.min(Math.max(radiusKm * 1000, 1000), 50000);
      
      // Always search for natural wine venues
      const venues = await fetchWineVenuesFromGoogle(centerLat, centerLng, radiusM, true);
      setGoogleVenues(venues);
      setHasSearched(true);
      console.log(`Fetched ${venues.length} natural wine venues from Google Places`);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch venues when bounds are first set
  useEffect(() => {
    if (currentBounds && !hasSearched && mapReady) {
      fetchVenues(currentBounds);
    }
  }, [currentBounds, hasSearched, mapReady, fetchVenues]);

  // Handle refresh
  const handleRefresh = () => {
    if (currentBounds) {
      fetchVenues(currentBounds);
    }
  };

  // Search for locations AND database venues
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || !mapboxToken) return;
    
    setSearchLoading(true);
    try {
      // Search both Mapbox places AND database venues in parallel
      const [mapboxResponse, dbVenueResults] = await Promise.all([
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place,region,country,locality&limit=5`
        ),
        // Search database venues
        supabase
          .from('venues')
          .select('id, name, slug, city, country, latitude, longitude, category')
          .ilike('name', `%${query}%`)
          .not('latitude', 'is', null)
          .limit(5)
      ]);
      
      const mapboxData = await mapboxResponse.json();
      
      // Format database venues to match mapbox result structure
      const dbResults = (dbVenueResults.data || []).map((venue: any) => ({
        id: `db-venue-${venue.id}`,
        place_name: `${venue.name} - ${venue.city}, ${venue.country}`,
        center: [Number(venue.longitude), Number(venue.latitude)],
        place_type: ['venue'],
        isDbVenue: true,
        slug: venue.slug,
        venueType: 'venue',
        category: venue.category,
      }));
      
      // Combine results: database venues first, then mapbox places
      const combinedResults = [...dbResults, ...(mapboxData.features || [])];
      setSearchResults(combinedResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, [mapboxToken]);

  // Debounced search using useRef for timeout
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(query);
    }, 300);
  }, [searchLocation]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length >= 2) {
      debouncedSearch(value);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle search result click
  const handleResultClick = (result: any) => {
    if (!map.current) return;

    const center = Array.isArray(result?.center) ? result.center : null;
    const [lng, lat] = (center?.length === 2 ? center : [null, null]) as [number | null, number | null];
    if (lng == null || lat == null) return;

    const placeTypes = Array.isArray(result?.place_type) ? result.place_type : [];
    
    // If it's a database venue, zoom in closer
    const isDbVenue = result?.isDbVenue === true;

    map.current.flyTo({
      center: [lng, lat],
      zoom: isDbVenue ? 16 : (placeTypes.includes('country') ? 5 : 10),
      pitch: 45,
      duration: 2000,
    });

    const placeName = typeof result?.place_name === 'string' || typeof result?.place_name === 'number'
      ? String(result.place_name)
      : '';

    setSearchQuery(placeName);
    setShowSearchResults(false);
  };

  if (tokenLoading) {
    return (
      <div className={`relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-[#1a1a2e] flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <span className="text-purple-300">Loading map...</span>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className={`relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-[#1a1a2e] flex items-center justify-center ${className}`}>
        <div className="text-center p-8 max-w-md">
          {tokenError ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Map Loading Failed</h3>
              <p className="text-purple-300 mb-6">{tokenError}</p>
              <motion.button
                onClick={fetchToken}
                disabled={tokenLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-medium shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tokenLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                Retry
              </motion.button>
            </>
          ) : (
            <>
              <Wine className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Map Configuration Required</h3>
              <p className="text-purple-300 mb-6">Mapbox token is not configured in the backend.</p>
              <motion.button
                onClick={fetchToken}
                disabled={tokenLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-medium shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tokenLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                Retry
              </motion.button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden ${className}`}>
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-20 z-10">
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {searchLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            ) : (
              <Search className="w-5 h-5 text-purple-400" />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            placeholder="Search location (city, region, country...)"
            className="w-full pl-12 pr-10 py-3 bg-[#1a1a2e]/90 backdrop-blur-md border border-purple-500/30 rounded-xl text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="w-4 h-4 text-purple-400 hover:text-white transition-colors" />
            </button>
          )}

          {/* Search Results */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e]/95 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden shadow-xl"
              >
                {searchResults.map((result, index) => {
                  const key = typeof result?.id === 'string' || typeof result?.id === 'number'
                    ? String(result.id)
                    : `sr-${index}`;

                  const isDbVenue = result?.isDbVenue === true;
                  
                  const text = isDbVenue 
                    ? result?.place_name?.split(' - ')[0] || ''
                    : (typeof result?.text === 'string' || typeof result?.text === 'number'
                      ? String(result.text)
                      : '');

                  const placeName = typeof result?.place_name === 'string' || typeof result?.place_name === 'number'
                    ? String(result.place_name)
                    : '';

                  return (
                    <button
                      key={key}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-500/20 transition-colors flex items-center gap-3 border-b border-purple-500/10 last:border-b-0"
                    >
                      {isDbVenue ? (
                        <Wine className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium flex items-center gap-2">
                          {text}
                          {isDbVenue && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                              ✓ Verified Venue
                            </span>
                          )}
                        </div>
                        <div className="text-purple-300/60 text-xs">{isDbVenue ? placeName.split(' - ')[1] : placeName}</div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category Filter */}
      <div className="absolute top-20 left-4 z-10">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          venueCounts={venueCounts}
        />
      </div>

      {/* Loading Indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-20 z-10 bg-[#1a1a2e]/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg flex items-center gap-2 border border-purple-500/30"
          >
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-sm text-purple-300">Loading venues...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <motion.button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-full shadow-lg shadow-purple-500/30 flex items-center gap-3 font-medium disabled:opacity-50 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          Search this area
        </motion.button>
        
        {(hasSearched || dbVenues.length > 0) && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg text-xs text-purple-300 flex items-center gap-3 border border-purple-500/20"
          >
            <span>{filteredVenues.length} natural wine venues found</span>
            {dbVenues.length > 0 && (
              <span className="flex items-center gap-1 text-purple-400">
                <Database className="w-3 h-3" />
                {dbVenues.length} verified
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Empty state */}
      {hasSearched && !loading && allVenues.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a2e]/95 backdrop-blur-md rounded-2xl p-8 shadow-xl text-center max-w-xs pointer-events-auto border border-purple-500/20"
          >
            <Wine className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">No venues found</h3>
            <p className="text-sm text-purple-300">
              Try zooming out or moving to a different area to discover wine venues.
            </p>
          </motion.div>
        </div>
      )}

      {/* Custom Mapbox popup styles */}
      <style>{`
        .mapboxgl-popup-content {
          background: white;
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .mapboxgl-popup-tip {
          border-top-color: white;
        }
        .mapboxgl-popup-close-button {
          font-size: 18px;
          padding: 4px 8px;
          color: #666;
        }
        .mapboxgl-popup-close-button:hover {
          color: #1a1a2e;
          background: transparent;
        }
        .mapboxgl-ctrl-group {
          background: rgba(26, 26, 46, 0.9) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
          border-color: rgba(139, 92, 246, 0.2) !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: rgba(139, 92, 246, 0.2) !important;
        }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon {
          filter: invert(1) brightness(0.8);
        }
        .wine-marker {
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default MapboxMap;
