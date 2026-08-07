export const CATEGORY_COLORS = { Low: '#60a5fa', Medium: '#fbbf24', Critical: '#f87171' };
export const DOT_COLORS = { none: '#3f4a5c', base: '#60a5fa', excellence: '#34d399' };

// Fixed strike-range tiers (thresholds aren't customizable, only the amounts below are).
export const BAND_DEFS = [
  { max: 15, tier: 0, label: 'No Formal Action' },
  { max: 30, tier: 1, label: 'Verbal Counselling' },
  { max: 60, tier: 2, label: 'First Written Warning' },
  { max: 80, tier: 3, label: 'Final Written Warning' },
  { max: Infinity, tier: 4, label: 'Formal Review — Possible Termination' }
];

// Admin-customizable amounts. Persisted per-browser alongside incidents/incentives;
// everything else in the app falls back to these defaults until an admin changes them.
export const DEFAULT_RULE_SETTINGS = {
  strikeValues: { Low: 1, Medium: 3, Critical: 5 },
  bandAmounts: [500, 1000, 1500, 2000, 4000], // indexed by BAND_DEFS[].tier
  pillarPayout: { none: 0, base: 500, excellence: 1000 },
  fullHouseBonus: 500
};

export const PILLARS = [
  { key: 'retention', label: 'Client Retention & Satisfaction' },
  { key: 'reviews', label: 'Reviews & Feedback' },
  { key: 'attendance', label: 'Attendance & Punctuality' }
];

export const STORAGE_KEY = 'hop-penalty-system-v1';
export const TIER_COLORS = ['#64748b', '#60a5fa', '#fbbf24', '#fb923c', '#f87171', '#ef4444'];

export const CATEGORIES = ['Low', 'Medium', 'Critical'];

export const INITIAL_EMPLOYEES = [
  { id: 'e1', name: 'Aditi Sharma' },
  { id: 'e2', name: 'Rohan Verma' },
  { id: 'e3', name: 'Priya Nair' },
  { id: 'e4', name: 'Karan Mehta' },
  { id: 'e5', name: 'Sana Iqbal' }
];

export const ACTIVE_TAB_STYLE = {
  background: 'linear-gradient(135deg,#22d3ee,#5eead4)',
  color: '#04222a',
  boxShadow: '0 10px 22px -8px rgba(34,211,238,0.5)'
};

export const INACTIVE_TAB_STYLE = {
  background: 'rgba(255,255,255,0.05)',
  color: '#8a97ac',
  boxShadow: 'none'
};
