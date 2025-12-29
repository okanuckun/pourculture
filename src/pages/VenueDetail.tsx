import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { MapPin, Clock, Phone, Globe, Mail, ArrowLeft, Shield, CheckCircle, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClaimVenueDialog } from '@/components/ClaimVenueDialog';
import { MapNavigationDialog } from '@/components/MapNavigationDialog';

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
}

const VenueDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
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
        setVenue(data as Venue);
      }
      setLoading(false);
    };

    fetchVenue();
  }, [slug]);

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

  if (notFound || !venue) {
    return (
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Venue not found</h1>
          <p className="text-muted-foreground mb-6">The venue you're looking for doesn't exist.</p>
          <Link to="/discover">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discover
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const encodedAddress = encodeURIComponent(`${venue.address}, ${venue.city}, ${venue.country}`);
  const categoryLabel = venue.category.replace('_', ' ');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${venue.name} - Natural Wine ${categoryLabel}`}
        description={venue.description || `Visit ${venue.name}, a natural wine ${categoryLabel} in ${venue.city}, ${venue.country}`}
      />
      <RaisinNavbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          to="/discover" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover
        </Link>

        {/* Hero Image */}
        {venue.image_url ? (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
            <img 
              src={venue.image_url} 
              alt={venue.name}
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
              venue.is_open 
                ? 'bg-status-open/10 text-status-open' 
                : 'bg-status-closed/10 text-status-closed'
            }`}>
              {venue.is_open ? 'Open' : 'Closed'}
            </span>
            <span className="text-muted-foreground capitalize">{categoryLabel}</span>
            {venue.is_claimed && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-500/10 text-amber-600">
                <Star className="w-3 h-3 fill-current" />
                Verified Owner
              </span>
            )}
            {venue.google_rating && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-600">
                <Star className="w-3 h-3 fill-current" />
                {venue.google_rating.toFixed(1)}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{venue.name}</h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{venue.city}, {venue.country}</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button 
              onClick={() => setNavigationDialogOpen(true)}
              variant="default"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Yol Tarifi Al
            </Button>
            
            {/* Claim Button */}
            {!venue.is_claimed && user && (
              <Button 
                onClick={() => setClaimDialogOpen(true)}
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Claim This Venue
              </Button>
            )}
            {!venue.is_claimed && !user && (
              <Link to="/auth">
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Log in to Claim
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Story Section - for claimed venues */}
        {venue.story && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">Hikayemiz</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{venue.story}</p>
          </section>
        )}

        {/* Description */}
        {venue.description && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
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
                <p className="text-muted-foreground text-sm">{venue.address}</p>
                <p className="text-muted-foreground text-sm">{venue.city}, {venue.country}</p>
                <p className="text-primary text-xs mt-1">Haritada Aç →</p>
              </div>
            </button>

            {venue.phone && (
              <a 
                href={`tel:${venue.phone}`}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <p className="text-muted-foreground text-sm">{venue.phone}</p>
                </div>
              </a>
            )}

            {venue.email && (
              <a 
                href={`mailto:${venue.email}`}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-muted-foreground text-sm">{venue.email}</p>
                </div>
              </a>
            )}

            {venue.website && (
              <a 
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Globe className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Website</p>
                  <p className="text-muted-foreground text-sm truncate">{venue.website.replace(/^https?:\/\//, '')}</p>
                </div>
              </a>
            )}
          </div>
        </section>

        {/* Map */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Location</h2>
            <button 
              onClick={() => setNavigationDialogOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              Yol Tarifi Al →
            </button>
          </div>
          <iframe
            src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
            className="w-full h-64 rounded-lg border-0"
            loading="lazy"
            title={`Map showing ${venue.name} location`}
          />
        </section>
      </main>

      {/* Claim Dialog */}
      <ClaimVenueDialog
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        venueId={venue.id}
        venueName={venue.name}
        venueType="venue"
      />

      {/* Navigation Dialog */}
      <MapNavigationDialog
        open={navigationDialogOpen}
        onOpenChange={setNavigationDialogOpen}
        address={`${venue.address}, ${venue.city}, ${venue.country}`}
        latitude={venue.latitude}
        longitude={venue.longitude}
      />
    </div>
  );
};

export default VenueDetail;
