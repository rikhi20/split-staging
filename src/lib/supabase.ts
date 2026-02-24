import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Expense {
  id: string;
  expense_type: string;
  amount: number;
  paid_by: 'person1' | 'person2';
  split: boolean;
  description: string | null;
  created_at: string;
  expense_date: string;
}

export interface Settlement {
  id: string;
  amount: number;
  paid_by: 'person1' | 'person2';
  paid_to: 'person1' | 'person2';
  settlement_date: string;
}
