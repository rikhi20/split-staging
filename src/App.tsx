import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';

import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseSummary } from './components/ExpenseSummary';

import {
  Expense,
  Settlement,
  getExpenses,
  getSettlements,
} from './lib/supabase';


// YOUR REAL GROUP ID
const GROUP_ID = 'ad49abdf-fe1c-49f0-b0a4-5f4e8456a83f';


function App() {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );


  async function loadData() {

    try {

      setLoading(true);

      const allExpenses = await getExpenses(GROUP_ID);
      const allSettlements = await getSettlements(GROUP_ID);

      const filteredExpenses = allExpenses.filter(e =>
        e.expense_date.startsWith(selectedMonth)
      );

      const filteredSettlements = allSettlements.filter(s =>
        s.settlement_date.startsWith(selectedMonth)
      );

      setExpenses(filteredExpenses);
      setSettlements(filteredSettlements);

    } catch (err) {

      console.error(err);
      alert('Failed to load data');

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {
    loadData();
  }, [selectedMonth]);


  return (

    <div className="min-h-screen bg-gray-100">

      <div className="max-w-2xl mx-auto p-6">

        {/* Header */}

        <div className="flex items-center gap-3 mb-6">

          <Wallet className="text-blue-500" size={32} />

          <h1 className="text-2xl font-bold text-gray-800">
            Expense Tracker
          </h1>

        </div>


        {/* Month selector */}

        <div className="bg-white p-4 rounded-xl shadow mb-6">

          <label className="block text-sm font-medium text-gray-600 mb-1">
            Select Month
          </label>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />

        </div>


        {loading ? (

          <div className="text-center text-gray-500">
            Loading...
          </div>

        ) : (

          <>
            <ExpenseSummary
              groupId={GROUP_ID}
              expenses={expenses}
              settlements={settlements}
              onSettled={loadData}
            />

            <ExpenseForm
              groupId={GROUP_ID}
              onExpenseAdded={loadData}
            />

            <ExpenseList
              expenses={expenses}
              groupId={GROUP_ID}
              onChanged={loadData}
            />
          </>

        )}

      </div>

    </div>

  );

}

export default App;
