## Advanced Dealer Maps — 4 features

Build in order, test between each. Free stack only: Leaflet + Leaflet.markercluster + Nominatim + browser Geolocation + Haversine (client-side). No Google Maps, no API keys.

Field-name adjustments to match the actual `public.profiles` schema (there is no `business_name` or `verified_at` — use `full_name` and `subscription_tier`).

---

### Feature 1 — Distance on Vehicle Detail map

- New util `src/utils/distanceUtils.ts` — Haversine `calculateDistance`, `getUserLocation` (browser Geolocation, 5s timeout, no high-accuracy), `formatDistance` (m under 1 km, km with 1 decimal otherwise).
- Update `src/components/maps/DealerLocationMap.tsx`:
  - Add `showDistance` prop (default `true`).
  - On mount, request browser location; on success add a blue user marker, dashed cyan polyline to dealer, and `fitBounds` to include both.
  - Above the map, render a compact chip: "Getting your location…" / "✓ 3.2 km away" / "Enable location to see distance" (no toast, silent-failure style).
  - Keep existing "Location not available" empty state, existing radius circle, and existing popup HTML escaping.

### Feature 2 — Store Locator page `/stores`

- Public page, no auth required.
- New page `src/pages/Stores.tsx` + route in `src/App.tsx` (above the `*` catch-all). Uses the existing `Navigation` shell for consistency.
- Data source: query `public_dealer_profiles` directly from the client (already public, RLS-safe) filtered to rows with non-null coords, then compute distance client-side with Haversine and sort/filter. No edge function needed — avoids the extra deploy and keeps this fully static.
- UI (mobile-first, dark theme, cyan accent — matches existing design system):
  - City text input + "Use My Location" button. City search uses `GeocodingService.geocodeAddress` to convert to coords.
  - Distance quick-pick chips (5 / 10 / 25 / 50 km) + slider 1–100 km, synced.
  - Results header "N dealers found".
  - Two-column on desktop: left = map, right = scrollable dealer list; stacked on mobile. Selecting a dealer pans/zooms the map and opens the popup.
  - Each dealer card shows `full_name`, street/city, distance, and a `Premium` chip when `subscription_tier = 'premium'`.
  - Empty state and "no coords yet" state handled inline (no red toasts, per project policy).

### Feature 3 — Clustered markers on Store Locator

- Add deps: `leaflet.markercluster` + `@types/leaflet.markercluster`.
- Import both cluster CSS files in `src/main.tsx`.
- New component `src/components/maps/StoreLocatorMap.tsx` used by `/stores`:
  - Renders all filtered dealers into an `L.markerClusterGroup` (`maxClusterRadius: 50`, `showCoverageOnHover: true`, `zoomToBoundsOnClick: true`).
  - Selected dealer marker uses a red icon; others use the default.
  - Optional user-location marker (blue) when available.
  - `fitBounds` to the cluster group on data change; re-renders cleanly when the dealer list or selection changes (dispose + rebuild the cluster layer, keep the map instance).
- Vehicle Detail map is NOT clustered (single/few points).

### Feature 4 — Multiple locations per dealer

- Migration `dealer_locations` in `public`:
  - Columns: `id`, `dealer_id → profiles(id) on delete cascade`, `location_name`, `street_address`, `city`, `location_latitude`, `location_longitude`, `phone`, `opening_hours`, `is_primary bool default false`, `is_active bool default true`, `created_at`, `updated_at` + updated_at trigger.
  - Indexes on `dealer_id` and `(location_latitude, location_longitude)`.
  - GRANTs: `SELECT, INSERT, UPDATE, DELETE` to `authenticated`; `ALL` to `service_role`; `SELECT` to `anon` (public marketplace needs to read them).
  - RLS: enable + policies — public `SELECT` for `is_active = true`; dealer `INSERT/UPDATE/DELETE` only where `dealer_id = auth.uid()`.
  - Rebuild `public_dealer_profiles` view unchanged (still driven by `profiles`). Secondary locations are read directly from `dealer_locations` (public SELECT policy).
- Client helper `getDealerAllLocations(dealerId)` in a new `src/services/dealerLocations.ts`:
  - Returns primary (from `public_dealer_profiles`) + secondary (from `dealer_locations`, active only), tagged with `is_primary`.
- Update `VehicleDetail.tsx` → fetch all locations and pass them into `DealerLocationMap` via a new `dealerLocations` prop.
- Update `DealerLocationMap.tsx`:
  - If `dealerLocations.length > 1`: render one marker per location (primary red, secondary blue), each with its own popup and small radius circle, then `fitBounds` across all.
  - If only one location: current single-marker behavior (unchanged from Feature 1).
  - Small header chip "📍 N locations available" when multiple.
- Dealer Settings (`src/components/dashboard/SettingsPanel.tsx`) gets a new "Additional Locations" card: list, add, edit, delete secondary branches with the same geocoding flow already used for the primary address. Primary stays on `profiles` for backward compatibility.

---

### Files created / edited

Created:
- `src/utils/distanceUtils.ts`
- `src/pages/Stores.tsx`
- `src/components/maps/StoreLocatorMap.tsx`
- `src/services/dealerLocations.ts`
- Migration: `public.dealer_locations` table + RLS + GRANTs + trigger

Edited:
- `src/components/maps/DealerLocationMap.tsx` (distance + multi-location)
- `src/pages/VehicleDetail.tsx` (fetch all dealer locations, pass to map)
- `src/components/dashboard/SettingsPanel.tsx` (manage additional locations)
- `src/App.tsx` (add `/stores` route)
- `src/main.tsx` (cluster CSS imports)
- `package.json` (`leaflet.markercluster`, `@types/leaflet.markercluster`)

Not touched: auth, roles, payments, marketplace filters, edge functions, existing Google Maps link column.

### Deviations from the pasted spec (intentional)

- Uses `full_name` instead of non-existent `business_name`; no `verified_at` chip (uses `subscription_tier === 'premium'` only).
- No `search-dealers-near` edge function — a public client query against `public_dealer_profiles` + Haversine is simpler, cheaper, and works offline of any function deploy. Can be swapped to an edge function later if the dataset grows.
- Does not add `user_search_latitude/longitude` columns to `profiles` — browser Geolocation is called on demand; caching in the DB isn't needed for this scope and would add PII surface.
- Uses cyan/dark tokens instead of the raw Tailwind colors in the sample snippets, and uses shadcn components (`Button`, `Input`, `Slider`, `Card`) for consistency.
