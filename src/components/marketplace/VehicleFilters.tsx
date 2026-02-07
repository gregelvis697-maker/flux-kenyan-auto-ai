import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import type { VehicleFiltersState } from '@/pages/Marketplace';

interface VehicleFiltersProps {
  filters: VehicleFiltersState;
  onFiltersChange: (filters: VehicleFiltersState) => void;
  uniqueMakes: string[];
  onReset: () => void;
}

export function VehicleFilters({
  filters,
  onFiltersChange,
  uniqueMakes,
  onReset,
}: VehicleFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof VehicleFiltersState>(
    key: K,
    value: VehicleFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all'
  ).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2 h-11 sm:h-10 text-base sm:text-sm">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </CollapsibleTrigger>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 h-11 sm:h-10 text-base sm:text-sm">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <div className="bg-card/60 backdrop-blur-lg border border-border/50 rounded-lg p-4 mb-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Make Filter */}
            <div className="space-y-2">
              <Label htmlFor="make" className="text-sm">Make</Label>
              <Select
                value={filters.make || 'all'}
                onValueChange={(value) => updateFilter('make', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="make" className="bg-background h-11 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder="All makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-base sm:text-sm py-2.5 sm:py-2">All makes</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make} className="text-base sm:text-sm py-2.5 sm:py-2">
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Filter */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm">Model</Label>
              <Input
                id="model"
                placeholder="Enter model"
                value={filters.model}
                onChange={(e) => updateFilter('model', e.target.value)}
                className="bg-background h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-sm">Price Range</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  inputMode="numeric"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="bg-background h-11 sm:h-10 text-base sm:text-sm"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  inputMode="numeric"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="bg-background h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
              <Label className="text-sm">Year Range</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="From"
                  type="number"
                  inputMode="numeric"
                  value={filters.minYear}
                  onChange={(e) => updateFilter('minYear', e.target.value)}
                  className="bg-background h-11 sm:h-10 text-base sm:text-sm"
                />
                <Input
                  placeholder="To"
                  type="number"
                  inputMode="numeric"
                  value={filters.maxYear}
                  onChange={(e) => updateFilter('maxYear', e.target.value)}
                  className="bg-background h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <Label htmlFor="fuelType" className="text-sm">Fuel Type</Label>
              <Select
                value={filters.fuelType || 'all'}
                onValueChange={(value) => updateFilter('fuelType', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="fuelType" className="bg-background h-11 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder="All fuel types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-base sm:text-sm py-2.5 sm:py-2">All fuel types</SelectItem>
                  <SelectItem value="petrol" className="text-base sm:text-sm py-2.5 sm:py-2">Petrol</SelectItem>
                  <SelectItem value="diesel" className="text-base sm:text-sm py-2.5 sm:py-2">Diesel</SelectItem>
                  <SelectItem value="electric" className="text-base sm:text-sm py-2.5 sm:py-2">Electric</SelectItem>
                  <SelectItem value="hybrid" className="text-base sm:text-sm py-2.5 sm:py-2">Hybrid</SelectItem>
                  <SelectItem value="plug_in_hybrid" className="text-base sm:text-sm py-2.5 sm:py-2">Plug-in Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Type */}
            <div className="space-y-2">
              <Label htmlFor="sourceType" className="text-sm">Source</Label>
              <Select
                value={filters.sourceType}
                onValueChange={(value: 'all' | 'dealer_owned' | 'imported') => 
                  updateFilter('sourceType', value)
                }
              >
                <SelectTrigger id="sourceType" className="bg-background h-11 sm:h-10 text-base sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-base sm:text-sm py-2.5 sm:py-2">All sources</SelectItem>
                  <SelectItem value="dealer_owned" className="text-base sm:text-sm py-2.5 sm:py-2">Dealer-Owned</SelectItem>
                  <SelectItem value="imported" className="text-base sm:text-sm py-2.5 sm:py-2">Imported via Flux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
