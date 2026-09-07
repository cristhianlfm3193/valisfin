CREATE TABLE savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_amount NUMERIC(10, 2) NOT NULL,
  saved_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  deadline_date DATE,
  priority TEXT DEFAULT 'MEDIA' NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated all savings_goals" ON savings_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);
