import { Star, MapPin, ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DealerLocationMap } from '@/components/maps/DealerLocationMap';

interface DealerProfile {
  full_name: string | null;
  whatsapp_number?: string | null;
  address: string | null;
  google_maps_link: string | null;
  rating: number | null;
  review_count: number | null;
  street_address?: string | null;
  city?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
}

interface VehicleDealerInfoProps {
  dealer: DealerProfile | null;
}

export function VehicleDealerInfo({ dealer }: VehicleDealerInfoProps) {
  if (!dealer) {
    return (
      <Card className="bg-card/60 border-border/50">
        <CardContent className="p-5 text-center text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Dealer information unavailable
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < full
                ? 'fill-amber-400 text-amber-400'
                : i === full && half
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  const displayAddress =
    [dealer.street_address, dealer.city].filter(Boolean).join(', ') || dealer.address || '';

  const hasCoords =
    typeof dealer.location_latitude === 'number' &&
    typeof dealer.location_longitude === 'number' &&
    !(dealer.location_latitude === 0 && dealer.location_longitude === 0);

  const directionsUrl = hasCoords
    ? `https://www.openstreetmap.org/directions?to=${dealer.location_latitude},${dealer.location_longitude}`
    : null;

  return (
    <Card className="bg-card/60 border-border/50">
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground">
            {dealer.full_name || 'Dealer'}
          </h3>
          {dealer.rating != null ? (
            <div className="flex items-center gap-2 mt-1">
              {renderStars(dealer.rating)}
              <span className="text-sm text-muted-foreground">
                {dealer.rating.toFixed(1)} ({dealer.review_count || 0} reviews)
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">New Dealer — No reviews yet</p>
          )}
        </div>

        <Separator className="bg-border/30" />

        <div>
          <h4 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Seller Location
          </h4>

          <div className="space-y-3">
            <DealerLocationMap
              dealerName={dealer.full_name || 'Dealer'}
              latitude={dealer.location_latitude ?? null}
              longitude={dealer.location_longitude ?? null}
              address={dealer.street_address || dealer.address}
              city={dealer.city}
            />

            {displayAddress && (
              <p className="text-sm text-muted-foreground">{displayAddress}</p>
            )}

            {directionsUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => window.open(directionsUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4" />
                Get Directions
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
