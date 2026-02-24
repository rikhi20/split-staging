import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseSummary } from './components/ExpenseSummary';
import { SettlementHistory } from './components/SettlementHistory';
import { supabase, Expense, Settlement } from './lib/supabase';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const startDate = `${selectedMonth}-01`;

      const [year, month] = selectedMonth.split('-');

      const nextMonth =
        month === '12'
          ? '01'
          : String(Number(month) + 1).padStart(2, '0');

      const nextYear =
        month === '12'
          ? String(Number(year) + 1)
          : year;

      const endDate = `${nextYear}-${nextMonth}-01`;

      // Fetch expenses
      const {
        data: expData,
        error: expError,
      } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startDate)
        .lt('expense_date', endDate)
        .order('expense_date', { ascending: false });

      if (expError) {
        console.error('Error fetching expenses:', expError);
      }

      // Fetch settlements
      const {
        data: settleData,
        error: settleError,
      } = await supabase
        .from('settlements')
        .select('*')
        .gte('settlement_date', startDate)
        .lt('settlement_date', endDate)
        .order('settlement_date', { ascending: false });

      if (settleError) {
        console.error('Error fetching settlements:', settleError);
      }

      setExpenses(expData || []);
      setSettlements(settleData || []);

    } catch (err) {
      console.error('Unexpected fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // AUTO FETCH ON MONTH CHANGE
  // ============================================

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  // ============================================
  // UI
  // ============================================

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
        <div className="mb-6">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <ExpenseSummary
              expenses={expenses}
              settlements={settlements}
              onSettled={fetchData}
            />

            {/* Add expense */}
            <ExpenseForm
              onExpenseAdded={fetchData}
            />

            {/* Expense list */}
            <ExpenseList
              expenses={expenses}
              onExpenseDeleted={fetchData}
            />

            {/* Settlement history */}
            <SettlementHistory
              settlements={settlements}
              onSettlementDeleted={fetchData}
            />
          </>
        )}

      </div>
    </div>
  );
}

export default App;
