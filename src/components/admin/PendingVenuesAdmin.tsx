import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, XCircle, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface PendingVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  category: string;
  created_at: string;
}

export const PendingVenuesAdmin = () => {
  const [venues, setVenues] = useState<PendingVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: isAdmin } = await supabase.rpc('check_is_admin');
    if (isAdmin !== true) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('venues')
      .select('id,name,address,city,country,category,created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) toast.error('Failed to load pending venues');
    setVenues((data || []) as PendingVenue[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: 'published' | 'rejected') => {
    setBusy(id);
    const { error } = await supabase.from('venues').update({ status }).eq('id', id);
    setBusy(null);
    if (error) { toast.error('Update failed'); return; }
    toast.success(status === 'published' ? 'Venue approved' : 'Venue rejected');
    setVenues((v) => v.filter((x) => x.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (venues.length === 0) return <p className="py-12 text-center text-muted-foreground uppercase text-sm">No pending venues</p>;

  return (
    <div className="space-y-3">
      {venues.map((v) => (
        <div key={v.id} className="border-2 border-foreground p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold uppercase truncate">{v.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />{v.address}, {v.city}, {v.country} · {v.category}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" disabled={busy === v.id} onClick={() => setStatus(v.id, 'published')}>
              <Check className="h-4 w-4 mr-1" />Approve
            </Button>
            <Button size="sm" variant="outline" disabled={busy === v.id} onClick={() => setStatus(v.id, 'rejected')}>
              <XCircle className="h-4 w-4 mr-1" />Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
