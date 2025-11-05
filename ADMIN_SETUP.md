# Admin User Setup Guide

## Creating Admin Accounts

Admin accounts **cannot be created through the signup form**. They must be created manually using one of these methods:

### Method 1: Using Lovable Cloud Dashboard (Recommended)

1. Open the Lovable Cloud backend dashboard
2. Navigate to Authentication > Users
3. Click "Add User" or "Invite User"
4. Enter the admin's email and set a password
5. After the user is created, note their User ID

Once the admin user is created in the auth system, their role will be automatically assigned when they first log in.

### Method 2: Using SQL (Advanced)

If you have direct database access, you can create an admin user with the following steps:

1. **First, create the auth user** (this must be done through Supabase Auth UI or API)

2. **Then, assign admin role using SQL**:
```sql
-- Replace with actual user_id from auth.users
SELECT public.create_admin_user(
  'admin@example.com',  -- Admin's email
  'USER_ID_HERE'        -- User's UUID from auth.users
);
```

## Admin Login

Admins can log in through the normal `/auth` page:
- Email: Their registered email
- Password: Their password (no strict requirements for existing admins)

After successful login:
- Admins are automatically redirected to `/admin/dashboard`
- No approval required - admins have immediate full access

## Features Available to Admins

1. **User Approval Management**
   - View all pending dealer and importer signups
   - Approve or reject with reasons
   - Search and filter by role

2. **Real-time Metrics Dashboard**
   - Total pending accounts
   - Total approved accounts
   - Total rejected accounts
   - Live updates as changes occur

3. **Activity Feed**
   - See all recent approval/rejection actions
   - View who approved/rejected and when
   - Immutable audit trail

## Security Notes

- Admin role checks are enforced at the database level via RLS policies
- The `has_role()` function validates admin status for all operations
- All admin actions are logged in the `approval_audit` table
- Audit logs cannot be modified or deleted
- Admin accounts bypass approval workflows

## Troubleshooting

**Can't log in as admin?**
- Verify the user exists in auth.users table
- Check that the user_roles table has an entry with role='admin' and status='approved'
- The system will auto-create admin role on first login if it doesn't exist

**Schema errors during signup?**
- The app now uses the 'public' schema exclusively
- All database operations reference public.table_name
- The custom Supabase client wrapper ensures correct schema usage
