import { useState } from 'react';
import {
  Expense,
  Settlement,
  recordSettlement,
  Person
} from '../lib/supabase';


interface Props {
  groupId: string;
  expenses: Expense[];
  settlements: Settlement[];
  onSettled: () => void;
}


export function ExpenseSummary({
  groupId,
  expenses,
  settlements,
  onSettled
}: Props) {


  let rikhiPaid = 0;
  let sakiPaid = 0;

  expenses.forEach(e => {

    if (e.paid_by === 'Rikhi')
      rikhiPaid += e.amount;

    if (e.paid_by === 'Saki')
      sakiPaid += e.amount;

  });


  const total = rikhiPaid + sakiPaid;
  const each = total / 2;

  let balance = rikhiPaid - each;

  settlements.forEach(s => {

    if (s.paid_by === 'Rikhi')
      balance -= s.amount;

    if (s.paid_by === 'Saki')
      balance += s.amount;

  });


  const owedAmount = Math.round(Math.abs(balance));

  const owedBy: Person =
    balance > 0 ? 'Saki' : 'Rikhi';

  const owedTo: Person =
    balance > 0 ? 'Rikhi' : 'Saki';


  const [loading, setLoading] = useState(false);


  async function settle() {

    if (owedAmount === 0) {
      alert('Already settled');
      return;
    }

    try {

      setLoading(true);

      await recordSettlement(
        groupId,
        owedAmount,
        owedBy,
        owedTo
      );

      onSettled();

    } catch {

      alert('Settlement failed');

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="bg-white p-4 rounded mb-4">

      <div>Rikhi Paid: ¥{rikhiPaid}</div>

      <div>Saki Paid: ¥{sakiPaid}</div>

      <div className="font-bold mt-2">

        {owedAmount === 0
          ? 'Settled'
          : `${owedBy} owes ${owedTo} ¥${owedAmount}`}

      </div>

      <button
        onClick={settle}
        disabled={loading || owedAmount === 0}
        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
      >
        Settle
      </button>

    </div>

  );

}
