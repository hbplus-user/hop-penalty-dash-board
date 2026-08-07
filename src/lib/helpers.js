import { BAND_DEFS, CATEGORY_COLORS, DEFAULT_RULE_SETTINGS, DOT_COLORS, PILLARS, TIER_COLORS } from './constants.js';

export function monthKeyOf(dateStr) {
  return dateStr.slice(0, 7);
}

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function monthLabelOf(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function computeBand(strikes, bandAmounts = DEFAULT_RULE_SETTINGS.bandAmounts) {
  if (strikes <= 0) return { label: 'Clean Record', amount: 0, tier: -1 };
  const def = BAND_DEFS.find(d => strikes <= d.max);
  return { label: def.label, amount: bandAmounts[def.tier], tier: def.tier };
}

export function seedIncidents() {
  const cm = currentMonthKey();
  return [
    { id: 'i1', employeeId: 'e2', date: cm + '-03', category: 'Medium', description: 'Double-booked a session slot' },
    { id: 'i2', employeeId: 'e4', date: cm + '-07', category: 'Low', description: 'Uniform not worn' },
    { id: 'i3', employeeId: 'e2', date: cm + '-12', category: 'Critical', description: 'Refund processed without authorization' },
    { id: 'i4', employeeId: 'e3', date: cm + '-14', category: 'Low', description: 'Noticeboard not updated on time' }
  ];
}

export function seedIncentives() {
  const cm = currentMonthKey();
  return {
    ['e1::' + cm]: { retention: 'excellence', reviews: 'base', attendance: 'excellence' },
    ['e5::' + cm]: { retention: 'base', reviews: 'base', attendance: 'base' }
  };
}

export function getIncentiveState(incentives, employeeId, month) {
  return incentives[employeeId + '::' + month] || { retention: 'none', reviews: 'none', attendance: 'none' };
}

export function computeIncentiveTotal(inc, pillarPayout = DEFAULT_RULE_SETTINGS.pillarPayout, fullHouseBonus = DEFAULT_RULE_SETTINGS.fullHouseBonus) {
  const vals = [inc.retention, inc.reviews, inc.attendance];
  let total = vals.reduce((sum, v) => sum + pillarPayout[v], 0);
  const fullHouse = vals.every(v => v !== 'none');
  if (fullHouse) total += fullHouseBonus;
  return { total, fullHouse };
}

export function buildAllTimeSummary(employees, incidents, incentives, ruleSettings = DEFAULT_RULE_SETTINGS) {
  const rows = employees.map(emp => {
    const monthGroups = {};
    incidents
      .filter(i => i.employeeId === emp.id)
      .forEach(i => {
        const mk = monthKeyOf(i.date);
        if (!monthGroups[mk]) monthGroups[mk] = [];
        monthGroups[mk].push({ ...i, color: CATEGORY_COLORS[i.category] });
      });

    const monthlyBreakdown = Object.keys(monthGroups)
      .sort((a, b) => (a < b ? 1 : -1))
      .map(mk => {
        const monthIncidents = monthGroups[mk];
        const strikes = monthIncidents.reduce((s, i) => s + ruleSettings.strikeValues[i.category], 0);
        return { month: mk, monthLabel: monthLabelOf(mk), strikes, band: computeBand(strikes, ruleSettings.bandAmounts), incidents: monthIncidents };
      });

    let totalStrikes = 0;
    let totalPenalty = 0;
    monthlyBreakdown.forEach(m => {
      totalStrikes += m.strikes;
      totalPenalty += m.band.amount;
    });

    let totalIncentive = 0;
    Object.entries(incentives).forEach(([key, inc]) => {
      if (key.startsWith(emp.id + '::')) {
        totalIncentive += computeIncentiveTotal(inc, ruleSettings.pillarPayout, ruleSettings.fullHouseBonus).total;
      }
    });

    return {
      id: emp.id,
      name: emp.name,
      totalIncentive,
      totalPenalty,
      netAmount: totalIncentive - totalPenalty,
      totalStrikes,
      monthlyBreakdown
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      totalIncentive: acc.totalIncentive + r.totalIncentive,
      totalPenalty: acc.totalPenalty + r.totalPenalty,
      netAmount: acc.netAmount + r.netAmount,
      totalStrikes: acc.totalStrikes + r.totalStrikes
    }),
    { totalIncentive: 0, totalPenalty: 0, netAmount: 0, totalStrikes: 0 }
  );

  return { rows, totals };
}

export function buildEmployeeSummary(emp, month, incidents, incentives, ruleSettings = DEFAULT_RULE_SETTINGS) {
  const monthIncidents = incidents
    .filter(i => i.employeeId === emp.id && monthKeyOf(i.date) === month)
    .map(i => ({ ...i, color: CATEGORY_COLORS[i.category] }));
  const strikes = monthIncidents.reduce((s, i) => s + ruleSettings.strikeValues[i.category], 0);
  const band = computeBand(strikes, ruleSettings.bandAmounts);
  const hasCritical = monthIncidents.some(i => i.category === 'Critical');
  const inc = getIncentiveState(incentives, emp.id, month);
  const incentiveResult = computeIncentiveTotal(inc, ruleSettings.pillarPayout, ruleSettings.fullHouseBonus);
  const tierColor = TIER_COLORS[band.tier + 1];

  return {
    id: emp.id,
    name: emp.name,
    strikes,
    band,
    hasCritical,
    incidentCount: monthIncidents.length,
    noIncidents: monthIncidents.length === 0,
    incentiveTotal: incentiveResult.total,
    fullHouse: incentiveResult.fullHouse,
    tierColor,
    bandBg: tierColor + '22',
    strikePct: Math.min(100, strikes),
    incidents: monthIncidents,
    pillars: PILLARS.map(p => ({ key: p.key, label: p.label, level: inc[p.key], dotColor: DOT_COLORS[inc[p.key]] }))
  };
}
