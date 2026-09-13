import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MetasClient from "./components/MetasClient";
import { getSavingsGoals } from "../actions/goals";

export const metadata = {
  title: 'Metas de Ahorro - ValisFin',
};

export default async function MetasPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  const goals = await getSavingsGoals().catch(e => {
    console.error('Error fetching Savings Goals:', e);
    return [];
  });

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto w-full pt-4 lg:pt-8 px-4 sm:px-6 lg:px-10 pb-32 lg:pb-12 bg-slate-50/50">
      <MetasClient goals={goals} />
    </div>
  );
}
