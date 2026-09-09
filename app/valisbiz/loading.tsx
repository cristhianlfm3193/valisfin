// loading.tsx ValisBiz — rosa #ec4899 (pink-500)
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
      <div className="spinner-valisbiz">
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
          color: '#ec4899',
          letterSpacing: '0.05em',
          animation: 'pulse-biz 1.4s ease-in-out infinite',
        }}
      >
        Cargando ValisBiz…
      </p>

      <style>{`
        .spinner-valisbiz {
          width: 70.4px;
          height: 70.4px;
          --clr: #ec4899;
          --clr-alpha: rgba(236, 72, 153, 0.12);
          animation: spinner-biz 1.6s infinite ease;
          transform-style: preserve-3d;
        }
        .spinner-valisbiz > div {
          background-color: var(--clr-alpha);
          height: 100%;
          position: absolute;
          width: 100%;
          border: 3.5px solid var(--clr);
        }
        .spinner-valisbiz div:nth-of-type(1) { transform: translateZ(-35.2px) rotateY(180deg); }
        .spinner-valisbiz div:nth-of-type(2) { transform: rotateY(-270deg) translateX(50%); transform-origin: top right; }
        .spinner-valisbiz div:nth-of-type(3) { transform: rotateY(270deg) translateX(-50%); transform-origin: center left; }
        .spinner-valisbiz div:nth-of-type(4) { transform: rotateX(90deg) translateY(-50%); transform-origin: top center; }
        .spinner-valisbiz div:nth-of-type(5) { transform: rotateX(-90deg) translateY(50%); transform-origin: bottom center; }
        .spinner-valisbiz div:nth-of-type(6) { transform: translateZ(35.2px); }
        @keyframes spinner-biz {
          0%   { transform: rotate(45deg) rotateX(-25deg)  rotateY(25deg); }
          50%  { transform: rotate(45deg) rotateX(-385deg) rotateY(25deg); }
          100% { transform: rotate(45deg) rotateX(-385deg) rotateY(385deg); }
        }
        @keyframes pulse-biz {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
