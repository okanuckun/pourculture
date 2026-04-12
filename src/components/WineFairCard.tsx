import React from 'react';
import { Calendar, MapPin, Ticket, Users, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface WineFairCardProps {
  id: string;
  title: string;
  description?: string;
  posterUrl?: string;
  price?: string;
  ticketUrl?: string;
  startDate: string;
  endDate?: string;
  city: string;
  country?: string;
  isProOnly?: boolean;
  distance?: string;
  onClick?: () => void;
}

export const WineFairCard: React.FC<WineFairCardProps> = ({
  title,
  description,
  posterUrl,
  price,
  ticketUrl,
  startDate,
  endDate,
  city,
  country,
  isProOnly,
  distance,
  onClick,
}) => {
  const formatDateRange = () => {
    const start = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(start, 'MMMM d, yyyy');
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-pointer",
        "border-2 border-foreground/20 hover:border-foreground",
        "bg-background transition-all duration-300"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {posterUrl ? (
          <img loading="lazy" 
            src={posterUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-foreground/5">
            <Calendar className="w-16 h-16 text-foreground/20" />
          </div>
        )}
        
        {/* Pro Only Badge */}
        {isProOnly && (
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 bg-foreground text-background text-xs font-bold uppercase tracking-wide flex items-center gap-1">
              <Users className="w-3 h-3" />
              PRO ONLY
            </div>
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-2 bg-background/95 backdrop-blur-sm border-2 border-foreground">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {format(new Date(startDate), 'MMM')}
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {format(new Date(startDate), 'd')}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 border-t-2 border-foreground/20 group-hover:border-foreground transition-colors">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground uppercase tracking-tight group-hover:underline line-clamp-2 flex-1">
            {title}
          </h3>
          <div className="w-8 h-8 border-2 border-foreground/20 group-hover:border-foreground group-hover:bg-foreground flex items-center justify-center transition-all flex-shrink-0">
            <ArrowUpRight className="w-4 h-4 group-hover:text-background transition-colors" />
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-4 space-y-3">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{formatDateRange()}</span>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{city}{country && `, ${country}`}</span>
            </div>
            {distance && (
              <span className="text-xs text-muted-foreground font-medium">{distance}</span>
            )}
          </div>

          {/* Price & Ticket */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-foreground/10">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Price</span>
              <p className="font-bold">{price || 'TBA'}</p>
            </div>
            
            {ticketUrl && (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold uppercase tracking-wide hover:bg-foreground/90 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                TICKETS
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
