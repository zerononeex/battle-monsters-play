// Tunable numbers (BUILD_PLAN §4, approved 2026-10-11). Change balance here, not in engine code.
window.BM = window.BM || {};
BM.C = {
  TICK_HZ: 30,
  LANE: 1000,               // lane length in lane-units
  PLAYER_BASE_FRONT: 40,    // enemy units hit the player base when within range of this x
  ENEMY_BASE_FRONT: 960,
  START_AP: 100,
  MAX_PER_SIDE: 20,         // UU2 (Phase 7.6): 20 per side = 40 on screen (was 15; BR-002 — the real-iPad check is Phase 8)
  // AP generator: [AP per second, AP cap, cost to reach next level]. Phase 7.5 (user): AA1 upgrade costs 50 · 75 · 100 ·
  // 130 · 160 · 190 · 220 (total 925; was 120…600 = 2,520) and AA2 caps 400 · 550 · 700 · 900 · 1100 · 1300 · 1550 · 1800
  // (was 300…1200). Rates unchanged. Pacing is balanced with waves (Q1 rule), never by re-raising these.
  // NNN1 (user playtest 2026-10-11, Johto prompt Step 0c): upgrade costs rise slightly 50·75·100·130·160·190·220 (925) →
  // 55·80·105·135·165·195·230 (total 965). Rates and the AA2 caps do NOT move.
  // Johto fix batch 1 step 2 (user playtest 2026-10-12, anti-spam): upgrade costs 55·80·105·135·165·195·230 (965) →
  // 85·120·160·200·250·295·345 (total 1,455). Rates (15→56/s), caps (400→1800), unit prices + the 150 AP cap do NOT move.
  GEN: [null,
    [15, 400, 85], [20, 550, 120], [25, 700, 160], [30, 900, 200],
    [36, 1100, 250], [42, 1300, 295], [49, 1550, 345], [56, 1800, null]],
  GEN_MAX: 8,
  LEVEL_CAP: 60,
  baseHP: (stageLevel) => 1000 + 300 * stageLevel,
  ACE_BASE_FRAC: 0.7,       // a leader's ace comes out when the enemy base drops below 70%...
  ACE_TIME: 90,             // ...or at 90 s, whichever is first (§4.4)
  // §4.4 giant boss (Phase 7): 2× sprite. §4.4 proposed HP ×6 / damage ×2 — the Phase 7 sim found Sabrina, Lorelei, Lance
  // and the Champion unwinnable at expected levels with those, so: HP ×4 / damage ×1.5. BR-052 DECIDED in Phase 8 step 3: ×4 / ×1.5
  // ships (×6/×2 re-simmed: Celadon Gym 1/6, Lance ~169 s; the user's restore trigger — "kids find it easy" — never came).
  GIANT: { hp: 4, dmg: 1.5, size: 2 },
  SIG: { first: 3, every: 10 }, // K4 signature special move: first after 3 s on the field, then every 10 s
  // Stat formula (§4.2). Role multipliers below.
  MELEE_RANGE: 60,
  RANGED_RANGE: 250,
  BASE_ATTACK_INTERVAL: 1.2, // seconds
  ATTACK_WINDUP: 0.3,        // seconds of wind-up pose before the hit lands
  ROLES: {
    balanced: { hp: 1, dmg: 1, rate: 1, range: 'melee' },
    tank:     { hp: 1.5, dmg: 0.6, rate: 1, range: 'melee' },
    rusher:   { hp: 1, dmg: 0.8, rate: 1.4, range: 'melee' },
    ranged:   { hp: 1, dmg: 0.9, rate: 1, range: 'ranged' },
    bruiser:  { hp: 1, dmg: 1.4, rate: 1 / 1.3, range: 'melee' },
    legend:   { hp: 1.3, dmg: 1.3, rate: 1, range: 'ranged' },
  },
  levelScale: (lv) => 1 + (lv - 1) / 20,
  // G3 AP BOUNTY (Kakashi's numbers): defeating an enemy pays AP at once by its size class (data: BM.sizeClass), up to
  // the current AP cap, never above it. An ace (a leader's ace, or a `boss` form) always pays the boss bounty.
  BOUNTY: { fodder: 10, medium: 20, large: 40, boss: 150 },
  // G8: enemy spawn cries play a touch quieter than your own units' cries (player = 1).
  CRY_ENEMY_VOL: 0.55,
};
// Size class of a form (G3 bounty). Data first (`sizeClass` on the form); otherwise derived once from the line:
// legendary -> boss · single-form lines and final forms of 3-stage lines -> large · middle / final of 2 -> medium ·
// base forms -> fodder. Enemy-only forms carry an explicit `sizeClass` (enemies.js).
BM.sizeClass = function (form) {
  if (form.sizeClass) return form.sizeClass;
  const line = BM.LINES && BM.LINES[form.line], n = line ? line.forms.length : 1;
  if (line && line.legendary) return 'boss';
  if (form.boss) return 'boss';
  if (n === 1) return 'large';
  if (form.stage === 0) return 'fodder';
  return form.stage === n - 1 && n === 3 ? 'large' : 'medium';
};
// Supplied-sound keys (G8). Cries: art-src/cries/<cryKey>.mp3 — the species name (branch variants of one species share
// its cry: every typed Eevee = 'eevee'). Reserved SFX: art-src/sfx/<key>.mp3 replaces that synth sound when present.
// L1 COST SCALING (user, REVISED 2026-10-11 — gentle): effective AP cost = the form's audited base cost (L2, `form.cost`)
// × (1 + 0.01 × (level − 1)), hard-capped at ×1.5. Cooldown never scales. Cards / detail / team show this number.
BM.C.COST_PER_LEVEL = 0.01; BM.C.COST_CAP = 1.5;
BM.C.COST_MAX = 150; // Q1 kids' fun rule: no form ever costs more than 150 AP, at any level
BM.costMul = (level) => Math.min(BM.C.COST_CAP, 1 + BM.C.COST_PER_LEVEL * (Math.max(1, level) - 1));
BM.effCost = (form, level) => Math.min(BM.C.COST_MAX, Math.round(form.cost * BM.costMul(level || 1)));
BM.cryKey = (form) => form.cry || form.id;
BM.SFX_KEYS = ['super_effective'];

// TRAITS (Phase 4, Kakashi's balancing, user-delegated — veto pass on docs/ROLE_TRAITS.md before Phase 8). A trait is
// DATA on a form (`trait: 'swift'`, Dodger also `dodge: 0.15–0.30`), never code per species; it applies to every unit
// of that form, player or enemy. Stacks on top of the §4.2 role multipliers.
BM.TRAITS = {
  swift:  { name: 'Swift',  icon: '💫', interval: 0.7, text: 'attacks 30% faster' },
  tank:   { name: 'Tank',   icon: '🛡️', hp: 1.5, kbResist: true, text: '1.5× HP and can\'t be knocked back' },
  flyer:  { name: 'Flyer',  icon: '🕊️', immune: ['ground'], text: 'Ground attacks can\'t hit it' },
  dodger: { name: 'Dodger', icon: '💨', dodge: 0.2, text: 'dodges some hits' },          // species value 15–30% in data
  rusher: { name: 'Rusher', icon: '👟', speed: 1.4, text: 'marches 40% faster' },
  sniper: { name: 'Sniper', icon: '🎯', range: 1.6, text: 'reaches 60% farther' },
  splash: { name: 'Splash', icon: '💦', text: 'hits every foe in a small area' }, // K3: Splash = an area attack (combat.js aoe, 70 by default)
};
// Role label words (playtest H3: the gacha banner shows each legendary's ROLE as a chip, docs/ROLE_TRAITS.md). A form's
// trait wins (Swift, Tank…); otherwise its role + reach style ("Legend · Ranged").
BM.ROLE_NAMES = { balanced: 'Balanced', tank: 'Tank', rusher: 'Rusher', ranged: 'Ranged', bruiser: 'Bruiser', legend: 'Legend' };
BM.roleLabel = function (form) {
  const t = BM.formTrait(form);
  const style = BM.combatOf ? (BM.combatOf(form).style === 'ranged' ? 'Ranged' : 'Close') : '';
  const role = BM.ROLE_NAMES[form.role] || 'Balanced';
  return { icon: t ? t.icon : form.role === 'legend' ? '👑' : '⚔️', text: t ? `${t.name} · ${style}` : role === style ? role : `${role} · ${style}` };
};
BM.formTrait = (form) => (form && form.trait && BM.TRAITS[form.trait]) || null;
BM.traitText = function (form) {
  const t = BM.formTrait(form);
  if (!t) return '';
  return form.trait === 'dodger' ? `dodges ${Math.round((form.dodge || t.dodge) * 100)}% of hits` : t.text;
};

// HOME-REGION RULE (Johto fix batch 1 step 7, user 2026-10-12): a PLAYER Pokémon fighting a campaign stage outside its home
// region fights with the stats of HALF its level, rounded up. Home = its line's data `region` (default 'kanto'; a Mega form is
// on its line, so it shares the line's home). Only the level-scaled battle stats (HP + damage, via levelScale) use it — XP,
// evolution, AP cost and cooldown keep the true level. Enemy spawns are never adjusted. Region-neutral: Prism Tower (bonus)
// stages and anything without a region (dev stages). Data-driven: no per-species code.
BM.homeRegion = (formOrLine) => {
  const L = formOrLine && (formOrLine.forms ? formOrLine : BM.LINES[formOrLine.line]);
  return (L && L.region) || 'kanto';
};
BM.stageRegion = (st) => (!st || st.bonus || st.dev || !st.region ? null : st.region);
BM.isAway = (form, st) => { const r = BM.stageRegion(st); return !!r && BM.homeRegion(form) !== r; };
BM.awayLevel = (level) => Math.ceil(level / 2);
BM.battleLevel = (form, level, st) => (BM.isAway(form, st) ? BM.awayLevel(level) : level);
BM.awayTag = (form, level, st) => (BM.isAway(form, st) ? `Away from home — fights at Lv ${BM.awayLevel(level)}` : '');

// Battle stats for a form at a level. Any form may override hp/dmg/speed/range/interval in data. Trait effects are
// applied last and also returned (dodge / immune / splash / kbResist) for the battle engine.
BM.unitStats = function (form, level) {
  const C = BM.C, role = C.ROLES[form.role] || C.ROLES.balanced, s = C.levelScale(level), t = BM.formTrait(form) || {};
  // G9: reach, hits and the Speed-driven attack rate come from the form's combat identity (combat.js) when loaded
  const cb = BM.combatOf ? BM.combatOf(form) : null;
  const hp = (form.hp != null ? form.hp : form.baseHP * 4 * role.hp) * s * (t.hp || 1);
  const dmg = (form.dmg != null ? form.dmg : ((form.bst - form.baseHP - form.baseSpe) / 8) * role.dmg) * s;
  return {
    hp: Math.round(hp),
    dmg: Math.max(form.dmg === 0 ? 0 : 1, Math.round(dmg)),
    speed: (form.speed != null ? form.speed : 20 + form.baseSpe * 0.4) * (t.speed || 1),
    range: (form.range != null ? form.range : cb ? cb.reach : (role.range === 'ranged' ? C.RANGED_RANGE : C.MELEE_RANGE)) * (t.range || 1),
    interval: (form.interval != null ? form.interval : (C.BASE_ATTACK_INTERVAL / role.rate) * (cb ? cb.rateMul : 1)) * (t.interval || 1),
    hits: cb ? cb.hits : 1,
    dodge: t.dodge ? form.dodge || t.dodge : 0,
    immune: t.immune || null,
    aoe: form.aoe != null ? form.aoe : cb ? cb.aoe : 0,                       // K3 area-attack radius (0 = single target)
    status: cb ? cb.status : null, statusChance: cb ? cb.statusChance : 0,   // K4
    kbResist: !!t.kbResist,
  };
};
