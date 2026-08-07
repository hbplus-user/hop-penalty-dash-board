import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RULE_SETTINGS, INITIAL_EMPLOYEES, STORAGE_KEY } from '../lib/constants.js';
import { buildAllTimeSummary, buildEmployeeSummary, currentMonthKey, monthLabelOf, seedIncentives, seedIncidents } from '../lib/helpers.js';
import { supabase } from '../lib/supabaseClient.js';
import {
  deleteIncidentRow,
  fetchEmployees,
  fetchIncentives,
  fetchIncidents,
  fetchRuleSettings,
  insertIncident,
  updateIncidentRow,
  updateRuleSettingsRow,
  upsertIncentiveRow
} from '../lib/db.js';

function persistLocal(incidents, incentives, ruleSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ incidents, incentives, ruleSettings }));
  } catch (e) {}
}

function describeError(e) {
  if (e?.code === '42501' || /row-level security/i.test(e?.message || '')) {
    return "your account doesn't have permission for this (row-level security).";
  }
  return (e?.message || 'unknown error') + (e?.code ? ` [${e.code}]` : '');
}

export function usePenaltyData() {
  const [month, setMonth] = useState(currentMonthKey());
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [incidents, setIncidents] = useState([]);
  const [incentives, setIncentives] = useState({});
  const [ruleSettings, setRuleSettings] = useState(DEFAULT_RULE_SETTINGS);
  const [loadingData, setLoadingData] = useState(true);
  const [synced, setSynced] = useState(false);
  const [writeError, setWriteError] = useState(null);

  // Initial load: try Supabase first (shared, live data); fall back to a local
  // demo dataset if the tables haven't been migrated yet (see supabase/data.sql).
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [emps, incs, ince, settings] = await Promise.all([fetchEmployees(), fetchIncidents(), fetchIncentives(), fetchRuleSettings()]);
        if (cancelled) return;
        setEmployees(emps.length ? emps : INITIAL_EMPLOYEES);
        setIncidents(incs);
        setIncentives(ince);
        setRuleSettings(settings || DEFAULT_RULE_SETTINGS);
        setSynced(true);
      } catch (e) {
        let loadedIncidents = null;
        let loadedIncentives = null;
        let loadedRuleSettings = null;
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const saved = JSON.parse(raw);
            loadedIncidents = saved.incidents;
            loadedIncentives = saved.incentives;
            loadedRuleSettings = saved.ruleSettings;
          }
        } catch (e2) {}
        if (cancelled) return;
        setEmployees(INITIAL_EMPLOYEES);
        setIncidents(loadedIncidents || seedIncidents());
        setIncentives(loadedIncentives || seedIncentives());
        setRuleSettings(loadedRuleSettings || DEFAULT_RULE_SETTINGS);
        setSynced(false);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live sync: when Supabase-backed, reflect other users' changes as they happen.
  useEffect(() => {
    if (!synced) return;
    const channel = supabase
      .channel('penalty-system-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchIncidents().then(setIncidents).catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incentives' }, () => {
        fetchIncentives().then(setIncentives).catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rule_settings' }, () => {
        fetchRuleSettings().then(s => setRuleSettings(s || DEFAULT_RULE_SETTINGS)).catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [synced]);

  function shiftMonth(delta) {
    const [year, m] = month.split('-').map(Number);
    const d = new Date(year, m - 1 + delta, 1);
    setMonth(d.toISOString().slice(0, 7));
  }

  async function submitIncident(form) {
    if (!form.description.trim()) return;
    if (synced) {
      try {
        const created = await insertIncident({ ...form, description: form.description.trim() });
        setIncidents(prev => [created, ...prev]);
        setWriteError(null);
      } catch (e) {
        console.error('submitIncident failed', e);
        setWriteError("Couldn't save that incident — " + describeError(e));
      }
      return;
    }
    const incident = {
      id: 'i' + Date.now(),
      employeeId: form.employeeId,
      date: form.date,
      category: form.category,
      description: form.description.trim()
    };
    const next = [incident, ...incidents];
    setIncidents(next);
    persistLocal(next, incentives, ruleSettings);
  }

  async function updateIncident(id, patch) {
    if (synced) {
      try {
        const updated = await updateIncidentRow(id, patch);
        setIncidents(prev => prev.map(i => (i.id === id ? updated : i)));
        setWriteError(null);
      } catch (e) {
        console.error('updateIncident failed', e);
        setWriteError("Couldn't save that edit — " + describeError(e));
      }
      return;
    }
    const next = incidents.map(i => (i.id === id ? { ...i, ...patch } : i));
    setIncidents(next);
    persistLocal(next, incentives, ruleSettings);
  }

  async function deleteIncident(id) {
    if (synced) {
      try {
        await deleteIncidentRow(id);
        setIncidents(prev => prev.filter(i => i.id !== id));
        setWriteError(null);
      } catch (e) {
        console.error('deleteIncident failed', e);
        setWriteError("Couldn't delete that incident — " + describeError(e));
      }
      return;
    }
    const next = incidents.filter(i => i.id !== id);
    setIncidents(next);
    persistLocal(next, incentives, ruleSettings);
  }

  async function setIncentiveLevel(employeeId, pillarKey, level) {
    const key = employeeId + '::' + month;
    const current = incentives[key] || { retention: 'none', reviews: 'none', attendance: 'none' };
    const nextIncentive = { ...current, [pillarKey]: level };
    if (synced) {
      try {
        await upsertIncentiveRow(employeeId, month, nextIncentive);
        setIncentives(prev => ({ ...prev, [key]: nextIncentive }));
        setWriteError(null);
      } catch (e) {
        console.error('setIncentiveLevel failed', e);
        setWriteError("Couldn't save that incentive — " + describeError(e));
      }
      return;
    }
    const next = { ...incentives, [key]: nextIncentive };
    setIncentives(next);
    persistLocal(incidents, next, ruleSettings);
  }

  async function updateRuleSettings(next) {
    if (synced) {
      try {
        await updateRuleSettingsRow(next);
        setRuleSettings(next);
        setWriteError(null);
      } catch (e) {
        console.error('updateRuleSettings failed', e);
        setWriteError("Couldn't save settings — " + describeError(e));
      }
      return;
    }
    setRuleSettings(next);
    persistLocal(incidents, incentives, next);
  }

  const employeeSummaries = useMemo(
    () => employees.map(emp => buildEmployeeSummary(emp, month, incidents, incentives, ruleSettings)),
    [employees, incidents, incentives, month, ruleSettings]
  );

  const rankedSummaries = useMemo(
    () => [...employeeSummaries].sort((a, b) => b.strikes - a.strikes),
    [employeeSummaries]
  );

  const allTimeSummary = useMemo(
    () => buildAllTimeSummary(employees, incidents, incentives, ruleSettings),
    [employees, incidents, incentives, ruleSettings]
  );

  function clearWriteError() {
    setWriteError(null);
  }

  return {
    month,
    monthLabel: monthLabelOf(month),
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
  };
}
