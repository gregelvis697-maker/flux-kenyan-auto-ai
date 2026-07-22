import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const TIER_LIMITS: Record<string, number> = { free: 3, standard: 15, premium: 50 };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) return json({ error: 'Unauthorized' }, 401);
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const reference = body?.reference as string | undefined;
    if (!reference) return json({ error: 'Missing reference' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Idempotency: if already recorded as success, return
    const { data: existing } = await admin
      .from('subscription_transactions')
      .select('id, status, tier, dealer_id')
      .eq('paystack_reference', reference)
      .maybeSingle();
    if (existing?.status === 'success' && existing.dealer_id === userId) {
      return json({ success: true, tier: existing.tier, message: 'Already verified' });
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}` },
    });
    const psJson = await res.json();
    if (!res.ok || !psJson?.status || psJson.data?.status !== 'success') {
      console.error('Verify failed', psJson);
      return json({ error: 'Payment not successful' }, 400);
    }

    const meta = psJson.data.metadata ?? {};
    const tier = (meta.tier ?? '').toString();
    const dealerId = (meta.dealer_id ?? '').toString();
    if (!(tier in TIER_LIMITS) || dealerId !== userId) {
      return json({ error: 'Reference does not match user' }, 403);
    }

    // Read prior tier
    const { data: prior } = await admin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .maybeSingle();
    const previousTier = prior?.subscription_tier ?? 'free';

    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const amount = (psJson.data.amount ?? 0) / 100;
    const customerCode = psJson.data.customer?.customer_code ?? null;
    const authorizationCode = psJson.data.authorization?.authorization_code ?? null;

    const { error: profileErr } = await admin
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expires.toISOString(),
        subscription_auto_renew: true,
        monthly_listing_limit: TIER_LIMITS[tier],
        paystack_customer_code: customerCode,
        paystack_authorization_code: authorizationCode,
      })
      .eq('id', userId);
    if (profileErr) throw profileErr;

    // Upsert transaction on paystack_reference
    await admin.from('subscription_transactions').upsert(
      {
        dealer_id: userId,
        tier,
        amount,
        currency: 'KES',
        paystack_reference: reference,
        paystack_transaction_id: psJson.data.id?.toString() ?? null,
        paystack_customer_code: customerCode,
        paystack_authorization_code: authorizationCode,
        status: 'success',
        payment_method: psJson.data.channel ?? null,
        paid_at: now.toISOString(),
        period_start: now.toISOString(),
        period_end: expires.toISOString(),
        is_upgrade: previousTier !== 'free' && previousTier !== tier,
        previous_tier: previousTier,
      },
      { onConflict: 'paystack_reference' },
    );

    await admin.from('subscription_events').insert({
      dealer_id: userId,
      event_type: previousTier === 'free' ? 'subscription_created' : 'tier_upgraded',
      previous_tier: previousTier,
      new_tier: tier,
      new_status: 'active',
      metadata: { reference },
    });

    return json({ success: true, tier });
  } catch (err) {
    console.error('paystack-verify error', err);
    return json({ error: 'Internal error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
