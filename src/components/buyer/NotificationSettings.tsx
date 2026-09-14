import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BellOff, Loader2 } from 'lucide-react';

interface Prefs {
  frequency_tier: string;
  notification_enabled: boolean;
  in_app_enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  notify_new_vehicle: boolean;
  notify_price_drop: boolean;
  notify_tracked_updates: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
  daily_digest_hour: number;
  weekly_digest_day: number;
  snoozed_until: string | null;
}

const DEFAULTS: Prefs = {
  frequency_tier: 'seriously_considering',
  notification_enabled: true,
  in_app_enabled: true,
  email_enabled: true,
  whatsapp_enabled: false,
  notify_new_vehicle: true,
  notify_price_drop: true,
  notify_tracked_updates: true,
  quiet_hours_start: 22,
  quiet_hours_end: 7,
  daily_digest_hour: 8,
  weekly_digest_day: 0,
  snoozed_until: null,
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hours = Array.from({ length: 24 }, (_, i) => i);
const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;

const tbl = () => (supabase as any).from('notification_preferences');

export function NotificationSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await tbl().select('*').eq('buyer_id', user.id).maybeSingle();
        if (data) setPrefs({ ...DEFAULTS, ...data });
      } catch (e) {
        console.error('Unable to load notification settings', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const persist = async (next: Prefs) => {
    if (!user) return;
    setPrefs(next);
    setSaving(true);
    try {
      const { snoozed_until, ...rest } = next;
      await tbl().upsert({ buyer_id: user.id, snoozed_until, ...rest }, { onConflict: 'buyer_id' });
    } catch (e) {
      console.error('Unable to save notification settings', e);
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => persist({ ...prefs, [key]: value });

  const snooze = (ms: number | null) =>
    persist({ ...prefs, snoozed_until: ms ? new Date(Date.now() + ms).toISOString() : null });

  if (loading) {
    return <div className="h-64 rounded-lg bg-muted/40 animate-pulse" />;
  }

  const snoozedActive = prefs.snoozed_until && new Date(prefs.snoozed_until) > new Date();

  const row = (label: string, hint: string, key: keyof Prefs) => (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch
        checked={Boolean(prefs[key])}
        onCheckedChange={(v) => set(key, v as Prefs[typeof key])}
      />
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose what you hear about and when.
          </p>
        </div>
        {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mt-2" />}
      </div>

      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Alerts</CardTitle>
          <CardDescription>Turn everything off with one switch.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border/40">
          {row('Alerts on', 'Master switch for every alert', 'notification_enabled')}
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <Label className="text-sm font-medium">How often</Label>
              <p className="text-xs text-muted-foreground">Instant, one daily summary, or weekly</p>
            </div>
            <Select value={prefs.frequency_tier} onValueChange={(v) => set('frequency_tier', v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="actively_looking">As they happen</SelectItem>
                <SelectItem value="seriously_considering">Daily summary</SelectItem>
                <SelectItem value="planning_ahead">Weekly summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Where to reach you</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/40">
          {row('In the app', 'Shown on the bell in the top bar', 'in_app_enabled')}
          {row('Email', 'Daily and weekly summaries', 'email_enabled')}
          {row(
            'WhatsApp',
            'Adds a one-tap "send to WhatsApp" button on each alert',
            'whatsapp_enabled',
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">What to tell you about</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/40">
          {row('New matches', 'Listings that fit your saved profile', 'notify_new_vehicle')}
          {row('Price drops', 'Vehicles you saved or viewed recently', 'notify_price_drop')}
          {row('Shipment updates', 'Progress on vehicles on their way', 'notify_tracked_updates')}
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Timing</CardTitle>
          <CardDescription>Nothing is sent during your quiet hours.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-sm">Quiet from</Label>
            <Select
              value={String(prefs.quiet_hours_start)}
              onValueChange={(v) => set('quiet_hours_start', Number(v))}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {hours.map((h) => <SelectItem key={h} value={String(h)}>{hourLabel(h)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Quiet until</Label>
            <Select
              value={String(prefs.quiet_hours_end)}
              onValueChange={(v) => set('quiet_hours_end', Number(v))}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {hours.map((h) => <SelectItem key={h} value={String(h)}>{hourLabel(h)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Daily summary time</Label>
            <Select
              value={String(prefs.daily_digest_hour)}
              onValueChange={(v) => set('daily_digest_hour', Number(v))}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {hours.map((h) => <SelectItem key={h} value={String(h)}>{hourLabel(h)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Weekly summary day</Label>
            <Select
              value={String(prefs.weekly_digest_day)}
              onValueChange={(v) => set('weekly_digest_day', Number(v))}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BellOff className="h-4 w-4" /> Pause alerts
          </CardTitle>
          <CardDescription>
            {snoozedActive
              ? `Paused until ${new Date(prefs.snoozed_until as string).toLocaleString()}`
              : 'Take a break without losing your settings.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => snooze(24 * 3600 * 1000)}>24 hours</Button>
          <Button variant="outline" size="sm" onClick={() => snooze(7 * 24 * 3600 * 1000)}>1 week</Button>
          <Button variant="outline" size="sm" onClick={() => snooze(30 * 24 * 3600 * 1000)}>1 month</Button>
          {snoozedActive && (
            <Button variant="ghost" size="sm" onClick={() => snooze(null)}>Resume now</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
