/*
  # Create expenses tracking table

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key) - Unique identifier for each expense
      - `expense_type` (text) - Category/type of expense (e.g., Food, Transport, Entertainment)
      - `amount` (numeric) - Amount in JPY
      - `paid_by` (text) - Who paid for this expense ('person1' or 'person2')
      - `split` (boolean) - Whether this expense should be split between both people
      - `description` (text, optional) - Additional notes about the expense
      - `created_at` (timestamptz) - When the expense was recorded

  2. Security
    - Enable RLS on `expenses` table
    - Add policy allowing anyone to read all expenses (for simplicity in this couple app)
    - Add policy allowing anyone to insert expenses
    - Add policy allowing anyone to update/delete expenses
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_type text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  paid_by text NOT NULL CHECK (paid_by IN ('person1', 'person2')),
  split boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

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