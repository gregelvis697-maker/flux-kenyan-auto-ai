import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../_supabase";

export default defineTool({
  name: "list_my_inventory",
  title: "List my dealer inventory",
  description:
    "List all vehicles owned by the signed-in dealer, including sold and unlisted ones. Non-dealers will see an empty list per RLS.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("vehicles")
      .select("id, make, model, year, price, is_sold, availability_status, verification_status, created_at")
      .eq("dealer_id", ctx.getUserId())
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { vehicles: data ?? [] },
    };
  },
});
