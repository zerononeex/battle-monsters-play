// KALOS STAGES (Kalos + Alola build, Act 1) — the 25-node Kalos journey from the prep pack's stage-plan.md (X / Y gym order: Viola, Grant,
// Korrina, Ramos, Clemont, Valerie, Olympia, Wulfric; the Elite Four as FOUR nodes; Champion Diantha 24; the capstone 25).
//   Vaniville → Santalune Forest → Route 3 → Viola → Lumiose → Parfum Palace → Grant (TWIN aces Tyrunt + Amaura) → Glittering Cave
//   (Team Flare) → Ambrette → Korrina (Tower of Mastery: a guaranteed first-clear LUCARIONITE) → Ramos → the Power Plant (Flare) →
//   Clemont → Valerie → the Poké Ball Factory (Flare) → Frost Cavern → Olympia → Team Flare Secret HQ (Lysandre: giant XERNEAS, giant
//   YVELTAL at its own 40 %, Lysandre's Mega Gyarados a mid-stage elite) → Wulfric → Malva · Siebold · Wikstrom · Drasna → Champion
//   Diantha (giant MEGA GARDEVOIR; first clear = ZYGARDE + a Master Ball, U2 — Kalos counts as beaten, Alola opens) → 25 the capstone
//   "ROGUE MEGA NIGHT" in Lumiose (U2 / C11 option A): enemy Megas of Kalos player lines as elites, a giant MEGA DIANCIE ace; first
//   clear = Master Ball + XP Candy L ×3 + DIANCITE.
//   LEVELS (ruling): the pack's plan predates the ramp (Lv 76 → 85); the levels below are that draft, RE-LEVELLED by BM.applyRamp onto the
//   ramp like every other region — regular stages Lv 1 → 85 (the cap), the Elite Four + Diantha + the capstone AT the cap. Below Lv 38
//   the early-region pass applies (stages 1–8: forms devolve to their level, normal-size aces).
//   Waves = the location's X / Y encounters (PokéAPI encounters, the pack's pools) / the leader's XY team (recalled, pack U9) + type.
//   Y1 gates, OOO1 late cadence (`curveAt: 25`), BR-099 `packBase`; Step 9.5 Part B from day one: every gym / E4 / Diantha ace carries
//   its Leader's Menace + the Last Stand at 50 %. No VV1 restriction (Kalos stays rule-free). No Prism Tower entry on the map (VVV1).
window.BM = window.BM || {};
(function () {
  const W = BM.waveRow, D = BM.dropTable;
  const M = (stones) => D('mid', stones), L = (stones) => D('late', stones);
  const S = [
    { id: 'kalos_01_vaniville', name: 'Vaniville Town', place: 'Route 2', kind: 'wild', level: 76, background: 'vaniville_town', townMusic: 'town_vaniville', gift: 'chespin',
      drops: M({ leaf_stone: 1, water_stone: 1 }),
      waves: [W('fletchling', 73, 4, 10), W('bunnelby', 73, 9, 11), W('scatterbug', 73, 14, 11), W('pidgey', 74, 30, 16), W('zigzagoon', 75, 42, 22)],
      gate: { by: 'time', at: 35, forms: ['pidgey', 'zigzagoon'] } },
    { id: 'kalos_02_santalune_forest', name: 'Santalune Forest', kind: 'wild', level: 76, background: 'santalune_forest', townMusic: 'town_santalune', gift: 'fennekin',
      drops: M({ leaf_stone: 1, fire_stone: 1 }),
      waves: [W('scatterbug', 73, 4, 10), W('fletchling', 73, 8, 11), W('caterpie', 73, 12, 11), W('pansage', 74, 18, 12), W('pansear', 74, 22, 12), W('panpour', 74, 26, 12), W('pikachu', 75, 40, 18), W('metapod', 75, 46, 22)],
      gate: { by: 'time', at: 38, forms: ['pikachu', 'metapod'] } },
    { id: 'kalos_03_route_3', name: 'Santalune City', place: 'Route 3', kind: 'wild', level: 77, background: 'route_3', townMusic: 'town_santalune', gift: 'froakie',
      drops: M({ water_stone: 1, moon_stone: 1 }),
      burst: { pack: [1, 2], trickle: 2 }, // the last kid-easy opener (the Hoenn Step 9.5 opener shape)
      waves: [W('bidoof', 74, 6, 10), W('bunnelby', 74, 12, 11), W('burmy', 74, 18, 12), W('fletchling', 74, 24, 12), W('pidgey', 74, 30, 13), W('marill', 75, 36, 14), W('dunsparce', 75, 44, 16), W('goldeen', 75, 50, 16), W('corphish', 76, 60, 20), W('masquerain', 77, 80, 26)],
      gate: { by: 'time', at: 70, forms: ['corphish', 'masquerain'] } },
    { id: 'kalos_04_viola', name: 'Santalune Gym', leader: 'Viola', kind: 'gym', level: 77, background: 'gym_viola', townMusic: 'town_santalune',
      drops: M({ leaf_stone: 1, moon_stone: 1 }),
      waves: [W('scatterbug', 74, 4, 10), W('spewpa', 74, 9, 11), W('burmy', 74, 14, 12), W('combee', 74, 18, 12), W('ledyba', 75, 22, 13), W('surskit', 75, 26, 13), W('volbeat', 76, 34, 16), W('illumise', 76, 38, 16), W('masquerain', 77, 46, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['volbeat', 'illumise', 'masquerain', 'vivillon'] },
      ace: { form: 'vivillon', level: 77, giant: true, sig: { move: 'Quiver Dance + Hurricane', aoe: 110, status: 'sleep', reach: 200 } } },
    { id: 'kalos_05_lumiose', name: 'Lumiose City', place: 'Routes 4–5', kind: 'wild', level: 78, background: 'lumiose_city', townMusic: 'town_lumiose',
      drops: M({ moon_stone: 1, shiny_stone: 1 }),
      waves: [W('flabebe', 75, 4, 10), W('ralts', 75, 8, 11), W('budew', 75, 12, 11), W('skitty', 75, 16, 12), W('ledyba', 75, 20, 12), W('pancham', 76, 26, 13), W('skiddo', 76, 30, 13), W('abra', 76, 34, 14), W('gulpin', 76, 38, 14), W('plusle', 77, 44, 16), W('minun', 77, 46, 16), W('scraggy', 77, 52, 18), W('furfrou', 78, 60, 22)],
      gate: { by: 'time', at: 40, forms: ['scraggy', 'furfrou'] } },
    { id: 'kalos_06_parfum', name: 'Parfum Palace', place: 'Route 7 · Connecting Cave', mapLabel: 'Parfum Palace', kind: 'wild', level: 78, background: 'parfum_palace', townMusic: 'town_camphrier',
      drops: M({ whipped_dream: 1, sachet: 1, leaf_stone: 1 }),
      waves: [W('flabebe', 75, 4, 10), W('spritzee', 75, 8, 11), W('swirlix', 75, 12, 11), W('hoppip', 75, 16, 12), W('ducklett', 75, 20, 12), W('espurr', 76, 26, 13), W('honedge', 76, 30, 13), W('croagunk', 76, 34, 14), W('smeargle', 76, 38, 14), W('audino', 77, 44, 16), W('venipede', 77, 48, 16), W('axew', 77, 54, 18), W('roselia', 78, 60, 20), W('kecleon', 78, 66, 22)],
      gate: { by: 'time', at: 40, forms: ['audino', 'axew', 'roselia', 'kecleon'] } },
    // TWIN ACES (pack, the Tate & Liza precedent): Grant's Tyrunt at 70 % / 90 s, his Amaura at her own 40 %
    { id: 'kalos_07_grant', name: 'Cyllage Gym', leader: 'Grant', kind: 'gym', level: 79, background: 'gym_grant', townMusic: 'town_cyllage',
      drops: M({ moon_stone: 2, water_stone: 1 }),
      waves: [W('onix', 76, 4, 10), W('dwebble', 76, 9, 11), W('binacle', 76, 14, 12), W('roggenrola', 76, 18, 12), W('nosepass', 77, 24, 13), W('clauncher', 77, 30, 14), W('skrelp', 77, 34, 14), W('relicanth', 78, 44, 18), W('boldore', 78, 50, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['relicanth', 'boldore', 'tyrunt', 'amaura'] },
      ace: { form: 'tyrunt', level: 79, giant: true, sig: { move: 'Head Smash', aoe: 120, reach: 90 } },
      extraAces: [{ form: 'amaura', level: 79, giant: true, at: 0.4, sig: { move: 'Aurora Beam', aoe: 120, status: 'freeze', reach: 200 } }] },
    { id: 'kalos_08_glittering_cave', name: 'Glittering Cave', leader: 'Team Flare', kind: 'trainer', level: 79, background: 'glittering_cave', townMusic: 'town_cyllage',
      drops: M({ moon_stone: 2, fire_stone: 1 }),
      waves: [W('machop', 76, 4, 10), W('cubone', 76, 8, 11), W('houndour', 76, 12, 11), W('scraggy', 76, 16, 12), W('croagunk', 76, 20, 12), W('woobat', 77, 24, 13), W('ferroseed', 77, 28, 13), W('rhyhorn', 77, 34, 14), W('lunatone', 78, 40, 16), W('solrock', 78, 42, 16), W('mawile', 78, 48, 18), W('golbat', 79, 54, 20), W('tyrunt', 79, 64, 26), W('amaura', 79, 70, 26)],
      gate: { by: 'time', at: 40, forms: ['mawile', 'golbat', 'tyrunt', 'amaura'] } },
    { id: 'kalos_09_ambrette', name: 'Ambrette Town', place: 'Route 8 · the Fossil Lab', kind: 'wild', level: 79, background: 'ambrette_town', townMusic: 'town_ambrette',
      drops: M({ sun_stone: 2, water_stone: 1 }),
      waves: [W('binacle', 76, 4, 10), W('clauncher', 76, 8, 11), W('skrelp', 76, 12, 11), W('wingull', 76, 16, 12), W('tentacool', 76, 20, 12), W('inkay', 77, 24, 13), W('helioptile', 77, 28, 13), W('dwebble', 77, 32, 14), W('mienfoo', 77, 36, 14), W('drifloon', 78, 42, 16), W('zangoose', 78, 46, 16), W('seviper', 78, 48, 16), W('absol', 78, 54, 18), W('clawitzer', 79, 62, 22), W('dragalge', 79, 68, 24)],
      gate: { by: 'time', at: 40, forms: ['absol', 'clawitzer', 'dragalge'] } },
    // the Tower of Mastery — where Kalos teaches Mega Evolution: a GUARANTEED first-clear Lucarionite (the Sinnoh stone, pack C10)
    { id: 'kalos_10_korrina', name: 'Shalour Gym', place: 'Tower of Mastery', leader: 'Korrina', kind: 'gym', level: 80, background: 'gym_korrina', townMusic: 'town_shalour', item: 'lucarionite',
      drops: M({ moon_stone: 1, metal_coat: 1, water_stone: 1 }),
      waves: [W('machop', 77, 4, 10), W('mienfoo', 77, 9, 11), W('meditite', 77, 14, 12), W('riolu', 77, 18, 12), W('throh', 78, 24, 14), W('sawk', 78, 28, 14), W('machoke', 78, 34, 16), W('hariyama', 79, 42, 18), W('lucario', 80, 50, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['machoke', 'hariyama', 'lucario', 'hawlucha'] },
      ace: { form: 'hawlucha', level: 80, giant: true, sig: { move: 'Flying Press', aoe: 130, reach: 90 } } },
    { id: 'kalos_11_ramos', name: 'Coumarine Gym', leader: 'Ramos', kind: 'gym', level: 80, background: 'gym_ramos', townMusic: 'town_coumarine',
      drops: M({ leaf_stone: 3, water_stone: 1 }),
      waves: [W('hoppip', 77, 4, 10), W('bellsprout', 77, 9, 11), W('oddish', 77, 14, 12), W('sunkern', 77, 18, 12), W('skiddo', 77, 22, 13), W('budew', 78, 26, 13), W('skiploom', 78, 32, 15), W('weepinbell', 79, 38, 16), W('jumpluff', 79, 46, 18), W('wingull', 78, 50, 18), W('remoraid', 78, 54, 18), W('lapras', 80, 70, 40)],
      gate: { by: 'hp', at: 0.9, forms: ['weepinbell', 'jumpluff', 'lapras', 'gogoat'] },
      ace: { form: 'gogoat', level: 80, giant: true, sig: { move: 'Horn Leech', aoe: 130, status: 'poison', reach: 90 } } },
    { id: 'kalos_12_power_plant', name: 'Kalos Power Plant', place: 'Route 13', leader: 'Team Flare', mapLabel: 'Power Plant', kind: 'trainer', level: 81, background: 'power_plant', townMusic: 'town_lumiose',
      drops: M({ thunder_stone: 2, fire_stone: 1 }),
      waves: [W('trapinch', 78, 4, 10), W('gible', 78, 8, 11), W('slugma', 78, 12, 11), W('electrike', 78, 16, 12), W('houndour', 78, 20, 12), W('helioptile', 79, 24, 13), W('dedenne', 79, 28, 13), W('golbat', 79, 34, 15), W('liepard', 80, 40, 16), W('graveler', 80, 44, 16), W('diglett', 77, 46, 16), W('dugtrio', 80, 50, 18), W('manectric', 81, 56, 20)],
      gate: { by: 'time', at: 40, forms: ['liepard', 'graveler', 'dugtrio', 'manectric'] } },
    { id: 'kalos_13_clemont', name: 'Lumiose Gym', leader: 'Clemont', kind: 'gym', level: 81, background: 'gym_clemont', townMusic: 'town_lumiose',
      drops: L({ sun_stone: 2, thunder_stone: 2 }),
      waves: [W('helioptile', 78, 4, 10), W('magnemite', 78, 9, 11), W('pikachu', 78, 14, 12), W('electrike', 78, 18, 12), W('dedenne', 79, 22, 13), W('pachirisu', 79, 26, 13), W('emolga', 79, 32, 15), W('rotom', 80, 38, 16), W('magneton', 80, 44, 18), W('manectric', 81, 50, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['rotom', 'magneton', 'manectric', 'heliolisk'] },
      ace: { form: 'heliolisk', level: 81, giant: true, sig: { move: 'Parabolic Charge', aoe: 140, status: 'paralyze', reach: 200 } } },
    { id: 'kalos_14_valerie', name: 'Laverre Gym', place: 'the Lost Hotel', leader: 'Valerie', kind: 'gym', level: 82, background: 'gym_valerie', townMusic: 'town_laverre',
      drops: L({ whipped_dream: 1, sachet: 1, shiny_stone: 1 }),
      waves: [W('flabebe', 79, 4, 10), W('spritzee', 79, 9, 11), W('swirlix', 79, 14, 12), W('snubbull', 79, 18, 12), W('jigglypuff', 79, 22, 13), W('goomy', 80, 26, 13), W('pumpkaboo', 80, 30, 14), W('phantump', 80, 34, 14), W('floette', 80, 40, 16), W('klefki', 81, 46, 18), W('mawile', 81, 52, 18), W('mr_mime', 82, 58, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['klefki', 'mawile', 'mr_mime', 'sylveon'] },
      ace: { form: 'sylveon', level: 82, giant: true, sig: { move: 'Moonblast', aoe: 140, status: 'sleep', reach: 220 } } },
    { id: 'kalos_15_pokeball_factory', name: 'Poké Ball Factory', leader: 'Team Flare', kind: 'trainer', level: 82, background: 'pokeball_factory', townMusic: 'town_laverre',
      drops: L({ moon_stone: 2, metal_coat: 1 }),
      waves: [W('houndour', 79, 4, 10), W('electrike', 79, 8, 11), W('croagunk', 79, 12, 11), W('scraggy', 79, 16, 12), W('klefki', 80, 22, 13), W('golbat', 80, 28, 14), W('swalot', 80, 34, 15), W('magneton', 81, 40, 16), W('mightyena', 81, 46, 18), W('liepard', 81, 50, 18), W('houndoom', 82, 56, 20)],
      gate: { by: 'time', at: 40, forms: ['magneton', 'mightyena', 'liepard', 'houndoom'] } },
    { id: 'kalos_16_frost_cavern', name: 'Frost Cavern', place: 'Dendemille Town · Route 17', mapLabel: 'Frost Cavern', kind: 'wild', level: 82, background: 'frost_cavern', townMusic: 'town_dendemille',
      drops: L({ ice_stone: 3, water_stone: 1 }),
      waves: [W('bergmite', 79, 4, 10), W('cubchoo', 79, 8, 11), W('vanillite', 79, 12, 11), W('smoochum', 79, 16, 12), W('snover', 79, 20, 12), W('sneasel', 80, 26, 13), W('delibird', 80, 30, 13), W('haunter', 80, 34, 14), W('piloswine', 81, 40, 16), W('jynx', 81, 44, 16), W('cryogonal', 81, 48, 18), W('beartic', 82, 54, 20), W('abomasnow', 82, 60, 22), W('avalugg', 82, 66, 24)],
      gate: { by: 'time', at: 40, forms: ['cryogonal', 'beartic', 'abomasnow', 'avalugg'] } },
    { id: 'kalos_17_olympia', name: 'Anistar Gym', leader: 'Olympia', kind: 'gym', level: 83, background: 'gym_olympia', townMusic: 'town_anistar',
      drops: L({ moon_stone: 2, dawn_stone: 1 }),
      waves: [W('espurr', 80, 4, 10), W('inkay', 80, 9, 11), W('abra', 80, 14, 12), W('slowpoke', 80, 18, 12), W('solosis', 80, 22, 13), W('ralts', 80, 26, 13), W('kadabra', 81, 32, 15), W('kirlia', 81, 36, 15), W('gothorita', 82, 42, 16), W('sigilyph', 82, 48, 18), W('slowking', 83, 54, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['gothorita', 'sigilyph', 'slowking', 'meowstic'] },
      ace: { form: 'meowstic', level: 83, giant: true, sig: { move: 'Psychic', aoe: 150, status: 'sleep', reach: 220 } } },
    // Team Flare Secret HQ — Lysandre's ultimate weapon wakes the box legendaries: giant XERNEAS at the usual 70 % / 90 s, giant YVELTAL at
    // its own 40 % (never both in one counter-burst — the Spear Pillar / Seafloor shape); Lysandre's Mega Gyarados a mid-stage elite
    { id: 'kalos_18_flare_hq', name: 'Team Flare HQ', place: 'Geosenge Town', leader: 'Lysandre', mapLabel: 'Flare HQ', kind: 'trainer', level: 83, background: 'flare_hq', townMusic: 'town_geosenge',
      drops: L({ fire_stone: 2, moon_stone: 1 }),
      waves: [W('houndour', 80, 4, 11), W('golbat', 80, 8, 11), W('croagunk', 80, 12, 12), W('liepard', 81, 18, 13), W('swalot', 81, 24, 14), W('mightyena', 81, 30, 15), W('houndoom', 82, 36, 16), W('mienshao', 82, 42, 18), W('honchkrow', 82, 48, 20), W('pyroar', 83, 54, 22), W('gyarados_mega', 83, 62, 40, 1)],
      gate: { by: 'time', at: 40, forms: ['mienshao', 'honchkrow', 'pyroar', 'gyarados_mega', 'xerneas', 'yveltal'] },
      burst: { pack: [1, 2], trickle: 3.2, size: [2, 3], counterSize: 2 }, // the two box legendaries are the event (the Seafloor shape)
      ace: { form: 'xerneas', level: 83, giant: true, sig: { move: 'Geomancy + Moonblast', aoe: 150, reach: 240 } },
      extraAces: [{ form: 'yveltal', level: 83, giant: true, at: 0.4, sig: { move: 'Oblivion Wing', aoe: 150, reach: 240 } }] },
    { id: 'kalos_19_wulfric', name: 'Snowbelle Gym', place: 'the Winding Woods', leader: 'Wulfric', kind: 'gym', level: 83, background: 'gym_wulfric', townMusic: 'town_snowbelle',
      drops: L({ ice_stone: 3, moon_stone: 1 }),
      waves: [W('bergmite', 80, 4, 10), W('snover', 80, 9, 11), W('cubchoo', 80, 14, 12), W('sneasel', 80, 18, 12), W('delibird', 80, 22, 13), W('cryogonal', 81, 28, 14), W('gothorita', 81, 32, 15), W('beartic', 82, 38, 16), W('trevenant', 82, 44, 18), W('amoonguss', 82, 48, 18), W('abomasnow', 83, 54, 20), W('zoroark', 83, 60, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['trevenant', 'amoonguss', 'abomasnow', 'zoroark', 'avalugg'] },
      ace: { form: 'avalugg', level: 83, giant: true, sig: { move: 'Avalanche', aoe: 150, status: 'freeze', reach: 100 } } },
    // the Elite Four as FOUR nodes; their bases share the 'e4' base
    { id: 'kalos_20_malva', name: 'Elite Four', leader: 'Malva', kind: 'e4', level: 85, background: 'e4_malva', townMusic: 'town_kalos_league',
      drops: L({ fire_stone: 3, moon_stone: 1 }),
      waves: [W('litleo', 82, 4, 10), W('litwick', 82, 8, 11), W('fletchinder', 82, 14, 13), W('houndour', 82, 20, 14), W('lampent', 83, 26, 15), W('heatmor', 83, 32, 16), W('torkoal', 84, 38, 18), W('pyroar', 84, 44, 18), W('houndoom', 84, 48, 20), W('chandelure', 85, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['torkoal', 'pyroar', 'houndoom', 'chandelure', 'talonflame'] },
      ace: { form: 'talonflame', level: 85, giant: true, sig: { move: 'Brave Bird + Flare Blitz', aoe: 160, status: 'burn', reach: 110 } } },
    { id: 'kalos_21_siebold', name: 'Elite Four', leader: 'Siebold', kind: 'e4', level: 85, background: 'e4_siebold', townMusic: 'town_kalos_league',
      drops: L({ water_stone: 3, moon_stone: 1 }),
      waves: [W('clauncher', 82, 4, 10), W('binacle', 82, 8, 11), W('staryu', 82, 14, 13), W('skrelp', 82, 20, 14), W('inkay', 83, 26, 15), W('clawitzer', 84, 32, 16), W('starmie', 84, 38, 18), W('lapras', 84, 44, 18), W('gyarados', 85, 50, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['clawitzer', 'starmie', 'lapras', 'gyarados', 'barbaracle'] },
      ace: { form: 'barbaracle', level: 85, giant: true, sig: { move: 'Razor Shell + Stone Edge', aoe: 160, reach: 100 } } },
    { id: 'kalos_22_wikstrom', name: 'Elite Four', leader: 'Wikstrom', kind: 'e4', level: 85, background: 'e4_wikstrom', townMusic: 'town_kalos_league',
      drops: L({ dusk_stone: 2, metal_coat: 1 }),
      waves: [W('honedge', 82, 4, 10), W('magnemite', 82, 8, 11), W('durant', 82, 14, 13), W('lairon', 82, 20, 14), W('doublade', 83, 26, 15), W('magneton', 83, 32, 16), W('skarmory', 84, 38, 18), W('probopass', 84, 44, 18), W('klefki', 84, 48, 20), W('scizor', 85, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['skarmory', 'probopass', 'klefki', 'scizor', 'aegislash'] },
      ace: { form: 'aegislash', level: 85, giant: true, sig: { move: 'King\'s Shield + Sacred Sword', aoe: 160, reach: 100 } } },
    // Victory Road folds into Drasna's pool (no node — the Hoenn / Sinnoh pattern)
    { id: 'kalos_23_drasna', name: 'Elite Four', leader: 'Drasna', kind: 'e4', level: 85, background: 'e4_drasna', townMusic: 'town_kalos_league',
      drops: L({ moon_stone: 2, metal_coat: 1 }),
      waves: [W('noibat', 82, 4, 10), W('goomy', 82, 8, 11), W('gurdurr', 82, 14, 13), W('lickitung', 82, 20, 14), W('sliggoo', 83, 26, 15), W('dragonair', 83, 30, 15), W('zweilous', 83, 36, 16), W('druddigon', 84, 42, 18), W('altaria', 84, 46, 18), W('dragalge', 85, 52, 20), W('hydreigon', 85, 62, 34, 1)],
      gate: { by: 'hp', at: 0.9, forms: ['druddigon', 'altaria', 'dragalge', 'hydreigon', 'noivern'] },
      ace: { form: 'noivern', level: 85, giant: true, sig: { move: 'Boomburst', aoe: 170, reach: 230 } } },
    // the Champion (Diantha): first clear = ZYGARDE (50% Forme, rewardOnly — Mewtwo → Lugia → Rayquaza → Giratina → Kyurem → Zygarde, U2)
    // + the region's Master Ball; Kalos counts as beaten (regionsDone.kalos) — which opens ALOLA (cap 90) and Mega Zygarde (U8). The giant
    // ace is MEGA GARDEVOIR (the Hoenn player line's Mega — the Mega Garchomp precedent; her Menace: GIANT).
    { id: 'kalos_24_champion', name: 'Champion', leader: 'Diantha', kind: 'champion', level: 85, background: 'champion_room', townMusic: 'town_kalos_league',
      drops: L({ shiny_stone: 1, dawn_stone: 1, moon_stone: 1 }),
      waves: [W('ralts', 82, 4, 11), W('goomy', 82, 8, 12), W('pumpkaboo', 82, 12, 12), W('kirlia', 83, 20, 14), W('tyrunt', 83, 24, 14), W('amaura', 83, 28, 14), W('hawlucha', 84, 34, 16), W('gourgeist', 84, 40, 18), W('tyrantrum', 84, 46, 20), W('aurorus', 84, 50, 20), W('goodra', 85, 56, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['hawlucha', 'gourgeist', 'tyrantrum', 'aurorus', 'goodra', 'gardevoir_mega'] },
      ace: { form: 'gardevoir_mega', level: 85, giant: true, sig: { move: 'Moonblast', aoe: 170, status: 'sleep', reach: 240 } }, gift: 'zygarde', regionFinal: true },
    // 25 — the CAPSTONE (U2, C11 option A): "ROGUE MEGA NIGHT" — Lumiose City at night (a Legends: Z-A nod). Rogue Megas of Kalos player
    // lines run wild as mid-stage elites; the giant ace is MEGA DIANCIE (Banner A's mythical — enemy use is normal, the Deoxys precedent).
    // No leader (a capstone, like the Sky Pillar — no menace / last stand). First clear = Master Ball + XP Candy L ×3 + DIANCITE.
    { id: 'kalos_25_rogue_mega_night', name: 'Rogue Mega Night', place: 'Lumiose City at night', mapLabel: 'Rogue Mega Night', kind: 'champion', level: 85, background: 'lumiose_night', townMusic: 'town_lumiose',
      drops: L({ moon_stone: 2, shiny_stone: 1, dusk_stone: 1 }),
      waves: [W('litleo', 82, 4, 11), W('inkay', 82, 8, 11), W('espurr', 82, 12, 12), W('binacle', 82, 16, 12), W('skrelp', 82, 20, 12), W('pyroar', 83, 26, 14), W('malamar', 83, 30, 14), W('meowstic', 83, 34, 15), W('pyroar_mega', 84, 42, 30, 2), W('malamar_mega', 84, 48, 30, 2), W('meowstic_mega', 84, 54, 30, 2),
        W('barbaracle_mega', 85, 60, 32, 2), W('dragalge_mega', 85, 66, 32, 2), W('hawlucha_mega', 85, 72, 32, 2)],
      gate: { by: 'hp', at: 0.9, forms: ['pyroar_mega', 'malamar_mega', 'meowstic_mega', 'barbaracle_mega', 'dragalge_mega', 'hawlucha_mega', 'diancie_mega'] },
      burst: { pack: [3, 4], trickle: 1.1, size: [5, 6], counterSize: 5 }, // the capstone: the region's densest defence
      ace: { form: 'diancie_mega', level: 85, giant: true, sig: { move: 'Diamond Storm', aoe: 170, reach: 240 } },
      prize: { master_ball: 1, xp_candy_l: 3, diancite: 1 }, capstone: true },
  ];
  // carriers: the AoE / status units mixed into bursts (OOO1 late tier from stage 1)
  const CARRIERS = { kalos_04_viola: ['scatterbug'], kalos_05_lumiose: ['flabebe'], kalos_06_parfum: ['spritzee'], kalos_07_grant: ['binacle'],
    kalos_08_glittering_cave: ['croagunk'], kalos_09_ambrette: ['skrelp'], kalos_10_korrina: ['meditite'], kalos_11_ramos: ['bellsprout'],
    kalos_12_power_plant: ['helioptile'], kalos_13_clemont: ['helioptile'], kalos_14_valerie: ['flabebe'], kalos_15_pokeball_factory: ['croagunk'],
    kalos_16_frost_cavern: ['bergmite'], kalos_17_olympia: ['inkay'], kalos_18_flare_hq: ['croagunk'], kalos_19_wulfric: ['snover'],
    kalos_20_malva: ['litleo'], kalos_21_siebold: ['skrelp'], kalos_22_wikstrom: ['honedge'], kalos_23_drasna: ['noibat'], kalos_24_champion: ['ralts'],
    kalos_25_rogue_mega_night: ['skrelp'] };
  // Z1 enemy bases: the 8 Kalos gyms = their own base art (queued; the den until each lands); the E4 rooms the shared E4 base; Diantha
  // and the capstone the Champion's one
  const BASES = { kalos_04_viola: 'gym_viola', kalos_07_grant: 'gym_grant', kalos_10_korrina: 'gym_korrina', kalos_11_ramos: 'gym_ramos',
    kalos_13_clemont: 'gym_clemont', kalos_14_valerie: 'gym_valerie', kalos_17_olympia: 'gym_olympia', kalos_19_wulfric: 'gym_wulfric',
    kalos_20_malva: 'e4', kalos_21_siebold: 'e4', kalos_22_wikstrom: 'e4', kalos_23_drasna: 'e4', kalos_24_champion: 'champion', kalos_25_rogue_mega_night: 'champion' };
  // the difficulty dial per stage (BM.hardenStage) — set by the Act 3 native-deck sims (BR-117 practice: leader stages mid-band)
  // Act 3 (BR-117 practice, the Sinnoh re-read's rule — the AP-cap guard wins): the phase13 native deck read 6/6 on all 13 leader stages;
  // at k 1 they STILL read 6/6 (Siebold 2/6) but the player sat at the AP cap 40–62 % (OOO1 guard ≤ 25 %); at k 0.5 every one stays inside
  // the guard (≤ 23 %) — so the 12 gyms / Elite Four take k 0.5 (still 6/6 for that deck: reported, BR-117). Diantha takes the SOFTENING
  // dial instead (BM.RAMP_SOFT 3: the end-of-regular playthrough team read 1/6 at the cap → 4/6).
  // …except where the FRESH native playthrough team (ramp.mjs play / qa — the prompt's gate) then fails: Grant (7: lost, cascading into
  // Ambrette), Malva (20: 2/6) and Siebold (21: 1/6) stay off the dial.
  BM.KALOS_HARD = { 4: 0.5, 10: 0.5, 11: 0.5, 13: 0.5, 14: 0.5, 17: 0.5, 19: 0.5, 22: 0.5, 23: 0.5 };
  // J2-style enemy base HP (Unova's curve carried on, +2,000 — anchors by stage number, geometric between, gym ×1.25, E4 / Champion ×1.4);
  // BM.applyRamp re-bases it with the level
  BM.KALOS_EB = [[1, 38000], [5, 41000], [10, 44000], [15, 44500], [20, 45000], [25, 47000]];
  BM.kalosBaseHP = function (st) {
    const A = BM.KALOS_EB, n = st.num;
    let v = A[A.length - 1][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; v = y0 * Math.pow(y1 / y0, (Math.max(n, x0) - x0) / (x1 - x0)); break; }
    return Math.round(v * (BM.EB_KIND[st.kind] || 1) / 50) * 50;
  };
  S.forEach((st, i) => {
    Object.assign(st, { num: i + 1, region: 'kalos', curveAt: 25, packBase: true, music: { wild: 'battle_wild', trainer: 'battle_trainer', gym: 'battle_gym', e4: 'battle_elitefour', champion: 'battle_champion' }[st.kind] });
    st.mapLabel = st.mapLabel || (st.kind === 'e4' ? st.leader : undefined);
    const e4 = ['e4', 'champion'].includes(st.kind);
    st.burst = { pack: e4 ? BM.HOENN_CADENCE.e4pack : BM.HOENN_CADENCE.pack, trickle: e4 ? BM.HOENN_CADENCE.e4trickle : BM.HOENN_CADENCE.trickle, ...(st.burst || {}) };
    st.background = 'kalos_' + st.background;
    if (BASES[st.id]) st.baseArt = BASES[st.id];
    if (CARRIERS[st.id]) BM.STAGE_CARRIERS[st.id] = CARRIERS[st.id];
    st.enemyBaseHP = BM.kalosBaseHP(st);
  });
  for (const st of S) if (st.mapLabel === undefined) delete st.mapLabel;
  BM.applyRamp(S, BM.CAP_LADDER.kalos); // the ramp (stages.js): regular Lv 1 → 85, the endgame at the cap — before the dial
  for (const st of S) if (BM.KALOS_HARD[st.num]) BM.hardenStage(st, BM.KALOS_HARD[st.num]);
  BM.KALOS_STAGES = S;
  BM.STAGES.push(...S);
})();
