-- Enable pgcrypto (for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('dealer', 'buyer', 'importer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (for public waitlist form)
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Service role (backend) can view all entries
CREATE POLICY "Service role can view all entries"
ON public.waitlist
FOR SELECT
TO service_role
USING (true);

-- Optional: Allow service role to delete or update (for admin dashboards later)
CREATE POLICY "Service role can modify entries"
ON public.waitlist
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);