// GALAR STAGES (Galar + Paldea build) — the 25-node Galar gym challenge from the prep pack's stage-plan.md (Sword / Shield base-game
// order, the version-split gyms BOTH included back-to-back) + node 26, the Isle of Armor's Master Dojo (Kakashi ruling: post-game, optional).
//   Postwick → Wedgehurst (the Slumbering Weald) → Route 2 → the Wild Area (south) → Bede (Galar Mine) → Milo → Hulbury → Nessa → Kabu →
//   the Wild Area (north) · Hammerlocke (the visit) → Bea (Sword) → Allister (Shield) → Glimwood Tangle → Opal → Route 8 → Gordie (Sword)
//   → Melony (Shield) → Route 9 → Piers & Team Yell → Raihan → Route 10 · Wyndon → the Champion Cup: Marnie → Hop (giant RILLABOOM,
//   Cinderace + Inteleon mid-stage elites) → 24 THE DARKEST DAY (Rose's giant Copperajah, then a giant ETERNATUS at its own 40 % — main
//   path, champion-class on the ramp: the N's Castle precedent) → 25 Champion LEON (giant Charizard; the three Galar starter finals as
//   mid-stage elites; first clear = ZACIAN + ZAMAZENTA + the Master Ball — Galar counts as beaten) → 26 the MASTER DOJO (Mustard: giant
//   Urshifu, his team as thin singles; first clear = BOTH Kubfu lines + one of each Scroll; cap + 5, very hard, not required).
//   LEVELS: drafted ON the ramp (Lv 1 → 95 over the 24 regular stages, the plan's Lv column); Leon at the cap; the Dojo cap + 5 (Lv 100).
//   Stages 1–9 (Lv < 38) play under the early-region pass (devolved waves, normal-size aces, no signatures — accepted for gyms).
//   Gyms, the Champion Cup and the Darkest Day: menace + Last Stand on every leader ace (menace.js). DYNAMAX / GIGANTAMAX: absent (ruling).
//   Waves = the location's Sword / Shield encounters (the pack's PokéAPI pools, Max Raid Dens excluded) + the leader's team (recalled).
window.BM = window.BM || {};
(function () {
  const W = BM.waveRow, D = BM.dropTable;
  const M = (stones) => D('mid', stones), L = (stones) => D('late', stones);
  // waves on the ramp: [form, d, start, every, count] → a level d "cap-scale" levels under the stage's (the Alola spread)
  const X = (Lv, rows) => rows.map(([f, d, s, e, c]) => W(f, Math.max(1, Math.round(Lv * (1 - d / 80))), s, e, c));
  const S = [
    { id: 'galar_01_postwick', name: 'Postwick', place: 'Route 1', kind: 'wild', level: 1, background: 'postwick', townMusic: 'town_wedgehurst', gift: 'grookey',
      drops: M({ leaf_stone: 1, water_stone: 1 }),
      waves: X(1, [['skwovet', 0, 4, 10], ['rookidee', 0, 9, 11], ['wooloo', 0, 14, 11], ['blipbug', 0, 24, 14], ['nickit', 0, 30, 16], ['hoothoot', 0, 42, 22]]),
      gate: { by: 'time', at: 35, forms: ['hoothoot'] } },
    { id: 'galar_02_wedgehurst', name: 'Wedgehurst', place: 'the Slumbering Weald', kind: 'wild', level: 5, background: 'slumbering_weald', townMusic: 'town_wedgehurst', gift: 'scorbunny',
      drops: M({ moon_stone: 1, water_stone: 1 }),
      waves: X(5, [['skwovet', 3, 4, 10], ['rookidee', 3, 9, 11], ['blipbug', 3, 14, 11], ['grubbin', 3, 18, 12], ['hoothoot', 2, 22, 12], ['barboach', 2, 28, 13], ['magikarp', 2, 32, 13], ['munna', 1, 36, 14], ['slowpoke_galar', 1, 40, 16], ['stunfisk_galar', 0, 46, 18], ['koffing_weezing_galar', 0, 60, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['stunfisk_galar', 'koffing_weezing_galar'] } },
    { id: 'galar_03_route2', name: 'Route 2', place: "Professor Magnolia's house", kind: 'wild', level: 9, background: 'galar_route_2', townMusic: 'town_wedgehurst', gift: 'sobble',
      drops: M({ water_stone: 1, leaf_stone: 1 }),
      burst: { pack: [1, 2], trickle: 2 }, // the last kid-easy opener
      waves: X(9, [['skwovet', 3, 4, 10], ['nickit', 3, 9, 11], ['zigzagoon_galar', 3, 14, 11], ['yamper', 3, 18, 12], ['gossifleur', 2, 22, 12], ['chewtle', 2, 26, 13], ['arrokuda', 2, 30, 13], ['lotad', 1, 34, 14], ['seedot', 1, 38, 14], ['purrloin', 1, 42, 16], ['hoothoot', 0, 46, 18], ['feebas', 0, 56, 24, 1]]),
      gate: { by: 'time', at: 40, forms: ['hoothoot', 'feebas'] } },
    // the southern Wild Area (Meetup Spot · Rolling Fields · Dappled Grove · Watchtower Ruins · the Axew lakes) — overworld tables only
    { id: 'galar_04_wild_area', name: 'The Wild Area', place: 'Rolling Fields · Dappled Grove', mapLabel: 'Wild Area (south)', kind: 'wild', level: 13, background: 'wild_area_south', townMusic: 'town_motostoke',
      drops: M({ tart_apple: 1, sweet_apple: 1, leaf_stone: 1 }),
      waves: X(13, [['wooloo', 3, 4, 10], ['skwovet', 3, 8, 11], ['bunnelby', 3, 12, 11], ['budew', 3, 16, 12], ['combee', 3, 20, 12], ['joltik', 2, 24, 13], ['electrike', 2, 28, 13], ['dwebble', 2, 32, 14], ['baltoy', 2, 36, 14], ['pikachu', 1, 40, 15], ['growlithe', 1, 46, 16], ['kirlia', 1, 50, 18], ['haunter', 0, 56, 20], ['delibird', 0, 64, 24]]),
      gate: { by: 'time', at: 40, forms: ['growlithe', 'kirlia', 'haunter', 'delibird'] } },
    // Motostoke · Route 3 · the Galar Mine: BEDE, Chairman Rose's endorsed challenger (Solosis, Gothita, Hatenna — recalled)
    { id: 'galar_05_bede', name: 'Galar Mine', place: 'Motostoke · Route 3', leader: 'Bede', mapLabel: 'Galar Mine', kind: 'trainer', level: 17, background: 'galar_mine', townMusic: 'town_motostoke', item: 'galarica_cuff', // Act 3: a guaranteed first-clear Galarica Cuff (Galarian Slowpoke meets you at Wedgehurst; the random drop alone left it unevolved in the playthrough sim)
      drops: M({ fire_stone: 1, moon_stone: 1 }),
      waves: X(17, [['rolycoly', 3, 4, 10], ['skwovet', 3, 8, 11], ['sizzlipede', 3, 12, 11], ['roggenrola', 3, 16, 12], ['croagunk', 3, 20, 12], ['impidimp', 2, 24, 13], ['solosis', 2, 28, 13], ['gothita', 2, 32, 14], ['carkol', 1, 38, 15], ['scraggy', 1, 44, 16], ['sudowoodo', 0, 50, 18], ['sawk', 0, 56, 20], ['throh', 0, 60, 20]]),
      gate: { by: 'time', at: 40, forms: ['carkol', 'sudowoodo', 'sawk', 'throh', 'hatenna'] },
      ace: { form: 'hatenna', level: 17, giant: true, sig: { move: 'Confusion', aoe: 110, status: 'sleep', reach: 160 } } },
    // G1 — Turffield: Gym Leader MILO (Grass)
    { id: 'galar_06_milo', name: 'Turffield Stadium', place: 'Route 4 · Turffield', leader: 'Milo', kind: 'gym', level: 21, background: 'gym_milo', townMusic: 'town_turffield',
      drops: M({ leaf_stone: 3, moon_stone: 1 }),
      waves: X(21, [['gossifleur', 3, 4, 10], ['wooloo', 3, 9, 11], ['budew', 3, 14, 12], ['cherubi', 3, 18, 12], ['cutiefly', 2, 22, 13], ['ferroseed', 2, 26, 13], ['pumpkaboo', 2, 30, 14], ['milcery', 1, 36, 15], ['yamper', 1, 40, 16], ['dubwool', 0, 48, 18]]),
      gate: { by: 'hp', at: 0.9, forms: ['milcery', 'dubwool', 'eldegoss'] },
      ace: { form: 'eldegoss', level: 21, giant: true, sig: { move: 'Cotton Spore + Leaf Tornado', aoe: 110, status: 'poison', reach: 100 } } },
    { id: 'galar_07_hulbury', name: 'Hulbury', place: 'Route 5 · Galar Mine No. 2', kind: 'wild', level: 26, background: 'hulbury', townMusic: 'town_hulbury', item: 'galarica_wreath', // Act 3: the Slowking branch's item, guaranteed on the first clear (same reason)
      drops: M({ tart_apple: 1, sweet_apple: 1, galarica_cuff: 1, water_stone: 1 }),
      waves: X(26, [['arrokuda', 3, 4, 10], ['chewtle', 3, 8, 11], ['skwovet', 3, 12, 11], ['goldeen', 3, 16, 12], ['corphish', 3, 20, 12], ['binacle', 2, 24, 13], ['applin', 2, 28, 13], ['dottler', 2, 32, 14], ['farfetchd_galar', 2, 36, 14], ['chinchou', 1, 40, 15], ['drifloon', 1, 46, 16], ['stunfisk_galar', 0, 52, 18], ['wobbuffet', 0, 60, 24, 1]]),
      gate: { by: 'time', at: 40, forms: ['drifloon', 'stunfisk_galar', 'wobbuffet'] } },
    // G2 — Hulbury: Gym Leader NESSA (Water)
    { id: 'galar_08_nessa', name: 'Hulbury Stadium', place: "Nessa's gym", leader: 'Nessa', kind: 'gym', level: 30, background: 'gym_nessa', townMusic: 'town_hulbury',
      drops: M({ water_stone: 2, scroll_of_waters: 1 }),
      waves: X(30, [['chewtle', 3, 4, 10], ['arrokuda', 3, 9, 11], ['goldeen', 3, 14, 12], ['binacle', 3, 18, 12], ['shellos', 2, 22, 13], ['corphish', 2, 26, 13], ['wimpod', 2, 30, 14], ['barboach', 1, 36, 15], ['croagunk', 1, 42, 16], ['barraskewda', 0, 48, 18], ['gastrodon', 0, 54, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['barraskewda', 'gastrodon', 'drednaw'] },
      ace: { form: 'drednaw', level: 30, giant: true, sig: { move: 'Jaw Lock + Razor Shell', aoe: 120, reach: 90 } } },
    // G3 — Motostoke: Gym Leader KABU (Fire) — the last gym under the early-region pass
    { id: 'galar_09_kabu', name: 'Motostoke Stadium', place: 'Motostoke Riverbank', leader: 'Kabu', kind: 'gym', level: 34, background: 'gym_kabu', townMusic: 'town_motostoke',
      drops: M({ fire_stone: 2, moon_stone: 1 }),
      waves: X(34, [['sizzlipede', 3, 4, 10], ['rolycoly', 3, 9, 11], ['growlithe', 3, 14, 12], ['vulpix', 3, 18, 12], ['salandit', 2, 22, 13], ['litwick', 2, 26, 13], ['carkol', 2, 30, 14], ['torkoal', 1, 36, 15], ['heatmor', 1, 42, 16], ['ninetales', 0, 48, 18], ['arcanine', 0, 54, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['ninetales', 'arcanine', 'centiskorch'] },
      ace: { form: 'centiskorch', level: 34, giant: true, sig: { move: 'Fire Lash', aoe: 120, status: 'burn', reach: 100 } } },
    // the northern Wild Area (Bridge Field · Giant's Seat · Dusty Bowl · Hammerlocke Hills) + the Hammerlocke VISIT — the first full-rules stage
    { id: 'galar_10_hammerlocke', name: 'Hammerlocke', place: "the Wild Area (north) · Giant's Seat", mapLabel: 'Wild Area (north)', kind: 'wild', level: 38, background: 'hammerlocke', townMusic: 'town_hammerlocke',
      drops: M({ thunder_stone: 1, fire_stone: 1, water_stone: 1 }),
      waves: X(38, [['skwovet', 3, 4, 10], ['nickit', 3, 8, 11], ['rookidee', 3, 12, 11], ['wooloo', 3, 16, 12], ['cufant', 3, 20, 12], ['silicobra', 2, 24, 13], ['hatenna', 2, 28, 13], ['impidimp', 2, 32, 14], ['applin', 2, 36, 14], ['corvisquire', 1, 40, 15], ['hattrem', 1, 46, 16], ['cramorant', 1, 50, 16], ['sandaconda', 0, 56, 18], ['duraludon', 0, 64, 24, 1], ['coalossal', 0, 68, 24, 1]]),
      gate: { by: 'time', at: 40, forms: ['cramorant', 'sandaconda', 'duraludon', 'coalossal'] } },
    // G4 (SWORD) — Stow-on-Side: Gym Leader BEA (Fighting); Sirfetch'd a mid-stage single
    { id: 'galar_11_bea', name: 'Stow-on-Side Stadium', place: 'Route 6 · Stow-on-Side', leader: 'Bea', kind: 'gym', level: 42, background: 'gym_bea', townMusic: 'town_stow_on_side',
      drops: M({ scroll_of_darkness: 2, moon_stone: 1 }),
      waves: X(42, [['clobbopus', 3, 4, 10], ['machop', 3, 9, 11], ['farfetchd_galar', 3, 14, 12], ['pancham', 3, 18, 12], ['silicobra', 2, 22, 13], ['trapinch', 2, 26, 13], ['hawlucha', 2, 30, 14], ['machoke', 1, 36, 15], ['hitmontop', 1, 42, 16], ['pangoro', 0, 48, 18], ['sirfetchd', 0, 56, 28, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['hitmontop', 'pangoro', 'sirfetchd', 'machamp'] },
      ace: { form: 'machamp', level: 42, giant: true, sig: { move: 'Close Combat', aoe: 140, reach: 100 } } },
    // G4 (SHIELD) — Stow-on-Side: Gym Leader ALLISTER (Ghost), back-to-back with Bea; Cursola a mid-stage single
    { id: 'galar_12_allister', name: 'Stow-on-Side Stadium', place: "Allister's gym", leader: 'Allister', kind: 'gym', level: 46, background: 'gym_allister', townMusic: 'town_stow_on_side',
      drops: M({ cracked_pot: 2, dusk_stone: 1 }),
      waves: X(46, [['yamask_galar', 3, 4, 10], ['sinistea', 3, 9, 11], ['duskull', 3, 14, 12], ['gastly', 3, 18, 12], ['drifloon', 2, 22, 13], ['litwick', 2, 26, 13], ['pumpkaboo', 2, 30, 14], ['haunter', 1, 36, 15], ['runerigus', 1, 42, 16], ['mimikyu', 0, 48, 18], ['cursola', 0, 56, 28, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['runerigus', 'mimikyu', 'cursola', 'gengar'] },
      ace: { form: 'gengar', level: 46, giant: true, sig: { move: 'Shadow Ball + Hypnosis', aoe: 140, status: 'sleep', reach: 220 } } },
    { id: 'galar_13_glimwood', name: 'Glimwood Tangle', kind: 'wild', level: 50, background: 'glimwood_tangle', townMusic: 'town_ballonlea',
      drops: M({ cracked_pot: 1, galarica_cuff: 1, shiny_stone: 1 }),
      waves: X(50, [['impidimp', 3, 4, 10], ['spritzee', 3, 8, 11], ['swirlix', 3, 12, 11], ['hatenna', 3, 16, 12], ['ponyta_galar', 3, 20, 12], ['sinistea', 2, 24, 13], ['phantump', 2, 28, 13], ['slowpoke_galar', 2, 32, 14], ['indeedee', 1, 38, 15], ['morgrem', 1, 42, 16], ['hattrem', 1, 46, 16], ['shiinotic', 0, 52, 18], ['oranguru', 0, 58, 20], ['passimian', 0, 62, 22]]),
      gate: { by: 'time', at: 40, forms: ['shiinotic', 'oranguru', 'passimian'] } },
    // G5 — Ballonlea: Gym Leader OPAL (Fairy); Togekiss a mid-stage single
    { id: 'galar_14_opal', name: 'Ballonlea Stadium', place: "Opal's gym", leader: 'Opal', kind: 'gym', level: 54, background: 'gym_opal', townMusic: 'town_ballonlea',
      drops: M({ galarica_wreath: 2, shiny_stone: 1 }),
      waves: X(54, [['milcery', 3, 4, 10], ['impidimp', 3, 9, 11], ['spritzee', 3, 14, 12], ['swirlix', 3, 18, 12], ['ponyta_galar', 2, 22, 13], ['hattrem', 2, 26, 13], ['morgrem', 2, 30, 14], ['weezing_galar', 1, 36, 15], ['mawile', 1, 42, 16], ['rapidash_galar', 0, 48, 18], ['togekiss', 0, 56, 28, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['mawile', 'rapidash_galar', 'togekiss', 'alcremie'] },
      ace: { form: 'alcremie', level: 54, giant: true, sig: { move: 'Decorate + Dazzling Gleam', aoe: 140, status: 'sleep', reach: 200 } } },
    { id: 'galar_15_route8', name: 'Steamdrift Way', place: 'Routes 7–8', kind: 'wild', level: 58, background: 'steamdrift_way', townMusic: 'town_circhester',
      drops: L({ galarica_wreath: 1, ice_stone: 1, moon_stone: 1 }),
      waves: X(58, [['skwovet', 3, 4, 10], ['nickit', 3, 8, 11], ['snom', 3, 12, 11], ['darumaka_galar', 3, 16, 12], ['rufflet', 3, 20, 12], ['pawniard', 3, 24, 13], ['golett', 2, 28, 13], ['falinks', 2, 32, 14], ['morpeko', 2, 36, 14], ['sandaconda', 1, 40, 15], ['perrserker', 1, 44, 16], ['galvantula', 1, 48, 16], ['greedent', 0, 52, 18], ['hippowdon', 0, 58, 20], ['seismitoad', 0, 64, 22]]),
      gate: { by: 'time', at: 40, forms: ['greedent', 'hippowdon', 'seismitoad'] } },
    // G6 (SWORD) — Circhester: Gym Leader GORDIE (Rock); Stonjourner a mid-stage single
    { id: 'galar_16_gordie', name: 'Circhester Stadium', place: "Gordie's gym", leader: 'Gordie', kind: 'gym', level: 62, background: 'gym_gordie', townMusic: 'town_circhester',
      drops: L({ moon_stone: 2, fire_stone: 1 }),
      waves: X(62, [['rolycoly', 3, 4, 10], ['roggenrola', 3, 9, 11], ['dwebble', 3, 14, 12], ['binacle', 3, 18, 12], ['carkol', 2, 22, 13], ['boldore', 2, 26, 13], ['shuckle', 2, 30, 14], ['crustle', 1, 36, 15], ['barbaracle', 1, 42, 16], ['gigalith', 0, 48, 18], ['stonjourner', 0, 56, 28, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['barbaracle', 'gigalith', 'stonjourner', 'coalossal'] },
      ace: { form: 'coalossal', level: 62, giant: true, sig: { move: 'Tar Shot + Heat Crash', aoe: 150, reach: 100 } } },
    // G6 (SHIELD) — Circhester: Gym Leader MELONY (Ice), back-to-back with Gordie (mother and son)
    { id: 'galar_17_melony', name: 'Circhester Stadium', place: "Melony's gym", leader: 'Melony', kind: 'gym', level: 66, background: 'gym_melony', townMusic: 'town_circhester',
      drops: L({ ice_stone: 3, water_stone: 1 }),
      waves: X(66, [['snom', 3, 4, 10], ['darumaka_galar', 3, 9, 11], ['snorunt', 3, 14, 12], ['snover', 3, 18, 12], ['delibird', 2, 22, 13], ['sneasel', 2, 26, 13], ['vanillish', 2, 30, 14], ['eiscue', 1, 36, 15], ['frosmoth', 1, 42, 16], ['darmanitan_galar', 0, 48, 18], ['abomasnow', 0, 54, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['frosmoth', 'darmanitan_galar', 'abomasnow', 'lapras'] },
      ace: { form: 'lapras', level: 66, giant: true, sig: { move: 'Ice Beam', aoe: 150, status: 'freeze', reach: 200 } } },
    { id: 'galar_18_route9', name: 'Circhester Bay', place: 'Route 9 · Outer Spikemuth', kind: 'wild', level: 70, background: 'circhester_bay', townMusic: 'town_spikemuth',
      drops: L({ scroll_of_waters: 2, water_stone: 1 }),
      waves: X(70, [['zigzagoon_galar', 3, 4, 10], ['nickit', 3, 8, 11], ['scraggy', 3, 12, 11], ['clobbopus', 3, 16, 12], ['remoraid', 3, 20, 12], ['wailmer', 3, 24, 13], ['mareanie', 2, 28, 13], ['pincurchin', 2, 32, 14], ['bergmite', 2, 36, 14], ['cramorant', 1, 40, 15], ['linoone_galar', 1, 44, 16], ['jellicent', 1, 48, 16], ['toxapex', 0, 52, 18], ['grapploct', 0, 58, 20], ['lapras', 0, 64, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['toxapex', 'grapploct', 'lapras'] } },
    // G7 — Spikemuth: Gym Leader PIERS + Team Yell (Dark) — no stadium, the street IS the gym; the grunts are the early waves
    { id: 'galar_19_piers', name: 'Spikemuth', place: 'Piers & Team Yell', leader: 'Piers', kind: 'gym', level: 75, background: 'gym_piers', townMusic: 'town_spikemuth',
      drops: L({ scroll_of_darkness: 2, dusk_stone: 1 }),
      waves: X(75, [['zigzagoon_galar', 3, 4, 10], ['nickit', 3, 9, 11], ['scraggy', 3, 14, 12], ['croagunk', 3, 18, 12], ['purrloin', 2, 22, 13], ['linoone_galar', 2, 26, 13], ['stunky', 2, 30, 14], ['liepard', 1, 36, 15], ['thievul', 1, 40, 15], ['scrafty', 1, 44, 16], ['skuntank', 0, 50, 18], ['malamar', 0, 56, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['scrafty', 'skuntank', 'malamar', 'obstagoon'] },
      ace: { form: 'obstagoon', level: 75, giant: true, sig: { move: 'Obstruct + Throat Chop', aoe: 150, reach: 100 } } },
    // G8 — Hammerlocke: Gym Leader RAIHAN (Dragon), the toughest Gym Leader
    { id: 'galar_20_raihan', name: 'Hammerlocke Stadium', place: "Raihan's gym", leader: 'Raihan', kind: 'gym', level: 79, background: 'gym_raihan', townMusic: 'town_hammerlocke',
      drops: L({ moon_stone: 2, metal_coat: 1 }),
      waves: X(79, [['axew', 3, 4, 10], ['trapinch', 3, 9, 11], ['applin', 3, 14, 12], ['silicobra', 3, 18, 12], ['dreepy', 2, 22, 13], ['noibat', 2, 26, 13], ['fraxure', 2, 30, 14], ['flapple', 1, 36, 15], ['appletun', 1, 40, 15], ['gigalith', 1, 44, 16], ['sandaconda', 0, 50, 18], ['flygon', 0, 56, 20], ['drakloak', 0, 60, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['gigalith', 'sandaconda', 'flygon', 'duraludon'] },
      ace: { form: 'duraludon', level: 79, giant: true, sig: { move: 'Flash Cannon + Dragon Tail', aoe: 160, reach: 110 } } },
    { id: 'galar_21_route10', name: 'Wyndon', place: 'Route 10', kind: 'wild', level: 83, background: 'galar_route_10', townMusic: 'town_wyndon',
      drops: L({ ice_stone: 2, moon_stone: 1 }),
      waves: X(83, [['snom', 3, 4, 10], ['snover', 3, 8, 11], ['cubchoo', 3, 12, 11], ['darumaka_galar', 3, 16, 12], ['vanillish', 3, 20, 12], ['sneasel', 2, 24, 13], ['klang', 2, 28, 13], ['mr_mime_galar', 2, 32, 14], ['eiscue', 1, 38, 15], ['stonjourner', 1, 44, 16], ['glalie', 1, 48, 16], ['beartic', 0, 52, 18], ['rhydon', 0, 58, 20], ['duraludon', 0, 64, 24, 1], ['vanilluxe', 0, 68, 22]]),
      gate: { by: 'time', at: 40, forms: ['beartic', 'rhydon', 'duraludon', 'vanilluxe'] } },
    // CC — Wyndon Stadium, the Champion Cup semifinal: MARNIE (Team Yell cheering her on) — a leader stage on the ramp (C3)
    { id: 'galar_22_marnie', name: 'Wyndon Stadium', place: 'Champion Cup: Marnie', leader: 'Marnie', kind: 'gym', level: 87, background: 'wyndon_stadium', townMusic: 'town_galar_league',
      drops: L({ dusk_stone: 2, moon_stone: 1 }),
      waves: X(87, [['purrloin', 3, 4, 10], ['croagunk', 3, 9, 11], ['scraggy', 3, 14, 12], ['impidimp', 3, 18, 12], ['zigzagoon_galar', 2, 22, 13], ['nickit', 2, 26, 13], ['morpeko', 2, 30, 14], ['morgrem', 1, 36, 15], ['thievul', 1, 40, 15], ['liepard', 1, 44, 16], ['toxicroak', 0, 50, 18], ['scrafty', 0, 56, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['liepard', 'toxicroak', 'scrafty', 'grimmsnarl'] },
      ace: { form: 'grimmsnarl', level: 87, giant: true, sig: { move: 'Spirit Break + False Surrender', aoe: 160, reach: 110 } } },
    // CC — Wyndon Stadium, the Champion Cup SEMIFINAL (the second match, after Marnie): HOP (Dubwool, Corviknight, Pincurchin, Snorlax +
    // his starter final — in canon the one WEAK to the player's). Here a giant RILLABOOM ace with Cinderace + Inteleon as mid-stage elites
    // (the Kukui Incineroar precedent — the engine cannot pick by the player's starter). BEDE's Champion Cup finals-round Hatterene folds
    // in as a mid-stage single (his Mawile / Gardevoir / Galarian Rapidash: comment only).
    { id: 'galar_23_hop', name: 'Wyndon Stadium', place: 'Champion Cup: Hop', leader: 'Hop', kind: 'gym', level: 91, background: 'wyndon_stadium_final', townMusic: 'town_galar_league',
      drops: L({ leaf_stone: 1, fire_stone: 1, water_stone: 1 }),
      waves: X(91, [['wooloo', 3, 4, 10], ['rookidee', 3, 9, 11], ['pincurchin', 3, 14, 12], ['corvisquire', 3, 18, 12], ['thwackey', 2, 22, 13], ['raboot', 2, 26, 13], ['drizzile', 2, 30, 14], ['dubwool', 1, 36, 15], ['corviknight', 1, 40, 16], ['snorlax', 0, 46, 18], ['hatterene', 0, 50, 30, 1], ['cinderace', 0, 54, 26, 1], ['inteleon', 0, 60, 26, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['corviknight', 'snorlax', 'hatterene', 'cinderace', 'inteleon', 'rillaboom'] },
      ace: { form: 'rillaboom', level: 91, giant: true, sig: { move: 'Drum Beating + Wood Hammer', aoe: 160, reach: 110 } } },
    // 24 — THE DARKEST DAY (Rose Tower · the Energy Plant): Chairman ROSE's giant Copperajah at the usual 70 % / 90 s, then a giant
    // ETERNATUS at its own 40 % (MAIN PATH — user ruling; Eternamax = dressing only: the Eternatus sheet at giant scale). Champion-class
    // on the ramp as the LAST REGULAR stage (`ramp: 'regular'`, the N's Castle precedent) — not the region final. Rose's Escavalier /
    // Ferrothorn / Perrserker mid-stage singles; Macro Cosmos staff + the Darkest Day's wild surge (Corviknight, Duraludon, Dragapult).
    { id: 'galar_24_eternatus', name: 'The Darkest Day', place: 'Rose Tower · the Energy Plant', leader: 'Rose', mapLabel: 'Energy Plant', kind: 'champion', ramp: 'regular', level: 95, background: 'energy_plant', townMusic: 'town_wyndon',
      drops: L({ metal_coat: 2, moon_stone: 1 }),
      waves: X(95, [['klink', 3, 4, 12], ['ferroseed', 3, 9, 13], ['bronzor', 3, 14, 14], ['cufant', 3, 20, 15], ['klang', 2, 28, 16], ['escavalier', 1, 40, 30, 1], ['ferrothorn', 1, 46, 30, 1], ['perrserker', 0, 52, 30, 1], ['klinklang', 0, 60, 24], ['dragapult', 0, 80, 40, 1]]), // Act 3 (pack C17: cut density, never the aces): the Darkest Day's wild surge thinned to ONE Dragapult; Corviknight / Bronzong / Duraludon rows out
      gate: { by: 'hp', at: 0.9, forms: ['klinklang', 'dragapult', 'copperajah', 'eternatus'] },
      burst: { pack: [1, 2], trickle: 3.2, size: [2, 3], counterSize: 2 }, // the legendary is the event (the Lusamine / Seafloor shape)
      ace: { form: 'copperajah', level: 95, giant: true, sig: { move: 'Heavy Slam + Iron Head', aoe: 160, reach: 110 } },
      extraAces: [{ form: 'eternatus', level: 95, giant: true, at: 0.4, sig: { move: 'Eternabeam + Sludge Bomb', aoe: 170, status: 'poison', reach: 280 } }] },
    // 25 — the Champion: LEON (Wyndon Stadium). Canon: always Aegislash, Dragapult, Haxorus, Charizard + a starter-dependent pair
    // (Seismitoad + Cinderace / Mr. Rime + Inteleon / Rhyperior + Rillaboom) — here Seismitoad, Rhyperior and Mr. Rime come as singles and
    // the three starter finals as mid-stage elites, with a giant CHARIZARD ace (G-Max out). First clear =
    // ZACIAN + ZAMAZENTA (both reward lines, giftLevel 70) + the region's Master Ball; Galar counts as beaten (regionsDone.galar).
    { id: 'galar_25_leon', name: 'Champion', place: 'Wyndon Stadium', leader: 'Leon', kind: 'champion', level: 95, background: 'champion_leon', townMusic: 'town_galar_league', gift: 'zacian', gift2: 'zamazenta',
      drops: L({ fire_stone: 2, dawn_stone: 1, moon_stone: 1 }),
      waves: X(95, [['honedge', 3, 4, 11], ['dreepy', 3, 8, 12], ['axew', 3, 12, 12], ['doublade', 2, 18, 14], ['drakloak', 2, 22, 14], ['fraxure', 2, 26, 15], ['haxorus', 1, 32, 16], ['seismitoad', 1, 38, 30, 1], ['rhyperior', 1, 42, 30, 1], ['mr_rime', 1, 46, 30, 1], ['aegislash', 0, 50, 20], ['dragapult', 0, 54, 20], ['rillaboom', 0, 60, 30, 1], ['cinderace', 0, 66, 30, 1], ['inteleon', 0, 72, 30, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['seismitoad', 'rhyperior', 'mr_rime', 'aegislash', 'dragapult', 'rillaboom', 'cinderace', 'inteleon', 'charizard'] },
      ace: { form: 'charizard', level: 95, giant: true, sig: { move: 'Fire Blast + Air Slash', aoe: 170, status: 'burn', reach: 260 } }, regionFinal: true },
    // 26 — the MASTER DOJO (Isle of Armor; Kakashi ruling — post-game + OPTIONAL, cap + 5 = Lv 100, the Arceus / Necrozma shape): MUSTARD's
    // team (Mienshao, Luxray, Lycanroc, Corviknight, Kommo-o — canon, verified) as thin mid-stage singles, a GIANT URSHIFU (Single Strike) ace. Very hard by
    // design, not required, unlocks nothing else. First clear = BOTH Kubfu lines (they left the banners) + one Scroll of each style.
    { id: 'galar_26_dojo', name: 'Master Dojo', place: 'Isle of Armor', leader: 'Mustard', mapLabel: 'Master Dojo', kind: 'champion', level: 95, background: 'master_dojo', townMusic: 'town_hulbury',
      gift: 'kubfu', gift2: 'kubfu_urshifu_rapid_strike', prize: { scroll_of_darkness: 1, scroll_of_waters: 1 }, optional: true,
      drops: L({ scroll_of_darkness: 1, scroll_of_waters: 1, moon_stone: 1 }),
      waves: X(95, [['mienfoo', 1, 4, 16], ['machoke', 1, 10, 18], ['hakamo_o', 1, 16, 20], ['mienshao', 0, 22, 40, 1], ['luxray', 0, 30, 40, 1], ['lycanroc', 0, 38, 40, 1], ['corviknight', 0, 46, 40, 1], ['kommo_o', 0, 54, 40, 1]]), // thin (the Arceus shape): the master's team is the threat
      gate: { by: 'hp', at: 0.9, forms: ['mienshao', 'luxray', 'lycanroc', 'corviknight', 'kommo_o', 'urshifu'] },
      burst: { pack: [2, 3], trickle: 1.4, size: [3, 4], counterSize: 3 },
      ace: { form: 'urshifu', level: 95, giant: true, sig: { move: 'Wicked Blow', aoe: 180, reach: 120 } },
      postgame: true },
  ];
  const CARRIERS = { galar_03_route2: ['skwovet'], galar_04_wild_area: ['wooloo'], galar_05_bede: ['rolycoly'], galar_06_milo: ['gossifleur'],
    galar_07_hulbury: ['arrokuda'], galar_08_nessa: ['chewtle'], galar_09_kabu: ['sizzlipede'], galar_10_hammerlocke: ['skwovet'], galar_11_bea: ['clobbopus'],
    galar_12_allister: ['yamask_galar'], galar_13_glimwood: ['impidimp'], galar_14_opal: ['milcery'], galar_15_route8: ['snom'], galar_16_gordie: ['rolycoly'],
    galar_17_melony: ['snom'], galar_18_route9: ['zigzagoon_galar'], galar_19_piers: ['zigzagoon_galar'], galar_20_raihan: ['axew'], galar_21_route10: ['snom'],
    galar_22_marnie: ['purrloin'], galar_23_hop: ['wooloo'], galar_24_eternatus: ['klink'], galar_25_leon: ['honedge'] };
  // Z1 enemy bases: the 10 gyms = their own base art (queued; the den until each lands); the two Champion Cup matches share ONE Wyndon
  // Stadium base (C4); the Darkest Day the Energy Plant; Leon the Champion's one; the Dojo its own
  const BASES = { galar_06_milo: 'gym_milo', galar_08_nessa: 'gym_nessa', galar_09_kabu: 'gym_kabu', galar_11_bea: 'gym_bea', galar_12_allister: 'gym_allister',
    galar_14_opal: 'gym_opal', galar_16_gordie: 'gym_gordie', galar_17_melony: 'gym_melony', galar_19_piers: 'gym_piers', galar_20_raihan: 'gym_raihan',
    galar_22_marnie: 'wyndon_stadium', galar_23_hop: 'wyndon_stadium', galar_24_eternatus: 'energy_plant', galar_25_leon: 'champion', galar_26_dojo: 'master_dojo' };
  BM.GALAR_HARD = {}; // the difficulty dial — set by the native-deck sims (BR-117 practice)
  BM.GALAR_EB = [[1, 42000], [5, 45000], [10, 48500], [15, 49000], [20, 49500], [25, 51500], [26, 54500]]; // Alola's anchors × 1.05
  BM.galarBaseHP = function (st) {
    const A = BM.GALAR_EB, n = st.num;
    let v = A[A.length - 1][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; v = y0 * Math.pow(y1 / y0, (Math.max(n, x0) - x0) / (x1 - x0)); break; }
    return Math.round(v * (BM.EB_KIND[st.kind] || 1) / 50) * 50;
  };
  S.forEach((st, i) => {
    Object.assign(st, { num: i + 1, region: 'galar', curveAt: 25, packBase: true, music: { wild: 'battle_wild', trainer: 'battle_trainer', gym: 'battle_gym', e4: 'battle_elitefour', champion: 'battle_champion' }[st.kind] });
    st.mapLabel = st.mapLabel || (st.kind === 'e4' ? st.leader : undefined);
    const e4 = ['e4', 'champion'].includes(st.kind);
    st.burst = { pack: e4 ? BM.HOENN_CADENCE.e4pack : BM.HOENN_CADENCE.pack, trickle: e4 ? BM.HOENN_CADENCE.e4trickle : BM.HOENN_CADENCE.trickle, ...(st.burst || {}) };
    st.background = 'galar_' + st.background;
    if (BASES[st.id]) st.baseArt = BASES[st.id];
    if (CARRIERS[st.id]) BM.STAGE_CARRIERS[st.id] = CARRIERS[st.id];
    // the curve's anchors are cap-scale (Lv 86 → 95, Alola's 81 → 90 band +5); Galar's stage levels are written already ON the ramp, so
    // BM.rampStage would not re-base the HP (draft = ramp level) — re-base it here, the way every drafted region's is
    const draft = 86 + 9 * i / (S.length - 1);
    st.enemyBaseHP = Math.round(BM.galarBaseHP(st) * BM.rampHpMul(draft, st.level) / 50) * 50;
  });
  for (const st of S) if (st.mapLabel === undefined) delete st.mapLabel;
  BM.applyRamp(S, BM.CAP_LADDER.galar); // regular Lv 1 → 95 (the Darkest Day the last), Leon at the cap, the Dojo cap + 5 — before the dial
  for (const st of S) if (BM.GALAR_HARD[st.num]) BM.hardenStage(st, BM.GALAR_HARD[st.num]);
  BM.GALAR_STAGES = S;
  BM.STAGES.push(...S);
})();
