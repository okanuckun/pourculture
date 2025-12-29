export type WineVenueCategory = 'wine_shop' | 'wine_bar' | 'winery' | 'restaurant' | 'all';

export type WineVenueType = 'venue' | 'winemaker' | 'wine_fair';

export interface WineVenue {
  id: string;
  name: string;
  category: WineVenueCategory;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  source: 'osm' | 'database';
  osmId?: number;
  isEvent?: boolean;
  slug?: string;
  venueType?: WineVenueType;
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    'addr:country'?: string;
    website?: string;
    phone?: string;
    opening_hours?: string;
    amenity?: string;
    shop?: string;
    craft?: string;
    tourism?: string;
    cuisine?: string;
    [key: string]: string | undefined;
  };
}

export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export const CATEGORY_CONFIG: Record<WineVenueCategory, {
  label: string;
  color: string;
  icon: string;
}> = {
  wine_shop: {
    label: 'Wine Shops',
    color: '#8B5CF6',
    icon: '🍷',
  },
  wine_bar: {
    label: 'Wine Bars',
    color: '#F59E0B',
    icon: '🍸',
  },
  winery: {
    label: 'Wineries',
    color: '#10B981',
    icon: '🍇',
  },
  restaurant: {
    label: 'Restaurants',
    color: '#EF4444',
    icon: '🍽️',
  },
  all: {
    label: 'All',
    color: '#6B7280',
    icon: '📍',
  },
};
