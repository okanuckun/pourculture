import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Building2, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { z } from 'zod';

const claimSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  businessEmail: z.string().email('Please enter a valid email'),
  businessPhone: z.string().optional(),
  roleAtVenue: z.enum(['owner', 'manager', 'staff']),
  message: z.string().max(500).optional(),
});

interface ClaimVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId?: string;
  googlePlaceId?: string;
  venueName: string;
  venueType: 'venue' | 'winemaker';
}

export const ClaimVenueDialog: React.FC<ClaimVenueDialogProps> = ({
  open,
  onOpenChange,
  venueId,
  googlePlaceId,
  venueName,
  venueType,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: venueName,
    businessEmail: '',
    businessPhone: '',
    roleAtVenue: 'owner',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
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

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to claim this venue');
        return;
      }

      const tableName = venueType === 'venue' ? 'venue_claims' : 'winemaker_claims';
      const idField = venueType === 'venue' ? 'venue_id' : 'winemaker_id';
      const roleField = venueType === 'venue' ? 'role_at_venue' : 'role_at_winemaker';

      if (venueType === 'venue') {
        const insertData: {
          user_id: string;
          business_name: string;
          business_email: string;
          business_phone: string | null;
          role_at_venue: string;
          message: string | null;
          venue_id?: string;
          google_place_id?: string;
        } = {
          user_id: user.id,
          business_name: formData.businessName,
          business_email: formData.businessEmail,
          business_phone: formData.businessPhone || null,
          role_at_venue: formData.roleAtVenue,
          message: formData.message || null,
        };
        
        if (venueId) insertData.venue_id = venueId;
        if (googlePlaceId) insertData.google_place_id = googlePlaceId;

        const { error } = await supabase.from('venue_claims').insert(insertData);
        if (error) throw error;
      } else {
        const insertData: {
          user_id: string;
          business_name: string;
          business_email: string;
          business_phone: string | null;
          role_at_winemaker: string;
          message: string | null;
          winemaker_id?: string;
        } = {
          user_id: user.id,
          business_name: formData.businessName,
          business_email: formData.businessEmail,
          business_phone: formData.businessPhone || null,
          role_at_winemaker: formData.roleAtVenue,
          message: formData.message || null,
        };
        
        if (venueId) insertData.winemaker_id = venueId;

        const { error } = await supabase.from('winemaker_claims').insert(insertData);
        if (error) throw error;
      }

      toast.success('Claim submitted successfully!', {
        description: 'Our team will review your request and get back to you.',
      });
      onOpenChange(false);
      setFormData({
        businessName: venueName,
        businessEmail: '',
        businessPhone: '',
        roleAtVenue: 'owner',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-purple-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-5 h-5 text-purple-400" />
            Claim {venueType === 'venue' ? 'Venue' : 'Winemaker'}
          </DialogTitle>
          <DialogDescription className="text-purple-300">
            Submit a request to become the verified owner of <strong>{venueName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="flex items-center gap-2 text-purple-200">
              <Building2 className="w-4 h-4" />
              Business Name
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="bg-[#252542] border-purple-500/30 text-white"
              placeholder="Your business name"
            />
            {errors.businessName && (
              <p className="text-red-400 text-sm">{errors.businessName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessEmail" className="flex items-center gap-2 text-purple-200">
              <Mail className="w-4 h-4" />
              Business Email *
            </Label>
            <Input
              id="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              className="bg-[#252542] border-purple-500/30 text-white"
              placeholder="contact@yourbusiness.com"
              required
            />
            {errors.businessEmail && (
              <p className="text-red-400 text-sm">{errors.businessEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone" className="flex items-center gap-2 text-purple-200">
              <Phone className="w-4 h-4" />
              Business Phone
            </Label>
            <Input
              id="businessPhone"
              type="tel"
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              className="bg-[#252542] border-purple-500/30 text-white"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2 text-purple-200">
              <User className="w-4 h-4" />
              Your Role
            </Label>
            <Select
              value={formData.roleAtVenue}
              onValueChange={(value) => 
                setFormData({ ...formData, roleAtVenue: value })
              }
            >
              <SelectTrigger className="bg-[#252542] border-purple-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#252542] border-purple-500/30">
                <SelectItem value="owner" className="text-white hover:bg-purple-500/20">Owner</SelectItem>
                <SelectItem value="manager" className="text-white hover:bg-purple-500/20">Manager</SelectItem>
                <SelectItem value="staff" className="text-white hover:bg-purple-500/20">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2 text-purple-200">
              <MessageSquare className="w-4 h-4" />
              Additional Information
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-[#252542] border-purple-500/30 text-white min-h-[80px]"
              placeholder="Tell us more about your connection to this venue..."
              maxLength={500}
            />
            <p className="text-xs text-purple-400">{formData.message.length}/500</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
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
      </DialogContent>
    </Dialog>
  );
};

export default ClaimVenueDialog;
