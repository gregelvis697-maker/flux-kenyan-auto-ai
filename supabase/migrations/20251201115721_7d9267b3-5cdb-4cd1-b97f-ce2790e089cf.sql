-- Add foreign key from user_roles to profiles for proper joins
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from approval_audit to profiles
ALTER TABLE public.approval_audit 
ADD CONSTRAINT approval_audit_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.approval_audit 
ADD CONSTRAINT approval_audit_performed_by_profiles_fkey 
FOREIGN KEY (performed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add email_log table for tracking verification emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs" ON public.email_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert email logs" ON public.email_logs
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add RLS policy for importers to view available import requests
CREATE POLICY "Importers can view available requests" ON public.dealer_import_requests
FOR SELECT USING (
  has_role(auth.uid(), 'importer') AND status = 'requested'
);

-- Add RLS policy for importers to accept import requests
CREATE POLICY "Importers can accept available requests" ON public.dealer_import_requests
FOR UPDATE USING (
  has_role(auth.uid(), 'importer') AND 
  (status = 'requested' OR importer_id = auth.uid())
) WITH CHECK (
  has_role(auth.uid(), 'importer')
);