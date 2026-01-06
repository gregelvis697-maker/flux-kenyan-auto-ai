import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Clock, Car, X, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  photos: string[] | null;
}

interface RecentlyViewedSectionProps {
  recentlyViewedIds: string[];
  onClear: () => void;
  onViewDetails: (vehicle: Vehicle) => void;
}

export function RecentlyViewedSection({ 
  recentlyViewedIds, 
  onClear,
  onViewDetails 
}: RecentlyViewedSectionProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recentlyViewedIds.length > 0) {
      fetchVehicles();
    } else {
      setVehicles([]);
    }
  }, [recentlyViewedIds]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, price, photos')
        .in('id', recentlyViewedIds)
        .eq('is_sold', false);

      if (error) throw error;

      // Sort by the order in recentlyViewedIds
      const sortedVehicles = recentlyViewedIds
        .map(id => data?.find(v => v.id === id))
        .filter(Boolean) as Vehicle[];

      setVehicles(sortedVehicles);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (recentlyViewedIds.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Recently Viewed</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-48 h-32 bg-muted/30 animate-pulse rounded-lg shrink-0" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="p-6 bg-card/30 border-border/30 text-center text-muted-foreground">
          <p className="text-sm">No recently viewed vehicles available</p>
        </Card>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="w-48 shrink-0 overflow-hidden bg-card/50 border-border/30 hover:border-primary/30 cursor-pointer transition-all group"
                onClick={() => onViewDetails(vehicle)}
              >
                <div className="h-24 bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden">
                  {vehicle.photos && vehicle.photos.length > 0 ? (
                    <img
                      src={vehicle.photos[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm text-foreground truncate">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <div className="flex items-center gap-1 text-primary text-sm font-semibold mt-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatPrice(vehicle.price).replace('$', '')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </motion.div>
  );
}
