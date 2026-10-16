// PALDEA STAGES (Galar + Paldea build) — the 29-node Paldea open world from the prep pack's stage-plan.md (Scarlet / Violet, the base
// game by ruling). The three canon paths are MERGED into ONE map path by canon level (user ruling): Victory Road (8 gyms), Starfall
// Street (5 Team Star bases) and the Path of Legends (5 Titans — Great Tusk AND Iron Treads as two consecutive stages, the False Dragon
// one two-boss stage); then the Elite Four (Rika, Poppy, Larry, Hassel) as FOUR nodes, Top Champion GEETA 27, THE FINAL — NEMONA at
// Mesagoza 28 (the capstone), and node 29 AREA ZERO DEPTHS (post-game, optional — the Arceus / Necrozma pattern).
//   Cabo Poco → Los Platos → Mesagoza → Katy → the Stony Cliff Titan (KLAWF) → Brassius → the Open Sky Titan (BOMBIRDIER) → Giacomo
//   (Dark Crew) → Iono → Mela (Fire Crew) → the Lurking Steel Titan (ORTHWORM) → Kofu → Atticus (Poison Crew) → Larry → Ryme → Tulip →
//   the Quaking Earth Titan (GREAT TUSK, Scarlet) → the Quaking Earth Titan (IRON TREADS, Violet) → Grusha → Ortega (Fairy Crew) → Eri
//   (Fighting Crew) → the False Dragon Titan (DONDOZO + TATSUGIRI) → Rika · Poppy · Larry · Hassel → Top Champion Geeta (giant
//   Glimmora; first clear = KORAIDON + MIRAIDON + a Master Ball — Paldea counts as beaten) → Nemona (the true finale; Master Ball + XP
//   Candy L ×3) → 29 Area Zero Depths (very hard by design, not required, unlocks nothing; first clear = TERAPAGOS + a Master Ball).
//   LEVELS: drafted ON the ramp (Lv 1 → 100 over the 22 regular stages; the E4 + Geeta + Nemona at the cap; Area Zero cap + 5 = 105).
//   TITANS (C5, the Alola Totem reskin — no new system): a Titan is the stage's ace tagged `giant: true, totem: true` — its own species
//   at the giant-ace scale + the shared totem aura; BM.earlyPass EXEMPTS totem aces from its devolve + giant-strip (Klawf at Lv 20 and
//   Bombirdier at Lv 29 stay giant). Titan stages are `kind: 'gym'` with no person as leader (the Vast Poni Canyon precedent).
//   STARMOBILES: the Team Star boss's car = a giant REVAVROOM ace, also tagged `totem: true` (so Giacomo's Lv 34 Starmobile stays a
//   giant Revavroom under the early pass, not a Varoom); its crew's Torque move as the signature. The boss's crew = the waves.
//   TERASTAL SKIPPED entirely (user ruling): no Tera form / type / move name anywhere; leaders' Tera aces are their plain species.
window.BM = window.BM || {};
(function () {
  const W = BM.waveRow, D = BM.dropTable;
  const M = (stones) => D('mid', stones), L = (stones) => D('late', stones);
  // waves on the ramp: [form, d, start, every, count] → a level d "cap-scale" levels under the stage's (the Unova L−3…L spread, scaled)
  const X = (Lv, rows) => rows.map(([f, d, s, e, c]) => W(f, Math.max(1, Math.round(Lv * (1 - d / 80))), s, e, c));
  const S = [
    { id: 'paldea_01_cabo_poco', name: 'Cabo Poco', place: 'Poco Path', kind: 'wild', level: 1, background: 'cabo_poco', townMusic: 'town_mesagoza', gift: 'sprigatito',
      drops: M({ leaf_stone: 1, water_stone: 1 }),
      waves: X(1, [['lechonk', 0, 4, 10], ['hoppip', 0, 9, 11], ['pawmi', 0, 14, 11], ['tarountula', 0, 20, 13], ['scatterbug', 0, 26, 14], ['fletchling', 0, 34, 16], ['wingull', 0, 42, 22]]),
      gate: { by: 'time', at: 35, forms: ['wingull'] } },
    { id: 'paldea_02_los_platos', name: 'Los Platos', place: 'Inlet Grotto · South Province', kind: 'wild', level: 6, background: 'south_province', townMusic: 'town_mesagoza', gift: 'fuecoco',
      drops: M({ leaf_stone: 1, water_stone: 1 }),
      waves: X(6, [['lechonk', 3, 4, 10], ['tarountula', 3, 9, 11], ['nymble', 3, 14, 11], ['pawmi', 3, 18, 12], ['fidough', 2, 22, 12], ['smoliv', 2, 26, 13], ['sunkern', 2, 30, 13], ['kricketot', 2, 34, 14], ['wooper_paldea', 1, 38, 14], ['flittle', 1, 42, 16], ['wattrel', 0, 46, 18], ['rookidee', 0, 56, 26, 1]]),
      gate: { by: 'time', at: 40, forms: ['wattrel', 'rookidee'] } },
    { id: 'paldea_03_mesagoza', name: 'Mesagoza', place: 'the Academy · South Province', kind: 'wild', level: 10, background: 'mesagoza', townMusic: 'town_mesagoza', gift: 'quaxly',
      drops: M({ moon_stone: 1, water_stone: 1 }),
      waves: X(10, [['tandemaus', 3, 4, 10], ['fidough', 3, 9, 11], ['capsakid', 3, 14, 11], ['maschiff', 3, 18, 12], ['shroodle', 2, 22, 12], ['flittle', 2, 26, 13], ['hoothoot', 2, 30, 13], ['yamper', 2, 34, 14], ['murkrow', 1, 38, 15], ['pawmo', 1, 42, 16], ['spidops', 1, 46, 16], ['dolliv', 0, 50, 18], ['lokix', 0, 56, 20], ['gimmighoul', 0, 64, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['dolliv', 'lokix', 'gimmighoul'] } },
    // G1 — Cortondo: Gym Leader KATY (Bug). Her Teddiursa ace (no Tera — the plain species; normal-size under the early pass)
    { id: 'paldea_04_katy', name: 'Cortondo', place: "Katy's gym", leader: 'Katy', kind: 'gym', level: 15, background: 'gym_katy', townMusic: 'town_cortondo',
      drops: M({ leaf_stone: 1, moon_stone: 1 }),
      burst: { pack: [1, 2], trickle: 2 }, // the last kid-easy opener
      waves: X(15, [['nymble', 3, 4, 10], ['tarountula', 3, 9, 11], ['scatterbug', 3, 14, 12], ['combee', 3, 18, 12], ['rellor', 2, 22, 13], ['venonat', 2, 26, 13], ['bounsweet', 2, 30, 14], ['smoliv', 1, 36, 15], ['spidops', 1, 42, 16], ['lokix', 0, 50, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['spidops', 'lokix', 'teddiursa'] },
      ace: { form: 'teddiursa', level: 15, giant: true, sig: { move: 'Fury Cutter', aoe: 100, reach: 80 } } },
    // TITAN 1 — South Province (Area Three): the STONY CLIFF Titan, a giant KLAWF (totem: true — the early-pass exemption keeps it giant)
    { id: 'paldea_05_klawf', name: 'Stony Cliff', place: 'South Province · the Path of Legends', leader: 'Stony Cliff Titan', mapLabel: 'Stony Cliff', kind: 'gym', level: 20, background: 'stony_cliff', townMusic: 'town_artazon',
      drops: M({ moon_stone: 2, leaf_stone: 1 }),
      waves: X(20, [['nacli', 3, 4, 10], ['rellor', 3, 9, 11], ['hippopotas', 3, 14, 12], ['sandile', 3, 18, 12], ['geodude', 2, 22, 13], ['silicobra', 2, 26, 13], ['wiglett', 2, 30, 14], ['larvitar', 1, 36, 15], ['krokorok', 1, 42, 16], ['naclstack', 0, 50, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['krokorok', 'naclstack', 'klawf'] },
      ace: { form: 'klawf', level: 20, giant: true, totem: true, title: 'Titan', sig: { move: 'Vise Grip + Rock Smash', aoe: 110, reach: 80 } } },
    // G2 — Artazon: Gym Leader BRASSIUS (Grass). His Sudowoodo ace (plain species)
    { id: 'paldea_06_brassius', name: 'Artazon', place: "Brassius's gym", leader: 'Brassius', kind: 'gym', level: 25, background: 'gym_brassius', townMusic: 'town_artazon',
      drops: M({ leaf_stone: 2, syrupy_apple: 1 }),
      waves: X(25, [['smoliv', 3, 4, 10], ['hoppip', 3, 9, 11], ['sunkern', 3, 14, 12], ['petilil', 3, 18, 12], ['bounsweet', 2, 22, 13], ['toedscool', 2, 26, 13], ['capsakid', 2, 30, 14], ['bramblin', 2, 34, 14], ['skiploom', 1, 38, 15], ['dolliv', 1, 44, 16], ['sunflora', 0, 50, 18], ['tandemaus', 0, 56, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['dolliv', 'sunflora', 'sudowoodo'] },
      ace: { form: 'sudowoodo', level: 25, giant: true, sig: { move: 'Trailblaze + Rock Slide', aoe: 110, reach: 80 } } },
    // TITAN 2 — West Province (Area One): the OPEN SKY Titan, a giant BOMBIRDIER (totem: true)
    { id: 'paldea_07_bombirdier', name: 'Open Sky', place: 'West Province · the Path of Legends', leader: 'Open Sky Titan', mapLabel: 'Open Sky', kind: 'gym', level: 29, background: 'open_sky', townMusic: 'town_artazon',
      drops: M({ moon_stone: 1, leaf_stone: 1, sun_stone: 1 }),
      waves: X(29, [['flittle', 3, 4, 10], ['wattrel', 3, 9, 11], ['fletchling', 3, 14, 12], ['shroodle', 3, 18, 12], ['murkrow', 2, 22, 13], ['maschiff', 2, 26, 13], ['greavard', 2, 30, 14], ['toedscool', 2, 34, 14], ['squawkabilly', 1, 38, 15], ['fletchinder', 1, 44, 16], ['cyclizar', 0, 50, 18], ['flamigo', 0, 56, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['fletchinder', 'cyclizar', 'flamigo', 'bombirdier'] },
      ace: { form: 'bombirdier', level: 29, giant: true, totem: true, title: 'Titan', sig: { move: 'Rock Throw + Pluck', aoe: 120, reach: 90 } } },
    // STAR 1 — the Dark Crew base (Segin Squad): GIACOMO — his Pawniard a mid-stage single, then the SEGIN STARMOBILE (a giant
    // Revavroom, totem: true so the Lv 34 early pass keeps it a giant Revavroom)
    { id: 'paldea_08_giacomo', name: 'Team Star', place: 'Dark Crew base · Segin Squad', leader: 'Giacomo', mapLabel: 'Dark Crew', kind: 'trainer', level: 34, background: 'star_dark', townMusic: 'town_artazon',
      drops: M({ moon_stone: 2, dusk_stone: 1 }),
      waves: X(34, [['murkrow', 3, 4, 10], ['houndour', 3, 8, 11], ['shroodle', 3, 12, 11], ['zorua', 3, 16, 12], ['maschiff', 3, 20, 12], ['murkrow', 2, 24, 13], ['varoom', 2, 28, 13], ['sneasel', 2, 32, 14], ['murkrow', 1, 38, 15], ['zorua', 1, 44, 16], ['pawniard', 0, 52, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['pawniard', 'revavroom'] },
      ace: { form: 'revavroom', level: 34, giant: true, totem: true, title: 'Starmobile', sig: { move: 'Wicked Torque', aoe: 120, status: 'sleep', reach: 90 } } },
    // G3 — Levincia: Gym Leader IONO (Electric) — the first full-rules stage (Lv 39: giant ace, signature)
    { id: 'paldea_09_iono', name: 'Levincia', place: "Iono's gym", leader: 'Iono', kind: 'gym', level: 39, background: 'gym_iono', townMusic: 'town_levincia',
      drops: M({ thunder_stone: 3, moon_stone: 1 }),
      waves: X(39, [['pawmi', 3, 4, 10], ['wattrel', 3, 9, 11], ['tadbulb', 3, 14, 12], ['shinx', 3, 18, 12], ['magnemite', 2, 22, 13], ['voltorb', 2, 26, 13], ['mareep', 2, 30, 14], ['yamper', 2, 34, 14], ['pawmo', 1, 38, 15], ['emolga', 1, 42, 16], ['luxio', 1, 46, 16], ['kilowattrel', 0, 52, 18], ['bellibolt', 0, 58, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['luxio', 'kilowattrel', 'bellibolt', 'mismagius'] },
      ace: { form: 'mismagius', level: 39, giant: true, sig: { move: 'Charge Beam + Hex', aoe: 130, status: 'paralyze', reach: 200 } } },
    // STAR 2 — the Fire Crew base (Schedar Squad): MELA — her Torkoal a mid-stage single, then the SCHEDAR STARMOBILE
    { id: 'paldea_10_mela', name: 'Team Star', place: 'Fire Crew base · Schedar Squad', leader: 'Mela', mapLabel: 'Fire Crew', kind: 'trainer', level: 43, background: 'star_fire', townMusic: 'town_levincia',
      drops: M({ fire_stone: 2, auspicious_armor: 1 }),
      waves: X(43, [['houndour', 3, 4, 10], ['growlithe', 3, 8, 11], ['litleo', 3, 12, 11], ['charcadet', 3, 16, 12], ['capsakid', 3, 20, 12], ['slugma', 2, 24, 13], ['varoom', 2, 28, 13], ['fletchinder', 2, 32, 14], ['houndour', 1, 38, 15], ['growlithe', 1, 44, 16], ['torkoal', 0, 52, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['fletchinder', 'torkoal', 'revavroom'] },
      ace: { form: 'revavroom', level: 43, giant: true, totem: true, title: 'Starmobile', sig: { move: 'Blazing Torque', aoe: 140, status: 'burn', reach: 100 } } },
    // TITAN 3 — East Province (Area Three): the LURKING STEEL Titan, a giant ORTHWORM
    { id: 'paldea_11_orthworm', name: 'Lurking Steel', place: 'East Province · the Path of Legends', leader: 'Lurking Steel Titan', mapLabel: 'Lurking Steel', kind: 'gym', level: 48, background: 'lurking_steel', townMusic: 'town_levincia',
      drops: M({ metal_alloy: 1, thunder_stone: 1 }),
      waves: X(48, [['varoom', 3, 4, 10], ['tinkatink', 3, 9, 11], ['magnemite', 3, 14, 12], ['bronzor', 3, 18, 12], ['nacli', 2, 22, 13], ['wiglett', 2, 26, 13], ['pawniard', 2, 30, 14], ['diglett', 2, 34, 14], ['cufant', 1, 38, 15], ['tinkatuff', 1, 44, 16], ['klawf', 0, 50, 18], ['revavroom', 0, 56, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['tinkatuff', 'klawf', 'revavroom', 'orthworm'] },
      ace: { form: 'orthworm', level: 48, giant: true, totem: true, title: 'Titan', sig: { move: 'Iron Tail + Wrap', aoe: 140, reach: 100 } } },
    // G4 — Asado Desert · Cascarrafa: Gym Leader KOFU (Water). His Crabominable ace (the shipped Alola enemy ace)
    { id: 'paldea_12_kofu', name: 'Cascarrafa', place: "Kofu's gym · Asado Desert", leader: 'Kofu', kind: 'gym', level: 53, background: 'gym_kofu', townMusic: 'town_cascarrafa',
      drops: M({ water_stone: 2, auspicious_armor: 1 }),
      waves: X(53, [['wiglett', 3, 4, 10], ['finizen', 3, 9, 11], ['arrokuda', 3, 14, 12], ['psyduck', 3, 18, 12], ['magikarp', 2, 22, 13], ['buizel', 2, 26, 13], ['clauncher', 2, 30, 14], ['tadbulb', 2, 34, 14], ['cetoddle', 1, 38, 15], ['wugtrio', 1, 44, 16], ['floatzel', 1, 48, 16], ['barraskewda', 0, 54, 18], ['veluza', 0, 60, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['floatzel', 'barraskewda', 'veluza', 'crabominable'] },
      ace: { form: 'crabominable', level: 53, giant: true, sig: { move: 'Crabhammer', aoe: 145, status: 'freeze', reach: 100 } } },
    // STAR 3 — the Poison Crew base (Navi Squad): ATTICUS — his Skuntank and Revavroom as mid-stage singles, then the NAVI STARMOBILE
    // (canon Muk dropped: Kanto Grimer / Muk were never rowed)
    { id: 'paldea_13_atticus', name: 'Team Star', place: 'Poison Crew base · Navi Squad', leader: 'Atticus', mapLabel: 'Poison Crew', kind: 'trainer', level: 58, background: 'star_poison', townMusic: 'town_cascarrafa',
      drops: L({ malicious_armor: 1, moon_stone: 1 }),
      waves: X(58, [['koffing', 3, 4, 10], ['skrelp', 3, 8, 11], ['shroodle', 3, 12, 11], ['stunky', 3, 16, 12], ['glimmet', 3, 20, 12], ['toedscool', 2, 24, 13], ['varoom', 2, 28, 13], ['grafaiai', 1, 34, 15], ['weezing', 1, 40, 16], ['skuntank', 0, 48, 30, 1], ['revavroom', 0, 56, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['weezing', 'skuntank', 'revavroom'] },
      ace: { form: 'revavroom', level: 58, giant: true, totem: true, title: 'Starmobile', sig: { move: 'Noxious Torque', aoe: 145, status: 'poison', reach: 100 } } },
    // G5 — Medali: Gym Leader LARRY (Normal). His Staraptor ace
    { id: 'paldea_14_larry', name: 'Medali', place: "Larry's gym", leader: 'Larry', kind: 'gym', level: 62, background: 'gym_larry', townMusic: 'town_medali',
      drops: L({ syrupy_apple: 1, moon_stone: 1 }),
      waves: X(62, [['lechonk', 3, 4, 10], ['starly', 3, 9, 11], ['tandemaus', 3, 14, 12], ['dunsparce', 3, 18, 12], ['girafarig', 2, 22, 13], ['squawkabilly', 2, 26, 13], ['staravia', 2, 30, 14], ['cyclizar', 1, 36, 15], ['oinkologne', 1, 42, 16], ['maushold', 1, 46, 16], ['komala', 0, 50, 18], ['farigiraf', 0, 56, 20], ['dudunsparce', 0, 62, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['komala', 'farigiraf', 'dudunsparce', 'staraptor'] },
      ace: { form: 'staraptor', level: 62, giant: true, sig: { move: 'Facade + Brave Bird', aoe: 150, reach: 100 } } },
    // G6 — Montenevera: Gym Leader RYME (Ghost). Her Toxtricity ace (the Galar line)
    { id: 'paldea_15_ryme', name: 'Montenevera', place: "Ryme's gym", leader: 'Ryme', kind: 'gym', level: 67, background: 'gym_ryme', townMusic: 'town_montenevera',
      drops: L({ malicious_armor: 1, unremarkable_teacup: 1, dusk_stone: 1 }),
      waves: X(67, [['greavard', 3, 4, 10], ['shuppet', 3, 9, 11], ['drifloon', 3, 14, 12], ['sinistea', 3, 18, 12], ['snorunt', 2, 22, 13], ['bramblin', 2, 26, 13], ['misdreavus', 2, 30, 14], ['gimmighoul', 1, 36, 30, 1], ['banette', 1, 40, 15], ['polteageist', 1, 46, 16], ['houndstone', 0, 52, 18], ['mimikyu', 0, 58, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['polteageist', 'houndstone', 'mimikyu', 'toxtricity'] },
      ace: { form: 'toxtricity', level: 67, giant: true, sig: { move: 'Hex + Overdrive', aoe: 155, status: 'sleep', reach: 200 } } },
    // G7 — Alfornada: Gym Leader TULIP (Psychic). Her Florges ace
    { id: 'paldea_16_tulip', name: 'Alfornada', place: "Tulip's gym", leader: 'Tulip', kind: 'gym', level: 72, background: 'gym_tulip', townMusic: 'town_alfornada',
      drops: L({ unremarkable_teacup: 1, shiny_stone: 1, dawn_stone: 1 }),
      waves: X(72, [['flittle', 3, 4, 10], ['ralts', 3, 9, 11], ['rellor', 3, 14, 12], ['hatenna', 3, 18, 12], ['flabebe', 2, 22, 13], ['spoink', 2, 26, 13], ['kirlia', 2, 30, 14], ['floette', 2, 34, 14], ['indeedee', 1, 38, 15], ['girafarig', 1, 42, 16], ['rabsca', 1, 46, 16], ['espathra', 0, 52, 18], ['gardevoir', 0, 58, 20], ['farigiraf', 0, 64, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['espathra', 'gardevoir', 'farigiraf', 'florges'] },
      ace: { form: 'florges', level: 72, giant: true, sig: { move: 'Psychic + Moonblast', aoe: 155, status: 'sleep', reach: 220 } } },
    // TITAN 4a — Asado Desert: the QUAKING EARTH Titan (SCARLET), a giant GREAT TUSK (Banner A paradox — enemy use is normal)
    { id: 'paldea_17_great_tusk', name: 'Asado Desert', place: 'the Quaking Earth Titan · Scarlet', leader: 'Quaking Earth Titan', mapLabel: 'Great Tusk', kind: 'gym', level: 76, background: 'asado_desert', townMusic: 'town_cascarrafa',
      drops: L({ fire_stone: 1, sun_stone: 1, moon_stone: 1 }),
      waves: X(76, [['sandile', 3, 4, 10], ['silicobra', 3, 9, 11], ['hippopotas', 3, 14, 12], ['rellor', 3, 18, 12], ['cacnea', 2, 22, 13], ['diglett', 2, 26, 13], ['phanpy', 2, 30, 14], ['krokorok', 1, 36, 15], ['rabsca', 1, 42, 16], ['sandaconda', 1, 46, 16], ['hippowdon', 0, 52, 18], ['donphan', 0, 58, 20], ['orthworm', 0, 64, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['hippowdon', 'donphan', 'orthworm', 'great_tusk'] },
      ace: { form: 'great_tusk', level: 76, giant: true, totem: true, title: 'Titan', sig: { move: 'Headlong Rush', aoe: 160, reach: 100 } } },
    // TITAN 4b — Asado Desert: the QUAKING EARTH Titan (VIOLET), a giant IRON TREADS (Banner B paradox)
    { id: 'paldea_18_iron_treads', name: 'Asado Desert', place: 'the Quaking Earth Titan · Violet', leader: 'Quaking Earth Titan', mapLabel: 'Iron Treads', kind: 'gym', level: 81, background: 'asado_crater', townMusic: 'town_cascarrafa',
      drops: L({ moon_stone: 1, sun_stone: 1, metal_coat: 1 }),
      waves: X(81, [['sandile', 3, 4, 10], ['larvitar', 3, 9, 11], ['varoom', 3, 14, 12], ['krokorok', 3, 18, 12], ['tinkatuff', 2, 22, 13], ['pupitar', 2, 26, 13], ['rabsca', 2, 30, 14], ['sandaconda', 1, 36, 15], ['hippowdon', 1, 42, 16], ['donphan', 1, 46, 16], ['krookodile', 0, 52, 18], ['orthworm', 0, 58, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['donphan', 'krookodile', 'orthworm', 'iron_treads'] },
      ace: { form: 'iron_treads', level: 81, giant: true, totem: true, title: 'Titan', sig: { move: 'Iron Head + High Horsepower', aoe: 160, reach: 100 } } },
    // G8 — Glaseado Mountain: Gym Leader GRUSHA (Ice). His Altaria ace
    { id: 'paldea_19_grusha', name: 'Glaseado Mountain', place: "Grusha's gym", leader: 'Grusha', mapLabel: 'Glaseado', kind: 'gym', level: 86, background: 'gym_grusha', townMusic: 'town_glaseado',
      drops: L({ ice_stone: 2, metal_alloy: 1 }),
      waves: X(86, [['snom', 3, 4, 10], ['cetoddle', 3, 9, 11], ['snorunt', 3, 14, 12], ['cubchoo', 3, 18, 12], ['swinub', 2, 22, 13], ['snover', 2, 26, 13], ['frigibax', 2, 30, 14], ['delibird', 2, 34, 14], ['sneasel', 1, 38, 15], ['arctibax', 1, 42, 16], ['eiscue', 1, 46, 16], ['frosmoth', 0, 52, 18], ['beartic', 0, 58, 20], ['cetitan', 0, 64, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['frosmoth', 'beartic', 'cetitan', 'altaria'] },
      ace: { form: 'altaria', level: 86, giant: true, sig: { move: 'Ice Beam + Moonblast', aoe: 160, status: 'freeze', reach: 220 } } },
    // STAR 4 — the Fairy Crew base (Ruchbah Squad): ORTEGA — his Dachsbun a mid-stage single, then the RUCHBAH STARMOBILE
    { id: 'paldea_20_ortega', name: 'Team Star', place: 'Fairy Crew base · Ruchbah Squad', leader: 'Ortega', mapLabel: 'Fairy Crew', kind: 'trainer', level: 91, background: 'star_fairy', townMusic: 'town_glaseado',
      drops: L({ moon_stone: 2, shiny_stone: 1 }),
      waves: X(91, [['fidough', 3, 4, 10], ['tinkatink', 3, 8, 11], ['impidimp', 3, 12, 11], ['marill', 3, 16, 12], ['jigglypuff', 3, 20, 12], ['hatenna', 2, 24, 13], ['varoom', 2, 28, 13], ['tinkatuff', 2, 32, 14], ['morgrem', 1, 38, 15], ['azumarill', 1, 44, 16], ['wigglytuff', 0, 50, 18], ['dachsbun', 0, 56, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['azumarill', 'wigglytuff', 'dachsbun', 'revavroom'] },
      ace: { form: 'revavroom', level: 91, giant: true, totem: true, title: 'Starmobile', sig: { move: 'Magical Torque', aoe: 160, status: 'sleep', reach: 100 } } },
    // STAR 5 — the Fighting Crew base (Caph Squad): ERI — her Annihilape a mid-stage single, then the CAPH STARMOBILE (the last base)
    { id: 'paldea_21_eri', name: 'Team Star', place: 'Fighting Crew base · Caph Squad', leader: 'Eri', mapLabel: 'Fighting Crew', kind: 'trainer', level: 95, background: 'star_fighting', townMusic: 'town_glaseado',
      drops: L({ moon_stone: 1, sun_stone: 1, dusk_stone: 1 }),
      waves: X(95, [['mankey', 3, 4, 10], ['riolu', 3, 8, 11], ['croagunk', 3, 12, 11], ['makuhita', 3, 16, 12], ['pawmo', 3, 20, 12], ['varoom', 2, 24, 13], ['primeape', 2, 28, 13], ['passimian', 2, 32, 14], ['toxicroak', 1, 38, 15], ['hariyama', 1, 44, 16], ['lucario', 0, 50, 18], ['pawmot', 0, 54, 20], ['annihilape', 0, 60, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['lucario', 'pawmot', 'annihilape', 'revavroom'] },
      ace: { form: 'revavroom', level: 95, giant: true, totem: true, title: 'Starmobile', sig: { move: 'Combat Torque', aoe: 165, status: 'paralyze', reach: 100 } } },
    // TITAN 5 — Casseroya Lake: the FALSE DRAGON Titan — TWO giant bosses: DONDOZO (the ace) + TATSUGIRI (an extra ace, its own 50 %).
    // Canon's Commander (Tatsugiri riding in Dondozo's mouth) is flavour — two bodies on the field. The last regular stage: Lv 100, the cap.
    { id: 'paldea_22_false_dragon', name: 'Casseroya Lake', place: 'the False Dragon Titan', leader: 'False Dragon Titan', mapLabel: 'Casseroya Lake', kind: 'gym', level: 100, background: 'casseroya_lake', townMusic: 'town_glaseado',
      drops: L({ ice_stone: 1, water_stone: 2 }),
      // ruling 6: the HERO Palafin (its own Hero sheets) is the lake's ace-class single elite — the player's Palafin stays Zero Form
      waves: X(100, [['magikarp', 3, 4, 10], ['wiglett', 3, 9, 11], ['finizen', 3, 14, 12], ['clauncher', 3, 18, 12], ['dratini', 2, 22, 13], ['frigibax', 2, 26, 13], ['wugtrio', 2, 30, 14], ['veluza', 1, 36, 15], ['dragonair', 1, 42, 16], ['clawitzer', 1, 46, 16], ['floatzel', 0, 52, 18], ['palafin_hero', 0, 58, 30, 1], ['gyarados', 0, 64, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['floatzel', 'palafin_hero', 'gyarados', 'dondozo', 'tatsugiri'] },
      ace: { form: 'dondozo', level: 100, giant: true, totem: true, title: 'Titan', sig: { move: 'Order Up + Wave Crash', aoe: 165, reach: 100 } },
      extraAces: [{ form: 'tatsugiri', level: 100, giant: true, totem: true, title: 'Titan', at: 0.5, sig: { move: 'Muddy Water + Dragon Pulse', aoe: 160, status: 'paralyze', reach: 220 } }] },
    // the Pokémon League Elite Four as FOUR nodes; Victory Road and the League interview fold into Rika's pool
    { id: 'paldea_23_rika', name: 'Elite Four', leader: 'Rika', kind: 'e4', level: 100, background: 'e4_rika', townMusic: 'town_paldea_league',
      drops: L({ moon_stone: 2, sun_stone: 1 }),
      waves: X(100, [['wooper_paldea', 3, 4, 10], ['wooper', 3, 8, 11], ['barboach', 3, 14, 13], ['numel', 3, 18, 13], ['diglett', 3, 22, 14], ['phanpy', 2, 26, 15], ['quagsire', 2, 32, 16], ['whiscash', 1, 38, 18], ['camerupt', 1, 42, 18], ['dugtrio', 1, 46, 18], ['donphan', 0, 50, 20], ['orthworm', 0, 56, 22], ['great_tusk', 0, 64, 34, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['camerupt', 'donphan', 'orthworm', 'great_tusk', 'clodsire'] },
      ace: { form: 'clodsire', level: 100, giant: true, sig: { move: 'Earthquake + Poison Jab', aoe: 165, status: 'poison', reach: 100 } } },
    { id: 'paldea_24_poppy', name: 'Elite Four', leader: 'Poppy', kind: 'e4', level: 100, background: 'e4_poppy', townMusic: 'town_paldea_league',
      drops: L({ metal_coat: 2, thunder_stone: 1 }),
      waves: X(100, [['tinkatink', 3, 4, 10], ['magnemite', 3, 8, 11], ['bronzor', 3, 14, 13], ['cufant', 3, 18, 13], ['varoom', 3, 22, 14], ['tinkatuff', 2, 26, 15], ['corvisquire', 2, 32, 16], ['magneton', 1, 38, 18], ['bronzong', 1, 42, 18], ['orthworm', 1, 46, 18], ['magnezone', 0, 50, 20], ['corviknight', 0, 54, 22], ['copperajah', 0, 60, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['magnezone', 'corviknight', 'copperajah', 'tinkaton'] },
      ace: { form: 'tinkaton', level: 100, giant: true, sig: { move: 'Gigaton Hammer', aoe: 170, reach: 100 } } },
    { id: 'paldea_25_larry_e4', name: 'Elite Four', leader: 'Larry', kind: 'e4', level: 100, background: 'e4_larry', townMusic: 'town_paldea_league',
      drops: L({ moon_stone: 2, sun_stone: 1 }),
      waves: X(100, [['rookidee', 3, 4, 10], ['starly', 3, 8, 11], ['wattrel', 3, 14, 13], ['swablu', 3, 18, 13], ['squawkabilly', 3, 22, 14], ['staravia', 2, 26, 15], ['corvisquire', 2, 32, 16], ['oricorio', 1, 38, 18], ['tropius', 1, 42, 18], ['kilowattrel', 1, 46, 18], ['bombirdier', 0, 50, 20], ['altaria', 0, 54, 22], ['staraptor', 0, 60, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['bombirdier', 'altaria', 'staraptor', 'flamigo'] },
      ace: { form: 'flamigo', level: 100, giant: true, sig: { move: 'Brave Bird + Close Combat', aoe: 170, status: 'paralyze', reach: 100 } } },
    { id: 'paldea_26_hassel', name: 'Elite Four', leader: 'Hassel', kind: 'e4', level: 100, background: 'e4_hassel', townMusic: 'town_paldea_league',
      drops: L({ ice_stone: 1, moon_stone: 2 }),
      waves: X(100, [['frigibax', 3, 4, 10], ['noibat', 3, 8, 11], ['axew', 3, 14, 13], ['applin', 3, 18, 13], ['skrelp', 3, 22, 14], ['arctibax', 2, 26, 15], ['fraxure', 2, 32, 16], ['cyclizar', 1, 38, 18], ['sliggoo', 1, 42, 18], ['tatsugiri', 1, 46, 18], ['flapple', 0, 50, 20], ['dragalge', 0, 54, 22], ['noivern', 0, 58, 22], ['haxorus', 0, 62, 24]]),
      gate: { by: 'hp', at: 0.9, forms: ['dragalge', 'noivern', 'haxorus', 'baxcalibur'] },
      ace: { form: 'baxcalibur', level: 100, giant: true, sig: { move: 'Glaive Rush + Icicle Crash', aoe: 170, status: 'freeze', reach: 100 } } },
    // 27 — TOP CHAMPION GEETA: first clear = KORAIDON + MIRAIDON (both reward lines, joining at Lv 68 — giftLevel on the lines) + the
    // region's Master Ball; Paldea counts as beaten here (regionsDone.paldea — C9). Nemona (28) is the true finale.
    { id: 'paldea_27_geeta', name: 'Top Champion', leader: 'Geeta', kind: 'champion', ramp: 'champion', level: 100, background: 'champion_geeta', townMusic: 'town_paldea_league', gift: 'koraidon', gift2: 'miraidon',
      drops: L({ moon_stone: 1, ice_stone: 1, dusk_stone: 1 }),
      waves: X(100, [['flittle', 3, 4, 11], ['skiddo', 3, 8, 12], ['glimmet', 3, 12, 12], ['bergmite', 3, 16, 13], ['pawniard', 2, 20, 14], ['bisharp', 2, 26, 14], ['veluza', 1, 32, 16], ['espathra', 1, 38, 18], ['gogoat', 1, 42, 18], ['avalugg', 0, 48, 20], ['kingambit', 0, 54, 26, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['espathra', 'gogoat', 'avalugg', 'kingambit', 'glimmora'] },
      ace: { form: 'glimmora', level: 100, giant: true, sig: { move: 'Power Gem + Mortal Spin', aoe: 175, status: 'poison', reach: 220 } }, regionFinal: true, creditsLater: true }, // Paldea is beaten here (regionsDone + Master Ball); the credits wait for Nemona
    // 28 — THE FINAL (user ruling): Champion NEMONA on the Academy's battle court in Mesagoza — the capstone (at the cap). Canon: her
    // starter is the one WEAK to the player's — the engine can't know which the player picked (all three are gifted), so ALL THREE starter
    // finals come as mid-stage elites (the Kukui-starters precedent) and her partner PAWMOT is the giant ace. First clear = Master Ball +
    // XP Candy L ×3.
    { id: 'paldea_28_nemona', name: 'Champion Nemona', place: 'Mesagoza · the Academy', leader: 'Nemona', mapLabel: 'Nemona', kind: 'champion', level: 100, background: 'academy_battle', townMusic: 'town_mesagoza',
      drops: L({ thunder_stone: 1, fire_stone: 1, water_stone: 1 }),
      waves: X(100, [['pawmi', 3, 4, 11], ['rockruff', 3, 8, 12], ['goomy', 3, 12, 12], ['dunsparce', 3, 16, 13], ['pawmo', 2, 20, 14], ['sliggoo', 2, 26, 14], ['lycanroc', 1, 32, 16], ['dudunsparce', 1, 38, 18], ['orthworm', 1, 42, 18], ['goodra', 0, 48, 20], ['meowscarada', 0, 54, 26, 1], ['skeledirge', 0, 58, 26, 1], ['quaquaval', 0, 62, 26, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['dudunsparce', 'orthworm', 'goodra', 'meowscarada', 'quaquaval', 'pawmot', 'skeledirge'] },
      ace: { form: 'pawmot', level: 100, giant: true, sig: { move: 'Double Shock + Close Combat', aoe: 175, status: 'paralyze', reach: 110 } },
      prize: { master_ball: 1, xp_candy_l: 3 }, capstone: true, credits: true }, // the true finale rolls Paldea's credits
    // 29 — AREA ZERO DEPTHS (post-game + OPTIONAL — user ruling, the Arceus / Necrozma pattern): deep in the Great Crater, a giant
    // TERAPAGOS (base form only) wakes at once and, while it stands, calls the PARADOX Pokémon (all 20, ancient and future); the field
    // stays thin so the summons are the threat. Very hard by design, not required, unlocks nothing. First clear = TERAPAGOS + a Master Ball.
    { id: 'paldea_29_area_zero', name: 'Area Zero Depths', place: 'the Great Crater of Paldea', mapLabel: 'Area Zero', kind: 'champion', level: 100, background: 'area_zero', townMusic: 'town_paldea_league', gift: 'terapagos', optional: true,
      drops: L({ moon_stone: 1, shiny_stone: 1, dawn_stone: 1 }),
      waves: X(100, [['glimmet', 1, 4, 16], ['gabite', 1, 10, 18], ['dragonair', 1, 16, 18], ['sliggoo', 1, 22, 20], ['glimmora', 0, 28, 20]]), // thin (the Arceus shape): the summons are the threat
      gate: { by: 'time', at: 6, forms: ['terapagos', 'glimmora', 'sliggoo', 'gabite'] }, // Y1: it wakes at once (6 s)
      burst: { pack: [2, 3], trickle: 1.4, size: [3, 4], counterSize: 3 },
      extraAces: [{ form: 'terapagos', level: 100, giant: true, time: 2, sig: { move: 'Starstorm Beam', aoe: 180, reach: 280 },
        summon: { pool: ['great_tusk', 'scream_tail', 'brute_bonnet', 'flutter_mane', 'slither_wing', 'sandy_shocks', 'roaring_moon', 'walking_wake', 'gouging_fire', 'raging_bolt',
          'iron_treads', 'iron_bundle', 'iron_hands', 'iron_jugulis', 'iron_moth', 'iron_thorns', 'iron_valiant', 'iron_leaves', 'iron_boulder', 'iron_crown'], n: [1, 1], every: [18, 24], first: 16, level: 94 } }], // the Paradox species are legendary-tier bodies: they come a little under the stage (Lv 99 after the ramp)
      prize: { master_ball: 1 }, postgame: true },
  ];
  const CARRIERS = { paldea_03_mesagoza: ['tandemaus'], paldea_04_katy: ['tarountula'], paldea_05_klawf: ['nacli'], paldea_06_brassius: ['smoliv'],
    paldea_07_bombirdier: ['flittle'], paldea_08_giacomo: ['murkrow'], paldea_09_iono: ['pawmi'], paldea_10_mela: ['houndour'], paldea_11_orthworm: ['varoom'],
    paldea_12_kofu: ['wiglett'], paldea_13_atticus: ['koffing'], paldea_14_larry: ['lechonk'], paldea_15_ryme: ['greavard'], paldea_16_tulip: ['flittle'],
    paldea_17_great_tusk: ['sandile'], paldea_18_iron_treads: ['sandile'], paldea_19_grusha: ['snom'], paldea_20_ortega: ['fidough'], paldea_21_eri: ['mankey'],
    paldea_22_false_dragon: ['wiglett'], paldea_23_rika: ['wooper_paldea'], paldea_24_poppy: ['tinkatink'], paldea_25_larry_e4: ['rookidee'],
    paldea_26_hassel: ['frigibax'], paldea_27_geeta: ['flittle'], paldea_28_nemona: ['pawmi'] };
  // Z1 enemy bases: the 8 gym leaders = their own base art; the six Titan stages share ONE Titan den (C6); the five Team Star bases share
  // ONE Starmobile base (user ruling); the E4 rooms the shared E4 base; Geeta, Nemona and Area Zero the Champion's one
  const BASES = { paldea_04_katy: 'gym_katy', paldea_06_brassius: 'gym_brassius', paldea_09_iono: 'gym_iono', paldea_12_kofu: 'gym_kofu',
    paldea_14_larry: 'gym_larry', paldea_15_ryme: 'gym_ryme', paldea_16_tulip: 'gym_tulip', paldea_19_grusha: 'gym_grusha',
    paldea_05_klawf: 'titan_den', paldea_07_bombirdier: 'titan_den', paldea_11_orthworm: 'titan_den', paldea_17_great_tusk: 'titan_den',
    paldea_18_iron_treads: 'titan_den', paldea_22_false_dragon: 'titan_den',
    paldea_08_giacomo: 'star_base', paldea_10_mela: 'star_base', paldea_13_atticus: 'star_base', paldea_20_ortega: 'star_base', paldea_21_eri: 'star_base',
    paldea_23_rika: 'e4', paldea_24_poppy: 'e4', paldea_25_larry_e4: 'e4', paldea_26_hassel: 'e4',
    paldea_27_geeta: 'champion', paldea_28_nemona: 'champion', paldea_29_area_zero: 'champion' };
  BM.PALDEA_HARD = {}; // the difficulty dial — set by the native-deck sims (BR-117 practice)
  // the Alola anchors × 1.1 (rounded to 500); the endgame anchors moved to Paldea's last two nodes (28 Nemona, 29 Area Zero)
  BM.PALDEA_EB = [[1, 44000], [5, 47500], [10, 50500], [15, 51000], [20, 51500], [28, 54000], [29, 57000]];
  BM.paldeaBaseHP = function (st) {
    const A = BM.PALDEA_EB, n = st.num;
    let v = A[A.length - 1][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; v = y0 * Math.pow(y1 / y0, (Math.max(n, x0) - x0) / (x1 - x0)); break; }
    return Math.round(v * (BM.EB_KIND[st.kind] || 1) / 50) * 50;
  };
  S.forEach((st, i) => {
    Object.assign(st, { num: i + 1, region: 'paldea', curveAt: 25, packBase: true, music: { wild: 'battle_wild', trainer: 'battle_trainer', gym: 'battle_gym', e4: 'battle_elitefour', champion: 'battle_champion' }[st.kind] });
    st.mapLabel = st.mapLabel || (st.kind === 'e4' ? st.leader : undefined);
    const e4 = ['e4', 'champion'].includes(st.kind);
    st.burst = { pack: e4 ? BM.HOENN_CADENCE.e4pack : BM.HOENN_CADENCE.pack, trickle: e4 ? BM.HOENN_CADENCE.e4trickle : BM.HOENN_CADENCE.trickle, ...(st.burst || {}) };
    st.background = 'paldea_' + st.background;
    if (BASES[st.id]) st.baseArt = BASES[st.id];
    if (CARRIERS[st.id]) BM.STAGE_CARRIERS[st.id] = CARRIERS[st.id];
    // the curve's anchors are cap-scale (Lv 91 → 100, the Alola band + 10); Paldea's stage levels are written already ON the ramp, so
    // BM.rampStage would not re-base the HP (draft = ramp level) — re-base it here, the way every drafted region's is
    const draft = 91 + 9 * i / (S.length - 1);
    st.enemyBaseHP = Math.round(BM.paldeaBaseHP(st) * BM.rampHpMul(draft, st.level) / 50) * 50;
  });
  for (const st of S) if (st.mapLabel === undefined) delete st.mapLabel;
  BM.applyRamp(S, BM.CAP_LADDER.paldea); // regular Lv 1 → 100, the E4 + Geeta + Nemona at the cap, Area Zero cap + 5 — before the dial
  for (const st of S) if (BM.PALDEA_HARD[st.num]) BM.hardenStage(st, BM.PALDEA_HARD[st.num]);
  BM.PALDEA_STAGES = S;
  BM.STAGES.push(...S);
})();
