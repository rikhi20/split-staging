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


// ✅ CHANGE THIS to your real group_id from Supabase
const GROUP_ID = 'YOUR_GROUP_ID_HERE';


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

        <div className="flex items-center gap-3 mb-6">

          <Wallet className="text-blue-500" size={32} />

          <h1 className="text-2xl font-bold">
            Expense Tracker
          </h1>

        </div>


        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded mb-4 w-full"
        />


        {loading ? (

          <div>Loading...</div>

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
              onChanged={loadData}
            />
          </>

        )}

      </div>

    </div>

  );

}

export default App;
