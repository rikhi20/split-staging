import { supabase, Expense } from '../lib/supabase';

interface Props {
  expenses: Expense[];
  onChanged: () => void;
}

export function ExpenseList({ expenses, onChanged }: Props) {

  async function deleteExpense(id: string) {

    if (!confirm('Delete expense?')) return;

    await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    onChanged();

  }


  return (

    <div className="bg-white p-4 rounded mb-4">

      <h2 className="font-bold mb-2">
        Expenses
      </h2>

      {expenses.map(expense => (

        <div
          key={expense.id}
          className="flex justify-between border-b py-2"
        >

          <div>
            <div className="font-medium">
              {expense.expense_type}
            </div>

            <div className="text-sm text-gray-500">
              {expense.paid_by}
            </div>
          </div>

          <div className="flex gap-3 items-center">

            <div>
              ¥{expense.amount.toLocaleString()}
            </div>

            <button
              onClick={() => deleteExpense(expense.id)}
              className="text-red-500"
            >
              Delete
            </button>

          </div>

        </div>

      ))}

    </div>

  );

}
