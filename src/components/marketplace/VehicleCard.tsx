import { Car, Heart, Fuel, Gauge, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MarketplaceVehicle } from '@/pages/Marketplace';
import { 
  getPricePosition,
  getPriceDifferencePercent,
  getDemandLevel,
  calculateConfidenceScore
} from '@/hooks/useMarketIntelligence';
import { PricePositionBadge, DemandBadge, VerifiedBadge, ConfidenceScoreBadge } from './IntelligenceBadges';

// Extended vehicle type with optional intelligence data
export interface VehicleWithIntelligence extends MarketplaceVehicle {
  verification_status?: string;
  // Pre-fetched intelligence data (optional)
  pricing_avg?: number | null;
  demand_ratio?: number | null;
  fulfillment_rate?: number | null;
  risk_score?: number | null;
}

interface VehicleCardProps {
  vehicle: VehicleWithIntelligence;
  dealerName: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
  onToggleFavorite: () => void;
  onViewDetails: () => void;
}

export function VehicleCard({
  vehicle,
  dealerName,
  isFavorited,
  isLoggedIn,
  onToggleFavorite,
  onViewDetails,
}: VehicleCardProps) {
  const isImported = !!vehicle.import_request_id;
  const isVerified = vehicle.verification_status === 'verified';
  
  // Use pre-fetched data if available, otherwise calculate with defaults
  const pricePosition = getPricePosition(vehicle.price, vehicle.pricing_avg);
  const priceDiff = getPriceDifferencePercent(vehicle.price, vehicle.pricing_avg);
  const demandLevel = getDemandLevel(vehicle.demand_ratio);
  
  // Calculate confidence score with available data
  const confidenceScore = calculateConfidenceScore({
    price: vehicle.price,
    avgPrice: vehicle.pricing_avg,
    demandRatio: vehicle.demand_ratio,
    fulfillmentRate: vehicle.fulfillment_rate,
    riskFlags: undefined, // Skip risk flags for card view to keep it simple
    isVerified,
  });

  const formatPrice = (price: number, negotiable: boolean) => {
    if (negotiable) {
      return `$${price.toLocaleString()} (Negotiable)`;
    }
    return `$${price.toLocaleString()}`;
  };

  const formatMileage = (mileage: number | null) => {
    if (!mileage) return 'N/A';
    return `${mileage.toLocaleString()} km`;
  };

  const formatFuelType = (fuelType: string) => {
    return fuelType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group overflow-hidden">
      {/* Image Section */}
      <div className="aspect-[16/10] bg-muted/30 relative overflow-hidden">
        {vehicle.photos && vehicle.photos.length > 0 ? (
          <img
            src={vehicle.photos[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Confidence Score Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <ConfidenceScoreBadge score={confidenceScore} />
        </div>

        {/* Source Badge & Intelligence Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[60%]">
          <Badge
            variant="secondary"
            className={cn(
              isImported 
                ? "bg-primary/90 text-primary-foreground" 
                : "bg-secondary/90 text-secondary-foreground"
            )}
          >
            {isImported ? 'Imported via Flux' : 'Dealer-Owned'}
          </Badge>
          <VerifiedBadge isVerified={isVerified} />
          <PricePositionBadge position={pricePosition} percentDiff={priceDiff} />
          <DemandBadge level={demandLevel} />
        </div>

        {/* Favorite Button - Bottom Right */}
        {isLoggedIn && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90",
              isFavorited && "text-rose-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
          </Button>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title & Price */}
          <div>
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-xl font-bold text-primary mt-1">
              {formatPrice(vehicle.price, vehicle.negotiable)}
            </p>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4" />
              <span>{formatMileage(vehicle.mileage)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4" />
              <span>{formatFuelType(vehicle.fuel_type)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{vehicle.transmission || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Car className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{dealerName}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
