-- Enums
DO $$ BEGIN
  CREATE TYPE public.subscription_tier AS ENUM ('free','standard','premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('inactive','active','past_due','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier public.subscription_tier NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status public.subscription_status NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_auto_renew BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
  ADD COLUMN IF NOT EXISTS paystack_authorization_code TEXT,
  ADD COLUMN IF NOT EXISTS monthly_listing_limit INTEGER NOT NULL DEFAULT 3;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires_at ON public.profiles(subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_customer_code ON public.profiles(paystack_customer_code);

-- subscription_transactions
CREATE TABLE IF NOT EXISTS public.subscription_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier public.subscription_tier NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  paystack_reference TEXT NOT NULL UNIQUE,
  paystack_transaction_id TEXT,
  paystack_customer_code TEXT,
  paystack_authorization_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  is_upgrade BOOLEAN NOT NULL DEFAULT false,
  is_downgrade BOOLEAN NOT NULL DEFAULT false,
  previous_tier public.subscription_tier,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_tx_dealer ON public.subscription_transactions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_sub_tx_status ON public.subscription_transactions(status);
CREATE INDEX IF NOT EXISTS idx_sub_tx_paid_at ON public.subscription_transactions(paid_at);

GRANT SELECT ON public.subscription_transactions TO authenticated;
GRANT ALL ON public.subscription_transactions TO service_role;

ALTER TABLE public.subscription_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers read own transactions"
  ON public.subscription_transactions FOR SELECT
  TO authenticated
  USING (dealer_id = auth.uid());

-- subscription_events
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  previous_tier public.subscription_tier,
  new_tier public.subscription_tier,
  previous_status public.subscription_status,
  new_status public.subscription_status,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_dealer ON public.subscription_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_type ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sub_events_created ON public.subscription_events(created_at);

GRANT SELECT ON public.subscription_events TO authenticated;
GRANT ALL ON public.subscription_events TO service_role;

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers read own events"
  ON public.subscription_events FOR SELECT
  TO authenticated
  USING (dealer_id = auth.uid());

-- updated_at trigger for transactions (reuse existing update_updated_at fn)
DROP TRIGGER IF EXISTS trg_sub_tx_updated_at ON public.subscription_transactions;
CREATE TRIGGER trg_sub_tx_updated_at
  BEFORE UPDATE ON public.subscription_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
