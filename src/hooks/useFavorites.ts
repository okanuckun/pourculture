import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ResourceType = 'glossary' | 'guide' | 'pdf' | 'harvest_report';

interface Favorite {
  id: string;
  resource_type: ResourceType;
  resource_id: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
      if (session?.user) {
        fetchFavorites(session.user.id);
      } else {
        setFavorites([]);
        setLoading(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      if (session?.user) {
        fetchFavorites(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchFavorites = async (uid: string) => {
    const { data, error } = await supabase
      .from('knowledge_favorites')
      .select('id, resource_type, resource_id')
      .eq('user_id', uid);

    if (!error && data) {
      setFavorites(data as Favorite[]);
    }
    setLoading(false);
  };

  const isFavorite = (resourceType: ResourceType, resourceId: string): boolean => {
    return favorites.some(
      (fav) => fav.resource_type === resourceType && fav.resource_id === resourceId
    );
  };

  const toggleFavorite = async (resourceType: ResourceType, resourceId: string) => {
    if (!userId) {
      toast({
        title: 'Login required',
        description: 'Please sign in to save favorites',
        variant: 'destructive',
      });
      return;
    }

    const existing = favorites.find(
      (fav) => fav.resource_type === resourceType && fav.resource_id === resourceId
    );

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('knowledge_favorites')
        .delete()
        .eq('id', existing.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove from favorites',
          variant: 'destructive',
        });
        return;
      }

      setFavorites(favorites.filter((fav) => fav.id !== existing.id));
      toast({
        title: 'Removed',
        description: 'Removed from favorites',
      });
    } else {
      // Add favorite
      const { data, error } = await supabase
        .from('knowledge_favorites')
        .insert({
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
        })
        .select('id, resource_type, resource_id')
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add to favorites',
          variant: 'destructive',
        });
        return;
      }

      setFavorites([...favorites, data as Favorite]);
      toast({
        title: 'Saved',
        description: 'Added to favorites',
      });
    }
  };

  return {
    favorites,
    userId,
    loading,
    isFavorite,
    toggleFavorite,
  };
};
