import React from 'react';
import { Link } from 'react-router-dom';
import { HomeWineMap } from '@/components/WineMap/HomeWineMap';
import { WineVenueCategory } from '@/components/WineMap/types';

export type CategoryType = 'overview' | 'bar' | 'wine_shop' | 'restaurant' | 'winemaker' | 'events';

interface BrutalistHeroProps {
  minimalMapStyle?: boolean;
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  userLocation?: string;
}

// Map CategoryType to WineVenueCategory for the map filter
const categoryToMapFilter = (category: CategoryType): WineVenueCategory[] => {
  switch (category) {
    case 'bar':
      return ['wine_bar'];
    case 'wine_shop':
      return ['wine_shop'];
    case 'restaurant':
      return ['restaurant'];
    case 'winemaker':
      return ['winery'];
    case 'events':
      return []; // Hide all venue markers for events view
    case 'overview':
    default:
      return ['wine_shop', 'wine_bar', 'winery', 'restaurant'];
  }
};

export const BrutalistHero: React.FC<BrutalistHeroProps> = ({ 
  minimalMapStyle = true,
  activeCategory,
  onCategoryChange,
  userLocation
}) => {
  const categories: { label: string; value: CategoryType }[] = [
    { label: 'OVERVIEW', value: 'overview' },
    { label: 'WINE BARS', value: 'bar' },
    { label: 'SHOPS', value: 'wine_shop' },
    { label: 'RESTAURANTS', value: 'restaurant' },
    { label: 'WINEMAKERS', value: 'winemaker' },
    { label: 'EVENTS', value: 'events' },
  ];

  const mapCategories = categoryToMapFilter(activeCategory);

  return (
    <div className="bg-background text-foreground">
      {/* Main Navbar */}
      <header className="border-b border-foreground/20">
        <div className="flex items-center justify-between h-12 px-4">
          <Link to="/" className="text-sm font-bold tracking-tight">
            POURCULTURE
          </Link>

          <div className="flex items-center gap-4 text-xs">
            {userLocation && (
              <span className="text-muted-foreground">
                📍 {userLocation}
              </span>
            )}
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
      <div className="border-b border-foreground/20 h-[50vh] min-h-[350px]">
        <HomeWineMap 
          minimalStyle={minimalMapStyle} 
          filterCategories={mapCategories}
        />
      </div>

      {/* Category Pills */}
      <div className="border-b border-foreground/20 py-3 px-4 overflow-x-auto sticky top-0 bg-background z-10">
        <div className="flex items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-4 py-1.5 text-[10px] tracking-wider rounded-sm transition-colors whitespace-nowrap ${
                activeCategory === cat.value
                  ? 'bg-foreground text-background' 
                  : 'border border-foreground/20 hover:border-foreground/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
