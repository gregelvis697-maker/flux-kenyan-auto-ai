
CREATE TABLE IF NOT EXISTS public.dealer_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_name TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  phone TEXT,
  opening_hours TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dealer_locations_dealer ON public.dealer_locations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_locations_coords ON public.dealer_locations(location_latitude, location_longitude);

GRANT SELECT ON public.dealer_locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dealer_locations TO authenticated;
GRANT ALL ON public.dealer_locations TO service_role;

ALTER TABLE public.dealer_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active dealer locations"
  ON public.dealer_locations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Dealers can insert own locations"
  ON public.dealer_locations FOR INSERT
  TO authenticated
  WITH CHECK (dealer_id = auth.uid());

CREATE POLICY "Dealers can update own locations"
  ON public.dealer_locations FOR UPDATE
  TO authenticated
  USING (dealer_id = auth.uid())
  WITH CHECK (dealer_id = auth.uid());

CREATE POLICY "Dealers can delete own locations"
  ON public.dealer_locations FOR DELETE
  TO authenticated
  USING (dealer_id = auth.uid());

CREATE TRIGGER trg_dealer_locations_updated_at
  BEFORE UPDATE ON public.dealer_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
