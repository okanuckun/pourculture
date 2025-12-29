import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';

const SubmitWinemaker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

      setSubmitted(true);
      toast({ title: 'Success', description: 'Winemaker profile submitted successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <BrutalistLayout>
        <SEOHead title="Submission Received | PourCulture" description="Your winemaker submission has been received" />
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-16 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold tracking-tight mb-4">SUBMISSION RECEIVED</h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Thank you for registering. Your winemaker profile is now live on PourCulture.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 border-2 border-foreground text-xs tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              BACK TO HOME
            </button>
            <button 
              onClick={() => { setSubmitted(false); setFormData({ name: '', domain_name: '', region: '', country: '', bio: '', website: '', image_url: '' }); }}
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
      title="SUBMIT A WINEMAKER"
      subtitle="Join our community of natural wine producers. Share your story with wine lovers worldwide."
      showBackButton
      backPath="/"
      backLabel="Home"
    >
      <SEOHead title="Submit a Winemaker | PourCulture" description="Register your winery on PourCulture" />
      
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">WINEMAKER INFORMATION</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">Winemaker Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Pierre Overnoy" 
                  className="border-foreground/20 focus:border-foreground"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain_name" className="text-xs">Domain/Winery Name</Label>
                <Input 
                  id="domain_name" 
                  value={formData.domain_name} 
                  onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })} 
                  placeholder="Domaine Pierre Overnoy"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region" className="text-xs">Region</Label>
                <Input 
                  id="region" 
                  value={formData.region} 
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })} 
                  placeholder="Jura"
                  className="border-foreground/20 focus:border-foreground"
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

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs">Biography</Label>
              <Textarea 
                id="bio" 
                value={formData.bio} 
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                placeholder="Tell us about your winemaking philosophy..." 
                rows={4}
                className="border-foreground/20 focus:border-foreground"
              />
            </div>
          </div>

          {/* Links */}
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">LINKS & MEDIA</h2>
            
            <div className="space-y-2">
              <Label htmlFor="website" className="text-xs">Website</Label>
              <Input 
                id="website" 
                value={formData.website} 
                onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                placeholder="https://domaine.com"
                className="border-foreground/20 focus:border-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-xs">Profile Image URL</Label>
              <Input 
                id="image_url" 
                value={formData.image_url} 
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                placeholder="https://example.com/image.jpg"
                className="border-foreground/20 focus:border-foreground"
              />
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
              'REGISTER WINEMAKER'
            )}
          </button>
        </form>
      </div>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </BrutalistLayout>
  );
};

export default SubmitWinemaker;
