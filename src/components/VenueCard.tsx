import React from 'react';
import { MapPin, Clock, ArrowUpRight, Star, AlertCircle } from 'lucide-react';
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
        "group relative overflow-hidden cursor-pointer",
        "border-2 border-foreground/20 hover:border-foreground",
        "bg-background transition-all duration-300"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-foreground/5">
            <span className="text-4xl">🍷</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <div className={cn(
            "px-2 py-1 text-xs font-bold uppercase tracking-wide border-2",
            isOpen 
              ? "bg-background border-foreground text-foreground" 
              : "bg-foreground/10 border-foreground/50 text-foreground/70"
          )}>
            <span className="flex items-center gap-1.5">
              <span className={cn(
                "w-2 h-2",
                isOpen ? "bg-green-500 animate-pulse" : "bg-foreground/40"
              )} />
              {isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          
          {/* Verified/Unverified Badge */}
          {isClaimed ? (
            <div className="px-2 py-1 text-xs font-bold uppercase tracking-wide bg-amber-500 text-white border-2 border-amber-600 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              VERIFIED
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="px-2 py-1 text-xs font-medium bg-background/90 backdrop-blur-sm border-2 border-foreground/20 text-muted-foreground flex items-center gap-1 cursor-help">
                    <AlertCircle className="w-3 h-3" />
                    UNVERIFIED
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] text-center border-2 border-foreground">
                  <p className="text-xs">
                    {source === 'google' 
                      ? 'This venue owner has not yet claimed their profile. Information is sourced from Google.'
                      : 'This venue owner has not yet claimed their profile on our platform.'
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
            <div className="px-2 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1 border-2 border-foreground/20">
              <Clock className="w-3 h-3" />
              {openingHours}
            </div>
          </div>
        )}
        
        {/* Google Rating */}
        {googleRating && (
          <div className="absolute bottom-3 left-3">
            <div className="px-2 py-1 bg-foreground text-background text-xs font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {googleRating.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 border-t-2 border-foreground/20 group-hover:border-foreground transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate uppercase tracking-tight group-hover:underline transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground capitalize mt-0.5">
              {category.replace('_', ' ')}
            </p>
          </div>
          <div className="w-8 h-8 border-2 border-foreground/20 group-hover:border-foreground group-hover:bg-foreground flex items-center justify-center transition-all flex-shrink-0">
            <ArrowUpRight className="w-4 h-4 group-hover:text-background transition-colors" />
          </div>
        </div>
        
        <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{address}, {city}</span>
        </div>
      </div>
    </div>
  );
};
