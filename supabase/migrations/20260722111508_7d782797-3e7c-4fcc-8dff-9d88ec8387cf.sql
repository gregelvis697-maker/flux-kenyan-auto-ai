-- 1) Rebuild the public_dealer_profiles view with security_invoker so it respects the caller's RLS instead of the view owner's.
DROP VIEW IF EXISTS public.public_dealer_profiles;
CREATE VIEW public.public_dealer_profiles
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.full_name,
  p.whatsapp_number,
  p.address,
  p.google_maps_link,
  p.rating,
  p.review_count
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.vehicles v
  WHERE v.dealer_id = p.id AND v.is_sold = false
);
GRANT SELECT ON public.public_dealer_profiles TO anon, authenticated;

-- 2) Also apply security_invoker to the other analytics views flagged by the linter.
ALTER VIEW public.dealer_trust_stats SET (security_invoker = true);
ALTER VIEW public.vehicle_risk_flags SET (security_invoker = true);
ALTER VIEW public.market_pricing_stats SET (security_invoker = true);
ALTER VIEW public.market_demand_stats SET (security_invoker = true);

-- 3) Restrict listing of the vehicle-photos public bucket.
-- The bucket stays public (direct object URLs still work via the CDN),
-- but we drop the broad SELECT policy on storage.objects that allowed listing all files.
DROP POLICY IF EXISTS "Anyone can view vehicle photos" ON storage.objects;

-- 4) Tighten EXECUTE on SECURITY DEFINER helpers so only the roles that actually need them can call them.
-- has_role / get_user_role / get_role_status are used by RLS policies and app code for authenticated users only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_role_status(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_status(uuid) TO authenticated;

-- create_admin_user must never be callable by clients (admins are provisioned via SQL only).
REVOKE EXECUTE ON FUNCTION public.create_admin_user(text, uuid) FROM PUBLIC, anon, authenticated;