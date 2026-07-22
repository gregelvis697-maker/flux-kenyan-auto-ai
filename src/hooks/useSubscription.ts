import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
  type TierFeatures,
  hasFeature as tierHasFeature,
} from '@/lib/subscriptionTiers';

export type SubscriptionStatus = 'inactive' | 'active' | 'past_due' | 'cancelled';

export interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: string | null;
  startedAt: string | null;
  autoRenew: boolean;
  limit: number;
  listingCount: number;
  loading: boolean;
  hasFeature: (feature: keyof TierFeatures) => boolean;
  refresh: () => Promise<void>;
}

export function useSubscription(userId: string | undefined): SubscriptionState {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [status, setStatus] = useState<SubscriptionStatus>('inactive');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [limit, setLimit] = useState<number>(3);
  const [listingCount, setListingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [{ data: profile }, { count }] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'subscription_tier, subscription_status, subscription_expires_at, subscription_started_at, subscription_auto_renew, monthly_listing_limit',
          )
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('dealer_id', userId)
          .eq('is_sold', false),
      ]);

      const t = (profile?.subscription_tier ?? 'free') as SubscriptionTier;
      setTier(t);
      setStatus((profile?.subscription_status ?? 'inactive') as SubscriptionStatus);
      setExpiresAt(profile?.subscription_expires_at ?? null);
      setStartedAt(profile?.subscription_started_at ?? null);
      setAutoRenew(profile?.subscription_auto_renew ?? true);
      setLimit(profile?.monthly_listing_limit ?? SUBSCRIPTION_TIERS[t].listingLimit);
      setListingCount(count ?? 0);
    } catch (err) {
      console.error('useSubscription load failed', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    tier,
    status,
    expiresAt,
    startedAt,
    autoRenew,
    limit,
    listingCount,
    loading,
    hasFeature: (feature) => tierHasFeature(tier, feature),
    refresh: load,
  };
}
