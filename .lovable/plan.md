## Add Dealership Location Maps (Leaflet + OpenStreetMap)

Replace the current Google Maps iframe on vehicle detail pages with a free, interactive Leaflet map driven by dealer-entered street address + city, geocoded via Nominatim. No API keys, no cost.

### Scope

**Database (migration)**
- Add to `public.profiles`: `street_address text`, `city text`, `location_latitude numeric(10,8)`, `location_longitude numeric(11,8)`, `location_geocoded_at timestamptz`, `location_geocode_error text`.
- Index on `(location_latitude, location_longitude)`.
- Add the same fields to the `public_dealer_profiles` view so buyers can read them (non-PII).

**Dependencies**
- `npm install leaflet` + `@types/leaflet`.
- Import `leaflet/dist/leaflet.css` in `src/main.tsx`.

**New files**
- `src/services/geocodingService.ts` — Nominatim wrapper (1 req/sec throttle, User-Agent, validation, distance helper). Client-side only for MVP (no edge function — simpler, and Nominatim allows browser calls).
- `src/components/maps/DealerLocationMap.tsx` — Leaflet map with marker + popup, graceful placeholder when coords missing, fixed icon URLs via CDN, responsive height prop.

**Dealer profile UI (`src/components/dashboard/SettingsPanel.tsx`)**
- Add a "Dealership Location" section with Street Address + City inputs, geocode-on-save button, inline error, success toast.
- On save: call `GeocodingService.geocodeAddress`, then persist address + coords + `location_geocoded_at` to `profiles`. Store `location_geocode_error` on failure so the record is auditable.

**Vehicle detail page**
- `src/pages/VehicleDetail.tsx`: extend the dealer fetch to also select `street_address, city, location_latitude, location_longitude`.
- `src/components/vehicle-detail/VehicleDealerInfo.tsx`: replace the Google Maps iframe block with `<DealerLocationMap />`. Keep the existing address text and add an OpenStreetMap "Get Directions" link (`https://www.openstreetmap.org/directions?to=<lat>,<lng>`). Preserve the fallback message when no coords exist. Existing `google_maps_link` remains supported as a secondary link if present, but the map itself now comes from coords.

### Not touched
- `vehicles` table, marketplace list, dealer inventory, subscription flow, auth, other product pages.
- No edge function (Nominatim called directly from the browser with correct User-Agent per their ToS).
- Kept existing `google_maps_link` column intact for backward compatibility.

### Technical notes
- Nominatim ToS: throttle to 1 req/sec, set User-Agent, cache result in DB — all handled.
- Leaflet default marker icons broken under Vite bundling — fixed via CDN URLs in the map component.
- Map container needs an explicit height; component accepts a `height` prop (default 300px, 250px on mobile via responsive class).
- RLS: `location_*` fields added to the existing `public_dealer_profiles` security_invoker view, so anonymous buyers can render the map without exposing PII.
