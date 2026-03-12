import { useState } from 'react';
import { Filter, X, Car, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

export interface MarketplaceFiltersState {
  minPrice: number;
  maxPrice: number;
  bodyTypes: string[];
  fuelTypes: string[];
  transmission: string;
  make: string;
  model: string;
  minYear: string;
  maxYear: string;
  maxMileage: string;
}

export const defaultFilters: MarketplaceFiltersState = {
  minPrice: 0,
  maxPrice: 10000000,
  bodyTypes: [],
  fuelTypes: [],
  transmission: 'all',
  make: '',
  model: '',
  minYear: '',
  maxYear: '',
  maxMileage: '',
};

const MAX_PRICE = 10000000;

const BODY_TYPES = [
  { value: 'suv', label: 'SUV', icon: '🚙' },
  { value: 'sedan', label: 'Sedan', icon: '🚗' },
  { value: 'van', label: 'Van', icon: '🚐' },
  { value: 'coupe', label: 'Coupe', icon: '🏎️' },
];

const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug_in_hybrid', label: 'Plug-in Hybrid' },
];

interface FiltersContentProps {
  filters: MarketplaceFiltersState;
  onFiltersChange: (filters: MarketplaceFiltersState) => void;
  onReset: () => void;
  uniqueMakes: string[];
}

function FiltersContent({ filters, onFiltersChange, onReset, uniqueMakes }: FiltersContentProps) {
  const [additionalOpen, setAdditionalOpen] = useState(false);

  const updateFilter = <K extends keyof MarketplaceFiltersState>(
    key: K,
    value: MarketplaceFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleBodyType = (type: string) => {
    const current = filters.bodyTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter('bodyTypes', updated);
  };

  const toggleFuelType = (type: string) => {
    const current = filters.fuelTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter('fuelTypes', updated);
  };

  const formatPrice = (value: number) => {
    if (value >= MAX_PRICE) return 'KES 10,000,000+';
    return `KES ${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Filters</h2>
        <button
          onClick={onReset}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Reset
        </button>
      </div>
      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-foreground">Price Range</Label>
        <Slider
          value={[filters.minPrice, filters.maxPrice]}
          min={0}
          max={MAX_PRICE}
          step={100000}
          onValueChange={([min, max]) => {
            onFiltersChange({ ...filters, minPrice: min, maxPrice: max });
          }}
          className="mt-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPrice(filters.minPrice)}</span>
          <span>{formatPrice(filters.maxPrice)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
            className="bg-background/50 h-8 text-xs"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice >= MAX_PRICE ? '' : filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || MAX_PRICE)}
            className="bg-background/50 h-8 text-xs"
          />
        </div>
      </div>
      <Separator />

      {/* Body Type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Body Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {BODY_TYPES.map((type) => {
            const isSelected = filters.bodyTypes.includes(type.value);
            return (
              <button
                key={type.value}
                onClick={() => toggleBodyType(type.value)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-xs font-medium',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-muted-foreground/50 text-muted-foreground'
                )}
              >
                <span className="text-lg">{type.icon}</span>
                {type.label}
              </button>
            );
          })}
        </div>
      </div>
      <Separator />

      {/* Fuel Type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Fuel Type</Label>
        <div className="space-y-2">
          {FUEL_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`fuel-${type.value}`}
                checked={filters.fuelTypes.includes(type.value)}
                onCheckedChange={() => toggleFuelType(type.value)}
              />
              <label
                htmlFor={`fuel-${type.value}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      {/* Transmission */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Transmission</Label>
        <RadioGroup
          value={filters.transmission}
          onValueChange={(value) => updateFilter('transmission', value)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="trans-all" />
            <label htmlFor="trans-all" className="text-sm text-foreground cursor-pointer">Any</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="automatic" id="trans-auto" />
            <label htmlFor="trans-auto" className="text-sm text-foreground cursor-pointer">Automatic</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="trans-manual" />
            <label htmlFor="trans-manual" className="text-sm text-foreground cursor-pointer">Manual</label>
          </div>
        </RadioGroup>
      </div>
      <Separator />

      {/* Additional Filters */}
      <Collapsible open={additionalOpen} onOpenChange={setAdditionalOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-semibold text-foreground">
          Additional Filters
          <ChevronDown className={cn('h-4 w-4 transition-transform', additionalOpen && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Make */}
          <div className="space-y-1.5">
            <Label className="text-xs">Make</Label>
            <Select
              value={filters.make || 'all'}
              onValueChange={(value) => updateFilter('make', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="bg-background/50 h-8 text-xs">
                <SelectValue placeholder="All makes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All makes</SelectItem>
                {uniqueMakes.map((make) => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <Label className="text-xs">Model</Label>
            <Input
              placeholder="Enter model"
              value={filters.model}
              onChange={(e) => updateFilter('model', e.target.value)}
              className="bg-background/50 h-8 text-xs"
            />
          </div>

          {/* Year Range */}
          <div className="space-y-1.5">
            <Label className="text-xs">Year Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="From"
                type="number"
                value={filters.minYear}
                onChange={(e) => updateFilter('minYear', e.target.value)}
                className="bg-background/50 h-8 text-xs"
              />
              <Input
                placeholder="To"
                type="number"
                value={filters.maxYear}
                onChange={(e) => updateFilter('maxYear', e.target.value)}
                className="bg-background/50 h-8 text-xs"
              />
            </div>
          </div>

          {/* Max Mileage */}
          <div className="space-y-1.5">
            <Label className="text-xs">Max Mileage (km)</Label>
            <Input
              placeholder="e.g. 100000"
              type="number"
              value={filters.maxMileage}
              onChange={(e) => updateFilter('maxMileage', e.target.value)}
              className="bg-background/50 h-8 text-xs"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface MarketplaceFiltersProps {
  filters: MarketplaceFiltersState;
  onFiltersChange: (filters: MarketplaceFiltersState) => void;
  onReset: () => void;
  uniqueMakes: string[];
  activeFilterCount: number;
}

export function MarketplaceFiltersSidebar({ filters, onFiltersChange, onReset, uniqueMakes }: MarketplaceFiltersProps) {
  return (
    <aside className="hidden lg:block w-[280px] flex-shrink-0">
      <div className="sticky top-24 bg-card border border-border/50 rounded-lg p-5 max-h-[calc(100vh-120px)] overflow-y-auto">
        <FiltersContent
          filters={filters}
          onFiltersChange={onFiltersChange}
          onReset={onReset}
          uniqueMakes={uniqueMakes}
        />
      </div>
    </aside>
  );
}

export function MarketplaceFiltersMobile({ filters, onFiltersChange, onReset, uniqueMakes, activeFilterCount }: MarketplaceFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw] max-w-sm overflow-y-auto bg-card">
          <SheetHeader>
            <SheetTitle className="sr-only">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FiltersContent
              filters={filters}
              onFiltersChange={onFiltersChange}
              onReset={onReset}
              uniqueMakes={uniqueMakes}
            />
          </div>
          <div className="sticky bottom-0 pt-4 pb-2 bg-card border-t border-border/50 mt-6">
            <Button className="w-full" onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
