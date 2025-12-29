import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Loader2, ArrowLeft, CheckCircle, XCircle, Clock, 
  Building2, User, Mail, Phone, MessageSquare, Calendar 
} from 'lucide-react';
import { format } from 'date-fns';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';

interface Claim {
  id: string;
  venue_id?: string | null;
  winemaker_id?: string | null;
  google_place_id?: string | null;
  user_id: string;
  status: string;
  business_name: string;
  business_email: string;
  business_phone?: string | null;
  role_at_venue?: string | null;
  role_at_winemaker?: string | null;
  message?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  profiles?: { display_name: string | null } | null;
  venues?: { name: string; slug: string } | null;
  winemakers?: { name: string; slug: string } | null;
}

const AdminClaims: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [venueClaims, setVenueClaims] = useState<Claim[]>([]);
  const [winemakerClaims, setWinemakerClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await fetchClaims();
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const { data: venueData, error: venueError } = await supabase
        .from('venue_claims')
        .select(`
          *,
          venues:venue_id(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (venueError) throw venueError;
      
      const venueUserIds = venueData?.map(c => c.user_id).filter(Boolean) || [];
      let venueProfiles: Record<string, string> = {};
      if (venueUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', venueUserIds);
        profilesData?.forEach(p => {
          venueProfiles[p.user_id] = p.display_name || 'Unknown';
        });
      }
      
      const venueClaimsWithProfiles = (venueData || []).map(claim => ({
        ...claim,
        profiles: { display_name: venueProfiles[claim.user_id] || null }
      })) as Claim[];
      
      setVenueClaims(venueClaimsWithProfiles);

      const { data: winemakerData, error: winemakerError } = await supabase
        .from('winemaker_claims')
        .select(`
          *,
          winemakers:winemaker_id(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (winemakerError) throw winemakerError;
      
      const winemakerUserIds = winemakerData?.map(c => c.user_id).filter(Boolean) || [];
      let winemakerProfiles: Record<string, string> = {};
      if (winemakerUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', winemakerUserIds);
        profilesData?.forEach(p => {
          winemakerProfiles[p.user_id] = p.display_name || 'Unknown';
        });
      }
      
      const winemakerClaimsWithProfiles = (winemakerData || []).map(claim => ({
        ...claim,
        profiles: { display_name: winemakerProfiles[claim.user_id] || null }
      })) as Claim[];
      
      setWinemakerClaims(winemakerClaimsWithProfiles);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
    }
  };

  const handleAction = async () => {
    if (!selectedClaim || !actionType) return;
    setActionLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const isVenueClaim = 'role_at_venue' in selectedClaim;
      const tableName = isVenueClaim ? 'venue_claims' : 'winemaker_claims';
      const entityTable = isVenueClaim ? 'venues' : 'winemakers';
      const entityId = isVenueClaim ? selectedClaim.venue_id : selectedClaim.winemaker_id;

      const updateData: Record<string, unknown> = {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      };

      if (actionType === 'reject') {
        updateData.rejection_reason = rejectionReason;
      }

      const { error: claimError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', selectedClaim.id);

      if (claimError) throw claimError;

      if (actionType === 'approve') {
        if (entityId) {
          const { error: entityError } = await supabase
            .from(entityTable)
            .update({
              owner_id: selectedClaim.user_id,
              is_claimed: true,
            })
            .eq('id', entityId);

          if (entityError) throw entityError;
        } else if (isVenueClaim && selectedClaim.google_place_id) {
          const slug = selectedClaim.business_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now();

          const { data: newVenue, error: createError } = await supabase
            .from('venues')
            .insert({
              name: selectedClaim.business_name,
              slug: slug,
              address: 'Address pending',
              city: 'City pending',
              country: 'Country pending',
              category: 'bar' as const,
              google_place_id: selectedClaim.google_place_id,
              owner_id: selectedClaim.user_id,
              is_claimed: true,
              created_by: selectedClaim.user_id,
              email: selectedClaim.business_email,
              phone: selectedClaim.business_phone,
            })
            .select()
            .single();

          if (createError) throw createError;

          await supabase
            .from('venue_claims')
            .update({ venue_id: newVenue.id })
            .eq('id', selectedClaim.id);

          toast.info('New venue created! Owner should update details.');
        }
      }

      toast.success(`Claim ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedClaim(null);
      setActionType(null);
      setRejectionReason('');
      await fetchClaims();
    } catch (error) {
      console.error('Error processing claim:', error);
      toast.error('Failed to process claim');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-2 border-yellow-500 text-yellow-600 bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" /> PENDING
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="border-2 border-green-500 text-green-600 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" /> APPROVED
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="border-2 border-red-500 text-red-600 bg-red-50">
            <XCircle className="w-3 h-3 mr-1" /> REJECTED
          </Badge>
        );
      default:
        return null;
    }
  };

  const ClaimCard = ({ claim, type }: { claim: Claim; type: 'venue' | 'winemaker' }) => {
    const entityName = type === 'venue' 
      ? (claim.venues?.name || claim.business_name)
      : (claim.winemakers?.name || claim.business_name);
    const role = type === 'venue' ? claim.role_at_venue : claim.role_at_winemaker;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border-2 border-foreground/20 hover:border-foreground transition-colors p-6"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-foreground" />
              <span className="font-medium text-foreground uppercase tracking-tight">{entityName}</span>
              {getStatusBadge(claim.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{claim.profiles?.display_name || 'Unknown User'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{claim.business_email}</span>
              </div>
              {claim.business_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{claim.business_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(claim.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-2 border-foreground/30 text-foreground uppercase text-[10px]">
                {role}
              </Badge>
              {claim.google_place_id && (
                <Badge variant="outline" className="border-2 border-blue-500 text-blue-600 uppercase text-[10px]">
                  Google Place
                </Badge>
              )}
            </div>

            {claim.message && (
              <div className="mt-3 p-3 bg-muted border-2 border-border text-sm text-foreground">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                {claim.message}
              </div>
            )}

            {claim.rejection_reason && (
              <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 text-sm text-red-700">
                <XCircle className="w-4 h-4 inline mr-2" />
                {claim.rejection_reason}
              </div>
            )}
          </div>

          {claim.status === 'pending' && (
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-500 border-2 border-green-700 uppercase text-xs font-medium"
                onClick={() => {
                  setSelectedClaim(claim);
                  setActionType('approve');
                }}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="border-2 border-red-700 uppercase text-xs font-medium"
                onClick={() => {
                  setSelectedClaim(claim);
                  setActionType('reject');
                }}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const pendingVenue = venueClaims.filter(c => c.status === 'pending').length;
  const pendingWinemaker = winemakerClaims.filter(c => c.status === 'pending').length;

  return (
    <BrutalistLayout>
      <SEOHead title="Ownership Claims - Admin" description="Review and manage venue/winemaker ownership requests" />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin')}
            className="border-2 border-foreground hover:bg-foreground hover:text-background"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-medium text-foreground uppercase tracking-tight">
              Ownership Claims
            </h1>
            <p className="text-muted-foreground">Review and manage venue/winemaker ownership requests</p>
          </div>
        </motion.div>

        <Tabs defaultValue="venues" className="space-y-6">
          <TabsList className="bg-background border-2 border-foreground p-1">
            <TabsTrigger 
              value="venues" 
              className="data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs font-medium"
            >
              Venue Claims
              {pendingVenue > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-foreground border-2 border-yellow-600">{pendingVenue}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="winemakers" 
              className="data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs font-medium"
            >
              Winemaker Claims
              {pendingWinemaker > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-foreground border-2 border-yellow-600">{pendingWinemaker}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="venues" className="space-y-4">
            {venueClaims.length === 0 ? (
              <div className="bg-background border-2 border-foreground/20 p-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground uppercase text-sm">No venue claims yet</p>
              </div>
            ) : (
              venueClaims.map(claim => (
                <ClaimCard key={claim.id} claim={claim} type="venue" />
              ))
            )}
          </TabsContent>

          <TabsContent value="winemakers" className="space-y-4">
            {winemakerClaims.length === 0 ? (
              <div className="bg-background border-2 border-foreground/20 p-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground uppercase text-sm">No winemaker claims yet</p>
              </div>
            ) : (
              winemakerClaims.map(claim => (
                <ClaimCard key={claim.id} claim={claim} type="winemaker" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => {
        setActionType(null);
        setSelectedClaim(null);
        setRejectionReason('');
      }}>
        <DialogContent className="bg-background border-2 border-foreground text-foreground">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tight">
              {actionType === 'approve' ? 'Approve Claim' : 'Reject Claim'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {actionType === 'approve' 
                ? `This will grant ownership of "${selectedClaim?.business_name}" to the user.`
                : 'Please provide a reason for rejection.'}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label className="text-foreground uppercase text-xs font-medium">Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-background border-2 border-foreground/30 text-foreground focus:border-foreground"
                placeholder="Explain why this claim is being rejected..."
              />
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-2 border-foreground hover:bg-foreground hover:text-background uppercase text-xs font-medium"
              onClick={() => {
                setActionType(null);
                setSelectedClaim(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 border-2 uppercase text-xs font-medium ${
                actionType === 'approve' 
                  ? 'bg-green-600 hover:bg-green-500 border-green-700' 
                  : 'bg-red-600 hover:bg-red-500 border-red-700'
              }`}
              onClick={handleAction}
              disabled={actionLoading || (actionType === 'reject' && !rejectionReason)}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : actionType === 'approve' ? (
                'Confirm Approval'
              ) : (
                'Confirm Rejection'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </BrutalistLayout>
  );
};

export default AdminClaims;