ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS price_on_request boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability_status text;

COMMENT ON COLUMN public.vehicles.price_on_request IS 'When true, marketplace cards show "Call for Price" instead of the numeric price.';
COMMENT ON COLUMN public.vehicles.availability_status IS 'Optional: available | in_transit | reserved. Falls back to is_sold-derived state when null.';