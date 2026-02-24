import { Users, ArrowRight } from 'lucide-react';
import { Expense } from '../lib/supabase';

interface Props {
  expenses: Expense[];
}

const PERSON1_NAME = "Rikhi";
const PERSON2_NAME = "Saki";

export function ExpenseSummary({ expenses }: Props) {

  const person1Paid = expenses
    .filter(e => e.paid_by === 'person1')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const person2Paid = expenses
    .filter(e => e.paid_by === 'person2')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const total = person1Paid + person2Paid;
  const split = total / 2;

  const person1Balance = person1Paid - split;
  const person2Balance = person2Paid - split;

  return (
    <div className="space-y-4">

      {/* Paid cards */}
      <div className="grid grid-cols-2 gap-4">

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 mb-1">
            <Users size={18}/>
            <span className="text-sm opacity-90">{PERSON1_NAME} Paid</span>
          </div>
          <div className="text-2xl font-bold">
            ¥{person1Paid.toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-2 mb-1">
            <Users size={18}/>
            <span className="text-sm opacity-90">{PERSON2_NAME} Paid</span>
          </div>
          <div className="text-2xl font-bold">
            ¥{person2Paid.toLocaleString()}
          </div>
        </div>

      </div>


      {/* Settlement card */}
      {Math.abs(person1Balance) > 0.01 && (
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 rounded-xl shadow">

          <div className="flex items-center gap-2 mb-1">
            <ArrowRight size={18}/>
            <span className="text-sm opacity-90">Settlement</span>
          </div>

          <div className="text-lg font-semibold">
            {person1Balance > 0
              ? `${PERSON2_NAME} owes ${PERSON1_NAME}`
              : `${PERSON1_NAME} owes ${PERSON2_NAME}`
            }
          </div>

          <div className="text-2xl font-bold">
            ¥{Math.abs(person1Balance).toLocaleString()}
          </div>

        </div>
      )}

    </div>
  );
}
