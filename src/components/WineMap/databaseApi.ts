import { supabase } from '@/integrations/supabase/client';
import { WineVenue, WineVenueCategory } from './types';

// Map database venue category to WineVenueCategory
const mapVenueCategory = (category: string): WineVenueCategory => {
  switch (category) {
    case 'wine_shop':
      return 'wine_shop';
    case 'bar':
      return 'wine_bar';
    case 'restaurant':
      return 'restaurant';
    case 'winemaker':
      return 'winery';
    case 'accommodation':
      return 'restaurant'; // Map to restaurant as closest match
    default:
      return 'wine_shop';
  }
};

// Fetch venues from database
export const fetchVenuesFromDatabase = async (): Promise<WineVenue[]> => {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Error fetching venues from database:', error);
      return [];
    }

    return (data || []).map(venue => ({
      id: `db-venue-${venue.id}`,
      name: venue.name,
      category: mapVenueCategory(venue.category),
      lat: Number(venue.latitude),
      lng: Number(venue.longitude),
      address: venue.address,
      city: venue.city,
      country: venue.country,
      website: venue.website || undefined,
      phone: venue.phone || undefined,
      openingHours: undefined, // JSON format, would need parsing
      source: 'database' as const,
    }));
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
};

// Fetch wine fairs from database
export const fetchWineFairsFromDatabase = async (): Promise<WineVenue[]> => {
  try {
    const { data, error } = await supabase
      .from('wine_fairs')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Error fetching wine fairs from database:', error);
      return [];
    }

    return (data || []).map(fair => ({
      id: `db-fair-${fair.id}`,
      name: fair.title,
      category: 'wine_bar' as WineVenueCategory, // Events shown as wine bar category
      lat: Number(fair.latitude),
      lng: Number(fair.longitude),
      address: fair.venue_name || undefined,
      city: fair.city,
      country: fair.country,
      website: fair.ticket_url || undefined,
      phone: undefined,
      openingHours: fair.start_date ? `Event: ${fair.start_date}${fair.end_date ? ` - ${fair.end_date}` : ''}` : undefined,
      source: 'database' as const,
      isEvent: true,
    }));
  } catch (error) {
    console.error('Error fetching wine fairs:', error);
    return [];
  }
};

// Fetch all database venues
export const fetchAllDatabaseVenues = async (): Promise<WineVenue[]> => {
  const [venues, wineFairs] = await Promise.all([
    fetchVenuesFromDatabase(),
    fetchWineFairsFromDatabase(),
  ]);

  return [...venues, ...wineFairs];
};
