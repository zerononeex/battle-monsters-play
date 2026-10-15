// ALOLA STAGES (Kalos + Alola build, Act 1) — the 27-node Alola island challenge from the prep pack's stage-plan.md (Ultra Sun / Ultra
// Moon order, the base game by ruling): 8 trials with a TOTEM each, the 4 kahunas' grand trials, 3 villain stages, the Mount Lanakila
// Elite Four (Hala, Olivia, Acerola, Kahili) as FOUR nodes, Champion KUKUI 26, and node 27 NECROZMA (post-game, optional — the Arceus
// pattern). No separate capstone (pack C15).
//   Iki → Hau'oli → Ilima's trial (Totem GUMSHOOS) → Ten Carat Hill → Hala → Paniola → Lana (Totem ARAQUANID) → Kiawe (Totem ALOLAN
//   MAROWAK) → Mallow (Totem LURANTIS) → Olivia → Aether Paradise (Gladion + Faba) → Malie → Sophocles (Totem TOGEDEMARU) → Acerola
//   (Totem MIMIKYU) → Po Town (Guzma) → Nanu → Aether Paradise again (Lusamine: Bewear + a giant NIHILEGO; Type: Null joins) → Poni
//   (the Hisuian Decidueye line joins) → Vast Poni Canyon (Totem KOMMO-O) → Mina (Totem RIBOMBEE) → Hapu → Hala · Olivia · Acerola ·
//   Kahili → Champion Kukui (giant Lycanroc Midday; first clear = SOLGALEO + LUNALA + a Master Ball — Alola counts as beaten) → 27
//   Necrozma (very hard by design, not required, unlocks nothing; first clear = Necrozma, U3a).
//   LEVELS: the pack's plan is already on the ramp (Lv 1 → 90 over the 21 regular stages; the E4 + Kukui at the cap; Necrozma cap + 5).
//   TOTEMS (F1 / U1, Kakashi-approved): a Totem is the trial's ace tagged `totem: true` — its own species at the giant-ace scale + the
//   shared totem_aura effect, its canon SOS allies on the ace's `summon`. BM.earlyPass EXEMPTS totem aces from its devolve + giant-strip
//   (the four early trials keep Gumshoos / Araquanid / Alolan Marowak / Lurantis at full size); the signature move still drops there.
//   Trials and grand trials are `kind: 'gym'` (a reskin — menace + Last Stand on every ace). Z-Moves: absent (user ruling).
window.BM = window.BM || {};
(function () {
  const W = BM.waveRow, D = BM.dropTable;
  const M = (stones) => D('mid', stones), L = (stones) => D('late', stones);
  // waves on the ramp: [form, d, start, every, count] → a level d "cap-scale" levels under the stage's (the Unova L−3…L spread, scaled)
  const X = (Lv, rows) => rows.map(([f, d, s, e, c]) => W(f, Math.max(1, Math.round(Lv * (1 - d / 80))), s, e, c));
  const S = [
    { id: 'alola_01_iki', name: 'Iki Town', place: 'Route 1', kind: 'wild', level: 1, background: 'iki_town', townMusic: 'town_iki', gift: 'rowlet',
      drops: M({ leaf_stone: 1, water_stone: 1 }),
      waves: X(1, [['pikipek', 0, 4, 10], ['yungoos', 0, 9, 11], ['rattata_alola', 0, 14, 11], ['grubbin', 0, 24, 14], ['caterpie', 0, 30, 16], ['wingull', 0, 42, 22]]),
      gate: { by: 'time', at: 35, forms: ['wingull'] } },
    { id: 'alola_02_hauoli', name: "Hau'oli City", place: 'Route 2', kind: 'wild', level: 5, background: 'hauoli_city', townMusic: 'town_hauoli', gift: 'litten',
      drops: M({ moon_stone: 1, water_stone: 1 }),
      waves: X(5, [['meowth_alola', 3, 4, 10], ['grimer_alola', 3, 9, 11], ['magnemite', 3, 14, 11], ['abra', 3, 18, 12], ['cutiefly', 2, 22, 12], ['crabrawler', 2, 28, 13], ['ekans', 2, 32, 13], ['makuhita', 1, 36, 14], ['growlithe', 1, 40, 16], ['gastly', 0, 46, 18], ['hawlucha', 0, 60, 30, 1]]),
      gate: { by: 'time', at: 40, forms: ['growlithe', 'hawlucha'] } },
    // T1 — Verdant Cavern: Captain ILIMA's trial. TOTEM GUMSHOOS (the Ultra Sun Totem) calls Yungoos / Alolan Rattata / Alolan Raticate
    { id: 'alola_03_ilima', name: 'Verdant Cavern', place: "Ilima's trial", leader: 'Ilima', kind: 'gym', level: 10, background: 'verdant_cavern', townMusic: 'town_hauoli', gift: 'popplio',
      drops: M({ moon_stone: 1, water_stone: 1 }),
      burst: { pack: [1, 2], trickle: 2 }, // the last kid-easy opener
      waves: X(10, [['yungoos', 3, 4, 11], ['rattata_alola', 3, 10, 12], ['zubat', 3, 16, 12], ['diglett_alola', 2, 22, 13], ['noibat', 2, 28, 14], ['smeargle', 1, 40, 18]]),
      gate: { by: 'hp', at: 0.9, forms: ['smeargle', 'gumshoos'] },
      ace: { form: 'gumshoos', level: 10, giant: true, totem: true, sig: { move: 'Hyper Fang + Crunch', aoe: 100, reach: 80 },
        summon: { pool: ['yungoos', 'rattata_alola', 'raticate_alola'], n: [1, 1], every: [16, 22], first: 10, level: 9 } } },
    { id: 'alola_04_ten_carat', name: 'Melemele Meadow', place: 'Ten Carat Hill · Route 3', kind: 'wild', level: 14, background: 'melemele_meadow', townMusic: 'town_iki',
      drops: M({ moon_stone: 1, leaf_stone: 1 }),
      waves: X(14, [['cutiefly', 3, 4, 10], ['oricorio', 3, 8, 11], ['rockruff', 3, 12, 11], ['flabebe', 3, 16, 12], ['cottonee', 3, 20, 12], ['petilil', 2, 24, 13], ['roggenrola', 2, 28, 13], ['vullaby', 2, 32, 14], ['rufflet', 2, 36, 14], ['machop', 1, 40, 15], ['carbink', 1, 46, 16], ['mawile', 1, 50, 18], ['sableye', 0, 56, 20], ['bagon', 0, 64, 24]]),
      gate: { by: 'time', at: 40, forms: ['carbink', 'mawile', 'sableye', 'bagon'] } },
    // K1 — Iki Town: Kahuna HALA's grand trial
    { id: 'alola_05_hala', name: 'Iki Town', place: "Hala's grand trial", leader: 'Hala', kind: 'gym', level: 19, background: 'gym_hala', townMusic: 'town_iki',
      drops: M({ moon_stone: 1, water_stone: 1 }),
      waves: X(19, [['makuhita', 3, 4, 10], ['machop', 3, 9, 11], ['mienfoo', 3, 14, 12], ['pancham', 3, 18, 12], ['riolu', 2, 24, 13], ['crabrawler', 2, 30, 14], ['hawlucha', 1, 40, 18], ['hariyama', 0, 48, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['hawlucha', 'hariyama', 'crabrawler'] },
      ace: { form: 'crabrawler', level: 19, giant: true, sig: { move: 'Power-Up Punch', aoe: 110, reach: 80 } } },
    { id: 'alola_06_paniola', name: 'Paniola Ranch', place: 'Heahea City · Routes 4–5', kind: 'wild', level: 23, background: 'paniola_ranch', townMusic: 'town_paniola',
      drops: M({ moon_stone: 1, leaf_stone: 1, water_stone: 1 }),
      waves: X(23, [['mudbray', 3, 4, 10], ['mareep', 3, 8, 11], ['lillipup', 3, 12, 11], ['pikipek', 3, 16, 12], ['grubbin', 3, 20, 12], ['fomantis', 2, 24, 13], ['diglett_alola', 2, 28, 13], ['noibat', 2, 32, 14], ['barboach', 2, 36, 14], ['crabrawler', 1, 40, 15], ['miltank', 1, 46, 16], ['oricorio', 0, 52, 18], ['espeon', 0, 60, 24, 1], ['umbreon', 0, 64, 24, 1]]),
      gate: { by: 'time', at: 40, forms: ['miltank', 'oricorio', 'espeon', 'umbreon'] } },
    // T2 — Brooklet Hill: Captain LANA's trial. TOTEM ARAQUANID calls Dewpider / Masquerain
    { id: 'alola_07_lana', name: 'Brooklet Hill', place: "Lana's trial", leader: 'Lana', kind: 'gym', level: 28, background: 'brooklet_hill', townMusic: 'town_paniola',
      drops: M({ water_stone: 2, moon_stone: 1 }),
      waves: X(28, [['dewpider', 3, 4, 10], ['wishiwashi', 3, 9, 11], ['surskit', 3, 14, 12], ['poliwag', 3, 18, 12], ['psyduck', 2, 22, 13], ['morelull', 2, 26, 13], ['goldeen', 2, 30, 14], ['finneon', 1, 36, 15], ['masquerain', 1, 42, 16], ['seaking', 0, 48, 18], ['alomomola', 0, 54, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['seaking', 'alomomola', 'araquanid'] },
      ace: { form: 'araquanid', level: 28, giant: true, totem: true, sig: { move: 'Liquidation', aoe: 120, reach: 90 },
        summon: { pool: ['dewpider', 'masquerain'], n: [1, 1], every: [16, 22], first: 10, level: 26 } } },
    // T3 — Wela Volcano Park: Captain KIAWE's trial. TOTEM ALOLAN MAROWAK calls Salandit / Magmar
    { id: 'alola_08_kiawe', name: 'Wela Volcano Park', place: "Kiawe's trial", leader: 'Kiawe', kind: 'gym', level: 32, background: 'wela_volcano', townMusic: 'town_royal_avenue',
      drops: M({ fire_stone: 2, moon_stone: 1 }),
      waves: X(32, [['salandit', 3, 4, 10], ['cubone', 3, 9, 11], ['fletchling', 3, 14, 12], ['magby', 3, 18, 12], ['diglett_alola', 2, 22, 13], ['staryu', 2, 26, 13], ['spheal', 2, 30, 14], ['fletchinder', 1, 36, 15], ['pyukumuku', 1, 42, 16], ['magmar', 0, 48, 18], ['salazzle', 0, 56, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['magmar', 'salazzle', 'marowak_alola'] },
      ace: { form: 'marowak_alola', level: 32, giant: true, totem: true, sig: { move: 'Shadow Bone', aoe: 120, status: 'burn', reach: 160 },
        summon: { pool: ['salandit', 'magmar'], n: [1, 1], every: [16, 22], first: 10, level: 30 } } },
    // T4 — Lush Jungle: Captain MALLOW's trial. TOTEM LURANTIS calls Trumbeak / Comfey; Mallow's own Tsareena a mid-stage single
    { id: 'alola_09_mallow', name: 'Lush Jungle', place: "Mallow's trial", leader: 'Mallow', kind: 'gym', level: 37, background: 'lush_jungle', townMusic: 'town_konikoni',
      drops: M({ leaf_stone: 3, moon_stone: 1 }),
      waves: X(37, [['fomantis', 3, 4, 10], ['bounsweet', 3, 9, 11], ['morelull', 3, 14, 12], ['wimpod', 3, 18, 12], ['stufful', 2, 22, 13], ['hoothoot', 2, 26, 13], ['goomy', 2, 30, 14], ['steenee', 1, 36, 15], ['trumbeak', 1, 40, 15], ['comfey', 1, 44, 16], ['passimian', 0, 48, 18], ['oranguru', 0, 52, 18], ['tsareena', 0, 60, 30, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['passimian', 'oranguru', 'tsareena', 'lurantis'] },
      ace: { form: 'lurantis', level: 37, giant: true, totem: true, sig: { move: 'Solar Blade', aoe: 130, status: 'poison', reach: 100 },
        summon: { pool: ['trumbeak', 'comfey'], n: [1, 1], every: [16, 22], first: 10, level: 35 } } },
    // K2 — Konikoni City: Kahuna OLIVIA's grand trial — the first stage past the early pass (giant ace, menace + Last Stand)
    { id: 'alola_10_olivia', name: 'Konikoni City', place: "Olivia's grand trial", leader: 'Olivia', kind: 'gym', level: 41, background: 'gym_olivia', townMusic: 'town_konikoni',
      drops: M({ moon_stone: 2, metal_coat: 1 }),
      waves: X(41, [['diglett_alola', 3, 4, 10], ['roggenrola', 3, 9, 11], ['nosepass', 3, 14, 12], ['carbink', 3, 18, 12], ['larvitar', 2, 22, 13], ['sandygast', 2, 26, 13], ['phantump', 2, 30, 14], ['boldore', 1, 36, 15], ['dugtrio_alola', 1, 42, 16], ['golbat', 0, 48, 18], ['starmie', 0, 54, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['dugtrio_alola', 'golbat', 'starmie', 'lycanroc_midnight'] },
      ace: { form: 'lycanroc_midnight', level: 41, giant: true, sig: { move: 'Counter + Stone Edge', aoe: 140, reach: 100 } } },
    { id: 'alola_11_aether', name: 'Aether Paradise', place: 'Gladion & Faba', leader: 'Gladion & Faba', mapLabel: 'Aether Paradise', kind: 'trainer', level: 46, background: 'aether_paradise', townMusic: 'town_aether',
      drops: M({ thunder_stone: 2, metal_coat: 1 }),
      waves: X(46, [['magnemite', 3, 4, 10], ['zubat', 3, 8, 11], ['porygon', 3, 12, 11], ['voltorb', 3, 16, 12], ['grimer_alola', 3, 20, 12], ['rattata_alola', 3, 24, 13], ['salandit', 2, 28, 13], ['mareanie', 2, 32, 14], ['magneton', 1, 38, 15], ['golbat', 1, 44, 16], ['electrode', 0, 50, 18], ['porygon2', 0, 56, 20]]),
      gate: { by: 'time', at: 40, forms: ['golbat', 'electrode', 'porygon2', 'type_null'] },
      ace: { form: 'type_null', level: 46, giant: true, sig: { move: 'Crush Claw', aoe: 140, reach: 90 } } },
    { id: 'alola_12_malie', name: 'Malie Garden', place: 'Malie City · Route 10', kind: 'wild', level: 50, background: 'malie_garden', townMusic: 'town_malie',
      drops: M({ water_stone: 2, moon_stone: 1 }),
      waves: X(50, [['meowth_alola', 3, 4, 10], ['grimer_alola', 3, 8, 11], ['trubbish', 3, 12, 11], ['minccino', 3, 16, 12], ['cottonee', 3, 20, 12], ['pancham', 2, 24, 13], ['pineco', 2, 28, 13], ['crabrawler', 2, 32, 14], ['araquanid', 1, 38, 15], ['persian_alola', 1, 42, 16], ['ledian', 1, 46, 16], ['gumshoos', 1, 50, 18], ['politoed', 0, 56, 20], ['skarmory', 0, 62, 22], ['pangoro', 0, 68, 24]]),
      gate: { by: 'time', at: 40, forms: ['politoed', 'skarmory', 'pangoro'] } },
    // T5 — Hokulani Observatory: Captain SOPHOCLES's trial. TOTEM TOGEDEMARU calls Skarmory / Dedenne
    { id: 'alola_13_sophocles', name: 'Hokulani Observatory', place: "Sophocles's trial", leader: 'Sophocles', kind: 'gym', level: 54, background: 'hokulani_observatory', townMusic: 'town_malie',
      drops: M({ thunder_stone: 3, metal_coat: 1 }),
      waves: X(54, [['grubbin', 3, 4, 10], ['minior', 3, 9, 11], ['elgyem', 3, 14, 12], ['beldum', 3, 18, 12], ['elekid', 2, 22, 13], ['dedenne', 2, 26, 13], ['axew', 2, 30, 14], ['charjabug', 1, 36, 15], ['magneton', 1, 42, 16], ['electabuzz', 0, 48, 18], ['vikavolt', 0, 54, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['magneton', 'electabuzz', 'vikavolt', 'togedemaru'] },
      ace: { form: 'togedemaru', level: 54, giant: true, totem: true, sig: { move: 'Zing Zap', aoe: 140, status: 'paralyze', reach: 90 },
        summon: { pool: ['skarmory', 'dedenne'], n: [1, 1], every: [20, 26], first: 14, level: 52 } } },
    // T6 — the Thrifty Megamart: Captain ACEROLA's trial. TOTEM MIMIKYU calls Haunter / Gengar
    { id: 'alola_14_acerola', name: 'Thrifty Megamart', place: "Acerola's trial", leader: 'Acerola', kind: 'gym', level: 59, background: 'thrifty_megamart', townMusic: 'town_tapu_village',
      drops: L({ ice_stone: 2, dusk_stone: 1 }),
      waves: X(59, [['shuppet', 3, 4, 10], ['phantump', 3, 9, 11], ['sandshrew_alola', 3, 14, 12], ['vulpix_alola', 3, 18, 12], ['frillish', 2, 22, 13], ['klefki', 2, 26, 13], ['haunter', 2, 30, 14], ['komala', 1, 36, 15], ['turtonator', 1, 42, 16], ['graveler_alola', 1, 46, 16], ['togedemaru', 0, 50, 18], ['bruxish', 0, 54, 18], ['absol', 0, 60, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['komala', 'togedemaru', 'bruxish', 'absol', 'mimikyu'] },
      ace: { form: 'mimikyu', level: 59, giant: true, totem: true, sig: { move: 'Shadow Claw + Play Rough', aoe: 140, status: 'sleep', reach: 90 },
        summon: { pool: ['haunter', 'gengar'], n: [1, 1], every: [15, 20], first: 10, level: 57 } } },
    // Po Town · the Shady House: Team Skull's boss GUZMA — Golisopod is his ace; Plumeria's Salazzle a mid-stage single
    { id: 'alola_15_po_town', name: 'Po Town', place: 'the Shady House', leader: 'Guzma', mapLabel: 'Po Town', kind: 'trainer', level: 63, background: 'po_town', townMusic: 'town_po',
      drops: L({ moon_stone: 2, dusk_stone: 1 }),
      waves: X(63, [['zubat', 3, 4, 10], ['grimer_alola', 3, 8, 11], ['rattata_alola', 3, 12, 11], ['yungoos', 3, 16, 12], ['trubbish', 3, 20, 12], ['salandit', 2, 24, 13], ['mareanie', 2, 28, 13], ['scraggy', 2, 32, 14], ['pawniard', 2, 36, 14], ['krokorok', 1, 40, 15], ['golbat', 1, 44, 16], ['muk_alola', 1, 48, 16], ['raticate_alola', 0, 52, 18], ['gumshoos', 0, 56, 18], ['salazzle', 0, 62, 30, 1], ['masquerain', 0, 66, 22], ['ariados', 0, 70, 22], ['pinsir', 0, 74, 24]]),
      gate: { by: 'time', at: 40, forms: ['muk_alola', 'salazzle', 'masquerain', 'ariados', 'pinsir', 'golisopod'] },
      ace: { form: 'golisopod', level: 63, giant: true, sig: { move: 'First Impression + Liquidation', aoe: 150, reach: 100 } } },
    // K3 — the Route 17 police station: Kahuna NANU's grand trial
    { id: 'alola_16_nanu', name: 'Police Station', place: "Nanu's grand trial", leader: 'Nanu', kind: 'gym', level: 68, background: 'gym_nanu', townMusic: 'town_po',
      drops: L({ dusk_stone: 2, moon_stone: 1 }),
      waves: X(68, [['meowth_alola', 3, 4, 10], ['murkrow', 3, 9, 11], ['zorua', 3, 14, 12], ['sneasel', 3, 18, 12], ['pawniard', 2, 22, 13], ['scraggy', 2, 26, 13], ['sableye', 2, 30, 14], ['krokorok', 1, 36, 15], ['absol', 1, 42, 16], ['honchkrow', 0, 48, 18], ['krookodile', 0, 54, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['absol', 'honchkrow', 'krookodile', 'persian_alola'] },
      ace: { form: 'persian_alola', level: 68, giant: true, sig: { move: 'Night Slash + Power Gem', aoe: 150, reach: 100 } } },
    // Aether Paradise (the second visit): LUSAMINE — Bewear the stage ace, a giant NIHILEGO at its own 40 % (Banner B's Ultra Beast —
    // enemy use is normal, the Kalos Flare-HQ precedent; never in a counter-burst). Gladion's TYPE: NULL joins on the first clear (C10).
    { id: 'alola_17_lusamine', name: 'Aether Paradise', place: "Lusamine's mansion", leader: 'Lusamine', mapLabel: 'Aether Mansion', kind: 'trainer', level: 72, background: 'aether_mansion', townMusic: 'town_aether', gift: 'type_null',
      drops: L({ shiny_stone: 1, moon_stone: 1, metal_coat: 1 }),
      waves: X(72, [['magnemite', 3, 4, 11], ['porygon', 3, 8, 11], ['voltorb', 3, 12, 12], ['magneton', 2, 18, 13], ['electrode', 2, 24, 14], ['porygon2', 1, 30, 15], ['clefable', 1, 36, 16], ['lilligant', 1, 42, 18], ['mismagius', 0, 48, 20], ['milotic', 0, 54, 22], ['golisopod', 0, 62, 34, 1]]),
      gate: { by: 'time', at: 40, forms: ['clefable', 'lilligant', 'mismagius', 'milotic', 'golisopod', 'bewear', 'nihilego'] },
      burst: { pack: [1, 2], trickle: 3.2, size: [2, 3], counterSize: 2 }, // the Ultra Beast is the event (the Seafloor shape)
      ace: { form: 'bewear', level: 72, giant: true, sig: { move: 'Hammer Arm', aoe: 150, reach: 100 } },
      extraAces: [{ form: 'nihilego', level: 72, giant: true, at: 0.4, sig: { move: 'Power Gem + Venoshock', aoe: 150, status: 'poison', reach: 220 } }] },
    { id: 'alola_18_poni', name: 'Seafolk Village', place: 'Poni Wilds · Ancient Poni Path', mapLabel: 'Poni Wilds', kind: 'wild', level: 77, background: 'poni_wilds', townMusic: 'town_seafolk', gift: 'rowlet_decidueye_hisui',
      drops: L({ water_stone: 2, moon_stone: 1 }),
      waves: X(77, [['wailmer', 3, 4, 10], ['shellos', 3, 8, 11], ['inkay', 3, 12, 11], ['carvanha', 3, 16, 12], ['crabrawler', 3, 20, 12], ['furfrou', 2, 24, 13], ['granbull', 2, 28, 13], ['pelipper', 2, 32, 14], ['gastrodon', 1, 38, 15], ['dhelmise', 1, 44, 16], ['sharpedo', 1, 48, 16], ['relicanth', 0, 52, 18], ['dragalge', 0, 64, 22], ['clawitzer', 0, 68, 22]]),
      gate: { by: 'time', at: 40, forms: ['dhelmise', 'dragalge', 'clawitzer'] } },
    // T7 — Vast Poni Canyon: the captainless trial (canon). TOTEM KOMMO-O calls Hakamo-o / Scizor
    { id: 'alola_19_vast_poni', name: 'Vast Poni Canyon', place: 'the Dragon trial', leader: 'Totem Kommo-o', mapLabel: 'Vast Poni Canyon', kind: 'gym', level: 81, background: 'vast_poni_canyon', townMusic: 'town_seafolk',
      drops: L({ moon_stone: 2, metal_coat: 1 }),
      waves: X(81, [['jangmo_o', 3, 4, 10], ['rockruff', 3, 9, 11], ['mienfoo', 3, 14, 12], ['carbink', 3, 18, 12], ['boldore', 2, 22, 13], ['machoke', 2, 26, 13], ['sableye', 2, 30, 14], ['hakamo_o', 1, 36, 15], ['skarmory', 1, 42, 16], ['lycanroc', 0, 48, 18], ['lycanroc_midnight', 0, 52, 18], ['dugtrio_alola', 0, 56, 20]]),
      gate: { by: 'hp', at: 0.9, forms: ['skarmory', 'lycanroc', 'lycanroc_midnight', 'kommo_o'] },
      ace: { form: 'kommo_o', level: 81, giant: true, totem: true, sig: { move: 'Clanging Scales', aoe: 160, reach: 100 },
        summon: { pool: ['hakamo_o', 'scizor'], n: [1, 1], every: [14, 19], first: 10, level: 79 } } },
    // T8 — Poni Meadow: Captain MINA's trial (USUM's eighth). TOTEM RIBOMBEE calls Cutiefly / Comfey
    { id: 'alola_20_mina', name: 'Poni Meadow', place: "Mina's trial", leader: 'Mina', kind: 'gym', level: 86, background: 'poni_meadow', townMusic: 'town_seafolk',
      drops: L({ shiny_stone: 2, moon_stone: 1 }),
      waves: X(86, [['cutiefly', 3, 4, 10], ['floette', 3, 9, 11], ['petilil', 3, 14, 12], ['cottonee', 3, 18, 12], ['oricorio', 2, 22, 13], ['misdreavus', 2, 26, 13], ['comfey', 2, 30, 14], ['shiinotic', 1, 36, 15], ['granbull', 1, 42, 16], ['klefki', 0, 48, 18], ['wigglytuff', 0, 54, 20], ['dragonite', 0, 64, 34, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['klefki', 'wigglytuff', 'dragonite', 'ribombee'] },
      ace: { form: 'ribombee', level: 86, giant: true, totem: true, sig: { move: 'Pollen Puff', aoe: 160, status: 'sleep', reach: 200 },
        summon: { pool: ['cutiefly', 'comfey'], n: [1, 2], every: [14, 19], first: 10, level: 84 } } },
    // K4 — Exeggutor Island · Poni Plains: Kahuna HAPU's grand trial — the last regular stage reaches the cap
    { id: 'alola_21_hapu', name: 'Poni Plains', place: "Hapu's grand trial", leader: 'Hapu', kind: 'gym', level: 90, background: 'gym_hapu', townMusic: 'town_seafolk',
      drops: L({ leaf_stone: 3, moon_stone: 1 }),
      waves: X(90, [['exeggcute_exeggutor_alola', 3, 4, 10], ['mudbray', 3, 9, 11], ['tropius', 3, 14, 12], ['aipom', 3, 18, 12], ['scyther', 2, 22, 13], ['miltank', 2, 26, 13], ['sliggoo', 2, 30, 14], ['exeggutor_alola', 1, 36, 15], ['hariyama', 1, 40, 16], ['golurk', 1, 46, 16], ['gastrodon', 0, 50, 18], ['flygon', 0, 56, 20], ['aggron', 0, 62, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['exeggutor_alola', 'golurk', 'gastrodon', 'flygon', 'aggron', 'mudsdale'] },
      ace: { form: 'mudsdale', level: 90, giant: true, sig: { move: 'High Horsepower', aoe: 160, reach: 100 } } },
    // the Mount Lanakila Elite Four as FOUR nodes; the Lanakila climb folds into Hala's pool (the Victory Road pattern)
    { id: 'alola_22_hala_e4', name: 'Elite Four', leader: 'Hala', mapLabel: 'Hala', kind: 'e4', level: 90, background: 'e4_hala', townMusic: 'town_alola_league',
      drops: L({ ice_stone: 3, moon_stone: 1 }),
      waves: X(90, [['sandshrew_alola', 3, 4, 10], ['vulpix_alola', 3, 8, 11], ['makuhita', 3, 14, 13], ['snorunt', 3, 20, 14], ['vanillish', 2, 26, 15], ['sandslash_alola', 2, 32, 16], ['drampa', 1, 38, 18], ['hariyama', 1, 44, 18], ['poliwrath', 0, 48, 20], ['bewear', 0, 54, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['drampa', 'hariyama', 'poliwrath', 'bewear', 'crabominable'] },
      ace: { form: 'crabominable', level: 90, giant: true, sig: { move: 'Ice Hammer', aoe: 160, status: 'freeze', reach: 100 } } },
    { id: 'alola_23_olivia_e4', name: 'Elite Four', leader: 'Olivia', mapLabel: 'Olivia', kind: 'e4', level: 90, background: 'e4_olivia', townMusic: 'town_alola_league',
      drops: L({ moon_stone: 2, metal_coat: 1 }),
      waves: X(90, [['rockruff_lycanroc_midnight', 3, 4, 10], ['geodude_alola', 3, 8, 11], ['nosepass', 3, 14, 13], ['minior', 3, 20, 14], ['graveler_alola', 2, 26, 15], ['boldore', 2, 32, 16], ['relicanth', 1, 38, 18], ['carbink', 1, 44, 18], ['probopass', 0, 48, 20], ['golem_alola', 0, 54, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['relicanth', 'carbink', 'probopass', 'golem_alola', 'lycanroc_midnight'] },
      ace: { form: 'lycanroc_midnight', level: 90, giant: true, sig: { move: 'Counter + Stone Edge', aoe: 160, reach: 100 } } },
    { id: 'alola_24_acerola_e4', name: 'Elite Four', leader: 'Acerola', mapLabel: 'Acerola', kind: 'e4', level: 90, background: 'e4_acerola', townMusic: 'town_alola_league',
      drops: L({ dusk_stone: 2, moon_stone: 1 }),
      waves: X(90, [['sandygast', 3, 4, 10], ['drifloon', 3, 8, 11], ['snorunt', 3, 14, 13], ['haunter', 3, 20, 14], ['mimikyu', 2, 26, 15], ['marowak_alola', 2, 32, 16], ['sableye', 1, 38, 18], ['drifblim', 1, 44, 18], ['froslass', 0, 48, 20], ['dhelmise', 0, 54, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['sableye', 'drifblim', 'froslass', 'dhelmise', 'palossand'] },
      ace: { form: 'palossand', level: 90, giant: true, sig: { move: 'Shore Up + Shadow Ball', aoe: 160, status: 'sleep', reach: 220 } } },
    { id: 'alola_25_kahili_e4', name: 'Elite Four', leader: 'Kahili', mapLabel: 'Kahili', kind: 'e4', level: 90, background: 'e4_kahili', townMusic: 'town_alola_league',
      drops: L({ moon_stone: 2, sun_stone: 1 }),
      waves: X(90, [['pikipek', 3, 4, 10], ['vullaby', 3, 8, 11], ['zubat', 3, 14, 13], ['rufflet', 3, 20, 14], ['trumbeak', 2, 26, 15], ['golbat', 2, 32, 16], ['oricorio', 1, 38, 18], ['skarmory', 1, 42, 18], ['crobat', 0, 46, 20], ['mandibuzz', 0, 50, 20], ['braviary', 0, 56, 22]]),
      gate: { by: 'hp', at: 0.9, forms: ['skarmory', 'crobat', 'mandibuzz', 'braviary', 'toucannon'] },
      ace: { form: 'toucannon', level: 90, giant: true, sig: { move: 'Beak Blast', aoe: 160, status: 'burn', reach: 200 } } },
    // the Champion (Professor KUKUI, Alola's first): first clear = SOLGALEO + LUNALA (both reward lines, granted at Lv 53 so both box
    // legendaries are unlocked — the first region to grant two) + the region's Master Ball; Alola counts as beaten (regionsDone.alola).
    { id: 'alola_26_kukui', name: 'Champion', leader: 'Kukui', kind: 'champion', level: 90, background: 'champion_room', townMusic: 'town_alola_league', gift: 'cosmog', gift2: 'cosmog_lunala',
      drops: L({ ice_stone: 1, thunder_stone: 1, moon_stone: 1 }),
      waves: X(90, [['rockruff', 3, 4, 11], ['vulpix_alola', 3, 8, 12], ['rufflet', 3, 12, 12], ['magnemite', 2, 20, 14], ['magneton', 2, 24, 14], ['ninetales_alola', 1, 30, 16], ['braviary', 1, 36, 18], ['snorlax', 1, 42, 18], ['magnezone', 0, 48, 20], ['incineroar', 0, 54, 26, 1]]),
      gate: { by: 'hp', at: 0.9, forms: ['ninetales_alola', 'braviary', 'snorlax', 'magnezone', 'incineroar', 'lycanroc'] },
      ace: { form: 'lycanroc', level: 90, giant: true, sig: { move: 'Accelerock + Stone Edge', aoe: 170, reach: 110 } }, regionFinal: true },
    // 27 — NECROZMA (post-game + OPTIONAL — user ruling, the Arceus pattern): on Mount Lanakila's summit an Ultra Wormhole opens on Ultra
    // Megalopolis. Necrozma (giant, base form) descends at once and, while it stands, calls the banner ULTRA BEASTS; the field stays thin
    // so the summons are the threat. Very hard by design, not required, unlocks nothing. First clear = NECROZMA joins (U3a).
    { id: 'alola_27_necrozma', name: 'Necrozma', place: 'Ultra Megalopolis', mapLabel: 'Necrozma', kind: 'champion', level: 90, background: 'ultra_megalopolis', townMusic: 'town_alola_league', gift: 'necrozma', optional: true,
      drops: L({ moon_stone: 1, shiny_stone: 1, dawn_stone: 1 }),
      waves: X(90, [['minior', 1, 4, 16], ['elgyem', 1, 10, 18], ['clefairy', 1, 16, 18], ['beldum', 1, 22, 20], ['metang', 0, 28, 20]]), // thin (the Arceus shape): the summons are the threat
      gate: { by: 'time', at: 6, forms: ['necrozma', 'metang', 'elgyem', 'minior'] }, // Y1: it descends at once (6 s)
      burst: { pack: [2, 3], trickle: 1.4, size: [3, 4], counterSize: 3 },
      extraAces: [{ form: 'necrozma', level: 90, giant: true, time: 2, sig: { move: 'Prismatic Laser', aoe: 180, reach: 280 },
        summon: { pool: ['nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord'], n: [1, 1], every: [18, 24], first: 16, level: 84 } }], // the Ultra Beasts are legendary-tier bodies: they come a little under the stage
      postgame: true },
  ];
  const CARRIERS = { alola_03_ilima: ['yungoos'], alola_05_hala: ['makuhita'], alola_06_paniola: ['mudbray'], alola_07_lana: ['dewpider'],
    alola_08_kiawe: ['salandit'], alola_09_mallow: ['morelull'], alola_10_olivia: ['roggenrola'], alola_11_aether: ['magnemite'], alola_12_malie: ['grimer_alola'],
    alola_13_sophocles: ['grubbin'], alola_14_acerola: ['shuppet'], alola_15_po_town: ['salandit'], alola_16_nanu: ['murkrow'], alola_17_lusamine: ['magnemite'],
    alola_18_poni: ['shellos'], alola_19_vast_poni: ['jangmo_o'], alola_20_mina: ['cutiefly'], alola_21_hapu: ['mudbray'], alola_22_hala_e4: ['vulpix_alola'],
    alola_23_olivia_e4: ['geodude_alola'], alola_24_acerola_e4: ['sandygast'], alola_25_kahili_e4: ['pikipek'], alola_26_kukui: ['vulpix_alola'] };
  // Z1 enemy bases: the 4 kahunas = their own base art; the 8 trials share ONE Totem-den base (pack C11); the E4 rooms the shared E4 base;
  // Kukui and Necrozma the Champion's one
  const BASES = { alola_05_hala: 'gym_hala', alola_10_olivia: 'gym_olivia', alola_16_nanu: 'gym_nanu', alola_21_hapu: 'gym_hapu',
    alola_03_ilima: 'trial_den', alola_07_lana: 'trial_den', alola_08_kiawe: 'trial_den', alola_09_mallow: 'trial_den', alola_13_sophocles: 'trial_den',
    alola_14_acerola: 'trial_den', alola_19_vast_poni: 'trial_den', alola_20_mina: 'trial_den',
    alola_22_hala_e4: 'e4', alola_23_olivia_e4: 'e4', alola_24_acerola_e4: 'e4', alola_25_kahili_e4: 'e4', alola_26_kukui: 'champion', alola_27_necrozma: 'champion' };
  BM.ALOLA_HARD = {}; // the difficulty dial — set by the Act 3 native-deck sims (BR-117 practice)
  BM.ALOLA_EB = [[1, 40000], [5, 43000], [10, 46000], [15, 46500], [20, 47000], [26, 49000], [27, 52000]];
  BM.alolaBaseHP = function (st) {
    const A = BM.ALOLA_EB, n = st.num;
    let v = A[A.length - 1][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; v = y0 * Math.pow(y1 / y0, (Math.max(n, x0) - x0) / (x1 - x0)); break; }
    return Math.round(v * (BM.EB_KIND[st.kind] || 1) / 50) * 50;
  };
  S.forEach((st, i) => {
    Object.assign(st, { num: i + 1, region: 'alola', curveAt: 25, packBase: true, music: { wild: 'battle_wild', trainer: 'battle_trainer', gym: 'battle_gym', e4: 'battle_elitefour', champion: 'battle_champion' }[st.kind] });
    st.mapLabel = st.mapLabel || (st.kind === 'e4' ? st.leader : undefined);
    const e4 = ['e4', 'champion'].includes(st.kind);
    st.burst = { pack: e4 ? BM.HOENN_CADENCE.e4pack : BM.HOENN_CADENCE.pack, trickle: e4 ? BM.HOENN_CADENCE.e4trickle : BM.HOENN_CADENCE.trickle, ...(st.burst || {}) };
    st.background = 'alola_' + st.background;
    if (BASES[st.id]) st.baseArt = BASES[st.id];
    if (CARRIERS[st.id]) BM.STAGE_CARRIERS[st.id] = CARRIERS[st.id];
    // the curve's anchors are cap-scale (Lv 81 → 90, the Unova / Kalos drafts' band, +5); Alola's stage levels are written already ON the
    // ramp, so BM.rampStage would not re-base the HP (draft = ramp level) — re-base it here, the way every drafted region's is
    const draft = 81 + 9 * i / (S.length - 1);
    st.enemyBaseHP = Math.round(BM.alolaBaseHP(st) * BM.rampHpMul(draft, st.level) / 50) * 50;
  });
  for (const st of S) if (st.mapLabel === undefined) delete st.mapLabel;
  BM.applyRamp(S, BM.CAP_LADDER.alola); // regular Lv 1 → 90, the E4 + Kukui at the cap, Necrozma cap + 5 — before the dial
  for (const st of S) if (BM.ALOLA_HARD[st.num]) BM.hardenStage(st, BM.ALOLA_HARD[st.num]);
  BM.ALOLA_STAGES = S;
  BM.STAGES.push(...S);
})();
