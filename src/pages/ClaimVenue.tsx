import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Building2, User, Mail, Phone, MessageSquare, ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';

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
  const venueId = searchParams.get('venueId');
  const placeName = searchParams.get('name') || '';
  const placeCity = searchParams.get('city') || '';
  const placeCountry = searchParams.get('country') || '';
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    businessName: decodeURIComponent(placeName),
    businessEmail: '',
    businessPhone: '',
    roleAtVenue: 'owner',
    message: '',
    address: '',
    city: decodeURIComponent(placeCity),
    country: decodeURIComponent(placeCountry),
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
      setCheckingAuth(false);
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

    if (!placeId && !venueId) {
      toast.error('Invalid venue reference');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('venue_claims').insert({
        user_id: user.id,
        google_place_id: placeId || null,
        venue_id: venueId || null,
        business_name: formData.businessName,
        business_email: formData.businessEmail,
        business_phone: formData.businessPhone || null,
        role_at_venue: formData.roleAtVenue,
        message: `Address: ${formData.address}, ${formData.city}, ${formData.country}\n\n${formData.message || ''}`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Claim submitted successfully!');
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <BrutalistLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </BrutalistLayout>
    );
  }

  if (submitted) {
    return (
      <BrutalistLayout>
        <SEOHead 
          title="Claim Submitted | PourCulture"
          description="Your venue claim has been submitted for review"
        />
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto border-2 border-foreground flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">CLAIM RECEIVED</h1>
            <p className="text-muted-foreground">
              Thank you for submitting your claim. Our team will review your request and get back to you within 2-3 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild className="border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors">
                <Link to="/map">BACK TO MAP</Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-foreground">
                <Link to="/">GO HOME</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </BrutalistLayout>
    );
  }

  return (
    <BrutalistLayout
      title="CLAIM YOUR VENUE"
      subtitle={`Submit a request to become the verified owner of ${decodeURIComponent(placeName)}`}
      showBackButton
      backPath="/map"
      backLabel="Back to Map"
    >
      <SEOHead 
        title="Claim Your Venue | PourCulture"
        description="Claim and manage your wine venue on PourCulture"
      />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-foreground"
        >
          {/* Header */}
          <div className="border-b-2 border-foreground p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">VENUE CLAIM REQUEST</h2>
                <p className="text-sm text-muted-foreground">All fields marked with * are required</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business Name *
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your business name"
                className="border-2 border-foreground/20 focus:border-foreground bg-transparent h-12"
              />
              {errors.businessName && (
                <p className="text-destructive text-sm">{errors.businessName}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessEmail" className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Business Email *
                </Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  placeholder="contact@yourbusiness.com"
                  className="border-2 border-foreground/20 focus:border-foreground bg-transparent h-12"
                />
                {errors.businessEmail && (
                  <p className="text-destructive text-sm">{errors.businessEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPhone" className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Business Phone
                </Label>
                <Input
                  id="businessPhone"
                  type="tel"
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="border-2 border-foreground/20 focus:border-foreground bg-transparent h-12"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="border-2 border-foreground/20 p-4 space-y-4">
              <h3 className="font-bold uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Venue Address
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Wine Street"
                  className="border-2 border-foreground/20 focus:border-foreground bg-transparent h-12"
                />
                {errors.address && (
                  <p className="text-destructive text-sm">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Paris"
                    className="border-2 border-foreground/20 focus:border-foreground bg-transparent h-12"
                  />
                  {errors.city && (
                    <p className="text-destructive text-sm">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="France"
                    className="border-2 border-foreground/20 focus:border-foreground bg-transparent h-12"
                  />
                  {errors.country && (
                    <p className="text-destructive text-sm">{errors.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Role *
              </Label>
              <Select
                value={formData.roleAtVenue}
                onValueChange={(value) => setFormData({ ...formData, roleAtVenue: value })}
              >
                <SelectTrigger className="border-2 border-foreground/20 focus:border-foreground bg-transparent h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Additional Information
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us more about your venue and why you should be verified..."
                className="min-h-[120px] border-2 border-foreground/20 focus:border-foreground bg-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{formData.message.length}/500</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-foreground/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/map')}
                className="flex-1 h-12 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    SUBMITTING...
                  </>
                ) : (
                  'SUBMIT CLAIM'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </BrutalistLayout>
  );
};

export default ClaimVenue;
