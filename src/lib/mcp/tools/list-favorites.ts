import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../_supabase";

export default defineTool({
  name: "list_my_favorites",
  title: "List my saved vehicles",
  description: "List the signed-in buyer's saved (favorited) vehicles.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("favorites")
      .select("id, vehicle_id, created_at, vehicles(id, make, model, year, price, price_on_request, photos)")
      .eq("user_id", ctx.getUserId());
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { favorites: data ?? [] },
    };
  },
});
