// Custom Supabase client wrapper that ensures 'public' schema is used
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jrieqgrdiwwroliehlhn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaWVxZ3JkaXd3cm9saWVobGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDM5NzgsImV4cCI6MjA3Njc3OTk3OH0.rhsM_CtZnPzQ2lvjc-7rCy56WZqYgC_-5qI_hgW4Yy4";

// Create client with explicit 'public' schema
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});
