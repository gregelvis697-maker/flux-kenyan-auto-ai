# Marketplace Enhancements Inspired by Kenya Dealer Feedback

## Goal
Add Kenya-market-friendly browsing patterns (call-for-price, prominent status, brand pills, availability tabs, "Get Similar" on sold cars) to the existing `/marketplace` page. Fully additive — existing filters, sort, pagination, and detail page untouched.

---

## 1. Database (Additive)
**Migration**: Add two optional columns to `vehicles`:
- `price_on_request boolean default false` — when true, card shows "Call for Price"
- `availability_status text` — values: `available` | `in_transit` | `reserved` (defaults derived from existing `status` field if null, so existing rows keep working)

No destructive changes. Existing `status`, `price`, RLS untouched.

---

## 2. VehicleCard Updates (`src/components/marketplace/VehicleCard.tsx`)
- **Prominent status badge** in top-right of image: green "AVAILABLE", amber "IN TRANSIT", red "SOLD", gray "RESERVED"
- **Price area**: if `price_on_request` is true OR price is null/0, show "Call for Price" in primary color instead of KES amount
- **Sold cards**: replace "View Details" with "GET SIMILAR" button that navigates to `/marketplace?make={make}&model={model}` (uses existing URL filter system — no new code)
- **WhatsApp quick-action button** on card (mobile-first) for instant inquiry without opening detail page

## 3. Marketplace Page Filter Bar (`src/pages/Marketplace.tsx`)
Add three new UI rows above the existing filter sidebar/grid (no removal of current filters):

### Row A — Availability Tabs
`All | Locally Available | In Transit | Sold Units` — pill tabs that set the `availability_status` URL param

### Row B — Brand Pills (horizontal scroll)
Auto-populated from distinct `make` values in current results. Tap a brand to filter. Already-selected brand shown in primary color.

### Row C — Body Type Quick Filters with Icons
SUV / Sedan / Hatchback / Pickup / Performance — each with a Lucide icon. Sets `body_type` filter (already exists in schema).

All three rows write to URL query params using the existing pattern, so shareable/bookmarkable URLs still work.

## 4. Navigation — Persistent "Call Now" CTA
Add an optional "Call Now" / WhatsApp button to the top navigation that opens WhatsApp to the FLUX support number. Hidden on auth/dashboard routes. Doesn't touch existing nav links.

## 5. Dealer Inventory Form (`InventoryTab.tsx`)
Add two optional fields to the Add Vehicle form:
- "Price on request" toggle (sets `price_on_request`)
- "Availability status" dropdown (Available / In Transit / Reserved)

Existing required fields and submission flow unchanged.

---

## What's NOT Touched
- Authentication, user roles, RLS policies on existing tables
- Vehicle Detail Page (`/vehicles/:id`)
- Admin / Importer / Dealer dashboards (only the inventory form gets 2 new optional fields)
- Existing sort, pagination, sidebar filters
- Intelligence layer (price guidance, badges, fraud alerts)
- Product marketing pages
- Schema columns currently in use

## Files Modified (5)
- `supabase/migrations/...` — add 2 optional columns
- `src/components/marketplace/VehicleCard.tsx` — status badge, call-for-price, get-similar
- `src/pages/Marketplace.tsx` — availability tabs, brand pills, body-type icons row
- `src/components/Navigation.tsx` — optional Call Now button
- `src/components/dealer/InventoryTab.tsx` — 2 new optional form fields

## Mobile-First
- Brand pills: horizontal scroll with snap
- Body type row: 2-row grid on mobile, single row on desktop
- Status badges sized down on mobile but still prominent
- WhatsApp button is full-width on cards in mobile view