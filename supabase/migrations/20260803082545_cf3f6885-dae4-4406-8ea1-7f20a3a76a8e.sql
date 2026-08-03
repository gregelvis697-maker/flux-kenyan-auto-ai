-- =========================
-- vehicle_tracking
-- =========================
CREATE TABLE public.vehicle_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  importer_id UUID NOT NULL,
  buyer_id UUID,
  tracking_enabled BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_tracking_token TEXT UNIQUE,
  order_date TIMESTAMPTZ DEFAULT now(),
  estimated_delivery_date TIMESTAMPTZ,
  actual_delivery_date TIMESTAMPTZ,
  current_stage TEXT NOT NULL DEFAULT 'order_confirmed',
  tracking_status TEXT NOT NULL DEFAULT 'in_progress',
  delay_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_tracking TO authenticated;
GRANT ALL ON public.vehicle_tracking TO service_role;

ALTER TABLE public.vehicle_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Importers manage own tracking"
ON public.vehicle_tracking FOR ALL TO authenticated
USING (importer_id = auth.uid())
WITH CHECK (importer_id = auth.uid());

CREATE POLICY "Buyers view own purchase tracking"
ON public.vehicle_tracking FOR SELECT TO authenticated
USING (buyer_id = auth.uid());

CREATE INDEX idx_tracking_vehicle ON public.vehicle_tracking(vehicle_id);
CREATE INDEX idx_tracking_importer ON public.vehicle_tracking(importer_id);
CREATE INDEX idx_tracking_buyer ON public.vehicle_tracking(buyer_id);
CREATE INDEX idx_tracking_token ON public.vehicle_tracking(public_tracking_token);

CREATE TRIGGER trg_vehicle_tracking_updated_at
BEFORE UPDATE ON public.vehicle_tracking
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =========================
-- vehicle_tracking_updates
-- =========================
CREATE TABLE public.vehicle_tracking_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID NOT NULL REFERENCES public.vehicle_tracking(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  stage_label TEXT,
  location_text TEXT,
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  location_geocoded_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  estimated_next_arrival TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_tracking_updates TO authenticated;
GRANT ALL ON public.vehicle_tracking_updates TO service_role;

ALTER TABLE public.vehicle_tracking_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view tracking updates"
ON public.vehicle_tracking_updates FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicle_tracking vt
    WHERE vt.id = tracking_id
      AND (vt.importer_id = auth.uid() OR vt.buyer_id = auth.uid())
  )
);

CREATE POLICY "Importers insert tracking updates"
ON public.vehicle_tracking_updates FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicle_tracking vt
    WHERE vt.id = tracking_id AND vt.importer_id = auth.uid()
  )
);

CREATE POLICY "Importers update tracking updates"
ON public.vehicle_tracking_updates FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicle_tracking vt
    WHERE vt.id = tracking_id AND vt.importer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicle_tracking vt
    WHERE vt.id = tracking_id AND vt.importer_id = auth.uid()
  )
);

CREATE POLICY "Importers delete tracking updates"
ON public.vehicle_tracking_updates FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicle_tracking vt
    WHERE vt.id = tracking_id AND vt.importer_id = auth.uid()
  )
);

CREATE INDEX idx_tracking_updates_tracking ON public.vehicle_tracking_updates(tracking_id);
CREATE INDEX idx_tracking_updates_stage ON public.vehicle_tracking_updates(stage);

CREATE TRIGGER trg_vehicle_tracking_updates_updated_at
BEFORE UPDATE ON public.vehicle_tracking_updates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =========================
-- Public tracking lookup (token based, limited fields)
-- =========================
CREATE OR REPLACE FUNCTION public.get_public_tracking(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  IF _token IS NULL OR length(_token) < 6 THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'vehicle', jsonb_build_object(
      'id', v.id,
      'year', v.year,
      'make', v.make,
      'model', v.model,
      'price', CASE WHEN v.price_on_request THEN NULL ELSE v.price END,
      'photo', CASE WHEN v.photos IS NOT NULL AND array_length(v.photos, 1) > 0 THEN v.photos[1] ELSE NULL END
    ),
    'tracking', jsonb_build_object(
      'current_stage', t.current_stage,
      'tracking_status', t.tracking_status,
      'delay_reason', t.delay_reason,
      'order_date', t.order_date,
      'estimated_delivery_date', t.estimated_delivery_date,
      'actual_delivery_date', t.actual_delivery_date,
      'updates', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', u.id,
          'stage', u.stage,
          'stage_label', u.stage_label,
          'location_text', u.location_text,
          'location_latitude', u.location_latitude,
          'location_longitude', u.location_longitude,
          'status', u.status,
          'notes', u.notes,
          'created_at', u.created_at
        ) ORDER BY u.created_at ASC)
        FROM public.vehicle_tracking_updates u
        WHERE u.tracking_id = t.id
      ), '[]'::jsonb)
    ),
    'importer', jsonb_build_object(
      'name', p.full_name,
      'city', p.city,
      'whatsapp_number', CASE WHEN p.show_whatsapp THEN p.whatsapp_number ELSE NULL END,
      'phone_number', CASE WHEN p.show_phone THEN p.phone_number ELSE NULL END,
      'email_public', CASE WHEN p.show_email THEN p.email_public ELSE NULL END
    )
  )
  INTO result
  FROM public.vehicle_tracking t
  JOIN public.vehicles v ON v.id = t.vehicle_id
  LEFT JOIN public.profiles p ON p.id = t.importer_id
  WHERE t.public_tracking_token = _token
    AND t.is_public = true
    AND t.tracking_enabled = true
  LIMIT 1;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_tracking(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_tracking(TEXT) TO anon, authenticated;