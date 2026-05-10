-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier VARCHAR(50) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly' or 'yearly'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'suspended'
  amount_kobo INTEGER NOT NULL,
  paystack_reference VARCHAR(255) UNIQUE,
  paystack_authorization_code VARCHAR(255),
  paystack_customer_code VARCHAR(255),
  next_billing_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription payments table
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount_kobo INTEGER NOT NULL,
  paystack_reference VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- 'success', 'failed', 'pending'
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);

-- Create RPC function to record subscription
CREATE OR REPLACE FUNCTION record_paystack_subscription(
  p_reference VARCHAR,
  p_plan_tier VARCHAR,
  p_amount_kobo INTEGER,
  p_billing_cycle VARCHAR,
  p_authorization_code VARCHAR DEFAULT NULL,
  p_customer_code VARCHAR DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message VARCHAR) AS $$
DECLARE
  v_user_id UUID;
  v_subscription_id UUID;
  v_next_billing_date TIMESTAMP;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not authenticated'::VARCHAR;
    RETURN;
  END IF;

  -- Calculate next billing date
  IF p_billing_cycle = 'monthly' THEN
    v_next_billing_date := NOW() + INTERVAL '1 month';
  ELSIF p_billing_cycle = 'yearly' THEN
    v_next_billing_date := NOW() + INTERVAL '1 year';
  END IF;

  -- Cancel existing subscriptions for this user (except basic)
  UPDATE subscriptions
  SET status = 'cancelled', updated_at = NOW()
  WHERE user_id = v_user_id
    AND status = 'active'
    AND plan_tier != 'Basic';

  -- Insert new subscription
  INSERT INTO subscriptions (
    user_id,
    plan_tier,
    billing_cycle,
    status,
    amount_kobo,
    paystack_reference,
    paystack_authorization_code,
    paystack_customer_code,
    next_billing_date
  ) VALUES (
    v_user_id,
    p_plan_tier,
    p_billing_cycle,
    'active',
    p_amount_kobo,
    p_reference,
    p_authorization_code,
    p_customer_code,
    v_next_billing_date
  ) RETURNING id INTO v_subscription_id;

  -- Record initial payment
  INSERT INTO subscription_payments (
    subscription_id,
    amount_kobo,
    paystack_reference,
    status,
    paid_at
  ) VALUES (
    v_subscription_id,
    p_amount_kobo,
    p_reference,
    'success',
    NOW()
  );

  -- Update user tier
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{subscription_tier}',
    to_jsonb(p_plan_tier)
  )
  WHERE id = v_user_id;

  RETURN QUERY SELECT TRUE, 'Subscription recorded successfully'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process recurring charges
CREATE OR REPLACE FUNCTION process_recurring_subscriptions()
RETURNS TABLE(processed INT, failed INT) AS $$
DECLARE
  v_subscription RECORD;
  v_processed INT := 0;
  v_failed INT := 0;
BEGIN
  -- Find subscriptions due for renewal
  FOR v_subscription IN
    SELECT * FROM subscriptions
    WHERE status = 'active'
      AND next_billing_date <= NOW()
  LOOP
    BEGIN
      -- Call Paystack API to charge (this would be done via a webhook or external service)
      -- For now, we'll just update the next billing date
      UPDATE subscriptions
      SET next_billing_date = CASE
        WHEN billing_cycle = 'monthly' THEN next_billing_date + INTERVAL '1 month'
        WHEN billing_cycle = 'yearly' THEN next_billing_date + INTERVAL '1 year'
      END
      WHERE id = v_subscription.id;

      v_processed := v_processed + 1;
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_failed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cancel subscription
CREATE OR REPLACE FUNCTION cancel_subscription(p_subscription_id UUID)
RETURNS TABLE(success BOOLEAN, message VARCHAR) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  UPDATE subscriptions
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_subscription_id AND user_id = v_user_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, 'Subscription cancelled successfully'::VARCHAR;
  ELSE
    RETURN QUERY SELECT FALSE, 'Subscription not found'::VARCHAR;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
