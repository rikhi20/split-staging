import { Trash2 } from 'lucide-react';
import { Expense, deleteExpense } from '../lib/supabase';

interface Props {
  expenses: Expense[];
  groupId: string;
  onChanged: () => void;
}

export function ExpenseList({
  expenses,
  groupId,
  onChanged
}: Props) {


  async function handleDelete(id: string) {

    if (!confirm('Delete expense?')) return;

    await deleteExpense(id);

    onChanged();

  }


  return (

    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="font-bold mb-4">
        Expenses
      </h2>


      {expenses.length === 0 ? (

        <div className="text-gray-500">
          No expenses yet
        </div>

      ) : (

        <div className="space-y-3">

          {expenses.map(e => (

            <div
              key={e.id}
              className="flex justify-between items-center border-b pb-2"
            >

              <div>

                <div className="font-medium">
                  ¥{e.amount.toLocaleString()}
                </div>

                <div className="text-sm text-gray-500">
                  Paid by {e.paid_by}
                </div>

              </div>


              <button
                onClick={() => handleDelete(e.id)}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}
