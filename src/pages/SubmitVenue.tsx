import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, MapPin, Phone, Mail, Globe, Clock, CheckCircle2 } from 'lucide-react';
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
      <div className="min-h-screen bg-background">
        <SEOHead title="Submission Received | PourCulture" description="Your venue submission has been received" />
        <RaisinNavbar />
        
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="py-16">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Submission Received!</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Thank you for submitting your venue. Our team will review your submission and get back to you within 2-3 business days.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
                <Button onClick={() => { setSubmitted(false); setFormData({ ...formData, name: '', address: '', city: '', description: '' }); }}>
                  Submit Another
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Submit a Venue | PourCulture" description="Submit a natural wine venue to PourCulture" />
      <RaisinNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Submit a Venue</h1>
            <p className="text-muted-foreground">
              Add a natural wine bar, restaurant, wine shop or accommodation to our directory. 
              All submissions are reviewed by our team before being published.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Venue Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Venue Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Le Verre Volé" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Wine Bar</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="wine_shop">Wine Shop / Cave</SelectItem>
                      <SelectItem value="accommodation">Wine Hotel / B&B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input 
                  id="address" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  placeholder="e.g. 67 Rue de Lancry" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    value={formData.city} 
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                    placeholder="Paris" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    value={formData.postalCode} 
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} 
                    placeholder="75010" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input 
                    id="country" 
                    value={formData.country} 
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
                    placeholder="France" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Tell us about this venue - what makes it special? What kind of wines do they serve?" 
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contact Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="+33 1 23 45 67 89" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="contact@venue.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={formData.website} 
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                    placeholder="https://venue.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                    placeholder="https://example.com/photo.jpg" 
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Additional Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingHours">Opening Hours</Label>
                  <Textarea 
                    id="openingHours" 
                    value={formData.openingHours} 
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })} 
                    placeholder="Mon-Fri: 10:00-22:00&#10;Sat-Sun: 12:00-23:00"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceRange">Price Range</Label>
                  <Select value={formData.priceRange} onValueChange={(v) => setFormData({ ...formData, priceRange: v })}>
                    <SelectTrigger><SelectValue placeholder="Select price range" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$">$ - Budget Friendly</SelectItem>
                      <SelectItem value="$$">$$ - Moderate</SelectItem>
                      <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                      <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Wine Types Available</Label>
                <div className="flex flex-wrap gap-2">
                  {['Natural Wine', 'Organic Wine', 'Biodynamic Wine', 'Orange Wine', 'Pet-Nat', 'Skin Contact'].map(type => (
                    <label key={type} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                      <Checkbox 
                        checked={formData.wineTypes.includes(type)}
                        onCheckedChange={() => handleWineTypeToggle(type)}
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Venue Features</Label>
                <div className="flex flex-wrap gap-2">
                  {['Outdoor Seating', 'Reservations', 'Walk-ins Welcome', 'Food Menu', 'Tastings', 'Wine by Glass', 'Takeaway'].map(feature => (
                    <label key={feature} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                      <Checkbox 
                        checked={formData.features.includes(feature)}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submitter Information */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Your Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">Your Name</Label>
                  <Input 
                    id="submitterName" 
                    value={formData.submitterName} 
                    onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })} 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterEmail">Your Email</Label>
                  <Input 
                    id="submitterEmail" 
                    type="email"
                    value={formData.submitterEmail} 
                    onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })} 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitterRole">Your Relationship to This Venue</Label>
                <Select value={formData.submitterRole} onValueChange={(v) => setFormData({ ...formData, submitterRole: v })}>
                  <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">I am the owner</SelectItem>
                    <SelectItem value="employee">I work here</SelectItem>
                    <SelectItem value="customer">I am a customer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea 
                  id="additionalNotes" 
                  value={formData.additionalNotes} 
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })} 
                  placeholder="Any additional information you'd like to share..."
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p>
                <strong>Note:</strong> All submissions are reviewed by our team before being published. 
                This usually takes 2-3 business days. We may contact you if we need additional information.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Venue for Review'}
            </Button>
          </form>
        </div>
      </main>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default SubmitVenue;
