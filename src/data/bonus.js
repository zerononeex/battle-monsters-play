// BONUS ZONE (user design, design addendum 2026-10-11; replaces BUILD_PLAN §4.3's Easy/Medium/Hard grind stages). Its own
// screen off the campaign map (never blocks the campaign path). Every bonus stage is a normal battle (waves, bursts, bounty,
// battle items, Dowsing) — challenge auto-clear does NOT apply; the J1 hidden-intel rule does. Stage ids start `bonus_`.
//   XP STAGES ×4 (his names): REGULAR · GREAT · ULTRA · MASTER — replayable, pay bonus team XP to every line you bring +
//     an XP candy (S / M / L / L×2 by tier) + the §4.5 grind ticket (1 per win). Waves scaled to the band.
//   TREASURE STAGES: a stone stage per stone (themed enemies, that stone as the headline drop), a Poké Ball stage, an item
//     stage (Dowsing Machine / Rare Candy chances). Drop tables weighted to the theme; the FIRST clear guarantees the
//     headline item.
//   MEGA STONE section: shown LOCKED — "Beat Johto to unlock 🔒". No content in Build 1.
window.BM = window.BM || {};
(function () {
  const W = (form, level, start, every) => ({ form, level, start, every });
  // Kakashi's level bands; xp = team XP per win to EVERY line that battled (not split); candy = the XP candy each win adds
  BM.BONUS_TIERS = [
    { id: 'regular', name: 'Regular', ball: 'poke_ball', minLv: 5, level: 10, xp: 1500, candy: { xp_candy_s: 1 }, curveAt: 4 },
    { id: 'great', name: 'Great', ball: 'great_ball', minLv: 15, level: 22, xp: 6000, candy: { xp_candy_m: 1 }, curveAt: 9 },
    { id: 'ultra', name: 'Ultra', ball: 'ultra_ball', minLv: 30, level: 38, xp: 20000, candy: { xp_candy_l: 1 }, curveAt: 15 },
    { id: 'master', name: 'Master', ball: 'master_ball', minLv: 45, level: 54, xp: 45000, candy: { xp_candy_l: 2 }, curveAt: 21 },
  ];
  // the highest tier a team of `lv` can sensibly farm (the sim's grind; the UI just recommends the band)
  BM.bonusTierFor = (lv) => BM.BONUS_TIERS.filter((t) => lv >= t.minLv).pop() || null;
  BM.GRIND_WINS = 1; // sim assumption: XP-stage wins a kid plays between campaign stages from Mt. Moon on (phase7.mjs)
  // XP-stage waves: Chansey-free kid version — mixed Normal fodder + the tier's evolved forms, all at the band level
  const XPW = {
    regular: (L) => [W('rattata', L - 2, 3, 7), W('pidgey', L - 1, 9, 9), W('meowth', L, 20, 12)],
    great: (L) => [W('rattata', L - 2, 3, 6), W('pidgeot', L - 1, 12, 12), W('persian', L, 22, 13), W('clefairy', L, 30, 14)],
    ultra: (L) => [W('persian', L - 2, 3, 8), W('pidgeot', L, 10, 10), W('wigglytuff', L, 22, 14), W('snorlax', L - 2, 40, 26)],
    master: (L) => [W('persian', L - 2, 3, 7), W('pidgeot', L, 9, 9), W('snorlax', L, 25, 20), W('porygon2', L, 35, 18)],
  };
  const xpStages = BM.BONUS_TIERS.map((t) => ({
    id: 'bonus_xp_' + t.id, name: `${t.name} XP Stage`, bonus: 'xp', tier: t.id, kind: 'bonus', level: t.level, curveAt: t.curveAt,
    background: { regular: 'pallet_town', great: 'cerulean_city', ultra: 'celadon_city', master: 'saffron_city' }[t.id],
    music: 'battle_trainer', townMusic: 'route', ball: t.ball, minLv: t.minLv, bonusXp: t.xp, candy: t.candy,
    waves: XPW[t.id](t.level),
    burst: { pool: XPW[t.id](t.level).map((w) => w.form) },
    drops: [{ item: 'tickets', w: 30, n: 2 }, { item: 'xp_candy_s', w: 30, n: 1 }, { item: 'xp_candy_m', w: t.minLv >= 15 ? 20 : 6, n: 1 },
      { item: 'xp_candy_l', w: t.minLv >= 30 ? 10 : 1, n: 1 }, { item: 'rare_candy', w: 2, n: 1 }],
  }));
  // Treasure stages: [id, name, headline item, enemies (form, level offsets), background, level, curveAt]
  const T = (id, name, item, foes, bg, level, curveAt, icon) => ({
    id: 'bonus_tr_' + id, name, bonus: 'treasure', kind: 'bonus', headline: item, icon, level, curveAt, background: bg,
    music: 'battle_wild', townMusic: 'route',
    waves: foes.map(([f, d, start, every], i) => W(f, level + d, start != null ? start : 3 + i * 7, every || 9 + i * 2)),
    drops: [{ item, w: 34, n: 1 }, { item: 'tickets', w: 22, n: 3 }, { item: 'xp_candy_s', w: 22, n: 1 }, { item: 'xp_candy_m', w: 10, n: 1 }, { item: 'poke_ball', w: 8, n: 1 }, { item: 'rare_candy', w: 2, n: 1 }, { item: 'dowsing_machine', w: 1, n: 1 }],
  });
  const treasure = [
    T('fire', 'Fire Stone Volcano', 'fire_stone', [['ponyta', -1], ['growlithe', 0], ['vulpix', 0], ['rapidash', 1, 40, 22]], 'cinnabar_island', 24, 8, '🔥'),
    T('water', 'Water Stone Lake', 'water_stone', [['staryu', -1], ['psyduck', 0], ['tentacool', 0], ['golduck', 1, 40, 22]], 'cerulean_city', 22, 7, '💧'),
    T('thunder', 'Thunder Stone Plant', 'thunder_stone', [['voltorb', -1], ['pikachu', 0], ['voltorb', 1], ['raichu', 1, 40, 24]], 'vermilion_city', 24, 8, '⚡'),
    T('leaf', 'Leaf Stone Garden', 'leaf_stone', [['oddish', -1], ['tangela', 0], ['oddish', 1], ['vileplume', 1, 40, 24]], 'viridian_forest', 20, 6, '🍃'),
    T('moon', 'Moon Stone Cave', 'moon_stone', [['zubat', -1], ['clefairy', 0], ['geodude', 0], ['golbat', 1, 40, 22]], 'mt_moon', 18, 6, '🌙'),
    T('ice', 'Ice Stone Cavern', 'ice_stone', [['tentacool', -1], ['dewgong', 0], ['cloyster', 0], ['lapras', 1, 45, 26]], 'cerulean_city', 30, 10, '❄️'),
    { ...T('ball', 'Poké Ball Factory', 'poke_ball', [['voltorb', -1], ['meowth', 0], ['porygon', 0], ['persian', 1, 40, 22]], 'celadon_city', 26, 9, '🔴'),
      drops: [{ item: 'poke_ball', w: 60, n: 2 }, { item: 'poke_ball', w: 12, n: 4 }, { item: 'tickets', w: 18, n: 3 }, { item: 'xp_candy_s', w: 10, n: 1 }] },
    { ...T('item', 'Treasure Tower', 'rare_candy', [['gastly', -1], ['haunter', 0], ['mr_mime', 0], ['gengar', 1, 45, 26]], 'lavender_town', 32, 11, '🍭'),
      drops: [{ item: 'rare_candy', w: 28, n: 1 }, { item: 'dowsing_machine', w: 14, n: 1 }, { item: 'xp_candy_m', w: 20, n: 1 }, { item: 'xp_candy_l', w: 6, n: 1 }, { item: 'tickets', w: 24, n: 3 }, { item: 'poke_ball', w: 10, n: 1 }] },
  ];
  for (const st of treasure) st.burst = { pool: [...new Set(st.waves.map((w) => w.form))] };
  BM.BONUS_STAGES = [...xpStages, ...treasure];
  BM.BONUS_MEGA = { locked: true, text: 'Beat Johto to unlock 🔒', name: 'Mega Stone Stages' };
  BM.STAGES.push(...BM.BONUS_STAGES);
  BM.isBonus = (st) => !!(st && st.bonus);
  // Unlocks (BUILD_PLAN §4.3 spirit: Easy after Brock …): the zone itself opens after Brock; XP tiers after Brock / Lt. Surge /
  // Koga / Giovanni; each treasure stage once the campaign stage its band matches (`curveAt`) is cleared.
  BM.BONUS_OPEN_AFTER = 'kanto_05_brock';
  const TIER_AFTER = { regular: 'kanto_05_brock', great: 'kanto_10_surge', ultra: 'kanto_15_koga', master: 'kanto_20_giovanni' };
  BM.bonusUnlockStage = (st) => (st.tier ? TIER_AFTER[st.tier] : BM.KANTO_STAGES[Math.max(0, st.curveAt - 1)].id);
  BM.bonusOpen = (st, p) => !!(p && p.cleared[BM.bonusUnlockStage(st)] > 0);
})();
