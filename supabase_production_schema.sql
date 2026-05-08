-- Idempotent Supabase Production Schema

-- 1. Create a table for public profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 50,
  tier TEXT DEFAULT 'Basic' CHECK (tier IN ('Basic', 'Premium', 'Pro', 'Lifetime'))
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

-- 3. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Special check for creator admin
  IF new.email = 'isaacbrainer4@gmail.com' THEN
    INSERT INTO public.profiles (id, full_name, avatar_url, credits, tier)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 999999, 'Pro');
  ELSE
    INSERT INTO public.profiles (id, full_name, avatar_url, credits, tier)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 50, 'Basic');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Secure Credit Deduction Function
CREATE OR REPLACE FUNCTION public.deduct_credits(p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits FROM public.profiles WHERE id = auth.uid();
  
  IF current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  UPDATE public.profiles
  SET credits = credits - p_amount
  WHERE id = auth.uid()
  RETURNING credits INTO current_credits;

  RETURN current_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
