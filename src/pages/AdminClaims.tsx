import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Navbar } from '@/components/Navbar';

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
      // Fetch venue claims (without profiles join since no FK exists)
      const { data: venueData, error: venueError } = await supabase
        .from('venue_claims')
        .select(`
          *,
          venues:venue_id(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (venueError) throw venueError;
      
      // Fetch profiles separately for venue claims
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

      // Fetch winemaker claims
      const { data: winemakerData, error: winemakerError } = await supabase
        .from('winemaker_claims')
        .select(`
          *,
          winemakers:winemaker_id(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (winemakerError) throw winemakerError;
      
      // Fetch profiles separately for winemaker claims
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

      // Update claim status
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

      // If approved
      if (actionType === 'approve') {
        if (entityId) {
          // Existing venue/winemaker - just update owner
          const { error: entityError } = await supabase
            .from(entityTable)
            .update({
              owner_id: selectedClaim.user_id,
              is_claimed: true,
            })
            .eq('id', entityId);

          if (entityError) throw entityError;
        } else if (isVenueClaim && selectedClaim.google_place_id) {
          // Google Place claim without existing venue - create new venue
          const slug = selectedClaim.business_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now();

          const { data: newVenue, error: createError } = await supabase
            .from('venues')
            .insert({
              name: selectedClaim.business_name,
              slug: slug,
              address: 'Address pending', // User will update
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

          // Update claim with new venue_id
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
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500 text-red-500"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
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
      <Card className="bg-[#252542] border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">{entityName}</span>
                {getStatusBadge(claim.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-purple-300">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{claim.profiles?.display_name || 'Unknown User'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{claim.business_email}</span>
                </div>
                {claim.business_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{claim.business_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(claim.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  {role}
                </Badge>
                {claim.google_place_id && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    Google Place
                  </Badge>
                )}
              </div>

              {claim.message && (
                <div className="mt-2 p-2 bg-[#1a1a2e] rounded text-sm text-purple-200">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  {claim.message}
                </div>
              )}

              {claim.rejection_reason && (
                <div className="mt-2 p-2 bg-red-500/10 rounded text-sm text-red-300">
                  <XCircle className="w-3 h-3 inline mr-1" />
                  {claim.rejection_reason}
                </div>
              )}
            </div>

            {claim.status === 'pending' && (
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-500"
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
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const pendingVenue = venueClaims.filter(c => c.status === 'pending').length;
  const pendingWinemaker = winemakerClaims.filter(c => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="text-purple-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Ownership Claims</h1>
            <p className="text-purple-300">Review and manage venue/winemaker ownership requests</p>
          </div>
        </div>

        <Tabs defaultValue="venues" className="space-y-6">
          <TabsList className="bg-[#252542] border border-purple-500/20">
            <TabsTrigger value="venues" className="data-[state=active]:bg-purple-600">
              Venue Claims
              {pendingVenue > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-black">{pendingVenue}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="winemakers" className="data-[state=active]:bg-purple-600">
              Winemaker Claims
              {pendingWinemaker > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-black">{pendingWinemaker}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="venues" className="space-y-4">
            {venueClaims.length === 0 ? (
              <Card className="bg-[#252542] border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-300">No venue claims yet</p>
                </CardContent>
              </Card>
            ) : (
              venueClaims.map(claim => (
                <ClaimCard key={claim.id} claim={claim} type="venue" />
              ))
            )}
          </TabsContent>

          <TabsContent value="winemakers" className="space-y-4">
            {winemakerClaims.length === 0 ? (
              <Card className="bg-[#252542] border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-300">No winemaker claims yet</p>
                </CardContent>
              </Card>
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
        <DialogContent className="bg-[#1a1a2e] border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Claim' : 'Reject Claim'}
            </DialogTitle>
            <DialogDescription className="text-purple-300">
              {actionType === 'approve' 
                ? `This will grant ownership of "${selectedClaim?.business_name}" to the user.`
                : 'Please provide a reason for rejection.'}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label className="text-purple-200">Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-[#252542] border-purple-500/30 text-white"
                placeholder="Explain why this claim is being rejected..."
              />
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-purple-500/30"
              onClick={() => {
                setActionType(null);
                setSelectedClaim(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
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
    </div>
  );
};

export default AdminClaims;
