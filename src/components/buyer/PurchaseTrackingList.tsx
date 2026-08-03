import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { TrackingService } from '@/services/trackingService';
import { TrackingProgressBar } from '@/components/tracking/TrackingProgressBar';
import { TrackingTimeline, TrackingUpdateRecord } from '@/components/tracking/TrackingTimeline';

interface PurchaseTracking {
  id: string;
  current_stage: string;
  estimated_delivery_date: string | null;
  tracking_status: string;
  delay_reason: string | null;
  vehicle: { id: string; make: string; model: string; year: number; price: number | null } | null;
  updates: TrackingUpdateRecord[];
}

export function PurchaseTrackingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<PurchaseTracking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: trackingRows } = await supabase
        .from('vehicle_tracking')
        .select('id, current_stage, estimated_delivery_date, tracking_status, delay_reason, vehicles(id, make, model, year, price)')
        .eq('buyer_id', user.id)
        .eq('tracking_enabled', true)
        .order('created_at', { ascending: false });

      const ids = (trackingRows || []).map((t: any) => t.id);
      let updates: any[] = [];
      if (ids.length > 0) {
        const { data } = await supabase
          .from('vehicle_tracking_updates')
          .select('*')
          .in('tracking_id', ids)
          .order('created_at', { ascending: true });
        updates = data || [];
      }

      setItems(
        (trackingRows || []).map((t: any) => ({
          id: t.id,
          current_stage: t.current_stage,
          estimated_delivery_date: t.estimated_delivery_date,
          tracking_status: t.tracking_status,
          delay_reason: t.delay_reason,
          vehicle: t.vehicles ?? null,
          updates: updates.filter((u) => u.tracking_id === t.id),
        }))
      );
    } catch (err) {
      console.error('Failed to load purchase tracking:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || items.length === 0) return null;

  return (
    <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Package className="h-5 w-5 text-primary" />
          Purchase Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="font-semibold text-foreground">
                {item.vehicle ? `${item.vehicle.year} ${item.vehicle.make} ${item.vehicle.model}` : 'Vehicle'}
              </p>
              {item.estimated_delivery_date && (
                <p className="text-sm text-muted-foreground">
                  Estimated arrival:{' '}
                  <span className="font-medium text-foreground">
                    {TrackingService.formatETA(new Date(item.estimated_delivery_date))}
                  </span>
                </p>
              )}
            </div>

            <TrackingProgressBar currentStage={item.current_stage} />

            {item.tracking_status === 'delayed' && (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                Delayed{item.delay_reason ? `: ${item.delay_reason}` : ''}
              </p>
            )}

            <TrackingTimeline updates={item.updates} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
