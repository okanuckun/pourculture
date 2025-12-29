import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';

const SubmitVenue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    description: '',
    phone: '',
    website: '',
    email: '',
    imageUrl: '',
    openingHours: '',
    priceRange: '',
    features: [] as string[],
    wineTypes: [] as string[],
    submitterName: '',
    submitterEmail: '',
    submitterRole: '',
    additionalNotes: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setFormData(prev => ({ ...prev, submitterEmail: session.user.email || '' }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleWineTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      wineTypes: prev.wineTypes.includes(type)
        ? prev.wineTypes.filter(t => t !== type)
        : [...prev.wineTypes, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!formData.name || !formData.category || !formData.address || !formData.city || !formData.country) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('submissions').insert({
        user_id: user.id,
        submission_type: 'venue',
        data: {
          name: formData.name.trim(),
          category: formData.category,
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim(),
          postalCode: formData.postalCode.trim(),
          description: formData.description.trim(),
          phone: formData.phone.trim(),
          website: formData.website.trim(),
          email: formData.email.trim(),
          imageUrl: formData.imageUrl.trim(),
          openingHours: formData.openingHours.trim(),
          priceRange: formData.priceRange,
          features: formData.features,
          wineTypes: formData.wineTypes,
          submitterName: formData.submitterName.trim(),
          submitterEmail: formData.submitterEmail.trim(),
          submitterRole: formData.submitterRole,
          additionalNotes: formData.additionalNotes.trim()
        }
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: 'Submission Received!', description: 'Your venue will be reviewed by our team.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <BrutalistLayout>
        <SEOHead title="Submission Received | PourCulture" description="Your venue submission has been received" />
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-16 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold tracking-tight mb-4">SUBMISSION RECEIVED</h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Thank you for submitting your venue. Our team will review it and get back to you within 2-3 business days.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 border-2 border-foreground text-xs tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              BACK TO HOME
            </button>
            <button 
              onClick={() => { setSubmitted(false); setFormData({ ...formData, name: '', address: '', city: '', description: '' }); }}
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
      title="SUBMIT A VENUE"
      subtitle="Add a natural wine bar, restaurant, wine shop or accommodation to our directory. All submissions are reviewed before publishing."
      showBackButton
      backPath="/"
      backLabel="Home"
    >
      <SEOHead title="Submit a Venue | PourCulture" description="Submit a natural wine venue to PourCulture" />
      
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Venue Information */}
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">VENUE INFORMATION</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">Venue Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. Le Verre Volé" 
                  className="border-foreground/20 focus:border-foreground"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="border-foreground/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-foreground/20">
                    <SelectItem value="bar">Wine Bar</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="wine_shop">Wine Shop / Cave</SelectItem>
                    <SelectItem value="accommodation">Wine Hotel / B&B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs">Street Address *</Label>
              <Input 
                id="address" 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                placeholder="e.g. 67 Rue de Lancry" 
                className="border-foreground/20 focus:border-foreground"
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="postalCode" className="text-xs">Postal Code</Label>
                <Input 
                  id="postalCode" 
                  value={formData.postalCode} 
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} 
                  placeholder="75010"
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
              <Label htmlFor="description" className="text-xs">Description *</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Tell us about this venue - what makes it special?" 
                rows={4}
                className="border-foreground/20 focus:border-foreground"
                required
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">CONTACT DETAILS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                  placeholder="+33 1 23 45 67 89"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  placeholder="contact@venue.com"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-xs">Website</Label>
                <Input 
                  id="website" 
                  value={formData.website} 
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                  placeholder="https://venue.com"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-xs">Image URL</Label>
                <Input 
                  id="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                  placeholder="https://example.com/photo.jpg"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">ADDITIONAL DETAILS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingHours" className="text-xs">Opening Hours</Label>
                <Textarea 
                  id="openingHours" 
                  value={formData.openingHours} 
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })} 
                  placeholder="Mon-Fri: 10:00-22:00"
                  rows={3}
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRange" className="text-xs">Price Range</Label>
                <Select value={formData.priceRange} onValueChange={(v) => setFormData({ ...formData, priceRange: v })}>
                  <SelectTrigger className="border-foreground/20">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-foreground/20">
                    <SelectItem value="$">$ - Budget Friendly</SelectItem>
                    <SelectItem value="$$">$$ - Moderate</SelectItem>
                    <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                    <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs">Wine Types Available</Label>
              <div className="flex flex-wrap gap-2">
                {['Natural Wine', 'Organic Wine', 'Biodynamic Wine', 'Orange Wine', 'Pet-Nat', 'Skin Contact'].map(type => (
                  <label key={type} className="flex items-center gap-2 px-3 py-2 border border-foreground/20 cursor-pointer hover:border-foreground transition-colors text-xs">
                    <Checkbox 
                      checked={formData.wineTypes.includes(type)}
                      onCheckedChange={() => handleWineTypeToggle(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs">Venue Features</Label>
              <div className="flex flex-wrap gap-2">
                {['Outdoor Seating', 'Reservations', 'Walk-ins Welcome', 'Food Menu', 'Tastings', 'Wine by Glass', 'Takeaway'].map(feature => (
                  <label key={feature} className="flex items-center gap-2 px-3 py-2 border border-foreground/20 cursor-pointer hover:border-foreground transition-colors text-xs">
                    <Checkbox 
                      checked={formData.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submitter Information */}
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <h2 className="text-[10px] tracking-wider text-muted-foreground mb-4">YOUR INFORMATION</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submitterName" className="text-xs">Your Name</Label>
                <Input 
                  id="submitterName" 
                  value={formData.submitterName} 
                  onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })} 
                  placeholder="John Doe"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitterEmail" className="text-xs">Your Email</Label>
                <Input 
                  id="submitterEmail" 
                  type="email"
                  value={formData.submitterEmail} 
                  onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })} 
                  placeholder="john@example.com"
                  className="border-foreground/20 focus:border-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitterRole" className="text-xs">Your Relationship to This Venue</Label>
              <Select value={formData.submitterRole} onValueChange={(v) => setFormData({ ...formData, submitterRole: v })}>
                <SelectTrigger className="border-foreground/20">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-background border-foreground/20">
                  <SelectItem value="owner">I am the owner</SelectItem>
                  <SelectItem value="employee">I work here</SelectItem>
                  <SelectItem value="customer">I am a customer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes" className="text-xs">Additional Notes</Label>
              <Textarea 
                id="additionalNotes" 
                value={formData.additionalNotes} 
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })} 
                placeholder="Anything else we should know?"
                rows={3}
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
              'SUBMIT VENUE'
            )}
          </button>
        </form>
      </div>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </BrutalistLayout>
  );
};

export default SubmitVenue;
