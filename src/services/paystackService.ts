import { supabase } from '@/lib/supabase';
import type { SubscriptionTier } from '@/lib/subscriptionTiers';

/**
 * Initializes a Paystack transaction on the server and redirects the browser
 * to Paystack's hosted checkout. On completion Paystack returns the user to
 * /dashboard/dealer?paystack_ref=... which the dashboard verifies.
 */
export async function startSubscribeCheckout(tier: SubscriptionTier): Promise<void> {
  const { data, error } = await supabase.functions.invoke('paystack-initialize', {
    body: { tier },
  });
  if (error) throw error;
  const authUrl = (data as { authorization_url?: string } | null)?.authorization_url;
  if (!authUrl) throw new Error('Missing Paystack authorization URL');
  window.location.href = authUrl;
}

export async function verifyPaystackReference(reference: string) {
  const { data, error } = await supabase.functions.invoke('paystack-verify', {
    body: { reference },
  });
  if (error) throw error;
  return data as { success: boolean; tier?: SubscriptionTier; message?: string };
}
