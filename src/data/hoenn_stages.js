// HOENN STAGES (Hoenn prompt Step 4) — the 25-node Hoenn journey from the prep pack's stage-plan.md (canon gym order, Norman at
// node 13 as the Petalburg return trip, the Elite Four as FOUR nodes — the Kanto pattern —, Champion Steven node 24, the Sky
// Pillar capstone node 25). Kanto / Johto's fields throughout (stages.js explains each one).
//   Littleroot → Oldale → Petalburg Woods → Roxanne → Granite Cave → Brawly → Slateport (Team Aqua; the WW1 giant Wailmer) →
//   Wattson → Verdanturf → Meteor Falls (Team Magma) → Flannery → Route 111 Desert → Norman → Winona → Mt. Pyre → the Aqua
//   Hideout → Tate & Liza → Seafloor Cavern (Kyogre + Groudon) → Wallace → Sidney · Phoebe · Glacia · Drake → Champion Steven
//   (first clear = RAYQUAZA + a Master Ball + Mega Rayquaza's gate) → Sky Pillar, "the falling star" (Deoxys; first clear =
//   Master Ball + XP Candy L ×3, the Red pattern).
//   Expected player levels 61 → 70 (the cap ladder: 65 → 70 once Hoenn is reached). Stage levels follow them; stages 1–3 sit a
//   few levels under the team (kid-easy openers).
//   Waves = the location's real Pokémon / the leader's canon team + type (the standing enemy rule); Y1 gates hold each stage's
//   heaviest forms; OOO1 late cadence from the start (`curveAt: 25`, as Johto).
//   BR-099 (Kakashi's ruling, Hoenn tables only): PACK EXTRAS beyond a wave's headline species spawn as the line's BASE form
//   where a line exists (`packBase` — more, weaker bodies), and Hoenn packs run a little bigger to close the field-presence gap
//   without adding power. Kanto / Johto tables are untouched.
//   Giant aces: Slaking (13), the gym / E4 aces from 13 on, Kyogre + Groudon (18: Kyogre at the usual 70 % / 90 s, Groudon at its
//   OWN 40 % threshold — never both in one counter-burst), Mega Metagross (24), Deoxys (25). Stage 17: Tate & Liza's TWIN aces —
//   Lunatone at 70 %, Solrock at 40 %. WW1 giant blocker (builder's call): a GIANT Wailmer walks out mid-stage at Slateport (7).
//   Canon aces stand at every stage (U10: no rematch swaps — no extra attack sheets needed).
//   Base HP: the J2-style curve extended for Lv 61–70 (BM.HOENN_EB), gym ×1.25, E4 / Champion ×1.4.
//   No Hoenn stage carries a VV1 restriction (they debut Sinnoh+). No Prism Tower entry on the Hoenn map (VVV1).
window.BM = window.BM || {};
(function () {
  const W = BM.waveRow, D = BM.dropTable;
  // Hoenn drop tiers: the Kanto MID tier through Lavaridge (1–11), the LATE tier from the desert on (12–25) — with the Hoenn
  // evolution items themed in (Dawn Stone 9 / 17, Prism Scale 14 / 19, Reaper Cloth 15 / 21; C11). Mega Stones: mega.js.
  const M = (stones) => D('mid', stones), L = (stones) => D('late', stones);
  const S = [
    { id: 'hoenn_01_littleroot', name: 'Littleroot Town', place: 'Route 101', kind: 'wild', level: 59, background: 'littleroot_town', townMusic: 'town_littleroot', gift: 'treecko',
      drops: M({ leaf_stone: 1, water_stone: 1 }),
      waves: [W('poochyena', 56, 4, 10), W('zigzagoon', 56, 9, 11), W('wurmple', 56, 14, 11), W('silcoon', 57, 26, 15), W('cascoon', 57, 32, 15), W('mightyena', 59, 42, 22)],
      gate: { by: 'time', at: 35, forms: ['mightyena'] } },
    { id: 'hoenn_02_oldale', name: 'Oldale Town', place: 'Routes 102–103', kind: 'wild', level: 60, background: 'oldale_town', townMusic: 'town_oldale', gift: 'torchic',
      drops: M({ water_stone: 1, leaf_stone: 1 }),
      waves: [W('zigzagoon', 57, 4, 10), W('poochyena', 57, 8, 11), W('lotad', 57, 12, 11), W('seedot', 57, 16, 11), W('wingull', 58, 22, 13), W('surskit', 58, 28, 14), W('taillow', 58, 34, 14), W('ralts', 59, 50, 30), W('linoone', 60, 44, 22)],
      gate: { by: 'time', at: 38, forms: ['linoone', 'ralts'] } },
    { id: 'hoenn_03_petalburg_woods', name: 'Petalburg City', place: 'Petalburg Woods', kind: 'wild', level: 61, background: 'petalburg_woods', townMusic: 'town_petalburg', gift: 'mudkip',
      drops: M({ leaf_stone: 2, moon_stone: 1 }),
      waves: [W('wurmple', 58, 4, 10), W('shroomish', 58, 9, 11), W('slakoth', 58, 14, 12), W('taillow', 58, 18, 12), W('poochyena', 58, 22, 13), W('beautifly', 60, 34, 18), W('dustox', 60, 40, 18), W('breloom', 61, 50, 24)],
      gate: { by: 'time', at: 40, forms: ['beautifly', 'dustox', 'breloom'] } },
    { id: 'hoenn_04_roxanne', name: 'Rustboro Gym', leader: 'Roxanne', kind: 'gym', level: 62, background: 'gym_roxanne', townMusic: 'town_rustboro',
      drops: M({ moon_stone: 1, thunder_stone: 1 }),
      waves: [W('geodude', 59, 4, 10), W('aron', 59, 9, 11), W('lileep', 60, 14, 12), W('anorith', 60, 20, 13), W('graveler', 61, 30, 16), W('nosepass', 61, 44, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['graveler', 'nosepass'] },
      ace: { form: 'nosepass', level: 62, giant: true, sig: { move: 'Rock Tomb', aoe: 110, reach: 120 } } },
    { id: 'hoenn_05_granite_cave', name: 'Dewford Town', place: 'Granite Cave', kind: 'wild', level: 63, background: 'granite_cave', townMusic: 'town_dewford',
      drops: M({ moon_stone: 2, metal_coat: 1 }),
      waves: [W('zubat', 60, 4, 10), W('makuhita', 60, 8, 11), W('geodude', 60, 12, 11), W('abra', 60, 18, 13), W('aron', 61, 24, 14), W('sableye', 62, 36, 18), W('mawile', 62, 42, 18), W('nosepass', 63, 52, 24)],
      gate: { by: 'time', at: 40, forms: ['sableye', 'mawile', 'nosepass'] } },
    { id: 'hoenn_06_brawly', name: 'Dewford Gym', leader: 'Brawly', kind: 'gym', level: 63, background: 'gym_brawly', townMusic: 'town_dewford',
      drops: M({ water_stone: 1, moon_stone: 1 }),
      waves: [W('machop', 60, 4, 10), W('meditite', 60, 9, 11), W('makuhita', 60, 14, 12), W('machoke', 62, 28, 16), W('medicham', 62, 38, 18), W('hariyama', 63, 50, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['medicham', 'hariyama', 'makuhita'] },
      ace: { form: 'makuhita', level: 63, giant: true, sig: { move: 'Vital Throw', aoe: 110, reach: 80 } } },
    // Slateport: Team Aqua at the Oceanic Museum — and the WW1 GIANT BLOCKER (builder's pick over a giant Wailord at 16): a giant
    // Wailmer rolls out of the harbour at 50 s, a roadblock to push through (no leader, so no ace)
    { id: 'hoenn_07_slateport', name: 'Slateport City', place: 'Oceanic Museum', kind: 'trainer', level: 64, background: 'slateport_city', townMusic: 'town_slateport',
      drops: M({ water_stone: 2, thunder_stone: 1 }),
      waves: [W('poochyena', 61, 4, 10), W('carvanha', 61, 8, 11), W('wingull', 61, 12, 11), W('zubat', 61, 16, 12), W('electrike', 62, 22, 13), W('gulpin', 62, 26, 14), W('plusle', 62, 30, 16), W('minun', 62, 32, 16), W('pelipper', 63, 40, 20), W('tentacruel', 64, 50, 24)],
      gate: { by: 'time', at: 40, forms: ['pelipper', 'tentacruel'] },
      extraAces: [{ form: 'wailmer', level: 64, giant: true, blocker: true, time: 50, sig: { move: 'Water Spout', aoe: 120, reach: 150 } }] },
    { id: 'hoenn_08_wattson', name: 'Mauville Gym', leader: 'Wattson', kind: 'gym', level: 64, background: 'gym_wattson', townMusic: 'town_mauville',
      drops: M({ thunder_stone: 3, metal_coat: 1 }),
      waves: [W('voltorb', 61, 4, 10), W('magnemite', 61, 9, 11), W('electrike', 61, 14, 12), W('plusle', 62, 20, 14), W('minun', 62, 22, 14), W('magneton', 63, 32, 18), W('electrode', 63, 42, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['magneton', 'electrode', 'manectric'] },
      ace: { form: 'manectric', level: 64, giant: true, sig: { move: 'Thunder', aoe: 130, status: 'paralyze', reach: 220 } } },
    { id: 'hoenn_09_verdanturf', name: 'Verdanturf Town', place: 'Route 117', kind: 'wild', level: 65, background: 'verdanturf_town', townMusic: 'town_fallarbor',
      drops: M({ dawn_stone: 2, leaf_stone: 1, moon_stone: 1 }),
      waves: [W('whismur', 62, 4, 10), W('oddish', 62, 8, 11), W('seedot', 62, 12, 11), W('marill', 62, 16, 12), W('volbeat', 63, 22, 14), W('illumise', 63, 24, 14), W('roselia', 63, 30, 16), W('loudred', 64, 38, 18), W('nuzleaf', 64, 44, 20), W('linoone', 65, 52, 22)],
      gate: { by: 'time', at: 40, forms: ['loudred', 'nuzleaf', 'linoone'] } },
    { id: 'hoenn_10_meteor_falls', name: 'Fallarbor Town', place: 'Meteor Falls', kind: 'trainer', level: 65, background: 'meteor_falls', townMusic: 'town_fallarbor',
      drops: M({ moon_stone: 2, fire_stone: 1 }),
      waves: [W('numel', 62, 4, 10), W('zubat', 62, 8, 11), W('spinda', 62, 12, 12), W('swablu', 62, 16, 12), W('slugma', 62, 20, 13), W('lunatone', 63, 28, 16), W('solrock', 63, 30, 16), W('zangoose', 64, 38, 18), W('seviper', 64, 40, 18), W('golbat', 64, 46, 20), W('skarmory', 65, 52, 24), W('bagon', 63, 70, 40)],
      gate: { by: 'time', at: 40, forms: ['zangoose', 'seviper', 'skarmory', 'golbat', 'lunatone', 'solrock'] } },
    { id: 'hoenn_11_flannery', name: 'Lavaridge Gym', leader: 'Flannery', kind: 'gym', level: 66, background: 'gym_flannery', townMusic: 'town_lavaridge',
      drops: M({ fire_stone: 3, water_stone: 1 }),
      waves: [W('numel', 63, 4, 10), W('slugma', 63, 9, 11), W('koffing', 63, 14, 12), W('spoink', 63, 18, 13), W('camerupt', 65, 30, 16), W('magcargo', 65, 38, 18), W('weezing', 65, 46, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['camerupt', 'magcargo', 'weezing', 'torkoal'] },
      ace: { form: 'torkoal', level: 66, giant: true, sig: { move: 'Overheat', aoe: 140, reach: 200 } } },
    { id: 'hoenn_12_desert', name: 'Route 111', place: 'the desert', kind: 'wild', level: 66, background: 'route_111_desert', townMusic: 'town_mauville',
      drops: L({ fire_stone: 1, moon_stone: 1, leaf_stone: 1 }),
      waves: [W('trapinch', 63, 4, 10), W('cacnea', 63, 9, 11), W('baltoy', 63, 14, 12), W('geodude', 63, 18, 12), W('vibrava', 65, 32, 16), W('cacturne', 65, 40, 18), W('claydol', 66, 50, 22)],
      gate: { by: 'time', at: 40, forms: ['vibrava', 'cacturne', 'claydol'] } },
    { id: 'hoenn_13_norman', name: 'Petalburg Gym', leader: 'Norman', kind: 'gym', level: 67, background: 'gym_norman', townMusic: 'town_petalburg',
      drops: L({ moon_stone: 2, fire_stone: 1 }),
      waves: [W('zigzagoon', 64, 4, 10), W('slakoth', 64, 8, 11), W('skitty', 64, 12, 11), W('spinda', 64, 16, 12), W('whismur', 64, 20, 12), W('linoone', 66, 30, 16), W('vigoroth', 66, 36, 18), W('swellow', 66, 42, 18), W('delcatty', 66, 46, 20), W('exploud', 67, 56, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['vigoroth', 'swellow', 'exploud', 'slaking'] },
      ace: { form: 'slaking', level: 67, giant: true, sig: { move: 'Giga Impact', aoe: 150, reach: 90 } } },
    { id: 'hoenn_14_winona', name: 'Fortree Gym', leader: 'Winona', kind: 'gym', level: 67, background: 'gym_winona', townMusic: 'town_fortree',
      drops: L({ prism_scale: 2, leaf_stone: 1, water_stone: 1 }),
      waves: [W('swablu', 64, 4, 10), W('wingull', 64, 8, 11), W('taillow', 64, 12, 11), W('castform', 64, 18, 13), W('kecleon', 65, 24, 14), W('tropius', 66, 32, 16), W('pelipper', 66, 38, 18), W('masquerain', 66, 44, 18), W('skarmory', 67, 52, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['tropius', 'skarmory', 'altaria', 'pelipper'] },
      ace: { form: 'altaria', level: 67, giant: true, sig: { move: 'Dragon Dance + Sky Attack', aoe: 140, reach: 160 } } },
    { id: 'hoenn_15_mt_pyre', name: 'Mt. Pyre', kind: 'wild', level: 67, background: 'mt_pyre', townMusic: 'town_lilycove',
      drops: L({ reaper_cloth: 2, moon_stone: 1 }),
      waves: [W('shuppet', 64, 4, 10), W('duskull', 64, 8, 10), W('vulpix', 64, 12, 12), W('wingull', 64, 16, 12), W('meditite', 65, 22, 14), W('chimecho', 65, 28, 16), W('banette', 66, 36, 18), W('dusclops', 66, 42, 20), W('mightyena', 67, 50, 22), W('golbat', 66, 54, 22)],
      gate: { by: 'time', at: 40, forms: ['banette', 'dusclops', 'mightyena', 'chimecho'] } },
    { id: 'hoenn_16_aqua_hideout', name: 'Lilycove City', place: 'Team Aqua Hideout', leader: 'Aqua Admin Matt', kind: 'trainer', level: 68, background: 'aqua_hideout', townMusic: 'town_lilycove',
      drops: L({ water_stone: 3, thunder_stone: 1 }),
      waves: [W('poochyena', 65, 4, 10), W('carvanha', 65, 8, 11), W('zubat', 65, 12, 11), W('tentacool', 65, 16, 12), W('wailmer', 66, 24, 15), W('mightyena', 66, 32, 16), W('golbat', 66, 38, 18), W('wailord', 67, 50, 26)],
      gate: { by: 'hp', at: 0.9, forms: ['mightyena', 'golbat', 'wailord', 'sharpedo'] },
      ace: { form: 'sharpedo', level: 68, giant: true, sig: { move: 'Crunch + Aqua Jet', aoe: 130, reach: 100 } } },
    { id: 'hoenn_17_tate_liza', name: 'Mossdeep Gym', leader: 'Tate & Liza', kind: 'gym', level: 68, background: 'gym_tate_liza', townMusic: 'town_mossdeep', gift: 'beldum',
      drops: L({ dawn_stone: 2, moon_stone: 1, metal_coat: 1 }),
      waves: [W('baltoy', 65, 4, 10), W('natu', 65, 8, 11), W('spoink', 65, 12, 11), W('chimecho', 66, 20, 14), W('grumpig', 67, 30, 16), W('claydol', 67, 38, 18), W('xatu', 67, 46, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['grumpig', 'claydol', 'xatu', 'lunatone', 'solrock'] },
      // TWIN ACES (the canon double battle), staggered: Lunatone at 70 % / 90 s, Solrock at 40 %
      ace: { form: 'lunatone', level: 68, giant: true, sig: { move: 'Moonblast', aoe: 140, status: 'sleep', reach: 220 } },
      extraAces: [{ form: 'solrock', level: 68, giant: true, at: 0.4, sig: { move: 'Solar Beam', aoe: 140, reach: 240 } }] },
    // Seafloor Cavern — the weather crisis: Kyogre awakens at the usual 70 % / 90 s, Groudon erupts at its own 40 % threshold
    // (two one-time entries, never both in one counter-burst). If a sim ever fails here: cut pack density, never the aces.
    { id: 'hoenn_18_seafloor_cavern', name: 'Seafloor Cavern', place: 'the weather crisis', leader: 'Archie & Maxie', kind: 'trainer', level: 69, background: 'seafloor_cavern', townMusic: 'town_sootopolis',
      drops: L({ water_stone: 2, fire_stone: 2 }),
      waves: [W('mightyena', 66, 4, 11), W('carvanha', 66, 8, 11), W('numel', 66, 12, 11), W('golbat', 67, 20, 14), W('tentacruel', 67, 28, 16), W('camerupt', 68, 36, 18), W('sharpedo', 68, 42, 20), W('crobat', 68, 50, 22)],
      gate: { by: 'time', at: 40, forms: ['camerupt', 'sharpedo', 'crobat', 'kyogre', 'groudon'] },
      burst: { pack: [1, 2], trickle: 3.2, size: [2, 3], counterSize: 2 }, // the two giants are the event: pack density cut (the ruling), the aces untouched
      ace: { form: 'kyogre', level: 69, giant: true, sig: { move: 'Origin Pulse', aoe: 120, reach: 220 } },
      extraAces: [{ form: 'groudon', level: 69, giant: true, at: 0.4, sig: { move: 'Precipice Blades', aoe: 120, reach: 180 } }] },
    { id: 'hoenn_19_wallace', name: 'Sootopolis Gym', leader: 'Wallace', kind: 'gym', level: 69, background: 'gym_wallace', townMusic: 'town_sootopolis',
      drops: L({ prism_scale: 2, water_stone: 2 }),
      waves: [W('luvdisc', 66, 4, 10), W('barboach', 66, 8, 11), W('goldeen', 66, 12, 11), W('spheal', 66, 16, 12), W('clamperl', 66, 20, 13), W('corphish', 67, 24, 14), W('whiscash', 68, 32, 16), W('sealeo', 68, 38, 18), W('seaking', 68, 44, 18), W('relicanth', 68, 50, 22), W('gorebyss', 68, 54, 22), W('huntail', 68, 58, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['whiscash', 'sealeo', 'seaking', 'relicanth', 'milotic'] },
      ace: { form: 'milotic', level: 69, giant: true, sig: { move: 'Hydro Pump', aoe: 150, reach: 230 } } },
    // the Elite Four as FOUR nodes (C1 adopted: the Kanto pattern, four canon rooms); E4 bases share the 'e4' base
    { id: 'hoenn_20_sidney', name: 'Elite Four', leader: 'Sidney', kind: 'e4', level: 70, background: 'e4_sidney', townMusic: 'town_evergrande',
      drops: L({ moon_stone: 2, leaf_stone: 1, water_stone: 1 }),
      waves: [W('poochyena', 67, 4, 10), W('nuzleaf', 67, 8, 11), W('sableye', 68, 14, 13), W('mightyena', 68, 22, 15), W('cacturne', 69, 30, 16), W('crawdaunt', 69, 38, 18), W('shiftry', 69, 46, 20), W('sharpedo', 69, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['cacturne', 'crawdaunt', 'shiftry', 'sharpedo', 'absol'] },
      ace: { form: 'absol', level: 70, giant: true, sig: { move: 'Night Slash', aoe: 150, reach: 90 } } },
    { id: 'hoenn_21_phoebe', name: 'Elite Four', leader: 'Phoebe', kind: 'e4', level: 70, background: 'e4_phoebe', townMusic: 'town_evergrande',
      drops: L({ reaper_cloth: 2, moon_stone: 1 }),
      waves: [W('shuppet', 67, 4, 10), W('duskull', 67, 8, 10), W('sableye', 68, 14, 13), W('shedinja', 68, 20, 15), W('froslass', 69, 28, 16), W('banette', 69, 36, 18), W('dusclops', 69, 46, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['froslass', 'banette', 'dusclops'] },
      ace: { form: 'dusclops', level: 70, giant: true, sig: { move: 'Shadow Ball + Will-O-Wisp', aoe: 150, reach: 220 } } },
    { id: 'hoenn_22_glacia', name: 'Elite Four', leader: 'Glacia', kind: 'e4', level: 70, background: 'e4_glacia', townMusic: 'town_evergrande',
      drops: L({ ice_stone: 3, water_stone: 1 }),
      waves: [W('spheal', 67, 4, 10), W('snorunt', 67, 8, 10), W('sealeo', 68, 16, 13), W('glalie', 69, 26, 16), W('froslass', 69, 34, 18), W('glalie', 69, 46, 20)],
      gate: { by: 'hp', at: 0.9, forms: ['glalie', 'froslass', 'walrein'] },
      ace: { form: 'walrein', level: 70, giant: true, sig: { move: 'Blizzard', aoe: 160, status: 'freeze', reach: 240 } } },
    { id: 'hoenn_23_drake', name: 'Elite Four', leader: 'Drake', kind: 'e4', level: 70, background: 'e4_drake', townMusic: 'town_evergrande',
      drops: L({ water_stone: 1, fire_stone: 1, moon_stone: 1 }),
      waves: [W('bagon', 67, 4, 10), W('swablu', 67, 8, 10), W('horsea', 67, 12, 11), W('shelgon', 68, 20, 14), W('seadra', 68, 24, 14), W('vibrava', 68, 30, 16), W('altaria', 69, 38, 18), W('flygon', 69, 46, 20), W('kingdra', 69, 54, 22)],
      gate: { by: 'hp', at: 0.9, forms: ['altaria', 'flygon', 'kingdra', 'salamence'] },
      ace: { form: 'salamence', level: 70, giant: true, sig: { move: 'Dragon Claw + Flamethrower', aoe: 160, reach: 200 } } },
    // the Champion (Steven): first clear = RAYQUAZA (rewardOnly — the Mewtwo → Lugia → Rayquaza pattern) + the region's Master
    // Ball; Hoenn counts as beaten (regionsDone.hoenn) — which opens Mega Rayquaza (U4) and the Sky Pillar. The giant ace is
    // MEGA METAGROSS (ORAS canon; Megas are unlocked by Hoenn).
    { id: 'hoenn_24_champion', name: 'Champion', leader: 'Steven', kind: 'champion', level: 70, background: 'champion_room', townMusic: 'town_evergrande',
      drops: L({ metal_coat: 2, moon_stone: 1, thunder_stone: 1 }),
      waves: [W('aron', 67, 4, 11), W('beldum', 67, 8, 12), W('lairon', 68, 16, 14), W('metang', 68, 22, 15), W('skarmory', 69, 30, 16), W('claydol', 69, 36, 18), W('cradily', 69, 42, 20), W('armaldo', 69, 48, 20), W('aggron', 70, 56, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['skarmory', 'claydol', 'cradily', 'armaldo', 'aggron', 'metagross_mega'] },
      ace: { form: 'metagross_mega', level: 70, giant: true, sig: { move: 'Meteor Mash', aoe: 170, reach: 110 } }, gift: 'rayquaza', regionFinal: true },
    // Sky Pillar summit — "the falling star" (C4 option A): a meteor lands on the Pillar and DEOXYS is the giant ace; the "space"
    // species and Hoenn's dragons defend the summit at the region's highest levels. First clear = Master Ball + XP Candy L ×3.
    // Deoxys stays a Banner B mythical (an enemy / reward use never removes a banner species).
    { id: 'hoenn_25_sky_pillar', name: 'Sky Pillar', place: 'the falling star', kind: 'champion', level: 70, background: 'sky_pillar', townMusic: 'town_pacifidlog',
      drops: L({ moon_stone: 2, thunder_stone: 1, dawn_stone: 1 }),
      waves: [W('baltoy', 67, 4, 11), W('beldum', 67, 8, 12), W('lunatone', 68, 14, 14), W('solrock', 68, 18, 14), W('metang', 69, 26, 15), W('claydol', 69, 32, 16), W('altaria', 69, 38, 18), W('flygon', 70, 46, 20), W('metagross', 70, 54, 22), W('salamence', 70, 62, 24)],
      gate: { by: 'hp', at: 0.9, forms: ['claydol', 'altaria', 'flygon', 'metagross', 'salamence', 'deoxys'] },
      burst: { pack: [3, 4], trickle: 1.1, size: [5, 6], counterSize: 5 }, // the capstone: the region's densest defence (BR-100 shape)
      ace: { form: 'deoxys', level: 70, giant: true, sig: { move: 'Psycho Boost', aoe: 170, reach: 260 } },
      prize: { master_ball: 1, xp_candy_l: 3 }, capstone: true },
  ];
  // carriers: the AoE / status units mixed into bursts (OOO1 late tier from stage 1, as Johto)
  const CARRIERS = { hoenn_03_petalburg_woods: ['shroomish'], hoenn_05_granite_cave: ['zubat'], hoenn_07_slateport: ['gulpin'], hoenn_08_wattson: ['voltorb'],
    hoenn_09_verdanturf: ['oddish'], hoenn_10_meteor_falls: ['numel'], hoenn_11_flannery: ['koffing'], hoenn_12_desert: ['baltoy'], hoenn_13_norman: ['whismur'],
    hoenn_14_winona: ['castform'], hoenn_15_mt_pyre: ['duskull'], hoenn_16_aqua_hideout: ['tentacool'], hoenn_17_tate_liza: ['spoink'],
    hoenn_18_seafloor_cavern: ['numel'], hoenn_19_wallace: ['luvdisc'], hoenn_20_sidney: ['sableye'], hoenn_21_phoebe: ['duskull'], hoenn_22_glacia: ['snorunt'],
    hoenn_23_drake: ['horsea'], hoenn_24_champion: ['claydol'], hoenn_25_sky_pillar: ['baltoy'] };
  // Z1 enemy bases: the 8 Hoenn gyms = their own base art (the queued gym bases; the den until each lands); the four E4 rooms
  // reuse the Kanto E4 base, Steven + the Sky Pillar the Champion's red-and-gold one.
  const BASES = { hoenn_04_roxanne: 'gym_roxanne', hoenn_06_brawly: 'gym_brawly', hoenn_08_wattson: 'gym_wattson', hoenn_11_flannery: 'gym_flannery',
    hoenn_13_norman: 'gym_norman', hoenn_14_winona: 'gym_winona', hoenn_17_tate_liza: 'gym_tate_liza', hoenn_19_wallace: 'gym_wallace',
    hoenn_20_sidney: 'e4', hoenn_21_phoebe: 'e4', hoenn_22_glacia: 'e4', hoenn_23_drake: 'e4', hoenn_24_champion: 'champion', hoenn_25_sky_pillar: 'champion' };
  // J2-STYLE ENEMY BASE HP for Lv 59–70 (Hoenn prompt Step 4): anchors by Hoenn stage number, geometric between, gym ×1.25,
  // E4 / Champion ×1.4 — sized so the J2 TTK band holds for a Johto-cleared 6-card team (phase10 ttk) and the Sky Pillar's is the biggest.
  BM.HOENN_EB = [[1, 32000], [5, 35000], [10, 38000], [15, 38500], [20, 39000], [25, 41000]];
  BM.hoennBaseHP = function (st) {
    const A = BM.HOENN_EB, n = st.num;
    let v = A[A.length - 1][1];
    for (let i = 1; i < A.length; i++) if (n <= A[i][0]) { const [x0, y0] = A[i - 1], [x1, y1] = A[i]; v = y0 * Math.pow(y1 / y0, (Math.max(n, x0) - x0) / (x1 - x0)); break; }
    return Math.round(v * (BM.EB_KIND[st.kind] || 1) / 50) * 50;
  };
  // BR-099 bodies-not-power: Hoenn packs (the extras spawn as base forms, `packBase`) run a step bigger than the OOO1 late tier
  BM.HOENN_CADENCE = { pack: [3, 4], e4pack: [2, 4], trickle: 1.1, e4trickle: 1.8 };
  // the base form of a wave form's line: a player line's first form, else the canon pre-evolution chain walked back while the
  // species is in the game (Mightyena → Poochyena, Claydol → Baltoy, Crobat → Zubat; a single-stage species is its own base)
  BM.packBaseOf = function (id) {
    const f = BM.FORMS[id], line = f && BM.LINES[f.line];
    if (!f) return id;
    if (line && !line.enemyOnly && !f.mega) return line.forms[0].id;
    let cur = id;
    for (let i = 0; i < 4; i++) { const pre = BM.PRE_CANON[cur]; if (!pre || !BM.FORMS[pre]) break; cur = pre; }
    return cur;
  };
  S.forEach((st, i) => {
    Object.assign(st, { num: i + 1, region: 'hoenn', curveAt: 25, packBase: true, music: { wild: 'battle_wild', trainer: 'battle_trainer', gym: 'battle_gym', e4: 'battle_elitefour', champion: 'battle_champion' }[st.kind] });
    st.mapLabel = st.mapLabel || (st.kind === 'e4' ? st.leader : undefined);
    const e4 = ['e4', 'champion'].includes(st.kind);
    st.burst = { pack: e4 ? BM.HOENN_CADENCE.e4pack : BM.HOENN_CADENCE.pack, trickle: e4 ? BM.HOENN_CADENCE.e4trickle : BM.HOENN_CADENCE.trickle, ...(st.burst || {}) };
    st.background = 'hoenn_' + st.background; // the import keeps a region prefix on non-Kanto backgrounds (import_art.sh)
    if (BASES[st.id]) st.baseArt = BASES[st.id];
    if (CARRIERS[st.id]) BM.STAGE_CARRIERS[st.id] = CARRIERS[st.id];
    st.enemyBaseHP = BM.hoennBaseHP(st);
  });
  for (const st of S) if (st.mapLabel === undefined) delete st.mapLabel;
  BM.HOENN_STAGES = S;
  BM.STAGES.push(...S);
})();
