import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Wine, Database } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import { WineVenue, WineVenueCategory, MapBounds } from './types';
import { fetchWineVenuesFromOSM, debounce } from './overpassApi';
import { fetchAllDatabaseVenues } from './databaseApi';
import { VenueMarker } from './VenueMarker';
import { CategoryFilter } from './CategoryFilter';

// Fix Leaflet default icon issue
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapEventsHandlerProps {
  onBoundsChange: (bounds: MapBounds) => void;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
  });
  
  return null;
};

interface WineMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export const WineMap: React.FC<WineMapProps> = ({
  className = '',
  initialCenter = [46.2276, 2.2137], // France center
  initialZoom = 5,
}) => {
  const [osmVenues, setOsmVenues] = useState<WineVenue[]>([]);
  const [dbVenues, setDbVenues] = useState<WineVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<WineVenueCategory>('all');
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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

  // Combine OSM and database venues
  const allVenues = useMemo(() => {
    // Database venues take priority (shown first, unique by location)
    const combined = [...dbVenues];
    
    // Add OSM venues that don't overlap with database venues
    osmVenues.forEach(osmVenue => {
      const isDuplicate = dbVenues.some(dbVenue => {
        // Check if venues are within ~100m of each other
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

  // Calculate venue counts by category
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

  // Filter venues by selected category
  const filteredVenues = useMemo(() => {
    if (selectedCategory === 'all') return allVenues;
    return allVenues.filter(v => v.category === selectedCategory);
  }, [allVenues, selectedCategory]);

  // Fetch OSM venues when bounds change
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

  // Debounced fetch
  const debouncedFetch = useMemo(
    () => debounce((bounds: MapBounds) => fetchVenues(bounds), 500),
    [fetchVenues]
  );

  // Handle bounds change
  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setCurrentBounds(bounds);
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    if (currentBounds) {
      fetchVenues(currentBounds);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden ${className}`}>
      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        venueCounts={venueCounts}
      />

      {/* Loading Indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-gray-600">Loading venues...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2">
        <motion.button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium disabled:opacity-50"
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
            className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow text-xs text-gray-600 flex items-center gap-2"
          >
            <span>{filteredVenues.length} venues found</span>
            {dbVenues.length > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <Database className="w-3 h-3" />
                {dbVenues.length} from database
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full"
        style={{ background: '#f8f4f0' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventsHandler onBoundsChange={handleBoundsChange} />
        
        {filteredVenues.map(venue => (
          <VenueMarker key={venue.id} venue={venue} />
        ))}
      </MapContainer>

      {/* Empty state */}
      {hasSearched && !loading && allVenues.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-center max-w-xs pointer-events-auto"
          >
            <Wine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No venues found</h3>
            <p className="text-sm text-gray-500">
              Try zooming out or moving to a different area to discover wine venues.
            </p>
          </motion.div>
        </div>
      )}

      {/* Custom styles for markers */}
      <style>{`
        .custom-wine-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-wine-marker > div:hover {
          transform: scale(1.15);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 8px;
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default WineMap;
