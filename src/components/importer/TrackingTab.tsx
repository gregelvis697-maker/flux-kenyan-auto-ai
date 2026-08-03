import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Loader2, Plus, Ship } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TRACKING_STAGES, TrackingStage, getStageIcon, getStageLabel } from '@/lib/trackingStages';
import { TrackingService } from '@/services/trackingService';
import { TrackingTimeline, TrackingUpdateRecord } from '@/components/tracking/TrackingTimeline';
import { TrackingProgressBar } from '@/components/tracking/TrackingProgressBar';
import { TrackingMap, TrackingMapPoint } from '@/components/tracking/TrackingMap';

interface TrackingRow {
  id: string;
  vehicle_id: string;
  current_stage: string;
  tracking_enabled: boolean;
  is_public: boolean;
  public_tracking_token: string | null;
  estimated_delivery_date: string | null;
  tracking_status: string;
}

interface VehicleRow {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface UpdateRow extends TrackingUpdateRecord {
  tracking_id: string;
  location_latitude: number | null;
  location_longitude: number | null;
}

export function TrackingTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [trackings, setTrackings] = useState<Record<string, TrackingRow>>({});
  const [updates, setUpdates] = useState<UpdateRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    stage: TrackingStage.ORIGIN as string,
    location_text: '',
    notes: '',
    status: 'completed' as 'completed' | 'in_progress' | 'delayed',
  });

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: vehicleRows } = await supabase
        .from('vehicles')
        .select('id, make, model, year, dealer_import_requests!inner(importer_id)')
        .eq('dealer_import_requests.importer_id', user.id)
        .order('created_at', { ascending: false });

      const list: VehicleRow[] = (vehicleRows || []).map((v: any) => ({
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year,
      }));

      const { data: trackingRows } = await supabase
        .from('vehicle_tracking')
        .select('*')
        .eq('importer_id', user.id);

      const map: Record<string, TrackingRow> = {};
      (trackingRows || []).forEach((t: any) => {
        map[t.vehicle_id] = t as TrackingRow;
      });

      const trackingIds = (trackingRows || []).map((t: any) => t.id);
      let updateRows: UpdateRow[] = [];
      if (trackingIds.length > 0) {
        const { data } = await supabase
          .from('vehicle_tracking_updates')
          .select('*')
          .in('tracking_id', trackingIds)
          .order('created_at', { ascending: true });
        updateRows = (data || []) as unknown as UpdateRow[];
      }

      setVehicles(list);
      setTrackings(map);
      setUpdates(updateRows);
      setSelectedId((prev) => prev ?? list[0]?.id ?? null);
    } catch (err) {
      console.error('Failed to load tracking data:', err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedId) || null;
  const selectedTracking = selectedId ? trackings[selectedId] : undefined;
  const selectedUpdates = useMemo(
    () => (selectedTracking ? updates.filter((u) => u.tracking_id === selectedTracking.id) : []),
    [updates, selectedTracking]
  );

  const mapPoints: TrackingMapPoint[] = useMemo(
    () =>
      selectedUpdates
        .filter((u) => u.location_latitude != null && u.location_longitude != null)
        .map((u, i, arr) => ({
          label: `${getStageLabel(u.stage)}${u.location_text ? ` — ${u.location_text}` : ''}`,
          latitude: u.location_latitude as number,
          longitude: u.location_longitude as number,
          isCurrent: i === arr.length - 1,
        })),
    [selectedUpdates]
  );

  const ensureTracking = async (vehicleId: string): Promise<TrackingRow | null> => {
    if (!user) return null;
    const existing = trackings[vehicleId];
    if (existing) return existing;
    const { data, error } = await supabase
      .from('vehicle_tracking')
      .insert({
        vehicle_id: vehicleId,
        importer_id: user.id,
        current_stage: TrackingStage.ORDER_CONFIRMED,
        order_date: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      console.error('Failed to create tracking:', error);
      return null;
    }
    const row = data as unknown as TrackingRow;
    setTrackings((prev) => ({ ...prev, [vehicleId]: row }));
    return row;
  };

  const patchTracking = async (trackingId: string, vehicleId: string, patch: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('vehicle_tracking')
      .update(patch)
      .eq('id', trackingId)
      .select()
      .single();
    if (error) {
      console.error('Failed to update tracking:', error);
      toast({ title: 'Could not save', description: 'Please try again.', variant: 'destructive' });
      return;
    }
    setTrackings((prev) => ({ ...prev, [vehicleId]: data as unknown as TrackingRow }));
  };

  const handleToggleTracking = async (vehicleId: string, enabled: boolean) => {
    const tracking = await ensureTracking(vehicleId);
    if (!tracking) return;
    await patchTracking(tracking.id, vehicleId, { tracking_enabled: enabled });
  };

  const handleTogglePublic = async (vehicleId: string, isPublic: boolean) => {
    const tracking = trackings[vehicleId];
    if (!tracking) return;
    const patch: Record<string, unknown> = { is_public: isPublic };
    if (isPublic && !tracking.public_tracking_token) {
      patch.public_tracking_token = TrackingService.generateTrackingToken();
    }
    await patchTracking(tracking.id, vehicleId, patch);
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/track/${token}`;
    navigator.clipboard?.writeText(link);
    toast({ title: 'Link copied', description: 'Share it with your buyer.' });
  };

  const handleAddUpdate = async () => {
    if (!selectedVehicle || !user) return;
    if (!form.location_text.trim()) {
      toast({ title: 'Location required', description: 'Enter where the vehicle is now.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const tracking = await ensureTracking(selectedVehicle.id);
      if (!tracking) throw new Error('no tracking row');

      const geo = await TrackingService.geocodeTrackingLocation(form.location_text);

      const { error } = await supabase.from('vehicle_tracking_updates').insert({
        tracking_id: tracking.id,
        stage: form.stage,
        stage_label: getStageLabel(form.stage),
        location_text: form.location_text.trim(),
        location_latitude: geo?.latitude ?? null,
        location_longitude: geo?.longitude ?? null,
        location_geocoded_at: geo?.geocoded_at ?? null,
        status: form.status,
        notes: form.notes.trim() || null,
        created_by: user.id,
      });
      if (error) throw error;

      const eta = TrackingService.calculateETA(form.stage, new Date());
      await patchTracking(tracking.id, selectedVehicle.id, {
        current_stage: form.stage,
        estimated_delivery_date: eta.toISOString(),
        tracking_status:
          form.stage === TrackingStage.DELIVERED
            ? 'delivered'
            : form.status === 'delayed'
            ? 'delayed'
            : 'in_progress',
        ...(form.stage === TrackingStage.DELIVERED ? { actual_delivery_date: new Date().toISOString() } : {}),
      });

      toast({ title: 'Update added', description: 'Tracking timeline updated.' });
      setForm({ stage: TrackingStage.ORIGIN, location_text: '', notes: '', status: 'completed' });
      setShowForm(false);
      await load();
    } catch (err) {
      console.error('Failed to add tracking update:', err);
      toast({ title: 'Could not save update', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardContent className="py-12 text-center">
          <Ship className="mx-auto mb-3 h-8 w-8 text-muted-foreground opacity-50" />
          <p className="font-medium text-foreground">No trackable vehicles yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vehicles appear here once an import you handle has been received into inventory.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr] lg:gap-6">
      {/* Vehicle list */}
      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">My Vehicles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[320px] overflow-y-auto lg:max-h-[70vh]">
            {vehicles.map((v) => {
              const t = trackings[v.id];
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={cn(
                    'w-full border-b border-border/40 p-4 text-left transition-colors hover:bg-muted/40 min-h-[48px]',
                    selectedId === v.id && 'bg-primary/10 border-l-2 border-l-primary'
                  )}
                >
                  <p className="text-sm font-medium text-foreground">
                    {v.year} {v.make} {v.model}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t ? `${getStageIcon(t.current_stage)} ${getStageLabel(t.current_stage)}` : 'Tracking not started'}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail */}
      <div className="space-y-4">
        {selectedVehicle && (
          <Card className="bg-card/60 backdrop-blur-lg border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <Label htmlFor="tracking-enabled" className="text-sm">Enable tracking</Label>
                  <Switch
                    id="tracking-enabled"
                    checked={!!selectedTracking?.tracking_enabled}
                    onCheckedChange={(c) => handleToggleTracking(selectedVehicle.id, c)}
                  />
                </div>
                {selectedTracking?.tracking_enabled && (
                  <div className="flex items-center justify-between gap-3 sm:justify-start">
                    <Label htmlFor="tracking-public" className="text-sm">Public tracking link</Label>
                    <Switch
                      id="tracking-public"
                      checked={!!selectedTracking.is_public}
                      onCheckedChange={(c) => handleTogglePublic(selectedVehicle.id, c)}
                    />
                  </div>
                )}
              </div>

              {selectedTracking?.is_public && selectedTracking.public_tracking_token && (
                <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Shareable tracking link</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      readOnly
                      value={`${window.location.origin}/track/${selectedTracking.public_tracking_token}`}
                      className="text-xs"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => copyLink(selectedTracking.public_tracking_token as string)}
                      className="shrink-0"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  </div>
                </div>
              )}

              {selectedTracking && (
                <>
                  <TrackingProgressBar currentStage={selectedTracking.current_stage} />
                  {selectedTracking.estimated_delivery_date && (
                    <p className="text-sm text-muted-foreground">
                      Estimated arrival:{' '}
                      <span className="font-medium text-foreground">
                        {TrackingService.formatETA(new Date(selectedTracking.estimated_delivery_date))}
                      </span>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tracking Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TrackingTimeline updates={selectedUpdates} />
            <TrackingMap points={mapPoints} />

            <Button className="w-full" onClick={() => setShowForm((s) => !s)}>
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? 'Cancel' : 'Add tracking update'}
            </Button>

            {showForm && (
              <div className="space-y-4 rounded-lg border border-border/40 bg-muted/20 p-4">
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRACKING_STAGES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.icon} {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loc">Location</Label>
                  <Input
                    id="loc"
                    value={form.location_text}
                    onChange={(e) => setForm({ ...form, location_text: e.target.value })}
                    placeholder="e.g., Yokohama Port, Japan"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any details about this update"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={handleAddUpdate} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save update
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
