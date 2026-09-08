ALTER TABLE fixed_payments ADD COLUMN IF NOT EXISTS profile_id uuid;

UPDATE fixed_payments 
SET profile_id = 'edc938dc-9fbc-4573-b007-0bdb95114f95' 
WHERE responsible ILIKE '%Cristhian%' 
   OR responsible = 'edc938dc-9fbc-4573-b007-0bdb95114f95';

UPDATE fixed_payments 
SET profile_id = '7b5c62be-58f1-48d6-b366-0f504c39bdcb' 
WHERE responsible ILIKE '%Jennifer%';

-- For anything else like "Transporte", "Hogar", "Plan Móvil", "Compras" let's assign it to Cristhian (admin)
UPDATE fixed_payments 
SET profile_id = 'edc938dc-9fbc-4573-b007-0bdb95114f95' 
WHERE profile_id IS NULL;

-- Sub-category for daily_expenses
ALTER TABLE daily_expenses ADD COLUMN IF NOT EXISTS sub_category text;
