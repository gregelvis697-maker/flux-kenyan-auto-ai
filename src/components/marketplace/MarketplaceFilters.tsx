import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MarketplaceFilterValues {
  search: string;
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  fuelType: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'mileage';
}

interface MarketplaceFiltersProps {
  filters: MarketplaceFilterValues;
  onFiltersChange: (filters: MarketplaceFilterValues) => void;
  makes: string[];
  models: string[];
  totalCount: number;
}

export const defaultMarketplaceFilters: MarketplaceFilterValues = {
  search: '',
  make: '',
  model: '',
  minPrice: '',
  maxPrice: '',
  condition: '',
  fuelType: '',
  sortBy: 'newest',
};

export function MarketplaceFilters({
  filters,
  onFiltersChange,
  makes,
  models,
  totalCount,
}: MarketplaceFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

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

  const handleChange = (key: keyof MarketplaceFilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    // Reset model when make changes
    if (key === 'make') {
      newFilters.model = '';
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({ ...defaultMarketplaceFilters, sortBy: filters.sortBy });
  };

  return (
    <div className="space-y-3 mb-6 sm:mb-8">
      {/* Search, Sort, and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, or year..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="pl-9 bg-card/50 h-11 sm:h-12"
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={filters.sortBy} 
            onValueChange={(v) => handleChange('sortBy', v)}
          >
            <SelectTrigger className="w-40 sm:w-48 bg-card/50 h-11 sm:h-12">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="mileage">Lowest Mileage</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 sm:h-12 gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
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
              <Select 
                value={filters.make || "all"} 
                onValueChange={(v) => handleChange('make', v === "all" ? "" : v)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">All Makes</SelectItem>
                  {makes.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.model || "all"} 
                onValueChange={(v) => handleChange('model', v === "all" ? "" : v)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">All Models</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.condition || "all"} 
                onValueChange={(v) => handleChange('condition', v === "all" ? "" : v)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="certified_pre_owned">Certified Pre-Owned</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.fuelType || "all"} 
                onValueChange={(v) => handleChange('fuelType', v === "all" ? "" : v)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Fuel Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">All Fuel Types</SelectItem>
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
                onChange={(e) => handleChange('minPrice', e.target.value)}
                className="bg-background/50"
              />

              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
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

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {totalCount} vehicle{totalCount !== 1 ? 's' : ''} from verified dealers
      </p>
    </div>
  );
}
