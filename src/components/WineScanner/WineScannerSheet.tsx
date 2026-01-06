import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader2, Wine, MapPin, Grape, Thermometer, UtensilsCrossed, Star, RotateCcw, Heart, History, Share2 } from 'lucide-react';
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

interface SavedWine {
  id: string;
  wine_name: string;
  winery: string | null;
  region: string | null;
  country: string | null;
  wine_type: string | null;
  vintage: string | null;
  is_favorite: boolean;
  created_at: string;
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
  const [savedWines, setSavedWines] = useState<SavedWine[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (user && showHistory) {
      fetchSavedWines();
    }
  }, [user, showHistory]);

  const fetchSavedWines = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('wine_scan_history')
      .select('id, wine_name, winery, region, country, wine_type, vintage, is_favorite, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved wines:', error);
      return;
    }

    setSavedWines(data || []);
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
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
      toast.error('Şarap analiz edilemedi. Lütfen tekrar deneyin.');
      setWineInfo({ found: false, error: 'Analiz başarısız oldu' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToFavorites = async () => {
    if (!user) {
      toast.error('Favorilere kaydetmek için giriş yapmalısınız');
      onOpenChange(false);
      navigate('/auth');
      return;
    }

    if (!wineInfo || !wineInfo.found) return;

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('wine_scan_history')
        .insert({
          user_id: user.id,
          wine_name: wineInfo.wineName || 'Bilinmeyen Şarap',
          winery: wineInfo.winery,
          region: wineInfo.region,
          country: wineInfo.country,
          grape_variety: wineInfo.grapeVariety,
          vintage: wineInfo.vintage,
          wine_type: wineInfo.type,
          terroir: wineInfo.terroir || {},
          tasting_notes: wineInfo.tastingNotes || {},
          food_pairing: wineInfo.foodPairing || [],
          serving_temperature: wineInfo.servingTemperature,
          aging_potential: wineInfo.agingPotential,
          quick_summary: wineInfo.quickSummary,
          detailed_description: wineInfo.detailedDescription,
          price_range: wineInfo.priceRange,
          rating: wineInfo.rating,
          is_favorite: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSavedId(data.id);
      toast.success('Şarap favorilere kaydedildi! 🍷');
    } catch (error: any) {
      console.error('Error saving wine:', error);
      toast.error('Şarap kaydedilemedi');
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
      setSavedWines(prev => prev.filter(w => w.id !== id));
      toast.success('Şarap favorilerden kaldırıldı');
    } catch (error: any) {
      console.error('Error removing wine:', error);
      toast.error('Şarap kaldırılamadı');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setWineInfo(null);
    setCurrentSavedId(null);
    setShowHistory(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      handleReset();
    }, 300);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5 text-primary" />
              {showHistory ? 'Tarama Geçmişi' : 'Şarap Tarayıcı'}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {user && !showHistory && (
                <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)}>
                  <History className="h-5 w-5" />
                </Button>
              )}
              {showHistory && (
                <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                  <Camera className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-4 space-y-4">
            {/* History View */}
            {showHistory && (
              <div className="space-y-4">
                {savedWines.length === 0 ? (
                  <div className="flex flex-col items-center py-12 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <Wine className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-center">
                      Henüz kayıtlı şarap yok.<br />Şarap tarayarak başlayın!
                    </p>
                    <Button onClick={() => setShowHistory(false)} className="gap-2">
                      <Camera className="h-4 w-4" />
                      Şarap Tara
                    </Button>
                  </div>
                ) : (
                  savedWines.map((wine) => (
                    <div key={wine.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wine className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{wine.wine_name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {[wine.winery, wine.region, wine.country].filter(Boolean).join(' • ')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {wine.wine_type && (
                            <Badge variant="secondary" className="text-xs">{wine.wine_type}</Badge>
                          )}
                          {wine.vintage && (
                            <Badge variant="outline" className="text-xs">{wine.vintage}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(wine.created_at)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeFromFavorites(wine.id)}
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Camera Input */}
            {!showHistory && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Initial State - Show Camera Button */}
                {!capturedImage && !isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wine className="h-16 w-16 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-center">Şarap Şişesini Tara</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                      Şarap şişesinin etiketini fotoğraflayın ve AI anında bilgilerini size sunsun.
                    </p>
                    <Button onClick={handleCapture} size="lg" className="gap-2">
                      <Camera className="h-5 w-5" />
                      Fotoğraf Çek
                    </Button>
                  </div>
                )}

                {/* Captured Image Preview */}
                {capturedImage && (
                  <div className="relative">
                    <img 
                      src={capturedImage} 
                      alt="Çekilen fotoğraf" 
                      className="w-full max-h-48 object-contain rounded-lg"
                    />
                    {!isAnalyzing && (
                      <Button
                        onClick={handleReset}
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 gap-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Yeniden Çek
                      </Button>
                    )}
                  </div>
                )}

                {/* Analyzing State */}
                {isAnalyzing && (
                  <div className="flex flex-col items-center py-8 space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Şarap analiz ediliyor...</p>
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
                        {wineInfo.rating && (
                          <Badge className="gap-1 bg-amber-500">
                            <Star className="h-3 w-3" />
                            {wineInfo.rating}/100
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
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
                        {currentSavedId ? 'Kaldır' : 'Kaydet'}
                      </Button>
                      <Button
                        onClick={async () => {
                          const shareText = `🍷 ${wineInfo.wineName}${wineInfo.winery ? ` - ${wineInfo.winery}` : ''}\n${wineInfo.region ? `📍 ${wineInfo.region}, ${wineInfo.country}` : ''}\n${wineInfo.grapeVariety ? `🍇 ${wineInfo.grapeVariety}` : ''}\n${wineInfo.quickSummary ? `\n${wineInfo.quickSummary}` : ''}\n\nPour Culture ile keşfedildi`;
                          if (navigator.share) {
                            try {
                              await navigator.share({ title: wineInfo.wineName, text: shareText });
                            } catch (e) { /* user cancelled */ }
                          } else {
                            navigator.clipboard.writeText(shareText);
                            toast.success('Panoya kopyalandı!');
                          }
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Paylaş
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
                            <p className="text-xs text-muted-foreground">Bölge</p>
                            <p className="text-sm font-medium">{wineInfo.region}, {wineInfo.country}</p>
                          </div>
                        </div>
                      )}
                      {wineInfo.grapeVariety && (
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                          <Grape className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Üzüm</p>
                            <p className="text-sm font-medium">{wineInfo.grapeVariety}</p>
                          </div>
                        </div>
                      )}
                      {wineInfo.servingTemperature && (
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                          <Thermometer className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Servis</p>
                            <p className="text-sm font-medium">{wineInfo.servingTemperature}</p>
                          </div>
                        </div>
                      )}
                      {wineInfo.priceRange && (
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                          <span className="text-primary mt-0.5">€</span>
                          <div>
                            <p className="text-xs text-muted-foreground">Fiyat</p>
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
                          {wineInfo.terroir.soil && <p><span className="text-muted-foreground">Toprak:</span> {wineInfo.terroir.soil}</p>}
                          {wineInfo.terroir.altitude && <p><span className="text-muted-foreground">Yükseklik:</span> {wineInfo.terroir.altitude}</p>}
                          {wineInfo.terroir.climate && <p><span className="text-muted-foreground">İklim:</span> {wineInfo.terroir.climate}</p>}
                        </div>
                      </div>
                    )}

                    {/* Tasting Notes */}
                    {wineInfo.tastingNotes && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Wine className="h-4 w-4 text-primary" />
                          Tadım Notları
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
                          {wineInfo.tastingNotes.aroma && <p><span className="text-muted-foreground">Aroma:</span> {wineInfo.tastingNotes.aroma}</p>}
                          {wineInfo.tastingNotes.taste && <p><span className="text-muted-foreground">Tat:</span> {wineInfo.tastingNotes.taste}</p>}
                          {wineInfo.tastingNotes.finish && <p><span className="text-muted-foreground">Bitiş:</span> {wineInfo.tastingNotes.finish}</p>}
                        </div>
                      </div>
                    )}

                    {/* Food Pairing */}
                    {wineInfo.foodPairing && wineInfo.foodPairing.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-primary" />
                          Yemek Eşleştirme
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
                        <h4 className="font-semibold">Detaylı Açıklama</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {wineInfo.detailedDescription}
                        </p>
                      </div>
                    )}

                    {/* Aging Potential */}
                    {wineInfo.agingPotential && (
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-sm"><span className="font-medium">Yaşlanma Potansiyeli:</span> {wineInfo.agingPotential}</p>
                      </div>
                    )}

                    {/* Scan Another */}
                    <Button onClick={handleReset} variant="outline" className="w-full gap-2">
                      <Camera className="h-4 w-4" />
                      Başka Bir Şarap Tara
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
                      {wineInfo.error || 'Şarap tanınamadı. Lütfen etiketin net göründüğünden emin olun.'}
                    </p>
                    <Button onClick={handleReset} variant="outline" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Tekrar Dene
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
