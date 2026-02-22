/*
  Expense Tracker - SAFE UPGRADE SCHEMA
  Adds:
  - expense_date (monthly tracking)
  - settled (settle up feature)
  - indexes for performance
*/

-- Add expense_date column safely
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS expense_date date DEFAULT current_date;

-- Add settled column safely
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS settled boolean DEFAULT false;

-- Fix existing rows (VERY IMPORTANT)
UPDATE expenses
SET expense_date = created_at::date
WHERE expense_date IS NULL;

UPDATE expenses
SET settled = false
WHERE settled IS NULL;

-- Make columns NOT NULL after fixing data
ALTER TABLE expenses
ALTER COLUMN expense_date SET NOT NULL;

ALTER TABLE expenses
ALTER COLUMN settled SET NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_expense_date
ON expenses(expense_date);

CREATE INDEX IF NOT EXISTS idx_expense_settled
ON expenses(settled);

-- Enable RLS (safe if already enabled)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies (safe recreate)
DO $$ 
BEGIN

IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can view expenses'
) THEN
    CREATE POLICY "Anyone can view expenses"
    ON expenses
    FOR SELECT
    USING (true);
END IF;

IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can add expenses'
) THEN
    CREATE POLICY "Anyone can add expenses"
    ON expenses
    FOR INSERT
    WITH CHECK (true);
END IF;

IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can update expenses'
) THEN
    CREATE POLICY "Anyone can update expenses"
    ON expenses
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
END IF;

IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can delete expenses'
) THEN
    CREATE POLICY "Anyone can delete expenses"
    ON expenses
    FOR DELETE
    USING (true);
END IF;

END $$;
