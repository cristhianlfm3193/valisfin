import { Suspense } from "react";
import { getDashboardData } from "./acciones/dashboard";
import ValisBizClient from "./componentes/ValisBizClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: 'ValisBiz | Supervisión Keiko',
  description: 'Panel Operativo & Inteligencia de Campo',
};

interface PageProps {
  searchParams: Promise<{ mes?: string; anio?: string }>;
}

export default async function ValisBizPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mes = params.mes ? parseInt(params.mes) : undefined;
  const anio = params.anio ? parseInt(params.anio) : undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const initial = fullName.charAt(0).toUpperCase();

  const data = await getDashboardData(mes, anio);

  return (
    <div className="bg-[#faf8ff] min-h-screen flex flex-col justify-between font-sans">
      <main className="w-full flex-1 flex flex-col justify-start">
        <Suspense>
          <ValisBizClient
            initialData={data}
            user={{ name: fullName, initial }}
          />
        </Suspense>
      </main>
    </div>
  );
}
