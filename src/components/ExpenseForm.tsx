import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { addExpense, Person } from '../lib/supabase';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

const EXPENSE_TYPES = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Groceries',
  'Healthcare',
  'Other'
];

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {

  const [expenseType, setExpenseType] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<Person>('Rikhi');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!expenseType || !amount) return;

    try {

      setIsSubmitting(true);

      await addExpense(
        expenseType,
        parseFloat(amount),
        paidBy,
        description
      );

      // reset form
      setExpenseType('');
      setAmount('');
      setDescription('');
      setPaidBy('Rikhi');

      onExpenseAdded();

    } catch (error) {

      console.error(error);

      alert('Failed to add expense');

    } finally {

      setIsSubmitting(false);

    }

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >

      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Add New Expense
      </h2>


      <div className="space-y-4">

        {/* Type */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expense Type
          </label>

          <select
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >

            <option value="">
              Select type...
            </option>

            {EXPENSE_TYPES.map(type => (

              <option key={type} value={type}>
                {type}
              </option>

            ))}

          </select>

        </div>


        {/* Amount */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (¥)
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />

        </div>


        {/* Paid By */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => setPaidBy('Rikhi')}
              className={`flex-1 py-2 rounded-md ${
                paidBy === 'Rikhi'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              Rikhi
            </button>


            <button
              type="button"
              onClick={() => setPaidBy('Saki')}
              className={`flex-1 py-2 rounded-md ${
                paidBy === 'Saki'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              Saki
            </button>

          </div>

        </div>


        {/* Description */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />

        </div>


        {/* Submit */}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-3 rounded-md"
        >

          <PlusCircle size={20} />

          {isSubmitting ? 'Adding...' : 'Add Expense'}

        </button>

      </div>

    </form>

  );

}
