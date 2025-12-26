import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, Wine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from './AuthSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const RaisinNavbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
      setIsAuthOpen(false);
    }
  }, [user, pendingRoute, navigate]);

  return createPortal(
    <>
      <nav className="fixed top-0 left-0 right-0 z-[2000] bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Wine className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                pourculture
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Explore Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  EXPLORE
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/explore/restaurants')}>
                    Restaurants
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/explore/bars')}>
                    Bars
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/explore/wine-shops')}>
                    Wine Shops
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/explore/accommodations')}>
                    Accommodations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/explore/winemakers')}>
                    Winemakers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/explore/events')}>
                    Events
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Natural Wine Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  NATURAL WINE
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/about/natural-wine')}>
                    What is Natural Wine?
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/knowledge')}>
                    Knowledge Hub
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/forum')}>
                    Forum
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/explore/winemakers')}>
                    Winemakers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/news')}>
                    News
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sign Up & Submit Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  SIGN UP AND SUBMIT
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/submit/venue')}>
                    Submit a Venue
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/submit/winemaker')}>
                    Register as Winemaker
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/submit/event')}>
                    Submit an Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  ENGLISH
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Français</DropdownMenuItem>
                  <DropdownMenuItem>Español</DropdownMenuItem>
                  <DropdownMenuItem>Deutsch</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Login */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    ACCOUNT
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => navigate('/my-venues')}>
                      My Venues
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-events')}>
                      My Events
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => await supabase.auth.signOut()}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  LOGIN
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-foreground"
              >
                Explore
              </Link>
              <Link 
                to="/explore/winemakers" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-foreground"
              >
                Winemakers
              </Link>
              <Link 
                to="/explore/events" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-foreground"
              >
                Events
              </Link>
              <Link 
                to="/news" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-foreground"
              >
                News
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/my-venues" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-foreground"
                  >
                    My Venues
                  </Link>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-2 text-sm font-medium text-foreground"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setIsAuthOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-2 text-sm font-medium text-primary"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <AuthSheet isOpen={isAuthOpen} onClose={() => { setIsAuthOpen(false); setPendingRoute(null); }} />
    </>,
    document.body
  );
};
