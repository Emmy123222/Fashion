-- Fix RLS Policies for Subscription Tables
-- Run this to secure subscription and payment data

-- Enable RLS on subscription tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own payment history" ON payment_history;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage payment history" ON payment_history;
DROP POLICY IF EXISTS "Service role can manage webhook events" ON stripe_webhook_events;

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Payment History Policies
CREATE POLICY "Users can view their own payment history"
  ON payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payment history"
  ON payment_history
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Webhook Events Policies (service role only)
CREATE POLICY "Service role can manage webhook events"
  ON stripe_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON payment_history TO authenticated;
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON payment_history TO service_role;
GRANT ALL ON stripe_webhook_events TO service_role;

-- Success message
SELECT 'RLS policies for subscription tables fixed successfully!' as message;
