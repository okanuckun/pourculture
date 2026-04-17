import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { SEOHead } from '@/components/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Wine, Calendar, Loader2, Upload, X, Book, Shield, MapPin, FileText, Check, XCircle, LogOut, Users, UserCheck, Compass } from 'lucide-react';
import { KnowledgeHubAdmin } from '@/components/admin/KnowledgeHubAdmin';
import { UserVerificationAdmin } from '@/components/admin/UserVerificationAdmin';
import { PeopleAdmin } from '@/components/admin/PeopleAdmin';
import { VenueDiscovery } from '@/components/admin/VenueDiscovery';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';

const eventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  creator: z.string().trim().min(1, 'Creator is required').max(100),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  date: z.string().trim().min(1, 'Date is required').max(50),
  time: z.string().trim().min(1, 'Time is required').max(50),
  address: z.string().trim().min(1, 'Address is required').max(300),
  target_date: z.string().refine((val) => !isNaN(new Date(val).getTime()), 'Invalid date format'),
});

const wineSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  grape: z.string().trim().min(1, 'Grape is required').max(100),
  region: z.string().trim().min(1, 'Region is required').max(100),
  country: z.string().trim().min(1, 'Country is required').max(100),
  winemaker: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  price_range: z.string().trim().max(20).optional(),
  color: z.enum(['red', 'white', 'orange', 'rose']),
  style: z.enum(['funky', 'clean']),
  acidity: z.enum(['acidic', 'soft']),
  alcohol_percentage: z.number().min(0).max(25).optional(),
  year: z.number().min(1900).max(2100).optional(),
});

interface Event {
  id: string;
  title: string;
  creator: string;
  description: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  target_date: string;
}

interface WineItem {
  id: string;
  name: string;
  grape: string;
  region: string;
  country: string;
  winemaker: string | null;
  description: string | null;
  image_url: string | null;
  price_range: string | null;
  color: string;
  style: string;
  acidity: string;
  occasion: string[];
  alcohol_percentage: number | null;
  year: number | null;
  is_featured: boolean;
}

const emptyWine: Omit<WineItem, 'id'> = {
  name: '',
  grape: '',
  region: '',
  country: '',
  winemaker: '',
  description: '',
  image_url: '',
  price_range: '',
  color: 'red',
  style: 'clean',
  acidity: 'soft',
  occasion: [],
  alcohol_percentage: null,
  year: null,
  is_featured: false,
};

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [wines, setWines] = useState<WineItem[]>([]);
  const [selectedWine, setSelectedWine] = useState<WineItem | null>(null);
  const [isCreatingWine, setIsCreatingWine] = useState(false);
  const [newWine, setNewWine] = useState<Omit<WineItem, 'id'>>(emptyWine);
  const [savingWine, setSavingWine] = useState(false);
  const [uploadingWineImage, setUploadingWineImage] = useState(false);
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: isAdminUser, error } = await supabase.rpc('check_is_admin');

    if (error || !isAdminUser) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    fetchEvents();
    fetchWines();
    fetchSubmissions();
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setEvents(data || []);
      if (data && data.length > 0) setSelectedEvent(data[0]);
    }
  };

  const fetchWines = async () => {
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setWines(data || []);
    }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleApproveSubmission = async (submission: any) => {
    try {
      const data = submission.data;
      
      if (submission.submission_type === 'venue') {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { error } = await supabase.from('venues').insert({
          name: data.name,
          slug,
          category: data.category,
          address: data.address,
          city: data.city,
          country: data.country,
          description: data.description,
          phone: data.phone,
          website: data.website,
          email: data.email,
          image_url: data.imageUrl,
          created_by: submission.user_id
        });
        if (error) throw error;
      } else if (submission.submission_type === 'winemaker') {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { error } = await supabase.from('winemakers').insert({
          name: data.name,
          slug,
          region: data.region,
          country: data.country,
          bio: data.bio,
          website: data.website,
          created_by: submission.user_id
        });
        if (error) throw error;
      } else if (submission.submission_type === 'event') {
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { error } = await supabase.from('wine_fairs').insert({
          title: data.title,
          slug,
          city: data.city,
          country: data.country,
          description: data.description,
          start_date: data.startDate,
          end_date: data.endDate,
          venue_name: data.venueName,
          created_by: submission.user_id
        });
        if (error) throw error;
      }

      const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', submission.id);
      
      if (updateError) throw updateError;

      toast({ title: 'Approved!', description: 'Submission has been approved and published.' });
      fetchSubmissions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status: 'rejected', 
          admin_notes: reason,
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', submissionId);
      
      if (error) throw error;

      toast({ title: 'Rejected', description: 'Submission has been rejected.' });
      fetchSubmissions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedEvent) return;
    
    const file = e.target.files[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPG, PNG, GIF, or WebP image', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${selectedEvent.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      setSelectedEvent({ ...selectedEvent, background_image_url: publicUrl });
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const targetDateISO = selectedEvent.target_date.includes('T') 
      ? new Date(selectedEvent.target_date).toISOString()
      : selectedEvent.target_date;

    try {
      eventSchema.parse({
        title: selectedEvent.title,
        creator: selectedEvent.creator,
        description: selectedEvent.description,
        date: selectedEvent.date,
        time: selectedEvent.time,
        address: selectedEvent.address,
        target_date: targetDateISO,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: validationError.errors[0].message, variant: 'destructive' });
        return;
      }
    }

    const { error } = await supabase
      .from('events')
      .update({
        title: selectedEvent.title.trim(),
        creator: selectedEvent.creator.trim(),
        description: selectedEvent.description.trim(),
        date: selectedEvent.date.trim(),
        time: selectedEvent.time.trim(),
        address: selectedEvent.address.trim(),
        background_image_url: selectedEvent.background_image_url,
        target_date: targetDateISO,
      })
      .eq('id', selectedEvent.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Event updated successfully' });
      fetchEvents();
    }
  };

  const handleCreateWine = async () => {
    try {
      wineSchema.parse({
        ...newWine,
        alcohol_percentage: newWine.alcohol_percentage || undefined,
        year: newWine.year || undefined,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: validationError.errors[0].message, variant: 'destructive' });
        return;
      }
    }

    setSavingWine(true);
    try {
      const { error } = await supabase.from('wines').insert({
        name: newWine.name.trim(),
        grape: newWine.grape.trim(),
        region: newWine.region.trim(),
        country: newWine.country.trim(),
        winemaker: newWine.winemaker?.trim() || null,
        description: newWine.description?.trim() || null,
        price_range: newWine.price_range?.trim() || null,
        color: newWine.color,
        style: newWine.style,
        acidity: newWine.acidity,
        occasion: newWine.occasion,
        alcohol_percentage: newWine.alcohol_percentage,
        year: newWine.year,
        is_featured: newWine.is_featured,
      });

      if (error) throw error;
      
      toast({ title: 'Success', description: 'Wine created successfully' });
      setNewWine(emptyWine);
      setIsCreatingWine(false);
      fetchWines();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingWine(false);
    }
  };

  const handleUpdateWine = async () => {
    if (!selectedWine) return;

    try {
      wineSchema.parse({
        ...selectedWine,
        alcohol_percentage: selectedWine.alcohol_percentage || undefined,
        year: selectedWine.year || undefined,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: validationError.errors[0].message, variant: 'destructive' });
        return;
      }
    }

    setSavingWine(true);
    try {
      const { error } = await supabase
        .from('wines')
        .update({
          name: selectedWine.name.trim(),
          grape: selectedWine.grape.trim(),
          region: selectedWine.region.trim(),
          country: selectedWine.country.trim(),
          winemaker: selectedWine.winemaker?.trim() || null,
          description: selectedWine.description?.trim() || null,
          price_range: selectedWine.price_range?.trim() || null,
          color: selectedWine.color,
          style: selectedWine.style,
          acidity: selectedWine.acidity,
          occasion: selectedWine.occasion,
          alcohol_percentage: selectedWine.alcohol_percentage,
          year: selectedWine.year,
          is_featured: selectedWine.is_featured,
        })
        .eq('id', selectedWine.id);

      if (error) throw error;
      
      toast({ title: 'Success', description: 'Wine updated successfully' });
      setSelectedWine(null);
      fetchWines();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingWine(false);
    }
  };

  const handleDeleteWine = async (wineId: string) => {
    if (!confirm('Are you sure you want to delete this wine?')) return;

    try {
      const { error } = await supabase.from('wines').delete().eq('id', wineId);
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Wine deleted successfully' });
      if (selectedWine?.id === wineId) setSelectedWine(null);
      fetchWines();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleWineImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    wine: Omit<WineItem, 'id'> | WineItem,
    setWine: (wine: any) => void
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload JPG, PNG, GIF or WebP', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setUploadingWineImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('wine-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wine-images')
        .getPublicUrl(fileName);

      setWine({ ...wine, image_url: publicUrl });
      toast({ title: 'Success', description: 'Image uploaded' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingWineImage(false);
    }
  };

  const colorLabels: Record<string, string> = { red: 'Red', white: 'White', orange: 'Orange', rose: 'Rosé' };
  const styleLabels: Record<string, string> = { funky: 'Funky', clean: 'Clean' };
  const acidityLabels: Record<string, string> = { acidic: 'Acidic', soft: 'Soft' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const WineForm = ({ wine, setWine, onSave, onCancel, isNew }: {
    wine: Omit<WineItem, 'id'> | WineItem;
    setWine: (wine: any) => void;
    onSave: () => void;
    onCancel: () => void;
    isNew: boolean;
  }) => (
    <div className="space-y-4 bg-background border-2 border-foreground p-6">
      <h3 className="text-lg font-medium text-foreground uppercase tracking-tight">
        {isNew ? 'Add New Wine' : 'Edit Wine'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Name *</label>
          <Input
            value={wine.name}
            onChange={(e) => setWine({ ...wine, name: e.target.value })}
            placeholder="Wine name"
            className="border-2 border-foreground/30 focus:border-foreground"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Grape *</label>
          <Input
            value={wine.grape}
            onChange={(e) => setWine({ ...wine, grape: e.target.value })}
            placeholder="Grape variety"
            className="border-2 border-foreground/30 focus:border-foreground"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Region *</label>
          <Input
            value={wine.region}
            onChange={(e) => setWine({ ...wine, region: e.target.value })}
            placeholder="Region"
            className="border-2 border-foreground/30 focus:border-foreground"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Country *</label>
          <Input
            value={wine.country}
            onChange={(e) => setWine({ ...wine, country: e.target.value })}
            placeholder="Country"
            className="border-2 border-foreground/30 focus:border-foreground"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Producer</label>
          <Input
            value={wine.winemaker || ''}
            onChange={(e) => setWine({ ...wine, winemaker: e.target.value })}
            placeholder="Producer name"
            className="border-2 border-foreground/30 focus:border-foreground"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Price Range</label>
          <Select
            value={wine.price_range || ''}
            onValueChange={(value) => setWine({ ...wine, price_range: value })}
          >
            <SelectTrigger className="border-2 border-foreground/30 focus:border-foreground">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="€">€ (Budget)</SelectItem>
              <SelectItem value="€€">€€ (Mid-range)</SelectItem>
              <SelectItem value="€€€">€€€ (Premium)</SelectItem>
              <SelectItem value="€€€€">€€€€ (Luxury)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Image</label>
        {wine.image_url ? (
          <div className="relative inline-block">
            <img
              src={wine.image_url}
              alt="Wine"
              className="w-full max-w-xs h-40 object-cover border-2 border-foreground"
            />
            <button
              type="button"
              onClick={() => setWine({ ...wine, image_url: '' })}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleWineImageUpload(e, wine, setWine)}
              disabled={uploadingWineImage}
              className="cursor-pointer border-2 border-foreground/30"
            />
            {uploadingWineImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-5 w-5 animate-spin text-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Description</label>
        <Textarea
          value={wine.description || ''}
          onChange={(e) => setWine({ ...wine, description: e.target.value })}
          placeholder="Wine description"
          rows={3}
          className="border-2 border-foreground/30 focus:border-foreground"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Color *</label>
          <Select
            value={wine.color}
            onValueChange={(value) => setWine({ ...wine, color: value })}
          >
            <SelectTrigger className="border-2 border-foreground/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="red">🍷 Red</SelectItem>
              <SelectItem value="white">🥂 White</SelectItem>
              <SelectItem value="orange">🧡 Orange</SelectItem>
              <SelectItem value="rose">🌸 Rosé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Style *</label>
          <Select
            value={wine.style}
            onValueChange={(value) => setWine({ ...wine, style: value })}
          >
            <SelectTrigger className="border-2 border-foreground/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="funky">🎸 Funky</SelectItem>
              <SelectItem value="clean">✨ Clean</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Acidity *</label>
          <Select
            value={wine.acidity}
            onValueChange={(value) => setWine({ ...wine, acidity: value })}
          >
            <SelectTrigger className="border-2 border-foreground/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acidic">🍋 Acidic</SelectItem>
              <SelectItem value="soft">🍑 Soft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Alcohol %</label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="25"
            value={wine.alcohol_percentage || ''}
            onChange={(e) => setWine({ ...wine, alcohol_percentage: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="12.5"
            className="border-2 border-foreground/30"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Year</label>
          <Input
            type="number"
            min="1900"
            max="2100"
            value={wine.year || ''}
            onChange={(e) => setWine({ ...wine, year: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="2022"
            className="border-2 border-foreground/30"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wine.is_featured}
              onChange={(e) => setWine({ ...wine, is_featured: e.target.checked })}
              className="border-2 border-foreground"
            />
            <span className="text-sm text-foreground uppercase">Featured</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={onCancel} variant="outline" className="flex-1 border-2 border-foreground uppercase">
          Cancel
        </Button>
        <Button onClick={onSave} disabled={savingWine} className="flex-1 bg-foreground text-background hover:bg-foreground/90 uppercase">
          {savingWine ? <Loader2 className="h-4 w-4 animate-spin" /> : isNew ? 'Create' : 'Save'}
        </Button>
      </div>
    </div>
  );

  return (
    <BrutalistLayout>
      <SEOHead 
        title="Admin Dashboard"
        description="Manage events and content for your platform"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-medium text-foreground uppercase tracking-tight">
            Admin Panel
          </h1>
          <Button onClick={handleSignOut} variant="outline" className="border-2 border-foreground hover:bg-foreground hover:text-background uppercase text-xs">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6 bg-background border-2 border-foreground p-1">
            <TabsTrigger value="discover" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs">
              <Compass className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs">
              <FileText className="h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="wines" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs">
              <Wine className="h-4 w-4" />
              Wines
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs">
              <Shield className="h-4 w-4" />
              Claims
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs">
              <UserCheck className="h-4 w-4" />
              People
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs">
              <Book className="h-4 w-4" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background uppercase text-xs">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover">
            <VenueDiscovery />
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <h2 className="text-xl font-medium text-foreground uppercase tracking-tight">User Submissions</h2>
            
            {submissionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-foreground/20">
                No submissions yet.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <motion.div 
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-background border-2 p-6 ${
                      submission.status === 'pending' ? 'border-yellow-500' : 
                      submission.status === 'approved' ? 'border-green-500' : 'border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-[10px] font-medium uppercase border-2 ${
                            submission.submission_type === 'venue' ? 'border-blue-500 text-blue-600' :
                            submission.submission_type === 'winemaker' ? 'border-purple-500 text-purple-600' :
                            'border-orange-500 text-orange-600'
                          }`}>
                            {submission.submission_type === 'venue' ? 'Venue' : 
                             submission.submission_type === 'winemaker' ? 'Producer' : 'Event'}
                          </span>
                          <span className={`px-2 py-1 text-[10px] font-medium uppercase border-2 ${
                            submission.status === 'pending' ? 'border-yellow-500 text-yellow-600' :
                            submission.status === 'approved' ? 'border-green-500 text-green-600' :
                            'border-red-500 text-red-600'
                          }`}>
                            {submission.status === 'pending' ? 'Pending' : 
                             submission.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-foreground uppercase tracking-tight">
                          {submission.data?.name || submission.data?.title || 'Untitled'}
                        </h3>
                        
                        <div className="mt-2 text-sm text-muted-foreground space-y-1">
                          {submission.data?.city && submission.data?.country && (
                            <p>📍 {submission.data.city}, {submission.data.country}</p>
                          )}
                          {submission.data?.category && (
                            <p>🏷️ Category: {submission.data.category}</p>
                          )}
                          {submission.data?.description && (
                            <p className="line-clamp-2">📝 {submission.data.description}</p>
                          )}
                          {submission.data?.submitterName && (
                            <p>👤 Submitted by: {submission.data.submitterName} ({submission.data.submitterRole || 'Not specified'})</p>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-3">
                          {new Date(submission.created_at).toLocaleDateString('en-US', { 
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      
                      {submission.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveSubmission(submission)}
                            className="bg-green-600 hover:bg-green-500 border-2 border-green-700 uppercase text-xs"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRejectSubmission(submission.id)}
                            className="border-2 border-red-700 uppercase text-xs"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Wines Tab */}
          <TabsContent value="wines" className="space-y-6">
            {!isCreatingWine && !selectedWine && (
              <Button onClick={() => setIsCreatingWine(true)} className="w-full md:w-auto bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground uppercase">
                <Plus className="h-4 w-4 mr-2" />
                Add New Wine
              </Button>
            )}

            {isCreatingWine && (
              <WineForm
                wine={newWine}
                setWine={setNewWine}
                onSave={handleCreateWine}
                onCancel={() => { setIsCreatingWine(false); setNewWine(emptyWine); }}
                isNew={true}
              />
            )}

            {selectedWine && !isCreatingWine && (
              <WineForm
                wine={selectedWine}
                setWine={setSelectedWine}
                onSave={handleUpdateWine}
                onCancel={() => setSelectedWine(null)}
                isNew={false}
              />
            )}

            {!isCreatingWine && !selectedWine && (
              <div className="grid gap-4">
                {wines.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-foreground/20">
                    No wines added yet
                  </div>
                ) : (
                  wines.map((wine) => (
                    <motion.div
                      key={wine.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-background border-2 border-foreground/20 hover:border-foreground transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {wine.color === 'red' ? '🍷' : wine.color === 'white' ? '🥂' : wine.color === 'orange' ? '🧡' : '🌸'}
                          </span>
                          <h4 className="font-medium text-foreground truncate uppercase">{wine.name}</h4>
                          {wine.is_featured && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase border border-primary">Featured</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {wine.grape} • {wine.region}, {wine.country}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-muted text-[10px] uppercase text-muted-foreground border border-border">
                            {colorLabels[wine.color]}
                          </span>
                          <span className="px-2 py-0.5 bg-muted text-[10px] uppercase text-muted-foreground border border-border">
                            {styleLabels[wine.style]}
                          </span>
                          <span className="px-2 py-0.5 bg-muted text-[10px] uppercase text-muted-foreground border border-border">
                            {acidityLabels[wine.acidity]}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-2 border-foreground/30 hover:border-foreground"
                          onClick={() => setSelectedWine(wine)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                          onClick={() => handleDeleteWine(wine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <div className="space-y-6">
              <div className="bg-background border-2 border-foreground/20 p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-foreground" />
                <h3 className="text-lg font-medium mb-2 uppercase tracking-tight">Ownership Claims Management</h3>
                <p className="text-muted-foreground mb-4">
                  Review and manage venue and producer ownership requests.
                </p>
                <Button onClick={() => navigate('/admin/claims')} className="bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground uppercase">
                  View Claims
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserVerificationAdmin />
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people">
            <PeopleAdmin />
          </TabsContent>

          {/* Knowledge Hub Tab */}
          <TabsContent value="knowledge">
            <KnowledgeHubAdmin />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            {selectedEvent && (
              <form onSubmit={handleSaveEvent} className="space-y-6 bg-background border-2 border-foreground p-6">
                <div>
                  <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Event Title</label>
                  <Input
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                    className="border-2 border-foreground/30 focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Creator</label>
                  <Input
                    value={selectedEvent.creator}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, creator: e.target.value })}
                    className="border-2 border-foreground/30 focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Description</label>
                  <Textarea
                    value={selectedEvent.description}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                    className="min-h-[120px] border-2 border-foreground/30 focus:border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Date</label>
                    <Input
                      value={selectedEvent.date}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                      className="border-2 border-foreground/30 focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Time</label>
                    <Input
                      value={selectedEvent.time}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                      className="border-2 border-foreground/30 focus:border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Address</label>
                  <Input
                    value={selectedEvent.address}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, address: e.target.value })}
                    className="border-2 border-foreground/30 focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Background Image</label>
                  {selectedEvent.background_image_url && (
                    <img 
                      src={selectedEvent.background_image_url} 
                      alt="Current background" 
                      className="w-full h-32 object-cover mb-2 border-2 border-foreground"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="border-2 border-foreground/30"
                  />
                  {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-foreground mb-1 block uppercase">Target Date</label>
                  <Input
                    type="datetime-local"
                    value={selectedEvent.target_date.slice(0, 16)}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, target_date: e.target.value })}
                    className="border-2 border-foreground/30 focus:border-foreground"
                  />
                </div>

                <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground uppercase">
                  Save Changes
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </BrutalistLayout>
  );
};

export default Admin;