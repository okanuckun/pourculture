import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, Wine, MapPin, Grape, Thermometer, UtensilsCrossed, Star, RotateCcw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [wineInfo, setWineInfo] = useState<WineInfo | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64
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

  const handleReset = () => {
    setCapturedImage(null);
    setWineInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      handleReset();
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5 text-primary" />
              Şarap Tarayıcı
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-4 space-y-4">
            {/* Camera Input */}
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
