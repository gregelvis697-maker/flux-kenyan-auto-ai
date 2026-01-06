import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Heart, Loader2, ChevronLeft, ChevronRight, GitCompare } from 'lucide-react';
import { VehicleCard } from '@/components/marketplace/VehicleCard';
import { VehicleDetailsModal } from '@/components/marketplace/VehicleDetailsModal';
import { MarketplaceFilters, MarketplaceFilterValues, defaultMarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { ContactRequestForm } from '@/components/marketplace/ContactRequestForm';
import { VehicleComparisonModal } from '@/components/marketplace/VehicleComparisonModal';
import { RecentlyViewedSection } from '@/components/marketplace/RecentlyViewedSection';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useVehicleComparison } from '@/hooks/useVehicleComparison';

interface Vehicle {
  id: string;
  dealer_id: string;
  make: string;
  model: string;
  year: number;
  condition: string;
  fuel_type: string;
  engine_capacity: string;
  mileage: number | null;
  color: string | null;
  transmission: string | null;
  description: string | null;
  price: number;
  negotiable: boolean;
  photos: string[] | null;
  created_at: string;
}

interface VehicleWithDealer extends Vehicle {
  dealer_name?: string;
  dealer_email?: string;
}

const ITEMS_PER_PAGE = 12;

export default function Marketplace() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleWithDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDealer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilterValues>(defaultMarketplaceFilters);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { compareList, addToCompare, removeFromCompare, clearCompare, isInCompare, canAddMore } = useVehicleComparison();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles with verified dealers (dealers/importers with approved status)
      const { data: verifiedDealers, error: dealersError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['dealer', 'importer'])
        .eq('status', 'approved');

      if (dealersError) throw dealersError;

      const verifiedDealerIds = verifiedDealers?.map(d => d.user_id) || [];

      if (verifiedDealerIds.length === 0) {
        setVehicles([]);
        return;
      }

      // Fetch vehicles from verified dealers only
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_sold', false)
        .in('dealer_id', verifiedDealerIds)
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      // Fetch dealer profiles for contact info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', verifiedDealerIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const vehiclesWithDealers: VehicleWithDealer[] = (vehiclesData || []).map(v => ({
        ...v,
        dealer_name: profilesMap.get(v.dealer_id)?.full_name || 'Dealer',
        dealer_email: profilesMap.get(v.dealer_id)?.email,
      }));

      setVehicles(vehiclesWithDealers);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique makes and models for filters
  const makes = useMemo(() => [...new Set(vehicles.map(v => v.make))].sort(), [vehicles]);
  const models = useMemo(() => {
    if (filters.make) {
      return [...new Set(vehicles.filter(v => v.make === filters.make).map(v => v.model))].sort();
    }
    return [...new Set(vehicles.map(v => v.model))].sort();
  }, [vehicles, filters.make]);

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    // Apply tab filter
    if (activeTab === 'favorites') {
      result = result.filter(v => favorites.has(v.id));
    }

    // Apply search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(v =>
        v.make.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower) ||
        v.year.toString().includes(searchLower)
      );
    }

    // Apply filters
    if (filters.make) {
      result = result.filter(v => v.make === filters.make);
    }
    if (filters.model) {
      result = result.filter(v => v.model === filters.model);
    }
    if (filters.condition) {
      result = result.filter(v => v.condition === filters.condition);
    }
    if (filters.fuelType) {
      result = result.filter(v => v.fuel_type === filters.fuelType);
    }
    if (filters.minPrice) {
      result = result.filter(v => v.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(v => v.price <= parseFloat(filters.maxPrice));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'mileage':
        result = [...result].sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        break;
      case 'newest':
      default:
        result = [...result].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [vehicles, filters, activeTab, favorites]);

  // Get vehicles for comparison
  const vehiclesForComparison = useMemo(() => {
    return vehicles.filter(v => compareList.includes(v.id));
  }, [vehicles, compareList]);

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeTab]);

  const handleViewDetails = (vehicle: VehicleWithDealer) => {
    setSelectedVehicle(vehicle);
    setDetailsOpen(true);
    addToRecentlyViewed(vehicle.id);
  };

  const handleRequestContact = () => {
    setDetailsOpen(false);
    setContactFormOpen(true);
  };

  const handleRecentlyViewedClick = (vehicle: { id: string; make: string; model: string; year: number; price: number; photos: string[] | null }) => {
    const fullVehicle = vehicles.find(v => v.id === vehicle.id);
    if (fullVehicle) {
      handleViewDetails(fullVehicle);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Vehicle Marketplace
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Browse vehicles from verified dealers and importers
          </p>
        </div>

        {/* Recently Viewed Section */}
        <RecentlyViewedSection
          recentlyViewedIds={recentlyViewed}
          onClear={clearRecentlyViewed}
          onViewDetails={handleRecentlyViewedClick}
        />

        {/* Tabs and Compare Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          {user && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'favorites')}>
              <TabsList className="bg-card/50">
                <TabsTrigger value="all" className="gap-2">
                  <Car className="h-4 w-4" />
                  All Vehicles
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Favorites ({favorites.size})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          {compareList.length > 0 && (
            <Button 
              onClick={() => setComparisonOpen(true)}
              className="gap-2"
              variant="outline"
            >
              <GitCompare className="h-4 w-4" />
              Compare
              <Badge variant="secondary" className="ml-1">
                {compareList.length}
              </Badge>
            </Button>
          )}
        </div>

        {/* Filters */}
        <MarketplaceFilters
          filters={filters}
          onFiltersChange={setFilters}
          makes={makes}
          models={models}
          totalCount={filteredVehicles.length}
        />

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paginatedVehicles.length === 0 ? (
          <Card className="p-12 bg-card/30 border-border/30 text-center">
            {activeTab === 'favorites' ? (
              <>
                <Heart className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-foreground">No favorites yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the heart icon on vehicles to save them here
                </p>
              </>
            ) : (
              <>
                <Car className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-foreground">No vehicles found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or check back later
                </p>
              </>
            )}
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isFavorite={isFavorite(vehicle.id)}
                  onToggleFavorite={() => toggleFavorite(vehicle.id)}
                  onViewDetails={() => handleViewDetails(vehicle)}
                  isLoggedIn={!!user}
                  isInCompare={isInCompare(vehicle.id)}
                  onToggleCompare={() => addToCompare(vehicle.id)}
                  canAddToCompare={canAddMore}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-10"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <VehicleDetailsModal
        vehicle={selectedVehicle}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onRequestContact={handleRequestContact}
      />

      <ContactRequestForm
        open={contactFormOpen}
        onOpenChange={setContactFormOpen}
        vehicle={selectedVehicle}
      />

      <VehicleComparisonModal
        open={comparisonOpen}
        onOpenChange={setComparisonOpen}
        vehicles={vehiclesForComparison}
        onRemove={removeFromCompare}
      />
    </div>
  );
}
