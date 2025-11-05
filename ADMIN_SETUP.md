# Admin User Setup Guide

This document explains how to create and manage admin users in the Flux MVP application.

## Important Security Note

Admin accounts **cannot** be created through the normal signup flow or automatically during login. They must be created manually by database administrators to prevent unauthorized privilege escalation.

## Creating an Admin User

Admin users must be created in two steps:

### Step 1: Create the Auth User

1. Open your backend dashboard
2. Navigate to Authentication → Users
3. Click "Add User" or "Create New User"
4. Enter the admin's email address
5. Set a secure password (recommend 16+ characters with complexity)
6. Confirm the user creation

### Step 2: Assign Admin Role

After creating the auth user, you need to assign the admin role in the database.

#### Option A: Using the Backend Dashboard (SQL Editor)

1. Open your backend dashboard
2. Navigate to the SQL Editor
3. Run the following query, replacing the email address:

```sql
SELECT public.create_admin_user(
  'admin@example.com'::text,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com')::uuid
);
```

#### Option B: Using the Database Tables

1. Open your backend dashboard
2. Navigate to Table Editor → user_roles
3. Click "Insert" → "Insert Row"
4. Fill in:
   - `user_id`: Copy the UUID from auth.users for your admin
   - `role`: Select "admin"
   - `status`: Select "approved"
   - `approved_at`: Set to current timestamp
5. Save the row

## Admin Login Process

Once an admin user is created with proper role assignment:

1. Navigate to the `/auth` page
2. Enter the admin email and password
3. Click "Sign In"
4. The system will verify the admin role exists
5. You'll be redirected to `/admin/dashboard`

**Important:** If a user tries to login without an assigned role, they will see the error "Account not properly configured. Please contact an administrator." This is a security feature to prevent unauthorized access.

## Security Considerations

- **Never** create admin accounts through the public signup form
- **Never** rely on automatic admin creation during login
- Admin creation requires direct database access by authorized personnel
- All admin creations should be logged and audited
- Use strong passwords for admin accounts (16+ characters recommended)
- Consider enabling two-factor authentication for admin accounts
- Regularly review the list of admin users
- Remove admin access immediately when no longer needed
- Do not share admin credentials

## Verifying Admin Access

To verify an admin user was created correctly:

```sql
SELECT 
  u.email,
  ur.role,
  ur.status,
  ur.created_at,
  ur.approved_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

## Troubleshooting

### "Account not properly configured" Error

If a user sees this error when logging in, it means:
- The auth user exists in `auth.users`, but no role is assigned in `user_roles` table
- **For admins:** Follow Step 2 above to assign the admin role manually
- **For regular users:** This indicates a signup failure - they should contact support

This error is a security feature that prevents users without proper role assignment from accessing the system.

### Admin Can't Access Dashboard

1. Verify the user has an 'admin' role in the `user_roles` table
2. Check that `status` is set to 'approved'
3. Ensure `approved_at` timestamp is set
4. Verify the email matches exactly in both `auth.users` and the role query
5. Try logging out completely and logging in again
6. Check browser console for any error messages

## Best Practices

1. **Document All Admin Accounts**: Keep a secure record of who has admin access and when it was granted
2. **Use Strong Passwords**: Enforce password complexity for admin accounts (16+ characters minimum)
3. **Regular Audits**: Review admin access quarterly at minimum
4. **Principle of Least Privilege**: Only create admin accounts when absolutely necessary
5. **Immediate Revocation**: Remove admin access as soon as it's no longer needed
6. **Two-Factor Authentication**: Enable 2FA for all admin accounts when available
7. **Separate Admin Accounts**: Never use personal accounts as admin accounts
8. **Audit Logging**: Monitor all admin actions via the `approval_audit` table

## Revoking Admin Access

To remove admin privileges:

```sql
-- Option 1: Change role to regular user type
UPDATE public.user_roles 
SET role = 'buyer', status = 'approved'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');

-- Option 2: Delete the user entirely (recommended for terminated employees)
DELETE FROM auth.users WHERE email = 'admin@example.com';
-- Note: This will cascade delete the user_roles entry due to foreign key constraints
```

## Security Architecture

The admin system is designed with defense-in-depth:

1. **No Client-Side Admin Creation**: Signup form explicitly blocks admin role selection
2. **No Auto-Promotion**: Login flow will NOT automatically create admin roles
3. **Database-Level Controls**: RLS policies prevent unauthorized role assignments
4. **Explicit Manual Process**: Admins must be created through controlled database access
5. **Role Verification**: Every login verifies role exists before granting access
6. **Audit Trail**: All admin approvals/rejections logged in `approval_audit` table

This multi-layered approach prevents privilege escalation attacks and ensures admin access is tightly controlled.
