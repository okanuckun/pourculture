import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface GridHeroProps {
  gridVisible?: boolean;
}

export const GridHero: React.FC<GridHeroProps> = ({ gridVisible = false }) => {
  const letters = ['P', 'O', 'U', 'R'];
  const letters2 = ['C', 'U', 'L', 'T', 'U', 'R', 'E'];

  return (
    <section className="relative min-h-screen pt-14">
      {/* Grid Overlay */}
      {gridVisible && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="h-full w-full grid grid-cols-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-l border-foreground/5 h-full" />
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">
        {/* Main Typography Grid */}
        <div className="grid grid-cols-12 gap-2 md:gap-4">
          {/* POUR - Large Letters */}
          <div className="col-span-12 flex items-end">
            <div className="flex items-end gap-0">
              {letters.map((letter, index) => (
                <motion.span
                  key={`pour-${index}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-[15vw] md:text-[12vw] font-bold leading-none tracking-tighter text-foreground"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Description Text */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="col-span-12 md:col-span-6 lg:col-span-5 py-8"
          >
            <p className="text-lg md:text-xl text-foreground leading-relaxed">
              This platform is dedicated to natural wine enthusiasts.
              <br />
              Discover the best wine bars, shops, and winemakers.
            </p>
          </motion.div>

          {/* Grid Lines Visual */}
          <div className="hidden md:block col-span-6 lg:col-span-7 relative">
            <div className="absolute inset-0 flex items-center justify-end pr-8">
              <div className="w-full max-w-md h-px bg-foreground/20" />
            </div>
          </div>

          {/* CULTURE - Large Letters */}
          <div className="col-span-12 flex items-start justify-end">
            <div className="flex items-end gap-0">
              {letters2.map((letter, index) => (
                <motion.span
                  key={`culture-${index}`}
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.08, duration: 0.6 }}
                  className="text-[12vw] md:text-[10vw] font-bold leading-none tracking-tighter text-foreground"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Types Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 border-t border-foreground/10 pt-8"
        >
          <p className="text-sm text-muted-foreground mb-8">4 types of venues</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Wine Bars', emoji: '🍸', count: 156, path: '/explore/wine-bars' },
              { label: 'Wine Shops', emoji: '🍷', count: 89, path: '/explore/wine-shops' },
              { label: 'Restaurants', emoji: '🍽️', count: 234, path: '/explore/restaurants' },
              { label: 'Winemakers', emoji: '🍇', count: 67, path: '/explore/winemakers' },
            ].map((item, index) => (
              <Link
                key={item.label}
                to={item.path}
                className="group block"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                  className="relative aspect-square bg-foreground flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                >
                  <span className="text-6xl md:text-8xl">{item.emoji}</span>
                </motion.div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.count}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Large Typography Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-24 overflow-hidden"
        >
          <div className="flex items-center whitespace-nowrap animate-scroll-left">
            <span className="text-[20vw] font-bold tracking-tighter text-foreground/5">
              NATURAL WINE • ORGANIC • BIODYNAMIC • SUSTAINABLE •&nbsp;
            </span>
            <span className="text-[20vw] font-bold tracking-tighter text-foreground/5">
              NATURAL WINE • ORGANIC • BIODYNAMIC • SUSTAINABLE •&nbsp;
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
