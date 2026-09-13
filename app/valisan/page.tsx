import { Suspense } from "react";
import ValisANClient from "./components/ValisANClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: 'ValisAN | Analytics & Institución',
  description: 'Centro de Operaciones AIPP & BD-RH',
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ValisANPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = params.tab || 'dashboard';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans text-white relative">
      <main className="w-full flex-1 flex flex-col justify-start">
        <Suspense>
          <ValisANClient
            user={{ name: fullName, initial }}
            activeTab={tab}
          />
        </Suspense>
      </main>
    </div>
  );
}
