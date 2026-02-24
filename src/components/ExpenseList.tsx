import { useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  groupId: string;
  onExpenseAdded: () => void;
}

export function ExpenseForm({ groupId, onExpenseAdded }: Props) {

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitEqual, setSplitEqual] = useState(true);
  const [loading, setLoading] = useState(false);

  //--------------------------------------------------
  // SUBMIT
  //--------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!amount || !groupId) return;

    setLoading(true);

    try {
      //--------------------------------------------------
      // GET CURRENT USER
      //--------------------------------------------------

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) throw new Error("Not logged in");

      //--------------------------------------------------
      // CREATE EXPENSE
      //--------------------------------------------------

      const { data: expense, error } = await supabase
        .from("expenses")
        .insert({
          group_id: groupId,
          paid_by: user.id,
          amount: Number(amount),
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;

      //--------------------------------------------------
      // GET GROUP MEMBERS
      //--------------------------------------------------

      const { data: members } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);

      if (!members || members.length === 0)
        throw new Error("No group members");

      //--------------------------------------------------
      // CREATE SPLITS
      //--------------------------------------------------

      if (splitEqual) {

        const splitAmount = Number(amount) / members.length;

        const splits = members.map(member => ({
          expense_id: expense.id,
          user_id: member.user_id,
          amount: splitAmount,
        }));

        const { error: splitError } = await supabase
          .from("expense_splits")
          .insert(splits);

        if (splitError) throw splitError;
      }

      //--------------------------------------------------
      // RESET
      //--------------------------------------------------

      setAmount("");
      setDescription("");

      onExpenseAdded();

    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    }

    setLoading(false);
  }

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

  return (
    <div className="bg-white p-4 rounded-xl shadow">

      <h2 className="font-semibold mb-3">
        Add Expense
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* amount */}
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2"
        />

        {/* description */}
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        {/* split toggle */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={splitEqual}
            onChange={(e) => setSplitEqual(e.target.checked)}
          />
          Split equally
        </label>

        {/* button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          {loading ? "Adding..." : "Add Expense"}
        </button>

      </form>

    </div>
  );
}
