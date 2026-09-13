REVOKE EXECUTE ON FUNCTION public.enqueue_new_vehicle_notification() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.track_vehicle_price_change() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enqueue_tracking_notification() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_notification_stats() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_demand_summary() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_notification_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_demand_summary() TO authenticated;