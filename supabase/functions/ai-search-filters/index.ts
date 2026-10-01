import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({ text: z.string().trim().min(3).max(500) });
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const nul = (t: string) => ({ type: ["string", "null"] as const, description: t });
const num = (t: string) => ({ type: ["number", "null"] as const, description: t });
const schema = {
  type: "object",
  additionalProperties: false,
  required: ["q", "make", "model", "body", "fuel", "trans", "minYear", "maxYear", "minPrice", "maxPrice", "maxMileage", "sort", "summary"],
  properties: {
    q: nul("Free keyword only if nothing else fits"),
    make: nul("Car make, e.g. Toyota"),
    model: nul("Car model, e.g. Prado"),
    body: { type: ["array", "null"], items: { type: "string", enum: ["suv", "sedan", "van", "coupe", "hatchback", "pickup", "wagon"] } },
    fuel: { type: ["array", "null"], items: { type: "string", enum: ["petrol", "diesel", "hybrid", "electric"] } },
    trans: { type: ["string", "null"], enum: ["automatic", "manual", null] },
    minYear: num("Minimum year"),
    maxYear: num("Maximum year"),
    minPrice: num("Minimum price in KES"),
    maxPrice: num("Maximum price in KES"),
    maxMileage: num("Max mileage km"),
    sort: { type: ["string", "null"], enum: ["newest", "price_asc", "price_desc", "mileage_asc", "mileage_desc", "year_desc", null] },
    summary: { type: "string", description: "One short sentence describing the search" },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "Please describe the car in a few words (max 500 characters)." }, 400);
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "AI search is not configured." }, 500);

  const year = new Date().getFullYear();
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    signal: req.signal,
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      instructions: `You convert a Kenyan car buyer's description into marketplace filters. Prices are KES ("3M" = 3000000, "800k" = 800000). Current year ${year}. "not older than N years" -> minYear. Use null for anything not mentioned. Family/7-seater -> suv or van. Cheapest -> price_asc.`,
      input: parsed.data.text,
      text: { format: { type: "json_schema", name: "filters", strict: true, schema } },
    }),
  });

  if (!res.ok) {
    const msg = res.status === 429 ? "AI search is busy — try again in a moment."
      : res.status === 402 ? "AI search is temporarily unavailable (credits)."
      : "AI search couldn't process that right now.";
    console.error("gateway", res.status, await res.text());
    return json({ error: msg }, res.status);
  }

  // Consume SSE stream, collecting output text.
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "", out = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const l of lines) {
      if (!l.startsWith("data:")) continue;
      const d = l.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === "response.output_text.delta") out += ev.delta;
      } catch { /* ignore */ }
    }
  }

  let f: Record<string, any>;
  try { f = JSON.parse(out); } catch { return json({ error: "I couldn't understand that — try rephrasing." }, 422); }
  const clamp = (n: unknown, lo: number, hi: number) =>
    typeof n === "number" && isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : null;
  return json({
    filters: {
      q: f.q || null, make: f.make || null, model: f.model || null,
      body: Array.isArray(f.body) && f.body.length ? f.body : null,
      fuel: Array.isArray(f.fuel) && f.fuel.length ? f.fuel : null,
      trans: f.trans || null,
      minYear: clamp(f.minYear, 1980, year + 1), maxYear: clamp(f.maxYear, 1980, year + 1),
      minPrice: clamp(f.minPrice, 0, 200_000_000), maxPrice: clamp(f.maxPrice, 0, 200_000_000),
      maxMileage: clamp(f.maxMileage, 0, 1_000_000), sort: f.sort || null,
    },
    summary: String(f.summary || ""),
  });
});
