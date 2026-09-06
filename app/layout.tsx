import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { MobileBottomNavigation } from "./components/MobileBottomNavigation";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finanzas Familiares | Familia Fuentes Camaño",
  description: "Panel de control financiero de la familia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full bg-slate-50`}>
      <body className="h-full antialiased text-slate-800 bg-[#f8fafc] flex flex-col lg:flex-row pb-20 lg:pb-0 custom-scrollbar">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
        <MobileBottomNavigation />
      </body>
    </html>
  );
}
