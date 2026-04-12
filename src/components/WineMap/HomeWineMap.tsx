import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, MapPin, X, Wine, Compass, Filter, Check, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { WineVenue, WineVenueCategory, MapBounds, CATEGORY_CONFIG, WineFairMarker } from './types';
import { fetchWineVenuesFromGoogle } from './googlePlacesApi';
import { fetchAllDatabaseVenues } from './databaseApi';
import { VenueDetailPanel } from './VenueDetailPanel';
import { supabase } from '@/integrations/supabase/client';
import { GoogleAttribution } from '@/components/GoogleAttribution';

interface HomeWineMapProps {
  className?: string;
  minimalStyle?: boolean;
  filterCategories?: WineVenueCategory[];
  wineFairs?: WineFairMarker[];
  showEvents?: boolean;
}

const DEFAULT_CENTER: [number, number] = [2.3522, 48.8566]; // Paris [lng, lat]
const TOKEN_FETCH_TIMEOUT = 10000;

export const HomeWineMap: React.FC<HomeWineMapProps> = ({ className = '', minimalStyle = false, filterCategories, wineFairs = [], showEvents = false }) => {
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
  
  // Venue detail panel state
  const [selectedVenue, setSelectedVenue] = useState<WineVenue | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<WineVenueCategory[]>(['wine_shop', 'wine_bar', 'winery', 'restaurant']);

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

  // Load database venues — initial load with limit, refetched on bounds change
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  useEffect(() => {
    const loadDbVenues = async () => {
      setDbLoading(true);
      try {
        const venues = await fetchAllDatabaseVenues(mapBounds || undefined);
        setDbVenues(venues);
      } catch (error) {
        console.error('Error loading database venues:', error);
      } finally {
        setDbLoading(false);
      }
    };
    loadDbVenues();
  }, [mapBounds]);

  // Fetch venues - moved up to be used by getUserLocationAndSearch
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

  // Get user location and auto-search
  const getUserLocationAndSearch = useCallback(() => {
    if (!map.current || !mapReady) return;
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 13,
            duration: 2000,
            essential: true,
          });
          
          // Auto-search after flying to user location
          map.current?.once('moveend', () => {
            if (!map.current) return;
            const bounds = map.current.getBounds();
            const newBounds = {
              south: bounds.getSouth(),
              west: bounds.getWest(),
              north: bounds.getNorth(),
              east: bounds.getEast(),
            };
            setCurrentBounds(newBounds);
            fetchVenues(newBounds);
          });
          
          // Location detected - silently search without notification
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          // If user denies or error occurs, just search the default area
          if (currentBounds) {
            fetchVenues(currentBounds);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    } else {
      // Geolocation not supported, search default area
      if (currentBounds) {
        fetchVenues(currentBounds);
      }
    }
  }, [mapReady, currentBounds, fetchVenues]);

  // Initialize map with style based on minimalStyle prop
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Choose style based on minimalStyle prop
    const mapStyle = minimalStyle 
      ? 'mapbox://styles/mapbox/light-v11' 
      : 'mapbox://styles/mapbox/outdoors-v12';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: DEFAULT_CENTER,
      zoom: 4,
      pitch: minimalStyle ? 0 : 30,
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

    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: false,
      showUserHeading: false,
      showUserLocation: true,
    });
    map.current.addControl(geolocateControl, 'bottom-right');

    map.current.on('style.load', () => {
      if (map.current) {
        if (minimalStyle) {
          // Minimal white/clean style - no fog
          map.current.setFog({
            color: 'rgb(255, 255, 255)',
            'high-color': 'rgb(255, 255, 255)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(255, 255, 255)',
            'star-intensity': 0,
          });
        } else {
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

  // Auto-detect location and search on first load
  useEffect(() => {
    if (mapReady && !hasSearched) {
      getUserLocationAndSearch();
    }
  }, [mapReady, hasSearched, getUserLocationAndSearch]);

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

  // Filtered venues based on filters
  const filteredVenues = useMemo(() => {
    // If filterCategories is provided externally, use it; otherwise use internal selectedCategories
    const categoriesToFilter = filterCategories && filterCategories.length > 0 
      ? filterCategories 
      : selectedCategories;

    return allVenues.filter(venue => {
      // Filter by verified status
      if (showOnlyVerified && !venue.isClaimed) {
        return false;
      }
      // Filter by open status
      if (showOnlyOpen && venue.isOpen === false) {
        return false;
      }
      // Filter by category
      if (!categoriesToFilter.includes(venue.category)) {
        return false;
      }
      return true;
    });
  }, [allVenues, showOnlyVerified, showOnlyOpen, selectedCategories, filterCategories]);

  // Toggle category filter
  const toggleCategory = (category: WineVenueCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        // Don't allow removing all categories
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  // Handle venue click to open panel
  const handleVenueClick = useCallback((venue: WineVenue) => {
    setSelectedVenue(venue);
    setIsPanelOpen(true);
  }, []);

  // Update markers with clustering
  useEffect(() => {
    if (!map.current || !mapReady) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create Supercluster index
    const points: Supercluster.PointFeature<{ venue: WineVenue }>[] = filteredVenues.map((venue, i) => ({
      type: 'Feature' as const,
      properties: { venue },
      geometry: { type: 'Point' as const, coordinates: [venue.lng, venue.lat] },
      id: i,
    }));

    const cluster = new Supercluster<{ venue: WineVenue }>({
      radius: 60,
      maxZoom: 16,
    });
    cluster.load(points);

    const zoom = Math.floor(map.current.getZoom());
    const bounds = map.current.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()
    ];

    const clusters = cluster.getClusters(bbox, zoom);

    clusters.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties as any;
      const isCluster = props.cluster;

      if (isCluster) {
        const count = props.point_count;
        const clusterId = props.cluster_id;
        const size = count < 10 ? 36 : count < 50 ? 44 : 52;

        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.innerHTML = `
          <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: hsl(var(--primary));
            color: hsl(var(--primary-foreground, 0 0% 100%));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${size < 40 ? 13 : 15}px;
            font-weight: 700;
            border: 3px solid hsl(var(--background));
            box-shadow: 0 2px 10px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 0.2s ease;
            font-family: sans-serif;
          ">${count}</div>
        `;

        el.addEventListener('click', () => {
          const expansionZoom = Math.min(cluster.getClusterExpansionZoom(clusterId), 20);
          map.current?.flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
        });
        el.addEventListener('mouseenter', () => {
          const inner = el.firstElementChild as HTMLElement;
          if (inner) inner.style.transform = 'scale(1.15)';
        });
        el.addEventListener('mouseleave', () => {
          const inner = el.firstElementChild as HTMLElement;
          if (inner) inner.style.transform = 'scale(1)';
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      } else {
        // Individual venue marker (existing logic)
        const venue = feature.properties.venue;
        const config = CATEGORY_CONFIG[venue.category];
        const isVerified = venue.isClaimed === true;
        
        const el = document.createElement('div');
        el.className = minimalStyle ? 'minimal-wine-marker' : 'vintage-wine-marker';
        
        if (minimalStyle) {
          el.innerHTML = `
            <div class="marker-pin" style="
              background: ${isVerified ? '#000' : '#fff'};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              box-shadow: none;
              border: 2px solid #000;
              cursor: pointer;
              transition: transform 0.2s ease, background 0.2s ease;
              position: relative;
            ">
              <span style="filter: ${isVerified ? 'invert(1)' : 'none'};">${config.icon}</span>
            </div>
          `;
        } else {
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
                inset 0 1px 0 rgba(255,255,255,0.3)${isVerified ? ', 0 0 0 3px #f59e0b' : ''};
              border: 2px solid ${isVerified ? '#f59e0b' : 'rgba(255,255,255,0.8)'};
              cursor: pointer;
              transition: transform 0.2s ease;
              position: relative;
            ">
              ${config.icon}
              ${isVerified ? `
                <div style="
                  position: absolute;
                  top: -6px;
                  right: -6px;
                  width: 16px;
                  height: 16px;
                  background: #f59e0b;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  color: white;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">✓</div>
              ` : ''}
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
        }

        const inner = el.querySelector('.marker-pin') as HTMLDivElement | null;
        el.addEventListener('mouseenter', () => {
          if (inner) inner.style.transform = 'scale(1.2) translateY(-5px)';
          el.style.zIndex = '1000';
        });
        el.addEventListener('mouseleave', () => {
          if (inner) inner.style.transform = 'scale(1)';
          el.style.zIndex = '1';
        });

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          handleVenueClick(venue);
        });

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 30,
          closeButton: true,
          closeOnClick: true,
          className: 'vintage-popup',
        }).setHTML(`
          <div style="
            padding: 12px; 
            min-width: 200px; 
            max-width: 280px;
            background: linear-gradient(180deg, #fffbf5, #f8f0e3);
            font-family: 'Georgia', serif;
          ">
            <div style="
              display: flex; 
              gap: 6px; 
              margin-bottom: 8px;
              border-bottom: 1px solid #d4c4a8;
              padding-bottom: 6px;
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
              ${isVerified ? `
                <span style="
                  padding: 3px 10px;
                  border-radius: 20px;
                  font-size: 11px;
                  font-weight: 500;
                  color: #f59e0b;
                  background: rgba(245, 158, 11, 0.1);
                  font-family: sans-serif;
                ">
                  ✓ Verified
                </span>
              ` : `
                <span style="
                  padding: 3px 10px;
                  border-radius: 20px;
                  font-size: 11px;
                  font-weight: 500;
                  color: #6b7280;
                  background: rgba(107, 114, 128, 0.1);
                  font-family: sans-serif;
                ">
                  Unverified
                </span>
              `}
            </div>
            <h3 style="
              font-weight: 700; 
              color: #3d2914; 
              font-size: 15px; 
              margin-bottom: 6px;
              font-family: 'Georgia', serif;
            ">
              ${venue.name}
            </h3>
            ${venue.address ? `
              <div style="
                display: flex; 
                align-items: flex-start; 
                gap: 6px; 
                font-size: 11px; 
                color: #6b5a47;
                margin-bottom: 8px;
              ">
                <span>📍</span>
                <span>${venue.address}${venue.city ? `, ${venue.city}` : ''}</span>
              </div>
            ` : ''}
            <button 
              id="view-details-${venue.id}"
              style="
                width: 100%;
                display: flex; 
                align-items: center; 
                justify-content: center;
                gap: 4px; 
                font-size: 12px; 
                color: white; 
                background: #8b5cf6;
                padding: 8px 14px; 
                border-radius: 20px; 
                border: none;
                cursor: pointer;
                font-weight: 500;
                font-family: sans-serif;
              ">
              View Details
            </button>
          </div>
        `);

        popup.on('open', () => {
          const btn = document.getElementById(`view-details-${venue.id}`);
          if (btn) {
            btn.addEventListener('click', () => {
              popup.remove();
              handleVenueClick(venue);
            });
          }
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([venue.lng, venue.lat])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });

    // Add wine fair event markers if showEvents is true
    if (showEvents && wineFairs.length > 0) {
      const eventConfig = CATEGORY_CONFIG['event'];
      
      wineFairs.forEach(fair => {
        if (!fair.lat || !fair.lng) return;
        
        const el = document.createElement('div');
        el.className = minimalStyle ? 'minimal-event-marker' : 'vintage-event-marker';
        
        if (minimalStyle) {
          el.innerHTML = `
            <div class="marker-pin" style="
              background: #EC4899;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: none;
              border: 2px solid #000;
              cursor: pointer;
              transition: transform 0.2s ease, background 0.2s ease;
              position: relative;
            ">
              <span>${eventConfig.icon}</span>
            </div>
          `;
        } else {
          el.innerHTML = `
            <div class="marker-pin" style="
              background: linear-gradient(180deg, ${eventConfig.color}, ${eventConfig.color}cc);
              width: 36px;
              height: 46px;
              border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
              display: flex;
              align-items: center;
              justify-content: center;
              padding-top: 2px;
              font-size: 18px;
              box-shadow: 0 3px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
              border: 2px solid rgba(255,255,255,0.8);
              cursor: pointer;
              transition: transform 0.2s ease;
              position: relative;
            ">
              ${eventConfig.icon}
              <div style="
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid ${eventConfig.color}cc;
              "></div>
            </div>
          `;
        }

        const inner = el.querySelector('.marker-pin') as HTMLDivElement | null;
        el.addEventListener('mouseenter', () => {
          if (inner) inner.style.transform = 'scale(1.2) translateY(-5px)';
          el.style.zIndex = '1000';
        });
        el.addEventListener('mouseleave', () => {
          if (inner) inner.style.transform = 'scale(1)';
          el.style.zIndex = '1';
        });

        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        const popup = new mapboxgl.Popup({
          offset: 30,
          closeButton: true,
          closeOnClick: true,
          className: 'event-popup',
        }).setHTML(`
          <div style="
            padding: 12px; 
            min-width: 200px; 
            max-width: 280px;
            background: linear-gradient(180deg, #fdf2f8, #fce7f3);
            font-family: 'Georgia', serif;
          ">
            <div style="
              display: flex; 
              gap: 6px; 
              margin-bottom: 8px;
              border-bottom: 1px solid #f9a8d4;
              padding-bottom: 6px;
            ">
              <span style="
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 500;
                color: white;
                background: ${eventConfig.color};
                font-family: sans-serif;
              ">
                ${eventConfig.icon} Event
              </span>
            </div>
            <h3 style="
              font-size: 16px; 
              font-weight: 600; 
              margin: 0 0 6px 0;
              color: #1e1e1e;
            ">${fair.title}</h3>
            <p style="
              color: #666; 
              font-size: 12px; 
              margin: 4px 0;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              📅 ${formatDate(fair.startDate)}${fair.endDate ? ` - ${formatDate(fair.endDate)}` : ''}
            </p>
            <p style="
              color: #666; 
              font-size: 12px; 
              margin: 4px 0;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              📍 ${fair.city}, ${fair.country}
            </p>
            <a 
              href="/wine-fair/${fair.slug}"
              style="
                display: inline-block;
                margin-top: 10px;
                font-size: 12px;
                color: white; 
                background: ${eventConfig.color};
                padding: 8px 14px; 
                border-radius: 20px; 
                text-decoration: none;
                font-weight: 500;
                font-family: sans-serif;
              "
            >
              View Details
            </a>
          </div>
        `);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([fair.lng, fair.lat])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    }
  }, [filteredVenues, mapReady, handleVenueClick, minimalStyle, showEvents, wineFairs]);

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
    
    // Auto-search venues after flying to location
    map.current.once('moveend', () => {
      if (!map.current) return;
      const bounds = map.current.getBounds();
      const newBounds = {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      };
      setCurrentBounds(newBounds);
      fetchVenues(newBounds);
    });
  };

  // Render loading state
  if (tokenLoading) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`} style={{ background: minimalStyle ? '#fff' : 'linear-gradient(180deg, #f8f0e3, #e8dcc8)' }}>
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <Compass className={`w-16 h-16 animate-pulse ${minimalStyle ? 'text-foreground' : 'text-amber-700'}`} />
          </div>
          <p className={`text-lg ${minimalStyle ? 'font-grotesk text-foreground' : 'font-serif text-amber-800'}`}>Loading the wine map...</p>
        </motion.div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`} style={{ background: minimalStyle ? '#fff' : 'linear-gradient(180deg, #f8f0e3, #e8dcc8)' }}>
        <motion.div 
          className="flex flex-col items-center gap-4 text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Wine className={`w-16 h-16 ${minimalStyle ? 'text-foreground' : 'text-amber-600'}`} />
          <p className={minimalStyle ? 'font-grotesk text-foreground' : 'font-serif text-amber-800'}>Could not load the map</p>
          <button 
            onClick={fetchToken}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              minimalStyle 
                ? 'bg-foreground text-background hover:bg-foreground/90' 
                : 'bg-amber-700 text-white hover:bg-amber-800'
            }`}
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${minimalStyle ? '' : 'rounded-2xl'} ${className}`}>
      {/* Texture overlays - only for vintage style */}
      {!minimalStyle && (
        <>
          {/* Vintage paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }} />
          
          {/* Vignette effect */}
          <div className="absolute inset-0 pointer-events-none z-10" style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(139, 90, 43, 0.15) 100%)',
          }} />
        </>
      )}

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-20">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {searchLoading ? (
              <Loader2 className={`w-5 h-5 animate-spin ${minimalStyle ? 'text-foreground' : 'text-amber-600'}`} />
            ) : (
              <Search className={`w-5 h-5 ${minimalStyle ? 'text-foreground' : 'text-amber-600'}`} />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search wine venues & locations..."
            className={`w-full pl-12 pr-4 py-3 shadow-lg font-medium ${
              minimalStyle 
                ? 'rounded-none border-2 border-foreground bg-background text-foreground placeholder-muted-foreground focus:outline-none' 
                : 'rounded-full border-2 border-amber-200 bg-amber-50/95 backdrop-blur-sm text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400'
            }`}
            style={{ fontFamily: minimalStyle ? 'Space Grotesk, sans-serif' : 'Georgia, serif' }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className={`w-5 h-5 ${minimalStyle ? 'text-muted-foreground hover:text-foreground' : 'text-amber-500 hover:text-amber-700'}`} />
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
              className={`absolute top-full mt-2 w-full shadow-xl overflow-hidden ${
                minimalStyle 
                  ? 'bg-background border-2 border-foreground' 
                  : 'bg-amber-50/98 backdrop-blur-lg rounded-2xl border-2 border-amber-200'
              }`}
            >
              {searchResults.map((result: any, index: number) => (
                <button
                  key={result.id || index}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left last:border-b-0 ${
                    minimalStyle 
                      ? 'hover:bg-muted border-b border-foreground/20' 
                      : 'hover:bg-amber-100 border-b border-amber-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    minimalStyle 
                      ? (result.isDbVenue ? 'bg-foreground text-background' : 'border-2 border-foreground')
                      : (result.isDbVenue ? 'bg-purple-100' : 'bg-amber-100')
                  }`}>
                    {result.isDbVenue ? (
                      <Wine className={`w-4 h-4 ${minimalStyle ? '' : 'text-purple-600'}`} />
                    ) : (
                      <MapPin className={`w-4 h-4 ${minimalStyle ? 'text-foreground' : 'text-amber-600'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${minimalStyle ? 'text-foreground' : 'text-amber-900'}`} style={{ fontFamily: minimalStyle ? 'Space Grotesk, sans-serif' : 'Georgia, serif' }}>
                      {result.place_name?.split(',')[0]}
                    </p>
                    <p className={`text-xs truncate ${minimalStyle ? 'text-muted-foreground' : 'text-amber-600'}`}>
                      {result.isDbVenue ? 'Verified venue' : result.place_name?.split(',').slice(1).join(',').trim()}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Panel */}
      <div className="absolute top-20 left-4 z-20">
        <div className="flex flex-col gap-2">
          {/* Filter Toggle Button */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 shadow-lg flex items-center gap-2 font-medium transition-colors ${
              minimalStyle 
                ? `border-2 border-foreground ${showFilters || showOnlyVerified || showOnlyOpen || selectedCategories.length < 4 ? 'bg-foreground text-background' : 'bg-background text-foreground'}`
                : `rounded-full border-2 ${showFilters || showOnlyVerified || showOnlyOpen || selectedCategories.length < 4 ? 'bg-amber-600 text-white border-amber-500' : 'bg-amber-50/95 text-amber-800 border-amber-200'}`
            }`}
            style={{ fontFamily: minimalStyle ? 'Space Grotesk, sans-serif' : 'Georgia, serif' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
            {(showOnlyVerified || showOnlyOpen || selectedCategories.length < 4) && (
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                minimalStyle ? 'bg-background text-foreground border border-foreground' : 'bg-white text-amber-600'
              }`}>
                {(showOnlyVerified ? 1 : 0) + (showOnlyOpen ? 1 : 0) + (4 - selectedCategories.length)}
              </span>
            )}
          </motion.button>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={`shadow-xl overflow-hidden p-3 ${
                  minimalStyle 
                    ? 'bg-background border-2 border-foreground' 
                    : 'bg-amber-50/98 backdrop-blur-lg rounded-xl border-2 border-amber-200'
                }`}
              >
                {/* Verified Only Toggle */}
                <button
                  onClick={() => setShowOnlyVerified(!showOnlyVerified)}
                  className={`w-full px-3 py-2.5 flex items-center gap-2.5 transition-colors mb-2 ${
                    minimalStyle
                      ? `border border-foreground/20 ${showOnlyVerified ? 'bg-foreground text-background' : 'bg-background hover:bg-muted text-foreground'}`
                      : `rounded-lg ${showOnlyVerified ? 'bg-amber-500 text-white' : 'bg-white hover:bg-amber-100 text-amber-800'}`
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm font-medium flex-1 text-left">Verified Only</span>
                  {showOnlyVerified && <Check className="w-4 h-4" />}
                </button>

                {/* Open Now Toggle */}
                <button
                  onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                  className={`w-full px-3 py-2.5 flex items-center gap-2.5 transition-colors mb-2 ${
                    minimalStyle
                      ? `border border-foreground/20 ${showOnlyOpen ? 'bg-foreground text-background' : 'bg-background hover:bg-muted text-foreground'}`
                      : `rounded-lg ${showOnlyOpen ? 'bg-green-500 text-white' : 'bg-white hover:bg-amber-100 text-amber-800'}`
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium flex-1 text-left">Open Now</span>
                  {showOnlyOpen && <Check className="w-4 h-4" />}
                </button>

                <div className={`h-px my-2 ${minimalStyle ? 'bg-foreground/20' : 'bg-amber-200'}`} />

                {/* Category Filters */}
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-medium ${minimalStyle ? 'text-muted-foreground' : 'text-amber-600'}`}>Categories</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedCategories(['wine_shop', 'wine_bar', 'winery', 'restaurant'])}
                      className={`text-xs px-2 py-1 transition-colors ${
                        minimalStyle 
                          ? 'border border-foreground/30 hover:bg-muted text-foreground' 
                          : 'rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700'
                      }`}
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedCategories(['wine_shop'])}
                      className={`text-xs px-2 py-1 transition-colors ${
                        minimalStyle 
                          ? 'border border-foreground/30 hover:bg-muted text-foreground' 
                          : 'rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700'
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {(['wine_shop', 'wine_bar', 'winery', 'restaurant'] as WineVenueCategory[]).map(category => {
                    const config = CATEGORY_CONFIG[category];
                    const isSelected = selectedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                          minimalStyle
                            ? `border ${isSelected ? 'border-foreground bg-background' : 'border-foreground/20 opacity-60'}`
                            : `rounded-lg ${isSelected ? 'bg-white border border-amber-300' : 'bg-amber-100/50 opacity-60'}`
                        }`}
                      >
                        <span 
                          className={`w-6 h-6 flex items-center justify-center text-sm ${minimalStyle ? 'rounded-full border-2 border-foreground' : 'rounded-full'}`}
                          style={{ backgroundColor: minimalStyle ? (isSelected ? '#000' : '#fff') : (isSelected ? config.color : '#ccc') }}
                        >
                          <span style={{ filter: minimalStyle && isSelected ? 'invert(1)' : 'none' }}>{config.icon}</span>
                        </span>
                        <span className={`text-sm flex-1 text-left ${
                          minimalStyle 
                            ? (isSelected ? 'text-foreground' : 'text-muted-foreground')
                            : (isSelected ? 'text-amber-900' : 'text-amber-600')
                        }`}>
                          {config.label}
                        </span>
                        {isSelected && <Check className={`w-4 h-4 ${minimalStyle ? 'text-foreground' : 'text-amber-600'}`} />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Loading indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute top-20 right-4 z-20 px-4 py-2 shadow-lg flex items-center gap-2 ${
              minimalStyle 
                ? 'bg-background border-2 border-foreground' 
                : 'bg-amber-50/95 backdrop-blur-sm rounded-full border border-amber-200'
            }`}
          >
            <Loader2 className={`w-4 h-4 animate-spin ${minimalStyle ? 'text-foreground' : 'text-amber-600'}`} />
            <span className={`text-sm ${minimalStyle ? 'font-grotesk text-foreground' : 'font-serif text-amber-800'}`}>Discovering venues...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search this area button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <motion.button
          onClick={() => currentBounds && fetchVenues(currentBounds)}
          disabled={loading}
          className={`px-6 py-3 shadow-lg flex items-center gap-2 font-medium disabled:opacity-50 ${
            minimalStyle 
              ? 'border-2 border-foreground bg-foreground text-background hover:bg-foreground/90' 
              : 'rounded-full border-2 border-amber-300'
          }`}
          style={minimalStyle ? { fontFamily: 'Space Grotesk, sans-serif' } : { 
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
        
        {filteredVenues.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-1.5 shadow-lg text-sm flex items-center gap-2 ${
              minimalStyle 
                ? 'bg-background border-2 border-foreground text-foreground' 
                : 'bg-amber-50/95 backdrop-blur-sm rounded-full border border-amber-200 text-amber-800'
            }`}
            style={{ fontFamily: minimalStyle ? 'Space Grotesk, sans-serif' : 'Georgia, serif' }}
          >
            <Wine className={`w-4 h-4 ${minimalStyle ? 'text-foreground' : 'text-amber-600'}`} />
            <span>
              {filteredVenues.length} venues
              {allVenues.length !== filteredVenues.length && ` (${allVenues.length} total)`}
            </span>
          </motion.div>
        )}
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Google Attribution Badge - Required by Google Terms of Service */}
      <div className="absolute bottom-6 left-4 z-20">
        <div className={`px-3 py-2 shadow-md ${
          minimalStyle 
            ? 'bg-background border-2 border-foreground' 
            : 'bg-white/90 backdrop-blur-sm rounded-lg border border-amber-200'
        }`}>
          <GoogleAttribution variant="dark" />
        </div>
      </div>

      {/* Category legend removed for cleaner UI */}

      {/* Decorative compass rose - only for vintage style */}
      {!minimalStyle && (
        <div className="absolute bottom-4 right-4 z-10 opacity-20 pointer-events-none">
          <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="#8b5a2b" strokeWidth="2" />
            <path d="M50 10 L55 45 L50 50 L45 45 Z" fill="#8b5a2b" />
            <path d="M50 90 L55 55 L50 50 L45 55 Z" fill="#d4a574" />
            <path d="M10 50 L45 45 L50 50 L45 55 Z" fill="#d4a574" />
            <path d="M90 50 L55 45 L50 50 L55 55 Z" fill="#8b5a2b" />
            <text x="50" y="8" textAnchor="middle" fontSize="10" fill="#8b5a2b">N</text>
          </svg>
        </div>
      )}

      {/* Custom styles */}
      <style>{`
        ${minimalStyle ? `
          .mapboxgl-ctrl-group {
            background: #fff !important;
            border: 2px solid #000 !important;
            border-radius: 0 !important;
            overflow: hidden;
          }
          .mapboxgl-ctrl-group button {
            background: #fff !important;
          }
          .mapboxgl-ctrl-group button:hover {
            background: #f0f0f0 !important;
          }
          .mapboxgl-ctrl-group button + button {
            border-top: 1px solid #000 !important;
          }
        ` : `
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
        `}
      `}</style>

      {/* Venue Detail Panel */}
      <VenueDetailPanel
        venue={selectedVenue}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedVenue(null);
        }}
      />
    </div>
  );
};

export default HomeWineMap;
