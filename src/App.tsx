import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseSummary } from "./components/ExpenseSummary";

function App() {

  const [user, setUser] = useState<any>(null);

  const [groupId, setGroupId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);

  //--------------------------------------------------
  // AUTH STATE
  //--------------------------------------------------

  useEffect(() => {

    supabase.auth.getUser().then(({ data }) => {

      setUser(data.user);

    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {

        setUser(session?.user ?? null);

      });

    return () => listener.subscription.unsubscribe();

  }, []);

  //--------------------------------------------------
  // LOAD USER GROUP
  //--------------------------------------------------

  useEffect(() => {

    if (!user) return;

    loadGroup();

  }, [user]);

  async function loadGroup() {

    setLoading(true);

    //--------------------------------------------------
    // FIND EXISTING GROUP
    //--------------------------------------------------

    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id)
      .single();

    //--------------------------------------------------
    // IF EXISTS → USE IT
    //--------------------------------------------------

    if (membership) {

      setGroupId(membership.group_id);

      setLoading(false);

      return;
    }

    //--------------------------------------------------
    // OTHERWISE CREATE NEW GROUP
    //--------------------------------------------------

    const { data: group } = await supabase
      .from("groups")
      .insert({
        name: "Shared Expenses",
      })
      .select()
      .single();

    //--------------------------------------------------
    // ADD USER TO GROUP
    //--------------------------------------------------

    await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: "owner",
      });

    setGroupId(group.id);

    setLoading(false);
  }

  //--------------------------------------------------
  // REFRESH TRIGGER
  //--------------------------------------------------

  function refresh() {

    setRefreshKey(prev => prev + 1);

  }

  //--------------------------------------------------
  // LOGIN UI
  //--------------------------------------------------

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">

        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
            })
          }
          className="bg-blue-500 text-white px-6 py-3 rounded-xl"
        >
          Login with Google
        </button>

      </div>
    );

  //--------------------------------------------------
  // LOADING
  //--------------------------------------------------

  if (loading || !groupId)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  //--------------------------------------------------
  // MAIN UI
  //--------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-xl mx-auto p-4 space-y-4">

        <div className="flex justify-between items-center">

          <h1 className="text-xl font-bold">
            Expense Splitter
          </h1>

          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-red-500"
          >
            Logout
          </button>

        </div>

        <ExpenseSummary
          groupId={groupId}
          refreshKey={refreshKey}
          onSettled={refresh}
        />

        <ExpenseForm
          groupId={groupId}
          onExpenseAdded={refresh}
        />

        <ExpenseList
          groupId={groupId}
          refreshKey={refreshKey}
        />

      </div>

    </div>
  );
}

export default App;
