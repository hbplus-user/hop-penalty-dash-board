export default function ShowrunnerView({ employee, monthLabel }) {
  if (!employee) return null;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 34, boxShadow: '0 30px 60px -26px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800 }}>{employee.name}</div>
          {employee.hasCritical && (
            <div style={{ background: 'rgba(248,113,113,0.16)', color: '#f87171', fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999 }}>⚠ Critical incident logged</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#8a97ac', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Strikes this month</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 44, fontWeight: 800, color: employee.tierColor }}>{employee.strikes}</div>
          </div>
          <div>
            <div style={{ color: '#8a97ac', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Standing</div>
            <div style={{ display: 'inline-block', background: employee.bandBg, color: employee.tierColor, fontSize: 13.5, fontWeight: 700, padding: '8px 14px', borderRadius: 999 }}>{employee.band.label}</div>
          </div>
          <div>
            <div style={{ color: '#8a97ac', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Penalty</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>₹{employee.band.amount}</div>
          </div>
          <div>
            <div style={{ color: '#8a97ac', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Incentive earned</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>₹{employee.incentiveTotal}</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '22px 26px', marginBottom: 20 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Incentive breakdown</div>
        {employee.pillars.map(p => (
          <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 13.5, color: '#c3cbdb' }}>{p.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: 999, background: p.dotColor }}></div>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'capitalize' }}>{p.level}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '22px 26px', marginBottom: 20 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Incident history — {monthLabel}</div>
        {employee.noIncidents && (
          <div style={{ color: '#69758a', fontSize: 13.5 }}>No incidents recorded this month. Clean record.</div>
        )}
        {employee.incidents.map(inc => (
          <div key={inc.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 9, height: 9, borderRadius: 999, marginTop: 6, flexShrink: 0, background: inc.color }}></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                {inc.category} <span style={{ color: '#69758a', fontWeight: 500 }}>· {inc.date}</span>
              </div>
              <div style={{ color: '#a4aec0', fontSize: 13, marginTop: 2 }}>{inc.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ color: '#69758a', fontSize: 12.5, lineHeight: 1.6, textAlign: 'center', padding: '0 10px' }}>
        Disagree with a strike? You may appeal in writing to the Founders within 5 working days of notification. The strike stands during appeal; reversed strikes are reimbursed in the following payout cycle.
      </div>
    </div>
  );
}
