import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../_supabase";

export default defineTool({
  name: "remove_favorite",
  title: "Unsave a vehicle",
  description: "Remove a vehicle from the signed-in buyer's saved list.",
  inputSchema: { vehicle_id: z.string().uuid() },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ vehicle_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { error } = await sb
      .from("favorites")
      .delete()
      .eq("user_id", ctx.getUserId())
      .eq("vehicle_id", vehicle_id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: "Removed." }] };
  },
});
