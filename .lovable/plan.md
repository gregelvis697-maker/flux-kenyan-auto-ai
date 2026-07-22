# Paystack Dealer Subscriptions

Kenya-first payment provider (M-Pesa + card, KES native), so we use Paystack via edge functions rather than Lovable's built-in Stripe/Paddle. Three tiers: Free (3 listings), Standard (KES 32,000 / 15), Premium (KES 40,000 / 50). Monthly auto-renew, upgrade prompts, grace period on failed charge.

## Adjustments to your spec (to fit this codebase)

- **No `dealers` table exists.** Dealers are `profiles` rows with a `dealer` entry in `user_roles`. Subscription columns will live on `profiles` and RLS/joins will use `user_id = auth.uid()`.
- **Secrets are not stored in `.env`.** `PAYSTACK_SECRET_KEY` and `PAYSTACK_WEBHOOK_SECRET` go through the secure secret form (never in code). `VITE_PAYSTACK_PUBLIC_KEY` is publishable and lives in `.env`.
- **No `/api/...` routes** — Lovable is a Vite SPA. Verification and webhook run as Supabase edge functions and are called with `supabase.functions.invoke()`.
- **Pricing on `/products/dealer-tools` already exists** in `ProductPage.tsx` (KES 32k / 40k tiers). We wire its CTAs to the new subscribe flow instead of rebuilding the section.
- Use existing `sonner` toasts, not `useToast`.

## Database (one migration)

Add to `public.profiles`:

- `subscription_tier` (`free` | `standard` | `premium`, default `free`)
- `subscription_status` (`inactive` | `active` | `past_due` | `cancelled`, default `inactive`)
- `subscription_started_at`, `subscription_expires_at` timestamps
- `subscription_auto_renew` (bool, default true)
- `paystack_customer_code`, `paystack_authorization_code` (for charging saved card on renewal)
- `monthly_listing_limit` (int, default 3)

New table `public.subscription_transactions`: dealer_id → profiles, tier, amount, currency, paystack_reference (unique), paystack_transaction_id, status, payment_method, paid_at, period_start, period_end, is_upgrade/is_downgrade, previous_tier. RLS: owner reads own rows; service_role writes.

New table `public.subscription_events`: dealer_id, event_type, previous/new tier + status, metadata jsonb. RLS: owner reads own rows.

Grants: `authenticated` SELECT on both new tables; `service_role` ALL. No anon.

Enum types `subscription_tier` and `subscription_status` for type safety.

## Edge functions

1. `paystack-initialize` (verify_jwt via getClaims) — takes `{ tier }`, validates user is an approved dealer, creates a Paystack transaction via `POST /transaction/initialize` with a unique reference and `callback_url` back to `/dashboard/dealer?paystack_ref=...`, returns the `authorization_url`. This is safer than inline JS handling amounts client-side.
2. `paystack-verify` (verify_jwt) — takes `{ reference }`, calls `GET /transaction/verify/:ref`, on success updates the caller's `profiles` row (tier, status, expiry = now + 30d, limit, customer & authorization codes), inserts a `subscription_transactions` row and a `subscription_created` / `tier_upgraded` event. Idempotent on `paystack_reference`.
3. `paystack-webhook` (verify_jwt = false, signature-verified) — validates `x-paystack-signature` HMAC-SHA512 against raw body using `PAYSTACK_WEBHOOK_SECRET`. Handles `charge.success` (renew: extend 30d, insert transaction + `subscription_renewed` event), `charge.failed` (set `past_due`, log `payment_failed`), `subscription.disable` (set `cancelled`, `auto_renew=false`).
4. `paystack-charge-renewals` (verify_jwt = false, called by pg_cron daily) — finds profiles with `active` + `auto_renew=true` + `expires_at < now() + 1 day`, charges saved authorization via `POST /transaction/charge_authorization`. Also downgrades any `active` rows whose `expires_at < now() - 3 days` (grace expired) to free.

Config: `paystack-webhook` and `paystack-charge-renewals` get `verify_jwt = false` blocks in `supabase/config.toml`.

## Frontend

- `this subcription tier tab should be created in the dealer dashboard and shouldn't be available to the public`  
`src/lib/subscriptionTiers.ts` — tier constants, `hasFeature`, `canAddListing`, `formatPrice` helpers. Uses lowercase ids matching the DB enum.
- `src/services/paystackService.ts` — thin wrapper calling `supabase.functions.invoke('paystack-initialize', { body: { tier } })`, then `window.location.href = authorization_url`. No inline SDK, no client-held amounts.
- `src/hooks/useSubscription.ts` — returns `{ tier, status, expiresAt, limit, listingCount, hasFeature }` from `profiles` + `vehicles` count.
- `src/components/dealer/SubscriptionCard.tsx` — current plan badge, usage bar (green/amber/red at 70/90%), renewal date, past-due banner, "Upgrade to Standard/Premium" buttons. Rendered in `DealerDashboard`.
- `src/components/modals/UpgradeModal.tsx` — reusable "feature locked" modal with feature name/description, required tier, price, "Upgrade" CTA.
- `src/pages/DealerDashboard.tsx` — on mount, if URL has `?paystack_ref=…`, invoke `paystack-verify`, show success/failure toast, refresh profile, strip query param.
- `InventoryTab.tsx` — block "Add Vehicle" beyond `monthly_listing_limit` and open `UpgradeModal`.
- `ProductPage.tsx` (dealer-tools) — pricing CTAs route authenticated dealers to `subscribe(tier)`; unauthenticated → `/auth?next=/dashboard/dealer&intent=subscribe:tier`.

## Secrets

Requested via the secure form (never in code): `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`. Public key `VITE_PAYSTACK_PUBLIC_KEY` added to `.env` (safe to expose, though the redirect flow above doesn't actually need it — kept only if we later add inline checkout).

## Cron

Enable `pg_cron` + `pg_net`. Schedule `paystack-charge-renewals` daily at 02:00 Africa/Nairobi. Scheduled via `supabase--insert` (not migration) so remixers don't inherit it.

## Not touched

Escrow, buyer flows, admin dashboard, importer flow, other product pages, auth flow, existing RLS on unrelated tables.

## Follow-ups after implementation

1. Paystack dashboard: add webhook URL for the deployed `paystack-webhook` function and paste the signing secret into the secure form.
2. Test in Paystack test mode end-to-end (card + M-Pesa) before switching keys.