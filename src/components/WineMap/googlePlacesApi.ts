import { supabase } from "@/integrations/supabase/client";
import { WineVenue } from "./types";

interface GooglePlaceResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  category: 'wine_shop' | 'wine_bar' | 'winery' | 'restaurant';
  rating?: number;
  priceLevel?: number;
  isOpen?: boolean;
  website?: string;
  phone?: string;
}

interface SearchResponse {
  places: GooglePlaceResult[];
  count: number;
}

export async function fetchWineVenuesFromGoogle(
  lat: number,
  lng: number,
  radius: number = 5000,
  naturalWineOnly: boolean = false
): Promise<WineVenue[]> {
  try {
    console.log(`Fetching Google Places for ${lat}, ${lng} with radius ${radius}m, naturalWineOnly: ${naturalWineOnly}`);
    
    const { data, error } = await supabase.functions.invoke('search-wine-places', {
      body: { lat, lng, radius, naturalWineOnly }
    });

    if (error) {
      console.error('Error calling search-wine-places:', error);
      throw error;
    }

    const response = data as SearchResponse;
    console.log(`Google Places returned ${response.count} venues`);

    return response.places.map(place => ({
      id: place.id,
      name: place.name,
      category: place.category,
      lat: place.lat,
      lng: place.lng,
      address: place.address,
      source: 'osm' as const, // Using 'osm' to differentiate from database
      website: place.website,
      phone: place.phone,
    }));
  } catch (error) {
    console.error('Error fetching from Google Places:', error);
    return [];
  }
}
