CREATE TABLE public.buyer_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name text NOT NULL DEFAULT 'My Perfect Vehicle',
  vehicle_type text,
  year_min integer,
  year_max integer,
  price_min numeric,
  price_max numeric,
  mileage_preference text,
  primary_use_case text,
  commute_distance_km integer,
  vibe text,
  maintenance_budget_range text,
  include_in_transit_vehicles boolean NOT NULL DEFAULT true,
  transmission_preference text,
  fuel_type_preference text,
  preferred_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  interior_vibe text,
  fuel_efficiency_importance text,
  purchase_timeline text,
  notification_preference text NOT NULL DEFAULT 'weekly',
  trust_priorities jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_preferences TO authenticated;
GRANT ALL ON public.buyer_preferences TO service_role;

ALTER TABLE public.buyer_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers view own preferences"
  ON public.buyer_preferences FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Buyers insert own preferences"
  ON public.buyer_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers update own preferences"
  ON public.buyer_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers delete own preferences"
  ON public.buyer_preferences FOR DELETE TO authenticated
  USING (auth.uid() = buyer_id);

CREATE INDEX idx_buyer_preferences_buyer ON public.buyer_preferences(buyer_id);
CREATE INDEX idx_buyer_preferences_active ON public.buyer_preferences(is_active);

CREATE TRIGGER trg_buyer_preferences_updated_at
  BEFORE UPDATE ON public.buyer_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.get_demand_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can view demand data';
  END IF;

  SELECT jsonb_build_object(
    'total_profiles', (SELECT count(*) FROM public.buyer_preferences WHERE is_active),
    'by_type', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT COALESCE(vehicle_type, 'unspecified') AS vehicle_type,
               count(*)::int AS buyers,
               round(avg((price_min + price_max) / 2.0))::numeric AS avg_budget,
               (SELECT count(*)::int FROM public.vehicles v
                 WHERE v.is_sold = false
                   AND lower(COALESCE(v.body_type, '')) = lower(COALESCE(bp.vehicle_type, ''))) AS supply
        FROM public.buyer_preferences bp
        WHERE is_active
        GROUP BY vehicle_type
        ORDER BY count(*) DESC
      ) t
    ), '[]'::jsonb),
    'by_timeline', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT COALESCE(purchase_timeline, 'unspecified') AS timeline, count(*)::int AS buyers
        FROM public.buyer_preferences WHERE is_active
        GROUP BY purchase_timeline ORDER BY count(*) DESC
      ) t
    ), '[]'::jsonb),
    'by_vibe', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT COALESCE(vibe, 'unspecified') AS vibe, count(*)::int AS buyers
        FROM public.buyer_preferences WHERE is_active
        GROUP BY vibe ORDER BY count(*) DESC
      ) t
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_demand_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_demand_summary() TO authenticated;