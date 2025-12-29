import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Loader2, Plus, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  slug: string;
}

const CreateRoute = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
      const slug = generateSlug(formData.title);
      
      const { error } = await supabase.from('wine_routes').insert({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        region: formData.region.trim(),
        country: formData.country.trim(),
        image_url: formData.image_url.trim() || null,
        difficulty: formData.difficulty,
        estimated_days: formData.estimated_days,
        venue_ids: selectedVenues.map((v) => v.id),
        venue_count: selectedVenues.length,
        slug,
        created_by: user.id,
        is_curated: false,
        is_published: true,
      });

      if (error) throw error;

      toast.success('Route created successfully!');
      navigate('/wine-routes');
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error creating route:', error);
      if (error.code === '23505') {
        toast.error('A route with this title already exists');
      } else {
        toast.error('Failed to create route');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalistLayout
      title="CREATE ROUTE"
      subtitle="Share your wine journey with the community"
      showBackButton
      backPath="/wine-routes"
      backLabel="Wine Routes"
    >
      <SEOHead
        title="Create Wine Route | PourCulture"
        description="Create and share your own wine route with the PourCulture community"
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
          <div className="border-t-2 border-foreground/20 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Route'
              )}
            </button>
          </div>
        </form>
      </div>
    </BrutalistLayout>
  );
};

export default CreateRoute;
