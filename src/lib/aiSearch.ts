import { supabase } from "@/lib/supabase";

export interface AiFilters {
  q: string | null; make: string | null; model: string | null;
  body: string[] | null; fuel: string[] | null; trans: string | null;
  minYear: number | null; maxYear: number | null;
  minPrice: number | null; maxPrice: number | null;
  maxMileage: number | null; sort: string | null;
}

export async function describeToFilters(text: string): Promise<{ filters?: AiFilters; summary?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-search-filters", { body: { text } });
    if (error) {
      let msg = "AI search couldn't process that right now.";
      try { const b = await (error as any).context?.json(); if (b?.error) msg = b.error; } catch { /* noop */ }
      return { error: msg };
    }
    return data;
  } catch (e) {
    console.error(e);
    return { error: "AI search couldn't process that right now." };
  }
}

export function filtersToParams(f: Partial<AiFilters>): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: unknown) => { if (v !== null && v !== undefined && v !== "") p.set(k, String(v)); };
  set("q", f.q); set("make", f.make); set("model", f.model);
  if (f.body?.length) p.set("body", f.body.join(","));
  if (f.fuel?.length) p.set("fuel", f.fuel.join(","));
  set("trans", f.trans); set("minYear", f.minYear); set("maxYear", f.maxYear);
  set("minPrice", f.minPrice); set("maxPrice", f.maxPrice); set("maxMileage", f.maxMileage);
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  return p;
}

export function filterChips(f: AiFilters): { key: keyof AiFilters; label: string }[] {
  const k = (n: number) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}k`);
  const c: { key: keyof AiFilters; label: string }[] = [];
  if (f.make) c.push({ key: "make", label: f.make });
  if (f.model) c.push({ key: "model", label: f.model });
  if (f.body?.length) c.push({ key: "body", label: f.body.join(" / ") });
  if (f.fuel?.length) c.push({ key: "fuel", label: f.fuel.join(" / ") });
  if (f.trans) c.push({ key: "trans", label: f.trans });
  if (f.minYear) c.push({ key: "minYear", label: `From ${f.minYear}` });
  if (f.maxYear) c.push({ key: "maxYear", label: `Up to ${f.maxYear}` });
  if (f.minPrice) c.push({ key: "minPrice", label: `Min KES ${k(f.minPrice)}` });
  if (f.maxPrice) c.push({ key: "maxPrice", label: `Max KES ${k(f.maxPrice)}` });
  if (f.maxMileage) c.push({ key: "maxMileage", label: `≤ ${f.maxMileage.toLocaleString()} km` });
  if (f.q) c.push({ key: "q", label: `"${f.q}"` });
  if (f.sort && f.sort !== "newest") c.push({ key: "sort", label: `Sort: ${f.sort.replace("_", " ")}` });
  return c;
}
