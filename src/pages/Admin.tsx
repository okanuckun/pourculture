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
import { Plus, Pencil, Trash2, Wine, Calendar, Loader2, Upload, X, Book } from 'lucide-react';
import { KnowledgeHubAdmin } from '@/components/admin/KnowledgeHubAdmin';

// Input validation schema for events
const eventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  creator: z.string().trim().min(1, 'Creator is required').max(100),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  date: z.string().trim().min(1, 'Date is required').max(50),
  time: z.string().trim().min(1, 'Time is required').max(50),
  address: z.string().trim().min(1, 'Address is required').max(300),
  target_date: z.string().refine((val) => !isNaN(new Date(val).getTime()), 'Invalid date format'),
});

// Input validation schema for wines
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
  
  // Wine state
  const [wines, setWines] = useState<WineItem[]>([]);
  const [selectedWine, setSelectedWine] = useState<WineItem | null>(null);
  const [isCreatingWine, setIsCreatingWine] = useState(false);
  const [newWine, setNewWine] = useState<Omit<WineItem, 'id'>>(emptyWine);
  const [savingWine, setSavingWine] = useState(false);
  const [uploadingWineImage, setUploadingWineImage] = useState(false);
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

    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (error || !roles) {
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

  // Wine handlers
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
      toast({ title: 'Geçersiz dosya tipi', description: 'JPG, PNG, GIF veya WebP yükleyin', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Dosya çok büyük', description: 'Görsel 5MB\'dan küçük olmalı', variant: 'destructive' });
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
      toast({ title: 'Başarılı', description: 'Görsel yüklendi' });
    } catch (error: any) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingWineImage(false);
    }
  };

  const colorLabels: Record<string, string> = { red: 'Kırmızı', white: 'Beyaz', orange: 'Orange', rose: 'Rosé' };
  const styleLabels: Record<string, string> = { funky: 'Funky', clean: 'Temiz' };
  const acidityLabels: Record<string, string> = { acidic: 'Asidik', soft: 'Yumuşak' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground">
        {isNew ? 'Yeni Şarap Ekle' : 'Şarap Düzenle'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">İsim *</label>
          <Input
            value={wine.name}
            onChange={(e) => setWine({ ...wine, name: e.target.value })}
            placeholder="Şarap adı"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Üzüm *</label>
          <Input
            value={wine.grape}
            onChange={(e) => setWine({ ...wine, grape: e.target.value })}
            placeholder="Üzüm çeşidi"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Bölge *</label>
          <Input
            value={wine.region}
            onChange={(e) => setWine({ ...wine, region: e.target.value })}
            placeholder="Bölge"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Ülke *</label>
          <Input
            value={wine.country}
            onChange={(e) => setWine({ ...wine, country: e.target.value })}
            placeholder="Ülke"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Üretici</label>
          <Input
            value={wine.winemaker || ''}
            onChange={(e) => setWine({ ...wine, winemaker: e.target.value })}
            placeholder="Üretici adı"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Fiyat Aralığı</label>
          <Select
            value={wine.price_range || ''}
            onValueChange={(value) => setWine({ ...wine, price_range: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçin" />
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

      {/* Image Upload */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Görsel</label>
        {wine.image_url ? (
          <div className="relative inline-block">
            <img
              src={wine.image_url}
              alt="Wine"
              className="w-full max-w-xs h-40 object-cover rounded-xl border border-border"
            />
            <button
              type="button"
              onClick={() => setWine({ ...wine, image_url: '' })}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
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
              className="cursor-pointer"
            />
            {uploadingWineImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Açıklama</label>
        <Textarea
          value={wine.description || ''}
          onChange={(e) => setWine({ ...wine, description: e.target.value })}
          placeholder="Şarap hakkında açıklama"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Renk *</label>
          <Select
            value={wine.color}
            onValueChange={(value) => setWine({ ...wine, color: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="red">🍷 Kırmızı</SelectItem>
              <SelectItem value="white">🥂 Beyaz</SelectItem>
              <SelectItem value="orange">🧡 Orange</SelectItem>
              <SelectItem value="rose">🌸 Rosé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Stil *</label>
          <Select
            value={wine.style}
            onValueChange={(value) => setWine({ ...wine, style: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="funky">🎸 Funky</SelectItem>
              <SelectItem value="clean">✨ Temiz</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Asitlik *</label>
          <Select
            value={wine.acidity}
            onValueChange={(value) => setWine({ ...wine, acidity: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acidic">🍋 Asidik</SelectItem>
              <SelectItem value="soft">🍑 Yumuşak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Alkol %</label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="25"
            value={wine.alcohol_percentage || ''}
            onChange={(e) => setWine({ ...wine, alcohol_percentage: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="12.5"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Yıl</label>
          <Input
            type="number"
            min="1900"
            max="2100"
            value={wine.year || ''}
            onChange={(e) => setWine({ ...wine, year: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="2022"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wine.is_featured}
              onChange={(e) => setWine({ ...wine, is_featured: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Öne çıkan</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          İptal
        </Button>
        <Button onClick={onSave} disabled={savingWine} className="flex-1">
          {savingWine ? <Loader2 className="h-4 w-4 animate-spin" /> : isNew ? 'Oluştur' : 'Kaydet'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <SEOHead 
        title="Admin Dashboard"
        description="Manage events and content for your event platform"
      />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Admin Panel
          </h1>
          <Button onClick={handleSignOut} variant="outline">
            Çıkış Yap
          </Button>
        </div>

        <Tabs defaultValue="wines" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="wines" className="flex items-center gap-2">
              <Wine className="h-4 w-4" />
              Şaraplar
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Bilgi Merkezi
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Etkinlikler
            </TabsTrigger>
          </TabsList>

          {/* Wines Tab */}
          <TabsContent value="wines" className="space-y-6">
            {!isCreatingWine && !selectedWine && (
              <Button onClick={() => setIsCreatingWine(true)} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Şarap Ekle
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
                  <div className="text-center py-12 text-muted-foreground">
                    Henüz şarap eklenmemiş
                  </div>
                ) : (
                  wines.map((wine) => (
                    <div
                      key={wine.id}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {wine.color === 'red' ? '🍷' : wine.color === 'white' ? '🥂' : wine.color === 'orange' ? '🧡' : '🌸'}
                          </span>
                          <h4 className="font-semibold text-foreground truncate">{wine.name}</h4>
                          {wine.is_featured && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Öne Çıkan</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {wine.grape} • {wine.region}, {wine.country}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-secondary text-xs rounded-full text-muted-foreground">
                            {colorLabels[wine.color]}
                          </span>
                          <span className="px-2 py-0.5 bg-secondary text-xs rounded-full text-muted-foreground">
                            {styleLabels[wine.style]}
                          </span>
                          <span className="px-2 py-0.5 bg-secondary text-xs rounded-full text-muted-foreground">
                            {acidityLabels[wine.acidity]}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setSelectedWine(wine)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDeleteWine(wine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Knowledge Hub Tab */}
          <TabsContent value="knowledge">
            <KnowledgeHubAdmin />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            {selectedEvent && (
              <form onSubmit={handleSaveEvent} className="space-y-6 bg-card border border-border rounded-2xl p-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Event Title</label>
                  <Input
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Creator</label>
                  <Input
                    value={selectedEvent.creator}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, creator: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                  <Textarea
                    value={selectedEvent.description}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
                    <Input
                      value={selectedEvent.date}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Time</label>
                    <Input
                      value={selectedEvent.time}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Address</label>
                  <Input
                    value={selectedEvent.address}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Background Image</label>
                  {selectedEvent.background_image_url && (
                    <img 
                      src={selectedEvent.background_image_url} 
                      alt="Current background" 
                      className="w-full h-32 object-cover mb-2 rounded-xl"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Target Date</label>
                  <Input
                    type="datetime-local"
                    value={selectedEvent.target_date.slice(0, 16)}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, target_date: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
