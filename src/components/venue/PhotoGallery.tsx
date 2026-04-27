import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { normalizePhotoUrl } from '@/lib/venuePhoto';

interface PhotoGalleryProps {
  // Accept anything photo-like; we normalize below.
  photos: unknown;
  venueName: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos: rawPhotos, venueName }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const photos = useMemo<string[]>(() => {
    if (!Array.isArray(rawPhotos)) return [];
    const out: string[] = [];
    for (const item of rawPhotos) {
      if (typeof item === 'string' && item.length > 0) {
        out.push(normalizePhotoUrl(item));
      } else if (item && typeof item === 'object' && 'url' in (item as object)) {
        const url = (item as { url?: unknown }).url;
        if (typeof url === 'string' && url.length > 0) out.push(normalizePhotoUrl(url));
      }
    }
    return out;
  }, [rawPhotos]);

  if (photos.length === 0) {
    return null;
  }

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === photos.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Photo Gallery</h2>
        <span className="text-muted-foreground text-sm">({photos.length})</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {photos.slice(0, 8).map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <img loading="lazy" 
              src={photo} 
              alt={`${venueName} - ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {index === 7 && photos.length > 8 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">+{photos.length - 8}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <div className="relative">
            {selectedIndex !== null && (
              <img loading="lazy" 
                src={photos[selectedIndex]} 
                alt={`${venueName} - ${selectedIndex + 1}`}
                className="w-full max-h-[80vh] object-contain"
              />
            )}
            
            {/* Close button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
              {selectedIndex !== null ? selectedIndex + 1 : 0} / {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
