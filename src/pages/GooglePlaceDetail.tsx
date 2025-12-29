import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { MapPin, Clock, Phone, Globe, Star, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapNavigationDialog } from '@/components/MapNavigationDialog';
import { GoogleAttribution } from '@/components/GoogleAttribution';
import { motion } from 'framer-motion';

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

const GooglePlaceDetail: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigationDialogOpen, setNavigationDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!placeId) return;

      try {
        const { data, error } = await supabase.functions.invoke('get-place-details', {
          body: { placeId }
        });

        if (error) throw error;
        setPlace(data);
      } catch (err: any) {
        console.error('Error fetching place details:', err);
        setError(err.message || 'Failed to load place details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [placeId]);

  if (loading) {
    return (
      <BrutalistLayout>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <div className="h-64 bg-muted animate-pulse mb-6" />
          <div className="h-8 w-1/2 bg-muted animate-pulse mb-4" />
          <div className="h-4 w-1/3 bg-muted animate-pulse mb-8" />
          <div className="h-32 bg-muted animate-pulse" />
        </div>
      </BrutalistLayout>
    );
  }

  if (error || !place) {
    return (
      <BrutalistLayout title="Place Not Found" showBackButton backPath="/" backLabel="Map">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">PLACE NOT FOUND</h1>
          <p className="text-muted-foreground mb-6">{error || "The place you're looking for doesn't exist."}</p>
          <Link to="/">
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              BACK TO MAP
            </Button>
          </Link>
        </div>
      </BrutalistLayout>
    );
  }

  const getCategoryLabel = () => {
    if (place.types?.includes('bar')) return 'Wine Bar';
    if (place.types?.includes('store') || place.types?.includes('liquor_store')) return 'Wine Shop';
    if (place.types?.includes('restaurant')) return 'Restaurant';
    if (place.types?.includes('winery')) return 'Winery';
    return 'Wine Venue';
  };

  const getPriceLabel = () => {
    if (!place.priceLevel) return null;
    return '$'.repeat(place.priceLevel);
  };

  return (
    <BrutalistLayout showBackButton backPath="/" backLabel="Map">
      <SEOHead 
        title={`${place.name} - Natural Wine Venue | PourCulture`}
        description={`Visit ${place.name}${place.address ? ` at ${place.address}` : ''}. Discover natural wine venues on PourCulture.`}
      />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {place.photos && place.photos.length > 0 ? (
            <div className="relative aspect-video border-2 border-foreground/20 overflow-hidden mb-8">
              <img 
                src={place.photos[0]} 
                alt={place.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video border-2 border-foreground/20 bg-muted flex items-center justify-center mb-8">
              <span className="text-6xl">🍷</span>
            </div>
          )}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-3 py-1 text-[10px] tracking-wider font-bold ${
              place.isOpen 
                ? 'bg-background border-2 border-foreground text-foreground' 
                : 'bg-foreground/10 border-2 border-foreground/50 text-foreground/70'
            }`}>
              {place.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
            <span className="px-3 py-1 text-[10px] tracking-wider border border-foreground/20">
              {getCategoryLabel().toUpperCase()}
            </span>
            {place.rating && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] tracking-wider bg-foreground text-background">
                <Star className="w-3 h-3 fill-current" />
                {place.rating.toFixed(1)}
                {place.reviewCount && <span>({place.reviewCount})</span>}
              </span>
            )}
            {getPriceLabel() && (
              <span className="px-3 py-1 text-[10px] tracking-wider border border-foreground/20">
                {getPriceLabel()}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">{place.name}</h1>
          {place.address && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{place.address}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              onClick={() => setNavigationDialogOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Navigation className="w-4 h-4 mr-2" />
              GET DIRECTIONS
            </Button>
            
            {place.googleMapsUrl && (
              <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-2 border-foreground hover:bg-foreground hover:text-background">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  VIEW ON GOOGLE MAPS
                </Button>
              </a>
            )}
          </div>
        </motion.div>

        {/* Photo Gallery */}
        {place.photos && place.photos.length > 1 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">PHOTOS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {place.photos.slice(1).map((photo, index) => (
                <div key={index} className="aspect-square border border-foreground/20 overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`${place.name} photo ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Opening Hours */}
        {place.openingHours && place.openingHours.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 border-2 border-foreground/20 p-6"
          >
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              OPENING HOURS
            </h2>
            <ul className="space-y-2">
              {place.openingHours.map((hours, index) => (
                <li key={index} className="text-sm">
                  {hours}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Contact Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 border-2 border-foreground/20 p-6"
        >
          <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">CONTACT & LOCATION</h2>
          <div className="space-y-4">
            <button 
              onClick={() => setNavigationDialogOpen(true)}
              className="flex items-start gap-3 w-full text-left hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
            >
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm">{place.address}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Open in Maps →</p>
              </div>
            </button>

            {place.phone && (
              <a 
                href={`tel:${place.phone}`}
                className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{place.phone}</span>
              </a>
            )}

            {place.website && (
              <a 
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-2 transition-colors"
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{place.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </motion.section>

        {/* Google Reviews */}
        {place.reviews && place.reviews.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">REVIEWS FROM GOOGLE</h2>
            <div className="space-y-4">
              {place.reviews.map((review, index) => (
                <div key={index} className="border border-foreground/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{review.author}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-foreground text-foreground" />
                      <span className="text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{review.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Map */}
        {place.lat && place.lng && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] tracking-wider text-muted-foreground">LOCATION</h2>
              <button 
                onClick={() => setNavigationDialogOpen(true)}
                className="text-[10px] tracking-wider hover:underline"
              >
                GET DIRECTIONS →
              </button>
            </div>
            <iframe
              src={`https://www.google.com/maps?q=${place.lat},${place.lng}&output=embed`}
              className="w-full h-64 border-2 border-foreground/20 grayscale contrast-125"
              loading="lazy"
              title={`Map showing ${place.name} location`}
            />
          </motion.section>
        )}

        {/* Google Attribution */}
        <div className="py-6 border-t border-foreground/20">
          <GoogleAttribution className="justify-center" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Place data provided by Google. Reviews and photos are from Google users.
          </p>
        </div>
      </div>

      {/* Navigation Dialog */}
      <MapNavigationDialog
        open={navigationDialogOpen}
        onOpenChange={setNavigationDialogOpen}
        address={place.address || place.name}
        latitude={place.lat}
        longitude={place.lng}
      />
    </BrutalistLayout>
  );
};

export default GooglePlaceDetail;
