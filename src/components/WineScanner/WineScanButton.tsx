import React, { useState } from 'react';
import { Camera, Wine } from 'lucide-react';
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
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 0 0 hsl(var(--primary) / 0.4)',
                '0 0 0 12px hsl(var(--primary) / 0)',
                '0 0 0 0 hsl(var(--primary) / 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110 border-2 border-foreground"
              size="icon"
              aria-label="Şarap Tara"
            >
              <div className="relative">
                <Wine className="h-7 w-7" />
                <Camera className="h-3.5 w-3.5 absolute -bottom-1 -right-1 bg-background text-foreground rounded-full p-0.5" />
              </div>
            </Button>
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full whitespace-nowrap bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-2 py-1"
          >
            Şarap Tara
          </motion.span>
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
            aria-label="Şarap Tara"
          >
            <div className="relative">
              <Wine className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Şarap Tara</span>
            <Camera className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      <WineScannerSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
