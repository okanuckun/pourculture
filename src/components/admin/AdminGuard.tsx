import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/** Server-side admin check (check_is_admin RPC) before rendering any admin page. */
export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'ok'>('loading');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth', { replace: true }); return; }
      const { data, error } = await supabase.rpc('check_is_admin');
      if (!active) return;
      if (error || data !== true) { navigate('/', { replace: true }); return; }
      setState('ok');
    })();
    return () => { active = false; };
  }, [navigate]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
};
