import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Wine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';

interface Winemaker {
  id: string;
  name: string;
  domain_name: string | null;
  region: string | null;
  country: string;
  bio: string | null;
  website: string | null;
  image_url: string | null;
  is_new: boolean | null;
  is_featured: boolean | null;
}

const WinemakerDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [winemaker, setWinemaker] = useState<Winemaker | null>(null);
  const [loading, setLoading] = useState(true);

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
      } else {
        setWinemaker(data);
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

          {/* Bio */}
          {winemaker.bio && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold text-foreground mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {winemaker.bio}
              </p>
            </div>
          )}

          {/* Website */}
          {winemaker.website && (
            <div className="pt-4 border-t border-border">
              <a 
                href={winemaker.website.startsWith('http') ? winemaker.website : `https://${winemaker.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Globe className="w-5 h-5" />
                Visit Website
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinemakerDetail;
