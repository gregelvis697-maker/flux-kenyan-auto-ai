declare const process: { env: Record<string, string | undefined> };

import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../_supabase";

export default defineTool({
  name: "search_vehicles",
  title: "Search vehicles",
  description:
    "Search the Flux marketplace for available vehicles. Filter by make, model, year range, price range, body type, or fuel type. Returns up to 25 non-sold, available listings.",
  inputSchema: {
    make: z.string().trim().optional().describe("Make filter (case-insensitive contains)."),
    model: z.string().trim().optional().describe("Model filter (case-insensitive contains)."),
    body_type: z.string().trim().optional(),
    fuel_type: z.string().trim().optional(),
    min_year: z.number().int().optional(),
    max_year: z.number().int().optional(),
    max_price_kes: z.number().int().optional(),
    limit: z.number().int().min(1).max(25).optional().describe("Max results, default 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("vehicles")
      .select(
        "id, make, model, year, price, price_on_request, mileage, body_type, fuel_type, transmission, location, availability_status, photos"
      )
      .eq("is_sold", false)
      .limit(input.limit ?? 10);

    if (input.make) q = q.ilike("make", `%${input.make}%`);
    if (input.model) q = q.ilike("model", `%${input.model}%`);
    if (input.body_type) q = q.ilike("body_type", `%${input.body_type}%`);
    if (input.fuel_type) q = q.eq("fuel_type", input.fuel_type as any);
    if (input.min_year) q = q.gte("year", input.min_year);
    if (input.max_year) q = q.lte("year", input.max_year);
    if (input.max_price_kes) q = q.lte("price", input.max_price_kes);

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { vehicles: data ?? [] },
    };
  },
});
