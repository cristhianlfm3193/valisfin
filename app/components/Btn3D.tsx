'use client';
import React from 'react';

export type Btn3DColor = 'emerald' | 'rose' | 'blue' | 'pink' | 'teal' | 'violet' | 'gray' | 'orange' | 'amber' | 'sky';
export type Btn3DSize = 'xs' | 'sm' | 'md' | 'lg';

interface Btn3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: Btn3DColor;
  size?: Btn3DSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function Btn3D({
  color = 'emerald',
  size = 'md',
  fullWidth = false,
  isLoading,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: Btn3DProps) {
  const sizeClass = size === 'xs' ? 'btn3d-xs' : size === 'sm' ? 'btn3d-sm' : size === 'lg' ? 'btn3d-lg' : 'btn3d-md';
  const widthClass = fullWidth ? 'w-full text-center flex justify-center' : '';

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`btn3d btn3d-${color} ${sizeClass} ${widthClass} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''} ${className || ''}`}
    >
      <div className="btn3d-outer w-full">
        <div className="btn3d-inner w-full">
          <span className="btn3d-label justify-center">
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-white animate-spin inline-block mr-1.5" />
                {loadingText || 'Guardando...'}
              </>
            ) : children}
          </span>
        </div>
      </div>
    </button>
  );
}

