import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { MapPin, Clock, Phone, Globe, Mail, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapNavigationDialog } from '@/components/MapNavigationDialog';
import { 
  PhotoGallery, 
  SocialLinks, 
  WineList, 
  OpeningHours, 
  VenueReviews, 
  VenueEvents, 
  MenuLink 
} from '@/components/venue';
import { motion } from 'framer-motion';

interface WineItem {
  name: string;
  grape?: string;
  region?: string;
  price?: string;
  description?: string;
}

interface VenueEvent {
  title: string;
  date: string;
  time?: string;
  description?: string;
  ticket_url?: string;
  price?: string;
}

interface Venue {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  image_url: string | null;
  is_open: boolean | null;
  is_claimed: boolean | null;
  owner_id: string | null;
  opening_hours: Record<string, string> | null;
  latitude: number | null;
  longitude: number | null;
  google_rating: number | null;
  story: string | null;
  photos: string[] | null;
  social_links: Record<string, string> | null;
  wine_list: WineItem[] | null;
  events: VenueEvent[] | null;
  menu_url: string | null;
}

const VenueDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [navigationDialogOpen, setNavigationDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        const venueData: Venue = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          category: data.category,
          description: data.description,
          address: data.address,
          city: data.city,
          country: data.country,
          phone: data.phone,
          email: data.email,
          website: data.website,
          image_url: data.image_url,
          is_open: data.is_open,
          is_claimed: data.is_claimed,
          owner_id: data.owner_id,
          latitude: data.latitude ? Number(data.latitude) : null,
          longitude: data.longitude ? Number(data.longitude) : null,
          google_rating: data.google_rating ? Number(data.google_rating) : null,
          story: data.story,
          menu_url: data.menu_url,
          photos: Array.isArray(data.photos) ? data.photos as string[] : [],
          social_links: (typeof data.social_links === 'object' && data.social_links !== null && !Array.isArray(data.social_links)) 
            ? data.social_links as Record<string, string> : {},
          wine_list: Array.isArray(data.wine_list) ? data.wine_list as unknown as WineItem[] : [],
          events: Array.isArray(data.events) ? data.events as unknown as VenueEvent[] : [],
          opening_hours: (typeof data.opening_hours === 'object' && data.opening_hours !== null && !Array.isArray(data.opening_hours)) 
            ? data.opening_hours as Record<string, string> : {}
        };
        setVenue(venueData);
      }
      setLoading(false);
    };

    fetchVenue();
  }, [slug]);

  if (loading) {
    return (
      <BrutalistLayout>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-[400px] w-full mb-8" />
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </BrutalistLayout>
    );
  }

  if (notFound || !venue) {
    return (
      <BrutalistLayout title="Venue Not Found" showBackButton backPath="/discover" backLabel="Discover">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 text-center">
          <p className="text-muted-foreground mb-6">The venue you're looking for doesn't exist.</p>
          <Link to="/discover">
            <Button variant="outline" className="border-foreground/20 hover:bg-foreground hover:text-background">
              Browse Venues
            </Button>
          </Link>
        </div>
      </BrutalistLayout>
    );
  }

  const categoryLabel = venue.category.replace('_', ' ');

  return (
    <BrutalistLayout showBackButton backPath="/discover" backLabel="Discover">
      <SEOHead 
        title={`${venue.name} - Natural Wine ${categoryLabel}`}
        description={venue.description || `Visit ${venue.name}, a natural wine ${categoryLabel} in ${venue.city}, ${venue.country}`}
      />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {venue.image_url ? (
            <div className="relative aspect-video md:aspect-[21/9] overflow-hidden mb-8 border border-foreground/20">
              <img 
                src={venue.image_url} 
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video md:aspect-[21/9] bg-muted flex items-center justify-center mb-8 border border-foreground/20">
              <span className="text-8xl">🍷</span>
            </div>
          )}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-3 py-1 text-[10px] tracking-wider ${
              venue.is_open 
                ? 'bg-status-open/10 text-status-open border border-status-open/30' 
                : 'bg-status-closed/10 text-status-closed border border-status-closed/30'
            }`}>
              {venue.is_open ? 'OPEN' : 'CLOSED'}
            </span>
            <span className="px-3 py-1 text-[10px] tracking-wider uppercase border border-foreground/20">
              {categoryLabel}
            </span>
            {venue.is_claimed && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] tracking-wider bg-primary/10 text-primary border border-primary/30">
                <Star className="w-3 h-3 fill-current" />
                VERIFIED
              </span>
            )}
            {venue.google_rating && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] tracking-wider border border-foreground/20">
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                {venue.google_rating.toFixed(1)}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">{venue.name}</h1>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4" />
            <span>{venue.city}, {venue.country}</span>
          </div>
          
          {/* Social Links */}
          {venue.social_links && Object.keys(venue.social_links).length > 0 && (
            <div className="mt-4">
              <SocialLinks links={venue.social_links} />
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              onClick={() => setNavigationDialogOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            {venue.photos && venue.photos.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <PhotoGallery photos={venue.photos} venueName={venue.name} />
              </motion.section>
            )}
            
            {/* Story Section */}
            {venue.story && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="border border-foreground/20 p-6"
              >
                <h2 className="text-[10px] tracking-wider text-muted-foreground mb-3">OUR STORY</h2>
                <p className="text-foreground leading-relaxed whitespace-pre-line">{venue.story}</p>
              </motion.section>
            )}

            {/* Description */}
            {venue.description && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="border border-foreground/20 p-6"
              >
                <h2 className="text-[10px] tracking-wider text-muted-foreground mb-3">ABOUT</h2>
                <p className="text-foreground leading-relaxed">{venue.description}</p>
              </motion.section>
            )}

            {/* Wine List */}
            {venue.wine_list && venue.wine_list.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <WineList wines={venue.wine_list} />
              </motion.section>
            )}

            {/* Menu Link */}
            {venue.menu_url && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <MenuLink menuUrl={venue.menu_url} />
              </motion.section>
            )}

            {/* Events */}
            {venue.events && venue.events.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <VenueEvents events={venue.events} />
              </motion.section>
            )}

            {/* Reviews */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <VenueReviews 
                venueId={venue.id} 
                venueType="venue" 
                userId={user?.id} 
              />
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Opening Hours */}
            {venue.opening_hours && Object.keys(venue.opening_hours).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="border border-foreground/20 p-6"
              >
                <OpeningHours hours={venue.opening_hours} />
              </motion.div>
            )}

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="border border-foreground/20 p-6"
            >
              <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">CONTACT & LOCATION</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => setNavigationDialogOpen(true)}
                  className="flex items-start gap-3 w-full text-left hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">{venue.address}</p>
                    <p className="text-sm text-muted-foreground">{venue.city}, {venue.country}</p>
                    <p className="text-[10px] text-primary mt-1">Open in Maps →</p>
                  </div>
                </button>

                {venue.phone && (
                  <a 
                    href={`tel:${venue.phone}`}
                    className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{venue.phone}</span>
                  </a>
                )}

                {venue.email && (
                  <a 
                    href={`mailto:${venue.email}`}
                    className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{venue.email}</span>
                  </a>
                )}

                {venue.website && (
                  <a 
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{venue.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="border border-foreground/20 overflow-hidden"
            >
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${venue.address}, ${venue.city}, ${venue.country}`)}&output=embed`}
                className="w-full h-48 grayscale contrast-125"
                loading="lazy"
                title={`Map showing ${venue.name} location`}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Dialog */}
      <MapNavigationDialog
        open={navigationDialogOpen}
        onOpenChange={setNavigationDialogOpen}
        address={`${venue.address}, ${venue.city}, ${venue.country}`}
        latitude={venue.latitude}
        longitude={venue.longitude}
      />
    </BrutalistLayout>
  );
};

export default VenueDetail;
