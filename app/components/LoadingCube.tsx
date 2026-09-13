'use client';

interface LoadingCubeProps {
  text?: string;
  theme?: 'biz' | 'an' | 'fin' | 'hub';
}

export function LoadingCube({ text = "Cargando...", theme = "biz" }: LoadingCubeProps) {
  let colorHex = '#ec4899';
  let colorRgb = '236, 72, 153';
  let textColorClass = 'text-pink-500';

  if (theme === 'an') {
    colorHex = '#0ea5e9'; colorRgb = '14, 165, 233'; textColorClass = 'text-sky-500';
  } else if (theme === 'fin') {
    colorHex = '#14b886'; colorRgb = '20, 184, 134'; textColorClass = 'text-emerald-500';
  } else if (theme === 'hub') {
    colorHex = '#10b981'; colorRgb = '16, 185, 129'; textColorClass = 'text-emerald-500';
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#121c27]/75 backdrop-blur-sm">
      <div className="spinner-cube" style={{ '--clr': colorHex, '--clr-alpha': `rgba(${colorRgb}, 0.12)` } as any}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className={`mt-6 text-sm font-semibold tracking-wide animate-pulse ${textColorClass}`}>
        {text}
      </p>

      <style>{`
        .spinner-cube {
          width: 70.4px;
          height: 70.4px;
          animation: spinner-cube-anim 1.6s infinite ease;
          transform-style: preserve-3d;
        }

        .spinner-cube > div {
          background-color: var(--clr-alpha);
          height: 100%;
          position: absolute;
          width: 100%;
          border: 3.5px solid var(--clr);
        }

        .spinner-cube div:nth-of-type(1) {
          transform: translateZ(-35.2px) rotateY(180deg);
        }
        .spinner-cube div:nth-of-type(2) {
          transform: rotateY(-270deg) translateX(50%);
          transform-origin: top right;
        }
        .spinner-cube div:nth-of-type(3) {
          transform: rotateY(270deg) translateX(-50%);
          transform-origin: center left;
        }
        .spinner-cube div:nth-of-type(4) {
          transform: rotateX(90deg) translateY(-50%);
          transform-origin: top center;
        }
        .spinner-cube div:nth-of-type(5) {
          transform: rotateX(-90deg) translateY(50%);
          transform-origin: bottom center;
        }
        .spinner-cube div:nth-of-type(6) {
          transform: translateZ(35.2px);
        }

        @keyframes spinner-cube-anim {
          0%   { transform: rotate(45deg) rotateX(-25deg)   rotateY(25deg); }
          50%  { transform: rotate(45deg) rotateX(-385deg)  rotateY(25deg); }
          100% { transform: rotate(45deg) rotateX(-385deg)  rotateY(385deg); }
        }
      `}</style>
    </div>
  );
}
