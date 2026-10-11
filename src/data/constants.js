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
};

// Battle stats for a form at a level. Any form may override hp/dmg/speed/range/interval in data.
BM.unitStats = function (form, level) {
  const C = BM.C, role = C.ROLES[form.role] || C.ROLES.balanced, s = C.levelScale(level);
  const hp = (form.hp != null ? form.hp : form.baseHP * 4 * role.hp) * s;
  const dmg = (form.dmg != null ? form.dmg : ((form.bst - form.baseHP - form.baseSpe) / 8) * role.dmg) * s;
  return {
    hp: Math.round(hp),
    dmg: Math.max(form.dmg === 0 ? 0 : 1, Math.round(dmg)),
    speed: form.speed != null ? form.speed : 20 + form.baseSpe * 0.4,
    range: form.range != null ? form.range : (role.range === 'ranged' ? C.RANGED_RANGE : C.MELEE_RANGE),
    interval: form.interval != null ? form.interval : C.BASE_ATTACK_INTERVAL / role.rate,
  };
};
