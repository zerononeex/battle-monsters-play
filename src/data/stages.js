// Stage data — the 25 Kanto stages in campaign order (BUILD_PLAN §4.11). Stages 1–12 are playable from Phase 3;
// 13–25 (Erika onward: gyms, Elite Four, Champion) are on the map but locked until Phase 7 (`locked: 'phase7'`).
//   kind: wild | trainer | gym | e4 | champion  (drives ticket rewards §4.5 and the victory jingle)
//   level: the stage level = highest enemy level (§4.4: base HP = 1000 + 300 × level; XP §4.3)
//   music: battle category key · townMusic: map/pre-battle key (MUSIC_PROMPTS — never per leader/town battle keys)
//   background: key of assets/backgrounds/kanto/<key>.png (procedural placeholder until DONE). Gym stages reuse
//     their town until the Phase 7 gym interiors land.
//   waves: { form, level, start (s), every (s), count (omit = endless) }
//   ace: the leader's ace — spawns ONCE when the enemy base first drops below 70% or at 90 s (§4.4). Phase 3 fields
//     it at normal size; the giant-boss scaling (2× size, HP ×6, damage ×2) is Phase 7.
//   gift: a line granted on FIRST clear (§4.9) · item: a fixed first-clear drop (§4.6)
//   drops: the stage's DROP TABLE (Phase 4, design addendum "item drops") — [{ item, w (weight), n (count) }], rolled
//     on every win and stored (BM.rollDrops): 2 rolls on a first clear, 1 on a replay. item 'tickets' = bonus Battle
//     Tickets. A first clear always gives at least one real item (not just tickets). Built with D(tier, themed stones):
//     type-themed stages weight their matching stone (Leaf near the forest, Moon at Mt. Moon / the Pewter museum, Water
//     at Cerulean, Thunder at Vermilion, Fire at Celadon / Cinnabar…). The §4.6 fixed `item` stays as well — tables
//     ADD to it, never replace it.
window.BM = window.BM || {};
(function () {
  const W = (form, level, start, every, count) => (count == null ? { form, level, start, every } : { form, level, start, every, count });
  // Drop table weights by stage tier (out of ~100). Rare Candy and the Dowsing Machine are the rare finds.
  const TIER = {
    early: { xp_candy_s: 36, xp_candy_m: 4, tickets: [22, 3], poke_ball: 12, stone: 7, rare_candy: 2, dowsing_machine: 1 },
    mid: { xp_candy_s: 26, xp_candy_m: 12, xp_candy_l: 1, tickets: [18, 4], poke_ball: 12, stone: 9, rare_candy: 2.5, dowsing_machine: 1.2 },
    late: { xp_candy_s: 16, xp_candy_m: 18, xp_candy_l: 4, tickets: [18, 5], poke_ball: 12, stone: 10, rare_candy: 3, dowsing_machine: 1.5 },
  };
  // stones: { stoneId: share } — the tier's stone weight split by share (a share of 2 = that stone dominates)
  function D(tier, stones) {
    const t = TIER[tier], out = [], tot = Object.values(stones).reduce((a, b) => a + b, 0);
    for (const [k, v] of Object.entries(t)) {
      if (k === 'stone') for (const [id, sh] of Object.entries(stones)) out.push({ item: id, w: +(v * sh / tot).toFixed(2), n: 1 });
      else if (k === 'tickets') out.push({ item: 'tickets', w: v[0], n: v[1] });
      else out.push({ item: k, w: v, n: 1 });
    }
    return out;
  }
  BM.STAGES = [
    {
      id: 'kanto_01_pallet', num: 1, name: 'Pallet Town', drops: D('early', { leaf_stone: 1 }), kind: 'wild', level: 3,
      background: 'pallet_town', music: 'battle_wild', townMusic: 'town_pallet', tutorial: true,
      waves: [W('rattata', 2, 4, 8), W('pidgey', 2, 14, 12), W('rattata', 3, 60, 10), W('pidgey', 3, 90, 14)],
    },
    {
      id: 'kanto_02_viridian', num: 2, name: 'Viridian City', drops: D('early', { leaf_stone: 1 }), kind: 'wild', level: 5,
      background: 'viridian_city', music: 'battle_wild', townMusic: 'town_viridian',
      waves: [W('rattata', 4, 4, 8), W('pidgey', 4, 12, 11), W('caterpie', 5, 24, 15), W('rattata', 5, 70, 10), W('pidgey', 5, 100, 13)],
    },
    {
      id: 'kanto_03_forest', num: 3, name: 'Viridian Forest', drops: D('early', { leaf_stone: 3, thunder_stone: 1 }), kind: 'wild', level: 7,
      background: 'viridian_forest', music: 'battle_wild', townMusic: 'route',
      waves: [W('caterpie', 6, 3, 8), W('pikachu', 7, 18, 16), W('caterpie', 7, 60, 10), W('pikachu', 7, 110, 14)],
    },
    {
      id: 'kanto_04_pewter', num: 4, name: 'Pewter City', place: 'Museum', drops: D('early', { moon_stone: 2, leaf_stone: 1 }), kind: 'trainer', level: 10,
      background: 'pewter_city', music: 'battle_trainer', townMusic: 'town_pewter',
      waves: [W('geodude', 9, 4, 10), W('rattata', 9, 10, 9), W('geodude', 10, 55, 11), W('rattata', 10, 85, 8)],
    },
    {
      id: 'kanto_05_brock', num: 5, name: 'Pewter Gym', leader: 'Brock', drops: D('mid', { moon_stone: 2, metal_coat: 1 }), kind: 'gym', level: 14,
      background: 'pewter_city', music: 'battle_gym', townMusic: 'town_pewter',
      waves: [W('geodude', 12, 4, 9), W('geodude', 12, 30, 12), W('geodude', 12, 100, 10)],
      ace: { form: 'onix', level: 14 },
    },
    {
      id: 'kanto_06_mtmoon', num: 6, name: 'Mt. Moon', drops: D('mid', { moon_stone: 3, thunder_stone: 1 }), kind: 'wild', level: 13,
      background: 'mt_moon', music: 'battle_wild', townMusic: 'route',
      waves: [W('zubat', 11, 3, 10), W('geodude', 12, 14, 13), W('clefairy', 12, 30, 16), W('zubat', 12, 80, 11), W('clefairy', 13, 120, 16)],
      gift: 'magikarp', item: 'moon_stone',
    },
    {
      id: 'kanto_07_cerulean', num: 7, name: 'Cerulean City', drops: D('mid', { water_stone: 2, moon_stone: 1 }), kind: 'trainer', level: 17,
      background: 'cerulean_city', music: 'battle_trainer', townMusic: 'town_cerulean',
      waves: [W('oddish', 15, 4, 11), W('psyduck', 16, 16, 15), W('meowth', 17, 30, 15), W('oddish', 16, 90, 12), W('meowth', 17, 120, 13)],
    },
    {
      id: 'kanto_08_misty', num: 8, name: 'Cerulean Gym', leader: 'Misty', drops: D('mid', { water_stone: 3, ice_stone: 1 }), kind: 'gym', level: 21,
      background: 'cerulean_city', music: 'battle_gym', townMusic: 'town_cerulean',
      waves: [W('staryu', 18, 4, 8), W('staryu', 18, 35, 11), W('staryu', 19, 100, 9)],
      ace: { form: 'starmie', level: 21 }, item: 'water_stone',
    },
    {
      id: 'kanto_09_vermilion', num: 9, name: 'Vermilion City', place: 'S.S. Anne', drops: D('mid', { thunder_stone: 2, metal_coat: 1, water_stone: 1 }), kind: 'trainer', level: 22,
      background: 'vermilion_city', music: 'battle_trainer', townMusic: 'town_vermilion',
      waves: [W('tentacool', 20, 4, 11), W('machop', 21, 16, 15), W('growlithe', 22, 32, 17), W('tentacool', 21, 90, 11), W('machop', 22, 120, 15)],
    },
    {
      id: 'kanto_10_surge', num: 10, name: 'Vermilion Gym', leader: 'Lt. Surge', drops: D('mid', { thunder_stone: 3, metal_coat: 1 }), kind: 'gym', level: 24,
      background: 'vermilion_city', music: 'battle_gym', townMusic: 'town_vermilion',
      waves: [W('voltorb', 21, 4, 10), W('pikachu', 21, 16, 14), W('voltorb', 22, 80, 11)],
      ace: { form: 'raichu', level: 24 }, item: 'thunder_stone',
    },
    {
      id: 'kanto_11_lavender', num: 11, name: 'Lavender Town', place: 'Pokémon Tower', drops: D('late', { moon_stone: 2, ice_stone: 1 }), kind: 'wild', level: 26,
      background: 'lavender_town', music: 'battle_wild', townMusic: 'town_lavender',
      waves: [W('gastly', 24, 3, 11), W('haunter', 25, 24, 20), W('cubone', 25, 36, 17), W('gastly', 25, 110, 12), W('haunter', 26, 140, 18)],
    },
    {
      id: 'kanto_12_celadon', num: 12, name: 'Celadon City', place: 'Game Corner', drops: D('late', { fire_stone: 2, leaf_stone: 2, water_stone: 1, thunder_stone: 1 }), kind: 'trainer', level: 27,
      background: 'celadon_city', music: 'battle_trainer', townMusic: 'town_celadon',
      waves: [W('ekans', 25, 4, 12), W('rattata', 25, 14, 12), W('koffing', 26, 30, 24), W('ekans', 26, 100, 13), W('koffing', 27, 150, 26)],
      gift: 'eevee_water', item: 'fire_stone',
    },
    // ---- Phase 7: on the map, locked. `foes` + `ace` are the §4.11 plan (waves are written in Phase 7). ----
    { id: 'kanto_13_erika', num: 13, name: 'Celadon Gym', leader: 'Erika', drops: D('late', { leaf_stone: 3, moon_stone: 1 }), kind: 'gym', level: 29, locked: 'phase7',
      background: 'celadon_city', music: 'battle_gym', townMusic: 'town_celadon', foes: ['oddish', 'tangela'], ace: { form: 'vileplume', level: 29 } },
    { id: 'kanto_14_fuchsia', num: 14, name: 'Fuchsia City', place: 'Safari Zone', drops: D('late', { leaf_stone: 2, metal_coat: 1, black_augurite: 1 }), kind: 'wild', level: 33, locked: 'phase7',
      background: 'fuchsia_city', music: 'battle_wild', townMusic: 'town_fuchsia', foes: ['rhyhorn', 'venonat', 'pinsir', 'scyther'] },
    { id: 'kanto_15_koga', num: 15, name: 'Fuchsia Gym', leader: 'Koga', drops: D('late', { moon_stone: 2, thunder_stone: 1 }), kind: 'gym', level: 43, locked: 'phase7',
      background: 'fuchsia_city', music: 'battle_gym', townMusic: 'town_fuchsia', foes: ['koffing', 'gastly'], ace: { form: 'weezing', level: 43 } },
    { id: 'kanto_16_saffron', num: 16, name: 'Saffron City', place: 'Silph Co.', drops: D('late', { up_grade: 2, metal_coat: 1, thunder_stone: 1 }), kind: 'trainer', level: 38, locked: 'phase7',
      background: 'saffron_city', music: 'battle_trainer', townMusic: 'town_saffron', foes: ['arbok', 'weezing', 'golbat'], gift: 'lapras' },
    { id: 'kanto_17_sabrina', num: 17, name: 'Saffron Gym', leader: 'Sabrina', drops: D('late', { moon_stone: 2, dubious_disc: 1 }), kind: 'gym', level: 43, locked: 'phase7',
      background: 'saffron_city', music: 'battle_gym', townMusic: 'town_saffron', foes: ['kadabra', 'mr_mime', 'venomoth'], ace: { form: 'alakazam', level: 43 } },
    { id: 'kanto_18_cinnabar', num: 18, name: 'Cinnabar Island', place: 'Pokémon Mansion', drops: D('late', { fire_stone: 3, dubious_disc: 1 }), kind: 'wild', level: 42, locked: 'phase7',
      background: 'cinnabar_island', music: 'battle_wild', townMusic: 'town_cinnabar', foes: ['ponyta', 'growlithe', 'vulpix', 'koffing'] },
    { id: 'kanto_19_blaine', num: 19, name: 'Cinnabar Gym', leader: 'Blaine', drops: D('late', { fire_stone: 3 }), kind: 'gym', level: 47, locked: 'phase7',
      background: 'cinnabar_island', music: 'battle_gym', townMusic: 'town_cinnabar', foes: ['growlithe', 'rapidash'], ace: { form: 'arcanine', level: 47 } },
    { id: 'kanto_20_giovanni', num: 20, name: 'Viridian Gym', leader: 'Giovanni', drops: D('late', { black_augurite: 2, metal_coat: 1, moon_stone: 1 }), kind: 'gym', level: 50, locked: 'phase7',
      background: 'viridian_city', music: 'battle_gym', townMusic: 'town_viridian', foes: ['rhyhorn', 'marowak', 'dugtrio'], ace: { form: 'rhydon', level: 50 } },
    { id: 'kanto_21_lorelei', num: 21, name: 'Elite Four Lorelei', leader: 'Lorelei', drops: D('late', { ice_stone: 3, water_stone: 1 }), kind: 'e4', level: 56, locked: 'phase7',
      background: 'indigo_plateau', music: 'battle_elitefour', townMusic: 'town_indigo', foes: ['dewgong', 'cloyster'], ace: { form: 'lapras', level: 56 } },
    { id: 'kanto_22_bruno', num: 22, name: 'Elite Four Bruno', leader: 'Bruno', drops: D('late', { black_augurite: 2, metal_coat: 1 }), kind: 'e4', level: 58, locked: 'phase7',
      background: 'indigo_plateau', music: 'battle_elitefour', townMusic: 'town_indigo', foes: ['onix', 'hitmonlee', 'machoke'], ace: { form: 'machamp', level: 58 } },
    { id: 'kanto_23_agatha', num: 23, name: 'Elite Four Agatha', leader: 'Agatha', drops: D('late', { moon_stone: 2, dubious_disc: 1 }), kind: 'e4', level: 60, locked: 'phase7',
      background: 'indigo_plateau', music: 'battle_elitefour', townMusic: 'town_indigo', foes: ['haunter', 'golbat', 'arbok'], ace: { form: 'gengar', level: 60 } },
    { id: 'kanto_24_lance', num: 24, name: 'Elite Four Lance', leader: 'Lance', drops: D('late', { ice_stone: 2, thunder_stone: 1, water_stone: 1 }), kind: 'e4', level: 60, locked: 'phase7',
      background: 'indigo_plateau', music: 'battle_elitefour', townMusic: 'town_indigo', foes: ['gyarados', 'dragonair', 'aerodactyl'], ace: { form: 'dragonite', level: 60 } },
    { id: 'kanto_25_champion', num: 25, name: 'Champion', leader: 'Blue', drops: D('late', { fire_stone: 1, water_stone: 1, thunder_stone: 1, leaf_stone: 1, moon_stone: 1, ice_stone: 1 }), kind: 'champion', level: 60, locked: 'phase7',
      background: 'indigo_plateau', music: 'battle_champion', townMusic: 'town_indigo',
      foes: ['pidgeot', 'alakazam', 'rhydon', 'gyarados', 'arcanine'], ace: { form: 'charizard', level: 60 }, gift: 'mewtwo', regionFinal: true },
    {
      // Hidden dev stage (long-press a logo 2 s, or ?dev): exercises the type chart.
      id: 'dev_types', num: 0, name: 'Type Test', kind: 'trainer', level: 3, dev: true,
      background: 'pallet_town', music: 'battle_trainer', townMusic: 'route',
      waves: [W('geodude', 3, 2, 9), W('pidgey', 3, 6, 11), W('charmander', 3, 4, 10)], // Electric->Rock/Ground 0x, ->Flying 2x; Water->Fire 2x
    },
  ];
  BM.stageById = (id) => BM.STAGES.find((s) => s.id === id);
  BM.KANTO_STAGES = BM.STAGES.filter((s) => !s.dev); // campaign order, 25
  BM.isPlayable = (st) => !!st && !st.locked && Array.isArray(st.waves);

  // Rewards (stored in Phase 3, spent from Phase 4/5). §4.5 tickets: first clear location 10 · gym 20 · E4 25 ·
  // Champion 50 · any replay win 2. §4.3 team XP: every line that BATTLED gets 4 × level² (first) / 2 × level² (replay).
  const FIRST_TICKETS = { wild: 10, trainer: 10, gym: 20, e4: 25, champion: 50 };
  BM.stageRewards = function (st, first) {
    return {
      first,
      tickets: first ? FIRST_TICKETS[st.kind] || 10 : 2,
      xp: (first ? 4 : 2) * st.level * st.level,
      gift: first && st.gift ? st.gift : null,
      item: first && st.item ? st.item : null,
    };
  };
  // Rolls a win's drops from the stage table (`rnd` = seeded RNG in tests). Returns [{ item, n }] (merged by item).
  const GOOD = (d) => d.item !== 'tickets';
  BM.rollDrops = function (st, first, rnd = Math.random) {
    const table = st.drops || [];
    if (!table.length) return [];
    const pick = (list) => { const tot = list.reduce((a, d) => a + d.w, 0); let x = rnd() * tot; for (const d of list) { if ((x -= d.w) < 0) return d; } return list[list.length - 1]; };
    const got = [];
    for (let i = 0; i < (first ? 2 : 1); i++) got.push(pick(table));
    if (first && !got.some(GOOD)) got.push(pick(table.filter(GOOD))); // first clear: at least one real item
    const out = [];
    for (const d of got) { const o = out.find((x) => x.item === d.item); if (o) o.n += d.n; else out.push({ item: d.item, n: d.n }); }
    return out;
  };
  // Dowsing Machine (battle item): a WIN with it armed guarantees the stage's RAREST drop = the real item with the lowest
  // weight in the table — not tickets, and not another Dowsing Machine (that would only hand the machine back).
  BM.rarestDrop = function (st) {
    const real = (st.drops || []).filter((d) => d.item !== 'tickets' && d.item !== 'dowsing_machine');
    return real.length ? real.reduce((a, d) => (d.w < a.w ? d : a)).item : null;
  };
  // Distinct things a stage can drop, for the pre-battle "May find" row.
  BM.dropPreview = (st) => [...new Set((st.drops || []).map((d) => d.item))];
  // Enemy preview for the pre-battle screen: each wave form once (lowest–highest level), the ace last.
  BM.stagePreview = function (st) {
    const out = [], by = {};
    for (const w of st.waves || st.foes && st.foes.map((f) => ({ form: f })) || []) {
      const e = by[w.form] || (by[w.form] = { form: w.form, min: w.level, max: w.level });
      if (!out.includes(e)) out.push(e);
      if (w.level != null) { e.min = Math.min(e.min ?? w.level, w.level); e.max = Math.max(e.max ?? w.level, w.level); }
    }
    if (st.ace) out.push({ form: st.ace.form, min: st.ace.level, max: st.ace.level, ace: true });
    return out;
  };
})();
