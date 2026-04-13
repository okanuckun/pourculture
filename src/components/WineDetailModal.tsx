import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Wine, Grape, MapPin, Calendar, Thermometer, Clock, UtensilsCrossed, Star, Heart, StickyNote, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WineDetail {
  id: string;
  wine_name: string;
  winery: string | null;
  region: string | null;
  country: string | null;
  grape_variety: string | null;
  wine_type: string | null;
  vintage: string | null;
  image_url: string | null;
  quick_summary: string | null;
  detailed_description: string | null;
  serving_temperature: string | null;
  aging_potential: string | null;
  food_pairing: string[] | null;
  rating: number | null;
  is_favorite?: boolean;
  user_notes?: string | null;
  tasting_notes: {
    aroma?: string[];
    palate?: string[];
    finish?: string;
  } | null;
  created_at: string;
}

interface WineDetailModalProps {
  wine: WineDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwnProfile?: boolean;
  onUpdate?: (updatedWine: Partial<WineDetail> & { id: string }) => void;
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({ wine, open, onOpenChange, isOwnProfile = false, onUpdate }) => {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  if (!wine) return null;

  const tastingNotes = wine.tasting_notes as WineDetail['tasting_notes'];

  const handleToggleFavorite = async () => {
    setTogglingFav(true);
    try {
      const newVal = !wine.is_favorite;
      const { error } = await supabase
        .from('wine_scan_history')
        .update({ is_favorite: newVal })
        .eq('id', wine.id);
      if (error) throw error;
      onUpdate?.({ id: wine.id, is_favorite: newVal });
      toast.success(newVal ? 'Added to favorites ❤️' : 'Removed from favorites');
    } catch {
      toast.error('Failed to update');
    } finally {
      setTogglingFav(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('wine_scan_history')
        .update({ user_notes: notesValue.trim() || null })
        .eq('id', wine.id);
      if (error) throw error;
      onUpdate?.({ id: wine.id, user_notes: notesValue.trim() || null });
      setEditingNotes(false);
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const startEditingNotes = () => {
    setNotesValue(wine.user_notes || '');
    setEditingNotes(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setEditingNotes(false); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto border-2 border-foreground/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-6">{wine.wine_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wine Image */}
          {wine.image_url ? (
            <div className="aspect-video bg-muted overflow-hidden border-2 border-foreground/20">
              <img loading="lazy" 
                src={wine.image_url} 
                alt={wine.wine_name} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30 flex items-center justify-center border-2 border-foreground/20">
              <Wine className="w-16 h-16 text-rose-400" />
            </div>
          )}

          {/* Own profile actions */}
          {isOwnProfile && (
            <div className="flex gap-2">
              <Button
                onClick={handleToggleFavorite}
                disabled={togglingFav}
                variant={wine.is_favorite ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5"
              >
                <Heart className={`w-4 h-4 ${wine.is_favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                {wine.is_favorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button
                onClick={startEditingNotes}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <StickyNote className="w-4 h-4" />
                {wine.user_notes ? 'Edit Note' : 'Add Note'}
              </Button>
            </div>
          )}

          {/* Notes editing */}
          {editingNotes && isOwnProfile && (
            <div className="space-y-2">
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add your tasting notes, occasion, who you shared it with..."
                rows={3}
                className="border-2 border-foreground/30 focus:border-foreground bg-background text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveNotes} disabled={savingNotes} size="sm" className="gap-1">
                  {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save
                </Button>
                <Button onClick={() => setEditingNotes(false)} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Display notes (visible to everyone) */}
          {!editingNotes && wine.user_notes && (
            <div className="border-2 border-foreground/20 p-3">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <StickyNote className="w-3 h-3" />
                Personal Notes
              </h4>
              <p className="text-sm">{wine.user_notes}</p>
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            {wine.winery && (
              <div className="flex items-center gap-2 text-sm">
                <Wine className="w-4 h-4 text-muted-foreground" />
                <span>{wine.winery}</span>
              </div>
            )}
            {wine.grape_variety && (
              <div className="flex items-center gap-2 text-sm">
                <Grape className="w-4 h-4 text-muted-foreground" />
                <span>{wine.grape_variety}</span>
              </div>
            )}
            {(wine.region || wine.country) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{wine.region}{wine.region && wine.country ? ', ' : ''}{wine.country}</span>
              </div>
            )}
            {wine.vintage && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{wine.vintage}</span>
              </div>
            )}
            {wine.serving_temperature && (
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="w-4 h-4 text-muted-foreground" />
                <span>{wine.serving_temperature}</span>
              </div>
            )}
            {wine.aging_potential && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{wine.aging_potential}</span>
              </div>
            )}
          </div>

          {/* Wine Type Badge */}
          {wine.wine_type && (
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
                {wine.wine_type}
              </span>
              {wine.rating && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/20">
                  <Star className="w-3 h-3 fill-current" />
                  {wine.rating}/5
                </span>
              )}
            </div>
          )}

          {/* Quick Summary */}
          {wine.quick_summary && (
            <div className="border-2 border-foreground/20 p-3">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Summary</h4>
              <p className="text-sm">{wine.quick_summary}</p>
            </div>
          )}

          {/* Detailed Description */}
          {wine.detailed_description && (
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{wine.detailed_description}</p>
            </div>
          )}

          {/* Tasting Notes */}
          {tastingNotes && (
            <div className="border-2 border-foreground/20 p-3 space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">Tasting Notes</h4>
              {tastingNotes.aroma && (
                <div>
                  <span className="text-xs font-medium">Aroma: </span>
                  <span className="text-xs text-muted-foreground">
                    {Array.isArray(tastingNotes.aroma) ? tastingNotes.aroma.join(', ') : String(tastingNotes.aroma)}
                  </span>
                </div>
              )}
              {tastingNotes.palate && (
                <div>
                  <span className="text-xs font-medium">Palate: </span>
                  <span className="text-xs text-muted-foreground">
                    {Array.isArray(tastingNotes.palate) ? tastingNotes.palate.join(', ') : String(tastingNotes.palate)}
                  </span>
                </div>
              )}
              {tastingNotes.finish && (
                <div>
                  <span className="text-xs font-medium">Finish: </span>
                  <span className="text-xs text-muted-foreground">{tastingNotes.finish}</span>
                </div>
              )}
            </div>
          )}

          {/* Food Pairing */}
          {wine.food_pairing && wine.food_pairing.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">Food Pairing</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wine.food_pairing.map((food, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-0.5 bg-muted text-xs"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scan Date */}
          <div className="text-[10px] text-muted-foreground pt-2 border-t border-foreground/10">
            Scanned: {new Date(wine.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
