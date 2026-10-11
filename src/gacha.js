// Gacha logic (Phase 5, BUILD_PLAN §4.5 + §4.8). Pure rules on the active profile — the screen is gacha_screen.js.
//   1 pull = 10 tickets, or 1 Poké Ball (9 balls buy a 10-pull). Legendary 2% per pull; per-banner pity: the 40th pull since
//   that banner's last legendary is a guaranteed legendary (one of ITS two). Otherwise the loot table: Character 30 ·
//   XP 45 (S 30 / M 12 / L 3) · Battle item 17 · Evolution item 8 (stones / held items of lines on that banner).
//   Non-legendary character pulls favour unowned lines 75% while any remain. A duplicate character -> XP Candy L worth of
//   XP for that line ("Already a friend! +XP"). Mewtwo is in no pool (rewardOnly) — never pullable.
//   Master Ball: trade 30 Poké Balls -> 1. Legendary Gacha: 1 Master Ball = 1 random legendary from the gacha pools of
//   regions the profile has CLEARED (duplicates -> XP L).
window.BM = window.BM || {};
BM.GACHA = {
  PULL_TICKETS: 10, PULL_BALLS: 1, MULTI_BALLS: 9, MULTI: 10,
  LEGEND_RATE: 0.02, PITY: 40,
  LOOT: [['character', 30], ['xp', 45], ['battle', 17], ['evo', 8]],
  XP: [['xp_candy_s', 30], ['xp_candy_m', 12], ['xp_candy_l', 3]],
  UNOWNED_BIAS: 0.75,
  DUPE_XP: 15000,           // = XP Candy L (§4.3)
  MASTER_TRADE: 30,         // Poké Balls per Master Ball
  // Regions whose legendaries the Legendary Gacha may give. A region counts once its final stage is cleared; Kanto
  // also counts in Build 1 because its Champion stage only opens in Phase 7 (the prompt: "Build 1: Kanto's four").
  // Remove 'kanto' here to require the Champion clear.
  LEGEND_REGIONS_OPEN: ['kanto'],
};
BM.Gacha = (function () {
  const G = BM.GACHA;
  const prof = () => BM.Save.profile();
  const banner = (id) => BM.BANNERS.find((b) => b.id === id);
  const pullable = (id) => BM.LINES[id] && !BM.LINES[id].rewardOnly && !BM.LINES[id].enemyOnly;
  const legends = (b) => b.legendaries.filter(pullable);
  const commons = (b) => b.lines.filter(pullable);
  function weighted(list, rnd) { const tot = list.reduce((a, x) => a + x[1], 0); let r = rnd() * tot; for (const x of list) { if ((r -= x[1]) < 0) return x[0]; } return list[list.length - 1][0]; }
  const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length) % arr.length];
  // Evolution items for the lines on a banner (stones + held items their forms need).
  const evoItems = (b) => [...new Set(commons(b).flatMap((id) => BM.LINES[id].forms.map((f) => f.evo && f.evo.item).filter(Boolean)))];
  const pityLeft = (bannerId, p = prof()) => G.PITY - ((p.pity && p.pity[bannerId]) || 0);

  // Gives a character line (or its duplicate XP). Returns the result fields.
  function grantLine(p, id) {
    if (!p.lines[id]) { BM.Save.giveLine(p, id); return { line: id, isNew: true }; }
    const r = BM.Save.addXpTo(p, id, G.DUPE_XP);
    return { line: id, dupe: true, xp: G.DUPE_XP, from: r.from, to: r.to };
  }
  // One pull on a banner (no payment — see pull()). `rnd` = seeded RNG in tests.
  function rollOne(p, b, rnd) {
    const n = ((p.pity[b.id] || 0) + 1);            // this pull's number since the banner's last legendary
    p.pulls[b.id] = (p.pulls[b.id] || 0) + 1;
    if (n >= G.PITY || rnd() < G.LEGEND_RATE) {
      p.pity[b.id] = 0;
      return { kind: 'legendary', pity: n >= G.PITY && true, ...grantLine(p, pick(legends(b), rnd)) };
    }
    p.pity[b.id] = n;
    const kind = weighted(G.LOOT, rnd);
    if (kind === 'character') {
      const all = commons(b), unowned = all.filter((id) => !p.lines[id]);
      const id = unowned.length && (unowned.length === all.length || rnd() < G.UNOWNED_BIAS) ? pick(unowned, rnd) : pick(all, rnd);
      return { kind, ...grantLine(p, id) };
    }
    const item = kind === 'xp' ? weighted(G.XP, rnd) : kind === 'battle' ? pick(BM.BATTLE_ITEMS.filter((i) => BM.ITEM_INFO[i].kind === 'battle'), rnd) : pick(evoItems(b), rnd);
    p.items[item] = (p.items[item] || 0) + 1;
    return { kind, item };
  }
  // What a single / 10-pull costs in a currency, and whether the profile can pay.
  function price(count, currency) {
    if (currency === 'balls') return { item: 'poke_ball', n: count === G.MULTI ? G.MULTI_BALLS : G.PULL_BALLS * count };
    return { tickets: G.PULL_TICKETS * count };
  }
  function canPay(count, currency, p = prof()) {
    const pr = price(count, currency);
    return pr.tickets != null ? p.tickets >= pr.tickets : (p.items[pr.item] || 0) >= pr.n;
  }
  // Pays and pulls `count` (1 or 10) on a banner. Returns { ok, results[], msg } (nothing is spent when refused).
  function pull(bannerId, count, currency, rnd = Math.random) {
    const p = prof(), b = banner(bannerId);
    if (!b || ![1, G.MULTI].includes(count)) return { ok: false, msg: 'Nothing happened.' };
    if (!canPay(count, currency, p)) {
      const pr = price(count, currency);
      return { ok: false, msg: pr.tickets != null ? `You need ${pr.tickets} tickets — you have ${p.tickets}.` : `You need ${pr.n} Poké Ball${pr.n > 1 ? 's' : ''} — you have ${p.items.poke_ball || 0}.` };
    }
    const pr = price(count, currency);
    if (pr.tickets != null) p.tickets -= pr.tickets; else { p.items.poke_ball -= pr.n; if (!p.items.poke_ball) delete p.items.poke_ball; }
    const results = [];
    for (let i = 0; i < count; i++) results.push(rollOne(p, b, rnd));
    BM.Save.persist();
    return { ok: true, results };
  }
  // 30 Poké Balls -> 1 Master Ball. Returns 'ok' | 'balls'.
  function tradeMasterBall() {
    const p = prof();
    if ((p.items.poke_ball || 0) < G.MASTER_TRADE) return 'balls';
    p.items.poke_ball -= G.MASTER_TRADE; if (!p.items.poke_ball) delete p.items.poke_ball;
    p.items.master_ball = (p.items.master_ball || 0) + 1;
    BM.Save.persist(); return 'ok';
  }
  // Regions open for the Legendary Gacha: final stage cleared, or listed in LEGEND_REGIONS_OPEN (Build 1: Kanto).
  function clearedRegions(p = prof()) {
    const regions = [...new Set(BM.BANNERS.map((b) => b.region))];
    return regions.filter((r) => G.LEGEND_REGIONS_OPEN.includes(r) || BM.STAGES.some((s) => s.regionFinal && s.id.startsWith(r) && p.cleared[s.id] > 0));
  }
  function legendPool(p = prof()) {
    const rs = clearedRegions(p);
    return [...new Set(BM.BANNERS.filter((b) => rs.includes(b.region)).flatMap(legends))];
  }
  // 1 Master Ball -> 1 random legendary from the cleared regions' gacha pools. Returns { ok, result | msg }.
  function legendaryPull(rnd = Math.random) {
    const p = prof(), pool = legendPool(p);
    if (!(p.items.master_ball > 0)) return { ok: false, msg: 'You need a Master Ball.' };
    if (!pool.length) return { ok: false, msg: 'Beat a region to open its legends!' };
    p.items.master_ball--; if (!p.items.master_ball) delete p.items.master_ball;
    const result = { kind: 'legendary', master: true, ...grantLine(p, pick(pool, rnd)) };
    BM.Save.persist();
    return { ok: true, results: [result] };
  }
  return { pull, price, canPay, pityLeft, tradeMasterBall, legendaryPull, legendPool, clearedRegions, legends, commons, evoItems, banner };
})();
