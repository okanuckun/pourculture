import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon, CheckCircle2 } from 'lucide-react';
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
  const [submitted, setSubmitted] = useState(false);
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

      setSubmitted(true);
      toast({ title: 'Success', description: 'Event submitted successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <BrutalistLayout>
        <SEOHead title="Submission Received | PourCulture" description="Your event submission has been received" />
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-16 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold tracking-tight mb-4">SUBMISSION RECEIVED</h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Thank you for submitting your event. It's now live on PourCulture.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 border-2 border-foreground text-xs tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              BACK TO HOME
            </button>
            <button 
              onClick={() => { 
                setSubmitted(false); 
                setFormData({ title: '', venue_name: '', city: '', country: '', description: '', price: '', ticket_url: '', poster_url: '', is_pro_only: false });
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              className="px-4 py-2 bg-foreground text-background text-xs tracking-wider hover:bg-foreground/90 transition-colors"
            >
              SUBMIT ANOTHER
            </button>
          </div>
        </div>
      </BrutalistLayout>
    );
  }

  return (
    <BrutalistLayout
      title="SUBMIT AN EVENT"
      subtitle="Add a natural wine fair, tasting, or festival to our calendar."
      showBackButton
      backPath="/"
      backLabel="Home"
    >
      <SEOHead title="Submit an Event | PourCulture" description="Submit a natural wine event or fair to PourCulture" />
      
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details */}
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">EVENT DETAILS</h2>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs">Event Title *</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="RAW Wine Fair Paris 2025" 
                className="border-foreground/20 focus:border-foreground"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_name" className="text-xs">Venue Name</Label>
              <Input 
                id="venue_name" 
                value={formData.venue_name} 
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })} 
                placeholder="Carreau du Temple"
                className="border-foreground/20 focus:border-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs">City *</Label>
                <Input 
                  id="city" 
                  value={formData.city} 
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                  placeholder="Paris" 
                  className="border-foreground/20 focus:border-foreground"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-xs">Country *</Label>
                <Input 
                  id="country" 
                  value={formData.country} 
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
                  placeholder="France" 
                  className="border-foreground/20 focus:border-foreground"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start text-left font-normal border-foreground/20", 
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-foreground/20" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start text-left font-normal border-foreground/20", 
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-foreground/20" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Tell us about this event..." 
                rows={4}
                className="border-foreground/20 focus:border-foreground"
              />
            </div>
          </div>

          {/* Tickets & Media */}
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">TICKETS & MEDIA</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs">Ticket Price</Label>
                <Input 
                  id="price" 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                  placeholder="€35"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket_url" className="text-xs">Ticket URL</Label>
                <Input 
                  id="ticket_url" 
                  value={formData.ticket_url} 
                  onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })} 
                  placeholder="https://tickets.com"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poster_url" className="text-xs">Poster Image URL</Label>
              <Input 
                id="poster_url" 
                value={formData.poster_url} 
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })} 
                placeholder="https://example.com/poster.jpg"
                className="border-foreground/20 focus:border-foreground"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Checkbox 
                id="is_pro_only" 
                checked={formData.is_pro_only} 
                onCheckedChange={(checked) => setFormData({ ...formData, is_pro_only: checked as boolean })} 
              />
              <Label htmlFor="is_pro_only" className="text-xs font-normal">
                This is a trade/professional only event
              </Label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-foreground text-background text-xs tracking-wider font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SUBMITTING...
              </>
            ) : (
              'SUBMIT EVENT'
            )}
          </button>
        </form>
      </div>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </BrutalistLayout>
  );
};

export default SubmitWineFair;
