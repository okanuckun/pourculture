import { WineVenue, OverpassElement, MapBounds, WineVenueCategory } from './types';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Build Overpass query for wine-related venues
export const buildOverpassQuery = (bounds: MapBounds): string => {
  const { south, west, north, east } = bounds;
  const bbox = `${south},${west},${north},${east}`;
  
  return `
    [out:json][timeout:25];
    (
      // Wine shops
      node["shop"="wine"](${bbox});
      way["shop"="wine"](${bbox});
      
      // Wine bars
      node["amenity"="bar"]["cuisine"~"wine"](${bbox});
      way["amenity"="bar"]["cuisine"~"wine"](${bbox});
      node["amenity"="bar"]["name"~"[Ww]ine|[Vv]in|[Ww]ein|[Vv]ino"](${bbox});
      way["amenity"="bar"]["name"~"[Ww]ine|[Vv]in|[Ww]ein|[Vv]ino"](${bbox});
      
      // Wineries
      node["craft"="winery"](${bbox});
      way["craft"="winery"](${bbox});
      node["landuse"="vineyard"]["name"](${bbox});
      way["landuse"="vineyard"]["name"](${bbox});
      
      // Wine cellars
      node["tourism"="wine_cellar"](${bbox});
      way["tourism"="wine_cellar"](${bbox});
      
      // Restaurants with wine focus
      node["amenity"="restaurant"]["cuisine"~"wine"](${bbox});
      way["amenity"="restaurant"]["cuisine"~"wine"](${bbox});
    );
    out center;
  `;
};

// Determine category from OSM tags
const getCategoryFromTags = (tags: OverpassElement['tags']): WineVenueCategory => {
  if (!tags) return 'wine_shop';
  
  if (tags.shop === 'wine') return 'wine_shop';
  if (tags.craft === 'winery' || tags.landuse === 'vineyard') return 'winery';
  if (tags.tourism === 'wine_cellar') return 'winery';
  if (tags.amenity === 'bar') return 'wine_bar';
  if (tags.amenity === 'restaurant') return 'restaurant';
  
  return 'wine_shop';
};

// Parse Overpass response to WineVenue array
const parseOverpassResponse = (elements: OverpassElement[]): WineVenue[] => {
  return elements
    .filter(el => {
      // Must have coordinates
      const hasCoords = (el.lat && el.lon) || el.center;
      // Must have a name
      const hasName = el.tags?.name;
      return hasCoords && hasName;
    })
    .map(el => {
      const lat = el.lat ?? el.center?.lat ?? 0;
      const lng = el.lon ?? el.center?.lon ?? 0;
      const tags = el.tags || {};
      
      const address = [
        tags['addr:housenumber'],
        tags['addr:street'],
      ].filter(Boolean).join(' ');
      
      return {
        id: `osm-${el.id}`,
        name: tags.name || 'Unknown',
        category: getCategoryFromTags(tags),
        lat,
        lng,
        address: address || undefined,
        city: tags['addr:city'],
        country: tags['addr:country'],
        website: tags.website,
        phone: tags.phone,
        openingHours: tags.opening_hours,
        source: 'osm' as const,
        osmId: el.id,
      };
    });
};

// Fetch wine venues from Overpass API
export const fetchWineVenuesFromOSM = async (bounds: MapBounds): Promise<WineVenue[]> => {
  const query = buildOverpassQuery(bounds);
  
  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data = await response.json();
    return parseOverpassResponse(data.elements || []);
  } catch (error) {
    console.error('Error fetching from Overpass API:', error);
    return [];
  }
};

// Debounce helper
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
