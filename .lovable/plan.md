

# Marketplace: Call-for-Price, Status Badges & Sold Tab

## Goal
Make "Call for Price" and the status badge logic consistent everywhere a vehicle is shown, and add a usable Sold Units tab so buyers can browse recently-sold inventory instead of hitting empty/broken states.

---

## 1. Unified helper utilities

Create `src/lib/vehicle-display.ts` with two pure functions used by every vehicle UI:

- `isCallForPrice(v)` → `true` when `price_on_request === true` **OR** `price` is `null`/`0`/negative.
- `getAvailability(v)` → returns one of `'available' | 'in_transit' | 'reserved' | 'sold'`:
  - `is_sold === true` → `'sold'` (regardless of `availability_status`)
  - `availability_status === 'sold'` → `'sold'`
  - `availability_status === 'in_transit'` → `'in_transit'`
  - `availability_status === 'reserved'` → `'reserved'` (only when explicitly set)
  - everything else (null, empty, `'available'`, unknown values) → `'available'`

Also export `statusStyles` (label + className) so badges look identical wherever rendered.

## 2. Apply helpers consistently

Replace inline logic in:
- `src/components/marketplace/VehicleCard.tsx` — use `isCallForPrice` + `getAvailability` (already close; switch to shared helper).
- `src/pages/VehicleDetail.tsx` and its `VehicleContactCard` / `MobileStickyBar` — show "Call for Price" instead of `KES 0`, and adjust the WhatsApp prefilled message to omit price when call-for-price.
- `src/components/marketplace/VehicleDetailModal.tsx` (kept for backward compat) — same treatment.
- `src/components/marketplace/SavedVehiclesTab.tsx` — same treatment if it renders price/status.

Marketplace filter logic (`Marketplace.tsx` lines 252-261) switches to using `getAvailability(vehicle)` so the "Locally Available" / "In Transit" tabs honor both fields.

## 3. New "Sold Units" tab on the marketplace

Add a 4th availability tab: **All · Locally Available · In Transit · Sold Units**.

Behavior:
- When `avail=sold` is active, run a separate query: `select … from vehicles where is_sold = true order by updated_at desc limit 24`.
- RLS today only allows public access to `is_sold = false` rows. Since changing RLS is out of scope for "no drastic changes", the query may legitimately return `[]` for anonymous users.
- Empty/blocked state shows a friendly **"Looking for a sold model?"** panel with:
  - Short copy: "These cars have already found owners. Tell us what you're after and our dealers will source it for you."
  - Primary CTA: **Request Availability** → opens a lightweight modal (name, phone, make/model/year, notes) that inserts into the existing `contact_requests` table (use a sentinel vehicle_id-less variant — see Technical Notes).
  - Secondary CTA: **Browse Available** → switches back to the All tab.
- When the query does return rows, render them with `VehicleCard` (which already shows the SOLD badge, grayscale image, and "Get Similar" CTA — no change needed).

## 4. Sold card click behavior

Already correct in `VehicleCard` (`handleCardClick` routes sold cars to `/marketplace?make=…`). No change.

---

## Technical Notes (for the developer)

- **No schema migration required** for the call-for-price/badge work. All three fields (`price`, `price_on_request`, `availability_status`, `is_sold`) already exist on `vehicles`.
- **Sold tab RLS**: the existing policy `Anyone can view available vehicles` is `(is_sold = false)`. We are intentionally **not** loosening it. The Sold tab gracefully degrades to the "Request availability" panel when zero rows come back — this satisfies the requirement that "the Sold tab never looks broken".
- **Request Availability modal**: `contact_requests.vehicle_id` is `NOT NULL` and `buyer_id` is `NOT NULL` per the current schema. To avoid a migration, the modal will instead open a `mailto:` / WhatsApp link to the Flux support number with a prefilled message (no DB write). If the user prefers a DB-backed form, that requires a small migration to make `vehicle_id` and `buyer_id` nullable on `contact_requests` — flagged as a follow-up, not done in this pass.
- **VehicleDetail page** currently 404s sold vehicles because it filters `is_sold=false`. We'll relax that to fetch the row regardless, and render a read-only "This vehicle has been sold" banner with a "Get Similar" CTA when sold — keeps deep links working.

## Files Modified
- `src/lib/vehicle-display.ts` (new)
- `src/components/marketplace/VehicleCard.tsx`
- `src/components/marketplace/VehicleDetailModal.tsx`
- `src/components/marketplace/SavedVehiclesTab.tsx`
- `src/pages/Marketplace.tsx` (Sold tab + helper usage)
- `src/pages/VehicleDetail.tsx` (+ `VehicleContactCard`, `MobileStickyBar`) — call-for-price + sold banner

## Not Touched
- Database schema, RLS policies, dealer dashboard, auth, navigation, other product pages.

