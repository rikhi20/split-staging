import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Expense {
  id: string;
  amount: number;
  description: string | null;
  paid_by: string;
  created_at: string;
}

interface Props {
  groupId: string;
  refreshKey: number;
}

export function ExpenseList({ groupId, refreshKey }: Props) {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  //--------------------------------------------------
  // FETCH EXPENSES
  //--------------------------------------------------

  useEffect(() => {
    fetchExpenses();
  }, [groupId, refreshKey]);

  async function fetchExpenses() {

    setLoading(true);

    const { data, error } = await supabase
      .from("expenses")
      .select(`
        id,
        amount,
        description,
        paid_by,
        created_at
      `)
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load expenses");
    } else {
      setExpenses(data || []);
    }

    setLoading(false);
  }

  //--------------------------------------------------
  // DELETE
  //--------------------------------------------------

  async function deleteExpense(id: string) {

    if (!confirm("Delete this expense?")) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Delete failed");
      return;
    }

    fetchExpenses();
  }

  //--------------------------------------------------
  // FORMAT DATE
  //--------------------------------------------------

  function formatDate(dateString: string) {

    const d = new Date(dateString);

    return d.toLocaleDateString("en-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

  if (loading)
    return (
      <div className="bg-white p-4 rounded-xl shadow">
        Loading expenses...
      </div>
    );

  return (
    <div className="bg-white p-4 rounded-xl shadow">

      <h2 className="font-semibold mb-3">
        Expenses
      </h2>

      {expenses.length === 0 && (
        <div className="text-gray-500 text-sm">
          No expenses yet
        </div>
      )}

      <div className="space-y-3">

        {expenses.map(exp => (

          <div
            key={exp.id}
            className="flex justify-between items-center border-b pb-2"
          >

            <div>

              <div className="font-medium">
                ¥{exp.amount.toLocaleString()}
              </div>

              {exp.description && (
                <div className="text-sm text-gray-600">
                  {exp.description}
                </div>
              )}

              <div className="text-xs text-gray-400">
                {formatDate(exp.created_at)}
              </div>

            </div>

            <button
              onClick={() => deleteExpense(exp.id)}
              className="text-red-500 text-sm hover:text-red-700"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}
