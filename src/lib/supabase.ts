import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TYPES

export type Person = 'Rikhi' | 'Saki';

export interface Expense {
  id: string;
  expense_type: string;
  amount: number;
  paid_by: Person;
  description: string | null;
  expense_date: string;
  created_at?: string;
}

export interface Settlement {
  id: string;
  amount: number;
  paid_by: Person;
  paid_to: Person;
  settlement_date: string;
  created_at?: string;
}

// ADD EXPENSE

export async function addExpense(
  expense_type: string,
  amount: number,
  paid_by: Person,
  description?: string
) {

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      expense_type,
      amount,
      paid_by,
      description: description ?? null,
      expense_date: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

// RECORD SETTLEMENT

export async function recordSettlement(
  amount: number,
  paid_by: Person,
  paid_to: Person
) {

  const { data, error } = await supabase
    .from('settlements')
    .insert({
      amount,
      paid_by,
      paid_to,
      settlement_date: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}
