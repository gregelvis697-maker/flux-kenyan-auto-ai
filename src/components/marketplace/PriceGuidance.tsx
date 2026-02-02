import { TrendingUp, TrendingDown, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketPricing, getPricePosition, getPriceDifferencePercent } from '@/hooks/useMarketIntelligence';

interface PriceGuidanceProps {
  make: string;
  model: string;
  year: number;
  currentPrice: number | string;
}

export function PriceGuidance({ make, model, year, currentPrice }: PriceGuidanceProps) {
  const { data: pricing, isLoading } = useMarketPricing(make, model, year);
  
  // Don't render anything if no data or still loading
  if (isLoading || !pricing || !make || !model || !year) return null;
  
  const priceNum = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
  
  // Only show if we have a valid price entered
  if (!priceNum || isNaN(priceNum) || priceNum <= 0) {
    // Show just the market range without position
    return (
      <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-md mt-1.5">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground">
          <p>
            Market range for {year} {make} {model}:{' '}
            <span className="font-medium text-foreground">
              ${pricing.min_price.toLocaleString()} - ${pricing.max_price.toLocaleString()}
            </span>
          </p>
          <p className="mt-0.5">
            Average: <span className="font-medium text-foreground">${pricing.avg_price.toLocaleString()}</span>
            {pricing.vehicle_count > 1 && (
              <span className="text-muted-foreground/70"> ({pricing.vehicle_count} similar listings)</span>
            )}
          </p>
        </div>
      </div>
    );
  }
  
  const position = getPricePosition(priceNum, pricing.avg_price);
  const priceDiff = getPriceDifferencePercent(priceNum, pricing.avg_price);
  
  const getPositionConfig = () => {
    if (!position) return null;
    
    switch (position) {
      case 'below':
        return {
          icon: TrendingDown,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          message: `Your price is ${Math.abs(priceDiff || 0)}% below market average`,
        };
      case 'above':
        return {
          icon: TrendingUp,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          message: `Your price is ${priceDiff}% above market average`,
        };
      case 'fair':
        return {
          icon: CheckCircle2,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          message: 'Your price is competitive within market range',
        };
    }
  };
  
  const config = getPositionConfig();
  if (!config) return null;
  
  const { icon: Icon, color, bgColor, borderColor, message } = config;
  
  return (
    <div className={cn('flex items-start gap-2 p-2 rounded-md mt-1.5 border', bgColor, borderColor)}>
      <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', color)} />
      <div className="text-xs">
        <p className={cn('font-medium', color)}>{message}</p>
        <p className="text-muted-foreground mt-0.5">
          Market range: ${pricing.min_price.toLocaleString()} - ${pricing.max_price.toLocaleString()}
          <span className="text-muted-foreground/70"> (avg: ${pricing.avg_price.toLocaleString()})</span>
        </p>
      </div>
    </div>
  );
}
