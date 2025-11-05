-- Ensure all tables are in public schema (already verified they are)
-- Add a function to create admin users manually without password restrictions

-- Create a function for manual admin creation (to be called via edge function or direct DB access)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update user role as admin with approved status
  INSERT INTO public.user_roles (user_id, role, status, approved_at, approved_by)
  VALUES (admin_user_id, 'admin', 'approved', NOW(), admin_user_id)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = admin_user_id;
  
  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (admin_user_id, admin_email, 'Administrator')
  ON CONFLICT (id) 
  DO UPDATE SET email = admin_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, UUID) TO authenticated;

COMMENT ON FUNCTION public.create_admin_user IS 'Creates or updates a user as admin with approved status. Use this to manually create admin accounts.';
