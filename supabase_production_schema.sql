-- Idempotent Supabase Production Schema
-- ⚠️  SECURITY NOTE: Admin seeding is NOT done here.
--     To grant admin access, run a private migration in the Supabase Dashboard SQL Editor:
--       UPDATE public.profiles SET credits = 999999, tier = 'Pro' WHERE id = '<your-user-uuid>';
--     Never hardcode admin emails in a public repository.

-- 1. Create a table for public profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 50,
  tier TEXT DEFAULT 'Basic' CHECK (tier IN ('Basic', 'Premium', 'Pro', 'Lifetime')),
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

-- 3. Trigger to create profile on signup (standard user — 50 credits, Basic tier)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, credits, tier)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    50,
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

-- 4. Credit Transactions Table (audit trail for all credit deductions)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions." ON public.credit_transactions;
CREATE POLICY "Users can view own transactions." ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Tool Usage / Analytics Table
CREATE TABLE IF NOT EXISTS public.tool_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT NOT NULL,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tool usage." ON public.tool_usage;
CREATE POLICY "Users can view own tool usage." ON public.tool_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Allow insert for authenticated users (tools log themselves)
DROP POLICY IF EXISTS "Users can insert own tool usage." ON public.tool_usage;
CREATE POLICY "Users can insert own tool usage." ON public.tool_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clean up legacy functions to resolve linter warnings
DROP FUNCTION IF EXISTS public.deduct_credits(INTEGER);
DROP FUNCTION IF EXISTS public.rls_auto_enable() CASCADE;

-- 6. Secure Credit Deduction Function (now with transaction logging)
CREATE OR REPLACE FUNCTION public.deduct_credits(p_amount INTEGER, p_tool_id TEXT DEFAULT 'unknown')
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Get current credits with lock
  SELECT credits INTO current_credits FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  
  IF current_credits IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', current_credits, p_amount;
  END IF;

  new_credits := current_credits - p_amount;

  UPDATE public.profiles
  SET credits = new_credits, updated_at = NOW()
  WHERE id = auth.uid();

  -- Log the transaction
  INSERT INTO public.credit_transactions (user_id, tool_id, amount, balance_after)
  VALUES (auth.uid(), p_tool_id, p_amount, new_credits);

  -- Log tool usage
  INSERT INTO public.tool_usage (user_id, tool_id, credits_spent)
  VALUES (auth.uid(), p_tool_id, p_amount);

  RETURN new_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke and explicitly grant for authenticated users only
REVOKE EXECUTE ON FUNCTION public.deduct_credits(INTEGER, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deduct_credits(INTEGER, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.deduct_credits(INTEGER, TEXT) TO authenticated;

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

CREATE POLICY "Referrers can view own referrals." ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);
