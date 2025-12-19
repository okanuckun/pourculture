import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';

const SubmitWinemaker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain_name: '',
    region: '',
    country: '',
    bio: '',
    website: '',
    image_url: ''
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

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!formData.name || !formData.country) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('winemakers').insert({
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
        domain_name: formData.domain_name.trim() || null,
        region: formData.region.trim() || null,
        country: formData.country.trim(),
        bio: formData.bio.trim() || null,
        website: formData.website.trim() || null,
        image_url: formData.image_url.trim() || null,
        created_by: user.id,
        is_new: true
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Winemaker profile submitted successfully!' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Register as Winemaker | RAW CELLAR" description="Register your winery on RAW CELLAR" />
      <RaisinNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <h1 className="text-3xl font-bold text-foreground mb-2">Register as Winemaker</h1>
          <p className="text-muted-foreground mb-8">Join our community of natural winemakers.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Winemaker Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Pierre Overnoy" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain_name">Domain/Winery Name</Label>
                <Input id="domain_name" value={formData.domain_name} onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })} placeholder="Domaine Pierre Overnoy" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input id="region" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} placeholder="Jura" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="France" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about your winemaking philosophy..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://domaine.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Profile Image URL</Label>
              <Input id="image_url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Register Winemaker'}
            </Button>
          </form>
        </div>
      </main>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default SubmitWinemaker;
