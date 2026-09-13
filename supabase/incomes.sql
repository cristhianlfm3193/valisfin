-- Create the incomes table
CREATE TABLE incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  person TEXT NOT NULL,
  category TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date_expected DATE NOT NULL,
  is_received BOOLEAN DEFAULT false NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all incomes
CREATE POLICY "Allow authenticated to view incomes"
ON incomes FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert incomes
CREATE POLICY "Allow authenticated to insert incomes"
ON incomes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update incomes (e.g. mark as received)
CREATE POLICY "Allow authenticated to update incomes"
ON incomes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete incomes
CREATE POLICY "Allow authenticated to delete incomes"
ON incomes FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- Insertar datos iniciales (Data de Referencia)
-- ==========================================

INSERT INTO incomes (person, category, period, description, amount, date_expected, is_received)
VALUES 
  ('jennifer', 'carro', 'eventual', 'Gasto de Carro Jennifer', 125.00, CURRENT_DATE, false);
