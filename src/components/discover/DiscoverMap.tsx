import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface DiscoverMapProps {
  venues: Array<{
    id: string;
    name: string;
    slug: string;
    latitude: number | null;
    longitude: number | null;
    category: string;
  }>;
  userCoords: { lat: number; lng: number } | null;
  onVenueClick?: (slug: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  bar: '🍷',
  wine_shop: '🏪',
  restaurant: '🍽️',
  winemaker: '🌿',
};

export const DiscoverMap: React.FC<DiscoverMapProps> = ({ venues, userCoords, onVenueClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initMap = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-mapbox-token');
        if (!data?.token) {
          setLoading(false);
          return;
        }

        mapboxgl.accessToken = data.token;

        const center: [number, number] = userCoords
          ? [userCoords.lng, userCoords.lat]
          : [2.3522, 48.8566];

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom: userCoords ? 12 : 4,
          pitch: 0,
          antialias: true,
          attributionControl: false,
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({ visualizePitch: false }),
          'bottom-right'
        );

        map.current.on('style.load', () => {
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Fly to user location when coords change
  useEffect(() => {
    if (map.current && userCoords) {
      map.current.flyTo({
        center: [userCoords.lng, userCoords.lat],
        zoom: 12,
        duration: 1500,
      });
    }
  }, [userCoords]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add user location marker
    if (userCoords) {
      const userEl = document.createElement('div');
      userEl.innerHTML = `<div style="width:14px;height:14px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #3b82f6, 0 2px 6px rgba(0,0,0,0.3);"></div>`;
      const userMarker = new mapboxgl.Marker({ element: userEl })
        .setLngLat([userCoords.lng, userCoords.lat])
        .addTo(map.current);
      markersRef.current.push(userMarker);
    }

    venues.forEach(venue => {
      if (!venue.latitude || !venue.longitude || !map.current) return;

      const el = document.createElement('div');
      const icon = CATEGORY_ICONS[venue.category] || '🍷';
      el.innerHTML = `
        <div style="
          background:#fff;width:28px;height:28px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;border:2px solid #000;cursor:pointer;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
          transition:transform 0.2s;
        ">${icon}</div>
      `;
      el.addEventListener('click', () => onVenueClick?.(venue.slug));
      el.addEventListener('mouseenter', () => {
        (el.firstElementChild as HTMLElement).style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        (el.firstElementChild as HTMLElement).style.transform = 'scale(1)';
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([venue.longitude, venue.latitude])
        .addTo(map.current!);
      markersRef.current.push(marker);
    });
  }, [venues, userCoords, onVenueClick]);

  return (
    <div className="relative w-full h-[200px] md:h-[300px] border-b border-foreground/20">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
