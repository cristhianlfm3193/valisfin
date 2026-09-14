'use client';

import React from 'react';
import Link from 'next/link';

interface PortalButtonProps {
  href: string;
  title: React.ReactNode;
  icon: React.ReactNode;
  colorClass: string;
  hasAccess: boolean;
}

export function PortalButton({ href, title, icon, colorClass, hasAccess }: PortalButtonProps) {
  if (!hasAccess) {
    return (
      <div 
        onClick={() => alert('No tienes permisos asignados para acceder a esta aplicación. Por favor contacta al administrador.')}
        className="group flex flex-col items-center justify-center gap-4 p-4 opacity-50 cursor-not-allowed grayscale transition-all"
      >
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex items-center justify-center transition-all ${colorClass}`}>
          {icon}
        </div>
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{title}</span>
      </div>
    );
  }

  return (
    <Link href={href} className="group flex flex-col items-center justify-center gap-4 hover:scale-110 transition-transform duration-300 ease-out p-4">
      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex items-center justify-center transition-all ${colorClass}`}>
        {icon}
      </div>
      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{title}</span>
    </Link>
  );
}
