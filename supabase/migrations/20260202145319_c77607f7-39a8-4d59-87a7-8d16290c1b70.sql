-- Fix Security Definer Views - Recreate with security_invoker = true
-- This ensures views use the querying user's RLS policies, not the view creator's

-- Drop and recreate views with proper security settings
DROP VIEW IF EXISTS public.vehicle_risk_flags;
DROP VIEW IF EXISTS public.market_demand_stats;
DROP VIEW IF EXISTS public.dealer_trust_stats;
DROP VIEW IF EXISTS public.market_pricing_stats;

-- Recreate Market Pricing Stats View with security invoker
CREATE VIEW public.market_pricing_stats 
WITH (security_invoker = true) AS
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

-- Recreate Dealer Trust Stats View with security invoker
CREATE VIEW public.dealer_trust_stats 
WITH (security_invoker = true) AS
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

-- Recreate Market Demand Stats View with security invoker
CREATE VIEW public.market_demand_stats 
WITH (security_invoker = true) AS
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

-- Recreate Vehicle Risk Flags View with security invoker
CREATE VIEW public.vehicle_risk_flags 
WITH (security_invoker = true) AS
SELECT 
  v.id as vehicle_id,
  v.make,
  v.model,
  v.year,
  v.price,
  v.dealer_id,
  CASE 
    WHEN mps.avg_price IS NOT NULL AND v.price < (mps.avg_price * 0.6) 
    THEN true ELSE false 
  END as price_below_market,
  CASE 
    WHEN v.photos IS NULL OR array_length(v.photos, 1) IS NULL OR array_length(v.photos, 1) = 0 
    THEN true ELSE false 
  END as missing_photos,
  CASE 
    WHEN v.mileage IS NULL OR v.color IS NULL OR v.description IS NULL 
    THEN true ELSE false 
  END as incomplete_data,
  CASE 
    WHEN dts.member_since IS NULL OR dts.member_since > NOW() - INTERVAL '30 days'
    THEN true ELSE false 
  END as new_dealer,
  (
    CASE WHEN mps.avg_price IS NOT NULL AND v.price < (mps.avg_price * 0.6) THEN 1 ELSE 0 END +
    CASE WHEN v.photos IS NULL OR array_length(v.photos, 1) IS NULL THEN 1 ELSE 0 END +
    CASE WHEN v.mileage IS NULL OR v.color IS NULL OR v.description IS NULL THEN 1 ELSE 0 END +
    CASE WHEN dts.member_since IS NULL OR dts.member_since > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END
  ) as risk_score,
  mps.avg_price as market_avg_price,
  mps.min_price as market_min_price,
  mps.max_price as market_max_price,
  dts.fulfillment_rate as dealer_fulfillment_rate,
  dts.member_since as dealer_member_since
FROM public.vehicles v
LEFT JOIN public.market_pricing_stats mps ON v.make = mps.make AND v.model = mps.model AND v.year = mps.year
LEFT JOIN public.dealer_trust_stats dts ON v.dealer_id = dts.dealer_id
WHERE v.is_sold = false;

-- Re-grant SELECT permissions
GRANT SELECT ON public.market_pricing_stats TO authenticated, anon;
GRANT SELECT ON public.market_demand_stats TO authenticated, anon;
GRANT SELECT ON public.dealer_trust_stats TO authenticated;
GRANT SELECT ON public.vehicle_risk_flags TO authenticated, anon;