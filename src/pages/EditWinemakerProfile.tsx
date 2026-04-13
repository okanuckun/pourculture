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
import { ArrowLeft, Save, Plus, X, Camera, Wine, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PhotoUploader } from '@/components/venue';

interface WineItem {
  name: string;
  grape?: string;
  region?: string;
  year?: string;
  description?: string;
}

const EditWinemakerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [winemaker, setWinemaker] = useState<any>(null);
  
  // Form state
  const [story, setStory] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [wineList, setWineList] = useState<WineItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWinemaker();
  }, [id]);

  const fetchWinemaker = async () => {
    if (!id) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('winemakers')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Access denied",
        description: "You do not have permission to edit this profile.",
        variant: "destructive"
      });
      navigate(-1);
      return;
    }

    setWinemaker(data);
    setStory(data.story || '');
    setPhotos(Array.isArray(data.photos) ? (data.photos as unknown as string[]) : []);
    setWineList(Array.isArray(data.wine_list) ? (data.wine_list as unknown as WineItem[]) : []);
    setSocialLinks(typeof data.social_links === 'object' && data.social_links && !Array.isArray(data.social_links) ? (data.social_links as unknown as Record<string, string>) : {});
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from('winemakers')
      .update({
        story,
        photos: photos as unknown as any,
        wine_list: wineList as unknown as any,
        social_links: socialLinks as unknown as any,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Changes could not be saved.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Saved",
        description: "Profile updated successfully."
      });
    }
    
    setSaving(false);
  };

  // Photo handling is now done by PhotoUploader component

  const addWine = () => {
    setWineList([...wineList, { name: '', grape: '', region: '', year: '', description: '' }]);
  };

  const updateWine = (index: number, field: keyof WineItem, value: string) => {
    const updated = [...wineList];
    updated[index] = { ...updated[index], [field]: value };
    setWineList(updated);
  };

  const removeWine = (index: number) => {
    setWineList(wineList.filter((_, i) => i !== index));
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
        title={`Edit ${winemaker?.name || 'Winemaker'}`}
        description="Edit your winemaker profile"
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
            <h1 className="text-2xl font-bold text-foreground">{winemaker?.name}</h1>
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
              <CardTitle className="text-lg">Our Story</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Tell the story of your winemaking journey..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                photos={photos}
                onPhotosChange={setPhotos}
                folder={`winemakers/${id}`}
                maxPhotos={10}
              />
            </CardContent>
          </Card>

          {/* Wine List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wine className="w-5 h-5" />
                Our Wines
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
                        <Label className="text-xs">Grape</Label>
                        <Input
                          value={wine.grape || ''}
                          onChange={(e) => updateWine(index, 'grape', e.target.value)}
                          placeholder="Grape variety"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Region</Label>
                        <Input
                          value={wine.region || ''}
                          onChange={(e) => updateWine(index, 'region', e.target.value)}
                          placeholder="Region"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Year</Label>
                        <Input
                          value={wine.year || ''}
                          onChange={(e) => updateWine(index, 'year', e.target.value)}
                          placeholder="e.g. 2021"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={wine.description || ''}
                        onChange={(e) => updateWine(index, 'description', e.target.value)}
                        placeholder="Tasting notes"
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

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
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

export default EditWinemakerProfile;
