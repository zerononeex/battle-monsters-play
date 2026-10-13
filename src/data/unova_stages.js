// UNOVA STAGES (Sinnoh + Unova prompt Act 2 U-S4) — the 25-node Unova journey from the prep pack's stage-plan.md (Black / White gym
// order; the Elite Four as FOUR nodes; node 24 N's Castle = the champion-class REWARD node; node 25 Champion Alder = the capstone).
//   Nuvema → Accumula → the Dreamyard → Striaton Gym (the three brothers' TRIPLE aces) → Lenora → Pinwheel Forest (Plasma) → Burgh →
//   the Desert Resort → Elesa → Cold Storage (Plasma) → Clay → Chargestone Cave → Celestial Tower → Skyla → Twist Mountain → Brycen →
//   Dragonspiral Tower (giant RESHIRAM) → Drayden → Victory Road → Shauntal · Grimsley · Caitlin · Marshal → N's Castle (N's giant
//   ZEKROM, then Ghetsis's Hydreigon; first clear = KYUREM (base form) + a Master Ball, U2 — Unova counts as beaten) → Champion Alder
//   (giant Volcarona, his Menace GIANT; first clear = Master Ball + XP Candy L ×3 + the Hisuian Samurott line).
//   Expected player levels 71 → 80 (the cap ladder: 75 → 80 once Unova is reached — Sinnoh's ladder + 5). Unova opens on the Sinnoh
//   Champion's first clear; Sinnoh's node 26 (Arceus) is NOT required.
//   Waves = the location's Black / White encounters (PokéAPI encounters) / the leader's BW team (spot-checked, Step 0f) + type.
//   Y1 gates, OOO1 late cadence (`curveAt: 25`), BR-099 `packBase`; Step 9.5 Part B from day one: every gym / E4 / N's Castle / Alder
//   ace carries its Leader's Menace + the Last Stand at 50%. No VV1 restriction (the Chargestone flag stays a proposal). No Prism
//   Tower entry on the Unova map (VVV1).
window.BM = window.BM || {};
(function () {
  const W = BM.waveRow, D = BM.dropTable;
  const M = (stones) => D('mid', stones), L = (stones) => D('late', stones);
  const S = [
    { id: 'unova_01_nuvema', name: 'Nuvema Town', place: 'Route 1', kind: 'wild', level: 69, background: 'nuvema_town', townMusic: 'town_nuvema', gift: 'snivy',
      drops: M({ leaf_stone: 1, water_stone: 1 }),
      waves: [W('patrat', 66, 4, 10), W('lillipup', 66, 9, 11), W('purrloin', 66, 14, 11), W('herdier', 68, 34, 18), W('audino', 68, 48, 30)],
      gate: { by: 'time', at: 35, forms: ['herdier', 'audino'] } },
    { id: 'unova_02_accumula', name: 'Accumula Town', place: 'Route 2', kind: 'wild', level: 70, background: 'accumula_town', townMusic: 'town_accumula', gift: 'tepig',
      drops: M({ moon_stone: 1, water_stone: 1 }),
      waves: [W('patrat', 67, 4, 10), W('lillipup', 67, 8, 11), W('purrloin', 67, 12, 11), W('pidove', 67, 18, 12), W('watchog', 69, 38, 18), W('liepard', 70, 46, 22), W('audino', 69, 54, 30)],
      gate: { by: 'time', at: 38, forms: ['watchog', 'liepard', 'audino'] } },
    { id: 'unova_03_dreamyard', name: 'Striaton City', place: 'the Dreamyard', kind: 'wild', level: 71, background: 'dreamyard', townMusic: 'town_striaton', gift: 'oshawott',
      drops: M({ moon_stone: 2, leaf_stone: 1 }),
      burst: { pack: [1, 2], trickle: 2 }, // the last kid-easy opener (the Hoenn Step 9.5 opener shape)
      waves: [W('munna', 68, 6, 10), W('patrat', 68, 14, 11), W('purrloin', 68, 22, 12), W('pansage', 68, 30, 13), W('pansear', 68, 34, 13), W('panpour', 68, 38, 13), W('pidove', 68, 44, 14), W('blitzle', 69, 50, 14), W('basculin', 70, 70, 20), W('musharna', 71, 90, 26)],
      gate: { by: 'time', at: 70, forms: ['basculin', 'musharna'] } },
    // TRIPLE ACES (pack C15, the Tate & Liza precedent): Cilan's Pansage at 70 % / 90 s, Chili's Pansear at 50 %, Cress's Panpour at 30 %
    { id: 'unova_04_striaton', name: 'Striaton Gym', leader: 'Cilan, Chili & Cress', mapLabel: 'Striaton Gym', kind: 'gym', level: 72, background: 'gym_striaton', townMusic: 'town_striaton',
      drops: M({ leaf_stone: 1, fire_stone: 1, water_stone: 1 }),
      waves: [W('lillipup', 69, 4, 10), W('patrat', 69, 9, 11), W('pansage', 70, 16, 13), W('pansear', 70, 20, 13), W('panpour', 70, 24, 13), W('herdier', 71, 36, 18)],
      gate: { by: 'hp', at: 0.9, forms: ['herdier', 'pansage', 'pansear', 'panpour'] },
      ace: { form: 'pansage', level: 72, giant: true, sig: { move: 'Bullet Seed', aoe: 110, reach: 120 } },
      extraAces: [{ form: 'pansear', level: 72, giant: true, at: 0.5, sig: { move: 'Incinerate', aoe: 110, reach: 120 } }, { form: 'panpour', level: 72, giant: true, at: 0.3, sig: { move: 'Scald', aoe: 110, reach: 120 } }] },
    { id: 'unova_05_lenora', name: 'Nacrene Gym', leader: 'Lenora', kind: 'gym', level: 73, background: 'gym_lenora', townMusic: 'town_nacrene',
      drops: M({ moon_stone: 2, water_stone: 1 }),
      waves: [W('lillipup', 70, 4, 10), W('patrat', 70, 9, 11), W('pidove', 70, 14, 12), W('blitzle', 70, 18, 12), W('herdier', 72, 28, 16), W('archen', 72, 38, 22), W('tirtouga', 72, 44, 22), W('aerodactyl', 73, 56, 30)],
      gate: { by: 'hp', at: 0.9, forms: ['herdier', 'archen', 'tirtouga', 'aerodactyl', 'watchog'] },
      ace: { form: 'watchog', level: 73, giant: true, sig: { move: 'Hyper Fang + Retaliate', aoe: 120, reach: 80 } } },
    { id: 'unova_06_pinwheel', name: 'Pinwheel Forest', place: 'Lostlorn Forest', leader: 'Team Plasma', mapLabel: 'Pinwheel Forest', kind: 'trainer', level: 73, background: 'pinwheel_forest', townMusic: 'town_nacrene',
      drops: M({ sun_stone: 2, leaf_stone: 1 }),
      waves: [W('sewaddle', 70, 4, 10), W('venipede', 70, 8, 11), W('cottonee', 70, 12, 11), W('petilil', 70, 16, 12), W('timburr', 70, 20, 12), W('tympole', 70, 24, 13), W('patrat', 70, 28, 13), W('purrloin', 70, 32, 13), W('throh', 71, 40, 18), W('sawk', 71, 44, 18), W('swadloon', 72, 50, 18), W('whimsicott', 72, 56, 20), W('lilligant', 72, 60, 20), W('zoroark', 73, 80, 45)],
      gate: { by: 'time', at: 40, forms: ['throh', 'sawk', 'whimsicott', 'lilligant', 'zoroark'] } },
    { id: 'unova_07_burgh', name: 'Castelia Gym', leader: 'Burgh', kind: 'gym', level: 74, background: 'gym_burgh', townMusic: 'town_castelia',
      drops: M({ leaf_stone: 2, moon_stone: 1 }),
      waves: [W('sewaddle', 71, 4, 10), W('venipede', 71, 9, 11), W('dwebble', 71, 14, 12), W('karrablast', 71, 18, 12), W('shelmet', 71, 22, 13), W('joltik', 71, 26, 13), W('swadloon', 72, 32, 15), W('whirlipede', 72, 38, 16), W('crustle', 73, 46, 20), W('scolipede', 74, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['crustle', 'scolipede', 'leavanny'] },
      ace: { form: 'leavanny', level: 74, giant: true, sig: { move: 'Leaf Blade + String Shot', aoe: 120, status: 'poison', reach: 90 } } },
    { id: 'unova_08_desert', name: 'Desert Resort', place: 'Relic Castle', mapLabel: 'Desert Resort', kind: 'wild', level: 74, background: 'desert_resort', townMusic: 'town_castelia',
      drops: M({ sun_stone: 2, fire_stone: 1 }),
      waves: [W('sandile', 71, 4, 10), W('darumaka', 71, 8, 11), W('dwebble', 71, 12, 11), W('scraggy', 71, 16, 12), W('yamask', 71, 20, 12), W('maractus', 72, 28, 15), W('sigilyph', 72, 34, 16), W('krokorok', 73, 40, 18), W('cofagrigus', 73, 46, 20), W('darmanitan', 74, 54, 22), W('larvesta', 74, 80, 45)],
      gate: { by: 'time', at: 40, forms: ['sigilyph', 'krokorok', 'cofagrigus', 'darmanitan', 'larvesta'] } },
    { id: 'unova_09_elesa', name: 'Nimbasa Gym', leader: 'Elesa', kind: 'gym', level: 75, background: 'gym_elesa', townMusic: 'town_nimbasa',
      drops: M({ thunder_stone: 3, moon_stone: 1 }),
      waves: [W('blitzle', 72, 4, 10), W('joltik', 72, 9, 11), W('tynamo', 72, 14, 12), W('klink', 72, 18, 12), W('minccino', 72, 22, 13), W('emolga', 73, 28, 14), W('trubbish', 72, 32, 14), W('liepard', 74, 40, 18), W('cinccino', 74, 46, 20), W('emolga', 75, 52, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['liepard', 'cinccino', 'zebstrika'] },
      ace: { form: 'zebstrika', level: 75, giant: true, sig: { move: 'Wild Charge', aoe: 130, status: 'paralyze', reach: 100 } } },
    { id: 'unova_10_cold_storage', name: 'Driftveil City', place: 'Cold Storage', leader: 'Team Plasma', mapLabel: 'Cold Storage', kind: 'trainer', level: 75, background: 'cold_storage', townMusic: 'town_driftveil',
      drops: M({ water_stone: 2, ice_stone: 1 }),
      waves: [W('vanillite', 72, 4, 10), W('timburr', 72, 8, 11), W('minccino', 72, 12, 11), W('ducklett', 72, 16, 12), W('frillish', 72, 20, 12), W('purrloin', 72, 24, 13), W('trubbish', 72, 28, 13), W('herdier', 73, 34, 15), W('watchog', 73, 40, 16), W('liepard', 74, 46, 18), W('alomomola', 74, 52, 20), W('stoutland', 75, 58, 22), W('jellicent', 75, 64, 24)],
      gate: { by: 'time', at: 40, forms: ['liepard', 'alomomola', 'stoutland', 'jellicent'] } },
    { id: 'unova_11_clay', name: 'Driftveil Gym', leader: 'Clay', kind: 'gym', level: 76, background: 'gym_clay', townMusic: 'town_driftveil',
      drops: M({ moon_stone: 1, metal_coat: 1, water_stone: 1 }),
      waves: [W('drilbur', 73, 4, 10), W('roggenrola', 73, 9, 11), W('sandile', 73, 14, 12), W('tympole', 73, 18, 12), W('woobat', 73, 22, 13), W('golett', 73, 26, 13), W('boldore', 74, 32, 16), W('onix', 74, 38, 18), W('krokorok', 75, 44, 18), W('palpitoad', 75, 50, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['onix', 'krokorok', 'palpitoad', 'excadrill'] },
      ace: { form: 'excadrill', level: 76, giant: true, sig: { move: 'Drill Run + Rock Slide', aoe: 140, reach: 110 } } },
    { id: 'unova_12_chargestone', name: 'Chargestone Cave', kind: 'wild', level: 76, background: 'chargestone_cave', townMusic: 'town_driftveil',
      drops: L({ thunder_stone: 2, metal_coat: 1 }),
      waves: [W('joltik', 73, 4, 10), W('tynamo', 73, 8, 11), W('ferroseed', 73, 12, 11), W('klink', 73, 16, 12), W('boldore', 74, 22, 14), W('drilbur', 74, 26, 14), W('klang', 75, 34, 16), W('eelektrik', 75, 40, 18), W('ferrothorn', 76, 48, 20), W('galvantula', 76, 54, 22)],
      gate: { by: 'time', at: 40, forms: ['klang', 'eelektrik', 'ferrothorn', 'galvantula'] } },
    { id: 'unova_13_celestial', name: 'Celestial Tower', place: 'Route 7', mapLabel: 'Celestial Tower', kind: 'wild', level: 77, background: 'celestial_tower', townMusic: 'town_mistralton',
      drops: L({ dusk_stone: 2, moon_stone: 1 }),
      waves: [W('litwick', 74, 4, 10), W('elgyem', 74, 8, 11), W('deerling', 74, 12, 11), W('cubchoo', 74, 16, 12), W('foongus', 74, 20, 12), W('tranquill', 75, 26, 14), W('watchog', 75, 32, 15), W('lampent', 76, 38, 17), W('zebstrika', 76, 44, 18), W('beheeyem', 77, 52, 22)],
      gate: { by: 'time', at: 40, forms: ['lampent', 'zebstrika', 'beheeyem'] } },
    { id: 'unova_14_skyla', name: 'Mistralton Gym', leader: 'Skyla', kind: 'gym', level: 77, background: 'gym_skyla', townMusic: 'town_mistralton',
      drops: L({ moon_stone: 1, water_stone: 1, thunder_stone: 1 }),
      waves: [W('woobat', 74, 4, 10), W('pidove', 74, 9, 11), W('ducklett', 74, 14, 12), W('rufflet', 74, 18, 12), W('vullaby', 74, 22, 13), W('emolga', 75, 28, 14), W('tranquill', 75, 34, 15), W('sigilyph', 76, 40, 18), W('swoobat', 76, 46, 18), W('unfezant', 77, 52, 20), W('axew', 76, 70, 40)],
      gate: { by: 'hp', at: 0.9, forms: ['sigilyph', 'swoobat', 'unfezant', 'swanna'] },
      ace: { form: 'swanna', level: 77, giant: true, sig: { move: 'Hurricane', aoe: 140, status: 'paralyze', reach: 200 } } },
    { id: 'unova_15_twist_mountain', name: 'Twist Mountain', kind: 'wild', level: 77, background: 'twist_mountain', townMusic: 'town_icirrus',
      drops: L({ ice_stone: 2, moon_stone: 1 }),
      waves: [W('roggenrola', 74, 4, 10), W('cubchoo', 74, 8, 11), W('woobat', 74, 12, 11), W('drilbur', 74, 16, 12), W('boldore', 75, 22, 14), W('gurdurr', 75, 28, 15), W('cryogonal', 76, 36, 17), W('gigalith', 77, 46, 22), W('excadrill', 77, 54, 24)],
      gate: { by: 'time', at: 40, forms: ['cryogonal', 'gigalith', 'excadrill'] } },
    { id: 'unova_16_brycen', name: 'Icirrus Gym', leader: 'Brycen', kind: 'gym', level: 78, background: 'gym_brycen', townMusic: 'town_icirrus',
      drops: L({ ice_stone: 3, water_stone: 1 }),
      waves: [W('vanillite', 75, 4, 10), W('cubchoo', 75, 9, 11), W('deerling', 75, 14, 12), W('shelmet', 75, 18, 12), W('palpitoad', 75, 22, 13), W('stunfisk', 76, 28, 15), W('vanillish', 76, 34, 16), W('cryogonal', 77, 40, 18), W('sawsbuck', 77, 46, 18), W('seismitoad', 78, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['cryogonal', 'sawsbuck', 'seismitoad', 'beartic'] },
      ace: { form: 'beartic', level: 78, giant: true, sig: { move: 'Icicle Crash', aoe: 150, status: 'freeze', reach: 100 } } },
    // Dragonspiral Tower — the ancient dragon awakens: giant RESHIRAM at the usual 70 % / 90 s (C3: one box dragon per stage)
    { id: 'unova_17_dragonspiral', name: 'Dragonspiral Tower', leader: 'Team Plasma', mapLabel: 'Dragonspiral Tower', kind: 'trainer', level: 78, background: 'dragonspiral_tower', townMusic: 'town_icirrus',
      drops: L({ fire_stone: 2, ice_stone: 1 }),
      waves: [W('mienfoo', 75, 4, 11), W('golett', 75, 8, 11), W('cubchoo', 75, 12, 12), W('deerling', 75, 16, 12), W('dratini', 75, 20, 13), W('trubbish', 75, 24, 13), W('liepard', 76, 30, 15), W('vanillish', 76, 36, 16), W('druddigon', 77, 42, 18), W('dragonair', 77, 48, 20), W('unfezant', 77, 52, 20), W('sawsbuck', 78, 58, 22)],
      gate: { by: 'time', at: 40, forms: ['druddigon', 'dragonair', 'unfezant', 'sawsbuck', 'reshiram'] },
      burst: { pack: [1, 2], trickle: 3.2, size: [2, 3], counterSize: 2 }, // the box dragon is the event (the Seafloor / Spear Pillar shape)
      ace: { form: 'reshiram', level: 78, giant: true, sig: { move: 'Blue Flare', aoe: 150, status: 'burn', reach: 240 } } },
    { id: 'unova_18_drayden', name: 'Opelucid Gym', leader: 'Drayden', kind: 'gym', level: 79, background: 'gym_drayden', townMusic: 'town_opelucid',
      drops: L({ moon_stone: 2, metal_coat: 1 }),
      waves: [W('axew', 76, 4, 10), W('deino', 76, 9, 11), W('dratini', 76, 14, 12), W('pawniard', 76, 18, 12), W('gothorita', 76, 22, 13), W('duosion', 76, 26, 13), W('fraxure', 77, 32, 16), W('dragonair', 77, 38, 17), W('garbodor', 78, 44, 18), W('druddigon', 78, 50, 20), W('fraxure', 79, 56, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['garbodor', 'druddigon', 'haxorus'] },
      ace: { form: 'haxorus', level: 79, giant: true, sig: { move: 'Dragon Dance + Outrage', aoe: 160, reach: 100 } } },
    { id: 'unova_19_victory_road', name: 'Victory Road', place: 'Route 10', kind: 'wild', level: 79, background: 'victory_road', townMusic: 'town_opelucid',
      drops: L({ moon_stone: 1, fire_stone: 1, metal_coat: 1 }),
      waves: [W('deino', 76, 4, 10), W('durant', 76, 8, 11), W('mienfoo', 76, 12, 11), W('rufflet', 76, 16, 12), W('vullaby', 76, 20, 12), W('boldore', 77, 26, 14), W('heatmor', 77, 30, 15), W('throh', 77, 34, 15), W('sawk', 77, 36, 15), W('fraxure', 78, 42, 17), W('bouffalant', 78, 48, 18), W('amoonguss', 78, 52, 20), W('zweilous', 79, 58, 22), W('excadrill', 79, 64, 24)],
      gate: { by: 'time', at: 40, forms: ['bouffalant', 'amoonguss', 'zweilous', 'excadrill'] } },
    // the Elite Four as FOUR nodes; their bases share the 'e4' base
    { id: 'unova_20_shauntal', name: 'Elite Four', leader: 'Shauntal', kind: 'e4', level: 80, background: 'e4_shauntal', townMusic: 'town_unova_league',
      drops: L({ dusk_stone: 2, moon_stone: 1 }),
      waves: [W('yamask', 77, 4, 10), W('frillish', 77, 8, 11), W('golett', 77, 14, 13), W('litwick', 77, 20, 14), W('lampent', 78, 26, 15), W('drifblim', 78, 32, 16), W('cofagrigus', 79, 38, 18), W('jellicent', 79, 44, 18), W('golurk', 79, 50, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['cofagrigus', 'jellicent', 'golurk', 'drifblim', 'chandelure'] },
      ace: { form: 'chandelure', level: 80, giant: true, sig: { move: 'Shadow Ball + Fire Blast', aoe: 160, status: 'burn', reach: 240 } } },
    { id: 'unova_21_grimsley', name: 'Elite Four', leader: 'Grimsley', kind: 'e4', level: 80, background: 'e4_grimsley', townMusic: 'town_unova_league',
      drops: L({ leaders_crest: 2, moon_stone: 1 }),
      waves: [W('purrloin', 77, 4, 10), W('sandile', 77, 8, 11), W('scraggy', 77, 14, 13), W('pawniard', 77, 20, 14), W('zorua', 78, 26, 15), W('krokorok', 78, 32, 16), W('liepard', 79, 38, 18), W('scrafty', 79, 44, 18), W('krookodile', 79, 50, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['liepard', 'scrafty', 'krookodile', 'bisharp'] },
      ace: { form: 'bisharp', level: 80, giant: true, sig: { move: 'Night Slash + Iron Head', aoe: 160, reach: 100 } } },
    { id: 'unova_22_caitlin', name: 'Elite Four', leader: 'Caitlin', kind: 'e4', level: 80, background: 'e4_caitlin', townMusic: 'town_unova_league',
      drops: L({ moon_stone: 2, dawn_stone: 1 }),
      waves: [W('munna', 77, 4, 10), W('gothita', 77, 8, 11), W('solosis', 77, 14, 13), W('elgyem', 77, 20, 14), W('woobat', 78, 26, 15), W('duosion', 78, 32, 16), W('musharna', 79, 38, 18), W('sigilyph', 79, 44, 18), W('reuniclus', 79, 50, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['musharna', 'sigilyph', 'reuniclus', 'gothitelle'] },
      ace: { form: 'gothitelle', level: 80, giant: true, sig: { move: 'Psychic + Hypnosis', aoe: 160, status: 'sleep', reach: 240 } } },
    { id: 'unova_23_marshal', name: 'Elite Four', leader: 'Marshal', kind: 'e4', level: 80, background: 'e4_marshal', townMusic: 'town_unova_league',
      drops: L({ fire_stone: 1, moon_stone: 1, metal_coat: 1 }),
      waves: [W('timburr', 77, 4, 10), W('mienfoo', 77, 8, 11), W('scraggy', 77, 14, 13), W('pignite', 77, 20, 14), W('gurdurr', 78, 26, 15), W('throh', 79, 32, 16), W('sawk', 79, 38, 18), W('mienshao', 79, 44, 18)],
      gate: { by: 'hp', at: 0.9, forms: ['throh', 'sawk', 'mienshao', 'conkeldurr'] },
      ace: { form: 'conkeldurr', level: 80, giant: true, sig: { move: 'Hammer Arm', aoe: 160, reach: 100 } } },
    // N's Castle — N and Ghetsis (champion-class, U2): N's giant ZEKROM at the usual 70 % / 90 s, then Ghetsis's giant HYDREIGON at its own
    // 30 % (never both in one counter-burst). First clear = KYUREM (base form, rewardOnly — Mewtwo → Lugia → Rayquaza → Giratina → Kyurem)
    // + the region's Master Ball; Unova counts as beaten (regionsDone.unova).
    { id: 'unova_24_ns_castle', name: "N's Castle", leader: 'N & Ghetsis', mapLabel: "N's Castle", kind: 'champion', level: 80, background: 'ns_castle', townMusic: 'town_unova_league',
      drops: L({ leaders_crest: 2, thunder_stone: 1 }),
      waves: [W('purrloin', 77, 4, 11), W('trubbish', 77, 8, 12), W('klang', 78, 16, 14), W('liepard', 78, 22, 15), W('archeops', 79, 28, 16), W('carracosta', 79, 34, 18), W('zoroark', 79, 40, 18), W('vanilluxe', 79, 46, 20), W('klinklang', 79, 50, 20), W('cofagrigus', 80, 56, 22), W('seismitoad', 80, 60, 22), W('bouffalant', 80, 64, 22), W('eelektross', 80, 68, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['zoroark', 'vanilluxe', 'klinklang', 'seismitoad', 'eelektross', 'zekrom', 'hydreigon'] },
      ace: { form: 'zekrom', level: 80, giant: true, sig: { move: 'Bolt Strike', aoe: 160, status: 'paralyze', reach: 240 } },
      extraAces: [{ form: 'hydreigon', level: 80, giant: true, at: 0.3, sig: { move: 'Dragon Pulse + Dark Pulse', aoe: 160, reach: 230 } }],
      gift: 'kyurem', regionFinal: true },
    // 25 — the CAPSTONE (U2): Champion ALDER, "The True Champion" (BW postgame; the Red pattern) — giant VOLCARONA (his Menace: GIANT).
    // First clear = Master Ball + XP Candy L ×3 + the Hisuian Samurott line (C10).
    { id: 'unova_25_alder', name: 'Champion', place: 'The True Champion', leader: 'Alder', kind: 'champion', level: 80, background: 'champion_room', townMusic: 'town_unova_league', gift: 'oshawott_samurott_hisui',
      drops: L({ fire_stone: 2, moon_stone: 1, sun_stone: 1 }),
      waves: [W('larvesta', 77, 4, 11), W('karrablast', 77, 8, 12), W('shelmet', 77, 12, 12), W('vanillish', 78, 20, 14), W('druddigon', 78, 26, 15), W('accelgor', 79, 32, 16), W('bouffalant', 79, 38, 18), W('vanilluxe', 79, 44, 18), W('escavalier', 80, 50, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['accelgor', 'bouffalant', 'vanilluxe', 'escavalier', 'volcarona'] },
      burst: { pack: [3, 4], trickle: 1.1, size: [5, 6], counterSize: 5 }, // the capstone: the region's densest defence
      ace: { form: 'volcarona', level: 80, giant: true, sig: { move: 'Quiver Dance + Fiery Dance', aoe: 170, status: 'burn', reach: 240 } },
      prize: { master_ball: 1, xp_candy_l: 3 }, capstone: true },
  ];
  const CARRIERS = { unova_04_striaton: ['patrat'], unova_05_lenora: ['blitzle'], unova_06_pinwheel: ['venipede'], unova_07_burgh: ['venipede'],
    unova_08_desert: ['sandile'], unova_09_elesa: ['joltik'], unova_10_cold_storage: ['vanillite'], unova_11_clay: ['roggenrola'], unova_12_chargestone: ['joltik'],
    unova_13_celestial: ['litwick'], unova_14_skyla: ['woobat'], unova_15_twist_mountain: ['cubchoo'], unova_16_brycen: ['vanillite'],
    unova_17_dragonspiral: ['trubbish'], unova_18_drayden: ['axew'], unova_19_victory_road: ['durant'], unova_20_shauntal: ['litwick'],
    unova_21_grimsley: ['purrloin'], unova_22_caitlin: ['munna'], unova_23_marshal: ['timburr'], unova_24_ns_castle: ['trubbish'], unova_25_alder: ['larvesta'] };
  // Z1 enemy bases: the 8 Unova gyms = their own base art (queued; the den until each lands); the E4 rooms the shared E4 base;
  // N's Castle and Alder the Champion's one (pack C17)
  const BASES = { unova_04_striaton: 'gym_striaton', unova_05_lenora: 'gym_lenora', unova_07_burgh: 'gym_burgh', unova_09_elesa: 'gym_elesa',
    unova_11_clay: 'gym_clay', unova_14_skyla: 'gym_skyla', unova_16_brycen: 'gym_brycen', unova_18_drayden: 'gym_drayden',
    unova_20_shauntal: 'e4', unova_21_grimsley: 'e4', unova_22_caitlin: 'e4', unova_23_marshal: 'e4', unova_24_ns_castle: 'champion', unova_25_alder: 'champion' };
  // the difficulty dial per stage (BM.hardenStage, sinnoh_stages.js) — the sim-tuned values recorded in CURRENT_STATE (Act 3 A2)
  BM.UNOVA_HARD = { 7: 1.75, 9: 1.5, 16: 0.4, 24: 0.35, 25: 0.5 }; // Act 3 A2 (BR-117): native deck 4 4 4 5 5 /6 (4 reads 6/6 at every k once its grown-up waves are gated; 11 / 14 / 21 reach mid-band only past the OOO1 AP-cap guard — left, reported)
  BM.UNOVA_EB = [[1, 36000], [5, 39000], [10, 42000], [15, 42500], [20, 43000], [25, 45000]];
  BM.unovaBaseHP = function (st) {
    const A = BM.UNOVA_EB, n = st.num;
    let v = A[A.length - 1][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; v = y0 * Math.pow(y1 / y0, (Math.max(n, x0) - x0) / (x1 - x0)); break; }
    return Math.round(v * (BM.EB_KIND[st.kind] || 1) / 50) * 50;
  };
  S.forEach((st, i) => {
    Object.assign(st, { num: i + 1, region: 'unova', curveAt: 25, packBase: true, music: { wild: 'battle_wild', trainer: 'battle_trainer', gym: 'battle_gym', e4: 'battle_elitefour', champion: 'battle_champion' }[st.kind] });
    st.mapLabel = st.mapLabel || (st.kind === 'e4' ? st.leader : undefined);
    const e4 = ['e4', 'champion'].includes(st.kind);
    st.burst = { pack: e4 ? BM.HOENN_CADENCE.e4pack : BM.HOENN_CADENCE.pack, trickle: e4 ? BM.HOENN_CADENCE.e4trickle : BM.HOENN_CADENCE.trickle, ...(st.burst || {}) };
    st.background = 'unova_' + st.background;
    if (BASES[st.id]) st.baseArt = BASES[st.id];
    if (CARRIERS[st.id]) BM.STAGE_CARRIERS[st.id] = CARRIERS[st.id];
    st.enemyBaseHP = BM.unovaBaseHP(st);
    if (BM.UNOVA_HARD[st.num]) BM.hardenStage(st, BM.UNOVA_HARD[st.num]);
  });
  for (const st of S) if (st.mapLabel === undefined) delete st.mapLabel;
  BM.UNOVA_STAGES = S;
  BM.STAGES.push(...S);
})();
