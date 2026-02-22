/*
  Expense Tracker - Production Schema
  Supports:
  - Monthly filtering
  - Settle-up feature
  - Fast queries
  - Safe defaults
*/

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (

  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  expense_type text NOT NULL,

  amount numeric NOT NULL CHECK (amount >= 0),

  paid_by text NOT NULL CHECK (
    paid_by IN ('person1', 'person2')
  ),

  split boolean NOT NULL DEFAULT true,

  description text,

  -- NEW: required for monthly filtering
  expense_date date NOT NULL DEFAULT current_date,

  -- NEW: required for settle up feature
  settled boolean NOT NULL DEFAULT false,

  created_at timestamptz DEFAULT now()

);


-- Fix existing rows (important if upgrading)
UPDATE expenses
SET expense_date = created_at::date
WHERE expense_date IS NULL;


UPDATE expenses
SET settled = false
WHERE settled IS NULL;


-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_expense_date
ON expenses(expense_date);


CREATE INDEX IF NOT EXISTS idx_expense_settled
ON expenses(settled);


-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;


-- Policies (open access for couple app)
CREATE POLICY "Anyone can view expenses"
ON expenses
FOR SELECT
USING (true);


CREATE POLICY "Anyone can add expenses"
ON expenses
FOR INSERT
WITH CHECK (true);


CREATE POLICY "Anyone can update expenses"
ON expenses
FOR UPDATE
USING (true)
WITH CHECK (true);


CREATE POLICY "Anyone can delete expenses"
ON expenses
FOR DELETE
USING (true);
