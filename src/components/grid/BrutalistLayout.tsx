import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, User, Heart, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BrutalistLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  backLabel?: string;
}

export const BrutalistLayout: React.FC<BrutalistLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  backPath = '/',
  backLabel = 'Back',
}) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Navbar */}
      <header className="border-b border-foreground/20 sticky top-0 bg-background z-50">
        <div className="flex items-center justify-between h-12 px-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-baseline text-sm font-bold tracking-tight">
            POURCULTURE
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF553A] ml-0.5 inline-block flex-shrink-0"></span>
          </Link>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              {/* Wine Routes */}
              <Link
                to="/wine-routes"
                className="px-2 py-1 text-[10px] tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                WINE ROUTES
              </Link>

              {/* People */}
              <Link
                to="/people"
                className="px-2 py-1 text-[10px] tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                PEOPLE
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
                  <DropdownMenuItem onClick={() => navigate('/submit/venue')} className="flex flex-col items-start text-xs">
                    <span className="font-medium">Submit a Venue</span>
                    <span className="text-[10px] text-muted-foreground">Bar, restaurant, wine shop</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/submit/winemaker')} className="flex flex-col items-start text-xs">
                    <span className="font-medium">Submit a Winemaker</span>
                    <span className="text-[10px] text-muted-foreground">Natural wine producer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/submit/event')} className="flex flex-col items-start text-xs">
                    <span className="font-medium">Submit an Event</span>
                    <span className="text-[10px] text-muted-foreground">Wine fair, tasting, festival</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/claim-venue')} className="flex flex-col items-start text-xs border-t mt-1 pt-2">
                    <span className="font-medium">Claim Your Business</span>
                    <span className="text-[10px] text-muted-foreground">Already listed? Claim ownership</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 text-[10px] tracking-wider hover:text-muted-foreground transition-colors">
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">ACCOUNT</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background border-foreground/20">
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user?.id}`)} className="text-xs">
                      My Profile
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

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-foreground/20 animate-in slide-in-from-top duration-200 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="px-4 py-3 space-y-2">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Natural Wine</div>
              <Link 
                to="/about/natural-wine" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-xs hover:text-muted-foreground"
              >
                What is Natural Wine?
              </Link>
              <Link 
                to="/wine-routes" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-xs hover:text-muted-foreground"
              >
                Wine Routes
              </Link>
              <Link 
                to="/knowledge" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-xs hover:text-muted-foreground"
              >
                Knowledge Hub
              </Link>
              <Link 
                to="/people" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-xs hover:text-muted-foreground"
              >
                People & Books
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

              <div className="border-t border-foreground/10 pt-2 mt-2">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Submit</div>
                <Link 
                  to="/submit/venue" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Submit a Venue
                </Link>
                <Link 
                  to="/submit/winemaker" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Submit a Winemaker
                </Link>
                <Link 
                  to="/submit/event" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-xs hover:text-muted-foreground"
                >
                  Submit an Event
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
                    to={`/profile/${user?.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 text-xs hover:text-muted-foreground"
                  >
                    My Profile
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

              {/* Mobile Theme Toggle */}
              <div className="border-t border-foreground/10 pt-2 mt-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page Header */}
      {(title || showBackButton) && (
        <div className="border-b border-foreground/20 px-4 md:px-6 py-6 md:py-8">
          <div className="max-w-6xl mx-auto">
            {showBackButton && (
              <Link 
                to={backPath}
                className="inline-flex items-center gap-2 text-[10px] tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-3 h-3" />
                {backLabel.toUpperCase()}
              </Link>
            )}
            {title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/20 py-8 px-4 md:px-6 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-[10px] tracking-wider text-muted-foreground mb-3">EXPLORE</h3>
              <div className="space-y-2">
                <Link to="/discover?category=bar" className="block text-xs hover:text-muted-foreground">Wine Bars</Link>
                <Link to="/discover?category=wine_shop" className="block text-xs hover:text-muted-foreground">Wine Shops</Link>
                <Link to="/discover?category=restaurant" className="block text-xs hover:text-muted-foreground">Restaurants</Link>
                <Link to="/wine-routes" className="block text-xs hover:text-muted-foreground">Wine Routes</Link>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] tracking-wider text-muted-foreground mb-3">LEARN</h3>
              <div className="space-y-2">
                <Link to="/about/natural-wine" className="block text-xs hover:text-muted-foreground">What is Natural Wine?</Link>
                <Link to="/knowledge" className="block text-xs hover:text-muted-foreground">Knowledge Hub</Link>
                <Link to="/people" className="block text-xs hover:text-muted-foreground">People & Books</Link>
                <Link to="/forum" className="block text-xs hover:text-muted-foreground">Forum</Link>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] tracking-wider text-muted-foreground mb-3">SUBMIT</h3>
              <div className="space-y-2">
                <Link to="/submit/venue" className="block text-xs hover:text-muted-foreground">Add a Venue</Link>
                <Link to="/submit/winemaker" className="block text-xs hover:text-muted-foreground">Add a Winemaker</Link>
                <Link to="/submit/event" className="block text-xs hover:text-muted-foreground">Submit an Event</Link>
                <Link to="/claim-venue" className="block text-xs hover:text-muted-foreground">Claim Your Business</Link>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] tracking-wider text-muted-foreground mb-3">CONNECT</h3>
              <div className="space-y-2">
                <a href="mailto:hello@pourculture.com" className="block text-xs hover:text-muted-foreground">hello@pourculture.com</a>
                <a href="https://instagram.com/pourculture" target="_blank" rel="noopener noreferrer" className="block text-xs hover:text-muted-foreground">@pourculture</a>
              </div>
            </div>
          </div>
          <div className="border-t border-foreground/10 mt-8 pt-6 text-center">
            <p className="text-[10px] text-muted-foreground tracking-wider">
              © {new Date().getFullYear()} POURCULTURE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Sheet */}
      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
