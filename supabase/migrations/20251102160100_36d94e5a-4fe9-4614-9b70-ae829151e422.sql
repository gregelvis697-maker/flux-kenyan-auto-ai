-- Add rejection tracking fields to user_roles table
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create immutable approval audit table
CREATE TABLE IF NOT EXISTS public.approval_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('approved', 'rejected')),
  performed_by uuid NOT NULL REFERENCES auth.users(id),
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  role app_role NOT NULL,
  rejection_reason text,
  CONSTRAINT valid_rejection_reason CHECK (
    (action = 'rejected' AND rejection_reason IS NOT NULL) OR
    (action = 'approved' AND rejection_reason IS NULL)
  )
);

-- Enable RLS on approval_audit
ALTER TABLE public.approval_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view approval audit"
ON public.approval_audit
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert audit logs (through approved queries only)
CREATE POLICY "Admins can insert audit logs"
ON public.approval_audit
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND
  performed_by = auth.uid()
);

-- Prevent updates and deletes on audit table (immutable)
CREATE POLICY "No one can update audit logs"
ON public.approval_audit
FOR UPDATE
USING (false);

CREATE POLICY "No one can delete audit logs"
ON public.approval_audit
FOR DELETE
USING (false);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_approval_audit_user_id ON public.approval_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_audit_performed_at ON public.approval_audit(performed_at DESC);

-- Add RLS policy to track admin approvals on user_roles
CREATE POLICY "Track admin approvals"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND
  (approved_by = auth.uid() OR rejected_by = auth.uid() OR (approved_by IS NULL AND rejected_by IS NULL))
);