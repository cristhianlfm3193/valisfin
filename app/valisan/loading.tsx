// loading.tsx ValisAN — azul cielo #0ea5e9 (sky-500)
export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div className="spinner-valisan">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p
        style={{
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#0ea5e9',
          letterSpacing: '0.05em',
          animation: 'pulse-an 1.4s ease-in-out infinite',
        }}
      >
        ValisAN
      </p>

      <style>{`
        .spinner-valisan {
          width: 70.4px;
          height: 70.4px;
          --clr: #0ea5e9;
          --clr-alpha: rgba(14, 165, 233, 0.12);
          animation: spinner-an 1.6s infinite ease;
          transform-style: preserve-3d;
        }
        .spinner-valisan > div {
          background-color: var(--clr-alpha);
          height: 100%;
          position: absolute;
          width: 100%;
          border: 3.5px solid var(--clr);
        }
        .spinner-valisan div:nth-of-type(1) { transform: translateZ(-35.2px) rotateY(180deg); }
        .spinner-valisan div:nth-of-type(2) { transform: rotateY(-270deg) translateX(50%); transform-origin: top right; }
        .spinner-valisan div:nth-of-type(3) { transform: rotateY(270deg) translateX(-50%); transform-origin: center left; }
        .spinner-valisan div:nth-of-type(4) { transform: rotateX(90deg) translateY(-50%); transform-origin: top center; }
        .spinner-valisan div:nth-of-type(5) { transform: rotateX(-90deg) translateY(50%); transform-origin: bottom center; }
        .spinner-valisan div:nth-of-type(6) { transform: translateZ(35.2px); }
        @keyframes spinner-an {
          0%   { transform: rotate(45deg) rotateX(-25deg)  rotateY(25deg); }
          50%  { transform: rotate(45deg) rotateX(-385deg) rotateY(25deg); }
          100% { transform: rotate(45deg) rotateX(-385deg) rotateY(385deg); }
        }
        @keyframes pulse-an {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
