import { useState } from 'react';
import { addExpense } from '../lib/supabase';

interface Props {
  groupId: string;
  onExpenseAdded: () => void;
}

export function ExpenseForm({ groupId, onExpenseAdded }: Props) {

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('person1');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!description || !amount) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const success = await addExpense({

      group_id: groupId,
      description: description,
      amount: Number(amount),
      paid_by: paidBy,
      expense_date: today

    });

    setLoading(false);

    if (success) {

      setDescription('');
      setAmount('');
      setPaidBy('person1');

      onExpenseAdded();

    } else {

      alert("Failed to add expense");

    }

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border p-4 mb-4 space-y-3"
    >

      <input
        type="text"
        placeholder="Expense description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <select
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="person1">Rikhi</option>
        <option value="person2">Saki</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
      >
        {loading ? "Adding..." : "Add Expense"}
      </button>

    </form>

  );

}
