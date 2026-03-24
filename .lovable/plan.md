

# Add Pricing Section to Dealer Tools Page

## Approach
Add an optional `pricing` field to the `ProductData` interface and populate it for the Dealer Tools page. Render the pricing section in `ProductPage.tsx` between "How It Works" and "Benefits" — only when `data.pricing` exists, so other product pages are unaffected.

## Changes

### 1. `src/components/products/productData.ts`
- Add optional `pricing` to `ProductData` interface:
  ```ts
  pricing?: {
    heading: string;
    subtitle: string;
    plans: Array<{
      name: string;
      price: string;
      period: string;
      subtitle: string;
      features: Array<{ text: string; subItems?: string[] }>;
      ctaLabel: string;
      ctaHref: string;
      highlighted?: boolean; // true for Premium (filled button)
    }>;
  };
  ```
- Add `pricing` data to `dealerToolsData` with Standard (KES 32,000) and Premium (KES 40,000) plans, all features and sub-bullets as specified.

### 2. `src/components/products/ProductPage.tsx`
- After the "How It Works" section (line 164) and before "Benefits" (line 167), add a conditional pricing section:
  - Heading + subtitle centered
  - 2-column grid (1-col on mobile) of pricing cards
  - Each card: plan name, price in cyan, subtitle, feature list with checkmarks and indented sub-items, CTA button
  - Standard card: outline CTA button; Premium card: filled cyan CTA button
  - Cards use hover scale(1.02) + cyan border, matching existing card patterns
  - Uses the same `Section` wrapper and `fadeUp` animations

### Files Modified (2)
- `src/components/products/productData.ts` — add interface field + dealer tools pricing data
- `src/components/products/ProductPage.tsx` — render pricing section conditionally

### Not Touched
- All other product pages, routes, navigation, auth, database

