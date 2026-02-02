

# Phase 7: Intelligence Layer Implementation Plan

## Overview
This plan implements an intelligence layer for the FLUX automotive marketplace to make the platform feel like "Carfax for Kenya" using only internal database data. The implementation is fully additive with graceful degradation.

---

## Pre-Implementation: Fix Build Error

The build errors reference `src/hooks/useMarketIntelligence.ts` which does not exist in the codebase. This appears to be a stale/cached build error.Remove any reference of this and build from scratch as part of the implementation

---

## Step 1: Database Views (SQL Migration)

Create read-only SQL views that aggregate market intelligence data.

### 1.1 Market Pricing Stats View
```sql
CREATE OR REPLACE VIEW public.market_pricing_stats AS
SELECT 
  make,
  model,
  year,
  COUNT(*) as vehicle_count,
  ROUND(AVG(price)::numeric, 2) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  ROUND(STDDEV(price)::numeric, 2) as price_stddev
FROM public.vehicles
WHERE is_sold = false
GROUP BY make, model, year;
```

### 1.2 Market Demand Stats View
```sql
CREATE OR REPLACE VIEW public.market_demand_stats AS
SELECT 
  v.make,
  v.model,
  COUNT(DISTINCT v.id) as available_count,
  COALESCE(ir.request_count, 0) as request_count,
  CASE 
    WHEN COUNT(DISTINCT v.id) > 0 
    THEN ROUND(COALESCE(ir.request_count, 0)::numeric / COUNT(DISTINCT v.id), 2)
    ELSE 0
  END as demand_ratio
FROM public.vehicles v
LEFT JOIN (
  SELECT make, model, COUNT(*) as request_count
  FROM public.dealer_import_requests
  WHERE status IN ('requested', 'accepted', 'in_transit')
  GROUP BY make, model
) ir ON v.make = ir.make AND v.model = ir.model
WHERE v.is_sold = false
GROUP BY v.make, v.model, ir.request_count;
```

### 1.3 Dealer Trust Stats View
```sql
CREATE OR REPLACE VIEW public.dealer_trust_stats AS
SELECT 
  p.id as dealer_id,
  p.full_name,
  p.email,
  COUNT(DISTINCT v.id) as total_listings,
  COUNT(DISTINCT CASE WHEN v.is_sold = false THEN v.id END) as active_listings,
  COUNT(DISTINCT dir.id) as total_imports,
  COUNT(DISTINCT CASE WHEN dir.status = 'received' THEN dir.id END) as fulfilled_imports,
  CASE 
    WHEN COUNT(DISTINCT dir.id) > 0 
    THEN ROUND(COUNT(DISTINCT CASE WHEN dir.status = 'received' THEN dir.id END)::numeric / COUNT(DISTINCT dir.id) * 100, 1)
    ELSE NULL
  END as fulfillment_rate,
  MIN(ur.approved_at) as member_since
FROM public.profiles p
INNER JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'dealer' AND ur.status = 'approved'
LEFT JOIN public.vehicles v ON v.dealer_id = p.id
LEFT JOIN public.dealer_import_requests dir ON dir.dealer_id = p.id
GROUP BY p.id, p.full_name, p.email;
```

### 1.4 Vehicle Risk Flags View
```sql
CREATE OR REPLACE VIEW public.vehicle_risk_flags AS
SELECT 
  v.id as vehicle_id,
  v.make,
  v.model,
  v.year,
  v.price,
  -- Price below market flag
  CASE 
    WHEN mps.avg_price IS NOT NULL AND v.price < (mps.avg_price * 0.6) 
    THEN true ELSE false 
  END as price_below_market,
  -- Missing photos flag
  CASE 
    WHEN v.photos IS NULL OR array_length(v.photos, 1) IS NULL OR array_length(v.photos, 1) = 0 
    THEN true ELSE false 
  END as missing_photos,
  -- Incomplete data flag
  CASE 
    WHEN v.mileage IS NULL OR v.color IS NULL OR v.description IS NULL 
    THEN true ELSE false 
  END as incomplete_data,
  -- New dealer flag (less than 30 days)
  CASE 
    WHEN dts.member_since IS NULL OR dts.member_since > NOW() - INTERVAL '30 days'
    THEN true ELSE false 
  END as new_dealer,
  -- Calculate risk score (0-4)
  (
    CASE WHEN mps.avg_price IS NOT NULL AND v.price < (mps.avg_price * 0.6) THEN 1 ELSE 0 END +
    CASE WHEN v.photos IS NULL OR array_length(v.photos, 1) IS NULL THEN 1 ELSE 0 END +
    CASE WHEN v.mileage IS NULL OR v.color IS NULL OR v.description IS NULL THEN 1 ELSE 0 END +
    CASE WHEN dts.member_since IS NULL OR dts.member_since > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END
  ) as risk_score
FROM public.vehicles v
LEFT JOIN public.market_pricing_stats mps ON v.make = mps.make AND v.model = mps.model AND v.year = mps.year
LEFT JOIN public.dealer_trust_stats dts ON v.dealer_id = dts.dealer_id
WHERE v.is_sold = false;
```

### 1.5 RLS Policies for Views
Views inherit table RLS. We'll grant SELECT to authenticated users on views that aggregate public data.

---

## Step 2: Add Verification Fields to Vehicles Table

```sql
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' 
  CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
```

---

## Step 3: Create React Query Hooks

### File: `src/hooks/useMarketIntelligence.ts`

Create hooks with:
- 5-minute stale time
- Silent error handling
- Optional data that never blocks UI
- Graceful fallbacks

```text
Hooks to create:
- useMarketPricing(make, model, year) - Get pricing stats
- useMarketDemand(make, model) - Get demand stats  
- useDealerTrust(dealerId) - Get dealer trust score
- useVehicleRisk(vehicleId) - Get vehicle risk flags
- useVehicleInsight(vehicle) - Generate AI-like text summary
```

---

## Step 4: Enhance VehicleCard Component

Add to VehicleCard:
- **Price Position Badge**: "Below Market", "Fair Price", "Above Market"
- **Demand Badge**: "High Demand", "Low Supply" (if demand_ratio > 1)
- **FLUX Verified Badge**: Green checkmark if verification_status = 'verified'
- **Small Trust Indicator**: Dealer fulfillment rate tooltip

All badges render conditionally and silently skip if data unavailable.

---

## Step 5: Enhance VehicleDetailModal Component

Add "Market Insights" section containing:
- Average market price for this make/model/year
- Price range (min-max)
- Demand level indicator
- Dealer trust score
- Risk flags (with explanations)
- AI-style summary text (template-based, no AI calls)

Example summary:
> "This vehicle is priced 15% below market average. High demand with 3 active import requests. Dealer has 92% fulfillment rate. Consider: new dealer, limited photos."

---

## Step 6: Enhance Dealer Inventory Form

Under the price input field, add:
- Suggested price range based on market_pricing_stats
- Visual indicator: "Your price is X% below/above market"
- Non-blocking, renders only if data available

---

## Step 7: Enhance Dealer Profile Section

In dealer dashboard or public dealer view:
- Trust score badge
- Fulfillment rate percentage
- "Verified Dealer" shield (if applicable)
- Member since date

---

## Technical Details

### File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `supabase/migrations/[new].sql` | Create | Add 4 views + vehicle verification columns |
| `src/hooks/useMarketIntelligence.ts` | Create | New hooks for intelligence data |
| `src/components/marketplace/VehicleCard.tsx` | Modify | Add intelligence badges |
| `src/components/marketplace/VehicleDetailModal.tsx` | Modify | Add Market Insights section |
| `src/components/dealer/InventoryTab.tsx` | Modify | Add price guidance under price input |
| `src/components/marketplace/IntelligenceBadges.tsx` | Create | Reusable badge components |
| `src/components/marketplace/MarketInsightsPanel.tsx` | Create | Insights section for modal |

### Error Handling Strategy

All intelligence features follow this pattern:
```typescript
const { data, isLoading } = useMarketPricing(make, model, year);
// If loading or no data, simply don't render the badge
if (!data) return null;
```

No error toasts, no blocking states, no failed renders.

### Type Safety

TypeScript interfaces for view data:
```typescript
interface MarketPricingStats {
  make: string;
  model: string;
  year: number;
  vehicle_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_stddev: number | null;
}
// Similar for other views
```

---

## Implementation Order

1. Create SQL migration with views and columns
2. Create `useMarketIntelligence.ts` hook file
3. Create `IntelligenceBadges.tsx` component
4. Create `MarketInsightsPanel.tsx` component  
5. Update `VehicleCard.tsx` with badges
6. Update `VehicleDetailModal.tsx` with insights panel
7. Update `InventoryTab.tsx` with price guidance

---

## Success Criteria

- All intelligence features degrade gracefully
- No red error toasts during normal usage
- No blocking loading states
- Existing flows unchanged
- VehicleCard shows relevant badges when data available
- VehicleDetailModal shows comprehensive insights
- Dealer sees price guidance when adding vehicles

