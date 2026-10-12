// MEGA EVOLUTION (Johto prompt v9 Step 6, user decision): beating Johto (the Champion's first clear → regionsDone.johto) unlocks
// Mega Evolution for that profile. A Mega form is simply a FIELDABLE FORM of its line (form rules: the shared line level, its
// own stats / AP cost / cooldown) — no mid-battle transformation system (out of scope). It joins the line's form cycle (LL1)
// once BOTH (a) Mega Evolution is unlocked and (b) the profile OWNS that form's Mega Stone (stones are never used up) and has
// the form it Mega Evolves from (e.g. Charizard for Mega Charizard X).
//   Data: johto.js BM.MEGA_FORMS (PokéAPI stats, combat identity) · items.js (the 19 stones, kind 'mega', ids = the queued icon
//   keys) · Mega Stones come from rare themed stage drops (+ the Dowsing Machine's rarest slot), the Prism Tower's Mega Stone
//   floors and the Safari Zone's Mega Stone section — all three only after the unlock.
//   Price: the base final form's + 15 (≈ one evolution step), the Mewtwo pair 140 (above every legendary) — the 150 AP
//   effective cap still holds at any level.
window.BM = window.BM || {};
(function () {
  BM.MEGA = { STEP: 15, MEWTWO: 140 };
  for (const m of BM.MEGA_FORMS) {
    const from = BM.FORMS[m.from], line = BM.LINES[from.line]; // the line is the base form's (Scizor → the Scyther line)
    const f = { ...m, mega: true, line: from.line, stage: from.stage + 1, evolvesFrom: m.from, speciesId: BM.speciesOf(from), size: m.size || from.size };
    f.attackType = f.attackType || f.types[0];
    f.cost = from.line === 'mewtwo' ? BM.MEGA.MEWTWO : Math.min(BM.COST_BANDS.legend.hi, from.cost + BM.MEGA.STEP);
    BM.FORMS[f.id] = f;
    (line.megas = line.megas || []).push(f);
  }
  BM.MEGA_STONES = BM.MEGA_FORMS.map((m) => m.stone);
  BM.megaOfStone = (stone) => BM.FORMS[BM.MEGA_FORMS.find((m) => m.stone === stone).id];
  // every fieldable form of a line, in cycle order: the evolution chain, then its Mega forms
  BM.lineForms = (lineId) => { const L = BM.LINES[lineId]; return L.megas ? [...L.forms, ...L.megas] : L.forms; };
  BM.megaUnlocked = (p) => !!(p && p.regionsDone && p.regionsDone.johto);
  // is this Mega form fieldable for the profile right now?
  BM.megaReady = (p, f) => !!(f && f.mega && BM.megaUnlocked(p) && p.items && p.items[f.stone] > 0 && p.lines[f.line] && p.lines[f.line].unlocked.includes(f.from));
  // the honest lock line on the collection detail
  BM.megaLockText = (p, f) => (!BM.megaUnlocked(p) ? 'Mega Evolution unlocks when you beat the Johto Champion'
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
  for (const [id, stones] of Object.entries(MEGA_DROPS)) { const st = BM.stageById(id); for (const s of stones) st.drops.push({ item: s, w: 0.6, n: 1, needs: 'mega' }); }
  BM.MEGA_DROPS = MEGA_DROPS;
})();
