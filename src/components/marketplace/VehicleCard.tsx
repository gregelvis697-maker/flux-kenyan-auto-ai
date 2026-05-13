import { useNavigate } from 'react-router-dom';
import { Car, Heart, Fuel, Gauge, Calendar, Settings, Users, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getAvailability, isCallForPrice, statusStyles, CALL_FOR_PRICE_TOOLTIP } from '@/lib/vehicle-display';
import type { MarketplaceVehicle } from '@/pages/Marketplace';

export interface VehicleWithIntelligence extends MarketplaceVehicle {
  verification_status?: string;
  body_type?: string | null;
  seating_capacity?: number | null;
  price_on_request?: boolean | null;
  availability_status?: string | null;
  is_sold?: boolean;
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
  const navigate = useNavigate();
  const isVerified = vehicle.verification_status === 'verified';
  const availability = getAvailability(vehicle);
  const isSold = availability === 'sold';
  const callForPrice = isCallForPrice(vehicle);
  const status = statusStyles[availability];

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;
  const formatMileage = (mileage: number | null) =>
    !mileage ? 'N/A' : `${mileage.toLocaleString()} km`;
  const formatFuelType = (fuelType: string) =>
    fuelType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  const buildSimilarUrl = () => {
    const params = new URLSearchParams();
    params.set('make', vehicle.make);
    if (vehicle.model) params.set('model', vehicle.model);
    if (vehicle.body_type) params.set('body', vehicle.body_type.toLowerCase());
    return `/marketplace?${params.toString()}`;
  };

  const handleCardClick = () => {
    if (isSold) {
      // For sold cars, default click takes them to similar (Get Similar pattern)
      navigate(buildSimilarUrl());
    } else {
      navigate(`/vehicles/${vehicle.id}`);
    }
  };

  const handleGetSimilar = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(buildSimilarUrl());
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/vehicles/${vehicle.id}`);
  };

  return (
    <Card
      className={cn(
        'bg-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group overflow-hidden cursor-pointer',
        isSold && 'opacity-95'
      )}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="aspect-[16/10] bg-muted/30 relative overflow-hidden">
        {vehicle.photos && vehicle.photos.length > 0 ? (
          <img
            src={vehicle.photos[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className={cn(
              'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
              isSold && 'grayscale-[30%]'
            )}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Verified Badge - Top Left */}
        {isVerified && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-primary/90 text-primary-foreground gap-1 text-[10px] sm:text-xs font-semibold">
              <ShieldCheck className="h-3 w-3" />
              FLUX VERIFIED
            </Badge>
          </div>
        )}

        {/* Prominent Status Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide border shadow-lg',
              status.className
            )}
          >
            {status.label}
          </span>
        </div>

        {/* Photo Count */}
        {vehicle.photos && vehicle.photos.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-background/70 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-md">
              📷 {vehicle.photos.length}
            </span>
          </div>
        )}

        {/* Favorite Button - Bottom Right */}
        {isLoggedIn && (
          <button
            className={cn(
              'absolute bottom-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all',
              isFavorited && 'text-rose-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
          </button>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-base text-foreground line-clamp-1">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>

        {/* Year & Mileage */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{vehicle.year}</span>
          <span>•</span>
          <Gauge className="h-3.5 w-3.5" />
          <span>{formatMileage(vehicle.mileage)}</span>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {vehicle.transmission && (
            <span className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              {vehicle.transmission}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Fuel className="h-3 w-3" />
            {formatFuelType(vehicle.fuel_type)}
          </span>
          {vehicle.seating_capacity && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {vehicle.seating_capacity} Seats
            </span>
          )}
        </div>

        {/* Price or Call for Price */}
        {isSold ? (
          <p className="text-lg font-bold text-rose-500">SOLD</p>
        ) : callForPrice ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="text-lg font-bold text-primary flex items-center gap-1.5 cursor-help underline-offset-4 decoration-dotted hover:underline"
                aria-label="Why is the price hidden?"
              >
                <Phone className="h-4 w-4" />
                Call for Price
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
              {CALL_FOR_PRICE_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        ) : (
          <p className="text-lg font-bold text-primary">
            {formatPrice(vehicle.price)}
            {vehicle.negotiable && (
              <span className="text-xs font-normal text-muted-foreground ml-1">(Negotiable)</span>
            )}
          </p>
        )}

        {/* CTA */}
        {isSold ? (
          <Button
            variant="outline"
            className="w-full gap-2 group/btn border-primary/40 text-primary hover:bg-primary/10"
            onClick={handleGetSimilar}
          >
            Get Similar
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2 group/btn"
            onClick={handleViewDetails}
          >
            View Details
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
