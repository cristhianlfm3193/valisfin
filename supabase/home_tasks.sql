-- Create the home_tasks table
CREATE TABLE home_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  registration_date DATE NOT NULL,
  estimated_date DATE,
  completion_date DATE,
  area TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  budget NUMERIC(10, 2),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE home_tasks ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own tasks or all tasks (depending on your global setup, here we allow all authenticated users)
CREATE POLICY "Allow authenticated to view home_tasks"
ON home_tasks FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert home_tasks
CREATE POLICY "Allow authenticated to insert home_tasks"
ON home_tasks FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update home_tasks
CREATE POLICY "Allow authenticated to update home_tasks"
ON home_tasks FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete home_tasks
CREATE POLICY "Allow authenticated to delete home_tasks"
ON home_tasks FOR DELETE
TO authenticated
USING (true);
