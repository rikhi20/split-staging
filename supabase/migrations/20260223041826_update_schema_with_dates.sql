/*
  # Update schema to use person1/person2 and date fields

  1. Modifications
    - Update expenses table to use expense_date instead of created_at for filtering
    - Update settlements table to use settlement_date and paid_by/paid_to fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'expense_date'
  ) THEN
    ALTER TABLE expenses ADD COLUMN expense_date date DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settlements' AND column_name = 'settlement_date'
  ) THEN
    ALTER TABLE settlements ADD COLUMN settlement_date date DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settlements' AND column_name = 'paid_by'
  ) THEN
    ALTER TABLE settlements ADD COLUMN paid_by text;
    ALTER TABLE settlements ADD COLUMN paid_to text;
    ALTER TABLE settlements ADD COLUMN amount numeric;
  END IF;
END $$;