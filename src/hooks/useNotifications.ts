import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface AppNotification {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  action_url: string | null;
  vehicle_id: string | null;
  match_score: number | null;
  read_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

const tbl = () => (supabase as any).from('notifications');

/** Loads the signed-in buyer's recent alerts and keeps them live. */
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await tbl()
        .select('id, notification_type, title, body, action_url, vehicle_id, match_score, read_at, clicked_at, created_at')
        .eq('buyer_id', user.id)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setNotifications((data || []) as AppNotification[]);
    } catch (e) {
      console.error('Unable to load notifications', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `buyer_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const ids = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (!ids.length) return;
    const stamp = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: stamp })));
    try {
      await tbl().update({ read_at: stamp }).in('id', ids);
    } catch (e) {
      console.error('Unable to mark alerts read', e);
    }
  }, [user, notifications]);

  const markClicked = useCallback(async (id: string) => {
    const stamp = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at || stamp, clicked_at: stamp } : n)),
    );
    try {
      await tbl().update({ read_at: stamp, clicked_at: stamp }).eq('id', id);
    } catch (e) {
      console.error('Unable to update alert', e);
    }
  }, []);

  return { notifications, unreadCount, loading, reload: load, markAllRead, markClicked };
}
