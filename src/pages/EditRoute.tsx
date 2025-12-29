import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Loader2, Plus, X, Search, ShieldX, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  slug: string;
}

interface WineRoute {
  id: string;
  title: string;
  description: string | null;
  region: string;
  country: string;
  image_url: string | null;
  difficulty: string;
  estimated_days: number;
  venue_ids: string[];
  created_by: string;
  slug: string;
}

const EditRoute = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<WineRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Venue[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<Venue[]>([]);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    region: '',
    country: '',
    image_url: '',
    difficulty: 'moderate',
    estimated_days: 1,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user && slug) {
      fetchRoute();
    }
  }, [user, slug]);

  const fetchRoute = async () => {
    if (!user) return;
    
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('wine_routes')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error('Route not found');
        navigate('/wine-routes');
        return;
      }

      // Check if user owns this route
      if (data.created_by !== user.id) {
        toast.error('You can only edit your own routes');
        navigate('/wine-routes');
        return;
      }

      setRoute(data as WineRoute);
      setFormData({
        title: data.title,
        description: data.description || '',
        region: data.region,
        country: data.country,
        image_url: data.image_url || '',
        difficulty: data.difficulty || 'moderate',
        estimated_days: data.estimated_days || 1,
      });

      // Fetch venues
      if (data.venue_ids && data.venue_ids.length > 0) {
        const { data: venueData } = await supabase
          .from('venues')
          .select('id, name, city, country, category, slug')
          .in('id', data.venue_ids);

        if (venueData) {
          // Maintain order from venue_ids
          const orderedVenues = data.venue_ids
            .map((id: string) => venueData.find((v) => v.id === id))
            .filter(Boolean) as Venue[];
          setSelectedVenues(orderedVenues);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching route:', error);
      toast.error('Failed to load route');
      navigate('/wine-routes');
    } finally {
      setFetching(false);
    }
  };

  const searchVenues = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, city, country, category, slug')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults((data || []).filter((v) => !selectedVenues.some((s) => s.id === v.id)));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error searching venues:', error);
    } finally {
      setSearching(false);
    }
  };

  const addVenue = (venue: Venue) => {
    setSelectedVenues((prev) => [...prev, venue]);
    setSearchResults((prev) => prev.filter((v) => v.id !== venue.id));
    setSearchQuery('');
  };

  const removeVenue = (venueId: string) => {
    setSelectedVenues((prev) => prev.filter((v) => v.id !== venueId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !route) return;

    if (!formData.title.trim()) {
      toast.error('Please enter a route title');
      return;
    }

    if (!formData.region.trim() || !formData.country.trim()) {
      toast.error('Please enter region and country');
      return;
    }

    if (selectedVenues.length < 2) {
      toast.error('Please add at least 2 venues to the route');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('wine_routes')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          region: formData.region.trim(),
          country: formData.country.trim(),
          image_url: formData.image_url.trim() || null,
          difficulty: formData.difficulty,
          estimated_days: formData.estimated_days,
          venue_ids: selectedVenues.map((v) => v.id),
          venue_count: selectedVenues.length,
        })
        .eq('id', route.id);

      if (error) throw error;

      toast.success('Route updated successfully!');
      navigate(`/wine-routes/${route.slug}`);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error updating route:', error);
      toast.error('Failed to update route');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !route) return;

    setDeleting(true);
    try {
      // Delete user progress and wishlist entries first
      await Promise.all([
        supabase.from('user_route_progress').delete().eq('route_id', route.id),
        supabase.from('user_route_wishlist').delete().eq('route_id', route.id),
      ]);

      // Delete the route
      const { error } = await supabase
        .from('wine_routes')
        .delete()
        .eq('id', route.id);

      if (error) throw error;

      toast.success('Route deleted successfully');
      navigate('/wine-routes');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting route:', error);
      toast.error('Failed to delete route');
    } finally {
      setDeleting(false);
    }
  };

  if (fetching) {
    return (
      <BrutalistLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-foreground" />
        </div>
      </BrutalistLayout>
    );
  }

  if (!route) {
    return (
      <BrutalistLayout
        title="NOT FOUND"
        showBackButton
        backPath="/wine-routes"
        backLabel="Wine Routes"
      >
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-16 text-center">
          <p className="text-muted-foreground">Route not found or you don't have permission to edit it.</p>
        </div>
      </BrutalistLayout>
    );
  }

  return (
    <BrutalistLayout
      title="EDIT ROUTE"
      subtitle="Update your wine journey"
      showBackButton
      backPath={`/wine-routes/${route.slug}`}
      backLabel="Back to Route"
    >
      <SEOHead
        title="Edit Wine Route | PourCulture"
        description="Edit your wine route on PourCulture"
      />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Route Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Burgundy Grand Cru Trail"
                className="border-2 border-foreground/30 focus:border-foreground bg-background"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this wine route..."
                rows={4}
                className="border-2 border-foreground/30 focus:border-foreground bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Region *
                </label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., Burgundy"
                  className="border-2 border-foreground/30 focus:border-foreground bg-background"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Country *
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., France"
                  className="border-2 border-foreground/30 focus:border-foreground bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full h-10 px-3 border-2 border-foreground/30 focus:border-foreground bg-background text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Estimated Days
                </label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.estimated_days}
                  onChange={(e) => setFormData({ ...formData, estimated_days: parseInt(e.target.value) || 1 })}
                  className="border-2 border-foreground/30 focus:border-foreground bg-background"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Cover Image URL
              </label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="border-2 border-foreground/30 focus:border-foreground bg-background"
              />
            </div>
          </div>

          {/* Venues */}
          <div className="border-t-2 border-foreground/20 pt-6">
            <h2 className="text-lg font-bold tracking-tight mb-4">VENUES</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add at least 2 venues to create a route. Order matters.
            </p>

            {/* Selected Venues */}
            {selectedVenues.length > 0 && (
              <div className="space-y-2 mb-4">
                {selectedVenues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 border-2 border-foreground/30 bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground">{index + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{venue.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {venue.city}, {venue.country}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVenue(venue.id)}
                      className="p-1 hover:bg-destructive/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Search Venues */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchVenues(e.target.value);
                  }}
                  placeholder="Search venues to add..."
                  className="pl-10 border-2 border-foreground/30 focus:border-foreground bg-background"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 border-2 border-foreground/30 bg-background max-h-60 overflow-y-auto">
                  {searchResults.map((venue) => (
                    <button
                      key={venue.id}
                      type="button"
                      onClick={() => addVenue(venue)}
                      className="w-full p-3 text-left hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">{venue.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {venue.category.replace('_', ' ')} • {venue.city}, {venue.country}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {searching && (
                <div className="absolute z-10 w-full mt-1 border-2 border-foreground/30 bg-background p-4 text-center">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="border-t-2 border-foreground/20 pt-6 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>

            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-wider border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Route
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this route?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the route
                    and remove all associated progress and wishlist entries.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </div>
    </BrutalistLayout>
  );
};

export default EditRoute;