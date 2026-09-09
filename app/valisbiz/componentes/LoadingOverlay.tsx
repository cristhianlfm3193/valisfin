'use client';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
      {/* Spinner 3D */}
      <div className="spinner-keiko">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="mt-6 text-sm font-semibold text-pink-600 tracking-wide animate-pulse">
        Cargando datos…
      </p>

      <style>{`
        .spinner-keiko {
          width: 70.4px;
          height: 70.4px;
          --clr: rgb(236, 72, 153);
          --clr-alpha: rgba(236, 72, 153, 0.12);
          animation: spinner-keiko-anim 1.6s infinite ease;
          transform-style: preserve-3d;
        }

        .spinner-keiko > div {
          background-color: var(--clr-alpha);
          height: 100%;
          position: absolute;
          width: 100%;
          border: 3.5px solid var(--clr);
        }

        .spinner-keiko div:nth-of-type(1) {
          transform: translateZ(-35.2px) rotateY(180deg);
        }
        .spinner-keiko div:nth-of-type(2) {
          transform: rotateY(-270deg) translateX(50%);
          transform-origin: top right;
        }
        .spinner-keiko div:nth-of-type(3) {
          transform: rotateY(270deg) translateX(-50%);
          transform-origin: center left;
        }
        .spinner-keiko div:nth-of-type(4) {
          transform: rotateX(90deg) translateY(-50%);
          transform-origin: top center;
        }
        .spinner-keiko div:nth-of-type(5) {
          transform: rotateX(-90deg) translateY(50%);
          transform-origin: bottom center;
        }
        .spinner-keiko div:nth-of-type(6) {
          transform: translateZ(35.2px);
        }

        @keyframes spinner-keiko-anim {
          0%   { transform: rotate(45deg) rotateX(-25deg)   rotateY(25deg); }
          50%  { transform: rotate(45deg) rotateX(-385deg)  rotateY(25deg); }
          100% { transform: rotate(45deg) rotateX(-385deg)  rotateY(385deg); }
        }
      `}</style>
    </div>
  );
}
