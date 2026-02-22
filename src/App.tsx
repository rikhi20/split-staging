import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseSummary } from './components/ExpenseSummary';
import { supabase, Expense } from './lib/supabase';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
<<<<<<< HEAD

  setLoading(true);

  const startDate = `${selectedMonth}-01`;
  const endDate = `${selectedMonth}-31`;

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
  } else {
    setExpenses(data || []);
  }

  setLoading(false);
};
=======
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };
>>>>>>> 8a3ee77 (Reverted to v1)

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Wallet className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading expenses...</p>
          </div>
        ) : (
          <>
            <ExpenseSummary expenses={expenses} />
            <ExpenseForm onExpenseAdded={fetchExpenses} />
            <ExpenseList expenses={expenses} onExpenseDeleted={fetchExpenses} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
