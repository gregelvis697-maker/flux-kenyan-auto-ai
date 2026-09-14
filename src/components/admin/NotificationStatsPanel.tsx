import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Send, MousePointerClick } from 'lucide-react';

interface Stats {
  created: number;
  delivered: number;
  clicked: number;
  by_type: { type: string; total: number }[];
}

const pretty = (s: string) => (s ? s.replace(/_/g, ' ') : 'other');

export function NotificationStatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await (supabase as any).rpc('get_notification_stats');
        if (error) throw error;
        if (active) setStats(data as Stats);
      } catch (e) {
        console.error('Unable to load alert stats', e);
        if (active) setStats(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!stats) return null;

  const items = [
    { label: 'Alerts created', value: stats.created, Icon: Bell },
    { label: 'Delivered', value: stats.delivered, Icon: Send },
    { label: 'Clicked', value: stats.clicked, Icon: MousePointerClick },
  ];

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader>
        <CardTitle className="text-lg">Alert delivery (last 30 days)</CardTitle>
        <CardDescription>Aggregate totals only — no individual buyers are shown.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-lg bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                <Icon className="h-3.5 w-3.5" /> {label}
              </div>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
        {(stats.by_type || []).length > 0 && (
          <div className="space-y-1">
            {stats.by_type.map((r) => (
              <div key={r.type} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{pretty(r.type)}</span>
                <span className="font-semibold">{r.total}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
