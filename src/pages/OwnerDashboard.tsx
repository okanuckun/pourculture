import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, Wine, Edit, ExternalLink, Plus, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface OwnedVenue {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  country: string;
  image_url: string | null;
}

interface OwnedWinemaker {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  country: string;
  image_url: string | null;
}

const OwnerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [venues, setVenues] = useState<OwnedVenue[]>([]);
  const [winemakers, setWinemakers] = useState<OwnedWinemaker[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
      await fetchOwnedListings(user.id);
    };
    
    checkAuth();
  }, [navigate]);

  const fetchOwnedListings = async (userId: string) => {
    setLoading(true);
    
    const { data: venuesData } = await supabase
      .from('venues')
      .select('id, name, slug, category, city, country, image_url')
      .eq('owner_id', userId);
    
    const { data: winemakersData } = await supabase
      .from('winemakers')
      .select('id, name, slug, region, country, image_url')
      .eq('owner_id', userId);
    
    setVenues(venuesData || []);
    setWinemakers(winemakersData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <BrutalistLayout>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </BrutalistLayout>
    );
  }

  const hasListings = venues.length > 0 || winemakers.length > 0;

  return (
    <BrutalistLayout
      title="OWNER DASHBOARD"
      subtitle="Manage your claimed venues and winemaker profiles"
    >
      <SEOHead 
        title="Owner Dashboard | PourCulture"
        description="Manage your venue and winemaker profiles"
      />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {!hasListings ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 border-2 border-foreground/20"
          >
            <div className="w-16 h-16 mx-auto border-2 border-foreground/20 flex items-center justify-center mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">NO LISTINGS YET</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Claim your venue or winemaker profile to start managing it
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/claim-venue">
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="w-4 h-4 mr-2" />
                  CLAIM A VENUE
                </Button>
              </Link>
              <Link to="/submit/winemaker">
                <Button variant="outline" className="border-2 border-foreground hover:bg-foreground hover:text-background">
                  <Wine className="w-4 h-4 mr-2" />
                  REGISTER AS WINEMAKER
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Venues Section */}
            {venues.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-5 h-5" />
                  <h2 className="text-lg font-bold tracking-tight">YOUR VENUES</h2>
                  <span className="text-muted-foreground text-sm">({venues.length})</span>
                </div>
                
                <div className="space-y-4">
                  {venues.map((venue, index) => (
                    <motion.div 
                      key={venue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-2 border-foreground/20 hover:border-foreground transition-colors"
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-20 h-20 border border-foreground/20 overflow-hidden flex-shrink-0">
                          {venue.image_url ? (
                            <img 
                              src={venue.image_url} 
                              alt={venue.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-muted">🍷</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate">{venue.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {venue.category.replace('_', ' ')}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {venue.city}, {venue.country}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link to={`/dashboard/venue/${venue.id}/edit`}>
                            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                              <Edit className="w-4 h-4 mr-1" />
                              EDIT
                            </Button>
                          </Link>
                          <Link to={`/venue/${venue.slug}`} target="_blank">
                            <Button size="sm" variant="outline" className="border-2 border-foreground/20 hover:border-foreground">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Winemakers Section */}
            {winemakers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Wine className="w-5 h-5" />
                  <h2 className="text-lg font-bold tracking-tight">YOUR WINEMAKER PROFILES</h2>
                  <span className="text-muted-foreground text-sm">({winemakers.length})</span>
                </div>
                
                <div className="space-y-4">
                  {winemakers.map((winemaker, index) => (
                    <motion.div 
                      key={winemaker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-2 border-foreground/20 hover:border-foreground transition-colors"
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-20 h-20 border border-foreground/20 overflow-hidden flex-shrink-0">
                          {winemaker.image_url ? (
                            <img 
                              src={winemaker.image_url} 
                              alt={winemaker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-muted">🍇</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate">{winemaker.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {winemaker.region && `${winemaker.region}, `}{winemaker.country}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link to={`/dashboard/winemaker/${winemaker.id}/edit`}>
                            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                              <Edit className="w-4 h-4 mr-1" />
                              EDIT
                            </Button>
                          </Link>
                          <Link to={`/winemaker/${winemaker.slug}`} target="_blank">
                            <Button size="sm" variant="outline" className="border-2 border-foreground/20 hover:border-foreground">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default OwnerDashboard;
