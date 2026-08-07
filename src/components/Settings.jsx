import { useState } from 'react';
import { BAND_DEFS, CATEGORIES, CATEGORY_COLORS, DEFAULT_RULE_SETTINGS } from '../lib/constants.js';

const card = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  padding: '20px 24px',
  marginBottom: 20
};
const label = { color: '#8a97ac', fontSize: 11.5, fontWeight: 700, marginBottom: 6 };
const numberInput = {
  width: 100,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#f4f6fa',
  padding: '9px 12px',
  borderRadius: 10,
  fontSize: 14
};

export default function Settings({ ruleSettings, updateRuleSettings }) {
  const [draft, setDraft] = useState(ruleSettings);
  const dirty = JSON.stringify(draft) !== JSON.stringify(ruleSettings);

  function setStrikeValue(category, value) {
    setDraft(d => ({ ...d, strikeValues: { ...d.strikeValues, [category]: Number(value) || 0 } }));
  }

  function setBandAmount(tier, value) {
    const next = [...draft.bandAmounts];
    next[tier] = Number(value) || 0;
    setDraft(d => ({ ...d, bandAmounts: next }));
  }

  function setPillarPayout(level, value) {
    setDraft(d => ({ ...d, pillarPayout: { ...d.pillarPayout, [level]: Number(value) || 0 } }));
  }

  function setFullHouseBonus(value) {
    setDraft(d => ({ ...d, fullHouseBonus: Number(value) || 0 }));
  }

  function handleSave() {
    updateRuleSettings(draft);
  }

  function handleReset() {
    setDraft(DEFAULT_RULE_SETTINGS);
    updateRuleSettings(DEFAULT_RULE_SETTINGS);
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Penalty &amp; Incentive Settings</div>
      <div style={{ color: '#8a97ac', fontSize: 13, marginBottom: 20 }}>Admin only. Changes apply to all future calculations for everyone.</div>

      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Strike weight per category</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <div key={cat}>
              <div style={{ ...label, color: CATEGORY_COLORS[cat] }}>{cat}</div>
              <input type="number" min="0" value={draft.strikeValues[cat]} onChange={e => setStrikeValue(cat, e.target.value)} style={numberInput} />
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Penalty ladder (₹ deducted per month)</div>
        {BAND_DEFS.map(def => (
          <div key={def.tier} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: def.tier === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ flex: 1, fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>{def.label}</span>
              <span style={{ color: '#69758a' }}> · up to {def.max === Infinity ? '100+' : def.max} strikes</span>
            </div>
            <input type="number" min="0" value={draft.bandAmounts[def.tier]} onChange={e => setBandAmount(def.tier, e.target.value)} style={numberInput} />
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Incentive payouts (₹ per pillar, per month)</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <div style={label}>Base level</div>
            <input type="number" min="0" value={draft.pillarPayout.base} onChange={e => setPillarPayout('base', e.target.value)} style={numberInput} />
          </div>
          <div>
            <div style={label}>Excellence level</div>
            <input type="number" min="0" value={draft.pillarPayout.excellence} onChange={e => setPillarPayout('excellence', e.target.value)} style={numberInput} />
          </div>
        </div>
        <div style={label}>Full House bonus (all 3 pillars hit)</div>
        <input type="number" min="0" value={draft.fullHouseBonus} onChange={e => setFullHouseBonus(e.target.value)} style={numberInput} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={!dirty}
          style={{
            border: 'none',
            background: dirty ? 'linear-gradient(135deg,#22d3ee,#5eead4)' : 'rgba(255,255,255,0.06)',
            color: dirty ? '#04222a' : '#69758a',
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 13.5,
            cursor: dirty ? 'pointer' : 'default'
          }}
        >
          Save Changes
        </button>
        <button
          onClick={handleReset}
          style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#8a97ac', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
