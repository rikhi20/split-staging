import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  selectedMonth: string; // NEW
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

export function ExpenseForm({ onExpenseAdded, selectedMonth }: ExpenseFormProps) {

  const [expenseType, setExpenseType] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<'person1' | 'person2'>('person1');
  const [split, setSplit] = useState(true);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!expenseType || !amount) return;

    setIsSubmitting(true);

    // IMPORTANT: use selectedMonth instead of today
    const expenseDate = `${selectedMonth}-01`;

    const { error } = await supabase
      .from('expenses')
      .insert({
        expense_type: expenseType,
        amount: parseFloat(amount),
        paid_by: paidBy,
        split,
        description: description || null,
        expense_date: expenseDate
      });

    if (error) {

      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');

    } else {

      setExpenseType('');
      setAmount('');
      setDescription('');
      setSplit(true);

      onExpenseAdded();

    }

    setIsSubmitting(false);
  };

  return (

    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">

      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Add New Expense
      </h2>

      <div className="space-y-4">

        {/* Expense Type */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expense Type
          </label>

          <select
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >

            <option value="">Select type...</option>

            {EXPENSE_TYPES.map((type) => (
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />

        </div>


        {/* Paid by */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => setPaidBy('person1')}
              className={`flex-1 py-2 rounded-md ${
                paidBy === 'person1'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              Rikhi
            </button>

            <button
              type="button"
              onClick={() => setPaidBy('person2')}
              className={`flex-1 py-2 rounded-md ${
                paidBy === 'person2'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              Saki
            </button>

          </div>

        </div>


        {/* Split */}
        <div>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={split}
              onChange={(e) => setSplit(e.target.checked)}
            />

            Split this expense 50/50

          </label>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

        </div>


        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-3 rounded-md"
        >

          <PlusCircle className="inline mr-2" size={18} />

          {isSubmitting ? 'Adding...' : 'Add Expense'}

        </button>

      </div>

    </form>

  );

}
