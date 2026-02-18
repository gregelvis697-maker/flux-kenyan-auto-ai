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

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && value !== 'all'
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                Active
              </span>
            )}
          </Button>
        </CollapsibleTrigger>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <div className="bg-card/60 backdrop-blur-lg border border-border/50 rounded-lg p-4 mb-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Make Filter */}
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Select
                value={filters.make || 'all'}
                onValueChange={(value) => updateFilter('make', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="make" className="bg-background">
                  <SelectValue placeholder="All makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All makes</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Filter */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="Enter model"
                value={filters.model}
                onChange={(e) => updateFilter('model', e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="bg-background"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
              <Label>Year Range</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="From"
                  type="number"
                  value={filters.minYear}
                  onChange={(e) => updateFilter('minYear', e.target.value)}
                  className="bg-background"
                />
                <Input
                  placeholder="To"
                  type="number"
                  value={filters.maxYear}
                  onChange={(e) => updateFilter('maxYear', e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select
                value={filters.fuelType || 'all'}
                onValueChange={(value) => updateFilter('fuelType', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="fuelType" className="bg-background">
                  <SelectValue placeholder="All fuel types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fuel types</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="plug_in_hybrid">Plug-in Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Type */}
            <div className="space-y-2">
              <Label htmlFor="sourceType">Source</Label>
              <Select
                value={filters.sourceType}
                onValueChange={(value: 'all' | 'dealer_owned' | 'imported') => 
                  updateFilter('sourceType', value)
                }
              >
                <SelectTrigger id="sourceType" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="dealer_owned">Dealer-Owned</SelectItem>
                  <SelectItem value="imported">Imported via Flux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
