-- ==============================================================================
-- EDUPATH AI — PRODUCTION DATABASE SCHEMA MIGRATION
-- Supports: Profiles, Vouchers, Payments, Role-Based Access & Candidate Results
-- ==============================================================================

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  kcse_index TEXT,
  phone_number TEXT,
  has_unlocked_pass BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  payment_method TEXT,
  voucher_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Trigger to automatically create a profile row upon new Supabase auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, kcse_index)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'kcse_index', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create Vouchers Table
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INT NOT NULL DEFAULT 100,
  max_uses INT NOT NULL DEFAULT 100,
  used_count INT NOT NULL DEFAULT 0,
  expires_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vouchers TO anon, authenticated;
GRANT ALL ON public.vouchers TO service_role;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vouchers to validate" ON public.vouchers
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY "Admins can manage vouchers" ON public.vouchers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed Default Launch Vouchers
INSERT INTO public.vouchers (code, discount_percent, max_uses, used_count, expires_at, is_active, notes)
VALUES
  ('EDUPATH100', 100, 500, 18, '2026-12-31', TRUE, 'Official 100% Scholarship Placement Waiver'),
  ('KENYA2026', 100, 1000, 42, '2026-12-31', TRUE, '2026 KCSE National Revision Launch Pass'),
  ('ADMINFREE', 100, 9999, 5, '2030-01-01', TRUE, 'Staff & Reviewer Unlimited Access Pass'),
  ('DISCOUNT50', 50, 200, 12, '2026-12-31', TRUE, '50% Off Early Bird Revision (KES 75)')
ON CONFLICT (code) DO NOTHING;


-- 3. Create Payments & Receipts Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  candidate_email TEXT,
  phone_number TEXT,
  amount NUMERIC NOT NULL DEFAULT 150,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT NOT NULL DEFAULT 'mpesa', -- 'mpesa', 'voucher', 'card'
  status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  mpesa_receipt_number TEXT,
  voucher_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own payments" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own payment records" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all payments" ON public.payments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));


-- 4. Create Saved Course Shortlists Table
CREATE TABLE IF NOT EXISTS public.saved_programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  programme_id UUID NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, programme_id)
);

GRANT SELECT, INSERT, DELETE ON public.saved_programmes TO authenticated;
GRANT ALL ON public.saved_programmes TO service_role;
ALTER TABLE public.saved_programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved programmes" ON public.saved_programmes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
