import { Trash2, User } from 'lucide-react';
import { Expense, deleteExpense } from '../lib/supabase';

interface Props {
  expenses: Expense[];
  onExpenseDeleted: () => void;
}

const PERSON1_NAME = "Rikhi";
const PERSON2_NAME = "Saki";

export function ExpenseList({ expenses, onExpenseDeleted }: Props) {

  function getPersonName(paid_by: string) {
    if (paid_by === 'person1') return PERSON1_NAME;
    if (paid_by === 'person2') return PERSON2_NAME;
    return paid_by;
  }

  function getPersonColor(paid_by: string) {
    if (paid_by === 'person1')
      return "bg-emerald-100 text-emerald-700";

    if (paid_by === 'person2')
      return "bg-blue-100 text-blue-700";

    return "bg-gray-100 text-gray-700";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;

    const success = await deleteExpense(id);

    if (success) {
      onExpenseDeleted();
    } else {
      alert("Failed to delete expense");
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No expenses yet
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {expenses.map(expense => (

        <div
          key={expense.id}
          className="bg-white rounded-xl shadow-sm border p-4 flex justify-between items-center"
        >

          {/* Left */}
          <div>

            <div className="font-semibold text-gray-800">
              {expense.description}
            </div>

            <div className="text-sm text-gray-500">
              {new Date(expense.expense_date).toLocaleDateString()}
            </div>

            <div className="mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getPersonColor(expense.paid_by)}`}>
                <User size={12} className="inline mr-1"/>
                {getPersonName(expense.paid_by)}
              </span>
            </div>

          </div>


          {/* Right */}
          <div className="flex items-center gap-3">

            <div className="text-lg font-bold text-gray-800">
              ¥{Number(expense.amount).toLocaleString()}
            </div>

            <button
              onClick={() => handleDelete(expense.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18}/>
            </button>

          </div>

        </div>

      ))}

    </div>
  );
}
