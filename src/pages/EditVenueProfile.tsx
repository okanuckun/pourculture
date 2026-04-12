import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Plus, X, Clock, Wine, Calendar, Link as LinkIcon, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PhotoUploader } from '@/components/venue';

interface WineItem {
  name: string;
  grape?: string;
  region?: string;
  price?: string;
  description?: string;
}

interface VenueEvent {
  title: string;
  date: string;
  time?: string;
  description?: string;
  price?: string;
  ticket_url?: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
};

const EditVenueProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [venue, setVenue] = useState<any>(null);
  
  // Form state
  const [story, setStory] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [wineList, setWineList] = useState<WineItem[]>([]);
  const [events, setEvents] = useState<VenueEvent[]>([]);
  const [openingHours, setOpeningHours] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const fetchVenue = async () => {
    if (!id) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Access denied",
        description: "You do not have permission to edit this venue.",
        variant: "destructive"
      });
      navigate(-1);
      return;
    }

    setVenue(data);
    setStory(data.story || '');
    setMenuUrl(data.menu_url || '');
    setPhotos(Array.isArray(data.photos) ? (data.photos as unknown as string[]) : []);
    setWineList(Array.isArray(data.wine_list) ? (data.wine_list as unknown as WineItem[]) : []);
    setEvents(Array.isArray(data.events) ? (data.events as unknown as VenueEvent[]) : []);
    setOpeningHours(typeof data.opening_hours === 'object' && data.opening_hours && !Array.isArray(data.opening_hours) ? (data.opening_hours as unknown as Record<string, string>) : {});
    setSocialLinks(typeof data.social_links === 'object' && data.social_links && !Array.isArray(data.social_links) ? (data.social_links as unknown as Record<string, string>) : {});
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from('venues')
      .update({
        story,
        menu_url: menuUrl || null,
        photos: photos as unknown as any,
        wine_list: wineList as unknown as any,
        events: events as unknown as any,
        opening_hours: openingHours as unknown as any,
        social_links: socialLinks as unknown as any,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: "Hata",
        description: "Değişiklikler kaydedilemedi.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Kaydedildi",
        description: "Profil başarıyla güncellendi."
      });
    }
    
    setSaving(false);
  };

  // Photo handling is now done by PhotoUploader component

  const addWine = () => {
    setWineList([...wineList, { name: '', grape: '', region: '', price: '', description: '' }]);
  };

  const updateWine = (index: number, field: keyof WineItem, value: string) => {
    const updated = [...wineList];
    updated[index] = { ...updated[index], [field]: value };
    setWineList(updated);
  };

  const removeWine = (index: number) => {
    setWineList(wineList.filter((_, i) => i !== index));
  };

  const addEvent = () => {
    setEvents([...events, { title: '', date: '', time: '', description: '', price: '' }]);
  };

  const updateEvent = (index: number, field: keyof VenueEvent, value: string) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };
    setEvents(updated);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Edit ${venue?.name || 'Venue'}`}
        description="Edit your venue profile"
      />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-foreground">{venue?.name}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Story */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hikayemiz</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="İşletmenizin hikayesini anlatın..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Fotoğraflar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                photos={photos}
                onPhotosChange={setPhotos}
                folder={`venues/${id}`}
                maxPhotos={10}
              />
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Çalışma Saatleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <Label className="w-24 text-sm font-medium">{DAY_LABELS[day]}</Label>
                    <Input
                      value={openingHours[day] || ''}
                      onChange={(e) => setOpeningHours({ ...openingHours, [day]: e.target.value })}
                      placeholder="örn: 12:00 - 23:00 veya Kapalı"
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wine List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wine className="w-5 h-5" />
                Wine List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wineList.map((wine, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 relative">
                    <button
                      onClick={() => removeWine(index)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Wine Name *</Label>
                        <Input
                          value={wine.name}
                          onChange={(e) => updateWine(index, 'name', e.target.value)}
                          placeholder="Wine name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Üzüm</Label>
                        <Input
                          value={wine.grape || ''}
                          onChange={(e) => updateWine(index, 'grape', e.target.value)}
                          placeholder="Üzüm çeşidi"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Bölge</Label>
                        <Input
                          value={wine.region || ''}
                          onChange={(e) => updateWine(index, 'region', e.target.value)}
                          placeholder="Bölge"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fiyat</Label>
                        <Input
                          value={wine.price || ''}
                          onChange={(e) => updateWine(index, 'price', e.target.value)}
                          placeholder="Fiyat"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs">Açıklama</Label>
                      <Input
                        value={wine.description || ''}
                        onChange={(e) => updateWine(index, 'description', e.target.value)}
                        placeholder="Kısa açıklama"
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={addWine} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Wine
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Etkinlikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 relative">
                    <button
                      onClick={() => removeEvent(index)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Etkinlik Adı *</Label>
                        <Input
                          value={event.title}
                          onChange={(e) => updateEvent(index, 'title', e.target.value)}
                          placeholder="Etkinlik adı"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Tarih *</Label>
                        <Input
                          type="date"
                          value={event.date}
                          onChange={(e) => updateEvent(index, 'date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Saat</Label>
                        <Input
                          value={event.time || ''}
                          onChange={(e) => updateEvent(index, 'time', e.target.value)}
                          placeholder="örn: 19:00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fiyat</Label>
                        <Input
                          value={event.price || ''}
                          onChange={(e) => updateEvent(index, 'price', e.target.value)}
                          placeholder="örn: 45€"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs">Açıklama</Label>
                      <Textarea
                        value={event.description || ''}
                        onChange={(e) => updateEvent(index, 'description', e.target.value)}
                        placeholder="Etkinlik detayları"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={addEvent} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Sosyal Medya & Menü
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label className="text-xs">Menü URL</Label>
                  <Input
                    value={menuUrl}
                    onChange={(e) => setMenuUrl(e.target.value)}
                    placeholder="https://example.com/menu.pdf"
                  />
                </div>
                <div>
                  <Label className="text-xs">Instagram</Label>
                  <Input
                    value={socialLinks.instagram || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <Label className="text-xs">Facebook</Label>
                  <Input
                    value={socialLinks.facebook || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/page"
                  />
                </div>
                <div>
                  <Label className="text-xs">Twitter / X</Label>
                  <Input
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button (bottom) */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditVenueProfile;
