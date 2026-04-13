import { Link, useLocation } from 'react-router-dom';
import { Compass, Route, Wine, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const publicTabs = [
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/feed', label: 'Feed', icon: Wine },
  { path: '/wine-routes', label: 'Routes', icon: Route },
  { path: '/knowledge', label: 'Learn', icon: BookOpen },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const tabs = publicTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-foreground/20 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
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
        })}
      </div>
    </nav>
  );
}
