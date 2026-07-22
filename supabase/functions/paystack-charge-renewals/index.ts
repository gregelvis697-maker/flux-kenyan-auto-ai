import { createClient } from 'npm:@supabase/supabase-js@2';

/**
 * Daily job:
 *  - Charges saved authorizations for subscriptions expiring within 24h.
 *  - Downgrades subscriptions past the 3-day grace period to free tier.
 */
Deno.serve(async (_req) => {
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const graceCutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // 1. Downgrade grace-expired
  const { data: expired } = await admin
    .from('profiles')
    .select('id, subscription_tier')
    .in('subscription_status', ['active', 'past_due'])
    .not('subscription_expires_at', 'is', null)
    .lt('subscription_expires_at', graceCutoff.toISOString());

  for (const dealer of expired ?? []) {
    await admin
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'inactive',
        monthly_listing_limit: 3,
      })
      .eq('id', dealer.id);
    await admin.from('subscription_events').insert({
      dealer_id: dealer.id,
      event_type: 'subscription_expired',
      previous_tier: dealer.subscription_tier,
      new_tier: 'free',
      previous_status: 'active',
      new_status: 'inactive',
    });
  }

  // 2. Charge upcoming renewals
  const { data: upcoming } = await admin
    .from('profiles')
    .select('id, email, subscription_tier, paystack_authorization_code, subscription_expires_at')
    .eq('subscription_status', 'active')
    .eq('subscription_auto_renew', true)
    .not('paystack_authorization_code', 'is', null)
    .lt('subscription_expires_at', in24h.toISOString())
    .gte('subscription_expires_at', now.toISOString());

  const TIER_AMOUNTS: Record<string, number> = { standard: 32000, premium: 40000 };
  const secret = Deno.env.get('PAYSTACK_SECRET_KEY');

  let charged = 0;
  for (const dealer of upcoming ?? []) {
    const amount = TIER_AMOUNTS[dealer.subscription_tier as string];
    if (!amount || !dealer.email) continue;
    try {
      const res = await fetch('https://api.paystack.co/transaction/charge_authorization', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: dealer.email,
          amount: amount * 100,
          currency: 'KES',
          authorization_code: dealer.paystack_authorization_code,
          metadata: { dealer_id: dealer.id, tier: dealer.subscription_tier, renewal: true },
        }),
      });
      const jsonRes = await res.json();
      if (res.ok && jsonRes?.status && jsonRes?.data?.status === 'success') {
        charged++;
        // Webhook will process charge.success; nothing else to do here.
      } else {
        console.warn('Renewal charge failed', dealer.id, jsonRes?.message);
      }
    } catch (err) {
      console.error('Renewal error', dealer.id, err);
    }
  }

  return new Response(
    JSON.stringify({ downgraded: expired?.length ?? 0, charged, considered: upcoming?.length ?? 0 }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
