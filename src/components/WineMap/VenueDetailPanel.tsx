import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Phone, Globe, Star, Navigation, ExternalLink, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { WineVenue, CATEGORY_CONFIG } from './types';
import { MapNavigationDialog } from '@/components/MapNavigationDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { GoogleAttribution } from '@/components/GoogleAttribution';

interface VenueDetailPanelProps {
  venue: WineVenue | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PlaceDetails {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  isOpen?: boolean;
  openingHours?: string[];
  photos?: string[];
  lat?: number;
  lng?: number;
  types?: string[];
  googleMapsUrl?: string;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

interface DatabaseVenue {
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
  opening_hours: Record<string, string> | null;
  latitude: number | null;
  longitude: number | null;
  google_rating: number | null;
  story: string | null;
  photos: string[] | null;
  social_links: Record<string, string> | null;
}

export const VenueDetailPanel: React.FC<VenueDetailPanelProps> = ({
  venue,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [dbVenue, setDbVenue] = useState<DatabaseVenue | null>(null);
  const [navigationDialogOpen, setNavigationDialogOpen] = useState(false);

  const handleViewProfile = () => {
    onClose();
    if (venue?.source === 'database' && venue.slug) {
      navigate(`/venue/${venue.slug}`);
    } else if (venue?.source === 'google' && venue.googlePlaceId) {
      const placeId = venue.googlePlaceId.replace('google_', '');
      navigate(`/place/google/${placeId}`);
    }
  };

  useEffect(() => {
    if (!venue || !isOpen) {
      setPlaceDetails(null);
      setDbVenue(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      
      try {
        if (venue.source === 'database' && venue.slug) {
          // Fetch from database
          const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('slug', venue.slug)
            .maybeSingle();

          if (!error && data) {
            setDbVenue({
              ...data,
              photos: Array.isArray(data.photos) ? data.photos as string[] : [],
              social_links: (typeof data.social_links === 'object' && data.social_links !== null && !Array.isArray(data.social_links)) 
                ? data.social_links as Record<string, string> : {},
              opening_hours: (typeof data.opening_hours === 'object' && data.opening_hours !== null && !Array.isArray(data.opening_hours)) 
                ? data.opening_hours as Record<string, string> : {}
            });
          }
        } else if (venue.source === 'google' && venue.googlePlaceId) {
          // Fetch from Google Places
          const placeId = venue.googlePlaceId.replace('google_', '');
          const { data, error } = await supabase.functions.invoke('get-place-details', {
            body: { placeId }
          });

          if (!error && data) {
            setPlaceDetails(data);
          }
        }
      } catch (err) {
        console.error('Error fetching venue details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [venue, isOpen]);

  if (!venue) return null;

  const config = CATEGORY_CONFIG[venue.category];
  
  // Determine display data based on source
  const displayData = venue.source === 'database' && dbVenue ? {
    name: dbVenue.name,
    address: `${dbVenue.address}, ${dbVenue.city}, ${dbVenue.country}`,
    phone: dbVenue.phone,
    website: dbVenue.website,
    rating: dbVenue.google_rating,
    isOpen: dbVenue.is_open,
    photos: dbVenue.photos || [],
    openingHours: dbVenue.opening_hours,
    description: dbVenue.description,
    story: dbVenue.story,
    lat: dbVenue.latitude,
    lng: dbVenue.longitude,
    isClaimed: dbVenue.is_claimed,
  } : placeDetails ? {
    name: placeDetails.name,
    address: placeDetails.address,
    phone: placeDetails.phone,
    website: placeDetails.website,
    rating: placeDetails.rating,
    reviewCount: placeDetails.reviewCount,
    isOpen: placeDetails.isOpen,
    photos: placeDetails.photos || [],
    openingHours: placeDetails.openingHours,
    lat: placeDetails.lat,
    lng: placeDetails.lng,
    googleMapsUrl: placeDetails.googleMapsUrl,
    reviews: placeDetails.reviews,
  } : {
    name: venue.name,
    address: venue.address,
    phone: venue.phone,
    website: venue.website,
    lat: venue.lat,
    lng: venue.lng,
  };

  // Animation variants
  const panelVariants = isMobile ? {
    hidden: { y: '100%' },
    visible: { y: 0 },
    exit: { y: '100%' }
  } : {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`fixed z-50 bg-background shadow-2xl overflow-hidden ${
              isMobile 
                ? 'bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl' 
                : 'top-0 right-0 h-full w-full md:w-[480px] lg:w-[520px]'
            }`}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: config.color }}
                >
                  {config.icon} {config.label}
                </span>
                {venue.source === 'database' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    ✓ Verified
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-80px)] px-6 py-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Hero Image */}
                  {displayData.photos && displayData.photos.length > 0 ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                      <img 
                        src={displayData.photos[0]} 
                        alt={displayData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="text-5xl">{config.icon}</span>
                    </div>
                  )}

                  {/* Title & Status */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {displayData.isOpen !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          displayData.isOpen 
                            ? 'bg-status-open/10 text-status-open' 
                            : 'bg-status-closed/10 text-status-closed'
                        }`}>
                          {displayData.isOpen ? 'Open' : 'Closed'}
                        </span>
                      )}
                      {displayData.rating && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600">
                          <Star className="w-3 h-3 fill-current" />
                          {displayData.rating.toFixed(1)}
                          {'reviewCount' in displayData && displayData.reviewCount && (
                            <span className="text-[10px]">({displayData.reviewCount})</span>
                          )}
                        </span>
                      )}
                      {'isClaimed' in displayData && displayData.isClaimed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
                          <Star className="w-3 h-3 fill-current" />
                          Verified Owner
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{displayData.name}</h2>
                    {displayData.address && (
                      <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {displayData.address}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleViewProfile}
                      className="flex-1"
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setNavigationDialogOpen(true)}
                      className="flex-1"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                  
                  {'googleMapsUrl' in displayData && displayData.googleMapsUrl && (
                    <a href={displayData.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Google Maps
                      </Button>
                    </a>
                  )}

                  {/* Description/Story */}
                  {'description' in displayData && displayData.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{displayData.description}</p>
                    </div>
                  )}
                  
                  {'story' in displayData && displayData.story && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">Our Story</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{displayData.story}</p>
                    </div>
                  )}

                  {/* Opening Hours */}
                  {displayData.openingHours && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Opening Hours
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-3">
                        {Array.isArray(displayData.openingHours) ? (
                          <ul className="space-y-1">
                            {displayData.openingHours.map((hours, index) => (
                              <li key={index} className="text-xs text-muted-foreground">
                                {hours}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="space-y-1">
                            {Object.entries(displayData.openingHours).map(([day, hours]) => (
                              <li key={day} className="text-xs text-muted-foreground flex justify-between">
                                <span className="font-medium">{day}</span>
                                <span>{hours}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Photo Gallery */}
                  {displayData.photos && displayData.photos.length > 1 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">Photos</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {displayData.photos.slice(1, 7).map((photo, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden">
                            <img 
                              src={photo} 
                              alt={`${displayData.name} photo ${index + 2}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-3">
                    {displayData.phone && (
                      <a 
                        href={`tel:${displayData.phone}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Phone className="w-5 h-5 text-primary" />
                        <span className="text-sm">{displayData.phone}</span>
                      </a>
                    )}

                    {displayData.website && (
                      <a 
                        href={displayData.website.startsWith('http') ? displayData.website : `https://${displayData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Globe className="w-5 h-5 text-primary" />
                        <span className="text-sm truncate">{displayData.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>

                  {/* Google Reviews */}
                  {'reviews' in displayData && displayData.reviews && displayData.reviews.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">Reviews</h3>
                      <div className="space-y-3">
                        {displayData.reviews.map((review, index) => (
                          <div key={index} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{review.author}</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs text-muted-foreground">{review.rating}</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-xs line-clamp-3">{review.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{review.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Google Attribution - Required for Google Places data */}
                  {venue.source === 'google' && (
                    <div className="pt-4 border-t border-border">
                      <GoogleAttribution />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Data provided by Google Maps Platform
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Navigation Dialog */}
          <MapNavigationDialog
            open={navigationDialogOpen}
            onOpenChange={setNavigationDialogOpen}
            address={displayData.address || displayData.name}
            latitude={displayData.lat}
            longitude={displayData.lng}
          />
        </>
      )}
    </AnimatePresence>
  );
};
