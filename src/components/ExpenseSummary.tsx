import { ArrowRight, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
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

  let balance = 0;
  let rikhiPaid = 0;
  let sakiPaid = 0;

  expenses.forEach(expense => {
    if (!expense.split) return;

    if (expense.paid_by === 'person1') {
      rikhiPaid += expense.amount;
      balance += expense.amount / 2;
    } else {
      sakiPaid += expense.amount;
      balance -= expense.amount / 2;
    }
  });

  settlements.forEach(settlement => {
    if (settlement.paid_by === 'person1') {
      balance -= settlement.amount || settlement.settled_amount;
    } else {
      balance += settlement.amount || settlement.settled_amount;
    }
  });

  const owedBy = balance > 0 ? 'person2' : 'person1';
  const owedAmount = Math.abs(balance);

  const handleSettleUp = async () => {
    if (owedAmount === 0) {
      alert('Already settled');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('settlements').insert({
      amount: owedAmount,
      from_payer: owedBy === 'person1' ? 'person2' : 'person1',
      to_payer: owedBy,
      settled_amount: owedAmount,
      settlement_date: new Date().toISOString().slice(0, 10),
    });

    if (error) {
      console.error('Error:', error);
      alert('Failed to record settlement');
    } else {
      setShowModal(false);
      onSettled();
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-emerald-600" size={20} />
              <span className="text-sm font-semibold text-emerald-700">Rikhi Paid</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">¥{rikhiPaid.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-blue-700">Saki Paid</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">¥{sakiPaid.toLocaleString()}</p>
          </div>
        </div>

        <div className={`bg-gradient-to-br rounded-lg p-6 shadow-lg border transition-all ${
          owedAmount === 0
            ? 'from-green-500 to-emerald-600 border-green-400'
            : 'from-amber-500 to-orange-600 border-amber-400'
        } text-white`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Settlement Status</h2>
            <button
              onClick={() => setShowModal(true)}
              disabled={owedAmount === 0}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                owedAmount === 0
                  ? 'bg-white/30 text-white cursor-default'
                  : 'bg-white text-amber-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle size={18} />
              {owedAmount === 0 ? 'Settled' : 'Settle'}
            </button>
          </div>

          {owedAmount === 0 ? (
            <div className="text-center">
              <p className="text-xl font-semibold">All settled up!</p>
              <p className="text-white/80 text-sm mt-1">You're even for this month</p>
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 mb-1">Who owes what:</p>
                  <p className="font-bold text-lg">
                    {owedBy === 'person1' ? 'Rikhi' : 'Saki'} owes {owedBy === 'person1' ? 'Saki' : 'Rikhi'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm mb-1">Amount</p>
                  <p className="text-3xl font-bold">¥{owedAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Settlement</h3>
            <p className="text-gray-600 mb-6">
              {owedBy === 'person1' ? 'Rikhi' : 'Saki'} will pay{' '}
              <span className="font-bold text-lg text-amber-600">¥{owedAmount.toLocaleString()}</span> to{' '}
              {owedBy === 'person1' ? 'Saki' : 'Rikhi'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSettleUp}
                disabled={isSubmitting}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Recording...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg transition-colors"
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
