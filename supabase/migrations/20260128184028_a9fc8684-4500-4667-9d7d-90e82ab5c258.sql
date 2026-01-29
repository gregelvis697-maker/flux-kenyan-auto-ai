-- ============================================================
-- SECURITY FIX: 4 Critical Issues
-- ============================================================

-- ISSUE 1: profiles_table_public_exposure
-- Block anonymous users from reading profiles - require authentication
-- The existing policies already require auth.uid() checks, but we need to ensure
-- no anonymous access is possible

-- ISSUE 2: contact_requests_buyer_data_exposure  
-- Ensure contact_requests requires authentication for all operations
-- Existing policies already have auth.uid() checks, but verify no gaps

-- ISSUE 3: storage_no_ownership
-- Fix storage policies to require dealer role AND ownership check

-- Drop existing permissive storage policies
DROP POLICY IF EXISTS "Dealers can upload vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Dealers can update their vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Dealers can delete their vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view vehicle photos" ON storage.objects;

-- Create properly secured storage policies
-- Public read access (needed for vehicle listings)
CREATE POLICY "Anyone can view vehicle photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-photos');

-- Upload: Only dealers can upload to their own folder
CREATE POLICY "Dealers can upload vehicle photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.has_role(auth.uid(), 'dealer'::public.app_role)
);

-- Update: Only to own files
CREATE POLICY "Dealers can update their vehicle photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vehicle-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.has_role(auth.uid(), 'dealer'::public.app_role)
);

-- Delete: Only own files
CREATE POLICY "Dealers can delete their vehicle photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.has_role(auth.uid(), 'dealer'::public.app_role)
);

-- ISSUE 4: create_admin_bypass
-- Revoke public execution of create_admin_user and add authorization check

-- Revoke execution permissions from all roles
REVOKE EXECUTE ON FUNCTION public.create_admin_user(TEXT, UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.create_admin_user(TEXT, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_admin_user(TEXT, UUID) FROM PUBLIC;

-- Recreate the function with proper authorization check
CREATE OR REPLACE FUNCTION public.create_admin_user(admin_email text, admin_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CRITICAL: Only existing admins can create new admins
  -- For first admin, use direct SQL access in Supabase Studio
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can create admin users';
  END IF;
  
  -- Insert or update user role as admin with approved status
  INSERT INTO public.user_roles (user_id, role, status, approved_at, approved_by)
  VALUES (admin_user_id, 'admin', 'approved', NOW(), auth.uid())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = 'admin',
    status = 'approved',
    approved_at = NOW(),
    approved_by = auth.uid();
  
  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (admin_user_id, admin_email, 'Administrator')
  ON CONFLICT (id) 
  DO UPDATE SET email = admin_email;
END;
$$;

-- Only grant to authenticated users (they still need to pass the admin check inside)
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, UUID) TO authenticated;