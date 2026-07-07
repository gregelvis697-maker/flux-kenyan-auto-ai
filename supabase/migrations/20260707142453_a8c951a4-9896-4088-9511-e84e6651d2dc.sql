
-- 1) Remove broad public profile exposure (includes email/PII) and replace with a safe view
DROP POLICY IF EXISTS "Anyone can view dealer profiles for vehicles" ON public.profiles;

CREATE OR REPLACE VIEW public.public_dealer_profiles
WITH (security_invoker = false) AS
SELECT p.id, p.full_name, p.whatsapp_number, p.address, p.google_maps_link, p.rating, p.review_count
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.vehicles v
  WHERE v.dealer_id = p.id AND v.is_sold = false
);

GRANT SELECT ON public.public_dealer_profiles TO anon, authenticated;

-- 2) Prevent self-assigning admin role via INSERT policy
DROP POLICY IF EXISTS "Users can request roles during signup" ON public.user_roles;
CREATE POLICY "Users can request roles during signup"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND role <> 'admin'::app_role
  AND status = (CASE WHEN role = 'buyer'::app_role THEN 'approved'::approval_status ELSE 'pending'::approval_status END)
);

-- 3) Lock down SECURITY DEFINER functions from direct anon/authenticated execution.
-- has_role must remain executable because it is referenced by RLS policies.
REVOKE EXECUTE ON FUNCTION public.create_admin_user(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_role_status(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_inventory_from_import() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_profiles_updated_at() FROM PUBLIC, anon, authenticated;
