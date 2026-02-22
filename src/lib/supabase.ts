import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Expense {
  id: string;
  expense_type: string;
  amount: number;
  paid_by: 'person1' | 'person2';
  split: boolean;
  description: string | null;
  // NEW: used for monthly filtering
  expense_date: string;
  // NEW: used for settle-up feature
  settled: boolean;
  created_at: string;
  expense_month: string;
}
