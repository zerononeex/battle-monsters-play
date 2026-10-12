// Stage data — the 25 Kanto stages in campaign order (BUILD_PLAN §4.11). Stages 1–12 from Phase 3; 13–25 (Erika onward:
// gyms, Elite Four, Champion) from Phase 7.
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
  BM.waveRow = W; BM.dropTable = D; // later regions' stage files build with the same helpers (johto_stages.js)
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
      burst: { pool: ['caterpie', 'pikachu'] }, // Phase 7.5: the EE1 evolutions stay in the trickle, not the bursts / wall-breaker
      waves: [W('caterpie', 6, 3, 8), W('pikachu', 7, 18, 16), W('caterpie', 7, 60, 10), W('pikachu', 7, 110, 14), W('metapod', 6, 45, 32), W('butterfree', 7, 100, 45)],
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
      burst: { pool: ['oddish', 'psyduck', 'meowth'] }, // Phase 7.5: the EE1 evolutions stay in the trickle, not the bursts / wall-breaker
      waves: [W('oddish', 15, 4, 11), W('psyduck', 16, 16, 15), W('meowth', 17, 30, 15), W('oddish', 16, 90, 12), W('meowth', 17, 120, 13), W('pidgeotto', 16, 60, 32)],
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
      burst: { pool: ['tentacool', 'machop', 'growlithe'] }, // Phase 7.5: the EE1 evolutions stay in the trickle, not the bursts / wall-breaker
      waves: [W('tentacool', 20, 4, 11), W('machop', 21, 16, 15), W('growlithe', 22, 32, 17), W('tentacool', 21, 90, 11), W('machop', 22, 120, 15), W('raticate', 20, 60, 30), W('tentacruel', 20, 95, 40)],
    },
    {
      id: 'kanto_10_surge', num: 10, name: 'Vermilion Gym', leader: 'Lt. Surge', drops: D('mid', { thunder_stone: 3, metal_coat: 1 }), kind: 'gym', level: 24,
      background: 'vermilion_city', music: 'battle_gym', townMusic: 'town_vermilion',
      waves: [W('voltorb', 21, 4, 10), W('pikachu', 21, 16, 14), W('voltorb', 22, 80, 11), W('electrode', 23, 45, 24)],
      ace: { form: 'raichu', level: 24 }, item: 'thunder_stone',
    },
    {
      id: 'kanto_11_lavender', num: 11, name: 'Lavender Town', place: 'Pokémon Tower', drops: D('late', { moon_stone: 2, ice_stone: 1 }), kind: 'wild', level: 26,
      background: 'lavender_town', music: 'battle_wild', townMusic: 'town_lavender',
      waves: [W('gastly', 24, 3, 11), W('haunter', 25, 24, 20), W('cubone', 25, 36, 17), W('gastly', 25, 110, 12), W('haunter', 26, 140, 18), W('graveler', 25, 50, 26)],
    },
    {
      id: 'kanto_12_celadon', num: 12, name: 'Celadon City', place: 'Game Corner', drops: D('late', { fire_stone: 2, leaf_stone: 2, water_stone: 1, thunder_stone: 1 }), kind: 'trainer', level: 27,
      background: 'celadon_city', music: 'battle_trainer', townMusic: 'town_celadon',
      waves: [W('ekans', 25, 4, 12), W('rattata', 25, 14, 12), W('koffing', 26, 30, 24), W('ekans', 26, 100, 13), W('koffing', 27, 150, 26)],
      gift: 'eevee_water', item: 'fire_stone',
    },
    // ---- Phase 7: the Kanto endgame (stages 13–25). Waves = the leader's real team + type (§4.11); every gym ace from 13 on,
    // every Elite Four ace and the Champion's ace is a GIANT boss (§4.4 ×2 size, HP ×6, damage ×2) with a SIGNATURE move
    // (`sig`: big AoE + reliable status — K3/K4). `bgArt` = the gym / Elite Four interior art key (ASSET_PROMPTS #262–#271),
    // used once DONE; until then the town / placeholder background.
    { id: 'kanto_13_erika', num: 13, name: 'Celadon Gym', leader: 'Erika', drops: D('late', { leaf_stone: 3, moon_stone: 1 }), kind: 'gym', level: 29, ebBend: 0.8,
      background: 'celadon_city', bgArt: 'gym_erika', music: 'battle_gym', townMusic: 'town_celadon',
      waves: [W('oddish', 24, 4, 12), W('tangela', 25, 20, 19), W('oddish', 25, 50, 14), W('tangela', 26, 110, 18), W('gloom', 26, 35, 18)],
      // BR-081 (Phase 8 step 4): no 75% counter-burst here — it landed just before the 70% ace trigger and froze the first push at
      // ~73% against a Grass/Poison wall that resists most decks; the giant then met a stalled clump. 24-seed sim: careful style
      // 13/24 → 23/24 (spender / eager ~9/24 either way — their type-blind decks, as at cap 15). Waves only; prices untouched.
      burst: { thresholds: [0.5, 0.25] },
      ace: { form: 'vileplume', level: 29, giant: true, sig: { move: 'Sleep Powder', aoe: 90, status: 'sleep', reach: 230, every: 14 } } /* the first giant: a gentler signature */ },
    { id: 'kanto_14_fuchsia', num: 14, name: 'Fuchsia City', place: 'Safari Zone', drops: D('late', { leaf_stone: 2, metal_coat: 1, black_augurite: 1 }), kind: 'wild', level: 33,
      background: 'fuchsia_city', music: 'battle_wild', townMusic: 'town_fuchsia',
      waves: [W('rhyhorn', 30, 4, 12), W('venonat', 31, 10, 11), W('pinsir', 32, 30, 18), W('scyther', 33, 50, 18), W('venonat', 32, 100, 11), W('tangrowth', 33, 70, 30)] },
    { id: 'kanto_15_koga', num: 15, name: 'Fuchsia Gym', leader: 'Koga', drops: D('late', { moon_stone: 2, thunder_stone: 1 }), kind: 'gym', level: 43,
      background: 'fuchsia_city', bgArt: 'gym_koga', music: 'battle_gym', townMusic: 'town_fuchsia',
      waves: [W('koffing', 37, 3, 10), W('gastly', 38, 12, 12), W('koffing', 39, 40, 11), W('haunter', 39, 80, 14)],
      ace: { form: 'weezing', level: 43, giant: true, sig: { move: 'Sludge Bomb', aoe: 130, status: 'poison', reach: 220 } } },
    { id: 'kanto_16_saffron', num: 16, name: 'Saffron City', place: 'Silph Co.', drops: D('late', { up_grade: 2, metal_coat: 1, thunder_stone: 1 }), kind: 'trainer', level: 38,
      background: 'saffron_city', music: 'battle_trainer', townMusic: 'town_saffron', gift: 'lapras',
      waves: [W('arbok', 35, 4, 12), W('golbat', 36, 10, 11), W('weezing', 37, 30, 20), W('arbok', 37, 70, 12), W('golbat', 38, 110, 11)] },
    { id: 'kanto_17_sabrina', num: 17, name: 'Saffron Gym', leader: 'Sabrina', drops: D('late', { moon_stone: 2, dubious_disc: 1 }), kind: 'gym', level: 43,
      background: 'saffron_city', bgArt: 'gym_sabrina', music: 'battle_gym', townMusic: 'town_saffron',
      waves: [W('kadabra', 36, 6, 14), W('mr_mime', 36, 22, 18), W('venomoth', 37, 44, 19), W('kadabra', 37, 95, 15)],
      ace: { form: 'alakazam', level: 43, giant: true, sig: { move: 'Hypnosis', aoe: 120, status: 'sleep', reach: 270 } } },
    { id: 'kanto_18_cinnabar', num: 18, name: 'Cinnabar Island', place: 'Pokémon Mansion', drops: D('late', { fire_stone: 3, dubious_disc: 1 }), kind: 'wild', level: 42,
      background: 'cinnabar_island', music: 'battle_wild', townMusic: 'town_cinnabar',
      waves: [W('ponyta', 40, 3, 10), W('growlithe', 41, 12, 13), W('vulpix', 41, 24, 15), W('koffing', 42, 40, 18), W('ponyta', 42, 100, 10), W('seel', 40, 30, 18)] }, // III1a: Seel from the Seafoam waters next door
    { id: 'kanto_19_blaine', num: 19, name: 'Cinnabar Gym', leader: 'Blaine', drops: D('late', { fire_stone: 3 }), kind: 'gym', level: 47,
      background: 'cinnabar_island', bgArt: 'gym_blaine', music: 'battle_gym', townMusic: 'town_cinnabar',
      waves: [W('growlithe', 42, 3, 11), W('rapidash', 44, 16, 16), W('ponyta', 43, 40, 12), W('rapidash', 45, 100, 15)],
      ace: { form: 'arcanine', level: 47, giant: true, sig: { move: 'Flamethrower', aoe: 150, reach: 200 } } },
    { id: 'kanto_20_giovanni', num: 20, name: 'Viridian Gym', leader: 'Giovanni', drops: D('late', { black_augurite: 2, metal_coat: 1, moon_stone: 1 }), kind: 'gym', level: 50,
      background: 'viridian_city', bgArt: 'gym_giovanni', music: 'battle_gym', townMusic: 'town_viridian',
      waves: [W('rhyhorn', 45, 4, 12), W('diglett', 44, 7, 15), W('dugtrio', 46, 12, 13), W('marowak', 46, 26, 16), W('rhyhorn', 47, 80, 12), W('golem', 47, 50, 24), W('rhyperior', 49, 80, 34)],
      ace: { form: 'rhydon', level: 50, giant: true, sig: { move: 'Earthquake', aoe: 170 } } },
    { id: 'kanto_21_lorelei', num: 21, name: 'Elite Four Lorelei', leader: 'Lorelei', drops: D('late', { ice_stone: 3, water_stone: 1 }), kind: 'e4', level: 56,
      background: 'indigo_plateau', bgArt: 'e4_hall', music: 'battle_elitefour', townMusic: 'town_indigo',
      waves: [W('seel', 50, 4, 14), W('shellder', 50, 12, 18), W('dewgong', 52, 8, 13), W('cloyster', 53, 20, 15), W('dewgong', 54, 60, 13), W('cloyster', 54, 110, 15)],
      ace: { form: 'lapras', level: 56, giant: true, sig: { move: 'Blizzard', aoe: 150, status: 'freeze', reach: 260 } } },
    { id: 'kanto_22_bruno', num: 22, name: 'Elite Four Bruno', leader: 'Bruno', drops: D('late', { black_augurite: 2, metal_coat: 1 }), kind: 'e4', level: 58,
      background: 'indigo_plateau', bgArt: 'e4_hall', music: 'battle_elitefour', townMusic: 'town_indigo',
      waves: [W('onix', 51, 8, 13), W('hitmonlee', 53, 16, 14), W('machoke', 54, 28, 15), W('onix', 54, 75, 14), W('hitmonlee', 55, 115, 14), W('hitmonchan', 54, 30, 16), W('steelix', 55, 90, 30)],
      ace: { form: 'machamp', level: 58, giant: true, sig: { move: 'Dynamic Punch', aoe: 100, status: 'paralyze' } } },
    { id: 'kanto_23_agatha', num: 23, name: 'Elite Four Agatha', leader: 'Agatha', drops: D('late', { moon_stone: 2, dubious_disc: 1 }), kind: 'e4', level: 60,
      background: 'indigo_plateau', bgArt: 'e4_hall', music: 'battle_elitefour', townMusic: 'town_indigo',
      waves: [W('haunter', 54, 8, 13), W('golbat', 55, 16, 13), W('arbok', 56, 30, 15), W('haunter', 57, 75, 13), W('golbat', 57, 115, 13), W('crobat', 57, 60, 22)],
      ace: { form: 'gengar', level: 60, giant: true, sig: { move: 'Hypnosis', aoe: 150, status: 'sleep', reach: 240 } } },
    { id: 'kanto_24_lance', num: 24, name: 'Elite Four Lance', leader: 'Lance', drops: D('late', { ice_stone: 2, thunder_stone: 1, water_stone: 1 }), kind: 'e4', level: 60,
      background: 'indigo_plateau', bgArt: 'e4_hall', music: 'battle_elitefour', townMusic: 'town_indigo',
      waves: [W('dragonair', 50, 8, 15), W('gyarados', 50, 40, 20), W('aerodactyl', 51, 60, 20), W('dragonair', 52, 100, 16)],
      ace: { form: 'dragonite', level: 60, giant: true, sig: { move: 'Outrage + Thunder Wave', aoe: 140, status: 'paralyze', reach: 120 } } },
    // The Champion (Blue): his real team, Charizard as the giant ace. First clear = Mewtwo (rewardOnly, §4.8) + the region's
    // Master Ball (§4 economy: 1 per region fully beaten) + the ENDING screen (`credits`).
    { id: 'kanto_25_champion', num: 25, name: 'Champion', leader: 'Blue', drops: D('late', { fire_stone: 1, water_stone: 1, thunder_stone: 1, leaf_stone: 1, moon_stone: 1, ice_stone: 1 }), kind: 'champion', level: 60,
      background: 'indigo_plateau', bgArt: 'champion_room', music: 'battle_champion', townMusic: 'town_indigo',
      waves: [W('pidgeot', 52, 8, 15), W('alakazam', 52, 22, 20), W('arcanine', 53, 40, 20), W('rhydon', 53, 60, 22), W('gyarados', 53, 90, 22)],
      ace: { form: 'charizard', level: 60, giant: true, sig: { move: 'Blast Burn', aoe: 180, reach: 260 } /* Phase 8: no freeze — a Fire move never freezes (canon: no status; fire thaws) */ }, gift: 'mewtwo', regionFinal: true, region: 'kanto' },
    {
      // Hidden dev stage (long-press a logo 2 s, or ?dev): exercises the type chart.
      id: 'dev_types', num: 0, name: 'Type Test', kind: 'trainer', level: 3, dev: true,
      background: 'pallet_town', music: 'battle_trainer', townMusic: 'route',
      waves: [W('geodude', 3, 2, 9), W('pidgey', 3, 6, 11), W('charmander', 3, 4, 10)], // Electric->Rock/Ground 0x, ->Flying 2x; Water->Fire 2x
    },
  ];
  // J2 ENEMY BASE HP (corrected, user 2026-10-11): a raw-number curve, DECOUPLED from the player base (which keeps the
  // forgiving 1000 + 300 × level, BM.C.baseHP). Anchors by campaign stage number, geometric between them; gym stages
  // ×1.25, Elite Four + Champion ×1.4. `st.ebBend` (±20%) is the sim's per-stage bend; `st.enemyBaseHP` overrides all
  // (Bonus Zone stages pass `curveAt` = the campaign stage their band matches). Final table: docs/BUILD_PLAN.md §4.4.
  BM.EB_ANCHORS = [[1, 800], [5, 3000], [10, 10000], [15, 28000], [20, 60000], [25, 120000]];
  BM.EB_KIND = { gym: 1.25, e4: 1.4, champion: 1.4 };
  // The anchors NAME their stages (5 = Brock, 10 = Lt. Surge, 15 = Koga, 20 = Giovanni, 25 = the Champion), so the curve
  // passes exactly through them: its plain-stage value at an anchor is anchor ÷ that stage's premium, and every other gym /
  // Elite Four stage gets its premium on top of the geometric curve between.
  BM.enemyBaseCurve = function (n) {
    const A = BM.EB_ANCHORS.map(([x, y]) => { const st = BM.STAGES.find((s) => s.num === x && !s.dev && !s.bonus); return [x, y / ((st && BM.EB_KIND[st.kind]) || 1)]; });
    if (n <= A[0][0]) return A[0][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; return y0 * Math.pow(y1 / y0, (n - x0) / (x1 - x0)); }
    return A[A.length - 1][1];
  };
  // J2 EDGES TUNED (Phase 8 step 4, the user's ruling: tune the edges INTO the 15–40 s band with waves / base HP only — never
  // prices or generator costs). Measured with `phase7 ttkall` (every stage, stage-appropriate team, undefended base): the curve
  // left stages 1–4 at 9.7–12.3 s and 21–25 at 40.0–48.7 s. These stages get an explicit base HP aimed at ~15–17 s early and
  // ~36–39.5 s late; HP still rises stage by stage and the Champion stays above Lance. Every other stage stays on the curve.
  BM.EB_TUNED = {
    kanto_01_pallet: 1550, kanto_02_viridian: 1750, kanto_03_forest: 1850, kanto_04_pewter: 2350,
    kanto_21_lorelei: 66000, kanto_22_bruno: 71000, kanto_23_agatha: 74000, kanto_24_lance: 75500, kanto_25_champion: 76500,
  };
  for (const st of BM.STAGES) if (BM.EB_TUNED[st.id]) st.enemyBaseHP = BM.EB_TUNED[st.id];
  BM.enemyBaseHP = function (st) {
    if (st.enemyBaseHP) return st.enemyBaseHP;
    const n = st.curveAt || st.num || 1;
    return Math.round(BM.enemyBaseCurve(n) * (BM.EB_KIND[st.kind] || 1) * (st.ebBend || 1) / 50) * 50;
  };
  // K2 WAVE CADENCE (user 2026-10-11, all stages): (1) the trickle = `waves`; (2) timed BURST groups — 3–5 enemies at once
  // every ~20–30 s; (3) HP-THRESHOLD counter-bursts when the enemy base drops below 75% / 50% / 25%, each with one strong
  // WALL-BREAKER. Built from the stage's theme (its wave forms) unless `burst` overrides: { pool, carriers, breaker,
  // first, every: [lo, hi], size: [lo, hi] }. `carriers` = AoE / status units mixed into later bursts to break up a stack
  // camping the enemy base (one per burst from stage 9 on).
  // Tiers (kid-fair ramp): stages 1–4 small late bursts, 5–10 medium, 11+ the full 3–5 (bonus stages use `curveAt`).
  // The trickle's intervals stretch ×trickle while bursts are on (the pressure comes in waves instead of a steady stream).
  // OOO1 SPAWN DENSITY (user playtest 2026-10-11, Johto prompt Step 0d — AMENDS K2, does not replace it): a battle should look
  // like a battle. (1) PACKS are the default: every trickle release is a small pack — 2 early, 2–3 mid-campaign, 3–4 late — of
  // FODDER / MEDIUM units only (large units and aces still come solo, a large one sometimes in a pair late on; they are events).
  // Pack extras come in 1–2 levels BELOW the wave (the power guard). (2) Bursts every ~15–22 s (was 22–30), size 4–6 (was 3–4);
  // counter-bursts 75/50/25% stay, one bigger. (3) The trickle stretch is now counted PER BODY (battle.js packMean: a pack of ~2.5 waits ~2.5× as long) and shrinks
  // ×1.5–2.1 → ×1.4–1.6 (E4 ×4 → ×2.6) — the POWER GUARD bound it there: the combined sim measured ×1.0–1.2 at ~1.6× K2 pressure
  // with Cerulean / Vermilion unwinnable; at these values pressure is ×1.38 of K2 on average (guard 1.25–1.40).
  // Bosses, aces and base HP are unchanged. Tuned by the combined 0c+0d+0e sim (phase7 sim: field presence, AP saturation,
  // deathball time per stage — CURRENT_STATE).
  BM.CADENCE = { every: [15, 22], thresholds: [0.75, 0.5, 0.25], breakerLv: 2, trickle: 1.0, burstLv: -3, packLv: 1,
    tier: (n) => (n <= 4 ? { first: 30, size: [3, 4], counterSize: 3, breakerHp: 1.5, trickle: 1.4, pack: [2, 2], packLv: 1 }
      : n <= 12 ? { first: 28, size: [4, 5], counterSize: 4, breakerHp: 1.8, trickle: 1.4, pack: [2, 3], packLv: 1 }
      : n <= 18 ? { first: 30, size: [4, 5], counterSize: 4, breakerHp: 2, trickle: 1.5, burstLv: -5, pack: [2, 3], packLv: 2 }
      : { first: 32, size: [5, 6], counterSize: 4, breakerHp: 2.5, trickle: 1.6, burstLv: -5, pack: [3, 4], packLv: 2 }) };
  // AoE / status carriers mixed into the bursts from stage 9 on (themed: the stage's own poisoners, sleepers, freezers…)
  BM.STAGE_CARRIERS = {
    kanto_09_vermilion: ['tentacool'], kanto_10_surge: ['voltorb'], kanto_11_lavender: ['haunter'], kanto_12_celadon: ['koffing'],
    kanto_13_erika: ['oddish'], kanto_14_fuchsia: ['venonat'], kanto_15_koga: ['koffing'], kanto_16_saffron: ['arbok', 'koffing'],
    kanto_17_sabrina: ['venonat'], kanto_18_cinnabar: ['koffing', 'ninetales'], kanto_19_blaine: ['ninetales'], kanto_20_giovanni: ['rhydon'],
    kanto_21_lorelei: ['dewgong'], kanto_22_bruno: ['onix'], kanto_23_agatha: ['haunter', 'arbok'], kanto_24_lance: ['gyarados'],
    kanto_25_champion: ['gyarados', 'alakazam'],
  };
  // Elite Four / Champion stages: their fodder are fully evolved Lv 51–60 Pokémon, as strong as yours — fewer of them
  BM.CADENCE.e4 = { trickle: 2.6, size: [3, 4], counterSize: 3, pack: [2, 3] }; // OOO1: ×4 → ×2.6 per body, still thinner than a gym
  BM.waveCadence = function (st) {
    const K = BM.CADENCE, o = st.burst || {}, forms = [...new Set((st.waves || []).map((w) => w.form))];
    const T0 = K.tier(st.curveAt || st.num || 1), lv = st.level + (o.burstLv != null ? o.burstLv : T0.burstLv != null ? T0.burstLv : K.burstLv), pool = (o.pool || forms).map((f) => (typeof f === 'string' ? { form: f, level: lv } : f));
    const strongest = () => { let best = null, bv = -1; for (const p of pool) { const f = BM.FORMS[p.form], v = f ? f.bst + f.baseHP : 0; if (v > bv) { bv = v; best = p.form; } } return best; };
    const T = { ...K.tier(st.curveAt || st.num || 1), ...(['e4', 'champion'].includes(st.kind) ? K.e4 : {}) };
    return {
      trickle: o.trickle || T.trickle || K.trickle, first: o.first != null ? o.first : T.first, every: o.every || K.every, size: o.size || T.size, pool, counterSize: o.counterSize || T.counterSize, breakerHp: o.breakerHp || T.breakerHp,
      pack: o.pack || T.pack || [1, 1], packLv: o.packLv != null ? o.packLv : T.packLv != null ? T.packLv : K.packLv, // OOO1
      carriers: (o.carriers || BM.STAGE_CARRIERS[st.id] || []).map((f) => (typeof f === 'string' ? { form: f, level: lv } : f)),
      breaker: o.breaker ? (typeof o.breaker === 'string' ? { form: o.breaker, level: st.level + K.breakerLv } : o.breaker) : { form: strongest(), level: st.level + K.breakerLv },
      thresholds: o.thresholds || K.thresholds,
    };
  };
  // Y1 GATES (user 2026-10-11, Phase 7.5): each stage's STRONGEST enemy types debut through ONE gate — `time` (they start
  // spawning `at` s in) or `hp` (the moment the enemy base drops to 90%, with an instant reinforcement of each). Builder's pick
  // per stage by balance: early / route stages use a 30–45 s timer; gyms, the Elite Four and the Champion use the 90% HP
  // gate (their leader's heavies arrive as you push). Recorded here next to the waves; applied by battle.js (S.gate).
  BM.STAGE_GATES = {
    kanto_01_pallet: { by: 'time', at: 30, forms: ['pidgey'] },
    kanto_02_viridian: { by: 'time', at: 30, forms: ['pidgey'] },
    kanto_03_forest: { by: 'time', at: 35, forms: ['pikachu', 'butterfree'] },
    kanto_04_pewter: { by: 'time', at: 30, forms: ['geodude'] },
    kanto_05_brock: { by: 'hp', at: 0.9, forms: ['onix'] },
    kanto_06_mtmoon: { by: 'time', at: 30, forms: ['clefairy'] },
    kanto_07_cerulean: { by: 'time', at: 35, forms: ['psyduck', 'pidgeotto'] },
    kanto_08_misty: { by: 'hp', at: 0.9, forms: ['starmie'] },
    kanto_09_vermilion: { by: 'time', at: 40, forms: ['tentacruel', 'raticate', 'growlithe'] },
    kanto_10_surge: { by: 'hp', at: 0.9, forms: ['electrode', 'raichu'] },
    kanto_11_lavender: { by: 'time', at: 40, forms: ['haunter', 'graveler'] },
    kanto_12_celadon: { by: 'time', at: 30, forms: ['koffing'] },
    kanto_13_erika: { by: 'hp', at: 0.9, forms: ['tangela', 'gloom', 'vileplume'] },
    kanto_14_fuchsia: { by: 'time', at: 40, forms: ['tangrowth', 'scyther', 'pinsir'] },
    kanto_15_koga: { by: 'hp', at: 0.9, forms: ['haunter', 'weezing'] },
    kanto_16_saffron: { by: 'time', at: 35, forms: ['weezing'] },
    kanto_17_sabrina: { by: 'hp', at: 0.9, forms: ['venomoth', 'mr_mime', 'alakazam'] },
    kanto_18_cinnabar: { by: 'time', at: 30, forms: ['ponyta'] },
    kanto_19_blaine: { by: 'hp', at: 0.9, forms: ['rapidash', 'arcanine'] },
    kanto_20_giovanni: { by: 'hp', at: 0.9, forms: ['rhyperior', 'golem', 'rhydon'] },
    kanto_21_lorelei: { by: 'hp', at: 0.9, forms: ['cloyster', 'lapras'] },
    kanto_22_bruno: { by: 'hp', at: 0.9, forms: ['steelix', 'hitmonchan', 'machamp'] },
    kanto_23_agatha: { by: 'hp', at: 0.9, forms: ['crobat', 'gengar'] },
    kanto_24_lance: { by: 'hp', at: 0.9, forms: ['gyarados', 'aerodactyl', 'dragonite'] },
    kanto_25_champion: { by: 'hp', at: 0.9, forms: ['arcanine', 'gyarados', 'rhydon', 'charizard'] },
  };
  for (const st of BM.STAGES) if (BM.STAGE_GATES[st.id]) st.gate = BM.STAGE_GATES[st.id];
  // Z1 ENEMY BASES (user, Phase 7.5): `baseArt` = assets/bases/<key>.png (ASSET_PROMPTS #318–#327). Gyms use their gym's base,
  // the Elite Four share one, the Champion has the red-and-gold one; wild / trainer stages keep the den. Visual only — the
  // den shows until each file lands (render.js falls back), footprint, anchor and HP unchanged.
  BM.STAGE_BASES = { kanto_05_brock: 'gym_brock', kanto_08_misty: 'gym_misty', kanto_10_surge: 'gym_surge', kanto_13_erika: 'gym_erika',
    kanto_15_koga: 'gym_koga', kanto_17_sabrina: 'gym_sabrina', kanto_19_blaine: 'gym_blaine', kanto_20_giovanni: 'gym_giovanni',
    kanto_21_lorelei: 'e4', kanto_22_bruno: 'e4', kanto_23_agatha: 'e4', kanto_24_lance: 'e4', kanto_25_champion: 'champion' };
  for (const st of BM.STAGES) if (BM.STAGE_BASES[st.id]) st.baseArt = BM.STAGE_BASES[st.id];
  BM.stageById = (id) => BM.STAGES.find((s) => s.id === id);
  BM.KANTO_STAGES = BM.STAGES.filter((s) => !s.dev); // campaign order, 25
  for (const st of BM.KANTO_STAGES) st.region = st.region || 'kanto';
  BM.isPlayable = (st) => !!st && !st.locked && Array.isArray(st.waves);

  // Rewards (stored in Phase 3, spent from Phase 4/5). §4.5 tickets: first clear location 10 · gym 20 · E4 25 ·
  // Champion 50 · any replay win 2. §4.3 team XP: every line that BATTLED gets 2 × level² (first) / 1 × level² (replay).
  // Johto fix batch 1 step 3 (user 2026-10-12): halved from 4× / 2× — the party should not power-level passively; XP mostly
  // arrives as the guaranteed win candies (now 2 per win, below) that the player aims at ONE chosen Pokémon. Loss XP (M1) is a %
  // of this, so it halves with it; Prism Tower stages keep their own bonusXp.
  const FIRST_TICKETS = { wild: 10, trainer: 10, gym: 20, e4: 25, champion: 50 };
  BM.stageRewards = function (st, first) {
    // BONUS ZONE stages (data/bonus.js): the §4.5 grind ticket (1 per win), the tier's bonus team XP (XP stages) or 2 × L²
    // (treasure stages), the XP stage's candy every win, and a treasure stage's HEADLINE item guaranteed on its first clear
    if (st.bonus) return { first, tickets: 1, xp: st.bonusXp || 2 * st.level * st.level, gift: null,
      item: first && st.headline ? st.headline : null, candy: st.candy || null };
    return {
      first,
      tickets: first ? FIRST_TICKETS[st.kind] || 10 : 2,
      xp: (first ? 2 : 1) * st.level * st.level,
      gift: first && st.gift ? st.gift : null,
      item: first && st.item ? st.item : null,
      ...(first && st.prize ? { prize: st.prize } : {}), // Johto: a capstone's extra first-clear items { itemId: n } (Mt. Silver)
    };
  };
  // Rolls a win's drops from the stage table (`rnd` = seeded RNG in tests). Returns [{ item, n }] (merged by item).
  const GOOD = (d) => d.item !== 'tickets';
  // Johto: a drop row may be era-gated — `needs: 'johto'` (Sun Stone in the Tower: the profile has reached Johto) or `needs: 'mega'`
  // (Mega Stones: Mega Evolution unlocked). Gated rows never roll without a profile that meets them (they are not in the table).
  BM.dropOk = (d, p) => !d.needs || (d.needs === 'mega' ? !!(BM.megaUnlocked && BM.megaUnlocked(p)) : BM.regionReached(d.needs, p));
  BM.dropsFor = (st, p) => (st.drops || []).filter((d) => BM.dropOk(d, p));
  BM.rollDrops = function (st, first, rnd = Math.random, p = null) {
    const table = BM.dropsFor(st, p);
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
  BM.rarestDrop = function (st, p = null) {
    const real = BM.dropsFor(st, p).filter((d) => d.item !== 'tickets' && d.item !== 'dowsing_machine');
    return real.length ? real.reduce((a, d) => (d.w < a.w ? d : a)).item : null;
  };
  // T1 GUARANTEED XP CANDY (user, Phase 7.5): EVERY stage win — repeat wins included, challenge auto-clears too — adds one XP
  // candy ON TOP of the drop roll, sized by progress (campaign stage number; Tower treasure vaults use their `curveAt` band):
  // early S · mid S/M · late M with L in the mix. Catch-up intent: a handful of wins' candy lifts a fresh Lv 1 pull near the
  // team mid-game (5 mid wins ≈ 8,750 XP ≈ Lv 20). The Tower's XP floors keep their own (bigger) candy and stay the richest.
  BM.WIN_CANDY = [
    { upTo: 8, table: [['xp_candy_s', 1]] },
    { upTo: 16, table: [['xp_candy_s', 0.5], ['xp_candy_m', 0.5]] },
    { upTo: 99, table: [['xp_candy_m', 0.75], ['xp_candy_l', 0.25]] },
  ];
  // Johto fix batch 1 step 3 (user 2026-10-12): 2 guaranteed candies per win (was 1), each rolled independently on the band table.
  BM.WIN_CANDY_N = 2;
  BM.winCandyBand = (st) => BM.WIN_CANDY.find((b) => (st.curveAt || st.num || 1) <= b.upTo);
  BM.winCandy = function (st, rnd = Math.random) {
    if (!st || st.dev || st.bonus === 'xp') return null; // XP floors already pay their tier's candy every win
    const t = BM.winCandyBand(st).table; let x = rnd();
    for (const [id, w] of t) { if ((x -= w) < 0) return id; }
    return t[t.length - 1][0];
  };
  BM.winCandies = (st, rnd = Math.random) => { const out = []; for (let i = 0; i < BM.WIN_CANDY_N; i++) { const c = BM.winCandy(st, rnd); if (c) out.push(c); } return out; };
  // Distinct things a stage can drop, for the pre-battle "May find" row.
  BM.dropPreview = (st, p = null) => [...new Set(BM.dropsFor(st, p).map((d) => d.item))];
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
