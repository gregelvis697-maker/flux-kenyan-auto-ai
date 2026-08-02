import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { VehiclePhotoGallery } from '@/components/vehicle-detail/VehiclePhotoGallery';
import { VehicleContactCard } from '@/components/vehicle-detail/VehicleContactCard';
import { VehicleDealerInfo } from '@/components/vehicle-detail/VehicleDealerInfo';
import { VehicleQuickSpecs } from '@/components/vehicle-detail/VehicleQuickSpecs';
import { VehicleOverview } from '@/components/vehicle-detail/VehicleOverview';
import { VehicleFeatures } from '@/components/vehicle-detail/VehicleFeatures';
import { VehicleTechSpecs } from '@/components/vehicle-detail/VehicleTechSpecs';
import { MobileStickyBar } from '@/components/vehicle-detail/MobileStickyBar';
import { RequestAvailabilityModal } from '@/components/marketplace/RequestAvailabilityModal';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Car, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isCallForPrice, getAvailability } from '@/lib/vehicle-display';
import { DealerContactCard } from '@/components/contact/DealerContactCard';
import { getDealerAllLocations, type DealerMapLocation } from '@/services/dealerLocations';

interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string;
  transmission: string | null;
  color: string | null;
  interior_color: string | null;
  condition: string;
  description: string | null;
  engine_capacity: string;
  negotiable: boolean;
  photos: string[] | null;
  dealer_id: string;
  verification_status: string | null;
  body_type: string | null;
  drive_type: string | null;
  seating_capacity: number | null;
  features: string[] | null;
  location: string | null;
  price_on_request: boolean | null;
  availability_status: string | null;
  is_sold: boolean;
}

interface DealerData {
  full_name: string | null;
  address: string | null;
  google_maps_link: string | null;
  whatsapp_number: string | null;
  phone_number: string | null;
  email_public: string | null;
  show_whatsapp: boolean | null;
  show_phone: boolean | null;
  show_email: boolean | null;
  rating: number | null;
  review_count: number | null;
  street_address: string | null;
  city: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
}

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [dealer, setDealer] = useState<DealerData | null>(null);
  const [dealerLocations, setDealerLocations] = useState<DealerMapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchVehicle(id);
  }, [id]);

  const fetchVehicle = async (vehicleId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, price, mileage, fuel_type, transmission, color, interior_color, condition, description, engine_capacity, negotiable, photos, dealer_id, verification_status, body_type, drive_type, seating_capacity, features, location, price_on_request, availability_status, is_sold')
        .eq('id', vehicleId)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setVehicle(data);

      // Fetch dealer public profile (safe fields only, no email/PII)
      const { data: dealerData } = await supabase
        .from('public_dealer_profiles')
        .select('full_name, address, google_maps_link, whatsapp_number, phone_number, email_public, show_whatsapp, show_phone, show_email, rating, review_count, street_address, city, location_latitude, location_longitude')
        .eq('id', data.dealer_id)
        .maybeSingle();

      setDealer(dealerData);

      // Load all map locations (primary + branches)
      try {
        const locs = await getDealerAllLocations(data.dealer_id, dealerData ?? undefined);
        setDealerLocations(locs);
      } catch (err) {
        console.error('Load dealer locations error:', err);
        setDealerLocations([]);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Set page title
  useEffect(() => {
    if (vehicle) {
      document.title = `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale | Flux`;
    }
    return () => { document.title = 'Flux'; };
  }, [vehicle]);

  const handleWhatsAppClick = async () => {
    if (!vehicle) return;
    const callForPrice = isCallForPrice(vehicle);
    const formattedPrice = callForPrice ? '' : ` listed on Flux for KES ${vehicle.price.toLocaleString()}`;
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
    } catch { /* silent */ }

    const message = encodeURIComponent(
      `Hi, I'm interested in your ${vehicle.year} ${vehicle.make} ${vehicle.model}${formattedPrice}. Is it still available?`
    );
    const number = dealer?.whatsapp_number?.replace(/[^0-9]/g, '') || '';
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="aspect-video rounded-lg" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
          <Car className="h-20 w-20 text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-6">This vehicle listing may have been removed or sold.</p>
          <Button asChild>
            <Link to="/marketplace">← Back to Marketplace</Link>
          </Button>
        </main>
      </div>
    );
  }

  const vehicleAlt = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const isSold = getAvailability(vehicle) === 'sold';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </button>

          {/* Sold Banner */}
          {isSold && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">This vehicle has been sold</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Browse similar {vehicle.make} {vehicle.model} listings or request availability from our dealers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setRequestModalOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Request Availability
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('make', vehicle.make);
                    if (vehicle.model) params.set('model', vehicle.model);
                    if (vehicle.body_type) params.set('body', vehicle.body_type.toLowerCase());
                    navigate(`/marketplace?${params.toString()}`);
                  }}
                >
                  Get Similar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column (60%) */}
            <div className="lg:col-span-3 space-y-8">
              <VehiclePhotoGallery
                photos={vehicle.photos || []}
                alt={vehicleAlt}
              />

              {/* Mobile-only: Title & Price */}
              <div className="lg:hidden">
                <VehicleContactCard vehicle={vehicle} dealerWhatsapp={dealer?.whatsapp_number || null} />
              </div>

              {/* Mobile-only: Dealer Info + contact methods */}
              <div className="lg:hidden space-y-6">
                <VehicleDealerInfo dealer={dealer} dealerLocations={dealerLocations} />
                <DealerContactCard
                  dealerName={dealer?.full_name}
                  contact={dealerContact}
                  vehicle={vehicle}
                />
              </div>

              <VehicleQuickSpecs
                fuelType={vehicle.fuel_type}
                engineCapacity={vehicle.engine_capacity}
                transmission={vehicle.transmission}
                driveType={vehicle.drive_type}
              />

              <VehicleOverview description={vehicle.description} />

              <VehicleFeatures features={vehicle.features} />

              <VehicleTechSpecs vehicle={vehicle} />
            </div>

            {/* Right Column (40%) - Desktop Only */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                <VehicleContactCard vehicle={vehicle} dealerWhatsapp={dealer?.whatsapp_number || null} />
                <VehicleDealerInfo dealer={dealer} dealerLocations={dealerLocations} />
                <DealerContactCard
                  dealerName={dealer?.full_name}
                  contact={dealerContact}
                  vehicle={vehicle}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bar */}
      {!isSold && (
        <MobileStickyBar
          price={vehicle.price}
          priceOnRequest={vehicle.price_on_request}
          onWhatsAppClick={handleWhatsAppClick}
        />
      )}

      <RequestAvailabilityModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        prefill={{ make: vehicle.make, model: vehicle.model, year: vehicle.year }}
      />
    </div>
  );
}
