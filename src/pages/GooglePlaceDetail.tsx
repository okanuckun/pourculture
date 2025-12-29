import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { MapPin, Clock, Phone, Globe, ArrowLeft, Star, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapNavigationDialog } from '@/components/MapNavigationDialog';
import { GoogleAttribution } from '@/components/GoogleAttribution';

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
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Place not found</h1>
          <p className="text-muted-foreground mb-6">{error || "The place you're looking for doesn't exist."}</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </Link>
        </div>
      </div>
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
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${place.name} - Natural Wine Venue`}
        description={`Visit ${place.name}${place.address ? ` at ${place.address}` : ''}. Discover natural wine venues on PourCulture.`}
      />
      <RaisinNavbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Map
        </Link>

        {/* Hero Image */}
        {place.photos && place.photos.length > 0 ? (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
            <img 
              src={place.photos[0]} 
              alt={place.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-8">
            <span className="text-6xl">🍷</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              place.isOpen 
                ? 'bg-status-open/10 text-status-open' 
                : 'bg-status-closed/10 text-status-closed'
            }`}>
              {place.isOpen ? 'Open' : 'Closed'}
            </span>
            <span className="text-muted-foreground">{getCategoryLabel()}</span>
            {place.rating && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-600">
                <Star className="w-3 h-3 fill-current" />
                {place.rating.toFixed(1)}
                {place.reviewCount && <span className="text-xs">({place.reviewCount})</span>}
              </span>
            )}
            {getPriceLabel() && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                {getPriceLabel()}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{place.name}</h1>
          {place.address && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{place.address}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button 
              onClick={() => setNavigationDialogOpen(true)}
              variant="default"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            
            {place.googleMapsUrl && (
              <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Google Maps
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Photo Gallery */}
        {place.photos && place.photos.length > 1 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {place.photos.slice(1).map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`${place.name} photo ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Opening Hours */}
        {place.openingHours && place.openingHours.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Opening Hours
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <ul className="space-y-2">
                {place.openingHours.map((hours, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {hours}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Contact Info */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Contact & Location</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <button 
              onClick={() => setNavigationDialogOpen(true)}
              className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left cursor-pointer"
            >
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p className="text-muted-foreground text-sm">{place.address}</p>
                <p className="text-primary text-xs mt-1">Open in Maps →</p>
              </div>
            </button>

            {place.phone && (
              <a 
                href={`tel:${place.phone}`}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <p className="text-muted-foreground text-sm">{place.phone}</p>
                </div>
              </a>
            )}

            {place.website && (
              <a 
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Globe className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Website</p>
                  <p className="text-muted-foreground text-sm truncate">{place.website.replace(/^https?:\/\//, '')}</p>
                </div>
              </a>
            )}
          </div>
        </section>

        {/* Google Reviews */}
        {place.reviews && place.reviews.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Reviews from Google</h2>
            <div className="space-y-4">
              {place.reviews.map((review, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{review.author}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{review.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Map */}
        {place.lat && place.lng && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Location</h2>
              <button 
                onClick={() => setNavigationDialogOpen(true)}
                className="text-sm text-primary hover:underline"
              >
                Get Directions →
              </button>
            </div>
            <iframe
              src={`https://www.google.com/maps?q=${place.lat},${place.lng}&output=embed`}
              className="w-full h-64 rounded-lg border-0"
              loading="lazy"
              title={`Map showing ${place.name} location`}
            />
          </section>
        )}

        {/* Google Attribution - Required by Google Terms of Service */}
        <div className="py-6 border-t border-border">
          <GoogleAttribution className="justify-center" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Place data provided by Google. Reviews and photos are from Google users.
          </p>
        </div>
      </main>

      {/* Navigation Dialog */}
      <MapNavigationDialog
        open={navigationDialogOpen}
        onOpenChange={setNavigationDialogOpen}
        address={place.address || place.name}
        latitude={place.lat}
        longitude={place.lng}
      />
    </div>
  );
};

export default GooglePlaceDetail;
