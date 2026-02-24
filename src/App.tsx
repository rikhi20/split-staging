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

      //----------------------------------------
      // Calculate date range
      //----------------------------------------

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

      //----------------------------------------
      // Fetch correctly
      //----------------------------------------

      const expensesData = await getExpenses(
        startDate,
        endDate
      );

      const settlementsData = await getSettlements(
        startDate,
        endDate
      );

      setExpenses(expensesData);
      setSettlements(settlementsData);

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
              expenses={expenses}
              settlements={settlements}
              onSettled={loadData}
            />

            <ExpenseForm
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
