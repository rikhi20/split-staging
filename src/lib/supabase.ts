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
  groupId: string,
  expense_type: string,
  amount: number,
  paid_by: Person
) {

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      group_id: groupId,
      expense_type,
      amount,
      paid_by,
      expense_date: new Date().toISOString().slice(0, 10)
    })
    .select()
    .single();

  if (error) throw error;

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

// ============================================
// FETCH FUNCTIONS
// ============================================

export async function getExpenses(groupId: string) {

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId)
    .order('expense_date', { ascending: false });

  if (error) {

    console.error('getExpenses error:', error);

    throw error;
  }

  return data as Expense[];
}


export async function getSettlements(groupId: string) {

  const { data, error } = await supabase
    .from('settlements')
    .select('*')
    .eq('group_id', groupId)
    .order('settlement_date', { ascending: false });

  if (error) {

    console.error('getSettlements error:', error);

    throw error;
  }

  return data as Settlement[];
}

// ============================================
// DELETE EXPENSE
// ============================================

export async function deleteExpense(id: string) {

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {

    console.error("Delete expense error:", error);
    return false;

  }

  return true;

}

// ============================================
// SETTLE UP FUNCTION
// ============================================

export async function settleUp(
  groupId: string,
  amount: number,
  paid_by: Person,
  paid_to: Person
) {

  const { data, error } = await supabase
    .from('settlements')
    .insert({
      group_id: groupId,
      amount,
      paid_by,
      paid_to,
      settlement_date: new Date().toISOString().slice(0, 10)
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
