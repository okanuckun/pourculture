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
  color: string;
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
    emoji: '🇫🇷',
    color: '#7CB342'
  },
  italy: {
    id: 'italy',
    name: 'Italy',
    slug: 'italy',
    vineyards: 38,
    wineBars: 124,
    specialties: ['Chianti', 'Barolo', 'Prosecco'],
    description: 'Ancient wine culture with innovative natural producers.',
    emoji: '🇮🇹',
    color: '#7CB342'
  },
  spain: {
    id: 'spain',
    name: 'Spain',
    slug: 'spain',
    vineyards: 28,
    wineBars: 89,
    specialties: ['Rioja', 'Priorat', 'Cava'],
    description: 'Bold flavors and passionate winemakers pushing boundaries.',
    emoji: '🇪🇸',
    color: '#7CB342'
  },
  germany: {
    id: 'germany',
    name: 'Germany',
    slug: 'germany',
    vineyards: 22,
    wineBars: 67,
    specialties: ['Riesling', 'Spätburgunder', 'Silvaner'],
    description: 'Precise craftsmanship meets natural philosophy.',
    emoji: '🇩🇪',
    color: '#7CB342'
  },
  portugal: {
    id: 'portugal',
    name: 'Portugal',
    slug: 'portugal',
    vineyards: 18,
    wineBars: 45,
    specialties: ['Douro', 'Vinho Verde', 'Alentejo'],
    description: 'Hidden gem with indigenous grapes and authentic traditions.',
    emoji: '🇵🇹',
    color: '#7CB342'
  },
  usa: {
    id: 'usa',
    name: 'United States',
    slug: 'usa',
    vineyards: 35,
    wineBars: 112,
    specialties: ['Napa Valley', 'Oregon Pinot', 'Sonoma'],
    description: 'New world pioneers embracing natural winemaking.',
    emoji: '🇺🇸',
    color: '#66BB6A'
  },
  argentina: {
    id: 'argentina',
    name: 'Argentina',
    slug: 'argentina',
    vineyards: 15,
    wineBars: 38,
    specialties: ['Malbec', 'Mendoza', 'Patagonia'],
    description: 'High altitude vineyards producing exceptional natural wines.',
    emoji: '🇦🇷',
    color: '#FF9800'
  },
  chile: {
    id: 'chile',
    name: 'Chile',
    slug: 'chile',
    vineyards: 12,
    wineBars: 28,
    specialties: ['Carménère', 'Valle Central', 'Casablanca'],
    description: 'Unique terroir between Andes and Pacific.',
    emoji: '🇨🇱',
    color: '#FF9800'
  },
  brazil: {
    id: 'brazil',
    name: 'Brazil',
    slug: 'brazil',
    vineyards: 8,
    wineBars: 22,
    specialties: ['Serra Gaúcha', 'Vale dos Vinhedos'],
    description: 'Emerging natural wine scene in South America.',
    emoji: '🇧🇷',
    color: '#FF9800'
  },
  australia: {
    id: 'australia',
    name: 'Australia',
    slug: 'australia',
    vineyards: 20,
    wineBars: 52,
    specialties: ['Barossa', 'McLaren Vale', 'Yarra'],
    description: 'Bold innovation in the natural wine scene.',
    emoji: '🇦🇺',
    color: '#9C27B0'
  },
  newzealand: {
    id: 'newzealand',
    name: 'New Zealand',
    slug: 'new-zealand',
    vineyards: 10,
    wineBars: 25,
    specialties: ['Marlborough', 'Central Otago'],
    description: 'Pure expressions from pristine landscapes.',
    emoji: '🇳🇿',
    color: '#9C27B0'
  },
  japan: {
    id: 'japan',
    name: 'Japan',
    slug: 'japan',
    vineyards: 12,
    wineBars: 78,
    specialties: ['Koshu', 'Yamanashi'],
    description: 'Delicate and precise natural wines.',
    emoji: '🇯🇵',
    color: '#E91E63'
  },
  southafrica: {
    id: 'southafrica',
    name: 'South Africa',
    slug: 'south-africa',
    vineyards: 14,
    wineBars: 32,
    specialties: ['Stellenbosch', 'Swartland'],
    description: 'Exciting natural wine revolution in the Cape.',
    emoji: '🇿🇦',
    color: '#FDD835'
  },
  austria: {
    id: 'austria',
    name: 'Austria',
    slug: 'austria',
    vineyards: 16,
    wineBars: 42,
    specialties: ['Grüner Veltliner', 'Wachau'],
    description: 'Pioneers of the natural wine movement.',
    emoji: '🇦🇹',
    color: '#7CB342'
  },
  greece: {
    id: 'greece',
    name: 'Greece',
    slug: 'greece',
    vineyards: 11,
    wineBars: 29,
    specialties: ['Assyrtiko', 'Santorini'],
    description: 'Ancient varieties revived with natural techniques.',
    emoji: '🇬🇷',
    color: '#7CB342'
  },
  georgia: {
    id: 'georgia',
    name: 'Georgia',
    slug: 'georgia',
    vineyards: 18,
    wineBars: 35,
    specialties: ['Qvevri', 'Saperavi', 'Rkatsiteli'],
    description: '8000 years of winemaking tradition.',
    emoji: '🇬🇪',
    color: '#E91E63'
  }
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

  const handleCountryClick = (countryId: string) => {
    if (selectedCountry === countryId) {
      onCountrySelect(null);
    } else {
      onCountrySelect(countryData[countryId] || null);
    }
  };

  const isCountryActive = (id: string) => selectedCountry === id || hoveredCountry === id;

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 1000 550"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Ocean Background */}
        <rect width="100%" height="100%" fill="#4DD0E1" rx="20"/>
        
        {/* Ocean wave patterns */}
        <g opacity="0.3">
          {[...Array(8)].map((_, i) => (
            <path
              key={i}
              d={`M${i * 130},${300 + (i % 3) * 40} Q${i * 130 + 30},${295 + (i % 3) * 40} ${i * 130 + 60},${300 + (i % 3) * 40} T${i * 130 + 120},${300 + (i % 3) * 40}`}
              fill="none"
              stroke="#26C6DA"
              strokeWidth="2"
            />
          ))}
        </g>

        {/* Ocean Labels */}
        <text x="500" y="35" textAnchor="middle" fontSize="14" fill="#00838F" fontFamily="cursive" fontStyle="italic">Arctic Ocean</text>
        <text x="180" y="280" textAnchor="middle" fontSize="12" fill="#00838F" fontFamily="cursive" fontStyle="italic" transform="rotate(-70, 180, 280)">Pacific Ocean</text>
        <text x="320" y="300" textAnchor="middle" fontSize="12" fill="#00838F" fontFamily="cursive" fontStyle="italic" transform="rotate(-70, 320, 300)">Atlantic Ocean</text>
        <text x="700" y="380" textAnchor="middle" fontSize="12" fill="#00838F" fontFamily="cursive" fontStyle="italic">Indian Ocean</text>
        <text x="850" y="200" textAnchor="middle" fontSize="11" fill="#00838F" fontFamily="cursive" fontStyle="italic" transform="rotate(-70, 850, 200)">Pacific Ocean</text>

        {/* ===== NORTH AMERICA ===== */}
        <g 
          className="cursor-pointer transition-all duration-200"
          onClick={() => handleCountryClick('usa')}
          onMouseEnter={() => setHoveredCountry('usa')}
          onMouseLeave={() => setHoveredCountry(null)}
        >
          <path
            d="M50,60 Q80,45 130,40 L200,38 Q260,42 300,55 L320,75 L310,95 L280,115 L250,130 L200,145 L150,150 L100,145 L60,130 L40,110 L35,85 Z"
            fill={isCountryActive('usa') ? '#81C784' : '#66BB6A'}
            stroke="white"
            strokeWidth="3"
            className="transition-all duration-200"
          />
          {/* Canada attached */}
          <path
            d="M50,60 Q90,35 150,25 L220,22 Q280,28 340,40 L360,55 L340,70 L300,55 L200,38 L130,40 Q80,45 50,60 Z"
            fill="#81C784"
            stroke="white"
            strokeWidth="3"
          />
          {/* USA wine symbols */}
          <text x="150" y="85" fontSize="11" fontWeight="600" fill="#2E7D32">Napa</text>
          <text x="120" y="105" fontSize="10" fill="#2E7D32">🍇</text>
          <text x="200" y="95" fontSize="9" fill="#2E7D32">Oregon</text>
          <text x="250" y="110" fontSize="12">🍷</text>
          <text x="180" y="125" fontSize="10" fill="#1B5E20">Sonoma</text>
          <text x="100" y="75" fontSize="10">🌿</text>
        </g>

        {/* Central America & Mexico */}
        <path
          d="M200,150 L230,165 L240,200 L220,230 L190,240 L170,220 L180,185 L190,160 Z"
          fill="#8BC34A"
          stroke="white"
          strokeWidth="2"
        />

        {/* ===== SOUTH AMERICA ===== */}
        <g>
          {/* Brazil */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('brazil')}
            onMouseEnter={() => setHoveredCountry('brazil')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M230,245 L290,235 L320,260 L310,310 L280,340 L250,350 L230,320 L220,280 Z"
              fill={isCountryActive('brazil') ? '#FFB74D' : '#FF9800'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="260" y="290" fontSize="10" fill="#E65100">Serra Gaúcha</text>
            <text x="280" y="275" fontSize="11">🍇</text>
          </g>

          {/* Argentina */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('argentina')}
            onMouseEnter={() => setHoveredCountry('argentina')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M220,350 L250,350 L260,380 L255,420 L245,460 L225,480 L215,470 L210,430 L215,390 Z"
              fill={isCountryActive('argentina') ? '#FFB74D' : '#FF9800'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="225" y="400" fontSize="10" fontWeight="600" fill="#E65100">Mendoza</text>
            <text x="230" y="420" fontSize="11">🍷</text>
            <text x="235" y="445" fontSize="9" fill="#E65100">Malbec</text>
          </g>

          {/* Chile */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('chile')}
            onMouseEnter={() => setHoveredCountry('chile')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M200,350 L215,355 L215,390 L210,430 L205,460 L195,470 L190,440 L195,400 L198,365 Z"
              fill={isCountryActive('chile') ? '#FFA726' : '#EF6C00'}
              stroke="white"
              strokeWidth="2"
            />
            <text x="185" y="385" fontSize="8" fill="#E65100" transform="rotate(-80, 185, 385)">Carménère</text>
          </g>
        </g>

        {/* South America Label */}
        <text x="250" y="320" textAnchor="middle" fontSize="13" fill="#BF360C" fontWeight="bold">South America</text>

        {/* ===== EUROPE ===== */}
        <g>
          {/* UK/Ireland */}
          <path
            d="M410,80 L425,72 L435,78 L438,95 L430,105 L418,100 L412,88 Z"
            fill="#81C784"
            stroke="white"
            strokeWidth="2"
          />

          {/* Scandinavia */}
          <path
            d="M450,40 L480,30 L520,35 L540,60 L530,90 L505,85 L485,70 L460,55 Z"
            fill="#66BB6A"
            stroke="white"
            strokeWidth="2"
          />

          {/* Spain & Portugal */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('spain')}
            onMouseEnter={() => setHoveredCountry('spain')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M400,140 L445,135 L465,145 L460,170 L440,180 L410,178 L395,168 L398,150 Z"
              fill={isCountryActive('spain') ? '#A5D6A7' : '#7CB342'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="420" y="158" fontSize="10" fontWeight="600" fill="#33691E">Rioja</text>
            <text x="440" y="170" fontSize="10">🍷</text>
            <text x="415" y="175" fontSize="8" fill="#33691E">Priorat</text>
          </g>

          {/* Portugal */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('portugal')}
            onMouseEnter={() => setHoveredCountry('portugal')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M385,145 L398,143 L400,155 L398,175 L390,180 L383,170 L382,155 Z"
              fill={isCountryActive('portugal') ? '#A5D6A7' : '#558B2F'}
              stroke="white"
              strokeWidth="2"
            />
            <text x="380" y="162" fontSize="7" fill="#1B5E20">Douro</text>
          </g>

          {/* France */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('france')}
            onMouseEnter={() => setHoveredCountry('france')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M420,100 L455,95 L475,105 L480,130 L470,145 L445,150 L420,145 L410,125 L415,110 Z"
              fill={isCountryActive('france') ? '#A5D6A7' : '#7CB342'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="435" y="118" fontSize="9" fontWeight="600" fill="#33691E">Burgundy</text>
            <text x="450" y="135" fontSize="10">🍇</text>
            <text x="425" y="140" fontSize="8" fill="#33691E">Bordeaux</text>
            <text x="455" y="110" fontSize="8" fill="#33691E">Champagne</text>
            <text x="440" y="125" fontSize="9">🥂</text>
          </g>

          {/* Germany */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('germany')}
            onMouseEnter={() => setHoveredCountry('germany')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M460,85 L490,80 L505,90 L505,115 L490,125 L470,120 L460,105 Z"
              fill={isCountryActive('germany') ? '#A5D6A7' : '#7CB342'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="475" y="100" fontSize="8" fontWeight="600" fill="#33691E">Riesling</text>
            <text x="480" y="115" fontSize="9">🍇</text>
          </g>

          {/* Austria */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('austria')}
            onMouseEnter={() => setHoveredCountry('austria')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M490,115 L520,112 L535,120 L530,135 L515,140 L495,135 L490,125 Z"
              fill={isCountryActive('austria') ? '#A5D6A7' : '#689F38'}
              stroke="white"
              strokeWidth="2"
            />
            <text x="505" y="128" fontSize="7" fill="#33691E">Grüner V.</text>
          </g>

          {/* Italy */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('italy')}
            onMouseEnter={() => setHoveredCountry('italy')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M475,135 L495,130 L510,140 L515,160 L505,180 L495,200 L485,210 L478,200 L480,180 L475,155 Z"
              fill={isCountryActive('italy') ? '#A5D6A7' : '#7CB342'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="485" y="155" fontSize="9" fontWeight="600" fill="#33691E">Chianti</text>
            <text x="488" y="170" fontSize="9">🍷</text>
            <text x="482" y="185" fontSize="8" fill="#33691E">Barolo</text>
            <text x="490" y="198" fontSize="8">🍇</text>
          </g>

          {/* Greece */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('greece')}
            onMouseEnter={() => setHoveredCountry('greece')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M520,165 L540,160 L550,170 L548,190 L535,200 L520,195 L515,180 Z"
              fill={isCountryActive('greece') ? '#A5D6A7' : '#558B2F'}
              stroke="white"
              strokeWidth="2"
            />
            <text x="528" y="180" fontSize="7" fill="#33691E">Assyrtiko</text>
          </g>
        </g>

        {/* Europe Label */}
        <text x="470" y="70" textAnchor="middle" fontSize="14" fill="#1B5E20" fontWeight="bold">Europe</text>

        {/* ===== AFRICA ===== */}
        <g>
          {/* North Africa */}
          <path
            d="M410,185 L520,180 L560,200 L580,240 L570,300 L530,350 L480,380 L440,375 L420,340 L430,280 L420,230 L405,200 Z"
            fill="#FDD835"
            stroke="white"
            strokeWidth="3"
          />
          
          {/* South Africa */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('southafrica')}
            onMouseEnter={() => setHoveredCountry('southafrica')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M490,385 L530,375 L550,390 L545,420 L520,440 L490,435 L480,415 L485,395 Z"
              fill={isCountryActive('southafrica') ? '#FFEE58' : '#FBC02D'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="505" y="405" fontSize="9" fontWeight="600" fill="#F57F17">Stellenbosch</text>
            <text x="515" y="420" fontSize="10">🍇</text>
            <text x="500" y="432" fontSize="8" fill="#F57F17">Pinotage</text>
          </g>
        </g>

        {/* Africa Label */}
        <text x="490" y="290" textAnchor="middle" fontSize="14" fill="#F57F17" fontWeight="bold">Africa</text>

        {/* ===== ASIA ===== */}
        <g>
          {/* Russia/Northern Asia */}
          <path
            d="M540,45 L650,35 L750,45 L820,70 L840,100 L830,130 L780,150 L700,145 L620,135 L560,115 L540,85 Z"
            fill="#E91E63"
            stroke="white"
            strokeWidth="3"
          />

          {/* Georgia */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('georgia')}
            onMouseEnter={() => setHoveredCountry('georgia')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M565,140 L590,135 L605,145 L600,160 L580,165 L565,155 Z"
              fill={isCountryActive('georgia') ? '#F48FB1' : '#C2185B'}
              stroke="white"
              strokeWidth="2"
            />
            <text x="575" y="152" fontSize="7" fill="#880E4F">Qvevri</text>
            <text x="585" y="162" fontSize="8">🏺</text>
          </g>

          {/* Middle East/Turkey area */}
          <path
            d="M550,160 L610,155 L640,175 L635,200 L600,210 L565,195 L555,175 Z"
            fill="#F06292"
            stroke="white"
            strokeWidth="2"
          />

          {/* India */}
          <path
            d="M650,180 L700,170 L730,200 L735,250 L710,290 L670,295 L650,260 L645,220 Z"
            fill="#EC407A"
            stroke="white"
            strokeWidth="2"
          />

          {/* China */}
          <path
            d="M720,100 L800,90 L850,115 L860,160 L830,200 L770,210 L720,195 L700,160 L710,125 Z"
            fill="#E91E63"
            stroke="white"
            strokeWidth="3"
          />

          {/* Japan */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('japan')}
            onMouseEnter={() => setHoveredCountry('japan')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M870,120 L885,110 L895,120 L895,150 L885,175 L870,180 L865,160 L868,135 Z"
              fill={isCountryActive('japan') ? '#F48FB1' : '#C2185B'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="872" y="145" fontSize="8" fontWeight="600" fill="#880E4F">Koshu</text>
            <text x="875" y="160" fontSize="9">🍇</text>
            <text x="870" y="172" fontSize="7" fill="#880E4F">Yamanashi</text>
          </g>

          {/* Southeast Asia */}
          <path
            d="M750,220 L800,215 L830,240 L835,280 L810,310 L770,305 L750,270 Z"
            fill="#F06292"
            stroke="white"
            strokeWidth="2"
          />
        </g>

        {/* Asia Label */}
        <text x="720" y="80" textAnchor="middle" fontSize="14" fill="#880E4F" fontWeight="bold">Asia</text>

        {/* ===== AUSTRALIA & OCEANIA ===== */}
        <g>
          {/* Australia */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('australia')}
            onMouseEnter={() => setHoveredCountry('australia')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M780,340 L850,330 L900,350 L920,390 L900,430 L850,445 L800,435 L770,400 L775,360 Z"
              fill={isCountryActive('australia') ? '#BA68C8' : '#9C27B0'}
              stroke="white"
              strokeWidth="3"
            />
            <text x="830" y="375" fontSize="10" fontWeight="600" fill="#4A148C">Barossa</text>
            <text x="850" y="395" fontSize="11">🍷</text>
            <text x="815" y="410" fontSize="9" fill="#4A148C">McLaren Vale</text>
            <text x="870" y="415" fontSize="9">🍇</text>
            <text x="800" y="390" fontSize="8" fill="#4A148C">Shiraz</text>
          </g>

          {/* New Zealand */}
          <g 
            className="cursor-pointer"
            onClick={() => handleCountryClick('newzealand')}
            onMouseEnter={() => setHoveredCountry('newzealand')}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <path
              d="M930,420 L945,410 L955,425 L952,450 L940,470 L928,465 L925,445 L928,430 Z"
              fill={isCountryActive('newzealand') ? '#CE93D8' : '#7B1FA2'}
              stroke="white"
              strokeWidth="2"
            />
            <text x="930" y="445" fontSize="7" fill="#4A148C">Marlborough</text>
            <text x="940" y="460" fontSize="8">🍇</text>
          </g>
        </g>

        {/* Australia Label */}
        <text x="850" y="360" textAnchor="middle" fontSize="13" fill="#4A148C" fontWeight="bold">Australia</text>

        {/* ===== ANTARCTICA ===== */}
        <path
          d="M300,510 Q450,495 600,510 Q680,520 750,510 L760,530 Q600,545 450,545 Q300,545 250,530 Z"
          fill="white"
          stroke="#B0BEC5"
          strokeWidth="2"
        />
        <text x="500" y="525" textAnchor="middle" fontSize="11" fill="#546E7A" fontStyle="italic">Antarctica</text>

        {/* Decorative elements - Wine themed */}
        <g className="pointer-events-none">
          {/* Ships/boats */}
          <text x="350" y="250" fontSize="16">⛵</text>
          <text x="620" y="350" fontSize="14">🚢</text>
          
          {/* Fish in oceans */}
          <text x="150" y="350" fontSize="12">🐟</text>
          <text x="900" y="280" fontSize="11">🐟</text>
          <text x="80" y="420" fontSize="13">🐋</text>
          
          {/* Wine bottles floating */}
          <text x="350" y="180" fontSize="12">🍾</text>
          <text x="680" y="420" fontSize="11">🍾</text>
          
          {/* Planes */}
          <text x="920" y="80" fontSize="14">✈️</text>
          <text x="50" y="200" fontSize="12" transform="rotate(-30, 50, 200)">✈️</text>
        </g>

        {/* Title Banner */}
        <g transform="translate(500, 12)">
          <rect x="-120" y="0" width="240" height="30" rx="15" fill="#FF8F00" stroke="#E65100" strokeWidth="2"/>
          <text x="0" y="22" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">🍷 WORLD OF WINE 🍇</text>
        </g>

      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredCountry && countryData[hoveredCountry] && !selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 px-5 py-3 bg-card/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-accent flex items-center gap-3"
          >
            <span className="text-2xl">{countryData[hoveredCountry].emoji}</span>
            <div>
              <p className="font-bold text-foreground">{countryData[hoveredCountry].name}</p>
              <p className="text-xs text-muted-foreground">{countryData[hoveredCountry].specialties.slice(0, 2).join(' • ')}</p>
            </div>
            <span className="text-xs text-accent font-medium">Click to explore →</span>
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
      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-card/98 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-accent overflow-hidden"
    >
      {/* Decorative top bar */}
      <div className="h-2 bg-gradient-to-r from-primary via-accent to-wine-red" />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-3xl">
              {country.emoji}
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">{country.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{country.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Grape className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{country.vineyards}</p>
              <p className="text-xs text-muted-foreground">Winemakers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wine className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{country.wineBars}</p>
              <p className="text-xs text-muted-foreground">Venues</p>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">🍇 Wine Regions & Specialties</p>
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
          className="w-full py-4 px-6 bg-gradient-to-r from-primary via-accent to-wine-red text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg text-lg"
        >
          <MapPin className="w-5 h-5" />
          Explore {country.name}
        </motion.button>
      </div>
    </motion.div>
  );
};
