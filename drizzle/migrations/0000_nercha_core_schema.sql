-- Core schema for Mamburam Aandu Nercha distribution management
CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT 'Head Teacher',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.duties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text,
  start_time text,
  end_time text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.duties TO anon, authenticated;
GRANT ALL ON public.duties TO service_role;
ALTER TABLE public.duties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "duties public read" ON public.duties FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adno text NOT NULL UNIQUE,
  name text NOT NULL,
  dept text,
  phone text,
  present boolean NOT NULL DEFAULT true,
  duty_id uuid REFERENCES public.duties(id) ON DELETE SET NULL,
  is_captain boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.incharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  login_id text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.incharges TO service_role;
ALTER TABLE public.incharges ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.incharge_duties (
  incharge_id uuid NOT NULL REFERENCES public.incharges(id) ON DELETE CASCADE,
  duty_id uuid NOT NULL REFERENCES public.duties(id) ON DELETE CASCADE,
  PRIMARY KEY (incharge_id, duty_id)
);
GRANT ALL ON public.incharge_duties TO service_role;
ALTER TABLE public.incharge_duties ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.distributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  login_id text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.distributors TO service_role;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  status text NOT NULL DEFAULT 'plenty',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no text NOT NULL UNIQUE,
  donor_name text NOT NULL,
  phone text,
  amount numeric NOT NULL DEFAULT 0,
  packets integer NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  donor_name text NOT NULL,
  packets integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  redeemed_at timestamptz,
  redeemed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.tokens TO service_role;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.site_status (
  id integer PRIMARY KEY DEFAULT 1,
  is_ongoing boolean NOT NULL DEFAULT true,
  headline text NOT NULL DEFAULT 'Mamburam Aandu Nercha — distribution ongoing',
  subline text NOT NULL DEFAULT 'Darul Huda Islamic University · counter 2 of 4 · queue moving steadily',
  packets_issued integer NOT NULL DEFAULT 0,
  notice text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_status TO anon, authenticated;
GRANT ALL ON public.site_status TO service_role;
ALTER TABLE public.site_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site status public read" ON public.site_status FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.site_status (id) VALUES (1);
INSERT INTO public.admins (login_id, password_hash, name)
VALUES ('8089346495', '82c6bb8ac812fe2c9def3e0d4a362bc79f2ff3c625401e1a4615dd6ef66e2322', 'Head Teacher');

INSERT INTO public.duties (name, description, location, start_time, end_time) VALUES
  ('Counter handover', 'Handing packets to visitors at the main counters', 'Main hall counters', '09:00', '13:00'),
  ('Queue management', 'Guiding and ordering the visitor queue', 'Outer courtyard', '08:30', '13:30'),
  ('Packet loading', 'Loading packets from kitchen to counters', 'Kitchen corridor', '07:00', '13:00'),
  ('Donation intake', 'Receiving donations and issuing receipts', 'Office desk', '08:00', '17:00');

INSERT INTO public.inventory_items (name, quantity, unit, status) VALUES
  ('Plain rice', 800, 'kg', 'plenty'),
  ('Curry', 300, 'litre', 'moderate'),
  ('Milk', 40, 'litre', 'low');