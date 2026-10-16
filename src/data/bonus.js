// BONUS ZONE (user design, design addendum 2026-10-11; replaces BUILD_PLAN §4.3's Easy/Medium/Hard grind stages). Its own
// screen off the campaign map (never blocks the campaign path). Every bonus stage is a normal battle (waves, bursts, bounty,
// battle items, Dowsing) — challenge auto-clear does NOT apply; the J1 hidden-intel rule does. Stage ids start `bonus_`.
//   XP STAGES ×4 (his names): REGULAR · GREAT · ULTRA · MASTER — replayable, pay bonus team XP to every line you bring +
//     an XP candy (S / M / L / L×2 by tier) + the §4.5 grind ticket (1 per win). Waves scaled to the band.
//   TREASURE STAGES: a stone stage per stone (themed enemies, that stone as the headline drop), a Poké Ball stage, an item
//     stage (Dowsing Machine / Rare Candy chances). Drop tables weighted to the theme; the FIRST clear guarantees the
//     headline item.
//   MEGA STONE section: shown LOCKED — "Beat Johto to unlock 🔒". No content in Build 1.
window.BM = window.BM || {};
(function () {
  const W = (form, level, start, every) => ({ form, level, start, every });
  // Kakashi's level bands; xp = team XP per win to EVERY line that battled (not split); candy = the XP candy each win adds
  BM.BONUS_TIERS = [
    { id: 'regular', name: 'Regular', ball: 'poke_ball', minLv: 5, level: 10, xp: 1500, candy: { xp_candy_s: 1 }, curveAt: 4 },
    { id: 'great', name: 'Great', ball: 'great_ball', minLv: 15, level: 22, xp: 6000, candy: { xp_candy_m: 1 }, curveAt: 9 },
    { id: 'ultra', name: 'Ultra', ball: 'ultra_ball', minLv: 30, level: 38, xp: 20000, candy: { xp_candy_l: 1 }, curveAt: 15 },
    { id: 'master', name: 'Master', ball: 'master_ball', minLv: 45, level: 54, xp: 45000, candy: { xp_candy_l: 2 }, curveAt: 21 },
    // Hoenn Step 5: the 5th XP floor — the band above Johto's (Lv 61+ entry), open once Littleroot is cleared (Hoenn reached)
    { id: 'hoenn', name: 'Hoenn', ball: 'master_ball', minLv: 61, level: 68, xp: 90000, candy: { xp_candy_l: 3 }, curveAt: 25, hoenn: true },
    // Sinnoh Act 1 S5: the 6th XP floor — the band above Hoenn's (Lv 66+ entry), open once Twinleaf is cleared (Sinnoh reached)
    { id: 'sinnoh', name: 'Sinnoh', ball: 'master_ball', minLv: 66, level: 73, xp: 115000, candy: { xp_candy_l: 3 }, curveAt: 25, sinnoh: true },
    // Unova Act 2 U-S5: the 7th XP floor (Lv 71+ entry), open once Nuvema is cleared (Unova reached) — the top of the Tower
    { id: 'unova', name: 'Unova', ball: 'master_ball', minLv: 71, level: 78, xp: 140000, candy: { xp_candy_l: 3 }, curveAt: 25, unova: true },
    // Kalos + Alola build: the 8th and 9th XP floors (Lv 76+ / Lv 81+ entry), open once Vaniville / Iki Town is cleared — the top of the Tower
    { id: 'kalos', name: 'Kalos', ball: 'master_ball', minLv: 76, level: 83, xp: 165000, candy: { xp_candy_l: 3 }, curveAt: 25, kalos: true },
    { id: 'alola', name: 'Alola', ball: 'master_ball', minLv: 81, level: 88, xp: 190000, candy: { xp_candy_l: 3 }, curveAt: 25, alola: true },
    // Galar + Paldea build: the 10th and 11th XP floors (Lv 86+ / Lv 91+ entry), open once Postwick / Cabo Poco is cleared — the top of the Tower
    { id: 'galar', name: 'Galar', ball: 'master_ball', minLv: 86, level: 93, xp: 215000, candy: { xp_candy_l: 3 }, curveAt: 25, galar: true },
    { id: 'paldea', name: 'Paldea', ball: 'master_ball', minLv: 91, level: 98, xp: 240000, candy: { xp_candy_l: 3 }, curveAt: 25, paldea: true },
  ];
  // the highest tier a team of `lv` can sensibly farm (the sim's grind; the UI just recommends the band)
  BM.bonusTierFor = (lv) => BM.BONUS_TIERS.filter((t) => lv >= t.minLv).pop() || null;
  BM.GRIND_WINS = 1; // sim assumption: XP-stage wins a kid plays between campaign stages from Mt. Moon on (phase7.mjs)
  // XP-stage waves: Chansey-free kid version — mixed Normal fodder + the tier's evolved forms, all at the band level
  const XPW = {
    regular: (L) => [W('rattata', L - 2, 3, 7), W('pidgey', L - 1, 9, 9), W('meowth', L, 20, 12)],
    great: (L) => [W('rattata', L - 2, 3, 6), W('pidgeot', L - 1, 12, 12), W('persian', L, 22, 13), W('clefairy', L, 30, 14)],
    ultra: (L) => [W('persian', L - 2, 3, 8), W('pidgeot', L, 10, 10), W('wigglytuff', L, 22, 14), W('snorlax', L - 2, 40, 26)],
    master: (L) => [W('persian', L - 2, 3, 7), W('pidgeot', L, 9, 9), W('snorlax', L, 25, 20), W('porygon2', L, 35, 18)],

    hoenn: (L) => [W('linoone', L - 2, 3, 7), W('swellow', L, 9, 9), W('exploud', L - 1, 22, 16), W('vigoroth', L, 30, 18)],
    sinnoh: (L) => [W('bibarel', L - 2, 3, 7), W('staraptor', L, 9, 9), W('purugly', L - 1, 22, 16), W('lickilicky', L, 30, 18)],
    unova: (L) => [W('watchog', L - 2, 3, 7), W('unfezant', L, 9, 9), W('stoutland', L - 1, 22, 16), W('bouffalant', L, 30, 18)],
    kalos: (L) => [W('diggersby', L - 2, 3, 7), W('talonflame', L, 9, 9), W('furfrou', L - 1, 22, 16), W('pyroar', L, 30, 18)],
    alola: (L) => [W('gumshoos', L - 2, 3, 7), W('toucannon', L, 9, 9), W('komala', L - 1, 22, 16), W('bewear', L, 30, 18)],
    galar: (L) => [W('greedent', L - 2, 3, 7), W('corviknight', L, 9, 9), W('dubwool', L - 1, 22, 16), W('obstagoon', L, 30, 18)],
    paldea: (L) => [W('oinkologne', L - 2, 3, 7), W('squawkabilly', L, 9, 9), W('maushold', L - 1, 22, 16), W('dudunsparce', L, 30, 18)],
  };
  const xpStages = BM.BONUS_TIERS.map((t) => ({
    id: 'bonus_xp_' + t.id, name: `${t.name} XP Stage`, bonus: 'xp', tier: t.id, kind: 'bonus', level: t.level, curveAt: t.curveAt,
    background: { regular: 'pallet_town', great: 'cerulean_city', ultra: 'celadon_city', master: 'saffron_city', hoenn: 'hoenn_slateport_city', sinnoh: 'sinnoh_jubilife_city', unova: 'unova_accumula_town', kalos: 'kalos_lumiose_city', alola: 'alola_hauoli_city', galar: 'galar_hammerlocke', paldea: 'paldea_mesagoza' }[t.id], ...(t.hoenn ? { hoenn: true } : {}), ...(t.sinnoh ? { sinnoh: true, artRegion: 'sinnoh' } : {}), ...(t.unova ? { unova: true, artRegion: 'unova' } : {}), ...(t.kalos ? { kalos: true, artRegion: 'kalos' } : {}), ...(t.alola ? { alola: true, artRegion: 'alola' } : {}), ...(t.galar ? { galar: true, artRegion: 'galar' } : {}), ...(t.paldea ? { paldea: true, artRegion: 'paldea' } : {}),
    // FF3: Tower pre-battle = `tower`, Tower battles = `battle_tower`
    music: 'battle_tower', townMusic: 'tower', ball: t.ball, minLv: t.minLv, bonusXp: t.xp, candy: t.candy,
    waves: XPW[t.id](t.level),
    burst: { pool: XPW[t.id](t.level).map((w) => w.form) },
    drops: [{ item: 'tickets', w: 30, n: 2 }, { item: 'xp_candy_s', w: 30, n: 1 }, { item: 'xp_candy_m', w: t.minLv >= 15 ? 20 : 6, n: 1 },
      { item: 'xp_candy_l', w: t.minLv >= 30 ? 10 : 1, n: 1 }, { item: 'rare_candy', w: 2, n: 1 }],
  }));
  // Treasure stages: [id, name, headline item, enemies (form, level offsets), background, level, curveAt]
  const T = (id, name, item, foes, bg, level, curveAt, icon) => ({
    id: 'bonus_tr_' + id, name, bonus: 'treasure', kind: 'bonus', headline: item, icon, level, curveAt, background: bg,
    music: 'battle_tower', townMusic: 'tower',
    waves: foes.map(([f, d, start, every], i) => W(f, level + d, start != null ? start : 3 + i * 7, every || 9 + i * 2)),
    drops: [{ item, w: 34, n: 1 }, { item: 'tickets', w: 22, n: 3 }, { item: 'xp_candy_s', w: 22, n: 1 }, { item: 'xp_candy_m', w: 10, n: 1 }, { item: 'poke_ball', w: 8, n: 1 }, { item: 'rare_candy', w: 2, n: 1 }, { item: 'dowsing_machine', w: 1, n: 1 }],
  });
  const treasure = [
    T('fire', 'Fire Stone Volcano', 'fire_stone', [['ponyta', -1], ['growlithe', 0], ['vulpix', 0], ['rapidash', 1, 40, 22]], 'cinnabar_island', 24, 8, '🔥'),
    T('water', 'Water Stone Lake', 'water_stone', [['staryu', -2], ['psyduck', -1], ['tentacool', -1], ['golduck', 1, 40, 22]], 'cerulean_city', 22, 7, '💧'),
    T('thunder', 'Thunder Stone Plant', 'thunder_stone', [['voltorb', -1], ['pikachu', 0], ['electrode', 1, 30, 20], ['raichu', 1, 40, 24]], 'vermilion_city', 24, 8, '⚡'),
    T('leaf', 'Leaf Stone Garden', 'leaf_stone', [['oddish', -1], ['tangela', -1, 20, 16], ['oddish', 0], ['vileplume', -1, 45, 30]], 'viridian_forest', 20, 6, '🍃'),
    T('moon', 'Moon Stone Cave', 'moon_stone', [['zubat', -1], ['clefairy', 0], ['geodude', 0], ['golbat', 1, 40, 22], ['clefable', 1, 55, 28]], 'mt_moon', 18, 6, '🌙'),
    T('ice', 'Ice Stone Cavern', 'ice_stone', [['tentacool', -1], ['seel', -2, 6, 12], ['shellder', -2, 10, 14], ['dewgong', -1, 14, 15], ['cloyster', -1, 24, 18], ['lapras', -1, 50, 32]], 'cerulean_city', 30, 10, '❄️'),
    { ...T('ball', 'Poké Ball Factory', 'poke_ball', [['voltorb', -1], ['meowth', 0], ['porygon', 0], ['persian', 1, 40, 22]], 'celadon_city', 26, 9, '🔴'),
      drops: [{ item: 'poke_ball', w: 60, n: 2 }, { item: 'poke_ball', w: 12, n: 4 }, { item: 'tickets', w: 18, n: 3 }, { item: 'xp_candy_s', w: 10, n: 1 }] },
    { ...T('item', 'Treasure Tower', 'rare_candy', [['gastly', -1], ['haunter', 0], ['mr_mime', 0], ['gengar', 1, 45, 26]], 'lavender_town', 32, 11, '🍭'),
      drops: [{ item: 'rare_candy', w: 28, n: 1 }, { item: 'dowsing_machine', w: 14, n: 1 }, { item: 'xp_candy_m', w: 20, n: 1 }, { item: 'xp_candy_l', w: 6, n: 1 }, { item: 'tickets', w: 24, n: 3 }, { item: 'poke_ball', w: 10, n: 1 }] },
  ];
  for (const st of treasure) st.burst = { pool: [...new Set(st.waves.map((w) => w.form))] };
  // Johto Step 5: the Sun Stone enters the Tower's item-vault pool — a Johto-era drop (`needs: 'johto'`: it rolls only for a
  // profile that has reached Johto; BM.dropOk, stages.js). Nothing else in the Tower changes structurally.
  treasure.find((st) => st.id === 'bonus_tr_item').drops.push({ item: 'sun_stone', w: 6, n: 1, needs: 'johto' });
  // Hoenn Step 5: the Hoenn evolution items join the vault the same way (`needs: 'hoenn'`: they roll only once Hoenn is reached)
  treasure.find((st) => st.id === 'bonus_tr_item').drops.push({ item: 'dawn_stone', w: 4, n: 1, needs: 'hoenn' }, { item: 'prism_scale', w: 3, n: 1, needs: 'hoenn' }, { item: 'reaper_cloth', w: 3, n: 1, needs: 'hoenn' });
  // MEGA STONE FLOORS (Johto Step 6): the section that was "Beat Johto to unlock 🔒" — four themed floors, open once Mega
  // Evolution is (the Johto Champion's first clear). Each drops its theme's Mega Stones (the first clear guarantees the headline
  // stone). Johto-level foes (Lv 62–65, late cadence), a Kanto + Johto-cleared deck.
  const M = (id, name, headline, stones, foes, bg, level, icon) => ({ ...T(id, name, headline, foes, bg, level, 25, icon), id: 'bonus_mega_' + id, bonus: 'mega',
    drops: [...stones.map((s) => ({ item: s, w: s === headline ? 14 : 8, n: 1, needs: 'mega' })), { item: 'tickets', w: 22, n: 4 }, { item: 'xp_candy_l', w: 14, n: 1 }, { item: 'rare_candy', w: 6, n: 1 }, { item: 'dowsing_machine', w: 2, n: 1 }] });
  const mega = [
    M('fire', 'Mega Fire Peak', 'charizardite_x', ['charizardite_x', 'charizardite_y', 'houndoominite'], [['houndour', -2], ['magmar', -1], ['rapidash', -1], ['arcanine', 0, 40, 22], ['houndoom', 0, 50, 24]], 'johto_burned_tower', 63, '🔥'),
    M('ocean', 'Mega Ocean Cave', 'blastoisinite', ['blastoisinite', 'gyaradosite', 'feraligite'], [['horsea', -3], ['remoraid', -3], ['chinchou', -3, 12, 14], ['octillery', -2, 26, 18], ['kingdra', -1, 45, 28]], 'johto_lake_of_rage', 63, '🌊'),
    M('jungle', 'Mega Jungle', 'venusaurite', ['venusaurite', 'meganiumite', 'pinsirite', 'scizorite'], [['sunkern', -2], ['skiploom', -1], ['ledian', -1], ['heracross', 0, 40, 22], ['scyther', 0, 50, 24]], 'johto_ilex_forest', 64, '🌿'),
    M('sky', 'Mega Sky Ruins', 'tyranitarite', ['tyranitarite', 'dragoninite', 'aerodactylite', 'alakazite', 'gengarite', 'raichunite_x', 'raichunite_y', 'mewtwonite_x', 'mewtwonite_y'], [['natu', -2], ['misdreavus', -1], ['xatu', -1], ['skarmory', 0, 30, 20], ['dragonair', 0, 45, 24], ['tyranitar', 1, 60, 30]], 'johto_mt_silver', 65, '🐉'),
  ];
  // Hoenn Step 5 / 6: two Hoenn Mega Stone floors (the Johto Step 6 pattern) — open once Hoenn's desert (stage 12) is cleared;
  // Hoenn-level foes (Lv 68–69), the Hoenn stones by theme. Latiasite / Latiosite are NOT here (the Safari Mega section only).
  mega.push(
    { ...M('hoenn_land', 'Mega Magma Peak', 'blazikenite', ['blazikenite', 'sceptilite', 'aggronite', 'medichamite', 'manectite', 'galladite', 'mawilite', 'metagrossite'], [['numel', -3], ['aron', -3], ['meditite', -2, 12, 14], ['camerupt', -2, 26, 18], ['aggron', -1, 45, 28]], 'hoenn_meteor_falls', 68, '🌋'), hoenn: true },
    { ...M('hoenn_sea', 'Mega Abyss Trench', 'swampertite', ['swampertite', 'sharpedonite', 'gardevoirite', 'sablenite', 'banettite', 'absolite', 'absolite_z', 'altarianite', 'salamencite'], [['carvanha', -3], ['shuppet', -3], ['swablu', -2, 12, 14], ['sharpedo', -2, 26, 18], ['salamence', -1, 45, 28]], 'hoenn_seafloor_cavern', 69, '🌊'), hoenn: true },
  );
  // Sinnoh Act 1 S5 / S6: two Sinnoh Mega Stone floors (the Hoenn pattern) — open once Canalave Gym (Byron, stage 12) is cleared;
  // Sinnoh-level foes (Lv 73–74), the Sinnoh stones by theme (the first clear guarantees the headline stone). Heatranite / Darkranite
  // are NOT here (the Safari Mega section only).
  mega.push(
    { ...M('sinnoh_iron', 'Mega Iron Ruins', 'lucarionite', ['lucarionite', 'lucarionite_z', 'garchompite', 'garchompite_z', 'staraptite'], [['riolu', -3], ['gible', -3], ['machoke', -2, 12, 14], ['gabite', -2, 26, 18], ['lucario', -1, 45, 28]], 'sinnoh_iron_island', 73, '⚙️'), sinnoh: true, artRegion: 'sinnoh', megaAfter: 'sinnoh_12_byron' },
    { ...M('sinnoh_snow', 'Mega Snow Temple', 'abomasite', ['abomasite', 'lopunnite', 'lucarionite', 'garchompite'], [['snover', -3], ['buneary', -3], ['sneasel', -2, 12, 14], ['lopunny', -2, 26, 18], ['abomasnow', -1, 45, 28]], 'sinnoh_gym_candice', 74, '❄️'), sinnoh: true, artRegion: 'sinnoh', megaAfter: 'sinnoh_12_byron' },
  );
  // Unova Act 2 U-S5 / U-S6: two Unova Mega Stone floors — open once Driftveil Gym (Clay, stage 11) is cleared; Lv 78–79 foes
  mega.push(
    { ...M('unova_spark', 'Mega Spark Cavern', 'eelektrossite', ['eelektrossite', 'excadrite', 'golurkite', 'scolipite'], [['tynamo', -3], ['drilbur', -3], ['joltik', -2, 12, 14], ['eelektrik', -2, 26, 18], ['excadrill', -1, 45, 28]], 'unova_chargestone_cave', 78, '🔋'), unova: true, artRegion: 'unova', megaAfter: 'unova_11_clay' },
    { ...M('unova_flame', 'Mega Ember Tower', 'emboarite', ['emboarite', 'chandelurite', 'scraftinite', 'audinite'], [['litwick', -3], ['scraggy', -3], ['pignite', -2, 12, 14], ['lampent', -2, 26, 18], ['scrafty', -1, 45, 28]], 'unova_dragonspiral_tower', 79, '🔥'), unova: true, artRegion: 'unova', megaAfter: 'unova_11_clay' },
  );
  // Kalos + Alola build: the Bonus Zone Mega section gains the new stones — two Kalos floors (the 10 Kalos stones, Diancite included;
  // no Zygardite exists, U8) open after Shalour Gym (Korrina — the Tower of Mastery teaches Mega Evolution), one Alola floor (Golisopite +
  // Drampanite, U2a) after Po Town (Guzma). Lv 83–89 foes, the first clear guarantees the headline stone.
  mega.push(
    { ...M('kalos_bloom', 'Mega Bloom Palace', 'chesnaughtite', ['chesnaughtite', 'delphoxite', 'greninjite', 'meowsticite', 'malamarite'], [['chespin', -3], ['espurr', -3], ['inkay', -2, 12, 14], ['quilladin', -2, 26, 18], ['malamar', -1, 45, 28]], 'kalos_parfum_palace', 83, '🌸'), kalos: true, artRegion: 'kalos', megaAfter: 'kalos_10_korrina' },
    { ...M('kalos_coast', 'Mega Diamond Coast', 'diancite', ['diancite', 'barbaracite', 'dragalgite', 'hawluchanite', 'pyroarite'], [['binacle', -3], ['skrelp', -3], ['litleo', -2, 12, 14], ['dragalge', -2, 26, 18], ['barbaracle', -1, 45, 28]], 'kalos_glittering_cave', 84, '💎'), kalos: true, artRegion: 'kalos', megaAfter: 'kalos_10_korrina' },
    { ...M('alola_trial', 'Mega Totem Den', 'golisopite', ['golisopite', 'drampanite'], [['wimpod', -3], ['jangmo_o', -3], ['hakamo_o', -2, 12, 14], ['drampa', -2, 26, 18], ['golisopod', -1, 45, 28]], 'alola_lush_jungle', 89, '🌺'), alola: true, artRegion: 'alola', megaAfter: 'alola_15_po_town' },
  );
  // Galar + Paldea build (Kakashi ruling 2): one Paldea floor — the four Z-A stones (Scovillainite, Glimmoranite, Tatsugirinite,
  // Baxcalibrite), open after Atticus (the Poison crew, stage 13 — Glimmoranite's own stage). Galar has no Mega (Mega Falinks OUT).
  mega.push(
    { ...M('paldea_crystal', 'Mega Crystal Cavern', 'baxcalibrite', ['baxcalibrite', 'scovillainite', 'glimmoranite', 'tatsugirinite'], [['capsakid', -3], ['glimmet', -3], ['frigibax', -2, 12, 14], ['arctibax', -2, 26, 18], ['glimmora', -1, 45, 28]], 'paldea_gym_grusha', 99, '💎'), paldea: true, artRegion: 'paldea', megaAfter: 'paldea_13_atticus' },
  );
  for (const st of mega) st.burst = { pool: [...new Set(st.waves.map((w) => w.form))] };
  // Hoenn Step 9.5 regression tune (the +~13% prices dropped Mega Ocean Cave / Mega Sky Ruins to 2/6 for the Lv 65 deck): first
  // releases at 1.5× their start, packs 1–2, trickle ×2 — waves only, the floors' foes / stones / levels unchanged (→ 6/6)
  for (const st of mega.filter((x) => ['bonus_mega_ocean', 'bonus_mega_sky'].includes(x.id))) {
    for (const w of st.waves) w.start = Math.round(w.start * 1.5);
    Object.assign(st.burst, { pack: [1, 2], trickle: 2 });
  }
  BM.BONUS_STAGES = [...xpStages, ...treasure, ...mega];
  // Y1 (Phase 7.5): the Tower's strongest wave form (the evolved headline foe / the tier's heavy) waits for a 35 s timer gate
  for (const st of BM.BONUS_STAGES) {
    let best = null, bv = -1;
    for (const w of st.waves) { const f = BM.FORMS[w.form], v = f.bst + f.baseHP; if (v > bv) { bv = v; best = w.form; } }
    st.gate = { by: 'time', at: 35, forms: [best] };
    // …and a treasure vault's headline heavy stays in the trickle only (never a +2-level, HP ×1.8 wall-breaker) — Phase 7.5 sim
    // OOO1 (Johto Step 0d): a vault's own wave timers are already tight (every 9–19 s), so its packed trickle keeps a little more
    // spacing per body (×1.9) and gentler bursts (3–4 every 20–26 s): at the campaign values three vaults jammed at their unlock
    // level, 4 levels under the vault (Water / Thunder / Ice, combined sim)
    if (st.bonus === 'treasure') st.burst = { pool: [...new Set(st.waves.map((w) => w.form))].filter((f) => f !== best), trickle: 1.9, size: [3, 4], every: [20, 26] };
  }
  // BR-109 fix (Sinnoh + Unova prompt Step 0a, Kakashi's call): four vaults fell to 0–2/6 at their unlock level after the batch-1
  // generator costs. Stage-side only: their trickle sends ONE body per release (no pack extras); Leaf Stone Garden also spaces it
  // ×2.1. Foes, levels, drops, gates unchanged → Water 4/6 · Thunder 5/6 · Leaf 4/6 · Ice 4/6 (best style, 6 seeds).
  for (const [id, extra] of [['water', {}], ['thunder', {}], ['leaf', { trickle: 2.1 }], ['ice', {}]]) Object.assign(BM.BONUS_STAGES.find((s) => s.id === 'bonus_tr_' + id).burst, { pack: [1, 1] }, extra);
  BM.BONUS_MEGA = { locked: true, text: 'Beat Johto to unlock 🔒', name: 'Mega Stone Stages' }; // the locked card's words (until the unlock)
  // level-ramp patch Step 2 side effect: the enemy queue (overflow no longer dropped at the field cap) put the Treasure Tower at 1/6 for
  // its unlock-level deck (phase7 Tower check) — the softening dial s 1 restores 6/6; its LEVEL stays as it was (the brief)
  BM.softenStage(BM.BONUS_STAGES.find((s) => s.id === 'bonus_tr_item'), 1);
  BM.STAGES.push(...BM.BONUS_STAGES);
  BM.isBonus = (st) => !!(st && st.bonus);
  // Unlocks (BUILD_PLAN §4.3 spirit: Easy after Brock …): the zone itself opens after Brock; XP tiers after Brock / Lt. Surge /
  // Koga / Giovanni; each treasure stage once the campaign stage its band matches (`curveAt`) is cleared.
  BM.BONUS_OPEN_AFTER = 'kanto_05_brock';
  const TIER_AFTER = { regular: 'kanto_05_brock', great: 'kanto_10_surge', ultra: 'kanto_15_koga', master: 'kanto_20_giovanni', hoenn: 'hoenn_01_littleroot', sinnoh: 'sinnoh_01_twinleaf', unova: 'unova_01_nuvema', kalos: 'kalos_01_vaniville', alola: 'alola_01_iki', galar: 'galar_01_postwick', paldea: 'paldea_01_cabo_poco' };
  BM.bonusUnlockStage = (st) => (st.bonus === 'mega' ? (st.megaAfter || (st.hoenn ? 'hoenn_12_desert' : 'johto_24_champion')) : st.tier ? TIER_AFTER[st.tier] : BM.KANTO_STAGES[Math.max(0, st.curveAt - 1)].id);
  BM.bonusOpen = (st, p) => !!(p && p.cleared[BM.bonusUnlockStage(st)] > 0);
})();
