-- Create ac_units table
CREATE TABLE ac_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ac_maintenance table
CREATE TABLE ac_maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES ac_units(id) ON DELETE CASCADE NOT NULL,
  maintenance_date DATE NOT NULL,
  next_maintenance DATE,
  cost NUMERIC(10, 2),
  technician TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE ac_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE ac_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated all ac_units" ON ac_units FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all ac_maintenance" ON ac_maintenance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Data (July 1, 2026)
INSERT INTO ac_units (id, name, location) VALUES 
('11111111-1111-1111-1111-111111111111', 'Aire Acondicionado', 'Cuarto Principal'),
('22222222-2222-2222-2222-222222222222', 'Aire Acondicionado', 'Sala');

INSERT INTO ac_maintenance (unit_id, maintenance_date, next_maintenance, cost) VALUES
('11111111-1111-1111-1111-111111111111', '2026-07-01', '2027-01-01', 0.00),
('22222222-2222-2222-2222-222222222222', '2026-07-01', '2027-01-01', 0.00);
