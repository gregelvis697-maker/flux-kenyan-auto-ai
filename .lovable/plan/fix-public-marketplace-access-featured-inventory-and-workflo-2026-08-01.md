# Fix Public Marketplace Access, Featured Inventory, and Workflow Health

## What I verified

- Anonymous visitors currently get a hard database error on the marketplace: requesting vehicles without being signed in returns `permission denied for function has_role`. This is confirmed by a live anonymous request.
- Cause: the vehicles table has admin/dealer access rules that call the `has_role` helper, and those rules apply to *every* visitor, including logged-out ones. A recent security hardening pass removed logged-out visitors' permission to run `has_role`, so the whole query fails before the "anyone can view available vehicles" rule is ever reached. The same pattern exists on other tables (import requests, profiles, waitlist, email tables, audit).
- The database currently holds 3 vehicles, all verified, none sold.
- The landing page "Featured Inventory" only pulls vehicles with `verification_status = 'verified'`, while the marketplace shows all unsold vehicles — so the two lists can diverge (today they happen to match, but any new unverified listing shows in the marketplace and not on the landing page).

## Changes

### 1. Make the marketplace truly public (database migration)
Re-scope every access rule that calls `has_role` so it only applies to signed-in visitors. Logged-out visitors then evaluate only the public "available vehicles" rule and browsing works with no login. Tables touched: vehicles, profiles, dealer_import_requests, user_roles, approval_audit, email_logs, email_templates, waitlist. No rule is loosened — admin/dealer/importer access stays exactly as it is today; anonymous access stays limited to unsold vehicles and the public dealer view.

### 2. Featured Inventory mirrors the marketplace
Change the landing page carousel to use the same source as the marketplace (unsold vehicles, newest first, limited to 10) instead of only verified ones, so the two always agree. Keep the built-in sample fallback for when the database returns nothing.

### 3. Sold-units tab
With rule 1 in place, logged-out visitors still cannot see sold units (no public rule allows it), so the existing "Request availability" fallback remains the correct behaviour there. No change.

## Workflow review (delivered as written answer, no code)

I will walk through each workflow — buyer browsing, sign-up/approval, dealer listing + subscription, importer handoff, admin verification, payments/webhooks, email, maps/geocoding — noting which are healthy and which are fragile, with the concrete optimisation for each. Known weak points I already see and will detail:

- Marketplace fetch loads all vehicles then filters/paginates in the browser; it should filter and paginate in the database as inventory grows.
- Auth role lookup uses `.single()`, which errors for a user with no role row; `.maybeSingle()` is safer.
- Marketplace refetches on every login state change even when nothing else changed.
- Dealer name lookups run as a second query per page load rather than being joined/cached.

## Backend uptime (answer, no code)

I will explain how the hosted backend stays available, what causes a project to go idle, and the practical steps to keep it always-on: keeping the project published, the scheduled daily job that already runs (subscription renewals) doubling as activity, and how to check backend health when something looks stuck.

## Not touched
Auth flows, payments, dealer dashboard, admin dashboard, routing, design system.
