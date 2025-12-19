import React from 'react';
import { Calendar, MapPin, Ticket, Users } from 'lucide-react';
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
        return `${format(start, 'EEEE MMMM d')} - ${format(end, 'EEEE d')}`;
      }
      return `${format(start, 'EEEE MMMM d')} - ${format(end, 'EEEE MMMM d')}`;
    }
    return format(start, 'EEEE MMMM d');
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg bg-card cursor-pointer",
        "shadow-card hover:shadow-card-hover transition-all duration-300",
        "hover:-translate-y-1"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-5xl">🍷</span>
          </div>
        )}
        
        {/* Pro Only Badge */}
        {isProOnly && (
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 rounded-full bg-foreground text-background text-xs font-medium flex items-center gap-1">
              <Users className="w-3 h-3" />
              Pro only ✅
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-4 space-y-2">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase">Price</span>
            <span className="text-sm font-medium text-foreground">{price || '-'}</span>
          </div>

          {/* Ticket Button */}
          {ticketUrl && (
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              <Ticket className="w-4 h-4" />
              🎟 TICKETS
            </a>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
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
              <span className="text-xs text-muted-foreground">{distance}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
