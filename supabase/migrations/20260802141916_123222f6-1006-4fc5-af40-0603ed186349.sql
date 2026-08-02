ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_public text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_whatsapp boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT true;

DROP VIEW IF EXISTS public.public_dealer_profiles;

CREATE VIEW public.public_dealer_profiles
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.full_name,
  CASE WHEN p.show_whatsapp THEN p.whatsapp_number END AS whatsapp_number,
  CASE WHEN p.show_phone THEN p.phone_number END AS phone_number,
  CASE WHEN p.show_email THEN p.email_public END AS email_public,
  p.show_whatsapp,
  p.show_phone,
  p.show_email,
  p.address,
  p.google_maps_link,
  p.street_address,
  p.city,
  p.location_latitude,
  p.location_longitude,
  p.rating,
  p.review_count
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.vehicles v WHERE v.dealer_id = p.id AND v.is_sold = false
);

GRANT SELECT ON public.public_dealer_profiles TO anon;
GRANT SELECT ON public.public_dealer_profiles TO authenticated;