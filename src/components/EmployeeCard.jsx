import { useState } from 'react';

export default function EmployeeCard({ card, onClick }) {
  const [tilt, setTilt] = useState(null);

  function handleTiltMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: -(y - 0.5) * 16, ry: (x - 0.5) * 16 });
  }

  const { rx, ry } = tilt || { rx: 0, ry: 0 };
  const lift = tilt ? 10 : 0;
  const transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${lift}px)`;

  return (
    <div
      onMouseMove={handleTiltMove}
      onMouseLeave={() => setTilt(null)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
      className={onClick ? 'hop-card-clickable' : undefined}
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 22,
        padding: 26,
        boxShadow: '0 24px 46px -22px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)',
        backdropFilter: 'blur(18px)',
        transform,
        transition: 'transform 0.12s ease-out',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{card.name}</div>
        {card.hasCritical && (
          <div style={{ background: 'rgba(248,113,113,0.16)', color: '#f87171', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999 }}>⚠ Critical</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 46, fontWeight: 800, color: card.tierColor, lineHeight: 1 }}>{card.strikes}</div>
        <div style={{ color: '#69758a', fontSize: 14, fontWeight: 600 }}>strikes / mo</div>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: '100%', background: card.tierColor, width: card.strikePct + '%', borderRadius: 999 }}></div>
      </div>
      <div style={{ display: 'inline-block', background: card.bandBg, color: card.tierColor, fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999, marginBottom: 16 }}>
        {card.band.label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ color: '#8a97ac' }}>Penalty this month</span>
        <span style={{ fontWeight: 700 }}>₹{card.band.amount}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ color: '#8a97ac' }}>Incentive earned</span>
        <span style={{ fontWeight: 700, color: '#34d399' }}>₹{card.incentiveTotal}</span>
      </div>
      {card.fullHouse && (
        <div style={{ fontSize: 11.5, color: '#34d399', marginTop: 4 }}>✓ Full House bonus included</div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
        {card.pillars.map(p => (
          <div key={p.key} title={p.label} style={{ width: 10, height: 10, borderRadius: 999, background: p.dotColor }}></div>
        ))}
        <div style={{ color: '#69758a', fontSize: 12, marginLeft: 'auto' }}>{card.incidentCount} incident(s)</div>
      </div>
    </div>
  );
}
