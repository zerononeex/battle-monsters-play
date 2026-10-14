// SINNOH STAGES (Sinnoh + Unova prompt Act 1 S4) — the 25-node Sinnoh journey from the prep pack's stage-plan.md (Platinum gym
// order: Roark, Gardenia, FANTINA 3rd, Maylene, Wake, Byron, Candice, Volkner; the Elite Four as FOUR nodes; Champion Cynthia 24;
// the capstone 25) + node 26, ARCEUS (U2, user-refined): post-game and OPTIONAL — never required to unlock Unova (Unova opens on
// Cynthia's first clear, regionsDone.sinnoh). Kanto / Johto / Hoenn fields throughout (stages.js explains each one).
//   Twinleaf → Sandgem → Jubilife → Roark → Valley Windworks (Mars) → Eterna Forest → Gardenia (+ Jupiter's building) → Fantina →
//   Solaceon → Maylene → Wake (Great Marsh) → Byron → Iron Island (Riolu) → the lakes (Saturn) → Candice → Galactic HQ (Cyrus) →
//   Spear Pillar (Dialga + Palkia) → the Distortion World (Cyrus) → Volkner → Aaron · Bertha · Flint · Lucian → Champion Cynthia
//   (first clear = GIRATINA + a Master Ball; giant MEGA GARCHOMP, U4) → 25 the rift to Hisui (capstone) → 26 "The Original One".
//   Expected player levels 66 → 75 (the cap ladder: 70 → 75 once Sinnoh is reached) — Hoenn's ladder + 5 (pack C1).
//   Waves = the location's Platinum encounters / the leader's canon Platinum team + type (the standing enemy rule; pret/pokeplatinum).
//   Y1 gates hold each stage's heaviest forms; OOO1 late cadence (`curveAt: 25`); BR-099 `packBase` (extras = base forms).
//   Step 9.5 Part B from day one: every gym / E4 / Champion ace carries its Leader's Menace (menace.js) + the Last Stand at 50%.
//   CAPSTONE (25) — builder's call, recorded in CURRENT_STATE: the pack's option A setting WITHOUT Arceus (U2 moved him to 26):
//   "The rift to Hisui" above Spear Pillar — the Hisuian forms pour through and the NOBLE HISUIAN ARCANINE is the giant ace, the
//   chieftain KLEAVOR a twin ace at 40 %. First clear = Master Ball + XP Candy L ×3 + the Hisuian Typhlosion line (C10).
//   ARCEUS (26) — deliberately very hard: Arceus descends at once as a giant and SUMMONS pseudo-legendary-class Pokémon (Tyranitar /
//   Salamence / Garchomp / Dragonite / Metagross, the shipped pool) while he stands (`summon`, battle.js). Exempt from the
//   winnability gate by design (simmed and reported). First clear = ARCEUS joins (rewardOnly — never on a banner). A loss costs
//   nothing; retry any time.
//   VV1: the pack's three flags (11 apMax, 13 / 15 fieldCap) stay proposals — NOT built (the user / Kakashi decide; a rule + a menace +
//   a last stand on one leader stage is a lot for a kid). No Prism Tower entry on the Sinnoh map (VVV1).
window.BM = window.BM || {};
(function () {
  const W = BM.waveRow, D = BM.dropTable;
  const M = (stones) => D('mid', stones), L = (stones) => D('late', stones);
  const S = [
    { id: 'sinnoh_01_twinleaf', name: 'Twinleaf Town', place: 'Lake Verity', kind: 'wild', level: 64, background: 'twinleaf_town', townMusic: 'town_twinleaf', gift: 'turtwig',
      drops: M({ leaf_stone: 1, water_stone: 1 }),
      waves: [W('starly', 61, 4, 10), W('bidoof', 61, 9, 11), W('kricketot', 61, 14, 11), W('bibarel', 63, 34, 18), W('psyduck', 63, 42, 22)],
      gate: { by: 'time', at: 35, forms: ['bibarel', 'psyduck'] } },
    { id: 'sinnoh_02_sandgem', name: 'Sandgem Town', place: 'Route 202', kind: 'wild', level: 65, background: 'sandgem_town', townMusic: 'town_sandgem', gift: 'chimchar',
      drops: M({ water_stone: 1, thunder_stone: 1 }),
      waves: [W('bidoof', 62, 4, 10), W('starly', 62, 8, 11), W('shinx', 62, 12, 11), W('kricketot', 62, 16, 12), W('zigzagoon', 63, 22, 13), W('sentret', 63, 28, 14), W('kricketune', 64, 40, 20), W('staravia', 65, 48, 22)],
      gate: { by: 'time', at: 38, forms: ['kricketune', 'staravia'] } },
    { id: 'sinnoh_03_jubilife', name: 'Jubilife City', place: 'Routes 203–204', kind: 'wild', level: 66, background: 'jubilife_city', townMusic: 'town_jubilife', gift: 'piplup',
      drops: M({ leaf_stone: 1, moon_stone: 1 }),
      burst: { pack: [1, 2], trickle: 2 }, // the last kid-easy opener (the Hoenn Step 9.5 opener shape)
      waves: [W('starly', 63, 6, 10), W('shinx', 63, 14, 11), W('zubat', 63, 22, 12), W('abra', 63, 30, 13), W('seedot', 63, 38, 13), W('lotad', 63, 44, 14), W('wurmple', 63, 50, 12), W('psyduck', 64, 70, 18), W('barboach', 65, 90, 22), W('luxio', 66, 100, 24)],
      gate: { by: 'time', at: 70, forms: ['psyduck', 'barboach', 'luxio'] } },
    { id: 'sinnoh_04_roark', name: 'Oreburgh Gym', leader: 'Roark', kind: 'gym', level: 67, background: 'gym_roark', townMusic: 'town_oreburgh',
      drops: M({ moon_stone: 1, metal_coat: 1 }),
      waves: [W('geodude', 64, 4, 10), W('zubat', 64, 9, 11), W('cranidos', 65, 14, 12), W('shieldon', 65, 20, 13), W('onix', 66, 30, 18), W('graveler', 66, 40, 18)],
      gate: { by: 'hp', at: 0.9, forms: ['onix', 'graveler'] },
      ace: { form: 'cranidos', level: 67, giant: true, sig: { move: 'Head Smash', aoe: 110, reach: 80 } } },
    { id: 'sinnoh_05_windworks', name: 'Floaroma Town', place: 'Valley Windworks', leader: 'Commander Mars', mapLabel: 'Valley Windworks', kind: 'trainer', level: 68, background: 'valley_windworks', townMusic: 'town_floaroma',
      drops: M({ thunder_stone: 2, leaf_stone: 1 }),
      waves: [W('buizel', 65, 4, 10), W('shellos', 65, 8, 11), W('pachirisu', 65, 12, 12), W('combee', 65, 16, 11), W('cherubi', 65, 20, 12), W('glameow', 66, 26, 13), W('stunky', 66, 30, 14), W('zubat', 65, 34, 12), W('electrike', 66, 40, 15), W('drifloon', 67, 50, 22), W('gastrodon', 67, 56, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['drifloon', 'gastrodon', 'purugly'] },
      ace: { form: 'purugly', level: 68, giant: true, sig: { move: 'Body Slam', aoe: 120, reach: 80 } } },
    { id: 'sinnoh_06_eterna_forest', name: 'Eterna Forest', place: 'Old Chateau', kind: 'wild', level: 68, background: 'eterna_forest', townMusic: 'town_eterna',
      drops: M({ leaf_stone: 2, moon_stone: 1 }),
      waves: [W('wurmple', 65, 4, 10), W('buneary', 65, 8, 11), W('kricketot', 65, 12, 11), W('bidoof', 65, 16, 12), W('hoothoot', 65, 20, 13), W('pineco', 65, 24, 13), W('seedot', 65, 28, 13), W('gastly', 66, 32, 14), W('beautifly', 67, 44, 18), W('dustox', 67, 48, 18), W('haunter', 67, 56, 20), W('rotom', 68, 70, 40)],
      gate: { by: 'time', at: 40, forms: ['beautifly', 'dustox', 'haunter', 'rotom'] } },
    { id: 'sinnoh_07_gardenia', name: 'Eterna Gym', leader: 'Gardenia', kind: 'gym', level: 69, background: 'gym_gardenia', townMusic: 'town_eterna',
      drops: M({ shiny_stone: 2, leaf_stone: 1 }),
      waves: [W('cherubi', 66, 4, 10), W('turtwig', 66, 9, 11), W('oddish', 66, 14, 12), W('budew', 66, 18, 12), W('stunky', 66, 22, 13), W('roselia', 67, 30, 15), W('cherrim', 68, 38, 18), W('gloom', 68, 42, 18), W('grotle', 68, 48, 20), W('skuntank', 69, 56, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['cherrim', 'grotle', 'skuntank', 'roserade'] },
      ace: { form: 'roserade', level: 69, giant: true, sig: { move: 'Petal Blizzard', aoe: 130, status: 'poison', reach: 230 } } },
    { id: 'sinnoh_08_fantina', name: 'Hearthome Gym', leader: 'Fantina', kind: 'gym', level: 69, background: 'gym_fantina', townMusic: 'town_hearthome',
      drops: M({ shiny_stone: 1, moon_stone: 2 }),
      waves: [W('gastly', 66, 4, 10), W('duskull', 66, 9, 11), W('misdreavus', 66, 14, 12), W('drifloon', 66, 20, 13), W('shuppet', 66, 26, 13), W('haunter', 68, 34, 16), W('dusclops', 68, 42, 18), W('drifblim', 68, 48, 20), W('banette', 69, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['dusclops', 'drifblim', 'banette', 'mismagius'] },
      ace: { form: 'mismagius', level: 69, giant: true, sig: { move: 'Shadow Ball', aoe: 130, status: 'sleep', reach: 230 } } },
    { id: 'sinnoh_09_solaceon', name: 'Solaceon Town', place: 'Solaceon Ruins', kind: 'wild', level: 70, background: 'solaceon_ruins', townMusic: 'town_solaceon',
      drops: M({ moon_stone: 2, fire_stone: 1 }),
      waves: [W('staravia', 67, 4, 10), W('ralts', 67, 8, 11), W('ponyta', 67, 12, 11), W('swablu', 67, 16, 12), W('meditite', 67, 22, 13), W('duskull', 67, 26, 13), W('gastly', 67, 30, 13), W('kirlia', 68, 38, 16), W('noctowl', 68, 44, 18), W('zangoose', 69, 50, 20), W('seviper', 69, 52, 20), W('chansey', 69, 60, 26), W('spiritomb', 70, 80, 45)],
      gate: { by: 'time', at: 40, forms: ['noctowl', 'zangoose', 'seviper', 'chansey', 'spiritomb'] } },
    { id: 'sinnoh_10_maylene', name: 'Veilstone Gym', leader: 'Maylene', kind: 'gym', level: 70, background: 'gym_maylene', townMusic: 'town_veilstone',
      drops: M({ moon_stone: 1, metal_coat: 1, fire_stone: 1 }),
      waves: [W('meditite', 67, 4, 10), W('machop', 67, 9, 11), W('riolu', 67, 14, 12), W('ponyta', 67, 18, 12), W('houndour', 67, 22, 13), W('machoke', 68, 30, 16), W('hitmonlee', 69, 38, 18), W('hitmonchan', 69, 42, 18), W('hitmontop', 69, 46, 20), W('medicham', 70, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['hitmonlee', 'hitmonchan', 'hitmontop', 'medicham', 'lucario'] },
      ace: { form: 'lucario', level: 70, giant: true, sig: { move: 'Aura Sphere', aoe: 140, reach: 230 } } },
    { id: 'sinnoh_11_wake', name: 'Pastoria Gym', leader: 'Crasher Wake', mapLabel: 'Crasher Wake', kind: 'gym', level: 71, background: 'gym_wake', townMusic: 'town_pastoria',
      drops: M({ water_stone: 3, leaf_stone: 1 }),
      waves: [W('wooper', 68, 4, 10), W('buizel', 68, 9, 11), W('croagunk', 68, 14, 12), W('skorupi', 68, 18, 12), W('shellos', 68, 22, 13), W('barboach', 68, 26, 13), W('remoraid', 68, 30, 14), W('quagsire', 70, 38, 16), W('carnivine', 70, 44, 18), W('whiscash', 70, 50, 20), W('gyarados', 71, 58, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['quagsire', 'carnivine', 'whiscash', 'gyarados', 'floatzel'] },
      ace: { form: 'floatzel', level: 71, giant: true, sig: { move: 'Aqua Jet + Crunch', aoe: 130, reach: 100 } } },
    { id: 'sinnoh_12_byron', name: 'Canalave Gym', leader: 'Byron', kind: 'gym', level: 71, background: 'gym_byron', townMusic: 'town_canalave',
      drops: M({ metal_coat: 2, thunder_stone: 1 }),
      waves: [W('magnemite', 68, 4, 10), W('bronzor', 68, 9, 11), W('shieldon', 68, 14, 12), W('aron', 68, 18, 12), W('nosepass', 69, 24, 14), W('onix', 69, 30, 16), W('magneton', 70, 38, 18), W('lairon', 70, 44, 18), W('bronzong', 70, 50, 20), W('steelix', 71, 58, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['magneton', 'lairon', 'bronzong', 'steelix', 'bastiodon'] },
      ace: { form: 'bastiodon', level: 71, giant: true, sig: { move: 'Iron Defense + Flash Cannon', aoe: 140, reach: 200 } } },
    { id: 'sinnoh_13_iron_island', name: 'Iron Island', kind: 'trainer', level: 72, background: 'iron_island', townMusic: 'town_canalave', gift: 'riolu',
      drops: L({ metal_coat: 2, moon_stone: 1 }),
      waves: [W('geodude', 69, 4, 10), W('zubat', 69, 8, 11), W('wingull', 69, 12, 11), W('tentacool', 69, 16, 12), W('bronzor', 69, 20, 12), W('glameow', 69, 24, 13), W('croagunk', 69, 28, 13), W('graveler', 70, 36, 16), W('golbat', 70, 40, 16), W('mawile', 71, 48, 18), W('sableye', 71, 52, 18), W('steelix', 72, 64, 28)],
      gate: { by: 'time', at: 40, forms: ['mawile', 'sableye', 'steelix'] } },
    { id: 'sinnoh_14_lakes', name: 'The Three Lakes', place: 'Lake Valor', leader: 'Commander Saturn', mapLabel: 'Lake Valor', kind: 'trainer', level: 72, background: 'lake_valor', townMusic: 'town_celestic',
      drops: L({ water_stone: 2, ice_stone: 1 }),
      waves: [W('bibarel', 69, 4, 10), W('staravia', 69, 8, 11), W('psyduck', 69, 12, 11), W('snover', 69, 16, 12), W('sneasel', 69, 20, 13), W('swinub', 69, 24, 13), W('glameow', 69, 28, 13), W('stunky', 69, 32, 14), W('bronzor', 70, 36, 14), W('golduck', 71, 44, 18), W('girafarig', 71, 48, 18), W('golbat', 71, 52, 18), W('purugly', 72, 60, 30)],
      gate: { by: 'hp', at: 0.9, forms: ['golduck', 'girafarig', 'golbat', 'purugly', 'toxicroak'] },
      ace: { form: 'toxicroak', level: 72, giant: true, sig: { move: 'Poison Jab', aoe: 130, status: 'poison', reach: 90 } } },
    { id: 'sinnoh_15_candice', name: 'Snowpoint Gym', leader: 'Candice', kind: 'gym', level: 72, background: 'gym_candice', townMusic: 'town_snowpoint',
      drops: L({ ice_stone: 3, water_stone: 1 }),
      waves: [W('snover', 69, 4, 10), W('sneasel', 69, 9, 11), W('snorunt', 69, 14, 12), W('swinub', 69, 18, 12), W('smoochum', 69, 22, 13), W('delibird', 70, 28, 14), W('jynx', 70, 34, 16), W('glalie', 71, 42, 18), W('piloswine', 71, 48, 18), W('abomasnow', 72, 56, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['glalie', 'piloswine', 'abomasnow', 'froslass'] },
      ace: { form: 'froslass', level: 72, giant: true, sig: { move: 'Blizzard', aoe: 150, status: 'freeze', reach: 230 } } },
    { id: 'sinnoh_16_galactic_hq', name: 'Veilstone City', place: 'Team Galactic HQ', leader: 'Cyrus', mapLabel: 'Galactic HQ', kind: 'trainer', level: 73, background: 'galactic_hq', townMusic: 'town_veilstone',
      drops: L({ moon_stone: 2, metal_coat: 1 }),
      waves: [W('zubat', 70, 4, 10), W('glameow', 70, 8, 11), W('stunky', 70, 12, 11), W('bronzor', 70, 16, 12), W('croagunk', 70, 20, 12), W('murkrow', 70, 24, 13), W('houndour', 70, 28, 13), W('golbat', 71, 36, 16), W('purugly', 72, 42, 18), W('skuntank', 72, 46, 18), W('bronzong', 72, 52, 20), W('sneasel', 72, 56, 20), W('crobat', 73, 62, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['purugly', 'skuntank', 'bronzong', 'crobat', 'honchkrow'] },
      ace: { form: 'honchkrow', level: 73, giant: true, sig: { move: 'Night Slash + Sky Attack', aoe: 140, reach: 120 } } },
    // Spear Pillar — Cyrus's ritual: DIALGA at the usual 70 % / 90 s, PALKIA at its own 40 % threshold (never both in one counter-burst;
    // the Seafloor Cavern ruling: if a sim fails here, cut pack density — never the aces)
    { id: 'sinnoh_17_spear_pillar', name: 'Spear Pillar', place: 'Mt. Coronet', leader: 'Mars & Jupiter', mapLabel: 'Spear Pillar', kind: 'trainer', level: 73, background: 'spear_pillar', townMusic: 'town_celestic',
      drops: L({ moon_stone: 2, ice_stone: 1 }),
      waves: [W('bronzor', 70, 4, 11), W('golbat', 70, 8, 11), W('graveler', 70, 12, 12), W('machoke', 71, 20, 14), W('medicham', 71, 26, 15), W('lunatone', 71, 30, 16), W('solrock', 71, 32, 16), W('purugly', 72, 40, 20), W('skuntank', 72, 44, 20), W('bronzong', 73, 50, 22), W('dragonair', 73, 56, 24)],
      gate: { by: 'time', at: 40, forms: ['purugly', 'skuntank', 'bronzong', 'dragonair', 'dialga', 'palkia'] },
      burst: { pack: [1, 2], trickle: 3.2, size: [2, 3], counterSize: 2 }, // the two box legendaries are the event (the Seafloor shape)
      ace: { form: 'dialga', level: 73, giant: true, sig: { move: 'Roar of Time', aoe: 140, reach: 240 } },
      extraAces: [{ form: 'palkia', level: 73, giant: true, at: 0.4, sig: { move: 'Spacial Rend', aoe: 140, reach: 240 } }] },
    { id: 'sinnoh_18_distortion_world', name: 'Distortion World', place: 'Turnback Cave', leader: 'Cyrus', mapLabel: 'Distortion World', kind: 'trainer', level: 74, background: 'distortion_world', townMusic: 'town_celestic',
      drops: L({ moon_stone: 2, shiny_stone: 1 }),
      waves: [W('gastly', 71, 4, 10), W('duskull', 71, 8, 11), W('drifloon', 71, 12, 11), W('misdreavus', 71, 16, 12), W('bronzor', 71, 20, 12), W('chimecho', 72, 26, 14), W('haunter', 72, 32, 16), W('dusclops', 73, 40, 18), W('drifblim', 73, 44, 18), W('houndoom', 73, 50, 20), W('crobat', 73, 54, 20), W('honchkrow', 74, 60, 22), W('gyarados', 74, 66, 26)],
      gate: { by: 'hp', at: 0.9, forms: ['dusclops', 'drifblim', 'houndoom', 'crobat', 'honchkrow', 'gyarados', 'weavile'] },
      ace: { form: 'weavile', level: 74, giant: true, sig: { move: 'Night Slash + Ice Punch', aoe: 140, status: 'freeze', reach: 90 } } },
    { id: 'sinnoh_19_volkner', name: 'Sunyshore Gym', leader: 'Volkner', kind: 'gym', level: 74, background: 'gym_volkner', townMusic: 'town_sunyshore',
      drops: L({ thunder_stone: 3, water_stone: 1 }),
      waves: [W('shinx', 71, 4, 10), W('pachirisu', 71, 9, 11), W('magnemite', 71, 14, 12), W('chinchou', 71, 18, 12), W('electrike', 71, 22, 13), W('flaaffy', 72, 28, 14), W('luxio', 72, 32, 15), W('magneton', 73, 40, 18), W('lanturn', 73, 46, 18), W('jolteon', 73, 50, 20), W('raichu', 74, 56, 20), W('luxray', 74, 62, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['magneton', 'lanturn', 'jolteon', 'raichu', 'luxray', 'electivire'] },
      ace: { form: 'electivire', level: 74, giant: true, sig: { move: 'Thunder Punch', aoe: 150, status: 'paralyze', reach: 100 } } },
    // the Elite Four as FOUR nodes (the Kanto / Hoenn pattern); their bases share the 'e4' base
    { id: 'sinnoh_20_aaron', name: 'Elite Four', leader: 'Aaron', kind: 'e4', level: 75, background: 'e4_aaron', townMusic: 'town_sinnoh_league',
      drops: L({ leaf_stone: 2, metal_coat: 1 }),
      waves: [W('combee', 72, 4, 10), W('kricketune', 72, 8, 11), W('skorupi', 72, 14, 13), W('yanma', 72, 20, 14), W('beautifly', 73, 26, 15), W('dustox', 73, 30, 15), W('vespiquen', 74, 38, 18), W('heracross', 74, 44, 18), W('scizor', 74, 50, 20), W('yanmega', 74, 56, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['vespiquen', 'heracross', 'scizor', 'yanmega', 'drapion'] },
      ace: { form: 'drapion', level: 75, giant: true, sig: { move: 'Cross Poison', aoe: 150, status: 'poison', reach: 100 } } },
    { id: 'sinnoh_21_bertha', name: 'Elite Four', leader: 'Bertha', kind: 'e4', level: 75, background: 'e4_bertha', townMusic: 'town_sinnoh_league',
      drops: L({ moon_stone: 1, water_stone: 1, metal_coat: 1 }),
      waves: [W('hippopotas', 72, 4, 10), W('gligar', 72, 8, 11), W('barboach', 72, 12, 11), W('rhyhorn', 72, 18, 13), W('gabite', 73, 26, 15), W('quagsire', 73, 30, 15), W('whiscash', 74, 38, 18), W('gliscor', 74, 44, 18), W('hippowdon', 74, 50, 20), W('golem', 74, 56, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['whiscash', 'gliscor', 'hippowdon', 'golem', 'rhyperior'] },
      ace: { form: 'rhyperior', level: 75, giant: true, sig: { move: 'Rock Wrecker', aoe: 160, reach: 140 } } },
    { id: 'sinnoh_22_flint', name: 'Elite Four', leader: 'Flint', kind: 'e4', level: 75, background: 'e4_flint', townMusic: 'town_sinnoh_league',
      drops: L({ fire_stone: 3, moon_stone: 1 }),
      waves: [W('houndour', 72, 4, 10), W('ponyta', 72, 8, 10), W('growlithe_hisui', 72, 12, 11), W('slugma', 72, 16, 12), W('numel', 72, 20, 12), W('monferno', 73, 26, 14), W('magmar', 73, 32, 16), W('rapidash', 74, 38, 18), W('flareon', 74, 44, 18), W('houndoom', 74, 50, 20), W('infernape', 74, 56, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['rapidash', 'flareon', 'houndoom', 'infernape', 'magmortar'] },
      ace: { form: 'magmortar', level: 75, giant: true, sig: { move: 'Fire Blast', aoe: 160, status: 'burn', reach: 240 } } },
    { id: 'sinnoh_23_lucian', name: 'Elite Four', leader: 'Lucian', kind: 'e4', level: 75, background: 'e4_lucian', townMusic: 'town_sinnoh_league',
      drops: L({ dawn_stone: 2, moon_stone: 1 }),
      waves: [W('bronzor', 72, 4, 10), W('kirlia', 72, 8, 11), W('girafarig', 72, 14, 13), W('chimecho', 72, 20, 14), W('kadabra', 73, 26, 15), W('xatu', 73, 32, 16), W('mr_mime', 74, 38, 18), W('espeon', 74, 44, 18), W('bronzong', 74, 50, 20), W('alakazam', 74, 56, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['mr_mime', 'espeon', 'bronzong', 'alakazam', 'gallade'] },
      ace: { form: 'gallade', level: 75, giant: true, sig: { move: 'Psycho Cut + Leaf Blade', aoe: 160, reach: 100 } } },
    // the Champion (Cynthia): first clear = GIRATINA (rewardOnly — Mewtwo → Lugia → Rayquaza → Giratina) + the region's Master Ball;
    // Sinnoh counts as beaten (regionsDone.sinnoh) — which opens UNOVA (cap 80). The giant ace is MEGA GARCHOMP (U4; also her Menace: GIANT).
    { id: 'sinnoh_24_champion', name: 'Champion', leader: 'Cynthia', kind: 'champion', level: 75, background: 'champion_room', townMusic: 'town_sinnoh_league',
      drops: L({ dawn_stone: 1, shiny_stone: 1, moon_stone: 1 }),
      waves: [W('gible', 72, 4, 11), W('riolu', 72, 8, 12), W('budew', 72, 12, 12), W('gabite', 73, 20, 14), W('togetic', 73, 26, 15), W('roserade', 74, 32, 16), W('spiritomb', 74, 38, 18), W('lucario', 74, 44, 20), W('togekiss', 74, 50, 20), W('milotic', 75, 56, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['roserade', 'spiritomb', 'lucario', 'togekiss', 'milotic', 'garchomp_mega'] },
      ace: { form: 'garchomp_mega', level: 75, giant: true, sig: { move: 'Dragon Rush', aoe: 170, reach: 110 } }, gift: 'giratina', regionFinal: true },
    // 25 — the CAPSTONE: "The rift to Hisui" (the pack's option A setting; U2 moved Arceus to node 26). The Noble Hisuian Arcanine is
    // the giant ace, the chieftain Kleavor a twin ace at its own 40 %; no leader (a capstone, like the Sky Pillar — no menace / last stand).
    { id: 'sinnoh_25_hisui_rift', name: 'The Rift to Hisui', place: 'above Spear Pillar', mapLabel: 'Hisui Rift', kind: 'champion', level: 75, background: 'hisui_rift', townMusic: 'town_celestic', gift: 'cyndaquil_typhlosion_hisui',
      drops: L({ fire_stone: 2, leaf_stone: 1, moon_stone: 1 }),
      waves: [W('voltorb_hisui', 72, 4, 11), W('growlithe_hisui', 72, 8, 11), W('qwilfish_hisui', 72, 12, 12), W('sneasel_hisui', 73, 18, 13), W('electrode_hisui', 73, 26, 15), W('overqwil', 74, 32, 16), W('wyrdeer', 74, 38, 18), W('sneasler', 74, 44, 20), W('ursaluna', 75, 52, 22), W('typhlosion_hisui', 75, 60, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['overqwil', 'wyrdeer', 'sneasler', 'ursaluna', 'typhlosion_hisui', 'arcanine_hisui', 'kleavor'] },
      burst: { pack: [3, 4], trickle: 1.1, size: [5, 6], counterSize: 5 }, // the capstone: the region's densest defence (the Sky Pillar shape)
      ace: { form: 'arcanine_hisui', level: 75, giant: true, sig: { move: 'Raging Fury', aoe: 170, status: 'burn', reach: 120 } },
      extraAces: [{ form: 'kleavor', level: 75, giant: true, at: 0.4, sig: { move: 'Stone Axe', aoe: 160, reach: 100 } }],
      prize: { master_ball: 1, xp_candy_l: 3 }, capstone: true },
    // 26 — "THE ORIGINAL ONE" (U2, user-refined): post-game + OPTIONAL. Arceus descends at once (a giant summoner) and calls
    // pseudo-legendary-class guardians while he stands. First clear = Arceus joins the team (rewardOnly). Never on a banner.
    { id: 'sinnoh_26_arceus', name: 'The Original One', place: 'the Hall of Origin', mapLabel: 'The Original One', kind: 'champion', level: 75, background: 'spear_pillar', townMusic: 'town_celestic', gift: 'arceus', optional: true,
      drops: L({ moon_stone: 1, shiny_stone: 1, dawn_stone: 1 }),
      // the field stays THIN (the pseudos' middle forms, slow) so the SUMMONS are the threat: 1–2 Tyranitar / Salamence / Garchomp /
      // Dragonite / Metagross every 13–17 s while Arceus stands (sim: 3/12 for a full native Lv 75 team — very hard, winnable)
      waves: [W('gabite', 74, 4, 16), W('shelgon', 74, 10, 18), W('pupitar', 74, 16, 18), W('metang', 74, 22, 20), W('dragonair', 74, 28, 20)],
      gate: { by: 'time', at: 6, forms: ['arceus', 'shelgon', 'metang', 'dragonair'] }, // Y1: he descends at once (6 s); his heaviest guards wait with him
      burst: { pack: [2, 3], trickle: 1.4, size: [3, 4], counterSize: 3 },
      extraAces: [{ form: 'arceus', level: 75, giant: true, time: 2, sig: { move: 'Judgment', aoe: 180, reach: 280 },
        summon: { pool: ['tyranitar', 'salamence', 'garchomp', 'dragonite', 'metagross'], n: [1, 2], every: [13, 17], first: 12, level: 75 } }],
      postgame: true },
  ];
  // carriers: the AoE / status units mixed into bursts (OOO1 late tier from stage 1, as Johto / Hoenn)
  const CARRIERS = { sinnoh_04_roark: ['geodude'], sinnoh_05_windworks: ['pachirisu'], sinnoh_06_eterna_forest: ['wurmple'], sinnoh_07_gardenia: ['budew'],
    sinnoh_08_fantina: ['gastly'], sinnoh_09_solaceon: ['ralts'], sinnoh_10_maylene: ['meditite'], sinnoh_11_wake: ['croagunk'], sinnoh_12_byron: ['magnemite'],
    sinnoh_13_iron_island: ['tentacool'], sinnoh_14_lakes: ['snover'], sinnoh_15_candice: ['snover'], sinnoh_16_galactic_hq: ['stunky'],
    sinnoh_17_spear_pillar: ['bronzor'], sinnoh_18_distortion_world: ['gastly'], sinnoh_19_volkner: ['shinx'], sinnoh_20_aaron: ['skorupi'],
    sinnoh_21_bertha: ['hippopotas'], sinnoh_22_flint: ['slugma'], sinnoh_23_lucian: ['bronzor'], sinnoh_24_champion: ['budew'], sinnoh_25_hisui_rift: ['voltorb_hisui'] };
  // Z1 enemy bases: the 8 Sinnoh gyms = their own base art (the queued gym bases; the den until each lands); the four E4 rooms reuse
  // the Kanto E4 base; Cynthia, the rift and Arceus the Champion's red-and-gold one (pack C17).
  const BASES = { sinnoh_04_roark: 'gym_roark', sinnoh_07_gardenia: 'gym_gardenia', sinnoh_08_fantina: 'gym_fantina', sinnoh_10_maylene: 'gym_maylene',
    sinnoh_11_wake: 'gym_wake', sinnoh_12_byron: 'gym_byron', sinnoh_15_candice: 'gym_candice', sinnoh_19_volkner: 'gym_volkner',
    sinnoh_20_aaron: 'e4', sinnoh_21_bertha: 'e4', sinnoh_22_flint: 'e4', sinnoh_23_lucian: 'e4', sinnoh_24_champion: 'champion', sinnoh_25_hisui_rift: 'champion', sinnoh_26_arceus: 'champion' };
  // J2-STYLE ENEMY BASE HP for Lv 64–75 (Hoenn's curve carried on: anchors by stage number, geometric between, gym ×1.25, E4 / Champion
  // ×1.4); node 26 (Arceus) the biggest of all.
  // the dial per stage (sim-tuned, see BM.hardenStage above) — leader stages to mid-band; node 26 to "very hard"
  // level-ramp patch: Gardenia (7) left the dial — on the ramp it fell off the cliff (the playthrough team 0/6 at any k), now BM.RAMP_SOFT 4
  // …and Cynthia (24) left it too in Step 5's QA: at the cap with k 1 the end-of-regular team read 0–1/6, at k 0 4/6
  // level-ramp patch BR-117 re-read: on the ramp (an on-level team, the 15 cap) the dialed stages pin the player at the AP cap — Maylene
  // 5/6 only at k ≥ 1.25 with AP-cap 30–56 % (OOO1 guard ≤ 25 %), Wake / Candice / Lucian 6/6 at any k with 31–42 %. The guard wins (A2's
  // rule): Maylene 1.25 → 0.75, Wake 1.5 → 0.5, Candice 1 → 0.5, Lucian 1 → 0.5 — all 6/6 now at AP-cap 6–13 %; Byron stays 0.5
  BM.SINNOH_HARD = { 10: 0.75, 11: 0.5, 12: 0.5, 15: 0.5, 23: 0.5 };
  BM.SINNOH_EB = [[1, 34000], [5, 37000], [10, 40000], [15, 40500], [20, 41000], [25, 43000], [26, 46000]];
  BM.sinnohBaseHP = function (st) {
    const A = BM.SINNOH_EB, n = st.num;
    let v = A[A.length - 1][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; v = y0 * Math.pow(y1 / y0, (Math.max(n, x0) - x0) / (x1 - x0)); break; }
    return Math.round(v * (BM.EB_KIND[st.kind] || 1) / 50) * 50;
  };
  // THE DIFFICULTY DIAL (Sinnoh + Unova prompt: "tunes land mid-band (3/6–5/6), not at the floor; the game should stay hard" — tune the
  // STAGE, never the player). `hard: k` (0–2) on a stage, applied once from a snapshot of its drafted waves / bursts: wave intervals
  // ×(1 − 0.55k), first releases ×(1 − 0.4k), wave levels up to +3k (never above the stage level), the trickle ×(1 − 0.75k), packs and
  // bursts bigger (+2k / +3k), counter-bursts +3k. Aces, menaces, last stands and prices are untouched; the Y1 gate grows with the waves. k per stage is
  // the sim-tuned value recorded in CURRENT_STATE (phase11 / phase12 sim; the bisection tool: HARD='{"<num>": k}').
  BM.hardenStage = function (st, k) {
    st.base = st.base || { waves: st.waves.map((w) => ({ ...w })), burst: { ...st.burst } };
    st.hard = k; const k1 = Math.min(1, k), k2 = Math.max(0, k - 1), B = st.base.burst, lv = (w) => Math.min(st.level, w.level + Math.round(3 * k1));
    // above 1: the first ⌈(k − 1) × n⌉ waves field their species' NEXT canon evolution (same Pokémon, grown up — e.g. Gible → Gabite)
    const up = (id) => { const nx = (BM.EVO_CANON[BM.speciesOf(BM.FORMS[id])] || []).find((e) => BM.FORMS[e] && !BM.FORMS[e].mega); return nx || id; };
    const nUp = Math.ceil(k2 * st.base.waves.length);
    st.waves = st.base.waves.map((w, i) => ({ ...w, form: i < nUp ? up(w.form) : w.form, level: lv(w), start: Math.max(2, Math.round(w.start * (1 - 0.4 * k1))), every: Math.max(4, Math.round(w.every * (1 - 0.55 * k1))) }));
    // the Y1 gate follows the grown-up waves: a gated form's evolution is gated too, and the stage's new top-tier form always is
    if (st.gate) {
      st.base.gate = st.base.gate || [...st.gate.forms];
      const G = new Set(st.base.gate);
      st.base.waves.forEach((w, i) => { if (i < nUp && G.has(w.form)) G.add(up(w.form)); });
      // (a Mega ace registers later, in mega.js — it is already in its stage's drafted gate, so only known forms compete here)
      const v = (id) => BM.FORMS[id].bst + BM.FORMS[id].baseHP, forms = [...st.waves.map((w) => w.form), ...(st.ace ? [st.ace.form] : [])].filter((id) => BM.FORMS[id]);
      G.add(forms.reduce((a, b) => (v(b) > v(a) ? b : a)));
      st.gate = { ...st.gate, forms: [...G] };
    }
    const pk = B.pack || [2, 3], sz = B.size || [3, 4], grow = (a, n) => [a[0] + Math.round(n * k1 * 0.6), a[1] + Math.round(n * k1)];
    st.burst = { ...B, pack: grow(pk, 2), trickle: +((B.trickle || 1.5) * (1 - 0.75 * k1)).toFixed(2), size: grow(sz, 3), counterSize: (B.counterSize || 3) + Math.round(3 * k1) };
    return st;
  };
  S.forEach((st, i) => {
    Object.assign(st, { num: i + 1, region: 'sinnoh', curveAt: 25, packBase: true, music: { wild: 'battle_wild', trainer: 'battle_trainer', gym: 'battle_gym', e4: 'battle_elitefour', champion: 'battle_champion' }[st.kind] });
    st.mapLabel = st.mapLabel || (st.kind === 'e4' ? st.leader : undefined);
    const e4 = ['e4', 'champion'].includes(st.kind);
    st.burst = { pack: e4 ? BM.HOENN_CADENCE.e4pack : BM.HOENN_CADENCE.pack, trickle: e4 ? BM.HOENN_CADENCE.e4trickle : BM.HOENN_CADENCE.trickle, ...(st.burst || {}) };
    st.background = 'sinnoh_' + st.background; // the import keeps a region prefix on non-Kanto backgrounds (import_art.sh)
    if (BASES[st.id]) st.baseArt = BASES[st.id];
    if (CARRIERS[st.id]) BM.STAGE_CARRIERS[st.id] = CARRIERS[st.id];
    st.enemyBaseHP = BM.sinnohBaseHP(st);
  });
  for (const st of S) if (st.mapLabel === undefined) delete st.mapLabel;
  BM.applyRamp(S, BM.CAP_LADDER.sinnoh); // level-ramp patch Step 1 (stages.js): Lv 1 → cap, endgame over the cap — before the dial
  for (const st of S) if (BM.SINNOH_HARD[st.num]) BM.hardenStage(st, BM.SINNOH_HARD[st.num]);
  BM.SINNOH_STAGES = S;
  BM.STAGES.push(...S);
})();
