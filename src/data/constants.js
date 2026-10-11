// Tunable numbers (BUILD_PLAN §4, approved 2026-10-11). Change balance here, not in engine code.
window.BM = window.BM || {};
BM.C = {
  TICK_HZ: 30,
  LANE: 1000,               // lane length in lane-units
  PLAYER_BASE_FRONT: 40,    // enemy units hit the player base when within range of this x
  ENEMY_BASE_FRONT: 960,
  START_AP: 100,
  MAX_PER_SIDE: 15,         // 30 on screen total (BUG_REGISTRY BR-002)
  // AP generator: [AP per second, AP cap, cost to reach next level]
  GEN: [null,
    [15, 300, 120], [20, 400, 200], [25, 500, 280], [30, 600, 360],
    [36, 750, 440], [42, 900, 520], [49, 1050, 600], [56, 1200, null]],
  GEN_MAX: 8,
  LEVEL_CAP: 60,
  baseHP: (stageLevel) => 1000 + 300 * stageLevel,
  ACE_BASE_FRAC: 0.7,       // a leader's ace comes out when the enemy base drops below 70%...
  ACE_TIME: 90,             // ...or at 90 s, whichever is first (§4.4)
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
BM.cryKey = (form) => form.cry || form.id;
BM.SFX_KEYS = ['super_effective'];

// TRAITS (Phase 4, Kakashi's balancing, user-delegated — veto pass on docs/ROLE_TRAITS.md before Phase 8). A trait is
// DATA on a form (`trait: 'swift'`, Dodger also `dodge: 0.15–0.30`), never code per species; it applies to every unit
// of that form, player or enemy. Stacks on top of the §4.2 role multipliers.
BM.TRAITS = {
  swift:  { name: 'Swift',  icon: '⚡', interval: 0.7, text: 'attacks 30% faster' },
  tank:   { name: 'Tank',   icon: '🛡️', hp: 1.5, kbResist: true, text: '1.5× HP and can\'t be knocked back' },
  flyer:  { name: 'Flyer',  icon: '🕊️', immune: ['ground'], text: 'Ground attacks can\'t hit it' },
  dodger: { name: 'Dodger', icon: '💨', dodge: 0.2, text: 'dodges some hits' },          // species value 15–30% in data
  rusher: { name: 'Rusher', icon: '👟', speed: 1.4, text: 'marches 40% faster' },
  sniper: { name: 'Sniper', icon: '🎯', range: 1.6, text: 'reaches 60% farther' },
  splash: { name: 'Splash', icon: '💦', splash: { radius: 70, frac: 0.5 }, text: 'hits also splash foes next to the target' },
};
BM.formTrait = (form) => (form && form.trait && BM.TRAITS[form.trait]) || null;
BM.traitText = function (form) {
  const t = BM.formTrait(form);
  if (!t) return '';
  return form.trait === 'dodger' ? `dodges ${Math.round((form.dodge || t.dodge) * 100)}% of hits` : t.text;
};

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
    splash: t.splash || null,
    kbResist: !!t.kbResist,
  };
};
