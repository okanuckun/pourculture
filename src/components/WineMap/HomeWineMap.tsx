import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, MapPin, X, Wine, Compass } from 'lucide-react';
import { toast } from 'sonner';

import { WineVenue, WineVenueCategory, MapBounds, CATEGORY_CONFIG } from './types';
import { fetchWineVenuesFromGoogle } from './googlePlacesApi';
import { fetchAllDatabaseVenues } from './databaseApi';
import { supabase } from '@/integrations/supabase/client';

interface HomeWineMapProps {
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [2.3522, 48.8566]; // Paris [lng, lat]
const TOKEN_FETCH_TIMEOUT = 10000;

export const HomeWineMap: React.FC<HomeWineMapProps> = ({ className = '' }) => {
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
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch Mapbox token
  const fetchToken = useCallback(async () => {
    setTokenLoading(true);
    setTokenError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
        body: {},
      });
      
      if (error) throw new Error(error.message || 'Failed to fetch token');
      if (!data?.token) throw new Error('Token not configured');
      
      setMapboxToken(data.token);
      setTokenError(null);
    } catch (error: any) {
      console.error('Error fetching Mapbox token:', error);
      setTokenError(error.message || 'Failed to load map');
      toast.error('Map Loading Error', {
        description: error.message,
        duration: 5000,
      });
    } finally {
      setTokenLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Load database venues
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
  }, []);

  // Initialize map with vintage style
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: DEFAULT_CENTER,
      zoom: 4,
      pitch: 30,
      bearing: 0,
      antialias: true,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'bottom-right'
    );

    map.current.on('style.load', () => {
      // Apply vintage color scheme
      if (map.current) {
        // Warm sepia-like fog for vintage feel
        map.current.setFog({
          color: 'rgb(255, 248, 235)',
          'high-color': 'rgb(245, 235, 215)',
          'horizon-blend': 0.08,
          'space-color': 'rgb(245, 235, 215)',
          'star-intensity': 0,
        });

        // Adjust water color to vintage blue
        if (map.current.getLayer('water')) {
          map.current.setPaintProperty('water', 'fill-color', '#c4d9e8');
        }
      }
      setMapReady(true);

      if (map.current) {
        const bounds = map.current.getBounds();
        setCurrentBounds({
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast(),
        });
      }
    });

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
  }, [mapboxToken]);

  // Combine venues
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

  // Update markers
  useEffect(() => {
    if (!map.current || !mapReady) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    allVenues.forEach(venue => {
      const config = CATEGORY_CONFIG[venue.category];
      
      const el = document.createElement('div');
      el.className = 'vintage-wine-marker';
      el.innerHTML = `
        <div class="marker-pin" style="
          background: linear-gradient(180deg, ${config.color}, ${config.color}cc);
          width: 32px;
          height: 42px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 2px;
          font-size: 16px;
          box-shadow: 
            0 3px 10px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.3);
          border: 2px solid rgba(255,255,255,0.8);
          cursor: pointer;
          transition: transform 0.2s ease;
          position: relative;
        ">
          ${config.icon}
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${config.color}cc;
          "></div>
        </div>
      `;

      const inner = el.querySelector('.marker-pin') as HTMLDivElement | null;
      el.addEventListener('mouseenter', () => {
        if (inner) inner.style.transform = 'scale(1.2) translateY(-5px)';
        el.style.zIndex = '1000';
      });
      el.addEventListener('mouseleave', () => {
        if (inner) inner.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

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

      const popup = new mapboxgl.Popup({
        offset: 30,
        closeButton: true,
        closeOnClick: false,
        className: 'vintage-popup',
      }).setHTML(`
        <div style="
          padding: 12px; 
          min-width: 220px; 
          max-width: 300px;
          background: linear-gradient(180deg, #fffbf5, #f8f0e3);
          font-family: 'Georgia', serif;
        ">
          <div style="
            display: flex; 
            gap: 6px; 
            margin-bottom: 10px;
            border-bottom: 1px solid #d4c4a8;
            padding-bottom: 8px;
          ">
            <span style="
              padding: 3px 10px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 500;
              color: white;
              background: ${config.color};
              font-family: sans-serif;
            ">
              ${config.icon} ${config.label}
            </span>
            ${venue.source === 'database' ? `
              <span style="
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 500;
                color: #8b5cf6;
                background: rgba(139, 92, 246, 0.1);
                font-family: sans-serif;
              ">
                ✓ Verified
              </span>
            ` : ''}
          </div>
          <h3 style="
            font-weight: 700; 
            color: #3d2914; 
            font-size: 16px; 
            margin-bottom: 8px;
            font-family: 'Georgia', serif;
          ">
            ${venue.name}
          </h3>
          ${venue.address ? `
            <div style="
              display: flex; 
              align-items: flex-start; 
              gap: 6px; 
              font-size: 12px; 
              color: #6b5a47;
              margin-bottom: 6px;
            ">
              <span>📍</span>
              <span>${venue.address}${venue.city ? `, ${venue.city}` : ''}</span>
            </div>
          ` : ''}
          <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
            ${detailUrl ? `
              <a href="${detailUrl}" 
                 style="
                   display: inline-flex; 
                   align-items: center; 
                   gap: 4px; 
                   font-size: 12px; 
                   color: white; 
                   background: #8b5cf6;
                   padding: 6px 14px; 
                   border-radius: 20px; 
                   text-decoration: none; 
                   font-weight: 500;
                   font-family: sans-serif;
                 ">
                View Details
              </a>
            ` : ''}
            ${!detailUrl && venue.source === 'google' && venue.googlePlaceId ? `
              <a href="/place/google/${venue.googlePlaceId.replace('google_', '')}" 
                 style="
                   display: inline-flex; 
                   align-items: center; 
                   gap: 4px; 
                   font-size: 12px; 
                   color: white; 
                   background: #8b5cf6;
                   padding: 6px 14px; 
                   border-radius: 20px; 
                   text-decoration: none; 
                   font-weight: 500;
                   font-family: sans-serif;
                 ">
                View Details
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
  }, [allVenues, mapReady]);

  // Fetch venues
  const fetchVenues = useCallback(async (bounds: MapBounds) => {
    setLoading(true);
    try {
      const centerLat = (bounds.north + bounds.south) / 2;
      const centerLng = (bounds.east + bounds.west) / 2;
      
      const latDiff = bounds.north - bounds.south;
      const lngDiff = bounds.east - bounds.west;
      const radiusKm = Math.max(latDiff, lngDiff) * 111 / 2;
      const radiusM = Math.min(Math.max(radiusKm * 1000, 1000), 50000);
      
      const venues = await fetchWineVenuesFromGoogle(centerLat, centerLng, radiusM, true);
      setGoogleVenues(venues);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search functionality
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || !mapboxToken) return;
    
    setSearchLoading(true);
    try {
      const [mapboxResponse, dbVenueResults] = await Promise.all([
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place,region,country,locality&limit=5`
        ),
        supabase
          .from('venues')
          .select('id, name, slug, city, country, latitude, longitude, category')
          .ilike('name', `%${query}%`)
          .not('latitude', 'is', null)
          .limit(5)
      ]);
      
      const mapboxData = await mapboxResponse.json();
      
      const dbResults = (dbVenueResults.data || []).map((venue: any) => ({
        id: `db-venue-${venue.id}`,
        place_name: `${venue.name} - ${venue.city}, ${venue.country}`,
        center: [Number(venue.longitude), Number(venue.latitude)],
        place_type: ['venue'],
        isDbVenue: true,
        slug: venue.slug,
      }));
      
      const combinedResults = [...dbResults, ...(mapboxData.features || [])];
      setSearchResults(combinedResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, [mapboxToken]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => searchLocation(value), 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleResultClick = (result: any) => {
    if (!map.current) return;
    const [lng, lat] = result.center;
    
    const zoomLevel = result.isDbVenue ? 15 : 
      result.place_type?.includes('country') ? 5 :
      result.place_type?.includes('region') ? 8 : 12;
    
    map.current.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      duration: 2000,
      essential: true,
    });
    
    setShowSearchResults(false);
    setSearchQuery('');
    
    setTimeout(() => {
      if (currentBounds) fetchVenues(currentBounds);
    }, 2500);
  };

  // Render loading state
  if (tokenLoading) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`} style={{ background: 'linear-gradient(180deg, #f8f0e3, #e8dcc8)' }}>
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <Compass className="w-16 h-16 text-amber-700 animate-pulse" />
          </div>
          <p className="text-amber-800 font-serif text-lg">Loading the wine map...</p>
        </motion.div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`} style={{ background: 'linear-gradient(180deg, #f8f0e3, #e8dcc8)' }}>
        <motion.div 
          className="flex flex-col items-center gap-4 text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Wine className="w-16 h-16 text-amber-600" />
          <p className="text-amber-800 font-serif">Could not load the map</p>
          <button 
            onClick={fetchToken}
            className="px-6 py-2 bg-amber-700 text-white rounded-full font-medium hover:bg-amber-800 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
      {/* Vintage paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(139, 90, 43, 0.15) 100%)',
      }} />

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-20">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {searchLoading ? (
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search wine venues & locations..."
            className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-amber-200 bg-amber-50/95 backdrop-blur-sm text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-lg font-medium"
            style={{ fontFamily: 'Georgia, serif' }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="w-5 h-5 text-amber-500 hover:text-amber-700" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {showSearchResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full bg-amber-50/98 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border-2 border-amber-200"
            >
              {searchResults.map((result: any, index: number) => (
                <button
                  key={result.id || index}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-amber-100 transition-colors text-left border-b border-amber-100 last:border-b-0"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    result.isDbVenue ? 'bg-purple-100' : 'bg-amber-100'
                  }`}>
                    {result.isDbVenue ? (
                      <Wine className="w-4 h-4 text-purple-600" />
                    ) : (
                      <MapPin className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900 truncate" style={{ fontFamily: 'Georgia, serif' }}>
                      {result.place_name?.split(',')[0]}
                    </p>
                    <p className="text-xs text-amber-600 truncate">
                      {result.isDbVenue ? 'Verified venue' : result.place_name?.split(',').slice(1).join(',').trim()}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-20 right-4 z-20 bg-amber-50/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2 border border-amber-200"
          >
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span className="text-sm text-amber-800 font-serif">Discovering venues...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search this area button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <motion.button
          onClick={() => currentBounds && fetchVenues(currentBounds)}
          disabled={loading}
          className="px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium disabled:opacity-50 border-2 border-amber-300"
          style={{ 
            background: 'linear-gradient(180deg, #d97706, #b45309)',
            color: 'white',
            fontFamily: 'Georgia, serif',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          Search this area
        </motion.button>
        
        {allVenues.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50/95 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg text-sm text-amber-800 flex items-center gap-2 border border-amber-200"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <Wine className="w-4 h-4 text-amber-600" />
            <span>{allVenues.length} wine venues discovered</span>
          </motion.div>
        )}
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Decorative compass rose */}
      <div className="absolute bottom-6 right-4 z-10 opacity-20 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" stroke="#8b5a2b" strokeWidth="2" />
          <path d="M50 10 L55 45 L50 50 L45 45 Z" fill="#8b5a2b" />
          <path d="M50 90 L55 55 L50 50 L45 55 Z" fill="#d4a574" />
          <path d="M10 50 L45 45 L50 50 L45 55 Z" fill="#d4a574" />
          <path d="M90 50 L55 45 L50 50 L55 55 Z" fill="#8b5a2b" />
          <text x="50" y="8" textAnchor="middle" fontSize="10" fill="#8b5a2b">N</text>
        </svg>
      </div>

      {/* Custom styles */}
      <style>{`
        .vintage-popup .mapboxgl-popup-content {
          border-radius: 16px;
          padding: 0;
          background: transparent;
          box-shadow: 0 4px 20px rgba(139, 90, 43, 0.3);
          border: 2px solid #d4c4a8;
        }
        .vintage-popup .mapboxgl-popup-tip {
          border-top-color: #f8f0e3;
        }
        .mapboxgl-ctrl-group {
          background: #f8f0e3 !important;
          border: 2px solid #d4c4a8 !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-group button {
          background: #f8f0e3 !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: #e8dcc8 !important;
        }
        .mapboxgl-ctrl-group button + button {
          border-top: 1px solid #d4c4a8 !important;
        }
      `}</style>
    </div>
  );
};

export default HomeWineMap;
