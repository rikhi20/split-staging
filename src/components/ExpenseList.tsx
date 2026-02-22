import { Trash2, Users, User, CheckCircle } from 'lucide-react';
import { Expense, supabase } from '../lib/supabase';

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
}

export function ExpenseList({ expenses, onExpenseDeleted }: ExpenseListProps) {

  const handleDelete = async (id: string) => {

    if (!confirm('Are you sure you want to delete this expense?')) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {

      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');

    } else {

      onExpenseDeleted();

    }

  };


  // UPDATED: use expense_date instead of created_at
  const formatDate = (dateString: string) => {

    const date = new Date(dateString);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);

  };


  // UPDATED empty state
  if (expenses.length === 0) {

    return (

      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">

        <p>No expenses for this month.</p>

      </div>

    );

  }


  return (

    <div className="bg-white rounded-lg shadow-md overflow-hidden">

      <div className="p-4 bg-gray-50 border-b border-gray-200">

        <h2 className="text-lg font-semibold text-gray-800">
          Expense History
        </h2>

      </div>


      <div className="divide-y divide-gray-200">

        {expenses.map((expense) => (

          <div
            key={expense.id}
            className={`p-4 hover:bg-gray-50 transition-colors
              ${expense.settled ? 'opacity-60 bg-gray-50' : ''}`}
          >

            <div className="flex items-start justify-between gap-3">

              {/* LEFT */}
              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 mb-1">

                  <span className="font-medium text-gray-900">
                    {expense.expense_type}
                  </span>

                  {expense.split ? (
                    <Users size={14} className="text-blue-500 flex-shrink-0" />
                  ) : (
                    <User size={14} className="text-gray-400 flex-shrink-0" />
                  )}

                  {/* NEW settled indicator */}
                  {expense.settled && (
                    <CheckCircle size={14} className="text-green-500" />
                  )}

                </div>


                {expense.description && (

                  <p className="text-sm text-gray-600 mb-1">
                    {expense.description}
                  </p>

                )}


                <div className="flex items-center gap-2 text-xs text-gray-500">

                  <span>
                    Paid by {expense.paid_by === 'person1' ? 'You' : 'Partner'}
                  </span>

                  <span>•</span>

                  {/* UPDATED */}
                  <span>
                    {formatDate(expense.expense_date)}
                  </span>

                  {expense.settled && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">
                        Settled
                      </span>
                    </>
                  )}

                </div>

              </div>


              {/* RIGHT */}
              <div className="flex items-center gap-3">

                <div className="text-right">

                  <p className="text-lg font-bold text-gray-900">

                    ¥{Number(expense.amount).toLocaleString()}

                  </p>

                  {expense.split && (

                    <p className="text-xs text-gray-500">

                      ¥{(Number(expense.amount) / 2).toLocaleString()} each

                    </p>

                  )}

                </div>


                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  aria-label="Delete expense"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}
