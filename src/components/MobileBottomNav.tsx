import { Link, useLocation } from 'react-router-dom';
import { Compass, Wine, BookOpen, Notebook, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WineScannerSheet } from '@/components/WineScanner/WineScannerSheet';
import { AuthSheet } from '@/components/AuthSheet';

interface Tab {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
}

const tabs: Tab[] = [
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/feed', label: 'Feed', icon: Wine },
  { path: '/journal', label: 'Journal', icon: Notebook, requiresAuth: true },
  { path: '/knowledge', label: 'Learn', icon: BookOpen },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleScanClick = () => {
    if (!loggedIn) {
      setAuthOpen(true);
    } else {
      setScanOpen(true);
    }
  };

  const renderTab = (tab: Tab) => {
    const isActive = location.pathname.startsWith(tab.path);
    return (
      <Link
        key={tab.path}
        to={tab.path}
        className={cn(
          "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <tab.icon className={cn("w-5 h-5", isActive && "text-primary")} />
        <span className={cn("text-[9px] tracking-wider", isActive && "font-medium")}>
          {tab.label.toUpperCase()}
        </span>
      </Link>
    );
  };

  // Left tabs (before scan button)
  const leftTabs = tabs.slice(0, 2);
  // Right tabs (after scan button)
  const rightTabs = tabs.slice(2);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-foreground/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-around h-14 relative">
          {leftTabs.map(renderTab)}

          {/* Center scan button */}
          <button
            onClick={handleScanClick}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg border-4 border-background">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[9px] tracking-wider text-muted-foreground mt-0.5">SCAN</span>
          </button>

          {rightTabs.map(renderTab)}
        </div>
      </nav>

      <WineScannerSheet open={scanOpen} onOpenChange={setScanOpen} />
      <AuthSheet isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
