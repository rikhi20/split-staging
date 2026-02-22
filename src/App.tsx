import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseSummary } from './components/ExpenseSummary';
import { supabase, Expense } from './lib/supabase';

function App() {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // FIXED: fetch using expense_month (not expense_date)
  const fetchExpenses = async () => {

    setLoading(true);

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('expense_month', selectedMonth)
      .order('created_at', { ascending: false });

    if (error) {

      console.error('Error fetching expenses:', error);

    } else {

      setExpenses(data || []);

    }

    setLoading(false);

  };

  // Refetch when month changes
  useEffect(() => {

    fetchExpenses();

  }, [selectedMonth]);



  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">

          <Wallet className="text-blue-500" size={32} />

          <h1 className="text-3xl font-bold text-gray-800">
            Expense Tracker
          </h1>

        </div>



        {/* Month selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">

          <label className="font-medium text-gray-700">
            Select Month:
          </label>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

        </div>



        {/* Content */}
        {loading ? (

          <div className="text-center py-12">

            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>

            <p className="mt-4 text-gray-600">
              Loading expenses...
            </p>

          </div>

        ) : (

          <>

            {/* FIXED: pass selectedMonth */}
            <ExpenseSummary
              expenses={expenses}
              selectedMonth={selectedMonth}
            />

            <ExpenseForm
              onExpenseAdded={fetchExpenses}
              selectedMonth={selectedMonth}
            />

            <ExpenseList
              expenses={expenses}
              onExpenseDeleted={fetchExpenses}
            />

          </>

        )}

      </div>

    </div>

  );

}

export default App;
