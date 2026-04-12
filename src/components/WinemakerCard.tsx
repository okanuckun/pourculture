import React from 'react';
import { MapPin, ArrowUpRight, Grape } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WinemakerCardProps {
  id: string;
  name: string;
  domainName?: string;
  region?: string;
  country: string;
  imageUrl?: string;
  isNew?: boolean;
  onClick?: () => void;
}

export const WinemakerCard: React.FC<WinemakerCardProps> = ({
  name,
  domainName,
  region,
  country,
  imageUrl,
  isNew,
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
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img loading="lazy" 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-foreground/5">
            <Grape className="w-16 h-16 text-foreground/20" />
          </div>
        )}
        
        {/* New Badge */}
        {isNew && (
          <div className="absolute top-3 left-3">
            <div className="px-2 py-1 bg-foreground text-background text-xs font-bold uppercase tracking-wide">
              NEW
            </div>
          </div>
        )}

        {/* Arrow overlay on hover */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-background bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 border-t-2 border-foreground/20 group-hover:border-foreground transition-colors">
        <h3 className="font-bold text-foreground uppercase tracking-tight group-hover:underline">
          {name}
        </h3>
        {domainName && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {domainName}
          </p>
        )}
        
        <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {region && `${region}, `}{country}
          </span>
        </div>
      </div>
    </div>
  );
};
