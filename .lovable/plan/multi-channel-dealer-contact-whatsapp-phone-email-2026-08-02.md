# Multi-Channel Dealer Contact (WhatsApp, Phone, Email)

Give buyers three native ways to reach a dealer — WhatsApp chat, phone call, and email — with the vehicle details pre-filled, and give dealers control over which ones are public.

## Current state (verified)

- `profiles` already has `whatsapp_number`. It does **not** have `phone_number`, `email_public`, or any show/hide flags.
- The public-facing dealer data comes from the `public_dealer_profiles` view (name, whatsapp, address, city, coords, rating). Dealer `email` is deliberately excluded — a past security fix removed public email exposure, so any new public email must be a separate opt-in field, never the login email.
- The vehicle detail page has a WhatsApp-only contact card.
- Dealer Settings has a Phone Number input that is cosmetic only ("Phone number storage coming soon").
- The Store Locator dealer list shows name/distance/address with no contact actions.
- There is **no** standalone dealer profile page/route in the app today.

## What gets built

1. **Database**: add `phone_number`, `email_public`, and `show_whatsapp` / `show_phone` / `show_email` flags to profiles. Rebuild `public_dealer_profiles` so it only exposes each contact value when the dealer has switched it on.
2. **Contact utilities**: one shared module that builds `wa.me`, `tel:`, and `mailto:` links, generates the vehicle-specific message/subject/body, validates and formats Kenyan/international numbers, and reports which methods are active.
3. **Dealer Settings**: a Contact Information card with WhatsApp, phone, and public email fields, a visibility toggle per field, inline validation, a live "active methods" summary, and real saving (replaces the placeholder phone field).
4. **Reusable contact card**: `full` variant (large labelled buttons + formatted contact lines) and `compact` variant (small icon buttons) — renders nothing when the dealer has no enabled method.
5. **Vehicle detail page**: full contact card in the sidebar under the dealer/map block, pre-filled with year/make/model. The existing WhatsApp button and its contact-request logging stay as-is.
6. **Store Locator**: compact contact buttons inside each dealer card, wired so they don't trigger the card's select-on-click.
7. **Dealer profile page**: not present in the app. The contact card is built so it can drop in unchanged when that page exists — no new route is added in this pass unless you want one.

## Technical notes

- Migration: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ...` for the five new columns (booleans default `true`), then `CREATE OR REPLACE VIEW public.public_dealer_profiles` with `security_invoker = true`, returning `CASE WHEN show_x THEN value END` for each contact field. No new tables, so no new grants/RLS beyond re-granting `SELECT` on the view to `anon`/`authenticated`.
- New files: `src/utils/contactUtils.ts`, `src/components/contact/DealerContactCard.tsx`, `src/components/dealer/DealerSettingsContact.tsx`.
- Edited files: `src/components/dashboard/SettingsPanel.tsx` (mount the contact card, drop the placeholder phone field), `src/pages/VehicleDetail.tsx` (select the new fields, render the card), `src/pages/Stores.tsx` + `LocatorDealer` type (select and pass contact fields), `src/components/maps/StoreLocatorMap.tsx` popups stay unchanged.
- Styling uses existing shadcn `Button`/`Card`/`Input`/`Switch` and semantic tokens — no hardcoded colours, no emoji-only buttons; WhatsApp/Phone/Mail lucide icons with text labels. Buttons stack full-width on mobile.
- All links open via standard anchors (`target="_blank"` + `rel="noopener noreferrer"` for wa.me), so no API keys, no backend calls.
- Validation with the shared helpers: 9–15 digits for phones, standard email regex, at least one method required before save.
