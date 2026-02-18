
# Fix Plan: Vehicle Cards Not Working - Marketplace & Dealer Dashboard

## Problem Summary
Both the Dealer Dashboard (/dashboard/dealer) and Marketplace (/marketplace) pages are showing blank screens when you try to access them. This is happening because of a missing configuration for a library that the market intelligence features depend on.

## Root Cause
The Phase 7 Intelligence Layer uses a data-fetching library called React Query (TanStack Query) for efficient data caching and loading. However, the required setup wrapper (`QueryClientProvider`) was never added to the application. Without this wrapper, any page that uses the intelligence features crashes immediately.

### Pages Affected:
1. **Dealer Dashboard** - The inventory form uses `PriceGuidance` which needs React Query
2. **Marketplace** - The vehicle detail modal uses `MarketInsightsPanel` which needs React Query
3. **Any page using intelligence hooks** - Will crash without the provider

## Solution

### Step 1: Add QueryClientProvider to App.tsx
Wrap the application with the required React Query provider. This is a one-line change that enables all the intelligence hooks to work properly.

```text
File: src/App.tsx

Changes:
- Import QueryClient and QueryClientProvider from @tanstack/react-query
- Create a QueryClient instance with default settings
- Wrap the entire app in QueryClientProvider
```

### Step 2: Add Global Error Boundary (Safety Net)
Add an unhandled rejection handler to catch any future async errors gracefully rather than crashing the entire app.

```text
File: src/App.tsx

Changes:
- Add useEffect hook to handle unhandled promise rejections
- Log errors to console and prevent app crashes
```

## Technical Details

### What QueryClientProvider Does
- Provides context for all React Query hooks
- Manages caching, background refetching, and stale data
- Required by: `useMarketPricing`, `useMarketDemand`, `useDealerTrust`, `useVehicleRisk`

### Configuration Options
```text
QueryClient defaults:
- staleTime: 5 minutes (data stays fresh)
- retry: false (don't retry failed requests)
- refetchOnWindowFocus: false (don't refetch when tab regains focus)
```

### Files Modified
| File | Change |
|------|--------|
| `src/App.tsx` | Add QueryClientProvider wrapper and error handler |

## After Fix - Expected Behavior

1. **Dealer Dashboard**: Will load normally with price guidance under the price input field in the vehicle form
2. **Marketplace**: Will load normally with vehicle cards showing confidence scores and intelligence badges
3. **Vehicle Detail Modal**: Will show Market Insights panel with price analysis and demand data
4. **Admin Dashboard**: Vehicle verification will work correctly

## Summary of Features Built (Post-Fix)

### Pages
| Page | Route | Features |
|------|-------|----------|
| Landing Page | `/` | Hero, problem/solution sections, waitlist CTA |
| Marketplace | `/marketplace` | Vehicle browsing with filters, favorites, detail modal, intelligence badges |
| Dealer Dashboard | `/dashboard/dealer` | Inventory management, import requests, verification requests, price guidance |
| Importer Dashboard | `/dashboard/importer` | Available requests, my shipments, delivered |
| Buyer Dashboard | `/dashboard/buyer` | Saved vehicles, contact history |
| Admin Dashboard | `/admin/dashboard` | User management, vehicle verification, email templates, insights |
| Auth | `/auth` | Login/signup with role selection |
| Waitlist | `/waitlist` | Pre-launch signup |

### Intelligence Layer (Phase 7)
- **Confidence Score (0-100)**: Weighted reliability metric on vehicle cards
- **Price Position Badges**: Below/Fair/Above market indicators
- **Demand Badges**: High/Moderate demand indicators  
- **FLUX Verified Badge**: Admin-verified vehicle indicator
- **Market Insights Panel**: Detailed breakdown in vehicle detail modal
- **Price Guidance**: Real-time feedback for dealers on pricing
- **Vehicle Verification Workflow**: Admin approval/rejection system

### Core Features
- Role-based authentication (Buyer, Dealer, Importer, Admin)
- Admin approval workflow for Dealers/Importers
- Vehicle CRUD with photo upload
- Import request system (Dealer requests, Importer accepts)
- Favorites/saved vehicles
- Email notification system
- Audit trail logging
