import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { HomeWineMap } from '@/components/WineMap/HomeWineMap';

interface BrutalistHeroProps {
  minimalMapStyle?: boolean;
}

export const BrutalistHero: React.FC<BrutalistHeroProps> = ({ minimalMapStyle = true }) => {
  const categories = [
    { label: 'OVERVIEW', active: true },
    { label: 'WINE BARS', active: false },
    { label: 'SHOPS', active: false },
    { label: 'RESTAURANTS', active: false },
    { label: 'WINEMAKERS', active: false },
    { label: 'EVENTS', active: false },
  ];

  const contentIndex = [
    { id: '00-0', label: 'INTRO', starred: true },
    { id: '00-1', label: 'FEATURED VENUES', starred: true },
    { id: '00-2', label: 'WINE BARS', starred: true },
    { id: '00-3', label: 'WINE SHOPS', starred: true },
    { id: '00-4', label: 'RESTAURANTS', starred: true },
    { id: '00-5', label: 'WINEMAKERS', starred: true },
    { id: '00-6', label: 'EVENTS', starred: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Navbar */}
      <header className="border-b border-foreground/20">
        <div className="flex items-center justify-between h-12 px-4">
          <Link to="/" className="text-sm font-bold tracking-tight">
            POURCULTURE
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/submit-venue" className="text-muted-foreground hover:text-foreground transition-colors">
              SUBMIT
            </Link>
            <Link to="/claim-venue" className="text-muted-foreground hover:text-foreground transition-colors">
              CLAIM
            </Link>
            <Link to="/auth" className="hover:text-muted-foreground transition-colors">
              SIGN IN
            </Link>
            <span className="flex items-center gap-1">
              FAVS
              <span className="w-5 h-5 rounded-full border border-foreground flex items-center justify-center text-[10px]">
                0
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Map Section - Full Width */}
      <div className="border-b border-foreground/20">
        <HomeWineMap minimalStyle={minimalMapStyle} />
      </div>
      {/* Category Pills */}
      <div className="border-b border-foreground/20 py-3 px-4 overflow-x-auto">
        <div className="flex items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className={`px-4 py-1.5 text-[10px] tracking-wider rounded-sm transition-colors whitespace-nowrap ${
                cat.active 
                  ? 'bg-foreground text-background' 
                  : 'border border-foreground/20 hover:border-foreground/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Typography */}
      <div className="px-4 py-12 border-b border-foreground/20">
        <div className="flex items-start justify-between">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[12vw] md:text-[10vw] font-bold tracking-tighter leading-[0.85]"
          >
            VENUES
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ArrowDown className="w-16 h-16 md:w-24 md:h-24" strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>

      {/* Mixed Typography Section */}
      <div className="px-4 py-12 border-b border-foreground/20">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="text-[8vw] md:text-[5vw] font-bold tracking-tighter leading-[0.9]">
                DISCOVERING
              </h2>
              <span className="text-[15vw] md:text-[8vw] font-bold tracking-tighter leading-[0.8]">
                &amp;
              </span>
            </motion.div>
          </div>
          
          <div className="col-span-12 md:col-span-3 flex items-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[9px] md:text-[10px] leading-relaxed uppercase tracking-wider text-muted-foreground"
            >
              FROM WINE BARS TO WINE SHOPS,
              RESTAURANTS, WINEMAKERS,
              AND... MORE COMING SOON :)
            </motion.p>
          </div>

          <div className="col-span-12 md:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-right"
            >
              <h2 className="text-[8vw] md:text-[5vw] font-bold tracking-tighter leading-[0.9]">
                NATURAL
              </h2>
              <h2 className="text-[8vw] md:text-[5vw] font-bold tracking-tighter leading-[0.9]">
                WINE
              </h2>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mt-8">
          <div className="col-span-12 md:col-span-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              FORMALIZING THE BEST NATURAL WINE
              SPOTS. SOME VERIFIED, SOME DISCOVERED.
              ALL CURATED WITH LOVE.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5">
            <h2 className="text-[10vw] md:text-[6vw] font-bold tracking-tighter leading-[0.85]">
              VARIOUS
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5">
            <h2 className="text-[10vw] md:text-[6vw] font-bold tracking-tighter leading-[0.85] text-right">
              LOCATIONS
            </h2>
          </div>
        </div>
      </div>

      {/* Content Index */}
      <div className="grid grid-cols-12 border-b border-foreground/20">
        <div className="col-span-12 md:col-span-4 border-r border-foreground/20 p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">CONTENT</p>
          <div className="space-y-1">
            {contentIndex.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between text-xs py-1 hover:bg-muted/50 px-2 -mx-2 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">[{item.id}]</span>
                  <span className={item.id === '00-0' ? 'bg-foreground text-background px-2' : ''}>
                    {item.label}
                  </span>
                </div>
                {item.starred && <span className="text-muted-foreground">★</span>}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">RE: ROUTING</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-4 py-1">
                <span className="text-muted-foreground">[00-7]</span>
                <span>ROUTING</span>
              </div>
              <div className="flex items-center gap-4 py-1">
                <span className="text-muted-foreground">[00-8]</span>
                <span>INDEX</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8 p-4">
          {/* Products/Venues Grid Header */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {['WINE BARS', 'SHOPS', 'RESTAURANTS', 'WINEMAKERS'].map((cat) => (
              <div key={cat} className="text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  MOST POPULAR
                </span>
                <div className="w-4 h-4 border border-foreground rounded-full mx-auto mt-2" />
              </div>
            ))}
          </div>

          {/* Venue Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'V.001', name: 'Septime Cave', tags: ['VERIFIED', 'BAR'], city: 'PARIS' },
              { id: 'V.002', name: 'Noble Rot', tags: ['VERIFIED', 'RESTAURANT'], city: 'LONDON' },
              { id: 'V.003', name: 'Ten Bells', tags: ['VERIFIED', 'BAR'], city: 'NEW YORK', isNew: true },
              { id: 'V.004', name: 'Le Verre Volé', tags: ['VERIFIED', 'SHOP'], city: 'PARIS' },
            ].map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-2">
                  <span>{venue.id}</span>
                  <div className="flex gap-1">
                    {venue.tags.map((tag) => (
                      <span key={tag} className="border border-foreground/20 px-1.5 py-0.5 rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span>{venue.city}</span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium group-hover:underline">{venue.name}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {venue.isNew && (
                    <span className="absolute top-2 left-2 bg-foreground text-background text-[8px] px-2 py-0.5">
                      NEW
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/20 group-hover:opacity-80 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
