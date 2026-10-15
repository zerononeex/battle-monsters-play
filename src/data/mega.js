// MEGA EVOLUTION (Johto prompt v9 Step 6, user decision): beating Johto (the Champion's first clear → regionsDone.johto) unlocks
// Mega Evolution for that profile. A Mega form is simply a FIELDABLE FORM of its line (form rules: the shared line level, its
// own stats / AP cost / cooldown) — no mid-battle transformation system (out of scope). It joins the line's form cycle (LL1)
// once BOTH (a) Mega Evolution is unlocked and (b) the profile OWNS that form's Mega Stone (stones are never used up) and has
// the form it Mega Evolves from (e.g. Charizard for Mega Charizard X).
//   Data: johto.js BM.MEGA_FORMS (PokéAPI stats, combat identity) · items.js (the 19 stones, kind 'mega', ids = the queued icon
//   keys) · Mega Stones come from rare themed stage drops (+ the Dowsing Machine's rarest slot), the Prism Tower's Mega Stone
//   floors and the Safari Zone's Mega Stone section — all three only after the unlock.
//   Price: the base final form's + 15 (≈ one evolution step) for every Mega, the Mewtwo pair included (Hoenn Step 9.5) — the
//   500 AP effective cap still holds at any level.
window.BM = window.BM || {};
(function () {
  BM.MEGA = { STEP: 15 };
  for (const m of BM.MEGA_FORMS) {
    const from = BM.FORMS[m.from], line = BM.LINES[from.line]; // the line is the base form's (Scizor → the Scyther line)
    const f = { ...m, mega: true, line: from.line, stage: from.stage + 1, evolvesFrom: m.from, speciesId: BM.speciesOf(from), size: m.size || from.size };
    f.attackType = f.attackType || f.types[0];
    // U7 (Hoenn) + Step 9.5: every Mega = its base final form's cost + 15 (Mewtwo's pair included — the old fixed 140 retired with the
    // 400–500 tier); the 500 AP effective cap (BM.effCost) applies at any level.
    f.cost = Math.min(BM.C.COST_MAX, from.cost + BM.MEGA.STEP);
    BM.FORMS[f.id] = f;
    (line.megas = line.megas || []).push(f);
  }
  BM.MEGA_STONES = BM.MEGA_FORMS.map((m) => m.stone).filter(Boolean); // Mega Rayquaza has no stone (U4)
  BM.megaOfStone = (stone) => BM.FORMS[BM.MEGA_FORMS.find((m) => m.stone === stone).id];
  // every fieldable form of a line, in cycle order: the evolution chain, then its Mega forms
  BM.lineForms = (lineId) => { const L = BM.LINES[lineId]; return L.megas ? [...L.forms, ...L.megas] : L.forms; };
  BM.megaUnlocked = (p) => !!(p && p.regionsDone && p.regionsDone.johto);
  // is this Mega form fieldable for the profile right now?
  // Hoenn U4: Mega Rayquaza (`gate: 'rayquaza'`) needs NO stone — it is ready once the profile owns Rayquaza AND has beaten the
  // Hoenn Champion (regionsDone.hoenn). No stone, no drop, no shop row, no icon.
  // Kalos U8 (ruled): Mega Zygarde takes the same no-stone gate — own Zygarde + the Kalos Champion beaten (`gate: 'zygarde'`)
  BM.MEGA_GATES = { rayquaza: 'hoenn', zygarde: 'kalos' };
  const gateOk = (p, f) => (f.gate ? !!(p.regionsDone && p.regionsDone[BM.MEGA_GATES[f.gate]]) : !!(p.items && p.items[f.stone] > 0));
  BM.megaReady = (p, f) => !!(f && f.mega && BM.megaUnlocked(p) && gateOk(p, f) && p.lines[f.line] && p.lines[f.line].unlocked.includes(f.from));
  // the honest lock line on the collection detail (the Bellossom gate pattern)
  BM.megaLockText = (p, f) => (f.gate ? (!(p.regionsDone && p.regionsDone[BM.MEGA_GATES[f.gate]]) ? `Needs ${BM.FORMS[f.from].name} · Beat the ${BM.REGION_NAMES[BM.MEGA_GATES[f.gate]]} Champion` : `Needs ${BM.FORMS[f.from].name} first`)
    : !BM.megaUnlocked(p) ? 'Mega Evolution unlocks when you beat the Johto Champion'
    : !(p.items[f.stone] > 0) ? `Needs a ${BM.ITEMS[f.stone]}` : `Needs ${BM.FORMS[f.from].name} first`);
  // Keeps every owned line's unlocked list in step with the Mega rule (called by the save on load and after every reward /
  // purchase): a ready Mega form is fieldable, one that is not ready is not (and a fielded one falls back to its base form).
  BM.syncMegas = function (p) {
    if (!p || !p.lines) return;
    for (const [id, l] of Object.entries(p.lines)) {
      const L = BM.LINES[id];
      if (!L || !L.megas) continue;
      for (const f of L.megas) {
        const ready = BM.megaReady(p, f), has = l.unlocked.includes(f.id);
        if (ready && !has) l.unlocked.push(f.id);
        if (!ready && has) l.unlocked = l.unlocked.filter((x) => x !== f.id);
      }
      if (!l.unlocked.includes(l.form)) l.form = l.unlocked.filter((x) => !BM.FORMS[x].mega).pop() || l.unlocked[0];
    }
  };
})();
// Mega Stones as RARE themed drops on Johto stages (type-matched; `needs: 'mega'` — they roll only after the unlock, and then
// they are the stage's rarest real drop, so an armed Dowsing Machine finds one). Weight 0.6 against a ~100 table.
(function () {
  const MEGA_DROPS = {
    johto_02_cherrygrove: ['feraligite'], johto_03_route31: ['meganiumite'], johto_04_sprout: ['alakazite'], johto_08_bugsy: ['scizorite', 'pinsirite'],
    johto_09_ilex: ['venusaurite'], johto_12_nationalpark: ['pinsirite', 'venusaurite'], johto_13_burnedtower: ['charizardite_y', 'houndoominite'],
    johto_14_morty: ['gengarite'], johto_15_lighthouse: ['raichunite_x', 'raichunite_y'], johto_16_jasmine: ['scizorite'], johto_18_lakeofrage: ['gyaradosite'],
    johto_19_pryce: ['blastoisinite'], johto_21_clair: ['dragoninite'], johto_22_victoryroad: ['tyranitarite', 'aerodactylite'],
    johto_23_elitefour: ['houndoominite', 'alakazite'], johto_24_champion: ['dragoninite', 'charizardite_x'], johto_25_mtsilver: ['mewtwonite_x', 'mewtwonite_y', 'charizardite_x'],
  };
  // Hoenn (Step 6, C11): one type-matched stage per stone (the stage plan's proposals); Absolite Z with Sidney (Dark). Latiasite +
  // Latiosite drop nowhere — the Safari Zone's Mega section ONLY (legendary stones). Mega Rayquaza has no stone at all (U4).
  Object.assign(MEGA_DROPS, {
    hoenn_03_petalburg_woods: ['sceptilite'], hoenn_04_roxanne: ['aggronite'], hoenn_05_granite_cave: ['sablenite', 'mawilite'], hoenn_06_brawly: ['medichamite'],
    hoenn_07_slateport: ['swampertite'], hoenn_08_wattson: ['manectite'], hoenn_09_verdanturf: ['galladite'], hoenn_10_meteor_falls: ['altarianite'],
    hoenn_11_flannery: ['blazikenite'], hoenn_14_winona: ['absolite'], hoenn_15_mt_pyre: ['banettite'], hoenn_16_aqua_hideout: ['sharpedonite'],
    hoenn_17_tate_liza: ['gardevoirite'], hoenn_20_sidney: ['absolite_z', 'absolite'], hoenn_23_drake: ['salamencite'], hoenn_24_champion: ['metagrossite'],
    hoenn_25_sky_pillar: ['metagrossite', 'salamencite'],
  });
  // Sinnoh (Act 1 S6, the pack's C11 table): one type-matched stage per stone. Heatranite + Darkranite drop nowhere — the Safari Mega
  // section ONLY (legendary stones, the Latiasite / Latiosite precedent).
  Object.assign(MEGA_DROPS, {
    sinnoh_06_eterna_forest: ['lopunnite'], sinnoh_09_solaceon: ['staraptite'], sinnoh_10_maylene: ['lucarionite'], sinnoh_13_iron_island: ['lucarionite_z'],
    sinnoh_15_candice: ['abomasite'], sinnoh_21_bertha: ['garchompite_z'], sinnoh_24_champion: ['garchompite'], sinnoh_25_hisui_rift: ['garchompite', 'lucarionite'],
  });
  // Unova (Act 2 U-S6, the pack's C11 table): one type-matched stage per stone (no Safari-only stone this region)
  Object.assign(MEGA_DROPS, {
    unova_06_pinwheel: ['audinite'], unova_07_burgh: ['scolipite'], unova_11_clay: ['excadrite'], unova_12_chargestone: ['eelektrossite'],
    unova_13_celestial: ['chandelurite'], unova_20_shauntal: ['golurkite', 'chandelurite'], unova_21_grimsley: ['scraftinite'], unova_23_marshal: ['emboarite'],
  });
  // Kalos (Kalos + Alola build, the pack's drop table): one type-matched stage per stone. Diancite drops nowhere on the map — the
  // capstone's first-clear prize (Rogue Mega Night) + the Bonus Zone's Kalos Mega floor; Mega Zygarde has no stone at all (U8).
  Object.assign(MEGA_DROPS, {
    kalos_10_korrina: ['hawluchanite'], kalos_11_ramos: ['chesnaughtite'], kalos_17_olympia: ['malamarite', 'meowsticite'],
    kalos_20_malva: ['delphoxite', 'pyroarite'], kalos_21_siebold: ['greninjite', 'barbaracite'], kalos_23_drasna: ['dragalgite'],
    kalos_25_rogue_mega_night: ['pyroarite', 'malamarite', 'barbaracite', 'dragalgite', 'hawluchanite', 'meowsticite'],
  });
  // Alola (U2a): Golisopite with Guzma (Po Town), Drampanite on Mount Lanakila (Elite Four Hala — Drampa lives on the climb)
  Object.assign(MEGA_DROPS, { alola_15_po_town: ['golisopite'], alola_22_hala_e4: ['drampanite'] });
  for (const [id, stones] of Object.entries(MEGA_DROPS)) { const st = BM.stageById(id); for (const s of stones) st.drops.push({ item: s, w: 0.6, n: 1, needs: 'mega' }); }
  BM.MEGA_DROPS = MEGA_DROPS;
})();
