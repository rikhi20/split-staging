import { useState } from 'react';
import { addExpense, Person } from '../lib/supabase';

interface Props {
  groupId: string;
  onExpenseAdded: () => void;
}

export function ExpenseForm({ groupId, onExpenseAdded }: Props) {

  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<Person>('Rikhi');

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!amount) return;

    await addExpense(
      groupId,
      'General',
      Number(amount),
      paidBy
    );

    setAmount('');

    onExpenseAdded();

  }


  return (

    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow mb-6"
    >

      <h2 className="font-bold mb-4">
        Add Expense
      </h2>


      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />


      <select
        value={paidBy}
        onChange={e => setPaidBy(e.target.value as Person)}
        className="border p-2 rounded w-full mb-3"
      >
        <option value="Rikhi">Rikhi</option>
        <option value="Saki">Saki</option>
      </select>


      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Add
      </button>

    </form>

  );

}
