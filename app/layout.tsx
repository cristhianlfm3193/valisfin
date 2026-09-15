import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { MobileNavigation } from "./components/MobileNavigation";
import StarBackground from "./components/StarBackground";
import { NavigationLoader } from "./components/NavigationLoader";
import { Suspense } from "react";

import { getCachedUser, getCachedProfile } from "@/lib/supabase/server";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ValisHub",
  description: "Portal Multi-app de Valis",
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090a0f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCachedUser();
  const profile = user ? await getCachedProfile(user.id) : null;

  return (
    <html lang="es" suppressHydrationWarning className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} min-h-screen min-h-[100dvh] bg-[#090a0f]`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="min-h-screen min-h-[100dvh] antialiased text-white selection:bg-emerald-500 selection:text-white bg-[#090a0f] flex flex-col lg:flex-row pb-[calc(88px+env(safe-area-inset-bottom,0px))] lg:pb-0 custom-scrollbar font-sans overflow-x-hidden relative">
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        <StarBackground />
        {user && <DesktopSidebar user={user} profile={profile} />}
        <div className="flex-1 flex flex-col min-w-0 z-10 relative">
          {children}
        </div>
        {user && <MobileNavigation user={user} profile={profile} />}
      </body>
    </html>
  );
}
