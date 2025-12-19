import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, ExternalLink, Ticket, Wine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { format, parseISO } from 'date-fns';

interface WineFair {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  venue_name: string | null;
  city: string;
  country: string;
  start_date: string;
  end_date: string | null;
  poster_url: string | null;
  price: string | null;
  ticket_url: string | null;
  is_pro_only: boolean | null;
}

const WineFairDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [wineFair, setWineFair] = useState<WineFair | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWineFair = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('wine_fairs')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching wine fair:', error);
      } else {
        setWineFair(data);
      }
      setLoading(false);
    };

    fetchWineFair();
  }, [slug]);

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = parseISO(startDate);
    if (!endDate) {
      return format(start, 'MMMM d, yyyy');
    }
    const end = parseISO(endDate);
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-96 w-full rounded-2xl mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!wineFair) {
    return (
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <Wine className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Wine Fair Not Found</h1>
          <p className="text-muted-foreground mb-6">The wine fair you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/explore/wine-fairs">Browse Wine Fairs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${wineFair.title} - Natural Wine Fair`}
        description={wineFair.description || `${wineFair.title} in ${wineFair.city}, ${wineFair.country}. ${formatDateRange(wineFair.start_date, wineFair.end_date)}.`}
      />
      <RaisinNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/explore/wine-fairs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wine Fairs
        </Link>

        {/* Poster Image */}
        <div className="relative aspect-[3/4] md:aspect-[16/9] rounded-2xl overflow-hidden bg-muted mb-8">
          {wineFair.poster_url ? (
            <img 
              src={wineFair.poster_url} 
              alt={wineFair.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-wine-red/10 to-primary/10">
              <span className="text-8xl">🍷</span>
            </div>
          )}
          
          {/* Pro Only Badge */}
          {wineFair.is_pro_only && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                Pro Only
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {wineFair.title}
            </h1>
            {wineFair.venue_name && (
              <p className="text-xl text-muted-foreground">
                {wineFair.venue_name}
              </p>
            )}
          </div>

          {/* Date & Location */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <span className="text-lg">
                {formatDateRange(wineFair.start_date, wineFair.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="text-lg">
                {wineFair.city}, {wineFair.country}
              </span>
            </div>
          </div>

          {/* Price & Tickets */}
          {(wineFair.price || wineFair.ticket_url) && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-xl">
              {wineFair.price && (
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{wineFair.price}</span>
                </div>
              )}
              {wineFair.ticket_url && (
                <Button asChild>
                  <a 
                    href={wineFair.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Tickets
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Description */}
          {wineFair.description && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold text-foreground mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {wineFair.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WineFairDetail;
