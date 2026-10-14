// JOHTO STAGES (Johto prompt v9 Step 4) — the 25-node Johto journey, after Kanto's pattern (stages.js explains every field).
// New Bark → Cherrygrove → Routes 30/31 → Violet (Sprout Tower) → Falkner → Union Cave → Azalea (Slowpoke Well) → Bugsy →
// Ilex Forest → Goldenrod → Whitney → National Park → Ecruteak (Burned Tower) → Morty → Olivine (Lighthouse) → Jasmine →
// Cianwood (Chuck) → Lake of Rage (the red Gyarados) → Pryce → Ice Path → Clair → Victory Road → the Elite Four (Will · Koga ·
// Bruno · Karen, ONE node — the prep queue's reading, one background per node) → the Champion (Lance: first clear = Lugia + a
// Master Ball + Mega Evolution unlocked) → Mt. Silver (Red, the capstone: first clear = a Master Ball + XP Candy L ×3).
//   Levels 50 → 65: a Kanto-cleared team (Lv ~55–60, the cap now 65) progresses; Red tests Lv 65.
//   Waves = real Pokémon of the location / the leader's real team + type (the standing enemy rule); Y1 gates hold each stage's
//   heaviest forms; OOO1 density from the start (Johto stages sit in the LATE cadence tier: `curveAt: 25`); EVERY Johto ace is a
//   GIANT with a signature move (Kanto made aces giant from stage 13 — Johto starts at Lv 50).
//   Base HP: the J2-style curve extended for Lv 50–65 (BM.JOHTO_EB below), gym ×1.25, E4 / Champion ×1.4.
//   No Johto stage carries a VV1 restriction (restrictions debut Sinnoh+). No Prism Tower entry on the Johto map (MMM1 / VVV1).
window.BM = window.BM || {};
(function () {
  const W = BM.waveRow, D = BM.dropTable;
  // Johto drop tiers = the Kanto late tier with the Johto-era evolution items themed in (Sun Stone near flowers and grass —
  // EEE1: Sun Stones arrive WITH Johto; Dusk Stone around ghosts; Razor Claw on ice; Electirizer / Magmarizer at the lighthouse /
  // the Burned Tower; Peat Block at the Lake / Victory Road; Shiny Stone among fairies). Mega Stones are added by mega.js.
  const J = (stones) => D('late', stones);
  const S = [
    { id: 'johto_01_newbark', name: 'New Bark Town', kind: 'wild', level: 50, background: 'new_bark_town', townMusic: 'town_newbark', gift: 'cyndaquil',
      drops: J({ sun_stone: 1, moon_stone: 1 }),
      waves: [W('sentret', 47, 4, 9), W('hoothoot', 47, 10, 11), W('furret', 49, 24, 14), W('rattata', 47, 16, 12), W('noctowl', 50, 40, 22)],
      gate: { by: 'time', at: 35, forms: ['noctowl'] } },
    { id: 'johto_02_cherrygrove', name: 'Cherrygrove City', place: 'Route 30', kind: 'wild', level: 51, background: 'cherrygrove_city', townMusic: 'town_cherrygrove', gift: 'totodile',
      drops: J({ water_stone: 1, sun_stone: 1 }),
      waves: [W('ledyba', 48, 4, 10), W('spinarak', 48, 9, 11), W('pidgey', 48, 16, 12), W('ledian', 50, 30, 18), W('ariados', 51, 40, 20)],
      gate: { by: 'time', at: 35, forms: ['ledian', 'ariados'] } },
    { id: 'johto_03_route31', name: 'Route 31', kind: 'wild', level: 52, background: 'route_31', townMusic: 'route', gift: 'chikorita',
      drops: J({ sun_stone: 2, leaf_stone: 1 }),
      waves: [W('poliwag', 49, 4, 10), W('hoppip', 49, 9, 11), W('skiploom', 51, 26, 16), W('poliwhirl', 51, 36, 18), W('raticate', 50, 18, 14)],
      gate: { by: 'time', at: 35, forms: ['poliwhirl', 'skiploom', 'raticate'] } },
    { id: 'johto_04_sprout', name: 'Violet City', place: 'Sprout Tower', kind: 'trainer', level: 52, background: 'sprout_tower', townMusic: 'town_violet', gift: 'togepi',
      drops: J({ dusk_stone: 2, moon_stone: 1 }),
      waves: [W('hoothoot', 49, 4, 11), W('gastly', 49, 8, 11), W('rattata', 49, 14, 12), W('noctowl', 51, 30, 18), W('haunter', 52, 40, 20)],
      gate: { by: 'time', at: 40, forms: ['haunter', 'noctowl'] } },
    { id: 'johto_05_falkner', name: 'Violet Gym', leader: 'Falkner', kind: 'gym', level: 53, background: 'gym_falkner', townMusic: 'town_violet',
      drops: J({ sun_stone: 1, moon_stone: 1 }),
      waves: [W('pidgey', 50, 4, 9), W('hoothoot', 50, 10, 11), W('noctowl', 52, 30, 18), W('pidgeot', 52, 50, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['pidgeot', 'pidgeotto'] },
      ace: { form: 'pidgeotto', level: 53, giant: true, sig: { move: 'Gust', aoe: 110, reach: 160 } } },
    { id: 'johto_06_unioncave', name: 'Union Cave', kind: 'wild', level: 53, background: 'union_cave', townMusic: 'route',
      drops: J({ moon_stone: 2, peat_block: 1 }),
      waves: [W('zubat', 50, 3, 9), W('geodude', 50, 8, 11), W('wooper', 50, 12, 11), W('golbat', 52, 28, 16), W('quagsire', 53, 38, 20), W('onix', 52, 50, 28)],
      gate: { by: 'time', at: 40, forms: ['quagsire', 'onix', 'golbat'] } },
    { id: 'johto_07_slowpokewell', name: 'Azalea Town', place: 'Slowpoke Well', kind: 'trainer', level: 54, background: 'slowpoke_well', townMusic: 'town_azalea',
      drops: J({ water_stone: 2, moon_stone: 1 }),
      waves: [W('slowpoke', 51, 4, 11), W('koffing', 51, 8, 11), W('rattata', 51, 12, 11), W('raticate', 53, 28, 16), W('weezing', 53, 40, 20), W('slowbro', 54, 50, 26)],
      gate: { by: 'time', at: 40, forms: ['slowbro', 'weezing'] } },
    { id: 'johto_08_bugsy', name: 'Azalea Gym', leader: 'Bugsy', kind: 'gym', level: 54, background: 'gym_bugsy', townMusic: 'town_azalea',
      drops: J({ metal_coat: 2, sun_stone: 1 }),
      waves: [W('metapod', 51, 4, 10), W('ledyba', 51, 8, 10), W('spinarak', 51, 12, 11), W('ledian', 53, 30, 16), W('butterfree', 53, 40, 18), W('heracross', 54, 55, 26)],
      gate: { by: 'hp', at: 0.9, forms: ['heracross', 'butterfree', 'scyther'] },
      ace: { form: 'scyther', level: 54, giant: true, sig: { move: 'Fury Cutter', aoe: 100, reach: 90 } } },
    { id: 'johto_09_ilex', name: 'Ilex Forest', kind: 'wild', level: 55, background: 'ilex_forest', townMusic: 'route', gift: 'oddish_bellossom',
      drops: J({ sun_stone: 3, leaf_stone: 1 }),
      waves: [W('oddish', 52, 4, 10), W('caterpie', 52, 8, 10), W('hoothoot', 52, 12, 12), W('gloom', 54, 28, 16), W('metapod', 53, 20, 16), W('butterfree', 55, 40, 20)],
      gate: { by: 'time', at: 40, forms: ['gloom', 'butterfree'] } },
    { id: 'johto_10_goldenrod', name: 'Goldenrod City', place: 'Radio Tower', kind: 'trainer', level: 55, background: 'goldenrod_city', townMusic: 'town_goldenrod',
      drops: J({ up_grade: 1, thunder_stone: 1, shiny_stone: 1 }),
      waves: [W('meowth', 52, 4, 10), W('aipom', 52, 8, 11), W('snubbull', 52, 12, 12), W('persian', 54, 28, 16), W('granbull', 54, 38, 18), W('ambipom', 55, 48, 22)],
      gate: { by: 'time', at: 40, forms: ['ambipom', 'granbull'] } },
    { id: 'johto_11_whitney', name: 'Goldenrod Gym', leader: 'Whitney', kind: 'gym', level: 56, background: 'gym_whitney', townMusic: 'town_goldenrod',
      drops: J({ shiny_stone: 2, moon_stone: 1 }),
      waves: [W('clefairy', 53, 4, 10), W('snubbull', 53, 9, 11), W('jigglypuff', 53, 14, 12), W('clefable', 55, 30, 18), W('wigglytuff', 55, 42, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['clefable', 'wigglytuff', 'miltank'] },
      ace: { form: 'miltank', level: 56, giant: true, sig: { move: 'Rollout', aoe: 120, reach: 70 } } },
    { id: 'johto_12_nationalpark', name: 'National Park', place: 'Bug-Catching Contest', kind: 'wild', level: 56, background: 'national_park', townMusic: 'route', item: 'sun_stone',
      drops: J({ sun_stone: 3, leaf_stone: 1, shiny_stone: 1 }),
      waves: [W('sunkern', 53, 4, 10), W('caterpie', 53, 8, 10), W('venonat', 53, 12, 11), W('sunflora', 55, 28, 16), W('venomoth', 55, 36, 18), W('pinsir', 56, 48, 24), W('scyther', 56, 56, 26)],
      gate: { by: 'time', at: 40, forms: ['pinsir', 'scyther', 'venomoth'] } },
    { id: 'johto_13_burnedtower', name: 'Ecruteak City', place: 'Burned Tower', kind: 'wild', level: 57, background: 'burned_tower', townMusic: 'town_ecruteak',
      drops: J({ magmarizer: 2, fire_stone: 1, dusk_stone: 1 }),
      waves: [W('koffing', 54, 4, 10), W('rattata', 54, 8, 10), W('zubat', 54, 12, 11), W('raticate', 56, 26, 15), W('weezing', 56, 36, 18), W('magmar', 57, 46, 22)],
      gate: { by: 'time', at: 40, forms: ['magmar', 'weezing'] } },
    { id: 'johto_14_morty', name: 'Ecruteak Gym', leader: 'Morty', kind: 'gym', level: 58, background: 'gym_morty', townMusic: 'town_ecruteak',
      drops: J({ dusk_stone: 3, moon_stone: 1 }),
      waves: [W('gastly', 55, 4, 9), W('misdreavus', 55, 10, 11), W('haunter', 56, 26, 15), W('haunter', 57, 60, 16)],
      gate: { by: 'hp', at: 0.9, forms: ['haunter', 'gengar'] },
      ace: { form: 'gengar', level: 58, giant: true, sig: { move: 'Shadow Ball + Hypnosis', aoe: 140, status: 'sleep', reach: 240 } } },
    { id: 'johto_15_lighthouse', name: 'Olivine City', place: 'Glitter Lighthouse', kind: 'trainer', level: 58, background: 'olivine_lighthouse', townMusic: 'town_olivine',
      drops: J({ electirizer: 2, thunder_stone: 1, water_stone: 1 }),
      waves: [W('mareep', 55, 4, 10), W('tentacool', 55, 8, 10), W('poliwhirl', 56, 14, 12), W('flaaffy', 56, 26, 15), W('noctowl', 56, 36, 18), W('ampharos', 58, 48, 22)],
      gate: { by: 'time', at: 40, forms: ['ampharos', 'noctowl'] } },
    { id: 'johto_16_jasmine', name: 'Olivine Gym', leader: 'Jasmine', kind: 'gym', level: 59, background: 'gym_jasmine', townMusic: 'town_olivine',
      drops: J({ metal_coat: 3, electirizer: 1 }),
      waves: [W('geodude', 56, 4, 10), W('pineco', 56, 9, 11), W('graveler', 57, 24, 15), W('skarmory', 58, 34, 18), W('forretress', 58, 46, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['forretress', 'skarmory', 'steelix'] },
      ace: { form: 'steelix', level: 59, giant: true, sig: { move: 'Iron Tail', aoe: 150, reach: 100 } } },
    { id: 'johto_17_chuck', name: 'Cianwood Gym', leader: 'Chuck', kind: 'gym', level: 59, background: 'gym_chuck', townMusic: 'town_cianwood', gift: 'shuckle',
      drops: J({ black_augurite: 1, water_stone: 1, metal_coat: 1 }),
      waves: [W('machop', 56, 4, 10), W('poliwhirl', 56, 9, 11), W('machoke', 57, 24, 15), W('hitmontop', 58, 34, 18), W('heracross', 58, 46, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['hitmontop', 'heracross', 'poliwrath'] },
      ace: { form: 'poliwrath', level: 59, giant: true, sig: { move: 'Dynamic Punch', aoe: 110, status: 'paralyze', reach: 70 } } },
    { id: 'johto_18_lakeofrage', name: 'Lake of Rage', place: 'the red Gyarados', kind: 'wild', level: 60, background: 'lake_of_rage', townMusic: 'town_mahogany',
      drops: J({ water_stone: 2, peat_block: 2 }),
      waves: [W('magikarp', 56, 3, 8), W('wooper', 56, 8, 10), W('girafarig', 57, 14, 12), W('quagsire', 58, 28, 16), W('gyarados', 59, 42, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['gyarados', 'gyarados_red'] },
      ace: { form: 'gyarados_red', level: 60, giant: true, sig: { move: 'Hyper Beam', aoe: 150, reach: 220 } } },
    { id: 'johto_19_pryce', name: 'Mahogany Gym', leader: 'Pryce', kind: 'gym', level: 60, background: 'gym_pryce', townMusic: 'town_mahogany',
      drops: J({ ice_stone: 3, razor_claw: 1 }),
      waves: [W('seel', 57, 4, 10), W('swinub', 57, 8, 10), W('delibird', 57, 14, 12), W('dewgong', 59, 28, 16), W('jynx', 59, 40, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['dewgong', 'jynx', 'piloswine'] },
      ace: { form: 'piloswine', level: 60, giant: true, sig: { move: 'Blizzard', aoe: 150, status: 'freeze', reach: 240 } } },
    { id: 'johto_20_icepath', name: 'Ice Path', kind: 'wild', level: 61, background: 'ice_path', townMusic: 'town_blackthorn',
      drops: J({ razor_claw: 2, ice_stone: 2 }),
      waves: [W('swinub', 58, 3, 9), W('zubat', 58, 8, 10), W('smoochum', 58, 12, 11), W('golbat', 59, 24, 15), W('jynx', 60, 34, 18), W('sneasel', 60, 44, 20), W('piloswine', 61, 56, 26)],
      gate: { by: 'time', at: 40, forms: ['sneasel', 'piloswine', 'jynx'] } },
    { id: 'johto_21_clair', name: 'Blackthorn Gym', leader: 'Clair', kind: 'gym', level: 62, background: 'gym_clair', townMusic: 'town_blackthorn',
      drops: J({ water_stone: 1, ice_stone: 1, thunder_stone: 1 }),
      waves: [W('horsea', 59, 4, 10), W('dratini', 59, 8, 11), W('seadra', 60, 24, 15), W('dragonair', 61, 34, 18), W('dragonair', 61, 70, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['dragonair', 'kingdra'] },
      ace: { form: 'kingdra', level: 62, giant: true, sig: { move: 'Dragon Pulse + Hydro Pump', aoe: 150, reach: 230 } } },
    { id: 'johto_22_victoryroad', name: 'Victory Road', kind: 'wild', level: 62, background: 'victory_road', townMusic: 'town_indigo',
      drops: J({ peat_block: 2, black_augurite: 1, moon_stone: 1 }),
      waves: [W('graveler', 59, 3, 10), W('rhyhorn', 59, 8, 11), W('phanpy', 59, 12, 11), W('golem', 61, 26, 16), W('ursaring', 61, 36, 18), W('donphan', 61, 46, 20), W('rhydon', 62, 56, 24)],
      gate: { by: 'time', at: 40, forms: ['rhydon', 'donphan', 'ursaring'] } },
    // the Elite Four as ONE node: Will (Psychic) · Koga (Poison) · Bruno (Fighting) · Karen (Dark) — each member's signature
    // Pokémon in the waves (their heavies gated), Karen's Houndoom the giant ace
    { id: 'johto_23_elitefour', name: 'Elite Four', leader: 'Will · Koga · Bruno · Karen', mapLabel: 'Elite Four', kind: 'e4', level: 63, background: 'e4_hall', townMusic: 'town_indigo',
      drops: J({ dusk_stone: 2, razor_claw: 1, moon_stone: 1 }),
      waves: [W('natu', 60, 4, 10), W('ariados', 60, 8, 11), W('hitmontop', 61, 14, 13), W('xatu', 62, 26, 16), W('crobat', 62, 34, 18), W('machamp', 62, 44, 22), W('umbreon', 62, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['xatu', 'crobat', 'machamp', 'umbreon', 'houndoom'] },
      ace: { form: 'houndoom', level: 63, giant: true, sig: { move: 'Flamethrower + Crunch', aoe: 160, reach: 220 } } },
    // the Champion (Lance): first clear = Lugia (rewardOnly) + the region's Master Ball + the ending; Johto counts as beaten
    // (regionsDone.johto) — which unlocks Mega Evolution (Step 6) and opens Mt. Silver
    { id: 'johto_24_champion', name: 'Champion', leader: 'Lance', kind: 'champion', level: 64, background: 'champion_room', townMusic: 'town_indigo',
      drops: J({ water_stone: 1, fire_stone: 1, thunder_stone: 1, ice_stone: 1 }),
      waves: [W('dragonair', 61, 4, 12), W('gyarados', 62, 14, 16), W('aerodactyl', 62, 26, 18), W('charizard', 62, 40, 20), W('dragonite', 63, 56, 26)],
      gate: { by: 'hp', at: 0.9, forms: ['charizard', 'aerodactyl', 'dragonite'] },
      ace: { form: 'dragonite', level: 64, giant: true, sig: { move: 'Hyper Beam', aoe: 170, status: 'paralyze', reach: 200 } }, gift: 'lugia', regionFinal: true },
    // Mt. Silver (Red) — the capstone: his team of aces at the region's highest levels; first clear = Master Ball + XP Candy L ×3
    { id: 'johto_25_mtsilver', name: 'Mt. Silver', leader: 'Red', kind: 'champion', level: 65, background: 'mt_silver', townMusic: 'route',
      drops: J({ fire_stone: 1, water_stone: 1, leaf_stone: 1, thunder_stone: 1 }),
      waves: [W('espeon', 62, 4, 12), W('snorlax', 63, 14, 18), W('venusaur', 63, 26, 18), W('blastoise', 64, 40, 20), W('charizard', 64, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['snorlax', 'venusaur', 'blastoise', 'charizard', 'pikachu'] },
      ace: { form: 'pikachu', level: 65, giant: true, sig: { move: 'Volt Tackle', aoe: 160, status: 'paralyze', reach: 120 } },
      // Hoenn Step 9.5 WINNABILITY tune: Red's 50% counter-burst steps aside for the LAST STAND (10 Lv 65 finals at once) — with both
      // on the same frame the native deck fell 6/6 → 2/6; without it 6/6 (the escalation stays: menace + last stand)
      burst: { thresholds: [0.75, 0.25] },
      prize: { master_ball: 1, xp_candy_l: 3 }, capstone: true },
  ];
  // carriers: the AoE / status units mixed into bursts (OOO1 late tier from stage 1 — Johto starts at Lv 50)
  const CARRIERS = { johto_02_cherrygrove: ['spinarak'], johto_04_sprout: ['gastly'], johto_06_unioncave: ['zubat'], johto_07_slowpokewell: ['koffing'],
    johto_08_bugsy: ['ledyba'], johto_09_ilex: ['oddish'], johto_11_whitney: ['jigglypuff'], johto_12_nationalpark: ['venonat'], johto_13_burnedtower: ['koffing'],
    johto_14_morty: ['gastly'], johto_15_lighthouse: ['mareep'], johto_16_jasmine: ['pineco'], johto_19_pryce: ['seel'], johto_20_icepath: ['smoochum'],
    johto_21_clair: ['horsea'], johto_22_victoryroad: ['graveler'], johto_23_elitefour: ['ariados'], johto_24_champion: ['gyarados'], johto_25_mtsilver: ['snorlax'] };
  // Z1 enemy bases: Johto gyms = their own base art (ASSET_PROMPTS #626–#633, the den until each lands); the E4 node reuses the
  // Kanto E4 base, Lance + Red the Champion's red-and-gold one.
  const BASES = { johto_05_falkner: 'gym_falkner', johto_08_bugsy: 'gym_bugsy', johto_11_whitney: 'gym_whitney', johto_14_morty: 'gym_morty',
    johto_16_jasmine: 'gym_jasmine', johto_17_chuck: 'gym_chuck', johto_19_pryce: 'gym_pryce', johto_21_clair: 'gym_clair',
    johto_23_elitefour: 'e4', johto_24_champion: 'champion', johto_25_mtsilver: 'champion' };
  // J2-STYLE ENEMY BASE HP for Lv 50–65 (Johto prompt Step 4): anchors by Johto stage number, geometric between, gym ×1.25,
  // E4 / Champion ×1.4 — sized so the J2 TTK band holds for a Kanto-cleared 6-card team (phase9 ttk) and Red's is the biggest.
  BM.JOHTO_EB = [[1, 27000], [5, 32000], [10, 37000], [15, 42000], [20, 47000], [25, 52000]];
  BM.johtoBaseHP = function (st) {
    const A = BM.JOHTO_EB, n = st.num;
    let v = A[A.length - 1][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; v = y0 * Math.pow(y1 / y0, (Math.max(n, x0) - x0) / (x1 - x0)); break; }
    return Math.round(v * (BM.EB_KIND[st.kind] || 1) / 50) * 50;
  };
  S.forEach((st, i) => {
    Object.assign(st, { num: i + 1, region: 'johto', curveAt: 25, music: { wild: 'battle_wild', trainer: 'battle_trainer', gym: 'battle_gym', e4: 'battle_elitefour', champion: 'battle_champion' }[st.kind] });
    st.background = 'johto_' + st.background; // the import keeps a region prefix on non-Kanto backgrounds (import_art.sh)
    if (BASES[st.id]) st.baseArt = BASES[st.id];
    if (CARRIERS[st.id]) BM.STAGE_CARRIERS[st.id] = CARRIERS[st.id];
    st.enemyBaseHP = BM.johtoBaseHP(st);
  });
  BM.applyRamp(S, BM.CAP_LADDER.johto); // level-ramp patch Step 1 (stages.js): Lv 1 → cap, endgame over the cap
  BM.JOHTO_STAGES = S;
  BM.STAGES.push(...S);
  // the queued ace attack sheets (#556 Pidgeotto, #557 Steelix, #558 Crobat) make these Kanto-era enemy forms ace-class here
  for (const id of ['pidgeotto', 'steelix', 'crobat']) BM.FORMS[id].runOnly = false;
})();
