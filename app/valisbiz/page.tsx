import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "./acciones/dashboard";
import ValisBizClient from "./componentes/ValisBizClient";

export const metadata = {
  title: 'ValisBiz | Supervisión Keiko',
  description: 'Panel Operativo & Inteligencia de Campo',
};

export default async function ValisBizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const initial = fullName.charAt(0).toUpperCase();

  const data = await getDashboardData();

  return (
    <div className="bg-[#faf8ff] min-h-screen flex flex-col justify-between selection:bg-[#adedd3] selection:text-[#306d58] font-sans">
      <main className="w-full flex-1 flex flex-col justify-start">
        <ValisBizClient 
          initialData={data} 
          user={{ name: fullName, initial }} 
        />
      </main>
    </div>
  );
}
