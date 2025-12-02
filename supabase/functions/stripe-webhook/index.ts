// Stripe Webhook Handler
// Handles Stripe payment events and updates subscription status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return new Response('Missing signature or webhook secret', { status: 400 });
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    console.log('Received event:', event.type);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook event
    await supabase.from('stripe_webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
      processed: false,
    });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase
      .from('stripe_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing checkout.session.completed');

  const userId = session.metadata?.user_id;
  const customerId = session.customer as string;

  if (!userId) {
    console.error('No user_id in session metadata');
    return;
  }

  // Calculate expiry date (1 year from now)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Create or update subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_payment_intent_id: session.payment_intent,
      status: 'paid',
      plan_type: 'yearly',
      amount_paid: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (subError) {
    console.error('Error updating subscription:', subError);
    throw subError;
  }

  console.log(`Subscription activated for user ${userId}`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing payment_intent.succeeded');

  const userId = paymentIntent.metadata?.user_id;

  if (!userId) {
    console.error('No user_id in payment intent metadata');
    return;
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single();

  // Log payment
  await supabase.from('payment_history').insert({
    user_id: userId,
    subscription_id: subscription?.id,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_charge_id: paymentIntent.latest_charge,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    status: 'succeeded',
    payment_method: paymentIntent.payment_method_types[0],
  });

  console.log(`Payment logged for user ${userId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing payment_intent.payment_failed');

  const userId = paymentIntent.metadata?.user_id;

  if (!userId) {
    console.error('No user_id in payment intent metadata');
    return;
  }

  // Log failed payment
  await supabase.from('payment_history').insert({
    user_id: userId,
    stripe_payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    status: 'failed',
  });

  console.log(`Failed payment logged for user ${userId}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing subscription change');

  const customerId = subscription.customer as string;

  // Find user by customer ID
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!existingSub) {
    console.error('No subscription found for customer:', customerId);
    return;
  }

  const status = subscription.status === 'active' ? 'paid' : 
                 subscription.status === 'canceled' ? 'cancelled' : 'expired';

  // Update subscription
  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      status: status,
      cancelled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', existingSub.user_id);

  console.log(`Subscription updated for user ${existingSub.user_id}`);
}
