import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types for intelligence data
export interface MarketPricingStats {
  make: string;
  model: string;
  year: number;
  vehicle_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_stddev: number | null;
}

export interface MarketDemandStats {
  make: string;
  model: string;
  available_count: number;
  request_count: number;
  demand_ratio: number;
}

export interface DealerTrustStats {
  dealer_id: string;
  full_name: string | null;
  email: string;
  total_listings: number;
  active_listings: number;
  total_imports: number;
  fulfilled_imports: number;
  fulfillment_rate: number | null;
  member_since: string | null;
}

export interface VehicleRiskFlags {
  vehicle_id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  dealer_id: string;
  price_below_market: boolean;
  missing_photos: boolean;
  incomplete_data: boolean;
  new_dealer: boolean;
  risk_score: number;
  market_avg_price: number | null;
  market_min_price: number | null;
  market_max_price: number | null;
  dealer_fulfillment_rate: number | null;
  dealer_member_since: string | null;
}

// Configuration for silent, non-blocking queries
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Get market pricing statistics for a specific make/model/year
 * Silent error handling - returns undefined if data unavailable
 */
export function useMarketPricing(make?: string, model?: string, year?: number) {
  return useQuery({
    queryKey: ['market-pricing', make, model, year],
    queryFn: async () => {
      if (!make || !model || !year) return null;
      
      const { data, error } = await supabase
        .from('market_pricing_stats')
        .select('*')
        .eq('make', make)
        .eq('model', model)
        .eq('year', year)
        .maybeSingle();
      
      if (error) {
        console.debug('Market pricing fetch failed silently:', error.message);
        return null;
      }
      
      return data as MarketPricingStats | null;
    },
    enabled: !!(make && model && year),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: false, // Don't retry on failure - silent degradation
    refetchOnWindowFocus: false,
  });
}

/**
 * Get market demand statistics for a specific make/model
 * Silent error handling - returns undefined if data unavailable
 */
export function useMarketDemand(make?: string, model?: string) {
  return useQuery({
    queryKey: ['market-demand', make, model],
    queryFn: async () => {
      if (!make || !model) return null;
      
      const { data, error } = await supabase
        .from('market_demand_stats')
        .select('*')
        .eq('make', make)
        .eq('model', model)
        .maybeSingle();
      
      if (error) {
        console.debug('Market demand fetch failed silently:', error.message);
        return null;
      }
      
      return data as MarketDemandStats | null;
    },
    enabled: !!(make && model),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Get dealer trust statistics
 * Silent error handling - returns undefined if data unavailable
 */
export function useDealerTrust(dealerId?: string) {
  return useQuery({
    queryKey: ['dealer-trust', dealerId],
    queryFn: async () => {
      if (!dealerId) return null;
      
      const { data, error } = await supabase
        .from('dealer_trust_stats')
        .select('*')
        .eq('dealer_id', dealerId)
        .maybeSingle();
      
      if (error) {
        console.debug('Dealer trust fetch failed silently:', error.message);
        return null;
      }
      
      return data as DealerTrustStats | null;
    },
    enabled: !!dealerId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Get vehicle risk flags
 * Silent error handling - returns undefined if data unavailable
 */
export function useVehicleRisk(vehicleId?: string) {
  return useQuery({
    queryKey: ['vehicle-risk', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return null;
      
      const { data, error } = await supabase
        .from('vehicle_risk_flags')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .maybeSingle();
      
      if (error) {
        console.debug('Vehicle risk fetch failed silently:', error.message);
        return null;
      }
      
      return data as VehicleRiskFlags | null;
    },
    enabled: !!vehicleId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Calculate price position relative to market
 * Returns: 'below' | 'fair' | 'above' | null
 */
export function getPricePosition(
  price: number,
  avgPrice: number | null | undefined
): 'below' | 'fair' | 'above' | null {
  if (!avgPrice || avgPrice === 0) return null;
  
  const ratio = price / avgPrice;
  
  if (ratio < 0.85) return 'below';
  if (ratio > 1.15) return 'above';
  return 'fair';
}

/**
 * Get price difference percentage
 */
export function getPriceDifferencePercent(
  price: number,
  avgPrice: number | null | undefined
): number | null {
  if (!avgPrice || avgPrice === 0) return null;
  return Math.round(((price - avgPrice) / avgPrice) * 100);
}

/**
 * Get demand level based on demand ratio
 */
export function getDemandLevel(
  demandRatio: number | null | undefined
): 'high' | 'moderate' | 'low' | null {
  if (demandRatio === null || demandRatio === undefined) return null;
  
  if (demandRatio > 1) return 'high';
  if (demandRatio > 0.5) return 'moderate';
  return 'low';
}

/**
 * Generate AI-like insight summary using template strings
 * No external AI calls - purely template-based
 */
export function generateInsightSummary(params: {
  price: number;
  avgPrice?: number | null;
  demandRatio?: number | null;
  fulfillmentRate?: number | null;
  riskFlags?: {
    price_below_market?: boolean;
    missing_photos?: boolean;
    incomplete_data?: boolean;
    new_dealer?: boolean;
  };
  isVerified?: boolean;
}): string {
  const parts: string[] = [];
  
  // Price insight
  if (params.avgPrice) {
    const priceDiff = getPriceDifferencePercent(params.price, params.avgPrice);
    if (priceDiff !== null) {
      if (priceDiff < -15) {
        parts.push(`Priced ${Math.abs(priceDiff)}% below market average.`);
      } else if (priceDiff > 15) {
        parts.push(`Priced ${priceDiff}% above market average.`);
      } else {
        parts.push('Priced competitively within market range.');
      }
    }
  }
  
  // Demand insight
  const demandLevel = getDemandLevel(params.demandRatio);
  if (demandLevel === 'high') {
    parts.push('High demand for this model.');
  } else if (demandLevel === 'moderate') {
    parts.push('Moderate market demand.');
  }
  
  // Dealer trust insight
  if (params.fulfillmentRate !== null && params.fulfillmentRate !== undefined) {
    if (params.fulfillmentRate >= 90) {
      parts.push(`Dealer has excellent ${params.fulfillmentRate}% fulfillment rate.`);
    } else if (params.fulfillmentRate >= 70) {
      parts.push(`Dealer has good ${params.fulfillmentRate}% fulfillment rate.`);
    }
  }
  
  // Verification status
  if (params.isVerified) {
    parts.push('FLUX verified listing.');
  }
  
  // Risk considerations
  const considerations: string[] = [];
  if (params.riskFlags?.price_below_market) {
    considerations.push('unusually low price');
  }
  if (params.riskFlags?.missing_photos) {
    considerations.push('limited photos');
  }
  if (params.riskFlags?.incomplete_data) {
    considerations.push('incomplete details');
  }
  if (params.riskFlags?.new_dealer) {
    considerations.push('new dealer');
  }
  
  if (considerations.length > 0) {
    parts.push(`Consider: ${considerations.join(', ')}.`);
  }
  
  return parts.length > 0 ? parts.join(' ') : 'Market data pending.';
}
