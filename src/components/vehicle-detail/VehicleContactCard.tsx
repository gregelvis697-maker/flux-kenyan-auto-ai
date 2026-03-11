import { BadgeCheck, MessageCircle, MapPin, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface VehicleContactCardProps {
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    price: number;
    mileage: number | null;
    location: string | null;
    negotiable: boolean;
    verification_status: string | null;
    dealer_id: string;
  };
  dealerWhatsapp: string | null;
}

export function VehicleContactCard({ vehicle, dealerWhatsapp }: VehicleContactCardProps) {
  const { user } = useAuth();
  const isVerified = vehicle.verification_status === 'verified';

  const formattedPrice = `KES ${vehicle.price.toLocaleString()}`;

  const handleWhatsAppClick = async () => {
    // Log inquiry silently
    try {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        await supabase.from('contact_requests').insert({
          vehicle_id: vehicle.id,
          buyer_id: user.id,
          buyer_name: profile?.full_name || 'Unknown',
          buyer_email: profile?.email || user.email || '',
          message: `WhatsApp inquiry for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        });
      }
    } catch {
      // Silent fail
    }

    const message = encodeURIComponent(
      `Hi, I'm interested in your ${vehicle.year} ${vehicle.make} ${vehicle.model} listed on Flux for ${formattedPrice}. Is it still available?`
    );
    const number = dealerWhatsapp?.replace(/[^0-9]/g, '') || '';
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
          {vehicle.mileage && (
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {vehicle.mileage.toLocaleString()} km
            </span>
          )}
          {vehicle.mileage && vehicle.location && <span>•</span>}
          {vehicle.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {vehicle.location}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-3xl font-bold text-primary">{formattedPrice}</p>
        {vehicle.negotiable && (
          <p className="text-sm text-muted-foreground mt-0.5">Negotiable</p>
        )}
      </div>

      {/* Verified Badge */}
      {isVerified && (
        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 text-sm py-1 px-3">
          <BadgeCheck className="h-4 w-4" />
          FLUX VERIFIED
        </Badge>
      )}

      {/* WhatsApp Button */}
      <Button
        className="w-full h-12 text-base font-semibold gap-2"
        style={{ backgroundColor: '#25D366', color: 'white' }}
        onClick={handleWhatsAppClick}
      >
        <MessageCircle className="h-5 w-5" />
        Contact on WhatsApp
      </Button>
    </div>
  );
}
