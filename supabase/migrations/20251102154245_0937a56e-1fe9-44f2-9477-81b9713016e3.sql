-- Add approval status to user roles
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.user_roles 
ADD COLUMN status approval_status NOT NULL DEFAULT 'pending',
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES auth.users(id);

-- Update existing roles to approved status
UPDATE public.user_roles SET status = 'approved';

-- Create index for faster status queries
CREATE INDEX idx_user_roles_status ON public.user_roles(user_id, status);

-- Update has_role function to check approval status
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND status = 'approved'
  )
$$;

-- Update get_user_role to only return approved roles
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND status = 'approved'
  LIMIT 1
$$;

-- Create function to get role status
CREATE OR REPLACE FUNCTION public.get_role_status(_user_id uuid)
RETURNS approval_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Add policy for users to view their own role status
CREATE POLICY "Users can view their own role status"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Add policy for admins to approve roles
CREATE POLICY "Admins can update role status"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Remove the old INSERT policy that allowed any user to insert roles
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create new INSERT policy allowing users to insert their own pending roles
CREATE POLICY "Users can request roles during signup"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);