import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Car, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SavedVehicle {
  id: string;
  vehicle_id: string;
  created_at: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    photos: string[] | null;
    is_sold: boolean;
  } | null;
}

export function SavedVehiclesTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedVehicles();
    }
  }, [user]);

  const fetchSavedVehicles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          vehicle_id,
          created_at,
          vehicles (
            id,
            make,
            model,
            year,
            price,
            photos,
            is_sold
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved vehicles:', error);
        setSavedVehicles([]);
      } else {
        // Transform the data to match our interface
        const transformed = (data || []).map((item: any) => ({
          id: item.id,
          vehicle_id: item.vehicle_id,
          created_at: item.created_at,
          vehicle: item.vehicles,
        }));
        setSavedVehicles(transformed);
      }
    } catch (error) {
      console.error('Error:', error);
      setSavedVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId: string) => {
    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      setSavedVehicles(prev => prev.filter(v => v.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Saved Vehicles</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vehicles you've saved from the marketplace
        </p>
      </div>

      {savedVehicles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedVehicles.map((saved) => {
            const vehicle = saved.vehicle;
            if (!vehicle) return null;

            return (
              <Card 
                key={saved.id} 
                className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group overflow-hidden"
              >
                <div className="aspect-video bg-muted/30 relative overflow-hidden">
                  {vehicle.photos && vehicle.photos.length > 0 ? (
                    <img
                      src={vehicle.photos[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}

                  {vehicle.is_sold && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground">SOLD</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-lg font-bold text-primary mt-1">
                    ${vehicle.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved on {new Date(saved.created_at).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => navigate('/marketplace')}
                      disabled={vehicle.is_sold}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(saved.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">No saved vehicles</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Browse the marketplace and save vehicles you're interested in
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/marketplace')}
            >
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
