// VV1 (Phase 7.6): per-stage RESTRICTIONS — the framework only. Designed for SPARING use from Sinnoh on; Kanto is the
// introduction and stays simple: NO Kanto campaign stage and NO Prism Tower floor carries a restriction (asserted by
// `phase76 vv1`). A stage opts in with a `restrict` object:
//   restrict: { fieldCap: 5 }    — field-cap override: at most N Pokémon per side on the field (both sides; ≤ MAX_PER_SIDE)
//   restrict: { apMax: 100 }     — AP cost ceiling: only cards whose cost (at the line's level) is ≤ N may deploy; others
//                                  grey out on the battle bar with the reason in kid words
// Both may be combined. Any stage that ships with a restriction must pass the legal-only sim proof (`phase76 vv1`: beatable
// using only the Pokémon the rule allows) — the same proof the dev stages below pass.
window.BM = window.BM || {};
BM.RESTRICTION_TYPES = ['fieldCap', 'apMax'];
BM.stageRules = (st) => (st && st.restrict) || null;
// the per-side field cap on this stage
BM.fieldCap = (st) => { const r = BM.stageRules(st); return Math.min(BM.C.MAX_PER_SIDE, (r && r.fieldCap) || Infinity); };
// why a card may NOT deploy on this stage (kid-readable), or null when it may
BM.cardRuleWhy = (st, cost) => { const r = BM.stageRules(st); return r && r.apMax != null && cost > r.apMax ? `Costs ${cost} — this stage allows up to ${r.apMax}` : null; };
// the pre-battle badge lines
BM.ruleBadges = (st) => {
  const r = BM.stageRules(st); if (!r) return [];
  const out = [];
  if (r.fieldCap) out.push({ type: 'fieldCap', icon: '👥', text: `Only ${r.fieldCap} Pokémon on the field at once` });
  if (r.apMax != null) out.push({ type: 'apMax', icon: 'ap', text: `Only cards that cost ${r.apMax} or less` });
  return out;
};
// a profile's team split by the rule (the legal-only sim proof fields `legal` only)
BM.legalTeam = (st, profile) => {
  const legal = [], out = [];
  for (const id of profile.team) { const l = profile.lines[id]; if (!l) continue; const f = BM.FORMS[l.form]; (BM.cardRuleWhy(st, BM.effCost(f, l.level)) ? out : legal).push(id); }
  return { legal, out };
};

// Dev / test stages proving the framework (hidden dev mode only: map → DEV buttons). NEVER campaign content.
BM.STAGES.push(
  {
    id: 'dev_rule_cap', num: 0, name: 'Rule Test: Small Field', kind: 'trainer', level: 8, dev: true, restrict: { fieldCap: 5 },
    background: 'viridian_forest', music: 'battle_trainer', townMusic: 'route',
    waves: [{ form: 'caterpie', level: 6, start: 3, every: 9 }, { form: 'rattata', level: 6, start: 7, every: 10 }, { form: 'pidgey', level: 7, start: 14, every: 12 }],
  },
  {
    id: 'dev_rule_ap', num: 0, name: 'Rule Test: Small Cards', kind: 'trainer', level: 22, dev: true, restrict: { apMax: 120 }, // NNN1: 100 → 105 keeps the same 4-card legal deck (Charmeleon 85 → 103 at Lv 22); Hoenn Step 9.5: → 120 (Charmeleon 95 → 115)
    background: 'viridian_city', music: 'battle_trainer', townMusic: 'route',
    waves: [{ form: 'rattata', level: 15, start: 3, every: 16 }, { form: 'pidgeotto', level: 16, start: 8, every: 22 }, { form: 'ekans', level: 17, start: 15, every: 26 }], // OOO1 (Johto Step 0d): foes −5 Lv and the pre-OOO1 K2 shape (no packs, bursts 2–3 every 22–30 s) — these prove the RULE (a 4-card deck incl. a Gastly that Normal foes can't touch), not the density. Hoenn Step 9.5 (prices +~13% on top of the batch-1 generator costs; HEAD was already 4/6 + 2/6): waves half as often, bursts 1–2 every 30–40 s, one counter-burst (50%)
    burst: { pack: [1, 1], size: [1, 2], every: [30, 40], thresholds: [0.5] },
  },
  {
    id: 'dev_rule_both', num: 0, name: 'Rule Test: Both Rules', kind: 'trainer', level: 22, dev: true, restrict: { fieldCap: 10, apMax: 120 },
    background: 'viridian_city', music: 'battle_trainer', townMusic: 'route',
    waves: [{ form: 'rattata', level: 15, start: 3, every: 10 }, { form: 'pidgeotto', level: 16, start: 6, every: 14 }, { form: 'ekans', level: 17, start: 12, every: 18 }],
    burst: { pack: [1, 1], size: [1, 2], every: [30, 40], thresholds: [0.5] },
  },
);
