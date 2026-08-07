import { useState } from 'react';
import Header from './components/Header.jsx';
import MonthNav from './components/MonthNav.jsx';
import Dashboard from './components/Dashboard.jsx';
import LogIncident from './components/LogIncident.jsx';
import Incentives from './components/Incentives.jsx';
import Summary from './components/Summary.jsx';
import Settings from './components/Settings.jsx';
import ShowrunnerView from './components/ShowrunnerView.jsx';
import LoginGate from './components/LoginGate.jsx';
import { usePenaltyData } from './hooks/usePenaltyData.js';
import { useSupabaseAuth } from './hooks/useSupabaseAuth.js';
import { canCustomizeRules } from './lib/roles.js';

export default function App() {
  const { user, loading, error, signInWithGoogle, signOut } = useSupabaseAuth();
  const [viewMode, setViewMode] = useState('management');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewingEmployeeId, setViewingEmployeeId] = useState('e1');

  const {
    monthLabel,
    shiftMonth,
    employees,
    incidents,
    employeeSummaries,
    rankedSummaries,
    allTimeSummary,
    ruleSettings,
    loadingData,
    synced,
    writeError,
    clearWriteError,
    submitIncident,
    updateIncident,
    deleteIncident,
    setIncentiveLevel,
    updateRuleSettings
  } = usePenaltyData();

  const isManagementView = viewMode === 'management';
  const isShowrunnerView = viewMode === 'showrunner';
  const viewingEmployee = employeeSummaries.find(c => c.id === viewingEmployeeId) || employeeSummaries[0];

  function handleSelectEmployee(employeeId) {
    setViewingEmployeeId(employeeId);
    setViewMode('showrunner');
  }

  if (loading) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  if (!user) {
    return <LoginGate onSignIn={signInWithGoogle} error={error} />;
  }

  if (loadingData) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  const role = user.role;
  const isAdmin = canCustomizeRules(role);

  return (
    <div className="hop-app" style={{ minHeight: '100vh', padding: '44px 52px 90px' }}>
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        isShowrunnerView={isShowrunnerView}
        employees={employees}
        viewingEmployeeId={viewingEmployeeId}
        setViewingEmployeeId={setViewingEmployeeId}
        user={user}
        onSignOut={signOut}
      />

      {!synced && (
        <div
          style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
            color: '#fbbf24',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            marginBottom: 20
          }}
        >
          Not connected to the shared database yet — showing local demo data that only lives in this browser. Run{' '}
          <code>supabase/data.sql</code> in the Supabase SQL editor to turn on multi-user sync.
        </div>
      )}

      {writeError && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            maxWidth: '90vw',
            background: '#1a0f10',
            border: '1px solid rgba(248,113,113,0.4)',
            color: '#f87171',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            boxShadow: '0 20px 40px -14px rgba(0,0,0,0.7)'
          }}
        >
          <span>⚠ {writeError}</span>
          <button
            onClick={clearWriteError}
            style={{ border: 'none', background: 'none', color: '#f87171', fontSize: 15, cursor: 'pointer', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      <MonthNav
        monthLabel={monthLabel}
        shiftMonth={shiftMonth}
        isManagementView={isManagementView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
      />

      {isManagementView && activeTab === 'dashboard' && <Dashboard cards={rankedSummaries} onSelectEmployee={handleSelectEmployee} />}

      {isManagementView && activeTab === 'log' && (
        <LogIncident role={role} employees={employees} incidents={incidents} submitIncident={submitIncident} updateIncident={updateIncident} deleteIncident={deleteIncident} />
      )}

      {isManagementView && activeTab === 'incentives' && (
        <Incentives role={role} cards={employeeSummaries} setIncentiveLevel={setIncentiveLevel} />
      )}

      {isManagementView && activeTab === 'summary' && (
        <Summary rows={allTimeSummary.rows} totals={allTimeSummary.totals} />
      )}

      {isManagementView && activeTab === 'settings' && isAdmin && (
        <Settings ruleSettings={ruleSettings} updateRuleSettings={updateRuleSettings} />
      )}

      {isShowrunnerView && <ShowrunnerView employee={viewingEmployee} monthLabel={monthLabel} />}
    </div>
  );
}
