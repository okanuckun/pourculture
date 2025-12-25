import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, MapPin, Users, Grape, X } from 'lucide-react';

interface CountryData {
  id: string;
  name: string;
  slug: string;
  vineyards: number;
  wineBars: number;
  specialties: string[];
  description: string;
  emoji: string;
}

const countryData: Record<string, CountryData> = {
  france: {
    id: 'france',
    name: 'France',
    slug: 'france',
    vineyards: 42,
    wineBars: 156,
    specialties: ['Burgundy', 'Bordeaux', 'Champagne'],
    description: 'The heart of natural wine movement with centuries of winemaking tradition.',
    emoji: '🇫🇷'
  },
  italy: {
    id: 'italy',
    name: 'Italy',
    slug: 'italy',
    vineyards: 38,
    wineBars: 124,
    specialties: ['Chianti', 'Barolo', 'Prosecco'],
    description: 'Ancient wine culture with innovative natural producers.',
    emoji: '🇮🇹'
  },
  spain: {
    id: 'spain',
    name: 'Spain',
    slug: 'spain',
    vineyards: 28,
    wineBars: 89,
    specialties: ['Rioja', 'Priorat', 'Cava'],
    description: 'Bold flavors and passionate winemakers pushing boundaries.',
    emoji: '🇪🇸'
  },
  germany: {
    id: 'germany',
    name: 'Germany',
    slug: 'germany',
    vineyards: 22,
    wineBars: 67,
    specialties: ['Riesling', 'Spätburgunder', 'Silvaner'],
    description: 'Precise craftsmanship meets natural philosophy.',
    emoji: '🇩🇪'
  },
  portugal: {
    id: 'portugal',
    name: 'Portugal',
    slug: 'portugal',
    vineyards: 18,
    wineBars: 45,
    specialties: ['Douro', 'Vinho Verde', 'Alentejo'],
    description: 'Hidden gem with indigenous grapes and authentic traditions.',
    emoji: '🇵🇹'
  },
  usa: {
    id: 'usa',
    name: 'United States',
    slug: 'usa',
    vineyards: 35,
    wineBars: 112,
    specialties: ['Napa Valley', 'Oregon Pinot', 'Finger Lakes'],
    description: 'New world pioneers embracing natural winemaking.',
    emoji: '🇺🇸'
  },
  argentina: {
    id: 'argentina',
    name: 'Argentina',
    slug: 'argentina',
    vineyards: 15,
    wineBars: 38,
    specialties: ['Malbec', 'Mendoza', 'Patagonia'],
    description: 'High altitude vineyards producing exceptional natural wines.',
    emoji: '🇦🇷'
  },
  australia: {
    id: 'australia',
    name: 'Australia',
    slug: 'australia',
    vineyards: 20,
    wineBars: 52,
    specialties: ['Barossa Valley', 'McLaren Vale', 'Yarra Valley'],
    description: 'Bold innovation in the natural wine scene.',
    emoji: '🇦🇺'
  },
  japan: {
    id: 'japan',
    name: 'Japan',
    slug: 'japan',
    vineyards: 12,
    wineBars: 78,
    specialties: ['Koshu', 'Yamanashi', 'Hokkaido'],
    description: 'Delicate and precise natural wines with unique character.',
    emoji: '🇯🇵'
  },
  turkey: {
    id: 'turkey',
    name: 'Turkey',
    slug: 'turkey',
    vineyards: 8,
    wineBars: 24,
    specialties: ['Öküzgözü', 'Boğazkere', 'Kalecik Karası'],
    description: 'Ancient winemaking heritage reborn with natural methods.',
    emoji: '🇹🇷'
  }
};

// SVG paths for a hand-drawn style world map
const CountryPath: React.FC<{
  d: string;
  countryId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ d, countryId, isSelected, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.path
      d={d}
      className="cursor-pointer transition-colors duration-300"
      fill={isSelected ? 'hsl(var(--accent))' : isHovered ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary) / 0.3)'}
      stroke="hsl(var(--foreground) / 0.4)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={isHovered || isSelected ? "0" : "4 2"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(countryId)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        filter: isHovered || isSelected ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none',
      }}
    />
  );
};

interface HandDrawnWorldMapProps {
  onCountrySelect: (country: CountryData | null) => void;
  selectedCountry: string | null;
}

export const HandDrawnWorldMap: React.FC<HandDrawnWorldMapProps> = ({
  onCountrySelect,
  selectedCountry
}) => {
  const handleCountrySelect = (countryId: string) => {
    if (selectedCountry === countryId) {
      onCountrySelect(null);
    } else {
      onCountrySelect(countryData[countryId] || null);
    }
  };

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full"
        style={{ filter: 'url(#sketchy)' }}
      >
        {/* Filter for hand-drawn effect */}
        <defs>
          <filter id="sketchy" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="1" fill="hsl(var(--foreground) / 0.1)"/>
          </pattern>
        </defs>

        {/* Background with texture */}
        <rect width="100%" height="100%" fill="url(#dots)" opacity="0.5"/>

        {/* Decorative hand-drawn elements */}
        <path
          d="M50,250 Q100,200 150,250 T250,250"
          fill="none"
          stroke="hsl(var(--accent) / 0.3)"
          strokeWidth="3"
          strokeDasharray="8 4"
        />
        <path
          d="M750,150 Q800,100 850,150 T950,150"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="3"
          strokeDasharray="8 4"
        />

        {/* France */}
        <CountryPath
          d="M440,140 C445,135 455,132 465,135 C475,138 480,145 478,155 C476,165 470,175 460,178 C450,181 440,178 435,170 C430,162 432,150 440,140 Z"
          countryId="france"
          isSelected={selectedCountry === 'france'}
          onSelect={handleCountrySelect}
        />
        
        {/* Italy */}
        <CountryPath
          d="M485,155 C490,150 498,148 505,152 C512,156 515,165 512,175 C509,185 502,195 493,198 C484,201 478,195 480,185 C482,175 485,165 485,155 Z"
          countryId="italy"
          isSelected={selectedCountry === 'italy'}
          onSelect={handleCountrySelect}
        />
        
        {/* Spain */}
        <CountryPath
          d="M410,165 C415,158 425,155 435,160 C445,165 448,175 445,185 C442,195 432,200 420,198 C408,196 405,185 410,175 C412,170 410,165 410,165 Z"
          countryId="spain"
          isSelected={selectedCountry === 'spain'}
          onSelect={handleCountrySelect}
        />
        
        {/* Germany */}
        <CountryPath
          d="M470,120 C478,115 488,118 495,125 C502,132 502,142 495,148 C488,154 478,152 472,145 C466,138 466,128 470,120 Z"
          countryId="germany"
          isSelected={selectedCountry === 'germany'}
          onSelect={handleCountrySelect}
        />
        
        {/* Portugal */}
        <CountryPath
          d="M395,168 C398,162 405,160 410,165 C415,170 415,180 410,188 C405,196 398,195 395,188 C392,181 392,174 395,168 Z"
          countryId="portugal"
          isSelected={selectedCountry === 'portugal'}
          onSelect={handleCountrySelect}
        />
        
        {/* USA */}
        <CountryPath
          d="M120,140 C150,130 200,125 250,135 C300,145 320,160 310,180 C300,200 250,210 200,205 C150,200 100,185 95,165 C90,145 100,145 120,140 Z"
          countryId="usa"
          isSelected={selectedCountry === 'usa'}
          onSelect={handleCountrySelect}
        />
        
        {/* Argentina */}
        <CountryPath
          d="M280,320 C288,310 298,308 305,315 C312,322 312,340 305,360 C298,380 288,395 280,390 C272,385 270,365 275,345 C278,330 280,320 280,320 Z"
          countryId="argentina"
          isSelected={selectedCountry === 'argentina'}
          onSelect={handleCountrySelect}
        />
        
        {/* Australia */}
        <CountryPath
          d="M780,320 C810,310 850,315 880,335 C910,355 920,380 900,395 C880,410 840,405 800,390 C760,375 750,350 765,335 C775,325 780,320 780,320 Z"
          countryId="australia"
          isSelected={selectedCountry === 'australia'}
          onSelect={handleCountrySelect}
        />
        
        {/* Japan */}
        <CountryPath
          d="M870,160 C878,155 888,158 892,168 C896,178 892,190 885,195 C878,200 868,195 865,185 C862,175 865,165 870,160 Z"
          countryId="japan"
          isSelected={selectedCountry === 'japan'}
          onSelect={handleCountrySelect}
        />
        
        {/* Turkey */}
        <CountryPath
          d="M545,170 C560,165 580,168 590,178 C600,188 598,200 585,205 C572,210 555,205 545,195 C535,185 538,175 545,170 Z"
          countryId="turkey"
          isSelected={selectedCountry === 'turkey'}
          onSelect={handleCountrySelect}
        />

        {/* Decorative wine elements scattered around */}
        <g className="pointer-events-none">
          {/* Wine glass sketches */}
          <text x="80" y="280" fontSize="20" fill="hsl(var(--wine-red))">🍷</text>
          <text x="920" y="250" fontSize="20" fill="hsl(var(--wine-red))">🍇</text>
          <text x="500" y="80" fontSize="18" fill="hsl(var(--accent))">🌿</text>
          <text x="350" y="380" fontSize="16" fill="hsl(var(--primary))">✨</text>
          <text x="650" y="420" fontSize="18" fill="hsl(var(--wine-rose))">🍾</text>
        </g>

        {/* Hand-drawn compass */}
        <g transform="translate(900, 80)">
          <circle cx="0" cy="0" r="25" fill="none" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="2" strokeDasharray="4 2"/>
          <path d="M0,-20 L0,20 M-20,0 L20,0" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="1.5"/>
          <text x="0" y="-28" textAnchor="middle" fontSize="10" fill="hsl(var(--foreground) / 0.6)">N</text>
        </g>
      </svg>
    </div>
  );
};

interface CountryInfoPanelProps {
  country: CountryData;
  onClose: () => void;
  onExplore: (slug: string) => void;
}

export const CountryInfoPanel: React.FC<CountryInfoPanelProps> = ({
  country,
  onClose,
  onExplore
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
    >
      {/* Decorative top wave */}
      <div className="h-2 bg-gradient-to-r from-primary via-accent to-wine-red" />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{country.emoji}</span>
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground">{country.name}</h3>
              <p className="text-sm text-muted-foreground">{country.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/10">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Grape className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{country.vineyards}</p>
              <p className="text-xs text-muted-foreground">Winemakers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-accent/10">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Wine className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{country.wineBars}</p>
              <p className="text-xs text-muted-foreground">Venues</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {country.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1.5 text-sm font-medium rounded-full bg-secondary text-secondary-foreground border border-border"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onExplore(country.slug)}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg"
        >
          <MapPin className="w-5 h-5" />
          Explore {country.name}
        </motion.button>
      </div>
    </motion.div>
  );
};
