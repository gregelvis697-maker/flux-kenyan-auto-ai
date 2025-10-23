-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('dealer', 'buyer', 'importer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into waitlist (public signup)
CREATE POLICY "Anyone can sign up for waitlist"
ON public.waitlist
FOR INSERT
TO anon
WITH CHECK (true);

-- Create index for faster email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);