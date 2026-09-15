# Flux redesign + finishing the alerts work

Two tracks: a full visual reset of the platform against the reference design, and completing the notification work left over from yesterday.

## Skills

The taste and impeccable skills you gave commands for are already present in the project (the taste skill pack and the impeccable reviewers). They are used as the design and finishing standard for this work — no re-install needed.

## 1. Visual reset (whole platform)

Reference-driven direction, taken from the image you shared:

- Deep near-black navy canvas, single electric-cyan accent, thin hairline borders, generous negative space. No gradient-on-white, no purple, no decorative blur soup.
- Bold tight-tracked display headings with one cyan-highlighted word; small uppercase eyebrow labels; quiet grey body copy.
- Compact top bar: wordmark left, flat text links centre, theme toggle + Sign In + filled cyan Register right.
- Hero: left column (eyebrow chip, two-line headline, one-sentence subhead, search field with inline cyan "Search Cars" button, popular-make chips), right column a single full-bleed vehicle image with a floating three-item feature stack.
- Stats rail directly under the hero: four icon + number + label blocks separated by thin dividers. Numbers stay live from your data.
- Cards, tables, filters, dashboard panels, forms and buttons all re-based on the same tokens so dashboards match the public site.

### Landing page: less storytelling, more product

The page is cut down to what Flux does:

1. Hero
2. Live stats rail
3. "Everything you need in one platform" — four short capability tiles beside a product visual
4. Featured inventory (live listings)
5. One compact trust/verification strip
6. Single closing call to action + footer

Removed or folded in: the long problem/solution narrative, the persona section, the business-model section, the market-intelligence essay, and the separate CTA banner. Their few real points survive as one-line tiles.

### Rename

"Build Your Perfect Vehicle" becomes "Describe Your Perfect Vehicle" everywhere — homepage entry point, questionnaire page, dashboard section, buttons and copy. The `/build` link keeps working; `/describe` becomes the main address.

## 2. Finishing the alerts work

- **Alert me on price drops** — a button on each vehicle page that registers interest in that listing's price.
- **Delivery summary in the admin demand panel** — alerts created, delivered and clicked over 30 days, shown in the normal view, not only the empty state.
- **Matching + sending jobs** — a background job that turns queued events (new listing scoring 70+, price drop of 5% or more, tracking milestones) into alerts honouring each buyer's frequency, quiet hours and daily cap; plus daily 8am and weekly Sunday 5pm email digests.
- **Schedules** — the matching pass runs hourly and the digest windows run once a day. Hourly is the least frequent cadence that still makes "as it happens" alerts feel live; it means an instant alert can be up to an hour late, and a recurring job keeps the database awake, which adds a small ongoing cost.
- **WhatsApp** stays a tap-to-send link per alert until a WhatsApp Business sending account is connected.
- **End-to-end check in the preview**: answer the questionnaire, save, see matches, trigger a price drop, confirm the bell and the digest both fire.

## Technical notes

- Redesign lands in `src/index.css` + `tailwind.config.ts` tokens (background, surface, hairline border, cyan primary, radii, shadows) and in shadcn variants — no hardcoded colour utilities in components.
- Landing rebuild: `Hero.tsx` recomposed, stats rail component fed by `usePlatformStats`, capability tiles + `FeaturedInventory` retained; `ProblemSection`, `SolutionSection`, `Personas`, `BusinessModel`, `MarketIntelligence`, `CtaBanner` dropped from `Index.tsx`.
- Rename touches `src/pages/BuildYourPerfect.tsx` (moved to `DescribeYourPerfect.tsx`), `MyPerfectVehicleTab.tsx`, `App.tsx` routes (`/describe` primary, `/build` redirect), and nav/CTA copy.
- New edge functions `process-notifications` and `send-notification-digests`, both bounded per run, single-flight leased, idempotent, pausing on credit or permission failures; `scoreVehicle` rules ported server-side. Scheduled with pg_cron.
- Price-drop interest reuses the existing `vehicle_views`/favourites path rather than a new table where possible.
- Verification with a scripted browser pass plus the build log.

## Out of scope

Automated WhatsApp sending, SMS, new marketing copywriting beyond trimming, and logo redesign.
