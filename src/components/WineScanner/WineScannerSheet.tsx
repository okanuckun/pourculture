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
  isBlend?: boolean;
  blendComposition?: Array<{ grape: string; percentage?: string }>;
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

/**
 * One label-image slot — front or back. Shows a "tap to capture" zone when
 * empty, an inline preview with replace/clear when filled.
 */
const LabelSlot: React.FC<{
  title: string;
  subtitle: string;
  image: string | null;
  onCamera: () => void;
  onGallery: () => void;
  onClear: () => void;
  required?: boolean;
}> = ({ title, subtitle, image, onCamera, onGallery, onClear, required }) => {
  return (
    <div className="rounded-xl border border-foreground/10 bg-card overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{title}</span>
            {required && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Required</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        {image && (
          <Button onClick={onClear} variant="ghost" size="sm" className="h-8 gap-1 text-xs shrink-0">
            <RotateCcw className="h-3.5 w-3.5" />
            Replace
          </Button>
        )}
      </div>
      {image ? (
        <div className="bg-muted/30">
          <img src={image} alt={title} className="w-full max-h-48 object-contain" />
        </div>
      ) : (
        <div className="px-4 pb-4 flex gap-2">
          <Button onClick={onCamera} variant="outline" size="sm" className="flex-1 gap-1.5">
            <Camera className="h-4 w-4" />
            Camera
          </Button>
          <Button onClick={onGallery} variant="outline" size="sm" className="flex-1 gap-1.5">
            <ImageIcon className="h-4 w-4" />
            Gallery
          </Button>
        </div>
      )}
    </div>
  );
};

export const WineScannerSheet: React.FC<WineScannerSheetProps> = ({ open, onOpenChange }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wineInfo, setWineInfo] = useState<WineInfo | null>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  // Two file inputs per slot — camera vs gallery, front vs back.
  const frontCameraRef = useRef<HTMLInputElement>(null);
  const frontGalleryRef = useRef<HTMLInputElement>(null);
  const backCameraRef = useRef<HTMLInputElement>(null);
  const backGalleryRef = useRef<HTMLInputElement>(null);
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


  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSlotChange = (slot: 'front' | 'back') =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const base64 = await readFile(file);
      if (slot === 'front') setFrontImage(base64);
      else setBackImage(base64);
      // Reset the input so picking the same file twice still triggers onChange.
      event.target.value = '';
    };

  const triggerInput = (ref: React.RefObject<HTMLInputElement>) => () => ref.current?.click();

  const analyzeWine = async () => {
    if (!frontImage) {
      toast.error('Please add the front label first.');
      return;
    }

    setIsAnalyzing(true);
    setWineInfo(null);
    setCurrentSavedId(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-wine', {
        body: {
          frontImageBase64: frontImage,
          backImageBase64: backImage || undefined,
        },
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
      // Only the front label is persisted with the saved scan — the back is
      // analysis-time input, not a user-facing artifact.
      if (frontImage) {
        imageUrl = await uploadImage(frontImage, user.id);
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
    setFrontImage(null);
    setBackImage(null);
    setWineInfo(null);
    setCurrentSavedId(null);

    [frontCameraRef, frontGalleryRef, backCameraRef, backGalleryRef].forEach((r) => {
      if (r.current) r.current.value = '';
    });
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

            
                {/* Hidden file inputs — one camera + one gallery per slot */}
                <input ref={frontCameraRef} type="file" accept="image/*" capture="environment" onChange={handleSlotChange('front')} className="hidden" />
                <input ref={frontGalleryRef} type="file" accept="image/*" onChange={handleSlotChange('front')} className="hidden" />
                <input ref={backCameraRef} type="file" accept="image/*" capture="environment" onChange={handleSlotChange('back')} className="hidden" />
                <input ref={backGalleryRef} type="file" accept="image/*" onChange={handleSlotChange('back')} className="hidden" />

                {/* Initial state — header + two label slots */}
                {!wineInfo && !isAnalyzing && (
                  <div className="space-y-4">
                    <div className="text-center space-y-2 pt-2">
                      <h3 className="text-lg font-bold tracking-tight">Scan Wine Label</h3>
                      <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                        Front label is enough — adding the back label gives the AI vintage, alcohol %, and producer notes for a much more accurate read.
                      </p>
                    </div>

                    {/* Front slot — required */}
                    <LabelSlot
                      title="Front Label"
                      subtitle="Required — primary identification"
                      image={frontImage}
                      onCamera={triggerInput(frontCameraRef)}
                      onGallery={triggerInput(frontGalleryRef)}
                      onClear={() => setFrontImage(null)}
                      required
                    />

                    {/* Back slot — optional */}
                    <LabelSlot
                      title="Back Label"
                      subtitle="Optional — vintage, alcohol %, producer notes"
                      image={backImage}
                      onCamera={triggerInput(backCameraRef)}
                      onGallery={triggerInput(backGalleryRef)}
                      onClear={() => setBackImage(null)}
                    />

                    <Button
                      onClick={analyzeWine}
                      size="lg"
                      className="w-full h-12 gap-2"
                      disabled={!frontImage}
                    >
                      <Wine className="h-5 w-5" />
                      Analyze Wine
                    </Button>
                  </div>
                )}

                {/* Analyzing State */}
                {isAnalyzing && (
                  <div className="flex flex-col items-center py-6 space-y-3">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      {/* Spinning orbital ring */}
                      <div 
                        className="absolute inset-0 rounded-full animate-[spin_2s_linear_infinite]"
                        style={{
                          background: 'conic-gradient(from 0deg, transparent 0%, hsl(var(--primary)) 30%, hsl(var(--wine-rose)) 60%, transparent 100%)',
                          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
                          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
                        }}
                      />
                      {/* Second ring, slower, opposite direction */}
                      <div 
                        className="absolute inset-1 rounded-full animate-[spin_3s_linear_infinite_reverse]"
                        style={{
                          background: 'conic-gradient(from 180deg, transparent 0%, hsl(var(--wine-rose) / 0.5) 25%, transparent 50%)',
                          mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
                          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
                        }}
                      />
                      {/* Static center with icon */}
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wine className="h-7 w-7 text-primary" />
                      </div>
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
                          if (frontImage) {
                            // Store the front-label image temporarily in sessionStorage for the Feed
                            // to pick up. The back label, when present, is for analysis only and
                            // isn't published to the feed.
                            try { sessionStorage.setItem('feed_scan_image', frontImage); } catch { /* too large */ }
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
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg col-span-2">
                          <Grape className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs text-muted-foreground">
                                {wineInfo.isBlend ? 'Blend' : 'Grape'}
                              </p>
                              {wineInfo.isBlend && (
                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 uppercase tracking-wide">
                                  Blend
                                </Badge>
                              )}
                            </div>
                            {wineInfo.isBlend && wineInfo.blendComposition && wineInfo.blendComposition.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {wineInfo.blendComposition.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 text-xs font-medium bg-background border border-foreground/10 rounded-md px-2 py-1"
                                  >
                                    <span>{item.grape}</span>
                                    {item.percentage && (
                                      <span className="text-muted-foreground">{item.percentage}</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm font-medium">{wineInfo.grapeVariety}</p>
                            )}
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
