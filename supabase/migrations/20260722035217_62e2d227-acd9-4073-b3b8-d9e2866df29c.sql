
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Universities
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  county TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.universities TO anon, authenticated;
GRANT ALL ON public.universities TO service_role;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are public" ON public.universities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage universities" ON public.universities FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Programmes
CREATE TABLE public.programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  cutoff_2023 NUMERIC,
  cutoff_2022 NUMERIC,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programmes TO anon, authenticated;
GRANT ALL ON public.programmes TO service_role;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programmes are public" ON public.programmes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage programmes" ON public.programmes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX programmes_category_idx ON public.programmes(category);
CREATE INDEX programmes_university_id_idx ON public.programmes(university_id);
CREATE INDEX programmes_cutoff_2023_idx ON public.programmes(cutoff_2023);
CREATE INDEX programmes_search_idx ON public.programmes USING GIN(search_vector);

CREATE OR REPLACE FUNCTION public.programmes_search_trigger() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.name,'') || ' ' || coalesce(NEW.category,'') || ' ' || coalesce(NEW.code,''));
  RETURN NEW;
END $$;
CREATE TRIGGER programmes_search_update BEFORE INSERT OR UPDATE ON public.programmes
FOR EACH ROW EXECUTE FUNCTION public.programmes_search_trigger();

-- Student results (saved searches)
CREATE TABLE public.student_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT,
  grades JSONB NOT NULL,
  mean_points NUMERIC,
  eligible_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.student_results TO authenticated;
GRANT ALL ON public.student_results TO service_role;
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own results" ON public.student_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own results" ON public.student_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own results" ON public.student_results FOR DELETE TO authenticated USING (auth.uid() = user_id);
