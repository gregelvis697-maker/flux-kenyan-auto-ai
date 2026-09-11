import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sparkles, Pencil, Trash2, Car, Plus } from 'lucide-react';
import { useBuyerPreferences, useFlushGuestPreferences } from '@/hooks/useBuyerPreferences';
import { rankVehicles, type MatchableVehicle } from '@/lib/preferenceMatching';
import { formatKes, labelFor } from '@/lib/buildQuestions';

interface Row extends MatchableVehicle {
  id: string;
  photos: string[] | null;
  created_at: string;
}

export function MyPerfectVehicleTab() {
  useFlushGuestPreferences();
  const navigate = useNavigate();
  const { preferences, loading, toggleActive, remove } = useBuyerPreferences();
  const [vehicles, setVehicles] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select(
            'id, make, model, year, price, fuel_type, transmission, body_type, description, price_on_request, photos, created_at',
          )
          .eq('is_sold', false)
          .order('created_at', { ascending: false })
          .limit(200);
        setVehicles((data || []) as unknown as Row[]);
      } catch (e) {
        console.error('Unable to load vehicles for matching', e);
        setVehicles([]);
      }
    })();
  }, []);

  const activeProfiles = preferences.filter((p) => p.is_active);

  const matches = useMemo(() => {
    if (activeProfiles.length === 0) return [];
    return rankVehicles(activeProfiles[0], vehicles).slice(0, 12);
  }, [activeProfiles, vehicles]);

  const insights = useMemo(() => {
    if (matches.length === 0) return null;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const recent = matches.filter((m) => new Date(m.created_at).getTime() > weekAgo).length;
    const priced = matches.filter((m) => !m.price_on_request && m.price);
    const avg = priced.length
      ? Math.round(priced.reduce((s, m) => s + (m.price || 0), 0) / priced.length)
      : null;
    return { recent, avg };
  }, [matches]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading your profiles…</p>;
  }

  if (preferences.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardContent className="py-14 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="font-medium text-foreground">You haven't built a profile yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Answer a few questions and we'll surface the cars that fit you.
          </p>
          <Button onClick={() => navigate('/build')} className="gap-2">
            <Sparkles className="h-4 w-4" /> Build my perfect vehicle
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">My Perfect Vehicle</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your saved profiles and the cars that match them right now
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/build')} className="gap-2">
          <Plus className="h-4 w-4" /> New profile
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {preferences.map((p) => (
          <Card key={p.id} className="bg-card/60 backdrop-blur-lg border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{p.profile_name || 'Saved profile'}</CardTitle>
                  <CardDescription className="mt-1">
                    {[
                      labelFor('vehicle_type', p.vehicle_type),
                      p.year_min || p.year_max ? `${p.year_min ?? '—'}–${p.year_max ?? '—'}` : null,
                      p.price_min || p.price_max
                        ? `${formatKes(p.price_min)}–${formatKes(p.price_max)}`
                        : null,
                      labelFor('vibe', p.vibe),
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Flexible on everything'}
                  </CardDescription>
                </div>
                <Switch
                  checked={p.is_active}
                  onCheckedChange={(v) => toggleActive(p.id, v)}
                  aria-label="Use this profile"
                />
              </div>
            </CardHeader>
            <CardContent className="flex gap-2 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate(`/build?edit=${p.id}`)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your answers will be removed and we'll stop matching cars against them.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove(p.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {insights && (
        <p className="text-sm text-muted-foreground">
          {insights.recent > 0
            ? `${insights.recent} matching vehicle${insights.recent === 1 ? '' : 's'} added in the last week.`
            : 'No new matches this week.'}
          {insights.avg ? ` Average price of your matches: ${formatKes(insights.avg)}.` : ''}
        </p>
      )}

      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Current matches</CardTitle>
          <CardDescription>Scored against your active profile</CardDescription>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="text-center py-10">
              <Car className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">
                No perfect matches yet — we'll show them here the moment one appears.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/vehicles/${v.id}`)}
                  className="text-left rounded-xl border border-border/50 overflow-hidden bg-card/60 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="aspect-video bg-muted/30 relative">
                    {v.photos?.[0] ? (
                      <img
                        src={v.photos[0]}
                        alt={`${v.make} ${v.model}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
                      {v.match.score}% {v.match.label}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-foreground">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-sm text-primary font-bold mt-0.5">
                      {v.price_on_request || !v.price ? 'Call for price' : formatKes(v.price)}
                    </p>
                    {v.match.reasons[0] && (
                      <p className="text-xs text-muted-foreground mt-1">{v.match.reasons[0]}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MyPerfectVehicleTab;
