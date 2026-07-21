import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchVehicles from "./tools/search-vehicles";
import getVehicle from "./tools/get-vehicle";
import listFavorites from "./tools/list-favorites";
import addFavorite from "./tools/add-favorite";
import removeFavorite from "./tools/remove-favorite";
import listMyInventory from "./tools/list-my-inventory";

// The OAuth issuer must be the direct Supabase host, not the .lovable.cloud
// proxy. VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "flux-mcp",
  title: "Flux Marketplace",
  version: "0.1.0",
  instructions:
    "Tools for Flux — Kenya's automotive marketplace. Use `search_vehicles` to browse available listings, `get_vehicle` for full details, `list_my_favorites` / `add_favorite` / `remove_favorite` to manage a buyer's saved vehicles, and `list_my_inventory` for a dealer's own listings. All tools act as the signed-in Flux user with RLS applied.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchVehicles,
    getVehicle,
    listFavorites,
    addFavorite,
    removeFavorite,
    listMyInventory,
  ],
});
