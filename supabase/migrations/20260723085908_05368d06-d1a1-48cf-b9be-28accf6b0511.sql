
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS street_address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS location_latitude numeric(10,8),
  ADD COLUMN IF NOT EXISTS location_longitude numeric(11,8),
  ADD COLUMN IF NOT EXISTS location_geocoded_at timestamptz,
  ADD COLUMN IF NOT EXISTS location_geocode_error text;

CREATE INDEX IF NOT EXISTS idx_profiles_location_coords
  ON public.profiles (location_latitude, location_longitude);

DROP VIEW IF EXISTS public.public_dealer_profiles;

CREATE VIEW public.public_dealer_profiles
WITH (security_invoker = true) AS
SELECT
  id,
  full_name,
  whatsapp_number,
  address,
  google_maps_link,
  street_address,
  city,
  location_latitude,
  location_longitude,
  rating,
  review_count
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.vehicles v
  WHERE v.dealer_id = p.id AND v.is_sold = false
);

GRANT SELECT ON public.public_dealer_profiles TO anon, authenticated;
