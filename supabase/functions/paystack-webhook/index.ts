import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const raw = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';
  const secret = Deno.env.get('PAYSTACK_WEBHOOK_SECRET') ?? '';

  const expected = createHmac('sha512', secret).update(raw).digest('hex');
  if (!signature || signature !== expected) {
    console.warn('Invalid Paystack signature');
    return new Response('Invalid signature', { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    switch (event.event) {
      case 'charge.success': {
        // Renewal charge (initial checkout is handled by paystack-verify)
        const customerCode = event.data?.customer?.customer_code;
        const reference = event.data?.reference;
        if (!customerCode || !reference) break;

        // Skip if already recorded
        const { data: existing } = await admin
          .from('subscription_transactions')
          .select('id')
          .eq('paystack_reference', reference)
          .maybeSingle();
        if (existing) break;

        const { data: dealer } = await admin
          .from('profiles')
          .select('id, subscription_tier, subscription_expires_at')
          .eq('paystack_customer_code', customerCode)
          .maybeSingle();
        if (!dealer) break;

        const base = dealer.subscription_expires_at && new Date(dealer.subscription_expires_at) > new Date()
          ? new Date(dealer.subscription_expires_at)
          : new Date();
        const newExpires = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

        await admin
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_expires_at: newExpires.toISOString(),
          })
          .eq('id', dealer.id);

        await admin.from('subscription_transactions').insert({
          dealer_id: dealer.id,
          tier: dealer.subscription_tier,
          amount: (event.data.amount ?? 0) / 100,
          currency: event.data.currency ?? 'KES',
          paystack_reference: reference,
          paystack_transaction_id: event.data.id?.toString() ?? null,
          paystack_customer_code: customerCode,
          status: 'success',
          payment_method: event.data.channel ?? null,
          paid_at: new Date().toISOString(),
          period_start: new Date().toISOString(),
          period_end: newExpires.toISOString(),
        });

        await admin.from('subscription_events').insert({
          dealer_id: dealer.id,
          event_type: 'subscription_renewed',
          new_status: 'active',
          metadata: { reference },
        });
        break;
      }

      case 'charge.failed':
      case 'invoice.payment_failed': {
        const customerCode = event.data?.customer?.customer_code;
        if (!customerCode) break;
        const { data: dealer } = await admin
          .from('profiles')
          .select('id, subscription_status')
          .eq('paystack_customer_code', customerCode)
          .maybeSingle();
        if (!dealer) break;
        await admin
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', dealer.id);
        await admin.from('subscription_events').insert({
          dealer_id: dealer.id,
          event_type: 'payment_failed',
          previous_status: dealer.subscription_status,
          new_status: 'past_due',
          metadata: { reference: event.data?.reference ?? null },
        });
        break;
      }

      case 'subscription.disable': {
        const customerCode = event.data?.customer?.customer_code;
        if (!customerCode) break;
        const { data: dealer } = await admin
          .from('profiles')
          .select('id, subscription_status')
          .eq('paystack_customer_code', customerCode)
          .maybeSingle();
        if (!dealer) break;
        await admin
          .from('profiles')
          .update({ subscription_status: 'cancelled', subscription_auto_renew: false })
          .eq('id', dealer.id);
        await admin.from('subscription_events').insert({
          dealer_id: dealer.id,
          event_type: 'subscription_cancelled',
          previous_status: dealer.subscription_status,
          new_status: 'cancelled',
        });
        break;
      }
    }
  } catch (err) {
    console.error('webhook handler error', err);
    return new Response('handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
