import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Plus, Trash2, Building2 } from 'lucide-react';
import { GeocodingService } from '@/services/geocodingService';

interface DealerLocationRow {
  id: string;
  location_name: string | null;
  street_address: string;
  city: string;
  location_latitude: number | null;
  location_longitude: number | null;
  phone: string | null;
  opening_hours: string | null;
  is_active: boolean;
}

interface DealerLocationsCardProps {
  userId: string;
}

export function DealerLocationsCard({ userId }: DealerLocationsCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<DealerLocationRow[]>([]);
  const [form, setForm] = useState({
    location_name: '',
    street_address: '',
    city: '',
    phone: '',
    opening_hours: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dealer_locations' as any)
        .select('id, location_name, street_address, city, location_latitude, location_longitude, phone, opening_hours, is_active')
        .eq('dealer_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setRows((data as any) || []);
    } catch (err) {
      console.error('Load locations error:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setFormError(null);
    const street = form.street_address.trim();
    const city = form.city.trim();
    if (!street || !city) {
      setFormError('Street address and city are required.');
      return;
    }
    setSaving(true);
    try {
      const geo = await GeocodingService.geocodeAddress(
        GeocodingService.formatAddress(street, city)
      );

      const insertPayload: Record<string, unknown> = {
        dealer_id: userId,
        location_name: form.location_name.trim() || null,
        street_address: street,
        city,
        phone: form.phone.trim() || null,
        opening_hours: form.opening_hours.trim() || null,
        is_active: true,
        is_primary: false,
      };
      if (geo.success) {
        insertPayload.location_latitude = geo.latitude;
        insertPayload.location_longitude = geo.longitude;
      }

      const { error } = await supabase.from('dealer_locations' as any).insert(insertPayload);
      if (error) throw error;

      if (!geo.success) {
        setFormError(geo.error || 'Saved, but we couldn\u2019t place it on the map. Try a nearby landmark.');
      }
      setForm({ location_name: '', street_address: '', city: '', phone: '', opening_hours: '' });
      await load();
      toast({
        title: '📍 Branch added',
        description: geo.success
          ? 'This location is now visible to buyers on the map.'
          : 'Saved without map coordinates — edit the address to retry.',
      });
    } catch (err: any) {
      console.error('Add location error:', err);
      setFormError(err.message || 'Failed to add location.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this branch?')) return;
    try {
      const { error } = await supabase.from('dealer_locations' as any).delete().eq('id', id);
      if (error) throw error;
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      console.error('Delete location error:', err);
      toast({ title: 'Error', description: 'Failed to remove location.', variant: 'destructive' });
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-lg border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Additional Locations
        </CardTitle>
        <CardDescription>
          Add extra branches so buyers see all of your showrooms on the map.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No additional branches yet.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {r.location_name || 'Branch'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {r.street_address}, {r.city}
                  </div>
                  {r.location_latitude == null && (
                    <div className="text-xs text-amber-500 mt-1">Not yet placed on map</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(r.id)}
                  aria-label="Delete branch"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-border/40 p-4 space-y-3">
          <div className="text-sm font-medium text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add a branch
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loc-name">Branch name</Label>
              <Input
                id="loc-name"
                value={form.location_name}
                onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                placeholder="e.g. Mombasa Branch"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-phone">Phone (optional)</Label>
              <Input
                id="loc-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+254…"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="loc-street">Street address *</Label>
              <Input
                id="loc-street"
                value={form.street_address}
                onChange={(e) => setForm({ ...form, street_address: e.target.value })}
                placeholder="e.g. Nyali Road"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-city">City *</Label>
              <Input
                id="loc-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Mombasa"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-hours">Opening hours</Label>
              <Input
                id="loc-hours"
                value={form.opening_hours}
                onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
                placeholder="e.g. 9am–6pm Mon–Sat"
                className="h-10"
              />
            </div>
          </div>

          {formError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              ⚠️ {formError}
            </div>
          )}

          <Button onClick={handleAdd} disabled={saving} className="w-full sm:w-auto gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            Save branch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
