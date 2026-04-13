import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { WineScannerSheet } from './WineScannerSheet';
import { motion } from 'framer-motion';

export const WineScanButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-50 h-10 w-10 rounded-full bg-foreground/80 backdrop-blur-sm text-background flex items-center justify-center shadow-lg hover:bg-foreground transition-colors"
          aria-label="Wine Scanner"
        >
          <Camera className="h-4 w-4" />
        </motion.button>
      ) : (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-9 px-4 rounded-full bg-foreground/80 backdrop-blur-sm text-background flex items-center gap-2 shadow-lg hover:bg-foreground transition-colors"
          aria-label="Wine Scanner"
        >
          <Camera className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-widest">Scan</span>
        </motion.button>
      )}

      <WineScannerSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
