import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Locate, Search, Store, Loader2, ExternalLink } from 'lucide-react';
import { DistanceUtils, type Coordinates } from '@/utils/distanceUtils';
import { GeocodingService } from '@/services/geocodingService';
import { StoreLocatorMap, type LocatorDealer } from '@/components/maps/StoreLocatorMap';
import { DealerContactCard } from '@/components/contact/DealerContactCard';

interface RawDealer {
  id: string;
  full_name: string | null;
  street_address: string | null;
  city: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  whatsapp_number: string | null;
  phone_number: string | null;
  email_public: string | null;
  show_whatsapp: boolean | null;
  show_phone: boolean | null;
  show_email: boolean | null;
}

const QUICK_DISTANCES = [5, 10, 25, 50];

export default function Stores() {
  const [rawDealers, setRawDealers] = useState<RawDealer[]>([]);
  const [loadingDealers, setLoadingDealers] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [originLabel, setOriginLabel] = useState<string>('');
  const [searchCity, setSearchCity] = useState('');
  const [distanceKm, setDistanceKm] = useState(10);
  const [locating, setLocating] = useState(false);
  const [geocodingCity, setGeocodingCity] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Page title
  useEffect(() => {
    document.title = 'Store Locator — Find Dealers Near You | Flux';
    return () => {
      document.title = 'Flux';
    };
  }, []);

  // Load all public dealer profiles once (small dataset for now).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingDealers(true);
      try {
        const { data, error } = await supabase
          .from('public_dealer_profiles')
          .select('id, full_name, street_address, city, location_latitude, location_longitude, whatsapp_number, phone_number, email_public, show_whatsapp, show_phone, show_email')
          .not('location_latitude', 'is', null)
          .not('location_longitude', 'is', null);
        if (cancelled) return;
        if (error) {
          console.error('Load dealers error:', error);
          setRawDealers([]);
        } else {
          setRawDealers((data as RawDealer[]) || []);
        }
      } finally {
        if (!cancelled) setLoadingDealers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Try user geolocation on mount (silent).
  useEffect(() => {
    DistanceUtils.getUserLocation().then((loc) => {
      if (loc) {
        setUserLocation(loc);
        setOrigin((prev) => prev ?? loc);
        setOriginLabel((prev) => prev || 'Your location');
      }
    });
  }, []);

  const dealers: LocatorDealer[] = useMemo(() => {
    if (!origin) return [];
    return rawDealers
      .map((d) => {
        const distance = DistanceUtils.calculateDistance(origin, {
          latitude: d.location_latitude!,
          longitude: d.location_longitude!,
        });
        return {
          id: d.id,
          full_name: d.full_name,
          street_address: d.street_address,
          city: d.city,
          location_latitude: d.location_latitude!,
          location_longitude: d.location_longitude!,
          distance_km: distance,
          whatsapp_number: d.whatsapp_number,
          phone_number: d.phone_number,
          email_public: d.email_public,
          show_whatsapp: d.show_whatsapp,
          show_phone: d.show_phone,
          show_email: d.show_email,
        };
      })
      .filter((d) => d.distance_km <= distanceKm)
      .sort((a, b) => a.distance_km - b.distance_km);
  }, [rawDealers, origin, distanceKm]);

  const handleUseMyLocation = async () => {
    setLocating(true);
    setError(null);
    const loc = await DistanceUtils.getUserLocation();
    setLocating(false);
    if (!loc) {
      setError('We couldn\u2019t get your location. Please enable location access or search by city.');
      return;
    }
    setUserLocation(loc);
    setOrigin(loc);
    setOriginLabel('Your location');
    setSearchCity('');
  };

  const handleSearchCity = async () => {
    const q = searchCity.trim();
    if (!q) return;
    setGeocodingCity(true);
    setError(null);
    try {
      const res = await GeocodingService.geocodeAddress(q);
      if (!res.success) {
        setError(res.error || 'Couldn\u2019t find that city. Try adding the country or a nearby landmark.');
        return;
      }
      setOrigin({ latitude: res.latitude, longitude: res.longitude });
      setOriginLabel(q);
    } finally {
      setGeocodingCity(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Find Dealers Near You</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search verified Flux dealers within your preferred distance.
          </p>
        </header>

        {/* Search panel */}
        <Card className="bg-card/60 backdrop-blur-lg border-border/50 mb-6">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchCity();
                    }}
                    placeholder="Search a city (e.g. Nairobi, Mombasa)"
                    className="h-11 pl-9"
                  />
                </div>
                <Button
                  onClick={handleSearchCity}
                  disabled={geocodingCity || !searchCity.trim()}
                  className="h-11 gap-2"
                >
                  {geocodingCity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="h-11 gap-2"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
                Use my location
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">Distance</span>
                <span className="text-sm text-muted-foreground">{distanceKm} km</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_DISTANCES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDistanceKm(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      distanceKm === d
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/30 text-muted-foreground border-border/40 hover:border-primary/50'
                    }`}
                  >
                    {d} km
                  </button>
                ))}
              </div>
              <Slider
                value={[distanceKm]}
                min={1}
                max={100}
                step={1}
                onValueChange={(v) => setDistanceKm(v[0])}
                className="pt-1"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {origin ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary">
                  <MapPin className="h-3 w-3" />
                  Searching from: {originLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-2.5 py-1">
                  <MapPin className="h-3 w-3" />
                  Enter a city or share your location to begin.
                </span>
              )}
              {error && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-destructive">
                  {error}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <StoreLocatorMap
              dealers={dealers}
              selectedDealerId={selectedDealerId}
              userLocation={userLocation}
              onDealerSelect={(d) => setSelectedDealerId(d.id)}
            />
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {loadingDealers
                  ? 'Loading dealers…'
                  : origin
                  ? `${dealers.length} dealer${dealers.length === 1 ? '' : 's'} found`
                  : 'Set a search location'}
              </h2>
            </div>

            {loadingDealers && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}

            {!loadingDealers && origin && dealers.length === 0 && (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="p-5 text-center">
                  <Store className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-foreground">
                    No dealers within {distanceKm} km
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try increasing the distance or searching a different city.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {dealers.map((d) => {
                const isSelected = selectedDealerId === d.id;
                return (
                  <div
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDealerId(d.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDealerId(d.id);
                      }
                    }}
                    className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border/40 bg-card/40 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {d.full_name || 'Dealer'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {[d.street_address, d.city].filter(Boolean).join(', ') || 'Address unavailable'}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0 gap-1">
                        <MapPin className="h-3 w-3" />
                        {DistanceUtils.formatDistance(d.distance_km)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        to={`/marketplace?dealer=${d.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View inventory
                      </Link>
                    </div>
                    <DealerContactCard
                      variant="compact"
                      dealerName={d.full_name}
                      contact={{
                        whatsappNumber: d.whatsapp_number,
                        phoneNumber: d.phone_number,
                        emailPublic: d.email_public,
                        showWhatsapp: d.show_whatsapp,
                        showPhone: d.show_phone,
                        showEmail: d.show_email,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
