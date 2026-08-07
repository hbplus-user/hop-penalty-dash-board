import { supabase } from './supabaseClient.js';

function rowToIncident(row) {
  return { id: row.id, employeeId: row.employee_id, date: row.date, category: row.category, description: row.description };
}

export async function fetchEmployees() {
  const { data, error } = await supabase.from('employees').select('id, name').order('name');
  if (error) throw error;
  return data;
}

export async function fetchIncidents() {
  const { data, error } = await supabase.from('incidents').select('id, employee_id, date, category, description').order('date', { ascending: false });
  if (error) throw error;
  return data.map(rowToIncident);
}

export async function insertIncident(form) {
  const { data, error } = await supabase
    .from('incidents')
    .insert({ employee_id: form.employeeId, date: form.date, category: form.category, description: form.description })
    .select()
    .single();
  if (error) throw error;
  return rowToIncident(data);
}

export async function updateIncidentRow(id, patch) {
  const { data, error } = await supabase
    .from('incidents')
    .update({ employee_id: patch.employeeId, date: patch.date, category: patch.category, description: patch.description })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToIncident(data);
}

export async function deleteIncidentRow(id) {
  const { error } = await supabase.from('incidents').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchIncentives() {
  const { data, error } = await supabase.from('incentives').select('employee_id, month, retention, reviews, attendance');
  if (error) throw error;
  const map = {};
  data.forEach(row => {
    map[row.employee_id + '::' + row.month] = { retention: row.retention, reviews: row.reviews, attendance: row.attendance };
  });
  return map;
}

export async function upsertIncentiveRow(employeeId, month, full) {
  const { error } = await supabase
    .from('incentives')
    .upsert({ employee_id: employeeId, month, ...full, updated_at: new Date().toISOString() }, { onConflict: 'employee_id,month' });
  if (error) throw error;
}

export async function fetchRuleSettings() {
  const { data, error } = await supabase.from('rule_settings').select('settings').eq('id', 1).single();
  if (error) throw error;
  return data.settings;
}

export async function updateRuleSettingsRow(settings) {
  const { error } = await supabase.from('rule_settings').update({ settings, updated_at: new Date().toISOString() }).eq('id', 1);
  if (error) throw error;
}
