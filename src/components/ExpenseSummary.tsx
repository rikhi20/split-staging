import { ArrowRight } from 'lucide-react';
import { Expense } from '../lib/supabase';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const calculateBalance = () => {
    let person1Paid = 0;
    let person2Paid = 0;
    let person1Owes = 0;
    let person2Owes = 0;

    expenses.forEach((expense) => {
      const amount = Number(expense.amount);

      if (expense.paid_by === 'person1') {
        person1Paid += amount;
        if (expense.split) {
          person2Owes += amount / 2;
        }
      } else {
        person2Paid += amount;
        if (expense.split) {
          person1Owes += amount / 2;
        }
      }
    });

    const netBalance = person2Owes - person1Owes;

    return {
      person1Paid,
      person2Paid,
      totalSpent: person1Paid + person2Paid,
      netBalance,
      owedBy: netBalance > 0 ? 'person2' : 'person1',
      owedAmount: Math.abs(netBalance),
    };
  };

  const balance = calculateBalance();

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
      <h2 className="text-lg font-semibold mb-4">Summary</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-xs opacity-90 mb-1">Rikhi Paid</p>
          <p className="text-2xl font-bold">¥{balance.person1Paid.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-xs opacity-90 mb-1">Saki Paid</p>
          <p className="text-2xl font-bold">¥{balance.person2Paid.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 mb-4">
        <p className="text-xs opacity-90 mb-1">Total Spent Together</p>
        <p className="text-3xl font-bold">¥{balance.totalSpent.toLocaleString()}</p>
      </div>

      {balance.owedAmount > 0 && (
        <div className="bg-white rounded-lg p-4 text-gray-800">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {balance.owedBy === 'person2' ? 'Saki' : 'Rikhi'}
            </span>
            <ArrowRight size={20} className="text-gray-400" />
            <span className="font-medium">
              {balance.owedBy === 'person2' ? 'Rikhi' : 'Saki'}
            </span>
          </div>
          <p className="text-2xl font-bold text-center mt-2 text-blue-600">
            ¥{balance.owedAmount.toLocaleString()}
          </p>
          <p className="text-xs text-center text-gray-600 mt-1">
            {balance.owedBy === 'person2' ? 'Saki owes Rikhi' : 'Rikhi owe Saki'}
          </p>
        </div>
      )}

      {balance.owedAmount === 0 && expenses.length > 0 && (
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-gray-800 font-medium">All settled up!</p>
        </div>
      )}
    </div>
  );
}
