import { CheckCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Expense, Settlement, recordSettlement } from '../lib/supabase';

interface Props {
  expenses: Expense[];
  settlements: Settlement[];
  groupId: string; // ✅ REQUIRED FOR V3
  onSettled: () => void;
}

export function ExpenseSummary({
  expenses,
  settlements,
  groupId,
  onSettled
}: Props) {

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // CALCULATE TOTAL PAID
  // ============================================

  let rikhiPaid = 0;
  let sakiPaid = 0;

  expenses.forEach(expense => {

    if (expense.paid_by === 'Rikhi') {
      rikhiPaid += Number(expense.amount);
    }

    if (expense.paid_by === 'Saki') {
      sakiPaid += Number(expense.amount);
    }

  });

  // ============================================
  // CALCULATE BASE BALANCE
  // ============================================

  const total = rikhiPaid + sakiPaid;
  const eachShouldPay = total / 2;

  let balance = rikhiPaid - eachShouldPay;

  // ============================================
  // APPLY SETTLEMENTS
  // ============================================

  settlements.forEach(settlement => {

    if (settlement.paid_by === 'Rikhi') {
      balance -= Number(settlement.amount);
    }

    if (settlement.paid_by === 'Saki') {
      balance += Number(settlement.amount);
    }

  });

  // round properly
  balance = Math.round(balance);

  const owedAmount = Math.abs(balance);

  const owedBy = balance > 0 ? 'Saki' : 'Rikhi';
  const owedTo = balance > 0 ? 'Rikhi' : 'Saki';

  const isSettled = owedAmount === 0;

  // ============================================
  // SETTLE FUNCTION (FIXED FOR V3)
  // ============================================

  const handleSettleUp = async () => {

    if (isSettled) {
      alert('Already settled');
      return;
    }

    try {

      setIsSubmitting(true);

      await recordSettlement(
        groupId,     // ✅ FIXED
        owedAmount,
        owedBy,
        owedTo
      );

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

        {/* Paid cards */}

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


        {/* Settlement card */}

        <div className={`bg-gradient-to-br rounded-lg p-6 shadow-lg border transition-all ${
          isSettled
            ? 'from-green-500 to-emerald-600 border-green-400'
            : 'from-amber-500 to-orange-600 border-amber-400'
        } text-white`}>

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-lg font-bold">
              Settlement Status
            </h2>

            <button
              onClick={() => setShowModal(true)}
              disabled={isSettled}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                isSettled
                  ? 'bg-white/30 cursor-default'
                  : 'bg-white text-amber-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle size={18} />
              {isSettled ? 'Settled' : 'Settle'}
            </button>

          </div>


          {isSettled ? (

            <div className="text-center">
              <p className="text-xl font-semibold">
                All settled up!
              </p>
            </div>

          ) : (

            <div className="bg-white/20 rounded-lg p-4">

              <p className="font-bold text-lg">
                {owedBy} owes {owedTo}
              </p>

              <p className="text-3xl font-bold">
                ¥{owedAmount.toLocaleString()}
              </p>

            </div>

          )}

        </div>

      </div>


      {/* Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white rounded-lg p-6 max-w-sm w-full">

            <h3 className="text-lg font-bold mb-4">
              Confirm Settlement
            </h3>

            <p className="mb-6">
              {owedBy} will pay ¥{owedAmount.toLocaleString()} to {owedTo}
            </p>

            <div className="flex gap-3">

              <button
                onClick={handleSettleUp}
                disabled={isSubmitting}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg"
              >
                {isSubmitting ? 'Recording...' : 'Confirm'}
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
