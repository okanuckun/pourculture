import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CalendarIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SubmitWineFair = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: '',
    venue_name: '',
    city: '',
    country: '',
    description: '',
    price: '',
    ticket_url: '',
    poster_url: '',
    is_pro_only: false
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!formData.title || !formData.city || !formData.country || !startDate) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('wine_fairs').insert({
        title: formData.title.trim(),
        slug: generateSlug(formData.title),
        venue_name: formData.venue_name.trim() || null,
        city: formData.city.trim(),
        country: formData.country.trim(),
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        description: formData.description.trim() || null,
        price: formData.price.trim() || null,
        ticket_url: formData.ticket_url.trim() || null,
        poster_url: formData.poster_url.trim() || null,
        is_pro_only: formData.is_pro_only,
        created_by: user.id
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Event submitted successfully!' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Submit an Event | RAW CELLAR" description="Submit a natural wine event or fair to RAW CELLAR" />
      <RaisinNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <h1 className="text-3xl font-bold text-foreground mb-2">Submit an Event</h1>
          <p className="text-muted-foreground mb-8">Add a natural wine fair or event to our calendar.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="RAW Wine Fair Paris 2025" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_name">Venue Name</Label>
              <Input id="venue_name" value={formData.venue_name} onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })} placeholder="Carreau du Temple" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Paris" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="France" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tell us about this event..." rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Ticket Price</Label>
                <Input id="price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="€35" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket_url">Ticket URL</Label>
                <Input id="ticket_url" value={formData.ticket_url} onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })} placeholder="https://tickets.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poster_url">Poster Image URL</Label>
              <Input id="poster_url" value={formData.poster_url} onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })} placeholder="https://example.com/poster.jpg" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_pro_only" checked={formData.is_pro_only} onCheckedChange={(checked) => setFormData({ ...formData, is_pro_only: checked as boolean })} />
              <Label htmlFor="is_pro_only" className="text-sm font-normal">This is a trade/professional only event</Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Event'}
            </Button>
          </form>
        </div>
      </main>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default SubmitWineFair;
