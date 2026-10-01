import { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Wand2, X } from "lucide-react";
import { describeToFilters, filterChips, filtersToParams, type AiFilters } from "@/lib/aiSearch";

export const AiDescribeSearch = forwardRef<HTMLDivElement, { compact?: boolean }>(({ compact }, ref) => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<AiFilters | null>(null);
  const [summary, setSummary] = useState("");

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
          <button onClick={go} className="h-11 px-6 bg-chrome text-background font-bold uppercase tracking-widest text-xs">
            Show matching cars »
          </button>
        </div>
      )}
    </div>
  );
});
AiDescribeSearch.displayName = "AiDescribeSearch";
