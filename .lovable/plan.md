

# Products Dropdown & 5 Product Pages

## Summary
Add a "Products" dropdown to the navigation bar and create 5 new product pages, each with hero, features, how-it-works, benefits, FAQ accordion, and CTA sections. All pages use the existing dark theme and shared Navigation/Footer.

---

## Changes

### 1. Navigation Update
**File: `src/components/Navigation.tsx`**
- Add "Products" to `navLinks` array (between Marketplace and Waitlist)
- On desktop: hover opens a dropdown with 5 items (icon, title, subtitle) linking to `/products/*`
- On mobile: tap expands an accordion-style sub-menu within the mobile menu
- Dropdown styled with card background, blur, cyan hover border
- Uses `NavigationMenu` from Radix or a custom hover dropdown with `onMouseEnter`/`onMouseLeave`

### 2. Routes
**File: `src/App.tsx`**
- Add 5 routes before catch-all:
  - `/products/marketplace`
  - `/products/escrow`
  - `/products/ai-intelligence`
  - `/products/analytics`
  - `/products/dealer-tools`
- All use a shared `ProductPage` component with different content props

### 3. Shared Product Page Component
**New file: `src/components/products/ProductPage.tsx`**
- Renders: Navigation → Hero → Overview (with stats) → Features grid → How It Works steps → Benefits cards → FAQ accordion → Final CTA → Footer
- All sections use framer-motion fade-in (400ms, 100ms stagger)
- Responsive: 3-col → 2-col → 1-col grids

### 4. FAQ Accordion Component
**New file: `src/components/products/ProductFAQ.tsx`**
- Uses existing `@radix-ui/react-accordion` (already in project as `src/components/ui/accordion.tsx`)
- Single-open mode, cyan chevron, dark card styling
- Accessible: keyboard nav, aria-expanded, prefers-reduced-motion

### 5. Product Page Data
**New file: `src/components/products/productData.ts`**
- Exports 5 product config objects (one per page) containing all content: hero text, features, steps, benefits, FAQ Q&As, CTAs
- Each page component just imports its config and passes to `ProductPage`

### 6. Five Page Files
**New files:** `src/pages/products/MarketplacePage.tsx`, `EscrowPage.tsx`, `AIIntelligencePage.tsx`, `AnalyticsPage.tsx`, `DealerToolsPage.tsx`
- Each is a thin wrapper: imports product data + renders `ProductPage`

---

## Files Created (8)
- `src/components/products/ProductPage.tsx` — shared layout
- `src/components/products/ProductFAQ.tsx` — FAQ accordion
- `src/components/products/productData.ts` — all content
- `src/pages/products/MarketplacePage.tsx`
- `src/pages/products/EscrowPage.tsx`
- `src/pages/products/AIIntelligencePage.tsx`
- `src/pages/products/AnalyticsPage.tsx`
- `src/pages/products/DealerToolsPage.tsx`

## Files Modified (2)
- `src/components/Navigation.tsx` — add Products dropdown
- `src/App.tsx` — add 5 routes

## Not Touched
- All existing pages, auth, database, marketplace, dashboards, Footer

