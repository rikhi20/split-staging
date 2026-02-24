import { CheckCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Expense, Settlement, supabase } from '../lib/supabase';

interface Props {
  expenses: Expense[];
  settlements: Settlement[];
  onSettled: () => void;
}

export function ExpenseSummary({ expenses, settlements, onSettled }: Props) {

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // CALCULATE PAYMENTS (ONLY SPLIT EXPENSES)
  // ============================================

  let rikhiPaid = 0;
  let sakiPaid = 0;

  expenses.forEach(expense => {

    if (!expense.split) return;

    if (expense.paid_by === 'person1') {
      rikhiPaid += expense.amount;
    }

    if (expense.paid_by === 'person2') {
      sakiPaid += expense.amount;
    }

  });

  // ============================================
  // CALCULATE BALANCE
  // Positive = person2 owes person1
  // Negative = person1 owes person2
  // ============================================

  let balance = 0;

  expenses.forEach(expense => {

    if (!expense.split) return;

    if (expense.paid_by === 'person1') {
      balance += expense.amount / 2;
    }

    if (expense.paid_by === 'person2') {
      balance -= expense.amount / 2;
    }

  });

  // Apply settlements
  settlements.forEach(settlement => {

    if (settlement.paid_by === 'person1') {
      balance -= settlement.amount;
    }

    if (settlement.paid_by === 'person2') {
      balance += settlement.amount;
    }

  });

  const owedAmount = Math.abs(Math.round(balance));

  const owedBy = balance > 0 ? 'person2' : 'person1';
  const owedTo = balance > 0 ? 'person1' : 'person2';

  const owedByName = owedBy === 'person1' ? 'Rikhi' : 'Saki';
  const owedToName = owedTo === 'person1' ? 'Rikhi' : 'Saki';

  // ============================================
  // SETTLE FUNCTION (CORRECT V3 INSERT)
  // ============================================

  const handleSettleUp = async () => {

    if (owedAmount === 0) {
      alert('Already settled');
      return;
    }

    try {

      setIsSubmitting(true);

      const { error } = await supabase
        .from('settlements')
        .insert({
          amount: owedAmount,
          paid_by: owedBy,
          paid_to: owedTo,
          settlement_date: new Date().toISOString().slice(0, 10),
        });

      if (error) throw error;

      setShowModal(false);

      onSettled();

    } catch (err) {

      console.error(err);

      alert('Failed to record settlement');

    } finally {

      setIsSubmitting(false);

    }

  };

  // ============================================
  // UI
  // ============================================

  return (
    <>

      <div className="space-y-4 mb-6">

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">

            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-emerald-600" size={20} />
              <span className="text-sm font-semibold text-emerald-700">
                Rikhi Paid
              </span>
            </div>

            <p className="text-2xl font-bold text-emerald-900">
              ¥{rikhiPaid.toLocaleString()}
            </p>

          </div>


          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">

            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-blue-700">
                Saki Paid
              </span>
            </div>

            <p className="text-2xl font-bold text-blue-900">
              ¥{sakiPaid.toLocaleString()}
            </p>

          </div>

        </div>


        <div className={`bg-gradient-to-br rounded-lg p-6 shadow-lg border ${
          owedAmount === 0
            ? 'from-green-500 to-emerald-600 border-green-400'
            : 'from-amber-500 to-orange-600 border-amber-400'
        } text-white`}>

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-lg font-bold">
              Settlement Status
            </h2>

            <button
              onClick={() => setShowModal(true)}
              disabled={owedAmount === 0}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                owedAmount === 0
                  ? 'bg-white/30 cursor-default'
                  : 'bg-white text-amber-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle size={18} />
              {owedAmount === 0 ? 'Settled' : 'Settle'}
            </button>

          </div>


          {owedAmount === 0 ? (

            <div className="text-center">
              <p className="text-xl font-semibold">
                All settled up!
              </p>
            </div>

          ) : (

            <div className="bg-white/20 rounded-lg p-4">

              <p className="font-bold text-lg">
                {owedByName} owes {owedToName}
              </p>

              <p className="text-3xl font-bold">
                ¥{owedAmount.toLocaleString()}
              </p>

            </div>

          )}

        </div>

      </div>


      {showModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white rounded-lg p-6 max-w-sm w-full">

            <h3 className="text-lg font-bold mb-4">
              Confirm Settlement
            </h3>

            <p className="mb-6">
              {owedByName} will pay ¥{owedAmount.toLocaleString()} to {owedToName}
            </p>

            <div className="flex gap-3">

              <button
                onClick={handleSettleUp}
                disabled={isSubmitting}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg"
              >
                Confirm
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );

}
