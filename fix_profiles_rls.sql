-- Enable RLS if not already
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing SELECT policy if any to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON profiles;

-- Create policy for authenticated users to view profiles
CREATE POLICY "Enable read access for all authenticated users" ON profiles
    FOR SELECT
    TO authenticated
    USING (true);
