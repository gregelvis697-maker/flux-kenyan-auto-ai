

# Vehicle Detail Page — Implementation Plan

## Summary
Create a dedicated `/vehicles/:id` page modeled on the reference screenshot. This requires database schema additions (new columns on `vehicles` and `profiles`), a new page component, and several sub-components. The existing marketplace modal flow remains untouched — clicking "View Details" on a card will navigate to the new page instead.

---

## 1. Database Migration

Add columns to **vehicles** table:
- `body_type text` (nullable)
- `drive_type text` (nullable)
- `seating_capacity integer` (nullable)
- `features text[]` (nullable)
- `interior_color text` (nullable)
- `location text` (nullable)

Add columns to **profiles** table:
- `whatsapp_number text` (nullable)
- `google_maps_link text` (nullable)
- `address text` (nullable)
- `rating numeric` (nullable, default null)
- `review_count integer` (nullable, default 0)

All columns nullable with no constraints — purely additive, no existing data breaks.

---

## 2. Routing Change

**File: `src/App.tsx`** — Add one route before the catch-all:
```
<Route path="/vehicles/:id" element={<VehicleDetail />} />
```

**File: `src/components/marketplace/VehicleCard.tsx`** — Change `onViewDetails` to use `navigate(`/vehicles/${vehicle.id}`)` via react-router, removing the modal trigger.

**File: `src/pages/Marketplace.tsx`** — Remove the `VehicleDetailModal` usage (the modal is replaced by the full page). Keep the modal component file intact for backward compat.

---

## 3. New Page: `src/pages/VehicleDetail.tsx`

- Fetch vehicle by ID from URL params using `supabase`
- Fetch dealer profile (join on `dealer_id`)
- 404 state if vehicle not found
- Loading skeleton while fetching
- Desktop: 2-column layout (60/40), right column sticky
- Mobile: single column, sticky bottom bar with price + WhatsApp button
- Track page view (silent, non-blocking insert)

---

## 4. New Components (in `src/components/vehicle-detail/`)

### `VehiclePhotoGallery.tsx`
- Main 16:9 photo with auto-advance (4s, pause on hover)
- Prev/Next arrows, dot indicators, photo counter ("3/12")
- Thumbnail strip below (scrollable)
- Click main photo opens lightbox dialog
- Lightbox: dark overlay, full-size, arrow nav, ESC close, swipe on mobile

### `VehicleContactCard.tsx` (right column, sticky)
- Title: `{year} {make} {model}`
- Subtitle: `{mileage} km · {location}`
- Price: `KES {price}` in primary blue
- FLUX VERIFIED badge (if `verification_status === 'verified'`)
- WhatsApp button (#25D366) with pre-filled message
- On click: log to `contact_requests` table silently, then open wa.me link

### `VehicleDealerInfo.tsx`
- Dealer name, star rating, review count
- "Seller Location" heading
- Google Maps iframe embed (or "Location not provided" fallback)
- "Get Directions" button

### `VehicleQuickSpecs.tsx`
- 4-icon grid: Fuel Type, Engine, Transmission, Drivetrain
- Light gray background boxes, 2 per row on mobile

### `VehicleOverview.tsx`
- Section heading with icon + separator
- Description text (or "No description provided")

### `VehicleFeatures.tsx`
- Section heading with icon + separator
- 2-column grid of green checkmarks + feature names
- Fallback: "No features listed"

### `VehicleTechSpecs.tsx`
- Section heading with icon + separator
- Zebra-striped table: Engine, Fuel, Transmission, Drivetrain, Body Type, Seating, Colors, Year, Mileage, Condition

### `MobileStickyBar.tsx`
- Fixed bottom bar (mobile only, hidden on md+)
- Price left, WhatsApp button right
- White bg, shadow, high z-index

---

## 5. Dealer Inventory Form Update

**File: `src/components/dealer/InventoryTab.tsx`** — Add form fields for the new vehicle columns:
- `body_type` (select: Sedan, SUV, Hatchback, Coupe, Wagon, Van, Truck, Convertible)
- `drive_type` (select: 2WD, 4WD, AWD, FWD, RWD)
- `seating_capacity` (number input)
- `interior_color` (text input)
- `location` (text input)
- `features` (multi-select checkboxes for predefined list + custom text input)

Update the insert/update queries to include these fields.

---

## 6. What Changes vs What Stays

**Changed files:**
- `src/App.tsx` — add 1 route
- `src/components/marketplace/VehicleCard.tsx` — navigate to `/vehicles/:id` instead of opening modal
- `src/pages/Marketplace.tsx` — remove modal state/rendering (modal component file stays)
- `src/components/dealer/InventoryTab.tsx` — add new form fields
- `src/integrations/supabase/types.ts` — auto-updated after migration

**New files:**
- `src/pages/VehicleDetail.tsx`
- `src/components/vehicle-detail/VehiclePhotoGallery.tsx`
- `src/components/vehicle-detail/VehicleContactCard.tsx`
- `src/components/vehicle-detail/VehicleDealerInfo.tsx`
- `src/components/vehicle-detail/VehicleQuickSpecs.tsx`
- `src/components/vehicle-detail/VehicleOverview.tsx`
- `src/components/vehicle-detail/VehicleFeatures.tsx`
- `src/components/vehicle-detail/VehicleTechSpecs.tsx`
- `src/components/vehicle-detail/MobileStickyBar.tsx`

**Not touched:** Auth, admin dashboard, dealer dashboard (except inventory form), importer dashboard, all existing routes, Navigation component, existing UI components.

---

## 7. Technical Notes

- All DB queries use `src/lib/supabase` (custom client with public schema)
- Analytics tracking (page view, WhatsApp click) is fire-and-forget with silent error handling
- WhatsApp button logs to `contact_requests` table (buyer_id nullable for anonymous users)
- All new fields are optional — page gracefully hides sections when data is missing
- Back navigation via breadcrumb ("← Back to Marketplace") using `useNavigate(-1)` or direct link
- Profiles RLS: anonymous users viewing vehicle detail need to see dealer name — the existing "Anyone can view available vehicles" policy covers vehicles, but profiles need a new RLS policy for public dealer name access on vehicle detail pages

