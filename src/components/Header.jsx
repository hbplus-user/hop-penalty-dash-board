import { ROLE_LABELS } from '../lib/roles.js';

export default function Header({ viewMode, setViewMode, isShowrunnerView, employees, viewingEmployeeId, setViewingEmployeeId, user, onSignOut }) {
  const isManagementView = viewMode === 'management';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 30 }}>
      <div>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 33, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          HOP Penalty &amp; Incentive Console
        </div>
        <div style={{ color: '#8a97ac', fontSize: 14, marginTop: 6 }}>
          Track incidents, strikes, and incentive payouts for Showrunners.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {isShowrunnerView && (
          <select
            value={viewingEmployeeId}
            onChange={e => setViewingEmployeeId(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#f4f6fa',
              padding: '10px 14px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        )}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 999, padding: 4 }}>
          <button
            onClick={() => setViewMode('management')}
            style={{
              border: 'none',
              padding: '10px 18px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isManagementView ? 'linear-gradient(135deg,#22d3ee,#5eead4)' : 'transparent',
              color: isManagementView ? '#04222a' : '#8a97ac'
            }}
          >
            Management
          </button>
          <button
            onClick={() => setViewMode('showrunner')}
            style={{
              border: 'none',
              padding: '10px 18px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isShowrunnerView ? 'linear-gradient(135deg,#22d3ee,#5eead4)' : 'transparent',
              color: isShowrunnerView ? '#04222a' : '#8a97ac'
            }}
          >
            Showrunner
          </button>
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '6px 6px 6px 6px' }}>
            {user.picture && (
              <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" style={{ width: 28, height: 28, borderRadius: '50%' }} />
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#c3cbdb' }}>{user.name}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#5eead4', background: 'rgba(94,234,212,0.12)', padding: '3px 9px', borderRadius: 999 }}>
              {ROLE_LABELS[user.role] || user.role}
            </span>
            <button
              onClick={onSignOut}
              className="hop-nav-btn"
              style={{ border: 'none', background: 'rgba(255,255,255,0.06)', color: '#8a97ac', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 999, cursor: 'pointer' }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
