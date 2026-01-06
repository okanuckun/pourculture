import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { WineScannerSheet } from './WineScannerSheet';

export const WineScanButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110"
        size="icon"
        aria-label="Şarap Tara"
      >
        <Camera className="h-6 w-6" />
      </Button>

      <WineScannerSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
