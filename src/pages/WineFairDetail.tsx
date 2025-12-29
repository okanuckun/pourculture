import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, ExternalLink, Ticket, Wine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

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
      <BrutalistLayout>
        <SEOHead title="Loading Wine Fair..." description="Loading wine fair details..." />
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </BrutalistLayout>
    );
  }

  if (!wineFair) {
    return (
      <BrutalistLayout>
        <SEOHead title="Wine Fair Not Found" description="The wine fair you're looking for doesn't exist." />
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 text-center">
          <Wine className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">WINE FAIR NOT FOUND</h1>
          <p className="text-muted-foreground mb-6 text-sm">The wine fair you're looking for doesn't exist.</p>
          <Button asChild className="border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background">
            <Link to="/explore/wine-fairs">Browse Wine Fairs</Link>
          </Button>
        </div>
      </BrutalistLayout>
    );
  }

  return (
    <BrutalistLayout
      showBackButton
      backPath="/explore/wine-fairs"
      backLabel="Wine Fairs"
    >
      <SEOHead 
        title={`${wineFair.title} - Natural Wine Fair`}
        description={wineFair.description || `${wineFair.title} in ${wineFair.city}, ${wineFair.country}. ${formatDateRange(wineFair.start_date, wineFair.end_date)}.`}
      />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Poster Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-[3/4] md:aspect-[16/9] border-2 border-foreground overflow-hidden mb-8"
        >
          {wineFair.poster_url ? (
            <img 
              src={wineFair.poster_url} 
              alt={wineFair.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-8xl">🍷</span>
            </div>
          )}
          
          {wineFair.is_pro_only && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-foreground text-background text-[10px] tracking-wider font-medium">
                PRO ONLY
              </span>
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
              {wineFair.title}
            </h1>
            {wineFair.venue_name && (
              <p className="text-lg text-muted-foreground">
                {wineFair.venue_name}
              </p>
            )}
          </div>

          {/* Date & Location */}
          <div className="flex flex-col gap-3 border-l-2 border-foreground pl-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm tracking-wide">
                {formatDateRange(wineFair.start_date, wineFair.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm tracking-wide">
                {wineFair.city}, {wineFair.country}
              </span>
            </div>
          </div>

          {/* Price & Tickets */}
          {(wineFair.price || wineFair.ticket_url) && (
            <div className="flex flex-wrap items-center gap-4 p-4 border-2 border-foreground/20">
              {wineFair.price && (
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  <span className="font-medium text-sm">{wineFair.price}</span>
                </div>
              )}
              {wineFair.ticket_url && (
                <a 
                  href={wineFair.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs tracking-wider font-medium hover:bg-foreground/90 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  GET TICKETS
                </a>
              )}
            </div>
          )}

          {/* Description */}
          {wineFair.description && (
            <div className="border-t border-foreground/20 pt-6">
              <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">ABOUT</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {wineFair.description}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </BrutalistLayout>
  );
};

export default WineFairDetail;
