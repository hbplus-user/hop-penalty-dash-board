import { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_COLORS } from '../lib/constants.js';
import { canDeleteIncidents, canEditIncidents } from '../lib/roles.js';

function initialForm(employees) {
  return {
    employeeId: employees[0]?.id ?? '',
    category: 'Low',
    description: '',
    date: new Date().toISOString().slice(0, 10)
  };
}

export default function LogIncident({ role, employees, incidents, submitIncident, updateIncident, deleteIncident }) {
  const [form, setForm] = useState(() => initialForm(employees));
  const [editingId, setEditingId] = useState(null);

  const canEdit = canEditIncidents(role);
  const canDelete = canDeleteIncidents(role);

  function updateForm(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function startEdit(incident) {
    setEditingId(incident.id);
    setForm({
      employeeId: incident.employeeId,
      category: incident.category,
      description: incident.description,
      date: incident.date
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm(employees));
  }

  function handleSubmit() {
    if (!form.description.trim()) return;
    if (editingId) {
      updateIncident(editingId, form);
      setEditingId(null);
      setForm(initialForm(employees));
    } else {
      submitIncident(form);
      setForm(f => ({ ...f, description: '' }));
    }
  }

  const recentIncidents = useMemo(
    () =>
      [...incidents]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map(i => ({
          ...i,
          employeeName: (employees.find(e => e.id === i.employeeId) || {}).name || 'Unknown',
          color: CATEGORY_COLORS[i.category]
        })),
    [incidents, employees]
  );

  return (
    <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ width: 380, background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: 26, boxShadow: '0 24px 46px -22px rgba(0,0,0,0.6)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18 }}>{editingId ? 'Edit Incident' : 'Log an Incident'}</div>
          {editingId && (
            <button onClick={cancelEdit} style={{ border: 'none', background: 'none', color: '#8a97ac', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>

        <div style={{ fontSize: 12.5, color: '#8a97ac', fontWeight: 700, marginBottom: 6 }}>Who made the mistake</div>
        <select
          value={form.employeeId}
          onChange={e => updateForm('employeeId', e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f4f6fa', padding: '11px 14px', borderRadius: 12, fontSize: 14, marginBottom: 18 }}
        >
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        <div style={{ fontSize: 12.5, color: '#8a97ac', fontWeight: 700, marginBottom: 8 }}>Severity</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {CATEGORIES.map(cat => {
            const active = form.category === cat;
            const color = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => updateForm('category', cat)}
                style={{
                  flex: 1,
                  border: `1.5px solid ${color}`,
                  background: active ? color : 'transparent',
                  color: active ? '#0a0e14' : color,
                  padding: '10px 0',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 12.5, color: '#8a97ac', fontWeight: 700, marginBottom: 6 }}>Date</div>
        <input
          type="date"
          value={form.date}
          onChange={e => updateForm('date', e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f4f6fa', padding: '10px 14px', borderRadius: 12, fontSize: 14, marginBottom: 18 }}
        />

        <div style={{ fontSize: 12.5, color: '#8a97ac', fontWeight: 700, marginBottom: 6 }}>What happened</div>
        <textarea
          value={form.description}
          onChange={e => updateForm('description', e.target.value)}
          placeholder="Describe the incident…"
          style={{ width: '100%', minHeight: 90, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f4f6fa', padding: '12px 14px', borderRadius: 12, fontSize: 14, resize: 'vertical', marginBottom: 20 }}
        ></textarea>

        <button
          onClick={handleSubmit}
          style={{ width: '100%', border: 'none', background: 'linear-gradient(135deg,#22d3ee,#5eead4)', color: '#04222a', padding: '14px 0', borderRadius: 12, fontWeight: 800, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 14px 28px -10px rgba(34,211,238,0.5)' }}
        >
          {editingId ? 'Save Changes' : 'Log Incident'}
        </button>
      </div>

      <div style={{ flex: 1, minWidth: 320, background: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, padding: '22px 26px', maxHeight: 600, overflowY: 'auto' }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 14 }}>All Incidents</div>
        {recentIncidents.map(inc => (
          <div key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 9, height: 9, borderRadius: 999, marginTop: 6, flexShrink: 0, background: inc.color }}></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {inc.employeeName} <span style={{ color: '#69758a', fontWeight: 500, fontSize: 12 }}>· {inc.date}</span>
                </div>
                <div style={{ color: '#a4aec0', fontSize: 13, marginTop: 2 }}>{inc.description}</div>
                <div style={{ color: inc.color, fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>{inc.category}</div>
              </div>
            </div>
            {(canEdit || canDelete) && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {canEdit && (
                  <button
                    className="hop-nav-btn"
                    onClick={() => startEdit(inc)}
                    style={{ background: 'none', border: 'none', color: '#69758a', fontSize: 13, cursor: 'pointer', padding: 4, borderRadius: 6 }}
                    title="Edit incident"
                  >
                    ✎
                  </button>
                )}
                {canDelete && (
                  <button className="hop-delete-btn" onClick={() => deleteIncident(inc.id)} style={{ background: 'none', border: 'none', color: '#69758a', fontSize: 15, cursor: 'pointer', padding: 4 }} title="Delete incident">
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
