import { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Wand2, X } from "lucide-react";
import { describeToFilters, filterChips, filtersToParams, findMatches, type AiFilters, type AiMatch } from "@/lib/aiSearch";
import { useEffect } from "react";

export const AiDescribeSearch = forwardRef<HTMLDivElement, { compact?: boolean }>(({ compact }, ref) => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<AiFilters | null>(null);
  const [summary, setSummary] = useState("");
  const [cars, setCars] = useState<AiMatch[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);

  // Re-run the live search whenever the filters change (incl. removing a chip)
  useEffect(() => {
    if (!filters) return;
    let alive = true;
    setSearching(true);
    findMatches(filters).then((r) => { if (alive) { setCars(r.cars); setTotal(r.total); setSearching(false); } });
    return () => { alive = false; };
  }, [filters]);

  const interpret = async () => {
    if (text.trim().length < 3 || loading) return;
    setLoading(true); setError(""); setFilters(null);
    const r = await describeToFilters(text.trim());
    setLoading(false);
    if (r.error || !r.filters) return setError(r.error || "Try rephrasing your request.");
    setFilters(r.filters); setSummary(r.summary || "");
  };

  const go = () => {
    if (!filters) return;
    const p = filtersToParams(filters);
    navigate(`/marketplace${p.toString() ? `?${p}` : ""}`);
  };

  const chips = filters ? filterChips(filters) : [];

  return (
    <div ref={ref} className="space-y-3">
      <div className={compact ? "flex gap-2" : "flex flex-col md:flex-row gap-3"}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); interpret(); } }}
          rows={compact ? 1 : 2}
          placeholder="e.g. Family SUV under 3M, automatic, petrol, not older than 2018"
          className="flex-1 resize-none bg-transparent border-b border-border focus:border-brand outline-none py-3 text-base text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={interpret}
          disabled={loading || text.trim().length < 3}
          className="h-12 px-6 inline-flex items-center justify-center gap-2 bg-brand text-brand-foreground font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {loading ? "Reading…" : "Find matches"}
        </button>
      </div>
      {error && <p className="text-sm text-muted-foreground">{error}</p>}
      {filters && (
        <div className="space-y-3">
          {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
          <div className="flex flex-wrap gap-2">
            {chips.length === 0 && <span className="text-sm text-muted-foreground">No specific filters — showing all cars.</span>}
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilters({ ...filters, [c.key]: null })}
                className="inline-flex items-center gap-1 border border-border px-3 py-1 text-xs capitalize text-foreground hover:border-brand"
              >
                {c.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
          {searching ? (
            <p className="text-sm text-muted-foreground inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Finding cars…</p>
          ) : cars.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cars match all of that yet. Remove a tag above to widen the search.</p>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{total} {total === 1 ? "car" : "cars"} found</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cars.map((c) => (
                  <button key={c.id} onClick={() => navigate(`/vehicles/${c.id}`)} className="text-left border border-border bg-card hover:border-brand transition-colors">
                    <div className="aspect-[16/10] bg-muted/30 overflow-hidden">
                      {c.photos?.[0] && <img src={c.photos[0]} alt={`${c.year} ${c.make} ${c.model}`} className="w-full h-full object-cover" loading="lazy" />}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-semibold text-foreground capitalize line-clamp-1">{c.year} {c.make} {c.model}</p>
                      <p className="text-xs text-muted-foreground capitalize">{[c.transmission, c.fuel_type, c.mileage ? `${c.mileage.toLocaleString()} km` : null].filter(Boolean).join(" · ")}</p>
                      <p className="text-sm font-bold text-brand">{c.price_on_request || !c.price ? "Call for price" : `KES ${c.price.toLocaleString()}`}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
          {total > cars.length && (
            <button onClick={go} className="h-11 px-6 bg-chrome text-background font-bold uppercase tracking-widest text-xs">
              See all {total} in marketplace »
            </button>
          )}
        </div>
      )}
    </div>
  );
});
AiDescribeSearch.displayName = "AiDescribeSearch";
