import React from 'react';
import { MapPin, Clock, ExternalLink, Star, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface VenueCardProps {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  imageUrl?: string;
  isOpen?: boolean;
  openingHours?: string;
  isClaimed?: boolean;
  googleRating?: number | null;
  source?: 'database' | 'google';
  onClick?: () => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({
  name,
  category,
  address,
  city,
  imageUrl,
  isOpen = true,
  openingHours,
  isClaimed = false,
  googleRating,
  source = 'database',
  onClick,
}) => {
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
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-4xl">🍷</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            isOpen 
              ? "bg-status-open/10 text-status-open" 
              : "bg-status-closed/10 text-status-closed"
          )}>
            <span className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isOpen ? "bg-status-open animate-pulse" : "bg-status-closed"
              )} />
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          
          {/* Verified/Unverified Badge */}
          {isClaimed ? (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/90 text-white flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Doğrulanmış
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-muted/90 backdrop-blur-sm text-muted-foreground flex items-center gap-1 cursor-help">
                    <AlertCircle className="w-3 h-3" />
                    Doğrulanmamış
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] text-center">
                  <p className="text-xs">
                    {source === 'google' 
                      ? 'Bu mekanın sahibi henüz siteye üye değil. Bilgiler Google\'dan alınmaktadır.'
                      : 'Bu mekanın sahibi henüz sitemize üye değil veya mekanını talep etmedi.'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Opening Hours */}
        {openingHours && (
          <div className="absolute top-3 left-3">
            <div className="px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {openingHours}
            </div>
          </div>
        )}
        
        {/* Google Rating */}
        {googleRating && (
          <div className="absolute bottom-3 left-3">
            <div className="px-2 py-1 rounded-full bg-yellow-500/90 text-white text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {googleRating.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground capitalize mt-0.5">
              {category.replace('_', ' ')}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </div>
        
        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{address}, {city}</span>
        </div>
      </div>
    </div>
  );
};
