import { canSetIncentives } from '../lib/roles.js';

const LEVELS = [
  { key: 'none', label: 'None', activeBg: '#3f4a5c', activeColor: '#fff' },
  { key: 'base', label: 'Base', activeBg: '#60a5fa', activeColor: '#04222a' },
  { key: 'excellence', label: 'Excellent', activeBg: '#34d399', activeColor: '#04221a' }
];

export default function Incentives({ role, cards, setIncentiveLevel }) {
  const canEdit = canSetIncentives(role);

  return (
    <div>
      {!canEdit && (
        <div
          style={{
            background: 'rgba(96,165,250,0.08)',
            border: '1px solid rgba(96,165,250,0.25)',
            color: '#93c5fd',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            marginBottom: 16
          }}
        >
          View only — ask a Senior Showrunner or Admin to change incentive levels.
        </div>
      )}
      {cards.map(card => (
        <div key={card.id} style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '20px 24px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 150 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{card.name}</div>
              {card.fullHouse && (
                <div style={{ color: '#34d399', fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>✓ Full House +₹500</div>
              )}
            </div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: '#34d399' }}>₹{card.incentiveTotal}</div>
          </div>
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', rowGap: 16 }}>
            {card.pillars.map(p => (
              <div key={p.key}>
                <div style={{ color: '#8a97ac', fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>{p.label}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {LEVELS.map(lvl => (
                    <button
                      key={lvl.key}
                      disabled={!canEdit}
                      onClick={() => canEdit && setIncentiveLevel(card.id, p.key, lvl.key)}
                      style={{
                        border: 'none',
                        padding: '7px 11px',
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: canEdit ? 'pointer' : 'default',
                        opacity: canEdit || p.level === lvl.key ? 1 : 0.5,
                        background: p.level === lvl.key ? lvl.activeBg : 'rgba(255,255,255,0.06)',
                        color: p.level === lvl.key ? lvl.activeColor : '#8a97ac'
                      }}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
