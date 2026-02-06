

# Password Reset Functionality

## Overview
Add complete forgot/reset password flow with two new pages and a small modification to the existing login page.

## Changes

### 1. Modify Auth.tsx (Login Page)
- Add a "Forgot Password?" link visible only in login mode
- Position it between the Sign In button and the toggle link, centered
- Styled as a small blue underlined link pointing to `/reset-password`

### 2. Create ResetPassword.tsx (`/reset-password`)
New page matching the existing Auth page design (same gradient background, Card component, back arrow):
- Title: "Reset Your Password"
- Subtitle explaining the process
- Email input with Mail icon (matching Auth page style)
- Zod validation for email format
- "Send Reset Link" button with loading spinner
- On success: green success alert with CheckCircle icon replaces the form
- On error: toast notification with error details
- "Back to Login" link at bottom
- Uses `supabase.auth.resetPasswordForEmail()` with redirect to `${window.location.origin}/update-password`
- Auto-focus on email input

### 3. Create UpdatePassword.tsx (`/update-password`)
New page users land on after clicking the email link:
- Title: "Create New Password"
- Two password fields: New Password and Confirm Password
- Password requirements text below fields (min 12 chars, uppercase, lowercase, number, special char -- matching existing policy)
- Zod validation: passwords match + meets strength requirements
- Uses `supabase.auth.updateUser({ password })` to set new password
- On success: green alert with "Redirecting to login..." + auto-redirect after 3 seconds
- On error: red alert for expired/invalid tokens with link to request new reset
- Auto-focus on new password input
- "Back to Login" link

### 4. Update App.tsx (Routes)
- Import both new pages
- Add two new public routes: `/reset-password` and `/update-password`

## Technical Details

### Files Created
| File | Purpose |
|------|---------|
| `src/pages/ResetPassword.tsx` | Email submission form for password reset request |
| `src/pages/UpdatePassword.tsx` | New password form after clicking email link |

### Files Modified
| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add "Forgot Password?" link in login mode (lines 176-177, add link after button) |
| `src/App.tsx` | Add imports and routes for both new pages |

### Password Validation
The update page will enforce the same password policy already in place:
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Mobile Responsiveness
- All inputs use `h-11 sm:h-10` (48px+ on mobile) matching existing Auth page
- Buttons full-width with same height pattern
- Text uses `text-base sm:text-sm` (16px on mobile)
- Card max-width `max-w-md` (matching Auth page)
- Proper spacing with `space-y-4`

### Styling Approach
Both new pages will reuse the exact same layout pattern from Auth.tsx:
- `min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5`
- Card with `border-border/50 bg-card/80 backdrop-blur-sm shadow-card`
- ArrowLeft back link in top-left corner
- Icons inside input fields with `pl-10` padding
on top of all this ensure to test the workflow we are creating here that is this password reset and make sure nothing breaks from the current state


