import { Trash2 } from 'lucide-react';
import { Settlement, supabase } from '../lib/supabase';

interface Props {
  settlements: Settlement[];
  onSettlementDeleted: () => void;
}

export function SettlementHistory({ settlements, onSettlementDeleted }: Props) {
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this settlement record?')) return;

    const { error } = await supabase.from('settlements').delete().eq('id', id);

    if (error) {
      console.error('Error:', error);
      alert('Failed to delete settlement');
    } else {
      onSettlementDeleted();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (settlements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Settlement History</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {settlements.map((settlement) => (
          <div key={settlement.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <span className="font-medium text-gray-900">
                    {settlement.paid_by === 'person1' ? 'Rikhi' : 'Saki'} → {settlement.paid_to === 'person1' ? 'Rikhi' : 'Saki'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(settlement.settlement_date)}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ¥{Number(settlement.amount).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(settlement.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  aria-label="Delete settlement"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
