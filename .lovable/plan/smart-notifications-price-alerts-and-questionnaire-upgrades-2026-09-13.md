# Smart notifications, price alerts, and questionnaire upgrades

Three pieces of work: finish the questionnaire flow verification, make the questionnaire multi-select with a higher budget ceiling, and build the notification system on top of saved preferences.

## 1. Questionnaire changes

- Every choice question becomes multi-select ("pick all that apply", with a sensible cap per question). Single-answer behaviour stays only where a single answer is the only sensible one: the in-transit yes/no, the buying timeline, and the alert frequency.
- Budget slider ceiling rises from KES 10M to KES 200M, with larger steps above 10M so the slider stays usable.
- Matching treats a multi-answer as "any of these counts as a match", so wider answers do not lower scores.
- Existing saved profiles keep working — single stored values are read as a one-item list.
- Verify the full flow end to end in the preview: answer, save, see matches on the marketplace, see the profile in the buyer dashboard.

## 2. Notifications: what buyers get

**Triggers**
- New listing scoring 70+ against a saved profile.
- Price drop of 5% or more on a vehicle the buyer viewed or saved in the last 30 days (max 3 per buyer per run).
- Tracked-vehicle milestones (port arrival, customs, warehouse, ready, sold) on vehicles matching a profile.

**Frequency**, defaulted from the buying timeline and overridable in settings:
- Actively looking: alerts as they happen.
- Seriously considering: one daily digest.
- Planning ahead: one weekly digest (Sunday evening).

**Delivery channels**
- In-app: the navbar bell becomes real — unread count, last 20 alerts, click goes to the vehicle or tracking page, alerts clear after 7 days.
- Email: daily and weekly digests with vehicle cards and one-click unsubscribe.
- WhatsApp: an important limitation — the app cannot send WhatsApp messages to buyers on its own; that requires a WhatsApp Business sending account, which is not connected. What it will do instead is include a "send to my WhatsApp" action on each alert that opens the message ready to send, and keep the WhatsApp toggle in settings so it switches on the day a sending account is added. Everything else (matching, batching, quiet hours, logging) works regardless.

**Quiet hours and limits**: nothing is delivered between 10pm and 7am (held for morning), at most 3 instant alerts per buyer per day, plus snooze for 24 hours, 1 week, or 1 month.

**Smart tier adjustment**: three saves or five alert clicks move a "planning ahead" buyer up to daily; no clicks for two weeks moves an "actively looking" buyer down to daily; a re-engagement email after seven silent days.

## 3. Notification settings

A new "Notifications" section in the buyer dashboard: master on/off, frequency, per-channel toggles, quiet hours, digest time and day, per-type toggles (new matches, price drops, tracking updates), and snooze.

## 4. Admin

The existing Buyer Demand panel gains delivery counts: alerts created, delivered, and clicked over the last 30 days — aggregate only, no individual buyers.

## Technical notes

- Questionnaire multi-select: migrate `buyer_preferences` single-value text columns to `text[]` (backfilled from existing values), widen the price ceiling, and update `buildQuestions.ts`, `QuestionCard.tsx`, `PreferenceSummary.tsx`, and `preferenceMatching.ts` (any-of scoring).
- New tables with owner-only RLS plus grants: `notifications`, `notification_preferences`, `price_history`, `notification_delivery_log`, and a lightweight `vehicle_views` table to know what a buyer looked at.
- Triggers: an insert trigger on `vehicles` and an insert trigger on `vehicle_tracking_updates` enqueue candidate work; a price-change trigger writes `price_history`.
- Edge functions: `process-notifications` (matches queued work to profiles, applies tier, quiet hours, caps, writes notification rows), `send-notification-digests` (daily 8am and weekly Sunday 5pm batches, sends email via the existing email path). Both are bounded per run, single-flight locked via a lease row, idempotent per notification, and pause on credit/permission failures.
- Scheduling via pg_cron: one hourly pass for queued/instant work and the digest windows. Cadence and cost trade-off confirmed before creating them.
- Matching reuses `scoreVehicle` — the scoring rules are ported to the edge function so client and server agree.
- Front end: `useNotifications` hook with realtime subscription, rewritten `src/components/navbar/NotificationBell.tsx`, `NotificationSettings` panel in the buyer dashboard, "Alert me on price drops" action on the vehicle detail page.

## Out of scope

SMS, custom keyword alerts, favourite-importer alerts, and automated WhatsApp sending until a sending account is connected.
