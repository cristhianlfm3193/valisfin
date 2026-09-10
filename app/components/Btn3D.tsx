'use client';
import React from 'react';

interface Btn3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'emerald' | 'rose' | 'blue' | 'pink' | 'teal' | 'violet' | 'gray';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function Btn3D({ color = 'emerald', isLoading, loadingText, children, className, ...props }: Btn3DProps) {
  return (
    <button
      {...props}
      className={`btn3d btn3d-${color} ${className || ''}`}
    >
      <div className="btn3d-outer">
        <div className="btn3d-inner">
          <span className="btn3d-label">
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-white animate-spin inline-block" />
                {loadingText || 'Guardando...'}
              </>
            ) : children}
          </span>
        </div>
      </div>
    </button>
  );
}
