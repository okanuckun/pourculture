import React from 'react';
import { MapPin } from 'lucide-react';
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
        "group relative overflow-hidden rounded-lg bg-card cursor-pointer",
        "shadow-card hover:shadow-card-hover transition-all duration-300",
        "hover:-translate-y-1"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-wine-red/10 to-primary/10">
            <span className="text-5xl">🍇</span>
          </div>
        )}
        
        {/* New Badge */}
        {isNew && (
          <div className="absolute top-3 left-3">
            <div className="px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              New
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        {domainName && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {domainName}
          </p>
        )}
        
        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {region && `${region}, `}{country}
          </span>
        </div>
      </div>
    </div>
  );
};
