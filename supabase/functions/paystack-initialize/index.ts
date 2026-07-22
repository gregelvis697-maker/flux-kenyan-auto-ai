import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const TIER_AMOUNTS: Record<string, number> = {
  standard: 32000,
  premium: 40000,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) return json({ error: 'Unauthorized' }, 401);
    const userId = claims.claims.sub as string;
    const email = claims.claims.email as string | undefined;
    if (!email) return json({ error: 'Missing email' }, 400);

    const body = await req.json().catch(() => ({}));
    const tier = body?.tier as string | undefined;
    if (!tier || !(tier in TIER_AMOUNTS)) {
      return json({ error: 'Invalid tier' }, 400);
    }

    // Verify dealer role + approved
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role, status')
      .eq('user_id', userId)
      .maybeSingle();
    if (!roleRow || roleRow.role !== 'dealer' || roleRow.status !== 'approved') {
      return json({ error: 'Only approved dealers can subscribe' }, 403);
    }

    const amountKobo = TIER_AMOUNTS[tier] * 100;
    const reference = `FLUX_SUB_${tier.toUpperCase()}_${userId.slice(0, 8)}_${Date.now()}`;

    const origin = req.headers.get('origin') ?? '';
    const callbackUrl = `${origin}/dashboard/dealer?paystack_ref=${reference}`;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency: 'KES',
        reference,
        callback_url: callbackUrl,
        channels: ['card', 'bank', 'mobile_money'],
        metadata: {
          dealer_id: userId,
          tier,
          custom_fields: [
            { display_name: 'Subscription', variable_name: 'subscription', value: `Flux ${tier}` },
          ],
        },
      }),
    });

    const paystackJson = await paystackRes.json();
    if (!paystackRes.ok || !paystackJson?.status) {
      console.error('Paystack init failed', paystackJson);
      return json({ error: paystackJson?.message ?? 'Paystack init failed' }, 502);
    }

    return json({
      authorization_url: paystackJson.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error('paystack-initialize error', err);
    return json({ error: 'Internal error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
