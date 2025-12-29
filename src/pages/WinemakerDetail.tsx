import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Globe, Wine, Star, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { ClaimVenueDialog } from '@/components/ClaimVenueDialog';
import { PhotoGallery, SocialLinks, WineList, VenueReviews } from '@/components/venue';
import { motion } from 'framer-motion';

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
      <BrutalistLayout>
        <SEOHead title="Loading Winemaker..." description="Loading winemaker details..." />
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-80 w-full mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </BrutalistLayout>
    );
  }

  if (!winemaker) {
    return (
      <BrutalistLayout>
        <SEOHead title="Winemaker Not Found" description="The winemaker you're looking for doesn't exist." />
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 text-center">
          <Wine className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">WINEMAKER NOT FOUND</h1>
          <p className="text-muted-foreground mb-6 text-sm">The winemaker you're looking for doesn't exist.</p>
          <Button asChild className="border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background">
            <Link to="/explore/winemakers">Browse Winemakers</Link>
          </Button>
        </div>
      </BrutalistLayout>
    );
  }

  return (
    <BrutalistLayout
      showBackButton
      backPath="/explore/winemakers"
      backLabel="Winemakers"
    >
      <SEOHead 
        title={`${winemaker.name} - Natural Wine Producer`}
        description={winemaker.bio || `Discover ${winemaker.name}, a natural wine producer from ${winemaker.region ? `${winemaker.region}, ` : ''}${winemaker.country}.`}
      />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-[16/9] border-2 border-foreground overflow-hidden mb-8"
        >
          {winemaker.image_url ? (
            <img 
              src={winemaker.image_url} 
              alt={winemaker.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-8xl">🍇</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {winemaker.is_new && (
              <span className="px-3 py-1 bg-foreground text-background text-[10px] tracking-wider font-medium">
                NEW
              </span>
            )}
            {winemaker.is_featured && (
              <span className="px-3 py-1 bg-foreground text-background text-[10px] tracking-wider font-medium">
                FEATURED
              </span>
            )}
            {winemaker.is_claimed && (
              <span className="px-3 py-1 bg-foreground text-background text-[10px] tracking-wider font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                VERIFIED
              </span>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
              {winemaker.name}
            </h1>
            {winemaker.domain_name && (
              <p className="text-lg text-muted-foreground">
                {winemaker.domain_name}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 border-l-2 border-foreground pl-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm tracking-wide">
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
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground text-xs tracking-wider font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                <Globe className="w-3 h-3" />
                WEBSITE
              </a>
            )}
            
            {!winemaker.is_claimed && user && (
              <button 
                onClick={() => setClaimDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground text-xs tracking-wider font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                <Shield className="w-3 h-3" />
                CLAIM PROFILE
              </button>
            )}
            {!winemaker.is_claimed && !user && (
              <Link 
                to="/auth"
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground text-xs tracking-wider font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                <Shield className="w-3 h-3" />
                LOG IN TO CLAIM
              </Link>
            )}
          </div>

          {/* Photo Gallery */}
          {winemaker.photos && winemaker.photos.length > 0 && (
            <div className="border-t border-foreground/20 pt-8">
              <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">GALLERY</h2>
              <PhotoGallery photos={winemaker.photos} venueName={winemaker.name} />
            </div>
          )}

          {/* Story */}
          {winemaker.story && (
            <div className="border-t border-foreground/20 pt-8">
              <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">OUR STORY</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {winemaker.story}
              </p>
            </div>
          )}

          {/* Bio */}
          {winemaker.bio && (
            <div className="border-t border-foreground/20 pt-8">
              <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">ABOUT</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {winemaker.bio}
              </p>
            </div>
          )}

          {/* Wine List */}
          {winemaker.wine_list && winemaker.wine_list.length > 0 && (
            <div className="border-t border-foreground/20 pt-8">
              <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">OUR WINES</h2>
              <WineList wines={winemaker.wine_list.map(w => ({
                name: w.name,
                grape: w.grape,
                region: w.region,
                description: w.description,
                price: w.year
              }))} />
            </div>
          )}

          {/* Reviews */}
          <div className="border-t border-foreground/20 pt-8">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">REVIEWS</h2>
            <VenueReviews 
              venueId={winemaker.id} 
              venueType="winemaker" 
              userId={user?.id} 
            />
          </div>
        </motion.div>
      </div>

      {/* Claim Dialog */}
      <ClaimVenueDialog
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        venueId={winemaker.id}
        venueName={winemaker.name}
        venueType="winemaker"
      />
    </BrutalistLayout>
  );
};

export default WinemakerDetail;
