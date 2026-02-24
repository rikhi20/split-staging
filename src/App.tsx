import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseSummary } from "./components/ExpenseSummary";
import { Wallet } from "lucide-react";

type Expense = {
  id: string;
  description: string;
  amount: number;
  paid_by: string;
  created_at: string;
};

type Balance = {
  user_id: string;
  balance: number;
};

export default function App() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  //--------------------------------------------------
  // INIT
  //--------------------------------------------------

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);

    const gid = await getOrCreateGroup();
    setGroupId(gid);

    await loadExpenses(gid);
    await loadBalances(gid);

    setLoading(false);
  }

  //--------------------------------------------------
  // GET OR CREATE GROUP
  //--------------------------------------------------

  async function getOrCreateGroup(): Promise<string> {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) throw new Error("Not logged in");

    // check existing membership
    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membership?.group_id) {
      return membership.group_id;
    }

    // create new group
    const { data: newGroup } = await supabase
      .from("groups")
      .insert({ name: "Shared Group" })
      .select()
      .single();

    if (!newGroup) throw new Error("Failed creating group");

    // add member
    await supabase.from("group_members").insert({
      group_id: newGroup.id,
      user_id: user.id,
    });

    return newGroup.id;
  }

  //--------------------------------------------------
  // LOAD EXPENSES
  //--------------------------------------------------

  async function loadExpenses(gid: string) {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("group_id", gid)
      .order("created_at", { ascending: false });

    setExpenses(data || []);
  }

  //--------------------------------------------------
  // LOAD BALANCES
  //--------------------------------------------------

  async function loadBalances(gid: string) {
    const { data } = await supabase
      .from("group_balances")
      .select("*")
      .eq("group_id", gid);

    setBalances(data || []);
  }

  //--------------------------------------------------
  // REFRESH ALL
  //--------------------------------------------------

  async function refresh() {
    if (!groupId) return;

    await loadExpenses(groupId);
    await loadBalances(groupId);
  }

  //--------------------------------------------------
  // SETTLE UP CALCULATION
  //--------------------------------------------------

  function calculateSettlements() {
    const creditors = balances
      .filter(b => b.balance > 0)
      .map(b => ({ ...b }));

    const debtors = balances
      .filter(b => b.balance < 0)
      .map(b => ({ ...b }));

    const settlements: {
      from: string;
      to: string;
      amount: number;
    }[] = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debt = Math.abs(debtors[i].balance);
      const credit = creditors[j].balance;

      const amount = Math.min(debt, credit);

      settlements.push({
        from: debtors[i].user_id,
        to: creditors[j].user_id,
        amount,
      });

      debtors[i].balance += amount;
      creditors[j].balance -= amount;

      if (Math.abs(debtors[i].balance) < 0.01) i++;
      if (Math.abs(creditors[j].balance) < 0.01) j++;
    }

    return settlements;
  }

  //--------------------------------------------------
  // RENDER
  //--------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const settlements = calculateSettlements();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          <h1 className="text-xl font-semibold">
            Shared Expense Tracker
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* SUMMARY */}
        <ExpenseSummary expenses={expenses} balances={balances} />

        {/* FORM */}
        <ExpenseForm
          groupId={groupId!}
          onExpenseAdded={refresh}
        />

        {/* LIST */}
        <ExpenseList
          expenses={expenses}
          onExpenseDeleted={refresh}
        />

        {/* SETTLE UP */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2">
            Settle Up
          </h2>

          {settlements.length === 0 && (
            <p className="text-gray-500">
              All settled up 🎉
            </p>
          )}

          {settlements.map((s, i) => (
            <div key={i} className="text-sm">
              {s.from.slice(0,6)} pays {s.to.slice(0,6)} ¥
              {s.amount.toFixed(0)}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
