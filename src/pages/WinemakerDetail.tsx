import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Wine, Star, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { ClaimVenueDialog } from '@/components/ClaimVenueDialog';
import { PhotoGallery, SocialLinks, WineList, VenueReviews } from '@/components/venue';

interface WineItem {
  name: string;
  grape?: string;
  region?: string;
  year?: string;
  description?: string;
}

interface Winemaker {
  id: string;
  name: string;
  slug: string;
  domain_name: string | null;
  region: string | null;
  country: string;
  bio: string | null;
  website: string | null;
  image_url: string | null;
  is_new: boolean | null;
  is_featured: boolean | null;
  is_claimed: boolean | null;
  owner_id: string | null;
  story: string | null;
  photos: string[] | null;
  wine_list: WineItem[] | null;
  social_links: Record<string, string> | null;
}

const WinemakerDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [winemaker, setWinemaker] = useState<Winemaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const fetchWinemaker = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('winemakers')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching winemaker:', error);
      } else if (data) {
        const winemakerData: Winemaker = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          domain_name: data.domain_name,
          region: data.region,
          country: data.country,
          bio: data.bio,
          website: data.website,
          image_url: data.image_url,
          is_new: data.is_new,
          is_featured: data.is_featured,
          is_claimed: data.is_claimed,
          owner_id: data.owner_id,
          story: data.story,
          photos: Array.isArray(data.photos) ? (data.photos as unknown as string[]) : [],
          wine_list: Array.isArray(data.wine_list) ? (data.wine_list as unknown as WineItem[]) : [],
          social_links: (typeof data.social_links === 'object' && data.social_links !== null && !Array.isArray(data.social_links)) 
            ? (data.social_links as unknown as Record<string, string>) : {}
        };
        setWinemaker(winemakerData);
      }
      setLoading(false);
    };

    fetchWinemaker();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-80 w-full rounded-2xl mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!winemaker) {
    return (
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <Wine className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Winemaker Not Found</h1>
          <p className="text-muted-foreground mb-6">The winemaker you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/explore/winemakers">Browse Winemakers</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${winemaker.name} - Natural Wine Producer`}
        description={winemaker.bio || `Discover ${winemaker.name}, a natural wine producer from ${winemaker.region ? `${winemaker.region}, ` : ''}${winemaker.country}.`}
      />
      <RaisinNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/explore/winemakers"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Winemakers
        </Link>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted mb-8">
          {winemaker.image_url ? (
            <img 
              src={winemaker.image_url} 
              alt={winemaker.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-wine-red/10 to-primary/10">
              <span className="text-8xl">🍇</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {winemaker.is_new && (
              <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                New
              </span>
            )}
            {winemaker.is_featured && (
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                Featured
              </span>
            )}
            {winemaker.is_claimed && (
              <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-sm font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {winemaker.name}
            </h1>
            {winemaker.domain_name && (
              <p className="text-xl text-muted-foreground">
                {winemaker.domain_name}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span className="text-lg">
              {winemaker.region && `${winemaker.region}, `}{winemaker.country}
            </span>
          </div>

          {/* Social Links */}
          {winemaker.social_links && Object.keys(winemaker.social_links).length > 0 && (
            <SocialLinks links={winemaker.social_links} />
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {winemaker.website && (
              <a 
                href={winemaker.website.startsWith('http') ? winemaker.website : `https://${winemaker.website}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </Button>
              </a>
            )}
            
            {!winemaker.is_claimed && user && (
              <Button 
                onClick={() => setClaimDialogOpen(true)}
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Claim Profile
              </Button>
            )}
            {!winemaker.is_claimed && !user && (
              <Link to="/auth">
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Log in to Claim
                </Button>
              </Link>
            )}
          </div>

          {/* Photo Gallery */}
          {winemaker.photos && winemaker.photos.length > 0 && (
            <PhotoGallery photos={winemaker.photos} venueName={winemaker.name} />
          )}

          {/* Story */}
          {winemaker.story && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold text-foreground mb-3">Hikayemiz</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {winemaker.story}
              </p>
            </div>
          )}

          {/* Bio */}
          {winemaker.bio && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold text-foreground mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {winemaker.bio}
              </p>
            </div>
          )}

          {/* Wine List */}
          {winemaker.wine_list && winemaker.wine_list.length > 0 && (
            <WineList wines={winemaker.wine_list.map(w => ({
              name: w.name,
              grape: w.grape,
              region: w.region,
              description: w.description,
              price: w.year
            }))} title="Şaraplarımız" />
          )}

          {/* Reviews */}
          <VenueReviews 
            venueId={winemaker.id} 
            venueType="winemaker" 
            userId={user?.id} 
          />
        </div>
      </div>

      {/* Claim Dialog */}
      <ClaimVenueDialog
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        venueId={winemaker.id}
        venueName={winemaker.name}
        venueType="winemaker"
      />
    </div>
  );
};

export default WinemakerDetail;
