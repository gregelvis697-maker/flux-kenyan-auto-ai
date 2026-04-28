import { Heart, Car, Fuel, Gauge, Calendar, Palette, Settings, User, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { MarketplaceVehicle } from '@/pages/Marketplace';
import { MarketInsightsPanel } from './MarketInsightsPanel';
import { VerifiedBadge } from './IntelligenceBadges';
import { isCallForPrice, getAvailability, statusStyles } from '@/lib/vehicle-display';

interface VehicleDetailModalProps {
  vehicle: (MarketplaceVehicle & { verification_status?: string }) | null;
  dealerName: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
}

export function VehicleDetailModal({
  vehicle,
  dealerName,
  isFavorited,
  isLoggedIn,
  onClose,
  onToggleFavorite,
}: VehicleDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!vehicle) return null;

  const isImported = !!vehicle.import_request_id;
  const isVerified = vehicle.verification_status === 'verified';
  const photos = vehicle.photos || [];
  const callForPrice = isCallForPrice(vehicle);
  const availability = getAvailability(vehicle);
  const status = statusStyles[availability];

  const formatPrice = (price: number, negotiable: boolean) => {
    if (negotiable) {
      return `KES ${price.toLocaleString()} (Negotiable)`;
    }
    return `KES ${price.toLocaleString()}`;
  };

  const formatMileage = (mileage: number | null) => {
    if (!mileage) return 'Not specified';
    return `${mileage.toLocaleString()} km`;
  };

  const formatFuelType = (fuelType: string) => {
    return fuelType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: vehicle.year.toString() },
    { icon: Gauge, label: 'Mileage', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Fuel Type', value: formatFuelType(vehicle.fuel_type) },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission || 'Not specified' },
    { icon: Palette, label: 'Color', value: vehicle.color || 'Not specified' },
    { icon: Car, label: 'Engine', value: vehicle.engine_capacity },
  ];

  return (
    <Dialog open={!!vehicle} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
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
                <Badge variant="outline">
                  {formatCondition(vehicle.condition)}
                </Badge>
                <VerifiedBadge isVerified={isVerified} size="md" />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {photos.length > 0 ? (
                <img
                  src={photos[activeImageIndex]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
            
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors",
                      index === activeImageIndex 
                        ? "border-primary" 
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(vehicle.price, vehicle.negotiable)}
              </p>
            </div>
            {isLoggedIn && (
              <Button
                variant={isFavorited ? "default" : "outline"}
                className="gap-2"
                onClick={onToggleFavorite}
              >
                <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
                {isFavorited ? 'Saved' : 'Save Vehicle'}
              </Button>
            )}
          </div>

          <Separator />

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {vehicle.description}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Market Insights Section */}
          <MarketInsightsPanel
            vehicleId={vehicle.id}
            make={vehicle.make}
            model={vehicle.model}
            year={vehicle.year}
            price={vehicle.price}
            dealerId={vehicle.dealer_id}
            verificationStatus={vehicle.verification_status}
          />

          <Separator />

          {/* Dealer Info */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Dealer Information</h3>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{dealerName}</p>
                <p className="text-sm text-muted-foreground">
                  Contact through the marketplace to inquire about this vehicle
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
