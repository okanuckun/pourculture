import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeWineMap } from '@/components/WineMap/HomeWineMap';
import { WineVenueCategory, WineFairMarker } from '@/components/WineMap/types';
import { ChevronDown, Menu, X, Search, User, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type CategoryType = 'overview' | 'bar' | 'wine_shop' | 'restaurant' | 'winemaker' | 'events';

export interface UserCoordinates {
  lat: number;
  lng: number;
}

interface BrutalistHeroProps {
  minimalMapStyle?: boolean;
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  userLocation?: string;
  userCoords?: UserCoordinates | null;
  wineFairs?: WineFairMarker[];
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
  userLocation,
  userCoords,
  wineFairs = []
}) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const categories: { label: string; value: CategoryType }[] = [
    { label: 'OVERVIEW', value: 'overview' },
    { label: 'WINE BARS', value: 'bar' },
    { label: 'SHOPS', value: 'wine_shop' },
    { label: 'RESTAURANTS', value: 'restaurant' },
    { label: 'WINEMAKERS', value: 'winemaker' },
    { label: 'EVENTS', value: 'events' },
  ];

  const mapCategories = categoryToMapFilter(activeCategory);
  const showEvents = activeCategory === 'events';

  return (
    <div className="bg-background text-foreground">
      {/* Main Navbar */}
      <header className="border-b border-foreground/20">
        <div className="flex items-center justify-between h-12 px-4">
          {/* Logo */}
          <Link to="/" className="text-sm font-bold tracking-tight">
            POURCULTURE
          </Link>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Location - Desktop */}
            {userLocation && (
              <span className="hidden lg:flex items-center gap-1 text-muted-foreground text-[10px] px-2">
                📍 {userLocation}
              </span>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              {/* Wine Routes */}
              <Link 
                to="/wine-routes" 
                className="px-2 py-1 text-[10px] tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                WINE ROUTES
              </Link>

              {/* Natural Wine Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 text-[10px] tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  NATURAL WINE
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border-foreground/20">
                  <DropdownMenuItem onClick={() => navigate('/about/natural-wine')} className="text-xs">
                    What is Natural Wine?
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/knowledge')} className="text-xs">
                    Knowledge Hub
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/forum')} className="text-xs">
                    Forum
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/news')} className="text-xs">
                    News
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Submit & Claim Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 text-[10px] tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  SUBMIT
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border-foreground/20">
                  <DropdownMenuItem onClick={() => navigate('/submit-venue')} className="flex flex-col items-start text-xs">
                    <span className="font-medium">Submit a Venue</span>
                    <span className="text-[10px] text-muted-foreground">Bar, restaurant, wine shop</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/submit-winemaker')} className="flex flex-col items-start text-xs">
                    <span className="font-medium">Submit a Winemaker</span>
                    <span className="text-[10px] text-muted-foreground">Natural wine producer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/submit-wine-fair')} className="flex flex-col items-start text-xs">
                    <span className="font-medium">Submit an Event</span>
                    <span className="text-[10px] text-muted-foreground">Wine fair, tasting, festival</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/claim-venue')} className="flex flex-col items-start text-xs border-t mt-1 pt-2">
                    <span className="font-medium">Claim Your Business</span>
                    <span className="text-[10px] text-muted-foreground">Already listed? Claim ownership</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Favorites */}
              <Link to="/favorites" className="flex items-center gap-1 px-2 py-1 text-[10px] tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <Heart className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">FAVS</span>
              </Link>

              {/* User Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 text-[10px] tracking-wider hover:text-muted-foreground transition-colors">
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">ACCOUNT</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background border-foreground/20">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-xs">
                      My Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-events')} className="text-xs">
                      My Events
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/claim-venue')} className="text-xs">
                      Claim a Venue
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={async () => await supabase.auth.signOut()}
                      className="text-xs text-destructive focus:text-destructive"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] tracking-wider hover:text-muted-foreground transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">SIGN IN</span>
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-foreground/20 animate-in slide-in-from-top duration-200">
            <div className="px-4 py-3 space-y-2">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Explore</div>
              <Link 
                to="/discover?category=restaurant" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-xs hover:text-muted-foreground"
              >
                Restaurants
              </Link>
              <Link 
                to="/discover?category=bar" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-xs hover:text-muted-foreground"
              >
                Wine Bars
              </Link>
              <Link 
                to="/discover?category=wine_shop" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-xs hover:text-muted-foreground"
              >
                Wine Shops
              </Link>
              
              <div className="border-t border-foreground/10 pt-2 mt-2">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Wine Routes</div>
                <Link 
                  to="/wine-routes" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Explore Wine Routes
                </Link>
              </div>

              <div className="border-t border-foreground/10 pt-2 mt-2">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Natural Wine</div>
                <Link 
                  to="/about/natural-wine" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  What is Natural Wine?
                </Link>
                <Link 
                  to="/knowledge" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Knowledge Hub
                </Link>
                <Link 
                  to="/forum" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Forum
                </Link>
                <Link 
                  to="/news" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  News
                </Link>
              </div>

              <div className="border-t border-foreground/10 pt-2 mt-2">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Submit</div>
                <Link 
                  to="/submit-venue" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Submit a Venue
                </Link>
                <Link 
                  to="/submit-winemaker" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Submit a Winemaker
                </Link>
                <Link 
                  to="/claim-venue" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Claim Your Business
                </Link>
              </div>

              {user ? (
                <div className="border-t border-foreground/10 pt-2 mt-2">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Account</div>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 text-xs hover:text-muted-foreground"
                  >
                    My Dashboard
                  </Link>
                  <Link 
                    to="/my-events" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 text-xs hover:text-muted-foreground"
                  >
                    My Events
                  </Link>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-1.5 text-xs text-destructive"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-foreground/10 pt-2 mt-2">
                  <button 
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-1.5 text-xs font-medium"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Map Section - Full Width */}
      <div className="border-b border-foreground/20 h-[50vh] min-h-[350px]">
        <HomeWineMap 
          minimalStyle={minimalMapStyle} 
          filterCategories={mapCategories}
          wineFairs={wineFairs}
          showEvents={showEvents}
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

      {/* Auth Sheet */}
      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
