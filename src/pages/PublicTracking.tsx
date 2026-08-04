import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Phone, Mail, Search } from 'lucide-react';
import { TrackingService } from '@/services/trackingService';
import { TrackingProgressBar } from '@/components/tracking/TrackingProgressBar';
import { TrackingTimeline, TrackingUpdateRecord } from '@/components/tracking/TrackingTimeline';
import { TrackingMap, TrackingMapPoint } from '@/components/tracking/TrackingMap';
import { getStageLabel } from '@/lib/trackingStages';

interface PublicTrackingData {
  vehicle: { id: string; year: number; make: string; model: string; price: number | null; photo: string | null };
  tracking: {
    current_stage: string;
    tracking_status: string;
    delay_reason: string | null;
    order_date: string | null;
    estimated_delivery_date: string | null;
    actual_delivery_date: string | null;
    updates: (TrackingUpdateRecord & {
      location_latitude: number | null;
      location_longitude: number | null;
    })[];
  };
  importer: {
    name: string | null;
    city: string | null;
    whatsapp_number: string | null;
    phone_number: string | null;
    email_public: string | null;
  } | null;
}

export default function PublicTracking() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicTrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const { data: result, error } = await supabase.rpc('get_public_tracking', { _token: token ?? '' });
        if (error) throw error;
        if (!cancelled) setData((result as unknown as PublicTrackingData) ?? null);
      } catch (err) {
        console.error('Public tracking lookup failed:', err);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const mapPoints: TrackingMapPoint[] = useMemo(() => {
    const updates = data?.tracking?.updates ?? [];
    return updates
      .filter((u) => u.location_latitude != null && u.location_longitude != null)
      .map((u, i, arr) => ({
        label: `${getStageLabel(u.stage)}${u.location_text ? ` — ${u.location_text}` : ''}`,
        latitude: u.location_latitude as number,
        longitude: u.location_longitude as number,
        isCurrent: i === arr.length - 1,
      }));
  }, [data]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-50" />
          <h1 className="text-2xl font-semibold text-foreground">Tracking link not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This tracking link is invalid or is no longer shared publicly. Ask your importer for an updated link.
          </p>
          <Button asChild className="mt-6">
            <Link to="/marketplace">Browse the marketplace</Link>
          </Button>
        </div>
      </main>
    );
  }

  const { vehicle, tracking, importer } = data;

  return (
    <main className="min-h-screen bg-background/80 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Flux Vehicle Tracking</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
        </header>

        {vehicle.photo && (
          <img
            src={vehicle.photo}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            loading="lazy"
            className="h-48 w-full rounded-lg border border-border/40 object-cover sm:h-64"
          />
        )}

        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TrackingProgressBar currentStage={tracking.current_stage} />
            {tracking.estimated_delivery_date && (
              <p className="text-sm text-muted-foreground">
                Estimated arrival:{' '}
                <span className="font-medium text-foreground">
                  {TrackingService.formatETA(new Date(tracking.estimated_delivery_date))}
                </span>
              </p>
            )}
            {tracking.tracking_status === 'delayed' && (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                Delayed{tracking.delay_reason ? `: ${tracking.delay_reason}` : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TrackingTimeline updates={tracking.updates} />
            <TrackingMap points={mapPoints} />
          </CardContent>
        </Card>

        {importer && (importer.whatsapp_number || importer.phone_number || importer.email_public) && (
          <Card className="bg-card/60 backdrop-blur-lg border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Your importer{importer.name ? `: ${importer.name}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row">
              {importer.whatsapp_number && (
                <Button asChild className="w-full sm:w-auto">
                  <a
                    href={`https://wa.me/${importer.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              )}
              {importer.phone_number && (
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <a href={`tel:${importer.phone_number.replace(/\s/g, '')}`}>
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </a>
                </Button>
              )}
              {importer.email_public && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href={`mailto:${importer.email_public}`}>
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
