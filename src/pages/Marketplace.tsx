import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { VehicleCard } from '@/components/marketplace/VehicleCard';
import {
  MarketplaceFiltersSidebar,
  MarketplaceFiltersMobile,
  defaultFilters,
  type MarketplaceFiltersState,
} from '@/components/marketplace/MarketplaceFilters';
import { MarketplaceSort, getSortLabel, type SortOption } from '@/components/marketplace/MarketplaceSort';
import { MarketplacePagination } from '@/components/marketplace/MarketplacePagination';
import { Car, Search, ChevronRight, Home, Truck, CarFront, Zap, Bike, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getAvailability } from '@/lib/vehicle-display';
import { RequestAvailabilityModal } from '@/components/marketplace/RequestAvailabilityModal';

export interface MarketplaceVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string;
  transmission: string | null;
  color: string | null;
  condition: string;
  description: string | null;
  engine_capacity: string;
  negotiable: boolean;
  photos: string[] | null;
  dealer_id: string;
  import_request_id: string | null;
  created_at: string;
  verification_status?: string | null;
  body_type?: string | null;
  seating_capacity?: number | null;
  price_on_request?: boolean | null;
  availability_status?: string | null;
  is_sold?: boolean;
}

const ITEMS_PER_PAGE = 20;

export default function Marketplace() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<MarketplaceVehicle[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dealerNames, setDealerNames] = useState<Record<string, string>>({});
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Parse state from URL
  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = (searchParams.get('sort') as SortOption) || 'newest';
  const availability = (searchParams.get('avail') as 'all' | 'available' | 'in_transit' | 'sold') || 'all';

  const [filters, setFilters] = useState<MarketplaceFiltersState>(() => {
    const bodyTypes = searchParams.get('body') ? searchParams.get('body')!.split(',') : [];
    const fuelTypes = searchParams.get('fuel') ? searchParams.get('fuel')!.split(',') : [];
    return {
      ...defaultFilters,
      bodyTypes,
      fuelTypes,
      transmission: searchParams.get('trans') || 'all',
      make: searchParams.get('make') || '',
      model: searchParams.get('model') || '',
      minYear: searchParams.get('minYear') || '',
      maxYear: searchParams.get('maxYear') || '',
      maxMileage: searchParams.get('maxMileage') || '',
      minPrice: parseInt(searchParams.get('minPrice') || '0', 10),
      maxPrice: parseInt(searchParams.get('maxPrice') || '10000000', 10),
    };
  });

  // Sync filters to URL
  const updateSearchParams = useCallback((newFilters: MarketplaceFiltersState, newSort?: SortOption, newPage?: number, newQuery?: string, newAvail?: string) => {
    const params = new URLSearchParams();
    const q = newQuery ?? searchQuery;
    const sort = newSort ?? sortBy;
    const page = newPage ?? 1;
    const avail = newAvail ?? availability;

    if (q) params.set('q', q);
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    if (avail && avail !== 'all') params.set('avail', avail);
    if (newFilters.bodyTypes.length) params.set('body', newFilters.bodyTypes.join(','));
    if (newFilters.fuelTypes.length) params.set('fuel', newFilters.fuelTypes.join(','));
    if (newFilters.transmission !== 'all') params.set('trans', newFilters.transmission);
    if (newFilters.make) params.set('make', newFilters.make);
    if (newFilters.model) params.set('model', newFilters.model);
    if (newFilters.minYear) params.set('minYear', newFilters.minYear);
    if (newFilters.maxYear) params.set('maxYear', newFilters.maxYear);
    if (newFilters.maxMileage) params.set('maxMileage', newFilters.maxMileage);
    if (newFilters.minPrice > 0) params.set('minPrice', String(newFilters.minPrice));
    if (newFilters.maxPrice < 10000000) params.set('maxPrice', String(newFilters.maxPrice));

    setSearchParams(params, { replace: true });
  }, [searchQuery, sortBy, availability, setSearchParams]);

  const handleFiltersChange = useCallback((newFilters: MarketplaceFiltersState) => {
    setFilters(newFilters);
    updateSearchParams(newFilters, undefined, 1);
  }, [updateSearchParams]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleSortChange = useCallback((sort: SortOption) => {
    updateSearchParams(filters, sort, 1);
  }, [filters, updateSearchParams]);

  const handlePageChange = useCallback((page: number) => {
    updateSearchParams(filters, undefined, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateSearchParams]);

  const handleSearchChange = useCallback((q: string) => {
    updateSearchParams(filters, undefined, 1, q);
  }, [filters, updateSearchParams]);

  const handleAvailabilityChange = useCallback((avail: 'all' | 'available' | 'in_transit' | 'sold') => {
    updateSearchParams(filters, undefined, 1, undefined, avail);
  }, [filters, updateSearchParams]);

  const handleQuickMake = useCallback((make: string) => {
    const next = { ...filters, make: filters.make.toLowerCase() === make.toLowerCase() ? '' : make };
    setFilters(next);
    updateSearchParams(next, undefined, 1);
  }, [filters, updateSearchParams]);

  const handleQuickBodyType = useCallback((bt: string) => {
    const lower = bt.toLowerCase();
    const has = filters.bodyTypes.includes(lower);
    const next = {
      ...filters,
      bodyTypes: has ? filters.bodyTypes.filter(b => b !== lower) : [...filters.bodyTypes, lower],
    };
    setFilters(next);
    updateSearchParams(next, undefined, 1);
  }, [filters, updateSearchParams]);

  useEffect(() => {
    fetchVehicles();
    if (user) fetchFavorites();
  }, [user, availability]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(false);
    try {
      const baseSelect = 'id, make, model, year, price, mileage, fuel_type, transmission, color, condition, description, engine_capacity, negotiable, photos, dealer_id, import_request_id, created_at, verification_status, body_type, seating_capacity, price_on_request, availability_status, is_sold';

      let query = supabase
        .from('vehicles')
        .select(baseSelect);

      if (availability === 'sold') {
        // Sold tab: fetch sold units (RLS may return [] for anonymous users — handled in UI)
        query = query.eq('is_sold', true).order('updated_at', { ascending: false }).limit(48);
      } else {
        query = query.eq('is_sold', false).order('created_at', { ascending: false });
      }

      const { data, error: err } = await query;

      if (err) {
        console.error('Error fetching vehicles:', err);
        setError(true);
        setVehicles([]);
      } else {
        setVehicles(data || []);
        const dealerIds = [...new Set((data || []).map(v => v.dealer_id))];
        if (dealerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('public_dealer_profiles')
            .select('id, full_name')
            .in('id', dealerIds);
          const names: Record<string, string> = {};
          (profiles || []).forEach(p => {
            if (p.id) names[p.id] = p.full_name || 'Dealer';
          });
          setDealerNames(names);
        }
      }
    } catch {
      setError(true);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data, error: err } = await supabase
        .from('favorites')
        .select('vehicle_id')
        .eq('user_id', user.id);
      if (!err && data) {
        setFavorites(new Set(data.map(f => f.vehicle_id)));
      }
    } catch {}
  };

  const handleToggleFavorite = async (vehicleId: string) => {
    if (!user) return;
    const isFavorited = favorites.has(vehicleId);
    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      isFavorited ? next.delete(vehicleId) : next.add(vehicleId);
      return next;
    });
    try {
      if (isFavorited) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('vehicle_id', vehicleId);
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, vehicle_id: vehicleId });
      }
    } catch {
      // Revert on error
      setFavorites(prev => {
        const next = new Set(prev);
        isFavorited ? next.add(vehicleId) : next.delete(vehicleId);
        return next;
      });
    }
  };

  // Filter + Sort + Paginate
  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter(vehicle => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = vehicle.make.toLowerCase().includes(q) ||
          vehicle.model.toLowerCase().includes(q) ||
          vehicle.year.toString().includes(q);
        if (!matches) return false;
      }
      if (filters.make && vehicle.make.toLowerCase() !== filters.make.toLowerCase()) return false;
      if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
      if (vehicle.price < filters.minPrice || vehicle.price > filters.maxPrice) return false;
      if (filters.minYear && vehicle.year < parseInt(filters.minYear)) return false;
      if (filters.maxYear && vehicle.year > parseInt(filters.maxYear)) return false;
      if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(vehicle.fuel_type)) return false;
      if (filters.transmission !== 'all' && vehicle.transmission?.toLowerCase() !== filters.transmission.toLowerCase()) return false;
      if (filters.bodyTypes.length > 0 && (!vehicle.body_type || !filters.bodyTypes.includes(vehicle.body_type.toLowerCase()))) return false;
      if (filters.maxMileage && vehicle.mileage && vehicle.mileage > parseInt(filters.maxMileage)) return false;
      // Availability tab filter — uses shared resolver so it honors both is_sold and availability_status
      if (availability !== 'all') {
        const resolved = getAvailability(vehicle);
        if (availability === 'sold' && resolved !== 'sold') return false;
        if (availability === 'in_transit' && resolved !== 'in_transit') return false;
        if (availability === 'available') {
          // "Locally Available" = available only (exclude in_transit/reserved/sold)
          if (resolved !== 'available') return false;
        }
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'mileage_asc': return (a.mileage || 999999) - (b.mileage || 999999);
        case 'year_desc': return b.year - a.year;
        case 'newest':
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [vehicles, searchQuery, filters, sortBy, availability]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVehicles = filteredVehicles.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const uniqueMakes = useMemo(() => [...new Set(vehicles.map(v => v.make))].sort(), [vehicles]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.bodyTypes.length) count++;
    if (filters.fuelTypes.length) count++;
    if (filters.transmission !== 'all') count++;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.minYear || filters.maxYear) count++;
    if (filters.maxMileage) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 10000000) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3 w-3" />
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Marketplace</span>
          </nav>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by make, model, or year..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-card border-border/50 h-11"
              aria-label="Search vehicles"
            />
          </div>

          {/* Availability Tabs */}
          <div className="mb-3 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-card/60 border border-border/50">
              {([
                { key: 'all', label: 'All' },
                { key: 'available', label: 'Locally Available' },
                { key: 'in_transit', label: 'In Transit' },
                { key: 'sold', label: 'Sold Units' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleAvailabilityChange(tab.key)}
                  className={cn(
                    'px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all whitespace-nowrap',
                    availability === tab.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Pills */}
          {uniqueMakes.length > 0 && (
            <div className="mb-3 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 pb-1 min-w-min">
                <button
                  onClick={() => handleQuickMake('')}
                  className={cn(
                    'px-3.5 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition-all',
                    !filters.make
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  All Brands
                </button>
                {uniqueMakes.map(make => {
                  const active = filters.make.toLowerCase() === make.toLowerCase();
                  return (
                    <button
                      key={make}
                      onClick={() => handleQuickMake(make)}
                      className={cn(
                        'px-3.5 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition-all uppercase tracking-wide',
                        active
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                      )}
                    >
                      {make}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Body Type Quick Filters */}
          <div className="mb-5 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 pb-1 min-w-min">
              {[
                { key: 'suv', label: 'SUV', Icon: Car },
                { key: 'sedan', label: 'Sedan', Icon: CarFront },
                { key: 'hatchback', label: 'Hatchback', Icon: Car },
                { key: 'pickup', label: 'Pickup', Icon: Truck },
                { key: 'coupe', label: 'Performance', Icon: Zap },
                { key: 'motorcycle', label: 'Motorcycle', Icon: Bike },
              ].map(({ key, label, Icon }) => {
                const active = filters.bodyTypes.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => handleQuickBodyType(key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-all',
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>


          {/* Mobile Filters */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <MarketplaceFiltersMobile
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              uniqueMakes={uniqueMakes}
              activeFilterCount={activeFilterCount}
            />
            <MarketplaceSort value={sortBy} onChange={handleSortChange} />
          </div>

          {/* Main Layout */}
          <div className="flex gap-6">
            {/* Sidebar */}
            <MarketplaceFiltersSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              uniqueMakes={uniqueMakes}
              activeFilterCount={activeFilterCount}
            />

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Results Header (Desktop) */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {filteredVehicles.length.toLocaleString()} Car{filteredVehicles.length !== 1 ? 's' : ''} Found
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Sorted by: {getSortLabel(sortBy)}
                  </p>
                </div>
                <MarketplaceSort value={sortBy} onChange={handleSortChange} />
              </div>

              {/* Mobile Results Count */}
              <div className="lg:hidden mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredVehicles.length.toLocaleString()} car{filteredVehicles.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-border/50">
                      <Skeleton className="aspect-[16/10] w-full" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <Car className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Failed to load vehicles</h3>
                  <p className="text-muted-foreground mb-4">Something went wrong. Please try again.</p>
                  <Button onClick={fetchVehicles}>Try Again</Button>
                </div>
              ) : paginatedVehicles.length > 0 ? (
                <>
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                    {paginatedVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        dealerName={dealerNames[vehicle.dealer_id] || 'Dealer'}
                        isFavorited={favorites.has(vehicle.id)}
                        isLoggedIn={!!user}
                        onToggleFavorite={() => handleToggleFavorite(vehicle.id)}
                        onViewDetails={() => {}}
                      />
                    ))}
                  </div>
                  <MarketplacePagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : availability === 'sold' ? (
                <div className="rounded-2xl border border-border/60 bg-card/40 p-8 sm:p-12 text-center">
                  <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                    <Car className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Looking for a sold model?
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm sm:text-base">
                    These cars have already found owners. Tell us what you're after and our verified dealers will source it for you — usually within 14 days.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      className="gap-2"
                      onClick={() => setRequestModalOpen(true)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Request Availability
                    </Button>
                    <Button variant="outline" onClick={() => handleAvailabilityChange('all')}>
                      Browse Available
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <Car className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No vehicles found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    {activeFilterCount > 0 || searchQuery
                      ? 'Try adjusting your filters or search criteria.'
                      : 'Check back soon for new listings from verified dealers.'}
                  </p>
                  {(activeFilterCount > 0 || searchQuery) && (
                    <Button variant="outline" onClick={handleResetFilters}>Reset Filters</Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <RequestAvailabilityModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
      />
    </div>
  );
}
