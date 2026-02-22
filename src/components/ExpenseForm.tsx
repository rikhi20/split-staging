import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [paidBy, setPaidBy] = useState<'person1' | 'person2'>('person1');
  const [split, setSplit] = useState(true);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseType || !amount) return;

    setIsSubmitting(true);

    const { error } = await supabase.from('expenses').insert({
      expense_type: expenseType,
      amount: parseFloat(amount),
      paid_by: paidBy,
      split,
      description: description || null,
      expense_date: new Date().toISOString().slice(0,10)
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
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Expense</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="expense-type" className="block text-sm font-medium text-gray-700 mb-1">
            Expense Type
          </label>
          <select
            id="expense-type"
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select type...</option>
            {EXPENSE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (¥)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaidBy('person1')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                paidBy === 'person1'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rikhi
            </button>
            <button
              type="button"
              onClick={() => setPaidBy('person2')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                paidBy === 'person2'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Saki
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={split}
              onChange={(e) => setSplit(e.target.checked)}
              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Split this expense 50/50</span>
          </label>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a note..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle size={20} />
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
