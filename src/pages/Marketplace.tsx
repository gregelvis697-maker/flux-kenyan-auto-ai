import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Car, Fuel, Settings, DollarSign, Gauge, Palette, Search, Filter, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';
import { PhotoGallery } from '@/components/dealer/PhotoGallery';
import { motion, AnimatePresence } from 'framer-motion';

interface Vehicle {
  id: string;
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
}

export default function Marketplace() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    fuelType: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const makes = useMemo(() => [...new Set(vehicles.map((v) => v.make))].sort(), [vehicles]);
  const models = useMemo(() => {
    if (filters.make) {
      return [...new Set(vehicles.filter((v) => v.make === filters.make).map((v) => v.model))].sort();
    }
    return [...new Set(vehicles.map((v) => v.model))].sort();
  }, [vehicles, filters.make]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        !filters.search ||
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.year.toString().includes(searchLower);
      
      const matchesMake = !filters.make || vehicle.make === filters.make;
      const matchesModel = !filters.model || vehicle.model === filters.model;
      const matchesCondition = !filters.condition || vehicle.condition === filters.condition;
      const matchesFuelType = !filters.fuelType || vehicle.fuel_type === filters.fuelType;
      const matchesMinPrice = !filters.minPrice || vehicle.price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || vehicle.price <= parseFloat(filters.maxPrice);

      return matchesSearch && matchesMake && matchesModel && matchesCondition && matchesFuelType && matchesMinPrice && matchesMaxPrice;
    });
  }, [vehicles, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.condition) count++;
    if (filters.fuelType) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      fuelType: '',
    });
  };

  const openGallery = (photos: string[], startIndex = 0) => {
    setGalleryPhotos(photos);
    setGalleryIndex(startIndex);
    setGalleryOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      used: 'Used',
      certified_pre_owned: 'Certified Pre-Owned',
    };
    return labels[condition] || condition;
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
            Browse {filteredVehicles.length} available vehicles from trusted dealers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by make, model, or year..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 bg-card/50 h-11 sm:h-12"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 sm:h-12 gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-4 bg-card/50 rounded-xl border border-border/50">
                  <Select value={filters.make} onValueChange={(v) => setFilters({ ...filters, make: v, model: '' })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Makes</SelectItem>
                      {makes.map((make) => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.model} onValueChange={(v) => setFilters({ ...filters, model: v })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Models</SelectItem>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.condition} onValueChange={(v) => setFilters({ ...filters, condition: v })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Conditions</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="certified_pre_owned">Certified Pre-Owned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.fuelType} onValueChange={(v) => setFilters({ ...filters, fuelType: v })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Fuel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Fuel Types</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="plug_in_hybrid">Plug-in Hybrid</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="bg-background/50"
                  />

                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="bg-background/50"
                  />
                </div>

                {activeFilterCount > 0 && (
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                      <X className="h-3 w-3 mr-1" />
                      Clear all filters
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <Card className="p-12 bg-card/30 border-border/30 text-center">
            <Car className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-foreground">No vehicles found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeFilterCount > 0 ? 'Try adjusting your filters' : 'Check back later for new listings'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredVehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden bg-card/50 border-border/30 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-300 group">
                  {/* Image */}
                  <div
                    className="h-44 sm:h-52 bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden cursor-pointer"
                    onClick={() => vehicle.photos && vehicle.photos.length > 0 && openGallery(vehicle.photos)}
                  >
                    {vehicle.photos && vehicle.photos.length > 0 ? (
                      <img
                        src={vehicle.photos[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    {vehicle.photos && vehicle.photos.length > 1 && (
                      <Badge className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs">
                        +{vehicle.photos.length - 1} photos
                      </Badge>
                    )}
                    <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 text-xs">
                      {getConditionLabel(vehicle.condition)}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Fuel className="h-3.5 w-3.5" />
                        <span className="capitalize truncate">{vehicle.fuel_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Settings className="h-3.5 w-3.5" />
                        <span className="capitalize truncate">{vehicle.transmission}</span>
                      </div>
                      {vehicle.mileage && (
                        <div className="flex items-center gap-1.5">
                          <Gauge className="h-3.5 w-3.5" />
                          <span>{vehicle.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                      {vehicle.color && (
                        <div className="flex items-center gap-1.5">
                          <Palette className="h-3.5 w-3.5" />
                          <span className="capitalize truncate">{vehicle.color}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <div>
                        <p className="text-xl font-bold text-primary">{formatPrice(vehicle.price)}</p>
                        {vehicle.negotiable && (
                          <p className="text-xs text-muted-foreground">Negotiable</p>
                        )}
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <PhotoGallery
        photos={galleryPhotos}
        initialIndex={galleryIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />
    </div>
  );
}
