import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Search,
  Plus,
  Star,
  MapPin,
  Phone,
  Globe,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { googlePlacePhotoUrl } from '@/lib/venuePhoto';

type DiscoveryCategory = 'wine_bar' | 'wine_shop' | 'restaurant';

interface DiscoveredPlace {
  id: string;
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  category: string;
  rating?: number;
  priceLevel?: number;
  isOpen?: boolean;
  website?: string;
  phone?: string;
  photoReference?: string;
}

interface PlaceDetail {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  openingHours?: string[];
  photos?: string[];
  photoReferences?: string[];
  lat?: number;
  lng?: number;
}

const CATEGORY_LABEL: Record<DiscoveryCategory, string> = {
  wine_bar: 'Wine Bar',
  wine_shop: 'Wine Shop',
  restaurant: 'Restaurant',
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const VenueDiscovery = () => {
  const { toast } = useToast();
  const [searchMode, setSearchMode] = useState<'city' | 'venue'>('venue');
  const [city, setCity] = useState('');
  const [venueQuery, setVenueQuery] = useState('');
  const [category, setCategory] = useState<DiscoveryCategory>('wine_bar');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<DiscoveredPlace[]>([]);
  const [selected, setSelected] = useState<DiscoveredPlace | null>(null);
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedPlaceIds, setAddedPlaceIds] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    let queryStr = '';

    if (searchMode === 'city') {
      const trimmedCity = city.trim();
      if (!trimmedCity) {
        toast({ title: 'City required', description: 'Enter a city to search.', variant: 'destructive' });
        return;
      }
      queryStr = `natural wine ${CATEGORY_LABEL[category]} ${trimmedCity}`;
    } else {
      const trimmedVenue = venueQuery.trim();
      if (!trimmedVenue) {
        toast({ title: 'Venue name required', description: 'Enter a venue name to search.', variant: 'destructive' });
        return;
      }
      queryStr = trimmedVenue;
    }

    setSearching(true);
    setResults([]);
    setSelected(null);
    setDetail(null);

    try {
      const { data, error } = await supabase.functions.invoke('search-wine-places', {
        body: { query: queryStr },
      });

      if (error) throw error;
      const places: DiscoveredPlace[] = data?.places ?? [];
      setResults(places);

      if (places.length === 0) {
        toast({ title: 'No results', description: 'Try a different city or category.' });
      } else {
        // Check which are already in DB
        const placeIds = places.map((p) => p.placeId);
        const { data: existing } = await supabase
          .from('venues')
          .select('google_place_id')
          .in('google_place_id', placeIds);
        if (existing) {
          setAddedPlaceIds(
            new Set(existing.map((v: { google_place_id: string | null }) => v.google_place_id ?? '').filter(Boolean))
          );
        }
      }
    } catch (e: any) {
      toast({
        title: 'Search failed',
        description: e?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = async (place: DiscoveredPlace) => {
    setSelected(place);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-place-details', {
        body: { placeId: place.placeId },
      });
      if (error) throw error;
      setDetail(data as PlaceDetail);
    } catch (e: any) {
      toast({
        title: 'Detail load failed',
        description: e?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAdd = async (place: DiscoveredPlace) => {
    setAddingId(place.placeId);
    try {
      // Duplicate check
      const { data: existing, error: dupErr } = await supabase
        .from('venues')
        .select('id')
        .eq('google_place_id', place.placeId)
        .maybeSingle();
      if (dupErr) throw dupErr;
      if (existing) {
        toast({
          title: 'Already added',
          description: 'This venue already exists in the database.',
        });
        setAddedPlaceIds((prev) => new Set(prev).add(place.placeId));
        return;
      }

      // Pull rich details for full insert
      const { data: detailData, error: detailErr } = await supabase.functions.invoke(
        'get-place-details',
        { body: { placeId: place.placeId } }
      );
      if (detailErr) throw detailErr;
      const d = detailData as PlaceDetail;

      const baseSlug = slugify(place.name) || `venue-${place.placeId.slice(0, 8)}`;
      const slug = `${baseSlug}-${place.placeId.slice(-6).toLowerCase()}`;

      // Build opening_hours jsonb from Google's weekday_text array
      const openingHoursJson =
        d.openingHours && d.openingHours.length > 0
          ? { weekday_text: d.openingHours }
          : {};

      const { data: { user } } = await supabase.auth.getUser();

      // Map UI category to DB enum (venue_category): wine_bar -> bar
      const dbCategory: 'bar' | 'wine_shop' | 'restaurant' =
        category === 'wine_bar' ? 'bar' : category;

      const { error: insertErr } = await supabase.from('venues').insert({
        name: place.name,
        slug,
        category: dbCategory,
        address: d.address ?? place.address ?? '',
        city: d.city ?? city.trim(),
        country: d.country ?? '',
        latitude: d.lat ?? place.lat,
        longitude: d.lng ?? place.lng,
        phone: d.phone ?? place.phone ?? null,
        website: d.website ?? place.website ?? null,
        google_place_id: place.placeId,
        google_rating: d.rating ?? place.rating ?? null,
        google_photo_references: d.photoReferences ?? (place.photoReference ? [place.photoReference] : []),
        opening_hours: openingHoursJson,
        source: 'google_discovery',
        created_by: user?.id ?? null,
      });
      if (insertErr) throw insertErr;

      toast({ title: 'Added!', description: `${place.name} saved to venues.` });
      setAddedPlaceIds((prev) => new Set(prev).add(place.placeId));
    } catch (e: any) {
      toast({
        title: 'Add failed',
        description: e?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background border-2 border-foreground p-6 space-y-4">
        <h2 className="text-xl font-medium uppercase tracking-tight">
          Discover Venues from Google
        </h2>
        <p className="text-sm text-muted-foreground">
          Search natural wine places by city or find a specific venue by name.
        </p>

        {/* Search Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={searchMode === 'venue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSearchMode('venue'); setResults([]); setSelected(null); setDetail(null); }}
            className={searchMode === 'venue' ? 'bg-foreground text-background' : 'border-2 border-foreground/30'}
          >
            Search Venue
          </Button>
          <Button
            variant={searchMode === 'city' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSearchMode('city'); setResults([]); setSelected(null); setDetail(null); }}
            className={searchMode === 'city' ? 'bg-foreground text-background' : 'border-2 border-foreground/30'}
          >
            Browse by City
          </Button>
        </div>

        {searchMode === 'venue' ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <Input
              placeholder="Venue name (e.g. Ten Bells NYC, Le Verre Volé Paris)"
              value={venueQuery}
              onChange={(e) => setVenueQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="border-2 border-foreground/30 focus:border-foreground"
            />
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground uppercase"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-3">
            <Input
              placeholder="City (e.g. Paris, Istanbul, Tokyo)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="border-2 border-foreground/30 focus:border-foreground"
            />
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as DiscoveryCategory)}
            >
              <SelectTrigger className="border-2 border-foreground/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wine_bar">Wine Bar</SelectItem>
                <SelectItem value="wine_shop">Wine Shop</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground uppercase"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Results list */}
        <div className="space-y-3">
          {results.length === 0 && !searching && (
            <div className="text-center py-12 text-muted-foreground border-2 border-foreground/20">
              No results yet. Run a search above.
            </div>
          )}

          {results.map((place) => {
            const isAdded = addedPlaceIds.has(place.placeId);
            const isSelected = selected?.placeId === place.placeId;
            return (
              <motion.div
                key={place.placeId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSelect(place)}
                className={`flex gap-4 p-3 bg-background border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-foreground'
                    : 'border-foreground/20 hover:border-foreground/60'
                }`}
              >
                <div className="w-24 h-24 flex-shrink-0 bg-foreground/5 overflow-hidden border border-foreground/10">
                  {place.photoReference ? (
                    <img
                      src={googlePlacePhotoUrl(place.photoReference, 200)}
                      alt={place.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🍷
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground uppercase truncate">
                    {place.name}
                  </h3>
                  {place.address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {place.address}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    {place.rating && (
                      <span className="flex items-center gap-1 font-medium">
                        <Star className="h-3 w-3 fill-current" />
                        {place.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="text-muted-foreground capitalize">
                      {place.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  {isAdded ? (
                    <span className="px-2 py-1 text-[10px] uppercase font-bold bg-green-600 text-white border-2 border-green-700 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Added
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(place);
                      }}
                      disabled={addingId === place.placeId}
                      className="bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground uppercase text-xs"
                    >
                      {addingId === place.placeId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-4 h-fit">
          {!selected && (
            <div className="text-center py-12 text-muted-foreground border-2 border-foreground/20">
              Select a venue to see details
            </div>
          )}

          {selected && (
            <div className="bg-background border-2 border-foreground p-4 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium uppercase tracking-tight">
                  {selected.name}
                </h3>
                <button
                  onClick={() => {
                    setSelected(null);
                    setDetail(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close detail"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {loadingDetail && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}

              {detail && !loadingDetail && (
                <>
                  {detail.photoReferences && detail.photoReferences.length > 0 && (
                    <div className="grid grid-cols-3 gap-1">
                      {detail.photoReferences.slice(0, 6).map((ref, i) => (
                        <img
                          key={i}
                          src={googlePlacePhotoUrl(ref, 300)}
                          alt={`${selected.name} ${i + 1}`}
                          loading="lazy"
                          className="w-full aspect-square object-cover border border-foreground/10"
                        />
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {detail.address && (
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{detail.address}</span>
                      </p>
                    )}
                    {detail.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <a href={`tel:${detail.phone}`} className="hover:underline">
                          {detail.phone}
                        </a>
                      </p>
                    )}
                    {detail.website && (
                      <p className="flex items-center gap-2">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <a
                          href={detail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                        >
                          {detail.website}
                        </a>
                      </p>
                    )}
                    {detail.rating && (
                      <p className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-current" />
                        {detail.rating.toFixed(1)}
                        {detail.reviewCount ? ` (${detail.reviewCount} reviews)` : ''}
                      </p>
                    )}
                  </div>

                  {detail.openingHours && detail.openingHours.length > 0 && (
                    <div className="border-t border-foreground/10 pt-3">
                      <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Opening Hours
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {detail.openingHours.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!addedPlaceIds.has(selected.placeId) && (
                    <Button
                      onClick={() => handleAdd(selected)}
                      disabled={addingId === selected.placeId}
                      className="w-full bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground uppercase"
                    >
                      {addingId === selected.placeId ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add to Database
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDiscovery;
