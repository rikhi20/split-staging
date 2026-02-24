import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// ============================================
// TYPES
// ============================================

export type Person = 'Rikhi' | 'Saki';

export interface Expense {
  id: string;
  group_id: string; // ✅ REQUIRED
  expense_type: string;
  amount: number;
  paid_by: Person;
  description: string | null;
  expense_date: string;
  created_at?: string;
}

export interface Settlement {
  id: string;
  group_id: string; // ✅ REQUIRED
  amount: number;
  paid_by: Person;
  paid_to: Person;
  settlement_date: string;
  created_at?: string;
}


// ============================================
// EXPENSE FUNCTIONS
// ============================================

export async function addExpense(
  groupId: string,
  expense_type: string,
  amount: number,
  paid_by: Person,
  description?: string
) {

  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        group_id: groupId, // ✅ REQUIRED
        expense_type,
        amount,
        paid_by,
        description: description ?? null,
        expense_date: new Date().toISOString().slice(0, 10),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Expense insert error:', error);
    throw error;
  }

  return data;
}


// ============================================
// SETTLEMENT FUNCTIONS
// ============================================

export async function recordSettlement(
  groupId: string,
  amount: number,
  paid_by: Person,
  paid_to: Person
) {

  const { data, error } = await supabase
    .from('settlements')
    .insert([
      {
        group_id: groupId, // ✅ REQUIRED
        amount,
        paid_by,
        paid_to,
        settlement_date: new Date().toISOString().slice(0, 10),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Settlement insert error:', error);
    throw error;
  }

  return data;
}


// ============================================
// FETCH FUNCTIONS
// ============================================

export async function getExpenses(groupId: string) {

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId) // ✅ REQUIRED
    .order('expense_date', { ascending: false });

  if (error) {
    console.error('Get expenses error:', error);
    throw error;
  }

  return data as Expense[];
}


export async function getSettlements(groupId: string) {

  const { data, error } = await supabase
    .from('settlements')
    .select('*')
    .eq('group_id', groupId) // ✅ REQUIRED
    .order('settlement_date', { ascending: false });

  if (error) {
    console.error('Get settlements error:', error);
    throw error;
  }

  return data as Settlement[];
}
