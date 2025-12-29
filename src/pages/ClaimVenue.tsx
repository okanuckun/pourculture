import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Building2, User, Mail, Phone, MessageSquare, ArrowLeft, MapPin } from 'lucide-react';
import { z } from 'zod';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';

const claimSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  businessEmail: z.string().email('Please enter a valid email'),
  businessPhone: z.string().optional(),
  roleAtVenue: z.enum(['owner', 'manager', 'staff']),
  message: z.string().max(500).optional(),
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a valid city'),
  country: z.string().min(2, 'Please enter a valid country'),
});

const ClaimVenue: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get('placeId');
  const placeName = searchParams.get('name') || '';
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    businessName: decodeURIComponent(placeName),
    businessEmail: '',
    businessPhone: '',
    roleAtVenue: 'owner',
    message: '',
    address: '',
    city: '',
    country: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to claim a venue');
        navigate('/auth');
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = claimSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!placeId) {
      toast.error('Invalid venue reference');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('venue_claims').insert({
        user_id: user.id,
        google_place_id: placeId,
        business_name: formData.businessName,
        business_email: formData.businessEmail,
        business_phone: formData.businessPhone || null,
        role_at_venue: formData.roleAtVenue,
        message: `Address: ${formData.address}, ${formData.city}, ${formData.country}\n\n${formData.message || ''}`,
      });

      if (error) throw error;

      toast.success('Claim submitted successfully!', {
        description: 'Our team will review your request and get back to you.',
      });
      navigate('/map');
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Claim Your Venue | pourculture"
        description="Claim and manage your wine venue on pourculture"
      />
      <RaisinNavbar />
      
      <div className="container max-w-2xl mx-auto px-4 py-8 pt-24">
        <Button
          variant="ghost"
          onClick={() => navigate('/map')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Map
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-6 h-6 text-primary" />
              Claim Your Venue
            </CardTitle>
            <CardDescription>
              Submit a request to become the verified owner of <strong className="text-foreground">{decodeURIComponent(placeName)}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Name *
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Your business name"
                />
                {errors.businessName && (
                  <p className="text-destructive text-sm">{errors.businessName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Business Email *
                  </Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                    placeholder="contact@yourbusiness.com"
                  />
                  {errors.businessEmail && (
                    <p className="text-destructive text-sm">{errors.businessEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Business Phone
                  </Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={formData.businessPhone}
                    onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Venue Address
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Wine Street"
                  />
                  {errors.address && (
                    <p className="text-destructive text-sm">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="text-destructive text-sm">{errors.city}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="USA"
                    />
                    {errors.country && (
                      <p className="text-destructive text-sm">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Role *
                </Label>
                <Select
                  value={formData.roleAtVenue}
                  onValueChange={(value) => setFormData({ ...formData, roleAtVenue: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Additional Information
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about your venue and why you should be verified..."
                  className="min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{formData.message.length}/500</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/map')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Claim'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClaimVenue;