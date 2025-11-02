-- Fix 1: Add admin policies for waitlist table
CREATE POLICY "Admins can view waitlist" 
ON waitlist 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update waitlist" 
ON waitlist 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete waitlist" 
ON waitlist 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Fix 2: Add unique constraint on email to prevent duplicate waitlist signups
ALTER TABLE waitlist ADD CONSTRAINT waitlist_email_unique UNIQUE (email);

-- Fix 3: Add unique constraint on user_id to enforce single role per user
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- Fix 4: Improve security definer functions with input validation
-- These functions now validate that the user exists before processing

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return false for null input without revealing if user exists
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user exists and has the role with approved status
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND ur.status = 'approved'
      -- Validate user exists in auth.users
      AND EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Return null for invalid input
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Validate user exists and get their role
  SELECT ur.role INTO user_role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.status = 'approved'
    AND EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id)
  LIMIT 1;
  
  RETURN user_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_role_status(_user_id uuid)
RETURNS approval_status
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status approval_status;
BEGIN
  -- Return null for invalid input
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Validate user exists and get their status
  SELECT ur.status INTO user_status
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id)
  LIMIT 1;
  
  RETURN user_status;
END;
$$;