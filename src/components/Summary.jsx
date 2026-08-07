import { Fragment, useState } from 'react';

const th = { textAlign: 'left', padding: '14px 20px', fontSize: 11.5, fontWeight: 700, color: '#8a97ac', textTransform: 'uppercase', letterSpacing: '0.03em' };
const td = { padding: '16px 20px', fontSize: 14, borderTop: '1px solid rgba(255,255,255,0.06)' };

export default function Summary({ rows, totals }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
        Net Incentive &amp; Penalty Summary by Employee
      </div>
      <div style={{ color: '#8a97ac', fontSize: 13, marginBottom: 20 }}>
        All months, all time. Rows with a penalty are highlighted — click one to see where it came from.
      </div>

      <div
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 24px 46px -22px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={th}>Employee Name</th>
                <th style={th}>Total Incentive Earned (₹)</th>
                <th style={th}>Total Penalty Deducted (₹)</th>
                <th style={th}>Net Amount (₹)</th>
                <th style={th}>Total Strikes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const hasPenalty = r.totalPenalty > 0;
                const isExpanded = expandedId === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr
                      onClick={() => hasPenalty && setExpandedId(isExpanded ? null : r.id)}
                      style={{
                        background: hasPenalty ? 'rgba(248,113,113,0.07)' : 'transparent',
                        cursor: hasPenalty ? 'pointer' : 'default'
                      }}
                    >
                      <td style={{ ...td, fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {hasPenalty && (
                            <span
                              style={{
                                fontSize: 10,
                                color: '#f87171',
                                display: 'inline-block',
                                transition: 'transform 0.15s',
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                              }}
                            >
                              ▸
                            </span>
                          )}
                          {r.name}
                          {hasPenalty && (
                            <span
                              style={{
                                background: 'rgba(248,113,113,0.16)',
                                color: '#f87171',
                                fontSize: 10.5,
                                fontWeight: 700,
                                padding: '3px 9px',
                                borderRadius: 999
                              }}
                            >
                              ⚠ Penalized
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...td, color: '#34d399' }}>₹{r.totalIncentive}</td>
                      <td style={{ ...td, fontWeight: hasPenalty ? 700 : 400, color: hasPenalty ? '#f87171' : '#8a97ac' }}>₹{r.totalPenalty}</td>
                      <td style={{ ...td, fontWeight: 700, color: r.netAmount >= 0 ? '#34d399' : '#f87171' }}>₹{r.netAmount}</td>
                      <td style={td}>{r.totalStrikes}</td>
                    </tr>

                    {isExpanded && hasPenalty && (
                      <tr>
                        <td colSpan={5} style={{ padding: 0, borderTop: '1px solid rgba(248,113,113,0.18)' }}>
                          <div style={{ background: 'rgba(248,113,113,0.03)', padding: '16px 20px 20px 48px' }}>
                            {r.monthlyBreakdown
                              .filter(m => m.band.amount > 0)
                              .map(m => (
                                <div key={m.month} style={{ marginBottom: 16 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{m.monthLabel}</span>
                                    <span style={{ fontSize: 11.5, color: '#8a97ac' }}>
                                      {m.strikes} strike{m.strikes === 1 ? '' : 's'} · {m.band.label}
                                    </span>
                                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#f87171', fontSize: 13 }}>−₹{m.band.amount}</span>
                                  </div>
                                  {m.incidents.map(inc => (
                                    <div
                                      key={inc.id}
                                      style={{
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'flex-start',
                                        padding: '6px 0 6px 12px',
                                        borderLeft: '2px solid rgba(255,255,255,0.08)',
                                        marginBottom: 2
                                      }}
                                    >
                                      <div style={{ width: 8, height: 8, borderRadius: 999, background: inc.color, marginTop: 5, flexShrink: 0 }}></div>
                                      <div>
                                        <div style={{ fontSize: 12.5 }}>
                                          <span style={{ fontWeight: 700, color: inc.color }}>{inc.category}</span>{' '}
                                          <span style={{ color: '#69758a' }}>· {inc.date}</span>
                                        </div>
                                        <div style={{ fontSize: 12.5, color: '#a4aec0', marginTop: 1 }}>{inc.description}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              <tr style={{ background: 'rgba(94,234,212,0.06)' }}>
                <td style={{ ...td, fontWeight: 800, borderTop: '1px solid rgba(94,234,212,0.2)' }}>TOTAL (All Employees)</td>
                <td style={{ ...td, fontWeight: 800, color: '#34d399', borderTop: '1px solid rgba(94,234,212,0.2)' }}>₹{totals.totalIncentive}</td>
                <td style={{ ...td, fontWeight: 800, color: totals.totalPenalty > 0 ? '#f87171' : '#8a97ac', borderTop: '1px solid rgba(94,234,212,0.2)' }}>₹{totals.totalPenalty}</td>
                <td style={{ ...td, fontWeight: 800, color: totals.netAmount >= 0 ? '#34d399' : '#f87171', borderTop: '1px solid rgba(94,234,212,0.2)' }}>₹{totals.netAmount}</td>
                <td style={{ ...td, fontWeight: 800, borderTop: '1px solid rgba(94,234,212,0.2)' }}>{totals.totalStrikes}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ color: '#69758a', fontSize: 12, lineHeight: 1.6, marginTop: 16, maxWidth: 720 }}>
        Note: incentive totals reflect the payroll-lock incentive cycle, while strike/penalty totals reflect calendar months as tracked
        on the Incentives and Log Incident tabs — both roll up here regardless of the differing month definitions.
      </div>
    </div>
  );
}
