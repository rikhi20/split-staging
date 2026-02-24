/*
  FIX settlements and expenses schema for proper split and settlement tracking
*/

-- ============================================
-- EXPENSES TABLE FIX
-- ============================================

ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS expense_date date DEFAULT CURRENT_DATE;

ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS paid_by text NOT NULL DEFAULT 'Rikhi';

ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS amount numeric NOT NULL DEFAULT 0;

-- ============================================
-- SETTLEMENTS TABLE FIX (CRITICAL)
-- ============================================

CREATE TABLE IF NOT EXISTS settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  paid_by text NOT NULL,
  paid_to text NOT NULL,

  amount numeric NOT NULL CHECK (amount > 0),

  settlement_date date DEFAULT CURRENT_DATE,

  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_expenses_date
ON expenses(expense_date);

CREATE INDEX IF NOT EXISTS idx_settlements_date
ON settlements(settlement_date);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ALLOW ALL (for now)
-- ============================================

DROP POLICY IF EXISTS "Allow all expenses" ON expenses;
CREATE POLICY "Allow all expenses"
ON expenses FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all settlements" ON settlements;
CREATE POLICY "Allow all settlements"
ON settlements FOR ALL
USING (true)
WITH CHECK (true);
