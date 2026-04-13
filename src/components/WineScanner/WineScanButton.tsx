import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { WineScannerSheet } from './WineScannerSheet';
import { motion, AnimatePresence } from 'framer-motion';

export const WineScanButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const dismissed = sessionStorage.getItem('wine-scan-cta-dismissed');
    if (dismissed) return;

    const showTimer = setTimeout(() => setShowCTA(true), 2000);
    const hideTimer = setTimeout(() => {
      setShowCTA(false);
      sessionStorage.setItem('wine-scan-cta-dismissed', '1');
    }, 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClick = () => {
    setShowCTA(false);
    sessionStorage.setItem('wine-scan-cta-dismissed', '1');
    setIsOpen(true);
  };

  return (
    <>
      <div className={`fixed z-50 ${isMobile ? 'bottom-20 right-4' : 'bottom-6 right-6'}`}>
        {/* CTA Tooltip */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={handleClick}
              className="absolute bottom-full right-0 mb-2 cursor-pointer"
            >
              <div className="bg-foreground text-background text-[11px] font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                Snap a photo, know your wine 🍷
                <div className="absolute -bottom-1 right-4 w-2 h-2 bg-foreground rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button */}
        {isMobile ? (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
            onClick={handleClick}
            className="h-10 w-10 rounded-full bg-foreground/80 backdrop-blur-sm text-background flex items-center justify-center shadow-lg hover:bg-foreground transition-colors"
            aria-label="Wine Scanner"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        ) : (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
            onClick={handleClick}
            className="h-9 px-4 rounded-full bg-foreground/80 backdrop-blur-sm text-background flex items-center gap-2 shadow-lg hover:bg-foreground transition-colors"
            aria-label="Wine Scanner"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Scan</span>
          </motion.button>
        )}
      </div>

      <WineScannerSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
