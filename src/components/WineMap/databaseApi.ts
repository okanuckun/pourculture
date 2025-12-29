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
      openingHours: undefined,
      source: 'database' as const,
      slug: venue.slug,
      venueType: 'venue' as const,
      isClaimed: venue.is_claimed ?? false,
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
      category: 'wine_bar' as WineVenueCategory,
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
      slug: fair.slug,
      venueType: 'wine_fair' as const,
    }));
  } catch (error) {
    console.error('Error fetching wine fairs:', error);
    return [];
  }
};

// Fetch winemakers from database
export const fetchWinemakersFromDatabase = async (): Promise<WineVenue[]> => {
  try {
    const { data, error } = await supabase
      .from('winemakers')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Error fetching winemakers from database:', error);
      return [];
    }

    return (data || []).map(winemaker => ({
      id: `db-winemaker-${winemaker.id}`,
      name: winemaker.name,
      category: 'winery' as WineVenueCategory,
      lat: Number(winemaker.latitude),
      lng: Number(winemaker.longitude),
      address: winemaker.region || undefined,
      city: undefined,
      country: winemaker.country,
      website: winemaker.website || undefined,
      phone: undefined,
      openingHours: undefined,
      source: 'database' as const,
      slug: winemaker.slug,
      venueType: 'winemaker' as const,
      isClaimed: winemaker.is_claimed ?? false,
    }));
  } catch (error) {
    console.error('Error fetching winemakers:', error);
    return [];
  }
};

// Fetch all database venues
export const fetchAllDatabaseVenues = async (): Promise<WineVenue[]> => {
  const [venues, wineFairs, winemakers] = await Promise.all([
    fetchVenuesFromDatabase(),
    fetchWineFairsFromDatabase(),
    fetchWinemakersFromDatabase(),
  ]);

  return [...venues, ...wineFairs, ...winemakers];
};
