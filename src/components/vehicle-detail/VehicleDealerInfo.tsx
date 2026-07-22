import { Star, MapPin, ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DealerProfile {
  full_name: string | null;
  whatsapp_number?: string | null;
  address: string | null;
  google_maps_link: string | null;
  rating: number | null;
  review_count: number | null;
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

  return (
    <Card className="bg-card/60 border-border/50">
      <CardContent className="p-5 space-y-4">
        {/* Dealer Name & Rating */}
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

        {/* Seller Location */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Seller Location
          </h4>

          {(() => {
            // SECURITY: Only allow embedding from trusted Google Maps hostnames.
            // Dealer-supplied URLs could otherwise be used for phishing/clickjacking.
            const ALLOWED_HOSTS = new Set([
              'www.google.com',
              'maps.google.com',
              'www.google.co.ke',
              'google.com',
            ]);
            let safeEmbedUrl: string | null = null;
            let safeExternalUrl: string | null = null;
            if (dealer.google_maps_link) {
              try {
                const u = new URL(dealer.google_maps_link);
                if (u.protocol === 'https:' && ALLOWED_HOSTS.has(u.hostname)) {
                  safeExternalUrl = u.toString();
                  if (u.pathname.includes('/maps/embed')) {
                    safeEmbedUrl = u.toString();
                  }
                }
              } catch {
                /* invalid URL — treat as missing */
              }
            }

            if (safeEmbedUrl) {
              return (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border border-border/30">
                    <iframe
                      src={safeEmbedUrl}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      title="Dealer location"
                      className="w-full h-[250px] md:h-[300px]"
                    />
                  </div>
                  {dealer.address && (
                    <p className="text-sm text-muted-foreground">{dealer.address}</p>
                  )}
                  {safeExternalUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => window.open(safeExternalUrl!, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Get Directions
                    </Button>
                  )}
                </div>
              );
            }

            return (
              <div className="text-center py-6 text-muted-foreground text-sm space-y-3">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>{dealer.address || 'Location not provided'}</p>
                {safeExternalUrl && (
                  <a
                    href={safeExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Google Maps
                  </a>
                )}
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
