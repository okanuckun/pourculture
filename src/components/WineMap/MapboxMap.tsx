import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Wine, Database, Search, MapPin, X } from 'lucide-react';

import { WineVenue, WineVenueCategory, MapBounds, CATEGORY_CONFIG } from './types';
import { fetchWineVenuesFromOSM, debounce } from './overpassApi';
import { fetchAllDatabaseVenues } from './databaseApi';
import { CategoryFilter } from './CategoryFilter';
import { supabase } from '@/integrations/supabase/client';

interface MapboxMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Dark wine-themed map style
const CUSTOM_STYLE: mapboxgl.Style = {
  version: 8,
  name: 'Wine Dark',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  sprite: 'mapbox://sprites/mapbox/streets-v12',
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#1a1a2e',
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#16213e',
        'fill-opacity': 0.8,
      },
    },
    {
      id: 'landuse',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      paint: {
        'fill-color': [
          'match',
          ['get', 'class'],
          'park', '#1f3a3d',
          'grass', '#1f3a3d',
          'cemetery', '#1a2634',
          '#1a1a2e',
        ],
        'fill-opacity': 0.6,
      },
    },
    {
      id: 'land',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'land',
      paint: {
        'fill-color': '#1a1a2e',
      },
    },
    {
      id: 'road-simple',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      filter: ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'street'],
      paint: {
        'line-color': '#2a2a4e',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5, 0.5,
          10, 1,
          15, 3,
        ],
        'line-opacity': 0.8,
      },
    },
    {
      id: 'building',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-color': '#252547',
        'fill-opacity': 0.8,
      },
    },
    {
      id: 'building-outline',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'line-color': '#3a3a6e',
        'line-width': 0.5,
        'line-opacity': 0.5,
      },
    },
    {
      id: 'admin-boundaries',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'admin',
      filter: ['>=', 'admin_level', 3],
      paint: {
        'line-color': '#4a2c4a',
        'line-width': 1,
        'line-dasharray': [2, 2],
        'line-opacity': 0.5,
      },
    },
    {
      id: 'country-label',
      type: 'symbol',
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      filter: ['==', 'class', 'country'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 3, 12, 6, 16],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#8b5cf6',
        'text-halo-color': '#1a1a2e',
        'text-halo-width': 1.5,
        'text-opacity': 0.9,
      },
    },
    {
      id: 'city-label',
      type: 'symbol',
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      filter: ['in', 'class', 'city', 'town'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Regular', 'Arial Unicode MS Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 6, 10, 12, 14],
      },
      paint: {
        'text-color': '#a78bfa',
        'text-halo-color': '#1a1a2e',
        'text-halo-width': 1,
        'text-opacity': 0.85,
      },
    },
  ],
};

export const MapboxMap: React.FC<MapboxMapProps> = ({
  className = '',
  initialCenter = [2.2137, 46.2276], // [lng, lat] for Mapbox
  initialZoom = 5,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [osmVenues, setOsmVenues] = useState<WineVenue[]>([]);
  const [dbVenues, setDbVenues] = useState<WineVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<WineVenueCategory>('all');
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      } finally {
        setTokenLoading(false);
      }
    };
    fetchToken();
  }, []);

  // Load database venues on mount
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: CUSTOM_STYLE,
      center: initialCenter,
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
  }, [mapboxToken, initialCenter, initialZoom]);

  // Combine OSM and database venues
  const allVenues = useMemo(() => {
    const combined = [...dbVenues];
    
    osmVenues.forEach(osmVenue => {
      const isDuplicate = dbVenues.some(dbVenue => {
        const latDiff = Math.abs(osmVenue.lat - dbVenue.lat);
        const lngDiff = Math.abs(osmVenue.lng - dbVenue.lng);
        return latDiff < 0.001 && lngDiff < 0.001;
      });
      
      if (!isDuplicate) {
        combined.push(osmVenue);
      }
    });
    
    return combined;
  }, [osmVenues, dbVenues]);

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
        <div style="
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
          transition: all 0.3s ease;
        ">
          ${config.icon}
        </div>
      `;

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.zIndex = '1000';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

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
          ${venue.website ? `
            <a href="${venue.website.startsWith('http') ? venue.website : `https://${venue.website}`}" 
               target="_blank" 
               rel="noopener noreferrer"
               style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #8b5cf6; margin-top: 8px;">
              🔗 Website
            </a>
          ` : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([venue.lng, venue.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [filteredVenues, mapReady]);

  // Fetch OSM venues
  const fetchVenues = useCallback(async (bounds: MapBounds) => {
    setLoading(true);
    try {
      const venues = await fetchWineVenuesFromOSM(bounds);
      setOsmVenues(venues);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch OSM venues when bounds are first set
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

  // Search for locations
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || !mapboxToken) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place,region,country,locality&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, [mapboxToken]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => searchLocation(query), 300),
    [searchLocation]
  );

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
    
    const [lng, lat] = result.center;
    map.current.flyTo({
      center: [lng, lat],
      zoom: result.place_type.includes('country') ? 5 : 10,
      pitch: 45,
      duration: 2000,
    });
    
    setSearchQuery(result.place_name);
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
        <div className="text-center p-8">
          <Wine className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Map Configuration Required</h3>
          <p className="text-purple-300">Mapbox token is not configured.</p>
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
                {searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-purple-500/20 transition-colors flex items-center gap-3 border-b border-purple-500/10 last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div>
                      <div className="text-white text-sm font-medium">{result.text}</div>
                      <div className="text-purple-300/60 text-xs">{result.place_name}</div>
                    </div>
                  </button>
                ))}
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
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
            <span>{filteredVenues.length} venues found</span>
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
