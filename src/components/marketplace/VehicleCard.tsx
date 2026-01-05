import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Fuel, Settings, Gauge, Palette, Heart, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface VehicleCardProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    condition: string;
    fuel_type: string;
    transmission: string | null;
    mileage: number | null;
    color: string | null;
    price: number;
    negotiable: boolean;
    photos: string[] | null;
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewDetails: () => void;
  isLoggedIn: boolean;
}

export function VehicleCard({ 
  vehicle, 
  isFavorite, 
  onToggleFavorite, 
  onViewDetails,
  isLoggedIn 
}: VehicleCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      used: 'Used',
      certified_pre_owned: 'CPO',
    };
    return labels[condition] || condition;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-card/50 border-border/30 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-300 group">
        {/* Image */}
        <div
          className="h-44 sm:h-52 bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden cursor-pointer"
          onClick={onViewDetails}
        >
          {vehicle.photos && vehicle.photos.length > 0 ? (
            <img
              src={vehicle.photos[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          
          {vehicle.photos && vehicle.photos.length > 1 && (
            <Badge className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs">
              +{vehicle.photos.length - 1} photos
            </Badge>
          )}
          
          <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 text-xs">
            {getConditionLabel(vehicle.condition)}
          </Badge>
          
          {/* Favorite Button */}
          {isLoggedIn && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 left-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background ${
                isFavorite ? 'text-red-500' : 'text-muted-foreground'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5" />
              <span className="capitalize truncate">{vehicle.fuel_type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              <span className="capitalize truncate">{vehicle.transmission || 'N/A'}</span>
            </div>
            {vehicle.mileage && (
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                <span>{vehicle.mileage.toLocaleString()} km</span>
              </div>
            )}
            {vehicle.color && (
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span className="capitalize truncate">{vehicle.color}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div>
              <p className="text-xl font-bold text-primary">{formatPrice(vehicle.price)}</p>
              {vehicle.negotiable && (
                <p className="text-xs text-muted-foreground">Negotiable</p>
              )}
            </div>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={onViewDetails}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
