# Make signup immediate and restore page backgrounds

## Outcome
- New users create an account and enter the correct workflow immediately, without an email-confirmation step.
- Buyers remain automatically approved; dealers and importers still enter the existing admin-approval workflow.
- Theme-aware automotive backgrounds are visibly present across the site in light and dark mode, while the marketplace keeps its current clean inventory background.

## Implementation
1. **Remove registration email confirmation**
   - Enable immediate account confirmation in the hosted authentication settings so signup no longer sends or waits for a verification email.
   - Keep public signup enabled and retain leaked-password protection and the existing strong password policy.
   - Remove the obsolete confirmation redirect option from the signup request.

2. **Make signup reliable and clear**
   - Preserve role creation during signup and route each successfully created account through the existing buyer/dealer/importer rules.
   - Update success messaging so buyers are sent to their dashboard and dealers/importers are told that administrator approval is pending, with no promise of a confirmation email.
   - Translate rate-limit and duplicate-account failures into concise, user-friendly feedback without exposing backend wording.
   - Prevent repeated submissions while registration is in progress.

3. **Make the automotive backgrounds visible**
   - Move the global backdrop into a reliable stacking context above the document background but behind page content.
   - Reduce or remove opaque page-level backgrounds that currently cover the imagery, using controlled overlays to maintain text contrast.
   - Make the backdrop route-aware and disable it on `/marketplace` only.
   - Retain separate light/dark automotive images, `object-fit: cover`, and breakpoint-specific focal positioning for mobile, tablet, and desktop.

4. **Verification**
   - Test a fresh buyer signup and confirm immediate authenticated dashboard access.
   - Test dealer/importer signup and confirm immediate sign-in followed by the pending-approval screen.
   - Confirm no verification email is requested and the screenshot’s email-rate-limit failure no longer affects signup.
   - Visually verify backgrounds on representative public, auth, product, and dashboard routes in both themes and mobile/desktop sizes; verify `/marketplace` has no global backdrop.

## Technical details
- Authentication configuration will use auto-confirm for email/password registrations; this changes signup confirmation only and does not bypass dealer/importer approval.
- The current hidden-background issue is caused by the fixed backdrop using a negative z-index beneath an opaque `body`, while pages such as `/auth` add another opaque gradient surface.
- No database tables, role policies, marketplace workflow, or existing account credentials will be changed.