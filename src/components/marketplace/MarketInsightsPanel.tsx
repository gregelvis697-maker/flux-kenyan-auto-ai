import { TrendingUp, DollarSign, Users, Shield, AlertTriangle, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  useMarketPricing, 
  useMarketDemand, 
  useDealerTrust, 
  useVehicleRisk,
  getPricePosition,
  getPriceDifferencePercent,
  getDemandLevel,
  generateInsightSummary 
} from '@/hooks/useMarketIntelligence';
import { PricePositionBadge, DemandBadge, VerifiedBadge, RiskIndicator } from './IntelligenceBadges';

interface MarketInsightsPanelProps {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  dealerId: string;
  verificationStatus?: string;
}

export function MarketInsightsPanel({
  vehicleId,
  make,
  model,
  year,
  price,
  dealerId,
  verificationStatus,
}: MarketInsightsPanelProps) {
  const { data: pricing } = useMarketPricing(make, model, year);
  const { data: demand } = useMarketDemand(make, model);
  const { data: dealerTrust } = useDealerTrust(dealerId);
  const { data: riskFlags } = useVehicleRisk(vehicleId);
  
  // If no intelligence data is available at all, don't render the panel
  const hasAnyData = pricing || demand || dealerTrust || riskFlags;
  if (!hasAnyData) return null;
  
  const pricePosition = getPricePosition(price, pricing?.avg_price);
  const priceDiff = getPriceDifferencePercent(price, pricing?.avg_price);
  const demandLevel = getDemandLevel(demand?.demand_ratio);
  const isVerified = verificationStatus === 'verified';
  
  const insightSummary = generateInsightSummary({
    price,
    avgPrice: pricing?.avg_price,
    demandRatio: demand?.demand_ratio,
    fulfillmentRate: dealerTrust?.fulfillment_rate,
    riskFlags: riskFlags ? {
      price_below_market: riskFlags.price_below_market,
      missing_photos: riskFlags.missing_photos,
      incomplete_data: riskFlags.incomplete_data,
      new_dealer: riskFlags.new_dealer,
    } : undefined,
    isVerified,
  });
  
  const formatPrice = (p: number) => `$${p.toLocaleString()}`;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Market Insights</h3>
        {isVerified && <VerifiedBadge isVerified={isVerified} size="md" />}
      </div>
      
      {/* AI Summary */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground/90 leading-relaxed">
          {insightSummary}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Price Analysis */}
        {pricing && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Market Price</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{formatPrice(pricing.avg_price)}</p>
              <p className="text-xs text-muted-foreground">
                Range: {formatPrice(pricing.min_price)} - {formatPrice(pricing.max_price)}
              </p>
              {pricePosition && (
                <PricePositionBadge position={pricePosition} percentDiff={priceDiff} size="md" />
              )}
            </div>
          </div>
        )}
        
        {/* Demand Level */}
        {demand && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Market Demand</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold capitalize">{demandLevel || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">
                {demand.available_count} available · {demand.request_count} requests
              </p>
              {demandLevel && <DemandBadge level={demandLevel} size="md" />}
            </div>
          </div>
        )}
        
        {/* Dealer Trust */}
        {dealerTrust && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Dealer Trust</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {dealerTrust.fulfillment_rate !== null 
                  ? `${dealerTrust.fulfillment_rate}%` 
                  : 'New'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {dealerTrust.fulfilled_imports}/{dealerTrust.total_imports} imports fulfilled
              </p>
              {dealerTrust.member_since && (
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(dealerTrust.member_since).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Risk Assessment */}
        {riskFlags && riskFlags.risk_score > 0 && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">Risk Factors</span>
            </div>
            <div className="space-y-2">
              <RiskIndicator riskScore={riskFlags.risk_score} size="md" />
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {riskFlags.price_below_market && (
                  <li>• Price significantly below market</li>
                )}
                {riskFlags.missing_photos && (
                  <li>• Missing or limited photos</li>
                )}
                {riskFlags.incomplete_data && (
                  <li>• Incomplete vehicle details</li>
                )}
                {riskFlags.new_dealer && (
                  <li>• New dealer ({'<'}30 days)</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Vehicle Count Context */}
      {pricing && pricing.vehicle_count > 1 && (
        <p className="text-xs text-center text-muted-foreground">
          Based on {pricing.vehicle_count} similar vehicles in the marketplace
        </p>
      )}
    </div>
  );
}
