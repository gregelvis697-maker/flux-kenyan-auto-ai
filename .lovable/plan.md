

# Marketplace Redesign + Add Vehicle Fix

## Investigation Findings

**Add Vehicle**: The InventoryTab code looks functionally correct. The form opens as a Dialog, submits to Supabase, and handles all fields. The most likely issue is a **React warning** from `Badge` component being passed as `asChild` to `TooltipTrigger` without `forwardRef` (visible in console logs). This warning cascades from `IntelligenceBadges.tsx` and may cause rendering issues on the marketplace page that could affect navigation to the dealer dashboard. I'll verify and fix this.

**Marketplace**: Currently a simple single-column layout with collapsible filters. Needs full redesign to match the reference: 2-column layout with sticky sidebar filters, pagination, sort dropdown, and redesigned vehicle cards.

---

## Changes

### 1. Fix Badge forwardRef Warning
**File: `src/components/ui/badge.tsx`** — Wrap with `React.forwardRef` so it works with Radix `asChild` pattern. This resolves the console error.

### 2. Redesign Marketplace Page
**File: `src/pages/Marketplace.tsx`** — Full rewrite:
- 2-column layout: sticky left sidebar (25%) + main content (75%)
- Mobile: single column with slide-out filter panel
- Add pagination (20 per page), sort dropdown (6 options), breadcrumbs
- Add `body_type`, `transmission` to fetched fields for filtering
- Replace `VehicleDetailModal` usage (now navigates to detail page)
- URL query params for filters/sort/page (shareable)
- Loading skeletons, empty states, error handling

### 3. New Sidebar Filters Component
**File: `src/components/marketplace/MarketplaceFilters.tsx`** — Replace `VehicleFilters.tsx`:
- Price range with dual slider
- Body type icon grid (SUV, Sedan, Van, Coupe) — multi-select
- Fuel type checkboxes
- Transmission radio buttons
- Collapsible "Additional Filters" section (make, year, mileage)
- Reset button
- Mobile: slide-out Sheet panel with apply/close

### 4. Redesign Vehicle Card
**File: `src/components/marketplace/VehicleCard.tsx`** — Simplify and match reference:
- Clean card with photo (16:9), verified badge top-left, heart top-right
- Title, year/mileage row, transmission/fuel/seats row
- Price in KES format (bold, primary color)
- "View Details →" button navigating to `/vehicles/:id`
- Remove heavy intelligence badges (confidence score, demand, price position) from card — keep them on detail page only

### 5. Sort & Pagination Components
**File: `src/components/marketplace/MarketplaceSort.tsx`** — Sort dropdown with 6 options
**File: `src/components/marketplace/MarketplacePagination.tsx`** — Page numbers with prev/next, mobile-simplified

---

## What's NOT Touched
- Vehicle detail page (`/vehicles/:id`) — no changes
- Admin dashboard — no changes  
- Dealer dashboard — no changes (InventoryTab stays as-is)
- Auth/routing — no changes (except removing unused modal import from Marketplace)
- Database schema — no changes
- Navigation component — no changes

## Files Created
- `src/components/marketplace/MarketplaceFilters.tsx`
- `src/components/marketplace/MarketplaceSort.tsx`
- `src/components/marketplace/MarketplacePagination.tsx`

## Files Modified
- `src/components/ui/badge.tsx` — add forwardRef
- `src/pages/Marketplace.tsx` — full redesign
- `src/components/marketplace/VehicleCard.tsx` — simplify design

## Files Kept (not deleted)
- `src/components/marketplace/VehicleFilters.tsx` — kept for backward compat
- `src/components/marketplace/VehicleDetailModal.tsx` — kept for backward compat
- `src/components/marketplace/IntelligenceBadges.tsx` — still used on detail page

