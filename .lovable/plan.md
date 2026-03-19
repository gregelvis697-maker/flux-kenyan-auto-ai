

# Landing Page Redesign

Aesthetic overhaul of 5 existing components + Index page. Navigation links stay the same (Home, Marketplace, Waitlist). No route/database/auth changes.

---

## Files Modified (6 total)

### 1. `src/components/Hero.tsx`
- Update badge text: "KENYA'S FIRST AI-POWERED AUTOMOTIVE PLATFORM"
- Heading: "Drive Into" (white) + "The Future" (cyan gradient)
- Updated subheading with marketplace-focused copy
- CTAs: "Browse Marketplace" (cyan, links to /marketplace) + "List Your Cars" (outline, links to /auth)
- Faster animations: 400ms durations instead of 800ms
- Keep existing background image + overlay approach

### 2. `src/components/ProblemSection.tsx`
- Heading: "The" (white) + "Broken System" (red-orange gradient text)
- Subheading: "Kenya's automotive market is plagued by systemic issues..."
- Expand from 3 cards to 4 cards in 2x2 grid:
  1. Broker Dominance (Users icon, red/pink icon bg)
  2. Zero Verification (ShieldX icon, orange icon bg)
  3. Data Blackout (TrendingDown icon, red icon bg)
  4. Hidden Costs (DollarSign icon, orange icon bg)
- Each card: colored icon badge, bold title, description (no fake percentages — qualitative descriptions only)
- Card hover: scale(1.02) + border color shift
- 400ms animations with 100ms stagger

### 3. `src/components/SolutionSection.tsx`
Split into two visual sub-sections within same component:

**Part A — "The FLUX Solution"**
- Heading: "The" (white) + "FLUX Solution" (cyan)
- 6-card grid (3 cols desktop, 2 tablet, 1 mobile):
  1. Blockchain Trust (ShieldCheck, cyan icon bg)
  2. AI Intelligence (Brain, cyan icon bg)
  3. Direct Connect (Network, cyan icon bg)
  4. Market Analytics (BarChart3, cyan icon bg)
  5. Instant Verification (Zap, cyan icon bg)
  6. Secure Payments (Lock, cyan icon bg)
- Each card: icon, title, description, 3 cyan bullet points

**Part B — "Built for Every Stakeholder"**
- 4 large cards (2x2 grid desktop, 1 col mobile):
  - Importers (label: "WHOLESALE POWER"), Dealers ("MARKET LEADERS"), Buyers ("SMART SHOPPERS"), Admin ("PLATFORM CONTROL")
  - Each: cyan uppercase label, title, description, 4 feature bullets, CTA button
  - Admin card: NO CTA button (admin access moved to footer)
  - Other cards: "Get Started" outline buttons → navigate to /auth
- Keep existing role navigation logic (user ? dashboard : /auth)

### 4. `src/components/BusinessModel.tsx`
- Heading: "Sustainable" (white) + "Revenue Model" (cyan)
- Subheading: "Dual revenue streams powering growth and innovation"
- Keep the existing 2-card layout (Dealer Subscriptions + Transaction Commissions)
- Add key-value detail rows to each card:
  - Dealer Subscriptions: Premium Profiles → "Verified Badge", Monthly Plans → "From KES 2,500", AI Insights → "Included", Support → "24/7 Priority"
  - Transaction Commissions: Commission Rate → "2.5% - 5%", Processing → "Automated", Tracking → "Real-time", Settlement → "48 Hours"
- Faster animations (400ms)

### 5. `src/components/Footer.tsx`
- Expand to 5-column layout (Platform, Company, Resources, Legal + branding column)
- Add contact info: Nairobi location, email (hello@flux.co.ke), phone
- Add "Admin Portal" link in bottom bar (small, cyan, links to /admin/dashboard)
- Add Facebook social icon alongside existing Twitter/Instagram/TikTok
- Keep existing Link imports and routing

### 6. `src/components/Navigation.tsx`
- Keep ALL existing nav links (Home, Marketplace, Waitlist) — no removals
- Keep existing auth logic, profile dropdown, notification bell, mobile menu
- Only aesthetic tweaks: ensure "Join Waitlist" button has cyan styling on the waitlist link for emphasis
- No structural changes

---

## What's NOT Changed
- `src/pages/Index.tsx` — same component order (Navigation, Hero, ProblemSection, SolutionSection, BusinessModel, Footer)
- All routes, auth, database, marketplace, dashboards — untouched
- `src/index.css` — existing CSS variables already match the dark navy + cyan theme perfectly
- `tailwind.config.ts` — no changes needed

## Design Approach
- Use existing Framer Motion `useInView` pattern throughout
- Reduce all animation durations to 400ms with 100ms card stagger
- Use existing CSS variables (--primary = cyan, --card, --background, etc.)
- Mobile-first: all grids collapse to 1 column on mobile
- No new dependencies needed

