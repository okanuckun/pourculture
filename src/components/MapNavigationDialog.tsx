import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface MapNavigationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const MapNavigationDialog: React.FC<MapNavigationDialogProps> = ({
  open,
  onOpenChange,
  address,
  latitude,
  longitude,
}) => {
  const encodedAddress = encodeURIComponent(address);
  
  // Use coordinates if available, otherwise use address
  const googleMapsUrl = latitude && longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  
  const appleMapsUrl = latitude && longitude
    ? `https://maps.apple.com/?daddr=${latitude},${longitude}`
    : `https://maps.apple.com/?daddr=${encodedAddress}`;

  const handleOpenMap = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Yol Tarifi Al
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {address}
          </p>
          
          <div className="grid gap-3 pt-2">
            <Button
              onClick={() => handleOpenMap(googleMapsUrl)}
              className="w-full justify-start gap-3 h-12"
              variant="outline"
            >
              <img 
                src="https://www.google.com/images/branding/product/1x/maps_64dp.png" 
                alt="Google Maps" 
                className="w-6 h-6"
              />
              Google Maps ile Aç
            </Button>
            
            <Button
              onClick={() => handleOpenMap(appleMapsUrl)}
              className="w-full justify-start gap-3 h-12"
              variant="outline"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6"
                fill="none"
              >
                <rect width="24" height="24" rx="5" fill="#000"/>
                <path 
                  d="M12 6L18 12L12 18L6 12L12 6Z" 
                  fill="#34C759"
                />
                <path 
                  d="M12 8L16 12L12 16L8 12L12 8Z" 
                  fill="#fff"
                />
              </svg>
              Apple Maps ile Aç
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};