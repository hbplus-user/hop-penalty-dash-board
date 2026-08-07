import { ACTIVE_TAB_STYLE, INACTIVE_TAB_STYLE } from '../lib/constants.js';
import { canCustomizeRules } from '../lib/roles.js';

const BASE_TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'log', label: 'Log Incident' },
  { key: 'incentives', label: 'Incentives' },
  { key: 'summary', label: 'Summary' }
];

export default function MonthNav({ monthLabel, shiftMonth, isManagementView, activeTab, setActiveTab, role }) {
  const tabs = canCustomizeRules(role) ? [...BASE_TABS, { key: 'settings', label: 'Settings' }] : BASE_TABS;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '8px 10px' }}>
        <button
          className="hop-nav-btn"
          onClick={() => shiftMonth(-1)}
          style={{ background: 'none', border: 'none', color: '#8a97ac', fontSize: 18, cursor: 'pointer', width: 30, height: 30, borderRadius: 999 }}
        >
          ‹
        </button>
        <div style={{ fontWeight: 700, fontSize: 15, minWidth: 150, textAlign: 'center' }}>{monthLabel}</div>
        <button
          className="hop-nav-btn"
          onClick={() => shiftMonth(1)}
          style={{ background: 'none', border: 'none', color: '#8a97ac', fontSize: 18, cursor: 'pointer', width: 30, height: 30, borderRadius: 999 }}
        >
          ›
        </button>
      </div>

      {isManagementView && (
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                border: 'none',
                padding: '11px 20px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                ...(activeTab === tab.key ? ACTIVE_TAB_STYLE : INACTIVE_TAB_STYLE)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
