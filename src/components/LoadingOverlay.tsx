import React, { useEffect, useState } from 'react';

// Skeletal (outline only) construction material SVG icons
const icons = [
  // Bricks (outline)
  (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="40" width="48" height="12" rx="2" stroke="#b91c1c" strokeWidth="3" fill="none"/>
      <rect x="8" y="28" width="16" height="12" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
      <rect x="24" y="28" width="16" height="12" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
      <rect x="40" y="28" width="16" height="12" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
    </svg>
  ),
  // Trowel (outline)
  (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="44" y="44" width="10" height="4" rx="2" stroke="#525252" strokeWidth="3" fill="none"/>
      <rect x="48" y="36" width="2" height="10" rx="1" stroke="#b45309" strokeWidth="3" fill="none"/>
      <polygon points="12,44 32,12 52,44" stroke="#64748b" strokeWidth="3" fill="none"/>
    </svg>
  ),
  // Wheelbarrow (outline)
  (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="16" y="32" width="32" height="12" rx="4" stroke="#b45309" strokeWidth="3" fill="none"/>
      <rect x="36" y="44" width="8" height="4" rx="2" stroke="#525252" strokeWidth="3" fill="none"/>
      <circle cx="40" cy="52" r="6" stroke="#b91c1c" strokeWidth="3" fill="none"/>
      <rect x="24" y="44" width="8" height="4" rx="2" stroke="#525252" strokeWidth="3" fill="none"/>
    </svg>
  ),
  // Crane (outline)
  (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="52" width="48" height="4" rx="2" stroke="#525252" strokeWidth="3" fill="none"/>
      <rect x="30" y="12" width="4" height="40" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
      <rect x="34" y="16" width="18" height="4" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
      <rect x="34" y="20" width="4" height="12" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
      <rect x="38" y="28" width="8" height="4" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
    </svg>
  ),
  // Building under construction (outline)
  (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="12" y="32" width="40" height="20" rx="4" stroke="#64748b" strokeWidth="3" fill="none"/>
      <rect x="20" y="40" width="8" height="12" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
      <rect x="36" y="40" width="8" height="12" rx="2" stroke="#b45309" strokeWidth="3" fill="none"/>
      <rect x="28" y="36" width="8" height="16" rx="2" stroke="#b91c1c" strokeWidth="3" fill="none"/>
      <rect x="24" y="28" width="16" height="8" rx="2" stroke="#525252" strokeWidth="3" fill="none"/>
    </svg>
  ),
];

export default function LoadingOverlay() {
  const [active, setActive] = useState(0);
  const [spinning, setSpinning] = useState(true);
  useEffect(() => {
    setSpinning(true);
    const timeout = setTimeout(() => {
      setSpinning(false);
      setTimeout(() => {
        setActive(a => (a + 1) % icons.length);
        setSpinning(true);
      }, 100); // brief pause between icons
    }, 500); // 0.5 second spin
    return () => clearTimeout(timeout);
  }, [active]);
  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <div style={{ height: 90, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fffbe6 60%, #fbbf24 100%)',
              boxShadow: '0 0 32px 0 #fbbf2440, 0 0 0 8px #fbbf2410',
              filter: 'drop-shadow(0 0 16px #fbbf24) drop-shadow(0 0 8px #60a5fa)',
              animation: spinning ? 'spin-ease 1s cubic-bezier(0.4,0,0.2,1)' : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >{icons[active]}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#222', letterSpacing: 1, marginBottom: 6 }}>
          Loading...
        </div>
        <div style={{ color: '#64748b', fontSize: 16 }}>Building your dashboard</div>
      </div>
      <style>{`
        @keyframes spin-ease {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(60deg); }
          50% { transform: rotate(180deg); }
          80% { transform: rotate(300deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(8px)',
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const boxStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  padding: '48px 36px 36px 36px',
  textAlign: 'center',
  minWidth: 340,
};
