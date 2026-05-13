

# Marketplace: Smarter Get Similar, Request Availability Modal & Call-for-Price Tooltip

## Goal
Three small, additive UX improvements on the marketplace — no schema changes, no workflow changes.

---

## 1. Smarter "Get Similar" prefill

When a user clicks **Get Similar** on a sold card (or the Sold banner on the detail page), prefill **make + model + body type** in the marketplace URL so they land on the most relevant inventory.

- Update `VehicleCard.handleGetSimilar` and `handleCardClick` (sold path) to build:
  `/marketplace?make={make}&model={model}` plus `&body={body_type}` when `body_type` is set.
- Update the sold banner CTA in `src/pages/VehicleDetail.tsx` to do the same.
- `Marketplace.tsx` already reads `make`, `model`, and `body` from URL params on mount, so no parser changes are needed — the existing filters will pick them up.
- Reset the availability tab to `all` (drop `avail=sold`) when getting similar, so users see live inventory.

## 2. "Request Availability" modal

Replace the current direct `wa.me/254700000000?text=…` link in the Sold tab empty state with a small modal that collects details first.

- New component `src/components/marketplace/RequestAvailabilityModal.tsx` using shadcn `Dialog`.
- Fields (all required except notes):
  - Make (text)
  - Model (text)
  - Year (number, 1990–current+1)
  - Max budget KES (optional)
  - Notes (optional textarea)
  - Buyer name + phone (prefill from `profiles` if logged in; required otherwise)
- Submit button: builds a formatted WhatsApp message and opens `https://wa.me/{FLUX_SUPPORT_WHATSAPP}?text={encoded}` in a new tab. Closes the modal.
- Lightweight client-side validation; inline errors, no toasts (per silent-failure policy).
- Triggered from:
  - Sold-tab empty state in `Marketplace.tsx` (replaces the current direct link)
  - "Request Availability" CTA we'll also add to the sold banner on `VehicleDetail.tsx` (next to "Get Similar"), so deep-linked sold pages get the same option

### Support number config
Add `src/config/contact.ts`:
```ts
export const FLUX_SUPPORT_WHATSAPP = '254700000000'; // TODO: replace with real number
```
Both the modal and any other support CTAs import from here, so the number lives in exactly one place.

## 3. "Call for Price" tooltip

Wrap the "Call for Price" label in a shadcn `Tooltip` (already in the project) explaining why pricing is hidden.

- Tooltip copy: **"Pricing isn't listed publicly — the dealer prefers to discuss the final number on a call or WhatsApp. Tap to contact them directly."**
- On mobile (no hover), tap toggles the tooltip via `TooltipProvider` + `delayDuration={0}`. The tap also opens WhatsApp on the detail page; on cards it just shows the tooltip.
- Apply consistently to the three places call-for-price renders:
  - `src/components/marketplace/VehicleCard.tsx`
  - `src/components/vehicle-detail/VehicleContactCard.tsx`
  - `src/components/marketplace/VehicleDetailModal.tsx` (legacy modal)
  - `src/components/marketplace/SavedVehiclesTab.tsx`

Add a tiny helper in `src/lib/vehicle-display.ts` exporting the constant copy `CALL_FOR_PRICE_TOOLTIP` so wording stays in sync.

---

## Technical Notes
- No DB schema changes. No RLS changes. No new edge functions.
- All existing routes, queries, filters, and navigation remain identical.
- Tooltip respects existing `TooltipProvider` already mounted in `App.tsx` (verified by ui/tooltip.tsx being part of shadcn install). If a provider isn't wrapping these subtrees we'll add a local one.
- The modal does not write to the database (avoids the `contact_requests` NOT NULL constraints on `vehicle_id` and `buyer_id`). It is a pure WhatsApp handoff. A future enhancement could relax those columns and persist requests — flagged but out of scope.

## Files Modified (5) + Created (2)
- **New**: `src/config/contact.ts`
- **New**: `src/components/marketplace/RequestAvailabilityModal.tsx`
- `src/lib/vehicle-display.ts` — export tooltip copy constant
- `src/components/marketplace/VehicleCard.tsx` — Get Similar prefill + tooltip
- `src/components/vehicle-detail/VehicleContactCard.tsx` — tooltip on call-for-price
- `src/components/marketplace/VehicleDetailModal.tsx` — tooltip on call-for-price
- `src/components/marketplace/SavedVehiclesTab.tsx` — tooltip on call-for-price
- `src/pages/Marketplace.tsx` — wire Sold-tab CTA to modal
- `src/pages/VehicleDetail.tsx` — Get Similar prefill + add Request Availability button to sold banner

## Not Touched
- Database schema, RLS, dealer dashboard, auth, navigation, other product pages.

