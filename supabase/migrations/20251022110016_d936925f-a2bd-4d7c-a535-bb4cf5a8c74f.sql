-- Ensure the api schema exists
CREATE SCHEMA IF NOT EXISTS api;

-- Grant schema usage to service_role
GRANT USAGE ON SCHEMA api TO service_role;

-- Grant full privileges on existing tables/sequences in api to service_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA api TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA api TO service_role;

-- Make future tables/sequences in api grant privileges to service_role automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;

-- Additionally, ensure explicit grants on the specific table in case it already exists but wasn't covered above
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'api' AND table_name = 'waitlist'
  ) THEN
    EXECUTE 'GRANT ALL PRIVILEGES ON TABLE api.waitlist TO service_role';
  END IF;
END $$;