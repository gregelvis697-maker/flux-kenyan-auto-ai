-- 1) Ensure api schema exists
CREATE SCHEMA IF NOT EXISTS api;

-- 2) Create api.waitlist table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS api.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  email text NOT NULL CHECK (char_length(email) > 0 AND char_length(email) <= 255),
  role text NOT NULL CHECK (char_length(role) > 0 AND char_length(role) <= 50)
);

-- 3) Add a unique index on lower(email) to prevent duplicates (case-insensitive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'api' AND indexname = 'ux_waitlist_email'
  ) THEN
    CREATE UNIQUE INDEX ux_waitlist_email ON api.waitlist (lower(email));
  END IF;
END $$;

-- 4) Copy data from public.waitlist if it exists, ignoring duplicates by email
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'waitlist'
  ) THEN
    INSERT INTO api.waitlist (id, created_at, name, email, role)
    SELECT id, created_at, name, email, role
    FROM public.waitlist
    ON CONFLICT (lower(email)) DO NOTHING;
  END IF;
END $$;

-- 5) Enable Row Level Security
ALTER TABLE api.waitlist ENABLE ROW LEVEL SECURITY;

-- 6) Create RLS policies
DO $$
BEGIN
  -- Allow anonymous inserts (public users) to join the waitlist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='api' AND tablename='waitlist' AND policyname='Anyone can join waitlist'
  ) THEN
    CREATE POLICY "Anyone can join waitlist"
    ON api.waitlist
    FOR INSERT
    TO anon
    WITH CHECK (true);
  END IF;

  -- Service role can do anything (although it bypasses RLS, we add explicit policies for clarity)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='api' AND tablename='waitlist' AND policyname='Service role can modify entries'
  ) THEN
    CREATE POLICY "Service role can modify entries"
    ON api.waitlist
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='api' AND tablename='waitlist' AND policyname='Service role can view all entries'
  ) THEN
    CREATE POLICY "Service role can view all entries"
    ON api.waitlist
    FOR SELECT
    TO service_role
    USING (true);
  END IF;
END $$;

-- 7) Drop old public.waitlist table if present (after data copy)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'waitlist'
  ) THEN
    DROP TABLE public.waitlist;
  END IF;
END $$;