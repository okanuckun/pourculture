import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader2, Wine, MapPin, Grape, Thermometer, UtensilsCrossed, Star, RotateCcw, Heart, Share2, ImageIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface WineInfo {
  found: boolean;
  error?: string;
  wineName?: string;
  winery?: string;
  region?: string;
  country?: string;
  grapeVariety?: string;
  vintage?: string;
  type?: string;
  terroir?: {
    soil?: string;
    altitude?: string;
    climate?: string;
  };
  tastingNotes?: {
    aroma?: string;
    taste?: string;
    finish?: string;
  };
  foodPairing?: string[];
  servingTemperature?: string;
  agingPotential?: string;
  quickSummary?: string;
  detailedDescription?: string;
  priceRange?: string;
  rating?: number;
}


interface WineScannerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WineScannerSheet: React.FC<WineScannerSheetProps> = ({ open, onOpenChange }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wineInfo, setWineInfo] = useState<WineInfo | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      await analyzeWine(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeWine = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setWineInfo(null);
    setCurrentSavedId(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-wine', {
        body: { imageBase64 }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        setWineInfo({ found: false, error: data.error });
      } else {
        setWineInfo(data);
      }
    } catch (error: any) {
      console.error('Error analyzing wine:', error);
      const status = error?.status || error?.context?.status;
      if (status === 402) {
        toast.error('AI analysis limit reached. Please try again later.');
        setWineInfo({ found: false, error: 'Analysis limit reached. Please try again later.' });
      } else if (status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
        setWineInfo({ found: false, error: 'Too many requests. Please wait a moment and try again.' });
      } else {
        toast.error('Failed to analyze wine. Please try again.');
        setWineInfo({ found: false, error: 'Analysis failed. Please try again.' });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const uploadImage = async (base64: string, userId: string): Promise<string | null> => {
    try {
      const res = await fetch(base64);
      const blob = await res.blob();
      const ext = blob.type.split('/')[1] || 'jpg';
      const fileName = `${userId}/${Date.now()}.${ext}`;
      
      const { error } = await supabase.storage
        .from('wine-images')
        .upload(fileName, blob, { contentType: blob.type, upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('wine-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    }
  };

  const saveToFavorites = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      onOpenChange(false);
      navigate('/auth');
      return;
    }

    if (!wineInfo || !wineInfo.found) return;

    setIsSaving(true);

    try {
      // Upload image to storage
      let imageUrl: string | null = null;
      if (capturedImage) {
        imageUrl = await uploadImage(capturedImage, user.id);
      }

      // Parse rating safely - AI might return string like "85/100" or number
      let parsedRating: number | null = null;
      if (wineInfo.rating != null) {
        const r = typeof wineInfo.rating === 'string' 
          ? parseInt(String(wineInfo.rating).replace(/[^0-9]/g, ''), 10)
          : wineInfo.rating;
        if (!isNaN(r) && r >= 1 && r <= 100) parsedRating = r;
      }

      const { data, error } = await supabase
        .from('wine_scan_history')
        .insert({
          user_id: user.id,
          wine_name: wineInfo.wineName || 'Unknown Wine',
          winery: wineInfo.winery || null,
          region: wineInfo.region || null,
          country: wineInfo.country || null,
          grape_variety: wineInfo.grapeVariety || null,
          vintage: wineInfo.vintage || null,
          wine_type: wineInfo.type || null,
          terroir: wineInfo.terroir || {},
          tasting_notes: wineInfo.tastingNotes || {},
          food_pairing: wineInfo.foodPairing || [],
          serving_temperature: wineInfo.servingTemperature || null,
          aging_potential: wineInfo.agingPotential || null,
          quick_summary: wineInfo.quickSummary || null,
          detailed_description: wineInfo.detailedDescription || null,
          price_range: wineInfo.priceRange || null,
          rating: parsedRating,
          is_favorite: true,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSavedId(data.id);
      toast.success('Wine saved to your journal! 🍷');
    } catch (error: any) {
      console.error('Error saving wine:', error);
      toast.error('Failed to save wine');
    } finally {
      setIsSaving(false);
    }
  };

  const removeFromFavorites = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wine_scan_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (id === currentSavedId) {
        setCurrentSavedId(null);
      }
      
      toast.success('Wine removed from favorites');
    } catch (error: any) {
      console.error('Error removing wine:', error);
      toast.error('Failed to remove wine');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setWineInfo(null);
    setCurrentSavedId(null);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      handleReset();
    }, 300);
  };


  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Wine className="h-5 w-5 text-primary" />
            Wine Scanner
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-4 space-y-4">

            
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Initial State - Show Camera & Gallery Buttons */}
                {!capturedImage && !isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-6">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Camera className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-bold tracking-tight">Scan Wine Label</h3>
                      <p className="text-sm text-muted-foreground max-w-[250px]">
                        Take a photo or upload an existing one — AI will identify it instantly.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <Button onClick={handleCapture} size="lg" className="gap-2 w-full h-12">
                        <Camera className="h-5 w-5" />
                        Open Camera
                      </Button>
                      <Button onClick={handleGallery} size="lg" variant="outline" className="gap-2 w-full h-12">
                        <ImageIcon className="h-5 w-5" />
                        Upload Photo
                      </Button>
                    </div>
                  </div>
                )}

                {/* Captured Image Preview */}
                {capturedImage && (
                  <div className="relative rounded-xl overflow-hidden border border-foreground/10">
                    <img
                      src={capturedImage}
                      alt="Captured photo"
                      className="w-full max-h-64 object-contain bg-muted/30"
                    />
                    {!isAnalyzing && (
                      <Button
                        onClick={handleReset}
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 gap-1 rounded-lg"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retake
                      </Button>
                    )}
                  </div>
                )}

                {/* Analyzing State */}
                {isAnalyzing && (
                  <div className="flex flex-col items-center py-6 space-y-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wine className="h-8 w-8 text-primary" />
                      </div>
                      <Loader2 className="h-6 w-6 text-primary animate-spin absolute -bottom-1 -right-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Analyzing wine...</p>
                      <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                    </div>
                  </div>
                )}

                {/* Wine Info Results */}
                {wineInfo && wineInfo.found && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-bold">{wineInfo.wineName}</h2>
                      {wineInfo.winery && (
                        <p className="text-muted-foreground">{wineInfo.winery}</p>
                      )}
                      <div className="flex flex-wrap justify-center gap-2">
                        {wineInfo.type && (
                          <Badge variant="secondary">{wineInfo.type}</Badge>
                        )}
                        {wineInfo.vintage && (
                          <Badge variant="outline">{wineInfo.vintage}</Badge>
                        )}
                        {wineInfo.rating != null && (
                          <Badge className="gap-1 bg-amber-500">
                            <Star className="h-3 w-3" />
                            {(() => {
                              const r = String(wineInfo.rating).match(/\d+/);
                              return r ? `${r[0]}/100` : '';
                            })()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={currentSavedId ? () => removeFromFavorites(currentSavedId) : saveToFavorites}
                          disabled={isSaving}
                          variant={currentSavedId ? "secondary" : "default"}
                          className="flex-1 gap-2"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart className={`h-4 w-4 ${currentSavedId ? 'fill-current' : ''}`} />
                          )}
                          {currentSavedId ? 'Saved' : 'Save'}
                        </Button>
                        <Button
                          onClick={async () => {
                            const shareText = `🍷 ${wineInfo.wineName}${wineInfo.winery ? ` - ${wineInfo.winery}` : ''}\n${wineInfo.region ? `📍 ${wineInfo.region}, ${wineInfo.country}` : ''}\n${wineInfo.grapeVariety ? `🍇 ${wineInfo.grapeVariety}` : ''}\n${wineInfo.quickSummary ? `\n${wineInfo.quickSummary}` : ''}\n\nDiscovered with PourCulture`;
                            if (navigator.share) {
                              try {
                                await navigator.share({ title: wineInfo.wineName, text: shareText });
                              } catch (e) { /* user cancelled */ }
                            } else {
                              navigator.clipboard.writeText(shareText);
                              toast.success('Copied to clipboard!');
                            }
                          }}
                          variant="outline"
                          className="gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                      {/* Share to Feed */}
                      <Button
                        variant="outline"
                        className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                        onClick={() => {
                          // Build pre-filled URL params for Feed post
                          const params = new URLSearchParams();
                          if (wineInfo.wineName) params.set('wine', wineInfo.wineName);
                          if (wineInfo.winery) params.set('winery', wineInfo.winery);
                          if (wineInfo.type) params.set('type', wineInfo.type.toLowerCase());
                          if (wineInfo.region) params.set('region', wineInfo.region);
                          if (wineInfo.quickSummary) params.set('caption', wineInfo.quickSummary);
                          if (capturedImage) {
                            // Store image temporarily in sessionStorage for Feed to pick up
                            try { sessionStorage.setItem('feed_scan_image', capturedImage); } catch { /* too large */ }
                          }
                          handleClose();
                          navigate(`/feed?from=scan&${params.toString()}`);
                        }}
                      >
                        <Wine className="h-4 w-4" />
                        Post to Feed
                      </Button>
                    </div>

                    {/* Quick Summary */}
                    {wineInfo.quickSummary && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm">{wineInfo.quickSummary}</p>
                      </div>
                    )}

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {wineInfo.region && (
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                          <MapPin className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Region</p>
                            <p className="text-sm font-medium">{wineInfo.region}, {wineInfo.country}</p>
                          </div>
                        </div>
                      )}
                      {wineInfo.grapeVariety && (
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                          <Grape className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Grape</p>
                            <p className="text-sm font-medium">{wineInfo.grapeVariety}</p>
                          </div>
                        </div>
                      )}
                      {wineInfo.servingTemperature && (
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                          <Thermometer className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Serving</p>
                            <p className="text-sm font-medium">{wineInfo.servingTemperature}</p>
                          </div>
                        </div>
                      )}
                      {wineInfo.priceRange && (
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                          <span className="text-primary mt-0.5">€</span>
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="text-sm font-medium">{wineInfo.priceRange}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Terroir */}
                    {wineInfo.terroir && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Terroir
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
                          {wineInfo.terroir.soil && <p><span className="text-muted-foreground">Soil:</span> {wineInfo.terroir.soil}</p>}
                          {wineInfo.terroir.altitude && <p><span className="text-muted-foreground">Altitude:</span> {wineInfo.terroir.altitude}</p>}
                          {wineInfo.terroir.climate && <p><span className="text-muted-foreground">Climate:</span> {wineInfo.terroir.climate}</p>}
                        </div>
                      </div>
                    )}

                    {/* Tasting Notes */}
                    {wineInfo.tastingNotes && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Wine className="h-4 w-4 text-primary" />
                          Tasting Notes
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
                          {wineInfo.tastingNotes.aroma && <p><span className="text-muted-foreground">Aroma:</span> {wineInfo.tastingNotes.aroma}</p>}
                          {wineInfo.tastingNotes.taste && <p><span className="text-muted-foreground">Taste:</span> {wineInfo.tastingNotes.taste}</p>}
                          {wineInfo.tastingNotes.finish && <p><span className="text-muted-foreground">Finish:</span> {wineInfo.tastingNotes.finish}</p>}
                        </div>
                      </div>
                    )}

                    {/* Food Pairing */}
                    {wineInfo.foodPairing && wineInfo.foodPairing.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-primary" />
                          Food Pairing
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {wineInfo.foodPairing.map((food, index) => (
                            <Badge key={index} variant="outline">{food}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed Description */}
                    {wineInfo.detailedDescription && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Detailed Description</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {wineInfo.detailedDescription}
                        </p>
                      </div>
                    )}

                    {/* Aging Potential */}
                    {wineInfo.agingPotential && (
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-sm"><span className="font-medium">Aging Potential:</span> {wineInfo.agingPotential}</p>
                      </div>
                    )}

                    {/* Scan Another */}
                    <Button onClick={handleReset} variant="outline" className="w-full gap-2">
                      <Camera className="h-4 w-4" />
                      Scan Another Wine
                    </Button>
                  </div>
                )}

                {/* Error State */}
                {wineInfo && !wineInfo.found && (
                  <div className="flex flex-col items-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                      <X className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {wineInfo.error || 'Wine could not be identified. Please make sure the label is clearly visible.'}
                    </p>
                    <Button onClick={handleReset} variant="outline" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
