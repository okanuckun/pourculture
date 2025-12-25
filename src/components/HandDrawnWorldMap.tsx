import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, MapPin, Grape, X } from 'lucide-react';

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
  chile: {
    id: 'chile',
    name: 'Chile',
    slug: 'chile',
    vineyards: 12,
    wineBars: 28,
    specialties: ['Carménère', 'Valle Central', 'Casablanca'],
    description: 'Unique terroir between Andes and Pacific.',
    emoji: '🇨🇱'
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
  },
  southafrica: {
    id: 'southafrica',
    name: 'South Africa',
    slug: 'south-africa',
    vineyards: 14,
    wineBars: 32,
    specialties: ['Stellenbosch', 'Chenin Blanc', 'Pinotage'],
    description: 'Exciting natural wine revolution in the Cape.',
    emoji: '🇿🇦'
  },
  newzealand: {
    id: 'newzealand',
    name: 'New Zealand',
    slug: 'new-zealand',
    vineyards: 10,
    wineBars: 25,
    specialties: ['Marlborough', 'Central Otago', 'Hawke\'s Bay'],
    description: 'Pure expressions from pristine landscapes.',
    emoji: '🇳🇿'
  },
  austria: {
    id: 'austria',
    name: 'Austria',
    slug: 'austria',
    vineyards: 16,
    wineBars: 42,
    specialties: ['Grüner Veltliner', 'Wachau', 'Burgenland'],
    description: 'Pioneers of the natural wine movement in Europe.',
    emoji: '🇦🇹'
  },
  greece: {
    id: 'greece',
    name: 'Greece',
    slug: 'greece',
    vineyards: 11,
    wineBars: 29,
    specialties: ['Assyrtiko', 'Santorini', 'Nemea'],
    description: 'Ancient varieties revived with modern natural techniques.',
    emoji: '🇬🇷'
  }
};

// Realistic country paths based on simplified world map projections
const countryPaths: Record<string, string> = {
  // North America
  usa: "M55,115 L60,105 L80,100 L120,95 L160,100 L190,105 L210,115 L215,125 L210,140 L195,155 L175,165 L150,170 L120,168 L90,160 L65,150 L50,140 L45,130 L50,120 Z",
  
  // South America
  argentina: "M150,340 L155,320 L165,305 L175,295 L180,310 L178,340 L175,370 L170,395 L160,410 L150,405 L145,385 L148,360 Z",
  chile: "M140,295 L145,280 L150,290 L155,310 L155,340 L152,370 L148,395 L142,410 L135,400 L138,370 L140,340 L138,310 Z",
  
  // Europe - more detailed
  portugal: "M392,170 L395,162 L400,158 L405,162 L407,172 L405,185 L400,192 L394,188 L391,180 Z",
  spain: "M400,155 L420,150 L445,155 L455,165 L450,180 L435,190 L415,192 L400,188 L395,175 L398,162 Z",
  france: "M420,130 L445,125 L465,130 L475,145 L470,160 L455,165 L435,160 L420,150 L415,140 Z",
  germany: "M455,115 L475,110 L490,115 L495,130 L490,145 L475,150 L460,145 L455,130 Z",
  italy: "M470,150 L480,145 L490,150 L495,165 L490,180 L480,195 L475,210 L468,205 L465,190 L468,175 L465,160 Z",
  austria: "M475,135 L495,132 L510,138 L508,148 L495,152 L480,150 L475,142 Z",
  greece: "M505,175 L520,170 L530,178 L528,190 L520,198 L508,195 L502,185 Z",
  
  // Turkey and Middle East
  turkey: "M525,160 L560,155 L590,162 L600,172 L595,182 L575,188 L550,185 L530,180 L522,172 Z",
  
  // Africa
  southafrica: "M500,360 L530,350 L550,360 L555,385 L545,405 L520,415 L495,405 L490,385 L495,365 Z",
  
  // Asia
  japan: "M820,145 L830,135 L840,140 L845,155 L842,175 L835,190 L825,188 L820,175 L818,160 Z",
  
  // Oceania
  australia: "M750,320 L790,310 L830,315 L860,330 L870,360 L855,390 L820,405 L780,400 L750,380 L740,350 L745,330 Z",
  newzealand: "M890,390 L900,385 L910,392 L912,405 L905,420 L895,425 L888,415 L885,400 Z"
};

// Non-wine countries (background continents)
const continentPaths = {
  northAmerica: "M40,80 L50,60 L90,45 L140,40 L180,50 L220,70 L230,100 L225,130 L215,160 L190,180 L160,190 L130,188 L100,180 L70,165 L45,145 L35,120 L38,95 Z",
  centralAmerica: "M130,195 L150,190 L170,200 L175,220 L165,240 L145,250 L130,245 L125,225 L128,205 Z",
  southAmericaOther: "M150,255 L180,250 L200,270 L210,300 L205,340 L190,370 L175,390 L160,395 L145,380 L140,340 L145,300 L148,270 Z",
  uk: "M410,105 L425,100 L435,108 L432,120 L420,125 L410,118 Z",
  scandinavia: "M470,60 L490,50 L520,55 L540,80 L535,105 L515,115 L495,110 L480,95 L475,75 Z",
  russia: "M540,50 L620,40 L720,50 L800,70 L850,100 L860,130 L840,160 L780,170 L700,165 L620,155 L560,140 L530,120 L525,90 L530,60 Z",
  africa: "M440,210 L480,195 L520,200 L560,210 L590,240 L600,290 L590,340 L560,380 L520,400 L480,395 L450,370 L430,330 L425,280 L430,240 Z",
  middleEast: "M560,180 L610,175 L650,190 L660,220 L640,250 L600,255 L565,240 L555,210 Z",
  india: "M640,200 L680,195 L710,220 L720,260 L700,300 L660,310 L630,290 L625,250 L630,220 Z",
  china: "M700,120 L780,110 L830,130 L850,170 L830,210 L780,230 L720,225 L680,200 L675,160 L685,135 Z",
  southeastAsia: "M730,240 L780,235 L820,250 L830,290 L800,320 L760,315 L735,290 L730,260 Z",
  indonesia: "M760,320 L820,315 L870,330 L880,350 L850,365 L800,360 L760,345 Z"
};

interface CountryShapeProps {
  d: string;
  countryId: string;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  hasWineData: boolean;
}

const CountryShape: React.FC<CountryShapeProps> = ({ 
  d, 
  countryId, 
  isSelected, 
  isHovered,
  onSelect, 
  onHover,
  hasWineData 
}) => {
  const baseColor = hasWineData 
    ? isSelected 
      ? 'hsl(18, 85%, 55%)' // accent
      : isHovered 
        ? 'hsl(340, 55%, 45%)' // primary hover
        : 'hsl(340, 55%, 40%)' // primary
    : 'hsl(40, 25%, 85%)'; // muted for non-wine countries

  return (
    <motion.path
      d={d}
      className={hasWineData ? "cursor-pointer" : "cursor-default"}
      fill={baseColor}
      stroke={hasWineData ? "hsl(20, 15%, 25%)" : "hsl(40, 20%, 75%)"}
      strokeWidth={hasWineData ? (isHovered || isSelected ? 2.5 : 1.5) : 0.8}
      strokeLinejoin="round"
      strokeLinecap="round"
      onMouseEnter={() => hasWineData && onHover(countryId)}
      onMouseLeave={() => onHover(null)}
      onClick={() => hasWineData && onSelect(countryId)}
      initial={false}
      animate={{
        scale: isHovered || isSelected ? 1.02 : 1,
        filter: isHovered || isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        transformOrigin: 'center',
        transformBox: 'fill-box'
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
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

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
        viewBox="0 0 950 450"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle paper texture */}
          <filter id="paper" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
            <feDiffuseLighting in="noise" lightingColor="white" surfaceScale="1" result="light">
              <feDistantLight azimuth="45" elevation="60"/>
            </feDiffuseLighting>
            <feBlend in="SourceGraphic" in2="light" mode="multiply"/>
          </filter>
          
          {/* Glow effect for selected countries */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ocean background */}
        <rect width="100%" height="100%" fill="hsl(200, 30%, 92%)" rx="16"/>
        
        {/* Grid lines for map feel */}
        <g stroke="hsl(200, 20%, 85%)" strokeWidth="0.5" opacity="0.5">
          {[...Array(9)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50 + 25} x2="950" y2={i * 50 + 25} />
          ))}
          {[...Array(19)].map((_, i) => (
            <line key={`v${i}`} x1={i * 50 + 25} y1="0" x2={i * 50 + 25} y2="450" />
          ))}
        </g>

        {/* Background continents (non-wine countries) */}
        <g className="continents">
          {Object.entries(continentPaths).map(([key, path]) => (
            <path
              key={key}
              d={path}
              fill="hsl(45, 25%, 88%)"
              stroke="hsl(40, 20%, 78%)"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Wine-producing countries */}
        <g className="wine-countries">
          {Object.entries(countryPaths).map(([countryId, path]) => (
            <CountryShape
              key={countryId}
              d={path}
              countryId={countryId}
              isSelected={selectedCountry === countryId}
              isHovered={hoveredCountry === countryId}
              onSelect={handleCountrySelect}
              onHover={setHoveredCountry}
              hasWineData={!!countryData[countryId]}
            />
          ))}
        </g>

        {/* Country labels for wine countries */}
        <g className="labels pointer-events-none">
          {selectedCountry && countryData[selectedCountry] && (
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {/* Label will be shown in the panel instead */}
            </motion.g>
          )}
        </g>

        {/* Decorative wine elements */}
        <g className="decorations pointer-events-none" opacity="0.6">
          <text x="30" y="420" fontSize="16">🍷</text>
          <text x="900" y="40" fontSize="14">🍇</text>
          <text x="460" y="30" fontSize="12">✨</text>
          <text x="880" y="420" fontSize="14">🌿</text>
        </g>

        {/* Compass */}
        <g transform="translate(890, 400)">
          <circle cx="0" cy="0" r="20" fill="hsl(45, 30%, 95%)" stroke="hsl(40, 20%, 75%)" strokeWidth="1.5"/>
          <path d="M0,-15 L3,0 L0,5 L-3,0 Z" fill="hsl(340, 55%, 40%)"/>
          <path d="M0,15 L3,0 L0,-5 L-3,0 Z" fill="hsl(40, 20%, 70%)"/>
          <text x="0" y="-25" textAnchor="middle" fontSize="8" fill="hsl(20, 15%, 40%)" fontWeight="600">N</text>
        </g>

        {/* Legend */}
        <g transform="translate(30, 30)">
          <rect x="0" y="0" width="140" height="60" rx="8" fill="hsl(45, 30%, 97%)" stroke="hsl(40, 20%, 85%)" strokeWidth="1"/>
          <circle cx="20" cy="20" r="8" fill="hsl(340, 55%, 40%)"/>
          <text x="35" y="24" fontSize="10" fill="hsl(20, 15%, 30%)">Wine Countries</text>
          <circle cx="20" cy="42" r="8" fill="hsl(18, 85%, 55%)"/>
          <text x="35" y="46" fontSize="10" fill="hsl(20, 15%, 30%)">Selected</text>
        </g>
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredCountry && countryData[hoveredCountry] && !selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border border-border flex items-center gap-2"
          >
            <span className="text-lg">{countryData[hoveredCountry].emoji}</span>
            <span className="font-medium text-foreground">{countryData[hoveredCountry].name}</span>
            <span className="text-xs text-muted-foreground">Click to explore</span>
          </motion.div>
        )}
      </AnimatePresence>
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
      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-card/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden"
    >
      {/* Decorative top bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-wine-red" />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.emoji}</span>
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">{country.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{country.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-primary/10">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Grape className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{country.vineyards}</p>
              <p className="text-xs text-muted-foreground">Winemakers</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-accent/10">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Wine className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{country.wineBars}</p>
              <p className="text-xs text-muted-foreground">Venues</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Regions & Specialties</p>
          <div className="flex flex-wrap gap-1.5">
            {country.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
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
          className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg"
        >
          <MapPin className="w-4 h-4" />
          Explore {country.name}
        </motion.button>
      </div>
    </motion.div>
  );
};
