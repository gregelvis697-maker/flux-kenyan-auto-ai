# Build Your Perfect Vehicle

Turn passive browsing into demand-first discovery: a guided questionnaire that captures what each buyer actually wants, saves it to their account, and matches it against live listings.

## What gets built

### 1. The questionnaire (`/build`)
- 17 questions across 5 sections: vehicle basics, lifestyle/use case, transmission and fuel, features and priorities, buying intent.
- One question per screen, big touch targets, progress bar ("Question 5 of 17"), Back, Next, and Skip (skipped answers count as "flexible").
- Works without an account. Answers are held locally as you go; at the end a guest is invited to create an account, and the answers are saved automatically once they sign up.
- Logged-in buyers get answers saved as they progress.
- Completion screen: visual summary of the profile, then "View my matches", "Edit answers", or "Save and browse".

### 2. Entry points
- Homepage hero gains a second, equally prominent choice: "Browse Marketplace" or "Build Your Perfect Vehicle" (with "Takes 5 minutes").
- Marketplace gets a "Match my preferences" toggle that applies the saved profile as filters; can be switched back to show everything.
- Vehicle pages show a match score badge and a short reason ("Matches your sporty vibe") when a profile exists.

### 3. Buyer dashboard: "My Perfect Vehicle"
- New sidebar section showing the saved profile as a summary card ("2015-2024 SUVs, KES 1.5M-2.5M, practical and sporty").
- Current matches listed as vehicle cards with a match score and quick actions.
- Empty state: "No perfect matches yet - we'll show them here the moment one appears."
- Insights line: how many matching vehicles were added recently and the average price for that profile.
- Manage: edit answers, turn a profile on or off without deleting it, keep more than one profile (e.g. "Weekend car" vs "Daily commute"), delete with confirmation.
- Notification frequency (instant / daily / weekly / none) is stored now; the actual sending of alerts is out of scope for this build.

### 4. Admin demand view
- New panel in the admin dashboard aggregating saved profiles: most-wanted vehicle types, price bands, timelines, and supply gaps (high demand, few listings) to use when recruiting importers. Individual buyers are never shown - counts only.

### 5. Favicon
Replace the default icon with the uploaded FLUX mark.

### 6. Workspace skills
`npx skills add Leonxlnx/taste-skill` and `npx impeccable install` run as part of the build.

## Matching

Score out of 100: vehicle type 20, year range 15, price range 15, vibe 15, use case 15, fuel 10, transmission 10. Exact criterion = full points, partial = half, miss = zero. Labels: 85+ perfect, 70-84 great, 50-69 good; below 50 hidden by default. Rule-based, computed on the fly - no stored scores.

## Technical notes

- New table `buyer_preferences` (one row per profile, many per buyer): vehicle type, year min/max, price min/max, mileage band, use case, commute band, vibe, maintenance budget, include-in-transit flag, transmission, fuel, features array, interior vibe, fuel-efficiency weight, timeline, notification preference, trust priorities array, `is_active`, timestamps. Owner-only read/write via RLS; grants for `authenticated` and `service_role`. Deletes are soft (`is_active = false`) except explicit user delete.
- Admin aggregate reads go through a security-definer function returning counts only, callable by admins.
- Guest answers held in `localStorage` under a versioned key, flushed to the table on first authenticated load.
- New files: `src/pages/BuildYourPerfect.tsx`, `src/components/build/*` (question step components, progress bar, summary), `src/lib/preferenceMatching.ts`, `src/hooks/useBuyerPreferences.ts`, plus a `MyPerfectVehicleTab` in the buyer dashboard and a demand panel in admin.
- Matching runs client-side against the vehicles already fetched; marketplace preference filtering narrows the query where fields map directly (type, year, price, fuel, transmission).
- Reuses existing tokens, cards and sidebar patterns - no visual redesign.

## Out of scope
Real-time alert delivery, price alerts, AI recommendations.
