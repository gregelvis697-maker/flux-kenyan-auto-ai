# Hero Search Bar with Quick Filters

## Goal
Add a search bar to the hero section that lets visitors search and pre-filter cars, then lands them on the marketplace with those filters already applied. The three existing hero buttons (Browse Cars, Build Your Perfect Vehicle, Sell Vehicle) stay exactly as they are — no other hero redesign.

## What you'll see
- A search bar in the hero, placed between the intro paragraph and the three buttons.
- A keyword field ("Search make, model…") plus a small row of quick filters:
  - Make (dropdown, populated from live listings)
  - Body type (SUV / Sedan / Van / Coupe)
  - Max budget (dropdown with KES ranges)
- A "Search" button that takes you to the marketplace with results already filtered.
- Everything styled to match the current dark, editorial hero — no layout changes elsewhere.

## Technical details
- Edit `src/components/Hero.tsx` only.
- On search, navigate to `/marketplace?q=…&make=…&body=…&maxPrice=…` — the marketplace already reads these URL parameters (`src/pages/Marketplace.tsx` lines 72–116), so no marketplace changes are needed.
- Makes list sourced from the existing platform data hook pattern (distinct makes from live listings); falls back gracefully while loading.
- Mobile-first: fields stack under 768px with 48px touch targets.
- The three CTA buttons remain byte-for-byte unchanged.

## Verification
- Build passes, then check in preview: typing a keyword + picking filters and pressing Search lands on the marketplace with matching filters applied and the filter sidebar reflecting them.
