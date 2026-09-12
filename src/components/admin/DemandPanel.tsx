import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface TypeRow {
  vehicle_type: string;
  buyers: number;
  avg_budget: number | null;
  supply: number;
}
interface CountRow {
  buyers: number;
  timeline?: string;
  vibe?: string;
}
interface Summary {
  total_profiles: number;
  by_type: TypeRow[];
  by_timeline: CountRow[];
  by_vibe: CountRow[];
}

const pretty = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : 'Unspecified';

export function DemandPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await (supabase as any).rpc('get_demand_summary');
        if (error) throw error;
        if (active) setSummary(data as Summary);
      } catch (e) {
        console.error('Unable to load demand summary', e);
        if (active) setSummary(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!summary || summary.total_profiles === 0) {
    return (
      <Card className="border-border/50 bg-card/60">
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground font-medium">No buyer demand data yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Insights appear once buyers complete the Build Your Perfect Vehicle questionnaire.
          </p>
        </CardContent>
      </Card>
    );
  }

  const gaps = (summary.by_type || []).filter((t) => t.buyers > t.supply);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Active buyer profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.total_profiles}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Most wanted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.by_type?.[0] ? pretty(summary.by_type[0].vehicle_type) : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Supply gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{gaps.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Types with more demand than stock</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg">Demand by vehicle type</CardTitle>
          <CardDescription>Aggregated counts only — no individual buyers are shown.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground">
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Buyers</th>
                  <th className="text-left p-4 hidden sm:table-cell">Avg budget (KES)</th>
                  <th className="text-left p-4">Listings</th>
                </tr>
              </thead>
              <tbody>
                {(summary.by_type || []).map((row) => (
                  <tr key={row.vehicle_type} className="border-b border-border/30">
                    <td className="p-4 font-medium">{pretty(row.vehicle_type)}</td>
                    <td className="p-4">{row.buyers}</td>
                    <td className="p-4 hidden sm:table-cell">
                      {row.avg_budget ? Number(row.avg_budget).toLocaleString() : '—'}
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          row.buyers > row.supply
                            ? 'text-amber-500 font-semibold'
                            : 'text-muted-foreground'
                        }
                      >
                        {row.supply}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Purchase timelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(summary.by_timeline || []).map((row, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{pretty(row.timeline || '')}</span>
                <span className="font-semibold">{row.buyers}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Preferred vibe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(summary.by_vibe || []).map((row, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{pretty(row.vibe || '')}</span>
                <span className="font-semibold">{row.buyers}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
