import { CheckCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Expense, Settlement, settleUp } from '../lib/supabase';

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

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  let rikhiPaid = 0;
  let sakiPaid = 0;

  expenses.forEach(e => {
    if (e.paid_by === 'Rikhi') rikhiPaid += e.amount;
    if (e.paid_by === 'Saki') sakiPaid += e.amount;
  });

  const total = rikhiPaid + sakiPaid;
  const each = total / 2;

  let balance = rikhiPaid - each;

  settlements.forEach(s => {
    if (s.paid_by === 'Rikhi') balance -= s.amount;
    if (s.paid_by === 'Saki') balance += s.amount;
  });

  const owedAmount = Math.abs(Math.round(balance));

  const owedBy = balance > 0 ? 'Saki' : 'Rikhi';
  const owedTo = balance > 0 ? 'Rikhi' : 'Saki';


  async function handleSettle() {

    try {

      setLoading(true);

      await settleUp(
        groupId,
        owedAmount,
        owedBy,
        owedTo
      );

      setShowModal(false);

      onSettled();

    } catch {

      alert('Settlement failed');

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="bg-white p-6 rounded-xl shadow mb-6">

      <h2 className="text-lg font-bold mb-4 text-gray-800">
        Summary
      </h2>


      <div className="grid grid-cols-2 gap-4 mb-4">

        <div className="bg-green-100 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} />
            <span>Rikhi Paid</span>
          </div>

          <div className="text-xl font-bold">
            ¥{rikhiPaid.toLocaleString()}
          </div>
        </div>


        <div className="bg-blue-100 p-4 rounded-lg">

          <div className="flex items-center gap-2">
            <TrendingUp size={18} />
            <span>Saki Paid</span>
          </div>

          <div className="text-xl font-bold">
            ¥{sakiPaid.toLocaleString()}
          </div>

        </div>

      </div>


      {owedAmount === 0 ? (

        <div className="text-green-600 font-bold">
          All settled up
        </div>

      ) : (

        <>
          <div className="mb-4">

            <div className="font-semibold">
              {owedBy} owes {owedTo}
            </div>

            <div className="text-2xl font-bold text-orange-600">
              ¥{owedAmount.toLocaleString()}
            </div>

          </div>


          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={18} />
            Settle
          </button>

        </>

      )}


      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg">

            <div className="mb-4">
              Confirm settlement?
            </div>

            <div className="flex gap-3">

              <button
                onClick={handleSettle}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}
