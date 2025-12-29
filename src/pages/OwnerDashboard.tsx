import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, Wine, Edit, ExternalLink, Plus, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
    
    // Fetch owned venues
    const { data: venuesData } = await supabase
      .from('venues')
      .select('id, name, slug, category, city, country, image_url')
      .eq('owner_id', userId);
    
    // Fetch owned winemakers
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
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const hasListings = venues.length > 0 || winemakers.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Owner Dashboard - Manage Your Listings"
        description="Manage your venue and winemaker profiles"
      />
      <RaisinNavbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your claimed venues and winemaker profiles</p>
        </div>

        {!hasListings ? (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No listings yet</h2>
              <p className="text-muted-foreground mb-6">
                Claim your venue or winemaker profile to start managing it
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/claim-venue">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Claim a Venue
                  </Button>
                </Link>
                <Link to="/submit/winemaker">
                  <Button variant="outline">
                    <Wine className="w-4 h-4 mr-2" />
                    Register as Winemaker
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Venues Section */}
            {venues.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Your Venues</h2>
                  <span className="text-muted-foreground text-sm">({venues.length})</span>
                </div>
                
                <div className="grid gap-4">
                  {venues.map((venue) => (
                    <Card key={venue.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {venue.image_url ? (
                            <img 
                              src={venue.image_url} 
                              alt={venue.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍷</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{venue.name}</h3>
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
                            <Button size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link to={`/venue/${venue.slug}`} target="_blank">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Winemakers Section */}
            {winemakers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Wine className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Your Winemaker Profiles</h2>
                  <span className="text-muted-foreground text-sm">({winemakers.length})</span>
                </div>
                
                <div className="grid gap-4">
                  {winemakers.map((winemaker) => (
                    <Card key={winemaker.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {winemaker.image_url ? (
                            <img 
                              src={winemaker.image_url} 
                              alt={winemaker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍇</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{winemaker.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {winemaker.region && `${winemaker.region}, `}{winemaker.country}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link to={`/dashboard/winemaker/${winemaker.id}/edit`}>
                            <Button size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link to={`/winemaker/${winemaker.slug}`} target="_blank">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
