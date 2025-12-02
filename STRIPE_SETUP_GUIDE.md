# Stripe Subscription Setup Guide

## Overview
$4.99/year subscription using Stripe Checkout (Website only). After payment, user status changes from FREE to PAID with 1-year expiry. Webhooks sync payment status across web and mobile.

---

## Step 1: Database Setup

Run this SQL migration in Supabase:

```sql
-- Run: sql/12_stripe_subscription_tables.sql
```

This creates:
- `subscriptions` table - Tracks user subscriptions
- `payment_history` table - Logs all payments
- `stripe_webhook_events` table - Logs webhook events
- `is_subscription_active()` function - Checks if subscription is active
- Triggers to sync subscription status to profiles

---

## Step 2: Stripe Account Setup

### 1. Create Stripe Account
- Go to https://stripe.com
- Sign up for an account
- Complete verification

### 2. Get API Keys
- Go to Developers → API keys
- Copy your keys:
  - **Publishable key** (starts with `pk_`)
  - **Secret key** (starts with `sk_`)

### 3. Create Product
- Go to Products → Add product
- Name: "Fashion Match Game - Premium Yearly"
- Price: $4.99 USD
- Billing period: Yearly
- Save and copy the **Price ID** (starts with `price_`)

---

## Step 3: Configure Supabase Edge Functions

### 1. Set Environment Variables

In Supabase Dashboard → Edge Functions → Secrets:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Get this in Step 4
```

### 2. Deploy Edge Functions

```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

---

## Step 4: Configure Stripe Webhooks

### 1. Get Webhook URL
Your webhook URL will be:
```
https://[your-project-ref].supabase.co/functions/v1/stripe-webhook
```

### 2. Add Webhook in Stripe
- Go to Developers → Webhooks
- Click "Add endpoint"
- Enter your webhook URL
- Select events to listen for:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Click "Add endpoint"

### 3. Get Webhook Secret
- Click on your webhook
- Copy the "Signing secret" (starts with `whsec_`)
- Add it to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Update Environment Variables

Add to your `.env` file:

```bash
# Stripe (Public keys only - safe for client)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Supabase (already configured)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**IMPORTANT:** Never expose secret keys in the app!

---

## Step 6: Test the Integration

### Test on Website (Development)

1. **Start your web app:**
```bash
npm run web
```

2. **Navigate to subscription page**

3. **Click "Subscribe Now"**

4. **Use Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

5. **Complete payment**

6. **Verify in database:**
```sql
-- Check subscription was created
SELECT * FROM subscriptions WHERE user_id = 'your-user-id';

-- Check profile was updated
SELECT subscription_status, subscription_expires_at 
FROM profiles WHERE id = 'your-user-id';

-- Check payment was logged
SELECT * FROM payment_history WHERE user_id = 'your-user-id';
```

---

## Step 7: Verify Webhook Integration

### 1. Check Webhook Logs in Stripe
- Go to Developers → Webhooks
- Click on your webhook
- Check "Events" tab
- Verify events are being sent successfully

### 2. Check Supabase Logs
```sql
-- Check webhook events were received
SELECT * FROM stripe_webhook_events 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if events were processed
SELECT event_type, processed, error_message 
FROM stripe_webhook_events 
WHERE processed = false;
```

---

## How It Works

### Payment Flow:

```
1. User clicks "Subscribe Now" (Website only)
   ↓
2. App calls create-checkout-session Edge Function
   ↓
3. Edge Function creates Stripe Checkout Session
   ↓
4. User redirected to Stripe Checkout page
   ↓
5. User enters payment details
   ↓
6. Stripe processes payment
   ↓
7. Stripe sends webhook to stripe-webhook Edge Function
   ↓
8. Webhook handler:
   - Creates subscription record
   - Updates profile status to 'paid'
   - Sets expiry date (1 year from now)
   - Logs payment
   ↓
9. User redirected back to success page
   ↓
10. Both web and mobile app see updated status
```

### Status Sync:

- **Database trigger** automatically syncs subscription status to profile
- **Mobile app** reads subscription status from profile table
- **Website** reads subscription status from profile table
- **Both see same data** - no separate tracking needed

---

## Mobile App Behavior

### On Mobile (iOS/Android):
- Subscription button shows "Website Only" message
- Tapping opens website in browser
- User completes payment on website
- Returns to app
- App refreshes and sees PAID status

### Why Website Only?
- Avoids Apple/Google in-app purchase requirements
- Avoids 30% platform fees
- Simpler implementation
- One payment system for all platforms

---

## Premium Features

After successful payment, unlock these features:

```typescript
// Check if user is premium
const isPremium = await subscriptionService.isSubscriptionActive(userId);

if (isPremium) {
  // Unlock premium features:
  // - Unlimited game plays
  // - All difficulty levels
  // - All fashion categories
  // - Ad-free experience
  // - Priority support
  // - Exclusive items
}
```

---

## Testing Checklist

- [ ] Database tables created
- [ ] Edge functions deployed
- [ ] Stripe webhook configured
- [ ] Environment variables set
- [ ] Test payment on website works
- [ ] Subscription record created
- [ ] Profile status updated to 'paid'
- [ ] Expiry date set correctly (1 year)
- [ ] Payment logged in history
- [ ] Webhook events logged
- [ ] Mobile app shows PAID status
- [ ] Premium features unlocked

---

## Production Deployment

### 1. Switch to Live Mode in Stripe
- Get live API keys (starts with `pk_live_` and `sk_live_`)
- Update environment variables
- Update webhook endpoint to production URL

### 2. Update Environment Variables
```bash
# Production Stripe keys
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Production Supabase
SUPABASE_URL=your_production_url
SUPABASE_SERVICE_ROLE_KEY=your_production_key
```

### 3. Test with Real Card
- Use a real credit card
- Verify payment goes through
- Check Stripe dashboard for payment
- Verify subscription activates

---

## Troubleshooting

### Payment not working?
1. Check Stripe API keys are correct
2. Check webhook secret is set
3. Check Edge Functions are deployed
4. Check Supabase logs for errors

### Webhook not firing?
1. Check webhook URL is correct
2. Check webhook events are selected
3. Check webhook secret matches
4. Check Stripe webhook logs

### Status not updating?
1. Check database trigger exists
2. Check subscription record was created
3. Check profile table has subscription_status column
4. Refresh app to see updated status

---

## Security Notes

✅ **DO:**
- Use HTTPS for all webhook endpoints
- Verify webhook signatures
- Store secret keys in environment variables
- Use Supabase RLS policies
- Validate user authentication

❌ **DON'T:**
- Expose secret keys in client code
- Skip webhook signature verification
- Trust client-side subscription status
- Allow direct database updates from client

---

## Support

### Stripe Documentation:
- https://stripe.com/docs/checkout
- https://stripe.com/docs/webhooks

### Supabase Documentation:
- https://supabase.com/docs/guides/functions

---

**Your Stripe subscription system is ready!** 🎉

Users can now subscribe for $4.99/year on the website, and the status syncs automatically to both web and mobile apps.
