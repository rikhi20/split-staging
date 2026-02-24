import { useState } from 'react';
import { addExpense, Person } from '../lib/supabase';

interface Props {
  groupId: string;
  onExpenseAdded: () => void;
}

export function ExpenseForm({ groupId, onExpenseAdded }: Props) {

  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<Person>('Rikhi');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!type || !amount) {
      alert('Fill all fields');
      return;
    }

    try {

      setLoading(true);

      await addExpense(
        groupId,
        type,
        Number(amount),
        paidBy,
        description
      );

      setType('');
      setAmount('');
      setDescription('');

      onExpenseAdded();

    } catch {

      alert('Failed to add expense');

    } finally {

      setLoading(false);

    }

  }


  return (

    <form onSubmit={handleSubmit} className="bg-white p-4 rounded mb-4">

      <input
        placeholder="Expense type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      <select
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value as Person)}
        className="border p-2 rounded w-full mb-2"
      >
        <option value="Rikhi">Rikhi</option>
        <option value="Saki">Saki</option>
      </select>

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      <button
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Add Expense
      </button>

    </form>

  );

}
