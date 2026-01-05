import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('vehicle_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data.map(f => f.vehicle_id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (vehicleId: string) => {
    if (!user) {
      toast.error('Please log in to save favorites');
      return;
    }

    const isFavorite = favorites.has(vehicleId);

    // Optimistic update
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (isFavorite) {
        newSet.delete(vehicleId);
      } else {
        newSet.add(vehicleId);
      }
      return newSet;
    });

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('vehicle_id', vehicleId);
        
        if (error) throw error;
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, vehicle_id: vehicleId });
        
        if (error) throw error;
        toast.success('Added to favorites');
      }
    } catch (error) {
      // Revert on error
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (isFavorite) {
          newSet.add(vehicleId);
        } else {
          newSet.delete(vehicleId);
        }
        return newSet;
      });
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite: (vehicleId: string) => favorites.has(vehicleId),
    refetch: fetchFavorites,
  };
}
