-- Phase 7: Intelligence Layer - Views and Verification Fields

-- Step 1: Add verification columns to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Add check constraint separately to avoid issues if column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_verification_status_check'
  ) THEN
    ALTER TABLE public.vehicles 
    ADD CONSTRAINT vehicles_verification_status_check 
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));
  END IF;
END $$;

-- Step 2: Create Market Pricing Stats View
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

-- Step 3: Create Dealer Trust Stats View (needed by other views)
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

-- Step 4: Create Market Demand Stats View
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

-- Step 5: Create Vehicle Risk Flags View
CREATE OR REPLACE VIEW public.vehicle_risk_flags AS
SELECT 
  v.id as vehicle_id,
  v.make,
  v.model,
  v.year,
  v.price,
  v.dealer_id,
  -- Price below market flag (40% below = 0.6 multiplier)
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
  ) as risk_score,
  -- Include pricing context
  mps.avg_price as market_avg_price,
  mps.min_price as market_min_price,
  mps.max_price as market_max_price,
  -- Include dealer context
  dts.fulfillment_rate as dealer_fulfillment_rate,
  dts.member_since as dealer_member_since
FROM public.vehicles v
LEFT JOIN public.market_pricing_stats mps ON v.make = mps.make AND v.model = mps.model AND v.year = mps.year
LEFT JOIN public.dealer_trust_stats dts ON v.dealer_id = dts.dealer_id
WHERE v.is_sold = false;

-- Grant SELECT on views to authenticated users (views inherit RLS from base tables)
GRANT SELECT ON public.market_pricing_stats TO authenticated;
GRANT SELECT ON public.market_demand_stats TO authenticated;
GRANT SELECT ON public.dealer_trust_stats TO authenticated;
GRANT SELECT ON public.vehicle_risk_flags TO authenticated;

-- Also grant to anon for public marketplace access
GRANT SELECT ON public.market_pricing_stats TO anon;
GRANT SELECT ON public.market_demand_stats TO anon;
GRANT SELECT ON public.vehicle_risk_flags TO anon;