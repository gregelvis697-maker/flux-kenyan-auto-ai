ALTER POLICY "Admins can view all vehicles" ON public.vehicles TO authenticated;
ALTER POLICY "Admins can update vehicles for verification" ON public.vehicles TO authenticated;
ALTER POLICY "Dealers can view their own vehicles" ON public.vehicles TO authenticated;
ALTER POLICY "Dealers can create vehicles" ON public.vehicles TO authenticated;
ALTER POLICY "Dealers can update their own vehicles" ON public.vehicles TO authenticated;
ALTER POLICY "Dealers can delete their own vehicles" ON public.vehicles TO authenticated;

ALTER POLICY "Admins can view all profiles" ON public.profiles TO authenticated;
ALTER POLICY "Dealers can view importer profiles for their requests" ON public.profiles TO authenticated;
ALTER POLICY "Importers can view dealer profiles for assigned requests" ON public.profiles TO authenticated;
ALTER POLICY "Users can view their own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can update their own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can insert their own profile" ON public.profiles TO authenticated;

ALTER POLICY "Importers can view assigned requests" ON public.dealer_import_requests TO authenticated;
ALTER POLICY "Importers can view available requests" ON public.dealer_import_requests TO authenticated;
ALTER POLICY "Importers can accept available requests" ON public.dealer_import_requests TO authenticated;
ALTER POLICY "Importers can update assigned requests" ON public.dealer_import_requests TO authenticated;
ALTER POLICY "Admins can view all import requests" ON public.dealer_import_requests TO authenticated;
ALTER POLICY "Dealers can create import requests" ON public.dealer_import_requests TO authenticated;
ALTER POLICY "Dealers can update their own import requests" ON public.dealer_import_requests TO authenticated;
ALTER POLICY "Dealers can view their own import requests" ON public.dealer_import_requests TO authenticated;

ALTER POLICY "Admins can update role status" ON public.user_roles TO authenticated;
ALTER POLICY "Track admin approvals" ON public.user_roles TO authenticated;

ALTER POLICY "Admins can view approval audit" ON public.approval_audit TO authenticated;
ALTER POLICY "Admins can insert audit logs" ON public.approval_audit TO authenticated;

ALTER POLICY "Admins can insert email logs" ON public.email_logs TO authenticated;
ALTER POLICY "Admins can view email logs" ON public.email_logs TO authenticated;

ALTER POLICY "Admins can view email templates" ON public.email_templates TO authenticated;
ALTER POLICY "Admins can insert email templates" ON public.email_templates TO authenticated;
ALTER POLICY "Admins can update email templates" ON public.email_templates TO authenticated;

ALTER POLICY "Admins can view waitlist" ON public.waitlist TO authenticated;
ALTER POLICY "Admins can update waitlist" ON public.waitlist TO authenticated;
ALTER POLICY "Admins can delete waitlist" ON public.waitlist TO authenticated;