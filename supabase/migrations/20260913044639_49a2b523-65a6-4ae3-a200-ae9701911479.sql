-- 1. Multi-select answers on buyer_preferences
ALTER TABLE public.buyer_preferences
  ALTER COLUMN vehicle_type TYPE text[] USING CASE WHEN vehicle_type IS NULL THEN NULL ELSE ARRAY[vehicle_type] END,
  ALTER COLUMN mileage_preference TYPE text[] USING CASE WHEN mileage_preference IS NULL THEN NULL ELSE ARRAY[mileage_preference] END,
  ALTER COLUMN primary_use_case TYPE text[] USING CASE WHEN primary_use_case IS NULL THEN NULL ELSE ARRAY[primary_use_case] END,
  ALTER COLUMN vibe TYPE text[] USING CASE WHEN vibe IS NULL THEN NULL ELSE ARRAY[vibe] END,
  ALTER COLUMN maintenance_budget_range TYPE text[] USING CASE WHEN maintenance_budget_range IS NULL THEN NULL ELSE ARRAY[maintenance_budget_range] END,
  ALTER COLUMN transmission_preference TYPE text[] USING CASE WHEN transmission_preference IS NULL THEN NULL ELSE ARRAY[transmission_preference] END,
  ALTER COLUMN fuel_type_preference TYPE text[] USING CASE WHEN fuel_type_preference IS NULL THEN NULL ELSE ARRAY[fuel_type_preference] END,
  ALTER COLUMN interior_vibe TYPE text[] USING CASE WHEN interior_vibe IS NULL THEN NULL ELSE ARRAY[interior_vibe] END,
  ALTER COLUMN fuel_efficiency_importance TYPE text[] USING CASE WHEN fuel_efficiency_importance IS NULL THEN NULL ELSE ARRAY[fuel_efficiency_importance] END;

-- 2. Notification preferences
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_tier text NOT NULL DEFAULT 'seriously_considering',
  notification_enabled boolean NOT NULL DEFAULT true,
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  in_app_enabled boolean NOT NULL DEFAULT true,
  email_enabled boolean NOT NULL DEFAULT true,
  quiet_hours_start smallint NOT NULL DEFAULT 22,
  quiet_hours_end smallint NOT NULL DEFAULT 7,
  daily_digest_hour smallint NOT NULL DEFAULT 8,
  weekly_digest_day smallint NOT NULL DEFAULT 0,
  notify_new_vehicle boolean NOT NULL DEFAULT true,
  notify_price_drop boolean NOT NULL DEFAULT true,
  notify_tracked_updates boolean NOT NULL DEFAULT true,
  snoozed_until timestamptz,
  last_clicked_at timestamptz,
  last_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers manage own notification settings" ON public.notification_preferences
  FOR ALL TO authenticated USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());
CREATE TRIGGER trg_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
  preference_id uuid REFERENCES public.buyer_preferences(id) ON DELETE SET NULL,
  match_score integer,
  title text NOT NULL,
  body text NOT NULL,
  action_url text,
  channel text NOT NULL DEFAULT 'in_app',
  status text NOT NULL DEFAULT 'pending',
  dedupe_key text,
  sent_at timestamptz,
  read_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX notifications_dedupe_idx ON public.notifications (buyer_id, dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX notifications_buyer_created_idx ON public.notifications (buyer_id, created_at DESC);
CREATE INDEX notifications_status_idx ON public.notifications (status, created_at);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (buyer_id = auth.uid());
CREATE POLICY "Buyers update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Buyers delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (buyer_id = auth.uid());

-- 4. Price history
CREATE TABLE public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  price_previous numeric,
  price_change_percent numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX price_history_vehicle_idx ON public.price_history (vehicle_id, created_at DESC);
GRANT SELECT ON public.price_history TO authenticated, anon;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Price history is public" ON public.price_history FOR SELECT USING (true);

-- 5. Vehicle views
CREATE TABLE public.vehicle_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, vehicle_id)
);
CREATE INDEX vehicle_views_recent_idx ON public.vehicle_views (viewed_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_views TO authenticated;
GRANT ALL ON public.vehicle_views TO service_role;
ALTER TABLE public.vehicle_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers manage own views" ON public.vehicle_views
  FOR ALL TO authenticated USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());

-- 6. Delivery log
CREATE TABLE public.notification_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.notifications(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  channel text NOT NULL,
  delivery_status text NOT NULL,
  bounce_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notification_delivery_log_created_idx ON public.notification_delivery_log (created_at DESC);
GRANT ALL ON public.notification_delivery_log TO service_role;
ALTER TABLE public.notification_delivery_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read delivery log" ON public.notification_delivery_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT ON public.notification_delivery_log TO authenticated;

-- 7. Work queue + single-flight lease
CREATE TABLE public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notification_queue_pending_idx ON public.notification_queue (created_at) WHERE processed_at IS NULL;
GRANT ALL ON public.notification_queue TO service_role;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.job_state (
  job_name text PRIMARY KEY,
  lease_until timestamptz,
  paused boolean NOT NULL DEFAULT false,
  pause_reason text,
  last_run_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.job_state TO service_role;
ALTER TABLE public.job_state ENABLE ROW LEVEL SECURITY;

-- 8. Triggers that enqueue work
CREATE OR REPLACE FUNCTION public.enqueue_new_vehicle_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_sold = false THEN
    INSERT INTO public.notification_queue (event_type, vehicle_id)
    VALUES ('new_vehicle', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_enqueue_new_vehicle AFTER INSERT ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_new_vehicle_notification();

CREATE OR REPLACE FUNCTION public.track_vehicle_price_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pct numeric;
BEGIN
  IF NEW.price IS DISTINCT FROM OLD.price AND OLD.price IS NOT NULL AND OLD.price > 0 THEN
    pct := round(((NEW.price - OLD.price) / OLD.price) * 100, 2);
    INSERT INTO public.price_history (vehicle_id, price, price_previous, price_change_percent)
    VALUES (NEW.id, NEW.price, OLD.price, pct);
    IF pct <= -5 THEN
      INSERT INTO public.notification_queue (event_type, vehicle_id, payload)
      VALUES ('price_drop', NEW.id, jsonb_build_object('old_price', OLD.price, 'new_price', NEW.price, 'percent', pct));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_track_vehicle_price_change AFTER UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.track_vehicle_price_change();

CREATE OR REPLACE FUNCTION public.enqueue_tracking_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT vehicle_id INTO v_id FROM public.vehicle_tracking WHERE id = NEW.tracking_id;
  IF v_id IS NOT NULL THEN
    INSERT INTO public.notification_queue (event_type, vehicle_id, payload)
    VALUES ('tracked_update', v_id, jsonb_build_object('stage', NEW.stage, 'stage_label', NEW.stage_label, 'tracking_id', NEW.tracking_id));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_enqueue_tracking_update AFTER INSERT ON public.vehicle_tracking_updates
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_tracking_notification();

-- 9. Admin aggregate delivery stats
CREATE OR REPLACE FUNCTION public.get_notification_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can view notification stats';
  END IF;
  SELECT jsonb_build_object(
    'created', (SELECT count(*)::int FROM public.notifications WHERE created_at > now() - interval '30 days'),
    'delivered', (SELECT count(*)::int FROM public.notifications WHERE sent_at IS NOT NULL AND created_at > now() - interval '30 days'),
    'clicked', (SELECT count(*)::int FROM public.notifications WHERE clicked_at IS NOT NULL AND created_at > now() - interval '30 days'),
    'by_type', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT notification_type AS type, count(*)::int AS total
        FROM public.notifications WHERE created_at > now() - interval '30 days'
        GROUP BY notification_type ORDER BY count(*) DESC
      ) t
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_notification_stats() FROM anon;

-- 10. Demand summary updated for array columns
CREATE OR REPLACE FUNCTION public.get_demand_summary()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can view demand data';
  END IF;

  SELECT jsonb_build_object(
    'total_profiles', (SELECT count(*) FROM public.buyer_preferences WHERE is_active),
    'by_type', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT vt AS vehicle_type,
               count(*)::int AS buyers,
               round(avg((price_min + price_max) / 2.0))::numeric AS avg_budget,
               (SELECT count(*)::int FROM public.vehicles v
                 WHERE v.is_sold = false AND lower(COALESCE(v.body_type, '')) = lower(vt)) AS supply
        FROM public.buyer_preferences bp
        CROSS JOIN LATERAL unnest(COALESCE(bp.vehicle_type, ARRAY['unspecified'])) AS vt
        WHERE bp.is_active
        GROUP BY vt
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
        SELECT vb AS vibe, count(*)::int AS buyers
        FROM public.buyer_preferences bp
        CROSS JOIN LATERAL unnest(COALESCE(bp.vibe, ARRAY['unspecified'])) AS vb
        WHERE bp.is_active
        GROUP BY vb ORDER BY count(*) DESC
      ) t
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;