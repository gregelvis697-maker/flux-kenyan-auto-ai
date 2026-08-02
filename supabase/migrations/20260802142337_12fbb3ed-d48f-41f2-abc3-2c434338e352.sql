-- Allow public read of dealer rows that have active listings (column access is
-- restricted separately by the grants below).
DROP POLICY IF EXISTS "Public can view dealers with active listings" ON public.profiles;
CREATE POLICY "Public can view dealers with active listings"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    WHERE v.dealer_id = profiles.id AND v.is_sold = false
  )
);

-- Column-level lockdown: anon may only read the public-safe columns.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, full_name, address, google_maps_link, street_address, city,
  location_latitude, location_longitude, rating, review_count,
  whatsapp_number, phone_number, email_public,
  show_whatsapp, show_phone, show_email
) ON public.profiles TO anon;