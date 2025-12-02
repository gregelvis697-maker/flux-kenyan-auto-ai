-- Enable realtime for user_roles table to track new applications
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;