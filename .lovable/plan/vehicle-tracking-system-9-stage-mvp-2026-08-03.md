# Vehicle Tracking System (9-stage, MVP)

Adds end-to-end shipment tracking for imported vehicles: importers log updates, buyers watch progress, and anyone with a share link can follow along. Maps use OpenStreetMap (Leaflet + Nominatim) — no Google, no cost.

## What gets built

**1. Importer tracking workspace** (new "Tracking" tab in the Importer dashboard)
- List of the importer's vehicles/imports with current stage badge.
- Select one to see its timeline, add an update (stage, location text, notes, status), toggle tracking on/off, and toggle a public share link with copy-to-clipboard.
- Location text is geocoded automatically via the existing Nominatim service and pinned on a Leaflet map.

**2. Buyer dashboard tracking**
- The existing "My Orders" area gains a tracking panel per purchase: current stage, ETA, progress bar, and the full timeline.

**3. Public tracking page** at `/track/:token`
- No login required. Shows vehicle summary, current stage, ETA, progress bar, timeline, map of the latest location, and the importer's opted-in contact buttons (WhatsApp / call / email).
- Invalid or non-public tokens show a friendly "tracking not found" state.

**4. Nine stages**
Order Confirmed → Origin → Port Departure → In Transit → Port Arrival → Customs Clearance → Warehouse → Ready for Delivery → Delivered. ETA is auto-calculated from stage estimates (In Transit 20d, Customs 5d, Warehouse 2d) and can be overridden by the importer.

Tracking stays optional — vehicles without tracking behave exactly as today, and no existing importer/dealer/marketplace flow changes.

## Technical details

Database (one migration):
- `public.vehicle_tracking` — vehicle_id, importer_id, buyer_id (nullable), tracking_enabled, is_public, public_tracking_token (unique), order_date, estimated/actual delivery dates, current_stage, tracking_status, delay_reason, timestamps + updated_at trigger.
- `public.vehicle_tracking_updates` — tracking_id, stage, stage_label, location_text, lat/lng, geocoded_at, status, notes, estimated_next_arrival, created_by, timestamps.
- Indexes on vehicle_id, importer_id, buyer_id, token, tracking_id.
- GRANTs for `authenticated` and `service_role` on both tables (no anon grants), then RLS: importers manage rows where `importer_id = auth.uid()`, buyers read rows where `buyer_id = auth.uid()`, updates readable/writable through the parent tracking row.
- Public access is not via anon RLS. A `SECURITY DEFINER` function `get_public_tracking(_token text)` returns only safe fields (vehicle year/make/model/photo/price, stages, timeline, importer display name plus contact channels the importer opted to publish) and only when `is_public = true`. Granted to `anon` and `authenticated`.

Frontend (no `/api/...` fetches — everything goes through the existing `@/lib/supabase` wrapper, `public` schema):
- `src/lib/trackingStages.ts` — stage enum, metadata, label/icon/estimated-days helpers.
- `src/services/trackingService.ts` — token generation, ETA calc, days-until/format helpers, progress %, next stage, geocode via `GeocodingService`.
- `src/components/tracking/TrackingTimeline.tsx`, `TrackingProgressBar.tsx`, `TrackingMap.tsx` (Leaflet, reusing the existing map setup) — shared by all three views.
- `src/components/importer/TrackingTab.tsx` — mounted in `ImporterDashboard` menu; no new protected route needed.
- `src/components/buyer/PurchaseTrackingList.tsx` — mounted in the buyer "My Orders" tab.
- `src/pages/PublicTracking.tsx` + route `/track/:token` in `App.tsx` (public, above the catch-all), calling the RPC.
- All components use existing design tokens (noir/chrome + light theme), `React.forwardRef` where Radix `asChild` is used, silent-failure error handling with safe empty states, and mobile-first layouts (stacked timeline, full-width cards under 768px).
