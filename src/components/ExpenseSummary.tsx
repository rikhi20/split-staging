import { useState } from 'react';
import { settleUp, Settlement, Expense } from '../lib/supabase';

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

  const [loading, setLoading] = useState(false);

  // ============================================
  // CALCULATE TOTALS
  // ============================================

  const youPaid = expenses
    .filter(e => e.paid_by === 'you')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const partnerPaid = expenses
    .filter(e => e.paid_by === 'partner')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const total = youPaid + partnerPaid;
  const half = total / 2;

  const balance = youPaid - half;

  // subtract settlements already done
  const settlementsTotal = settlements.reduce(
    (sum, s) => sum + Number(s.amount),
    0
  );

  const finalBalance = balance - settlementsTotal;

  // ============================================
  // SETTLE HANDLER
  // ============================================

  async function handleSettle() {

    if (finalBalance === 0) return;

    setLoading(true);

    const amount = Math.abs(finalBalance);

    const success = await settleUp(
      groupId,
      amount,
      finalBalance > 0 ? 'partner' : 'you',
      finalBalance > 0 ? 'you' : 'partner'
    );

    setLoading(false);

    if (success) {
      onSettled();
    } else {
      alert('Settlement failed');
    }

  }

  // ============================================
  // UI
  // ============================================

  return (

    <div className="bg-white rounded-xl shadow p-4 mb-4">

      <h2 className="text-lg font-semibold mb-3">
        Summary
      </h2>

      <div className="space-y-1 text-sm">

        <div className="flex justify-between">
          <span>You paid:</span>
          <span className="font-medium">
            ¥{youPaid.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Partner paid:</span>
          <span className="font-medium">
            ¥{partnerPaid.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between border-t pt-2 mt-2 font-semibold">

          {finalBalance > 0 && (
            <>
              <span>Partner owes you:</span>
              <span className="text-green-600">
                ¥{finalBalance.toLocaleString()}
              </span>
            </>
          )}

          {finalBalance < 0 && (
            <>
              <span>You owe partner:</span>
              <span className="text-red-600">
                ¥{Math.abs(finalBalance).toLocaleString()}
              </span>
            </>
          )}

          {finalBalance === 0 && (
            <>
              <span>All settled</span>
              <span className="text-gray-500">
                ✓
              </span>
            </>
          )}

        </div>

      </div>

      {finalBalance !== 0 && (

        <button
          onClick={handleSettle}
          disabled={loading}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
        >
          {loading ? "Settling..." : "Settle Up"}
        </button>

      )}

      {/* ============================================
          SETTLEMENT HISTORY
      ============================================ */}

      {settlements.length > 0 && (

        <div className="mt-4">

          <h3 className="text-sm font-semibold mb-2">
            Settlement History
          </h3>

          <div className="space-y-1 text-xs text-gray-600">

            {settlements.map(s => (

              <div key={s.id} className="flex justify-between">

                <span>
                  {s.paid_by} → {s.paid_to}
                </span>

                <span>
                  ¥{Number(s.amount).toLocaleString()}
                </span>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}
