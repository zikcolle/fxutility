-- Idempotent Supabase Production Schema
-- ⚠️  SECURITY NOTE: Admin seeding is NOT done here.
--     To grant admin access, run a private migration in the Supabase Dashboard SQL Editor:
--       UPDATE public.profiles SET tier = 'Pro' WHERE id = '<your-user-uuid>';
--     Never hardcode admin emails in a public repository.

-- 1. Create a table for public profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'Basic' CHECK (tier IN ('Basic', 'Premium', 'Pro', 'Team', 'Lifetime')),
  referral_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
  referred_by TEXT REFERENCES public.profiles(username)
);

-- 2. Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Recreate policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Trigger to create profile on signup (standard user — Basic tier)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, tier)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'Basic'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke all permissions on trigger function to prevent RPC calls
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Legacy credit bookkeeping cleanup
DROP TABLE IF EXISTS public.credit_transactions;
DROP TABLE IF EXISTS public.tool_usage;
DROP FUNCTION IF EXISTS public.deduct_credits(INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.record_paystack_payment(TEXT, TEXT, INTEGER, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.record_paystack_payment(TEXT, TEXT, INTEGER, INTEGER, TEXT);
-- 7. Trading Log / Institutional Ledger Table
CREATE TABLE IF NOT EXISTS public.trading_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pair TEXT NOT NULL,
  type TEXT CHECK (type IN ('Buy', 'Sell')) NOT NULL,
  entry_price NUMERIC NOT NULL,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  exit_price NUMERIC,
  lot_size NUMERIC NOT NULL,
  pnl NUMERIC,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.trading_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own logs." ON public.trading_logs;
CREATE POLICY "Users can manage own logs." ON public.trading_logs
  FOR ALL USING (auth.uid() = user_id);

-- 8. Affiliate / Referral System
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id) UNIQUE,
  commission_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Referrers can view own referrals." ON public.referrals;
CREATE POLICY "Referrers can view own referrals." ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

-- Add missing columns to referrals if they don't exist
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referred_user_name TEXT;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS plan_purchased TEXT;

-- 9. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_tier TEXT CHECK (plan_tier IN ('Premium', 'Pro', 'Team', 'Lifetime')) NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Canceled', 'Expired')),
  auto_renew BOOLEAN DEFAULT true,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions." ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions." ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Record a completed Paystack callback and update the user's subscription tier.
-- For stronger production verification, pair this with a server-side Paystack
-- transaction verification endpoint before calling this function.
CREATE OR REPLACE FUNCTION public.record_paystack_payment(
  p_reference TEXT,
  p_plan_tier TEXT DEFAULT NULL,
  p_amount_kobo INTEGER DEFAULT 0,
  p_billing_cycle TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_reference IS NULL OR length(trim(p_reference)) = 0 THEN
    RAISE EXCEPTION 'Payment reference is required';
  END IF;

  IF p_plan_tier IS NULL OR p_plan_tier NOT IN ('Premium', 'Pro', 'Team', 'Lifetime') THEN
    RAISE EXCEPTION 'A valid paid plan tier is required';
  END IF;

  UPDATE public.profiles
  SET
    tier = p_plan_tier,
    updated_at = NOW()
  WHERE id = auth.uid();

  period_end := CASE
    WHEN p_billing_cycle = 'yearly' THEN NOW() + INTERVAL '1 year'
    ELSE NOW() + INTERVAL '1 month'
  END;

  INSERT INTO public.subscriptions (
    user_id,
    plan_tier,
    status,
    auto_renew,
    current_period_start,
    current_period_end
  )
  VALUES (
    auth.uid(),
    p_plan_tier,
    'Active',
    true,
    NOW(),
    period_end
  );

  RETURN jsonb_build_object(
    'status', 'recorded',
    'tier', p_plan_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.record_paystack_payment(TEXT, TEXT, INTEGER, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_paystack_payment(TEXT, TEXT, INTEGER, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_paystack_payment(TEXT, TEXT, INTEGER, TEXT) TO authenticated;

-- 10. Affiliate Payout Requests Table
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  payout_method TEXT NOT NULL,
  payout_details TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Paid', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payouts." ON public.affiliate_payouts;
CREATE POLICY "Users can view own payouts." ON public.affiliate_payouts
  FOR SELECT USING (auth.uid() = user_id);
