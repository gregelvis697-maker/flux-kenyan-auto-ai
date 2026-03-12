import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'mileage_asc' | 'year_desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'mileage_asc', label: 'Lowest Mileage' },
  { value: 'year_desc', label: 'Newest Year' },
];

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest Listings',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  mileage_asc: 'Lowest Mileage',
  year_desc: 'Newest Year',
};

interface MarketplaceSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function MarketplaceSort({ value, onChange }: MarketplaceSortProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-[180px] bg-card border-border/50 h-9 text-sm">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function getSortLabel(sort: SortOption): string {
  return SORT_LABELS[sort];
}
