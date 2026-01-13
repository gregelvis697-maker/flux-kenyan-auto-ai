import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { VehicleCard } from '@/components/marketplace/VehicleCard';
import { VehicleFilters } from '@/components/marketplace/VehicleFilters';
import { VehicleDetailModal } from '@/components/marketplace/VehicleDetailModal';
import { Car, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
}

export interface VehicleFiltersState {
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  fuelType: string;
  sourceType: 'all' | 'dealer_owned' | 'imported';
}

const initialFilters: VehicleFiltersState = {
  make: '',
  model: '',
  minPrice: '',
  maxPrice: '',
  minYear: '',
  maxYear: '',
  fuelType: '',
  sourceType: 'all',
};

export default function Marketplace() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<MarketplaceVehicle[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<VehicleFiltersState>(initialFilters);
  const [selectedVehicle, setSelectedVehicle] = useState<MarketplaceVehicle | null>(null);
  const [dealerNames, setDealerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchVehicles();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
      } else {
        setVehicles(data || []);
        // Fetch dealer names for all vehicles
        const dealerIds = [...new Set((data || []).map(v => v.dealer_id))];
        if (dealerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', dealerIds);
          
          const names: Record<string, string> = {};
          (profiles || []).forEach(p => {
            names[p.id] = p.full_name || p.email || 'Dealer';
          });
          setDealerNames(names);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('vehicle_id')
        .eq('user_id', user.id);

      if (!error && data) {
        setFavorites(new Set(data.map(f => f.vehicle_id)));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleToggleFavorite = async (vehicleId: string) => {
    if (!user) return;

    const isFavorited = favorites.has(vehicleId);

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('vehicle_id', vehicleId);
        
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(vehicleId);
          return next;
        });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, vehicle_id: vehicleId });
        
        setFavorites(prev => new Set([...prev, vehicleId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          vehicle.make.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.year.toString().includes(query);
        if (!matchesSearch) return false;
      }

      // Make filter
      if (filters.make && vehicle.make.toLowerCase() !== filters.make.toLowerCase()) {
        return false;
      }

      // Model filter
      if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
        return false;
      }

      // Price filters
      if (filters.minPrice && vehicle.price < parseInt(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && vehicle.price > parseInt(filters.maxPrice)) {
        return false;
      }

      // Year filters
      if (filters.minYear && vehicle.year < parseInt(filters.minYear)) {
        return false;
      }
      if (filters.maxYear && vehicle.year > parseInt(filters.maxYear)) {
        return false;
      }

      // Fuel type filter
      if (filters.fuelType && vehicle.fuel_type !== filters.fuelType) {
        return false;
      }

      // Source type filter
      if (filters.sourceType === 'dealer_owned' && vehicle.import_request_id) {
        return false;
      }
      if (filters.sourceType === 'imported' && !vehicle.import_request_id) {
        return false;
      }

      return true;
    });
  }, [vehicles, searchQuery, filters]);

  const uniqueMakes = useMemo(() => {
    return [...new Set(vehicles.map(v => v.make))].sort();
  }, [vehicles]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Vehicle Marketplace
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse available vehicles from verified dealers
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by make, model, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/60 border-border/50"
            />
          </div>

          {/* Filters */}
          <VehicleFilters
            filters={filters}
            onFiltersChange={setFilters}
            uniqueMakes={uniqueMakes}
            onReset={() => setFilters(initialFilters)}
          />

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Vehicle Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  dealerName={dealerNames[vehicle.dealer_id] || 'Dealer'}
                  isFavorited={favorites.has(vehicle.id)}
                  isLoggedIn={!!user}
                  onToggleFavorite={() => handleToggleFavorite(vehicle.id)}
                  onViewDetails={() => setSelectedVehicle(vehicle)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Car className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No vehicles found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery || Object.values(filters).some(v => v && v !== 'all')
                  ? 'Try adjusting your search or filters to find more vehicles.'
                  : 'Check back soon for new listings from our verified dealers.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        dealerName={selectedVehicle ? dealerNames[selectedVehicle.dealer_id] || 'Dealer' : ''}
        isFavorited={selectedVehicle ? favorites.has(selectedVehicle.id) : false}
        isLoggedIn={!!user}
        onClose={() => setSelectedVehicle(null)}
        onToggleFavorite={() => selectedVehicle && handleToggleFavorite(selectedVehicle.id)}
      />
    </div>
  );
}
