import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { WineVenue, CATEGORY_CONFIG } from './types';
import { ExternalLink, Phone, Clock, MapPin } from 'lucide-react';

interface VenueMarkerProps {
  venue: WineVenue;
}

// Create custom icon for each category
const createCustomIcon = (category: WineVenue['category']) => {
  const config = CATEGORY_CONFIG[category];
  
  return L.divIcon({
    className: 'custom-wine-marker',
    html: `
      <div style="
        background-color: ${config.color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${config.icon}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

export const VenueMarker: React.FC<VenueMarkerProps> = ({ venue }) => {
  const icon = createCustomIcon(venue.category);
  const config = CATEGORY_CONFIG[venue.category];
  
  return (
    <Marker position={[venue.lat, venue.lng]} icon={icon}>
      <Popup>
        <div className="min-w-[200px] max-w-[280px] p-1">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: config.color }}
            >
              {config.icon} {config.label}
            </span>
            {venue.source === 'osm' && (
              <span className="text-[10px] text-gray-400">OSM</span>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 text-sm mb-2">
            {venue.name}
          </h3>
          
          {venue.address && (
            <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-1">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{venue.address}{venue.city ? `, ${venue.city}` : ''}</span>
            </div>
          )}
          
          {venue.openingHours && (
            <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-1">
              <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="break-words">{venue.openingHours}</span>
            </div>
          )}
          
          {venue.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <a href={`tel:${venue.phone}`} className="hover:text-primary">
                {venue.phone}
              </a>
            </div>
          )}
          
          {venue.website && (
            <a 
              href={venue.website.startsWith('http') ? venue.website : `https://${venue.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              Website
            </a>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
