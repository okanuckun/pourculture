import React from 'react';
import { MapPin, X } from 'lucide-react';

interface LocationBannerProps {
  onAllow: () => void;
  onDismiss: () => void;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({ onAllow, onDismiss }) => {
  return (
    <div className="fixed left-0 right-0 bottom-24 z-50 px-4">
      <div className="max-w-md mx-auto bg-foreground text-background p-4 flex items-center gap-3 shadow-lg border border-foreground/20">
        <MapPin className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold tracking-wider">FIND VENUES NEAR YOU</p>
          <p className="text-[10px] opacity-70 mt-0.5">Allow location to discover nearby spots</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onAllow}
            className="px-3 py-1.5 text-[10px] font-bold tracking-wider bg-background text-foreground hover:opacity-90 transition-opacity"
          >
            ALLOW
          </button>
          <button onClick={onDismiss} className="p-1 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
