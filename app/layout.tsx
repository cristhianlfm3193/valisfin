import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { AssistantWidget } from "./components/AssistantWidget";
import { createClient } from "@/lib/supabase/server";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ValisFin",
  description: "Panel de control financiero",
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  return (
    <html lang="es" suppressHydrationWarning className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full bg-slate-50`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="h-full antialiased text-slate-800 bg-[#f8fafc] flex flex-col lg:flex-row pb-6 lg:pb-0 custom-scrollbar">
        {user && <DesktopSidebar user={user} profile={profile} />}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
        {user && <AssistantWidget />}
      </body>
    </html>
  );
}
