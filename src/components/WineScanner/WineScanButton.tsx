import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { WineScannerSheet } from './WineScannerSheet';
import { motion } from 'framer-motion';

export const WineScanButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile: Floating Action Button */}
      {isMobile ? (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 px-4 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 border-2 border-foreground gap-2"
            aria-label="Wine Scanner"
          >
            <Camera className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Scan</span>
          </Button>
        </motion.div>
      ) : (
        /* Desktop: Fixed bottom-right button with label */
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-12 px-5 rounded-none shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 border-2 border-foreground gap-2 group"
            aria-label="Wine Scanner"
          >
            <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Wine Scanner</span>
          </Button>
        </motion.div>
      )}

      <WineScannerSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
