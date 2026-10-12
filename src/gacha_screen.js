// Safari Zone screen (R1, Phase 7.5 — internal name stays "gacha") (Phase 5): banner tabs, banner card (its two legendaries + pool + pity counter), currency picker (tickets
// or Poké Balls, both balances shown), Pull ×1 / ×10, Master Ball trade, Legendary Gacha, and the reveal. Rules: gacha.js.
window.BM = window.BM || {};
BM.GachaScreen = function (ui) {
  const { $, tap, toast, show } = ui;
  const G = BM.GACHA, Ga = BM.Gacha;
  const prof = () => BM.Save.profile();
  let bannerId = BM.BANNERS[0].id, currency = 'tickets';
  const icon = (key, emo) => { const s = BM.Sprites.artSrc('icons/' + key); return s ? `<img src="${s}" alt="">` : emo; };
  const TK = () => BM.ticketIcon(), PB = () => icon('poke_ball', '🔴'), MB = () => icon('master_ball', '🟣');
  const legendNames = (b) => b.legendaries.map((id) => BM.LINES[id].name).join(' or ');

  function render() {
    const p = prof(), list = BM.bannersFor(p);
    if (!list.some((x) => x.id === bannerId)) bannerId = list[0].id;
    const b = Ga.banner(bannerId);
    ui.renderWallet();
    // tabs (Johto Step 3: a region's banners appear once the profile reaches it — Kanto A/B, then Johto A/B)
    const tabs = $('banner-tabs'); tabs.innerHTML = ''; tabs.classList.toggle('many', list.length > 2); tabs.classList.toggle('six', list.length > 4); // Hoenn: 6 tabs = a 2-column grid
    for (const bb of list) {
      const t = document.createElement('button'); t.className = 'banner-tab' + (bb.id === bannerId ? ' on' : ''); t.dataset.banner = bb.id;
      t.innerHTML = `<span class="bt-name">${bb.short || bb.name.replace('Kanto ', '')}</span><span class="bt-leg">${bb.legendaries.map((id) => BM.LINES[id].name).join(' + ')}</span>`;
      // SS1 (Phase 7.6): the banner's legendaries as their real in-game battle sprites, big — kids pick a banner by who they see
      const spr = document.createElement('span'); spr.className = 'bt-sprites';
      for (const id of bb.legendaries) { const c = ui.thumb(BM.LINES[id].forms[0], 112, false); c.className = 'leg-sprite'; c.dataset.line = id; spr.appendChild(c); }
      t.insertBefore(spr, t.firstChild);
      tap(t, () => { bannerId = bb.id; BM.Audio.sfx('tap'); render(); });
      tabs.appendChild(t);
    }
    // banner card (R2, Phase 7.5): a dedicated 2:1 ART STAGE on top — the #250/#251 key art shown UNCROPPED (the art is
    // composed 2:1) — and ALL the UI below it: the legendaries' names + type/role chips, the pity counter, the pool strip
    // (H3b) and the odds. Without key art the stage shows the two legendaries' sprites on the banner gradient.
    const card = $('banner-card'); card.innerHTML = ''; card.dataset.banner = b.id;
    const key = BM.Sprites.artSrc('ui/banner_' + b.id);
    card.classList.toggle('has-art', !!key);
    // OO1: the Safari Zone screen sits on its themed savanna backdrop (assets/ui/safari_zone.png, #272) — orange gradient until then
    const bd = BM.Sprites.artSrc('ui/safari_zone');
    $('scr-gacha').style.backgroundImage = bd ? `url("${bd}")` : '';
    const stage = document.createElement('div'); stage.className = 'bc-art'; stage.id = 'bc-art';
    if (key) { const im = document.createElement('img'); im.src = key; im.alt = b.name; im.className = 'bc-art-img'; stage.appendChild(im); }
    else {
      const legs = document.createElement('div'); legs.className = 'bc-legs';
      for (const id of b.legendaries) { const d = document.createElement('div'); d.className = 'bc-leg'; d.appendChild(ui.thumb(BM.LINES[id].forms[0], 170, false)); legs.appendChild(d); }
      stage.appendChild(legs);
    }
    card.appendChild(stage);
    const info = document.createElement('div'); info.className = 'bc-info'; info.id = 'bc-info';
    const names = document.createElement('div'); names.className = 'bc-names ss1';
    names.classList.toggle('crowd', b.legendaries.length > 3); // Hoenn's 5 / 4 legendaries: sprite + name only (chips hidden) so the row fits
    for (const id of b.legendaries) {
      const d = document.createElement('div'); d.className = 'bc-leg-info'; d.dataset.line = id;
      // SS1: the legendary's battle sprite leads its name row (key art above stays uncropped; this is UI below it)
      const sp = ui.thumb(BM.LINES[id].forms[0], 128, false); sp.className = 'leg-sprite'; sp.dataset.line = id; d.appendChild(sp);
      const tx = document.createElement('div'); tx.className = 'bc-leg-text'; d.appendChild(tx);
      const n = document.createElement('span'); n.className = 'bc-name'; n.textContent = BM.LINES[id].name + (p.lines[id] ? ' ✓' : ''); tx.appendChild(n);
      // H3: TYPE icons + ROLE label as chips beside each legendary
      const f = BM.LINES[id].forms[0], chips = document.createElement('div'); chips.className = 'bc-chips'; chips.dataset.line = id;
      for (const t of f.types) {
        const ic = BM.Sprites.artSrc('icons/type_' + t), c = document.createElement('span');
        c.className = 'bc-chip type'; c.dataset.type = t; c.style.background = BM.TYPE_COLORS[t];
        c.innerHTML = (ic ? `<img src="${ic}" alt="">` : '') + t; chips.appendChild(c);
      }
      const rl = BM.roleLabel(f), rc = document.createElement('span'); rc.className = 'bc-chip role'; rc.textContent = `${rl.icon} ${rl.text}`; chips.appendChild(rc);
      tx.appendChild(chips);
      names.appendChild(d);
    }
    info.appendChild(names);
    const pity = document.createElement('div'); pity.className = 'bc-pity'; pity.id = 'pity-text';
    const left = Ga.pityLeft(b.id);
    pity.innerHTML = `<b>${legendNames(b)}</b> guaranteed in <b class="pity-n">${left}</b> pull${left === 1 ? '' : 's'}!`;
    info.appendChild(pity);
    const bar = document.createElement('div'); bar.className = 'bc-bar'; bar.innerHTML = `<i style="width:${Math.round((G.PITY - left) / G.PITY * 100)}%"></i>`; info.appendChild(bar);
    const pool = document.createElement('div'); pool.className = 'bc-pool';
    for (const id of Ga.commons(b)) {
      const owned = !!p.lines[id], c = ui.thumb(BM.LINES[id].forms[0], 56, !owned);
      c.title = owned ? BM.LINES[id].name : '???'; c.dataset.line = id; pool.appendChild(c);
    }
    info.appendChild(pool);
    const odds = document.createElement('div'); odds.className = 'bc-odds';
    odds.textContent = `Legendary 2% · Pokémon 30% · XP candy 45% · battle item 17% · evolution item 8% · new friends first!`;
    info.appendChild(odds);
    card.appendChild(info);
    sizeStage();
    // currency picker + pull buttons
    $('cur-tickets').innerHTML = `${TK()} Tickets <b>${p.tickets}</b>`;
    $('cur-balls').innerHTML = `${PB()} Poké Balls <b>${p.items.poke_ball || 0}</b>`;
    for (const id of ['cur-tickets', 'cur-balls']) $(id).classList.toggle('on', $(id).dataset.cur === currency);
    const cost = (n) => { const pr = Ga.price(n, currency); return pr.tickets != null ? `${TK()} ${pr.tickets}` : `${PB()} ${pr.n}`; };
    $('btn-pull1').innerHTML = `<span class="pb-t">Pull ×1</span><span class="pb-c">${cost(1)}</span>`;
    $('btn-pull10').innerHTML = `<span class="pb-t">Pull ×10</span><span class="pb-c">${cost(G.MULTI)}</span>`;
    $('btn-pull1').classList.toggle('cant', !Ga.canPay(1, currency));
    $('btn-pull10').classList.toggle('cant', !Ga.canPay(G.MULTI, currency));
    const balls = p.items.poke_ball || 0, mbs = p.items.master_ball || 0;
    $('btn-master-trade').innerHTML = `Trade ${G.MASTER_TRADE} ${PB()} → ${MB()} Master Ball <small>(you have ${balls})</small>`;
    $('btn-master-trade').disabled = balls < G.MASTER_TRADE;
    $('btn-legend').innerHTML = `${MB()} Legendary Safari Zone <small>${mbs ? `×${mbs} Master Ball${mbs > 1 ? 's' : ''}` : '🔒 needs a Master Ball'}</small>`;
    $('btn-legend').disabled = !mbs;
    // Johto Step 6: the Mega Stone section shows only after the unlock
    show('btn-mega-shop', BM.megaUnlocked(p));
    if (BM.megaUnlocked(p)) { const own = BM.MEGA_STONES.filter((s) => p.items[s] > 0).length; $('btn-mega-shop').innerHTML = `💎 Mega Stones <small>${own} / ${BM.MEGA_STONES.length} · ${TK()} ${G.MEGA_STONE_TICKETS} each</small>`; }
    // KK1 + MM1 + VVV1: earning is as visible as spending — a pull-sized, full-width button with the Poké Ball art (no 🧠):
    // every right answer pays one Poké Ball = one free Safari Zone spin, +3 bonus every 5 in a row
    $('btn-earn').innerHTML = `<span class="pb-t">${BM.ballHtml('poke_ball', 'earn-ball')} Answer &amp; Earn</span><span class="pb-c">Poké Balls — 1 per right answer, +3 bonus every 5 in a row!</span>`;
  }
  // R2: the art stage is exactly 2:1 and as big as the card allows once the info block below has its room — the art is
  // never cropped or stretched. Re-measured on every render and on resize.
  function sizeStage() {
    const card = $('banner-card'), st = $('bc-art'), info = $('bc-info');
    if (!st || !info || !card.clientHeight) return;
    const cs = getComputedStyle(card), padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom), padH = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const availH = card.clientHeight - padV - info.offsetHeight - 6, availW = card.clientWidth - padH;
    const w = Math.max(80, Math.floor(Math.min(availW, availH * 2)));
    st.style.width = w + 'px'; st.style.height = Math.floor(w / 2) + 'px';
  }
  window.addEventListener('resize', () => { if (!$('scr-gacha').classList.contains('hidden')) sizeStage(); });
  for (const id of ['cur-tickets', 'cur-balls']) tap($(id), () => { currency = $(id).dataset.cur; BM.Audio.sfx('tap'); render(); });
  function doPull(n) {
    const r = Ga.pull(bannerId, n, currency);
    if (!r.ok) { BM.Audio.sfx('deny'); toast(r.msg); return; }
    reveal(r.results);
  }
  tap($('btn-pull1'), () => doPull(1));
  tap($('btn-pull10'), () => doPull(G.MULTI));
  tap($('btn-master-trade'), () => {
    if (Ga.tradeMasterBall() !== 'ok') { BM.Audio.sfx('deny'); toast(`A Master Ball costs ${G.MASTER_TRADE} Poké Balls — you have ${prof().items.poke_ball || 0}.`); return; }
    BM.Audio.sfx('upgrade'); toast('You got a Master Ball! The Legendary Safari Zone is open.'); render();
  });
  tap($('btn-legend'), () => { if (!(prof().items.master_ball > 0)) { BM.Audio.sfx('deny'); toast('Trade 30 Poké Balls for a Master Ball first!'); return; } BM.Audio.sfx('tap'); openLegend(); });
  tap($('btn-gacha-back'), () => { BM.Audio.sfx('tap'); ui.go('title'); });

  // ---------- Legendary Gacha ----------
  function openLegend() {
    const p = prof(), pool = Ga.legendPool();
    $('legend-help').textContent = `1 Master Ball = 1 legendary from the regions you've opened (${Ga.clearedRegions().map((r) => r[0].toUpperCase() + r.slice(1)).join(', ')}). Already a friend? +XP!`;
    const box = $('legend-pool'); box.innerHTML = '';
    for (const id of pool) {
      const d = document.createElement('div'); d.className = 'lp-card'; d.dataset.line = id;
      d.appendChild(ui.thumb(BM.LINES[id].forms[0], 120, !p.lines[id]));
      const n = document.createElement('span'); n.textContent = p.lines[id] ? BM.LINES[id].name : '???'; d.appendChild(n);
      box.appendChild(d);
    }
    $('btn-legend-pull').innerHTML = `Use 1 ${MB()} Master Ball <small>(×${p.items.master_ball || 0})</small>`;
    show('scr-legend', true); ui.fit($('scr-legend'));
  }
  tap($('btn-legend-pull'), () => {
    const r = Ga.legendaryPull();
    if (!r.ok) { BM.Audio.sfx('deny'); toast(r.msg); return; }
    show('scr-legend', false); reveal(r.results);
  });
  // ---------- Mega Stone section (Johto Step 6) ----------
  // Hoenn Step 6: the stones in two tabs — Kanto · Johto (19) and Hoenn (19, once the profile reaches Hoenn) — so the grid never scrolls
  let megaTab = 'kj';
  const MEGA_TABS = [['kj', 'Kanto · Johto', (s) => BM.ITEM_INFO[s].region !== 'hoenn'], ['hoenn', 'Hoenn', (s) => BM.ITEM_INFO[s].region === 'hoenn']];
  function openMegaShop() {
    const p = prof(), box = $('megashop-grid'); box.innerHTML = '';
    $('megashop-help').innerHTML = `Own a Mega Stone and that Pokémon can Mega Evolve — cycle to its Mega form on the Team screen! ${TK()} ${G.MEGA_STONE_TICKETS} each · you have ${p.tickets}.`;
    const tabs = MEGA_TABS.filter(([id]) => id !== 'hoenn' || BM.regionReached('hoenn', p));
    if (!tabs.some(([id]) => id === megaTab)) megaTab = 'kj';
    const tb = $('megashop-tabs'); tb.innerHTML = ''; show('megashop-tabs', tabs.length > 1);
    for (const [id, name] of tabs) { const t = document.createElement('button'); t.className = 'pill-btn coll-reg' + (id === megaTab ? ' on' : ''); t.dataset.tab = id; t.textContent = name;
      tap(t, () => { if (megaTab === id) return; megaTab = id; BM.Audio.sfx('tap'); openMegaShop(); }); tb.appendChild(t); }
    const inTab = MEGA_TABS.find(([id]) => id === megaTab)[2];
    for (const stone of BM.MEGA_STONES.filter(inTab)) {
      const f = BM.megaOfStone(stone), own = p.items[stone] > 0, b = document.createElement('button');
      b.className = 'mega-stone' + (own ? ' owned' : p.tickets < G.MEGA_STONE_TICKETS ? ' cant' : ''); b.dataset.stone = stone;
      b.innerHTML = `<span class="ms-icon">${ui.itemIcon(stone)}</span><b>${BM.ITEMS[stone]}</b><small>${f.name}</small><span class="ms-price">${own ? '✓ yours' : `${TK()} ${G.MEGA_STONE_TICKETS}`}</span>`;
      tap(b, () => {
        const r = Ga.buyMegaStone(stone);
        if (r === 'ok') { BM.Audio.sfx('upgrade'); toast(`${BM.ITEMS[stone]}! ${f.name} can join your team now.`); ui.renderWallet(); render(); openMegaShop(); return; }
        BM.Audio.sfx('deny'); toast(r === 'owned' ? `You already have ${BM.ITEMS[stone]}!` : r === 'tickets' ? `A Mega Stone costs ${G.MEGA_STONE_TICKETS} tickets — you have ${prof().tickets}.` : 'Beat the Johto Champion to unlock Mega Evolution!');
      });
      box.appendChild(b);
    }
    show('scr-megashop', true); ui.fit($('scr-megashop'));
  }
  tap($('btn-mega-shop'), () => { BM.Audio.sfx('tap'); openMegaShop(); });
  tap($('btn-megashop-x'), () => show('scr-megashop', false));
  $('scr-megashop').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-megashop') { e.preventDefault(); show('scr-megashop', false); } });
  const closeLegend = () => show('scr-legend', false);
  tap($('btn-legend-x'), closeLegend);
  $('scr-legend').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-legend') { e.preventDefault(); closeLegend(); } });

  // ---------- reveal: R2 Spotlight Stage on the S4 Elemental Burst ----------
  // One pull at a time, centred: the Pokémon (animated run cycle) on a podium under the spotlight, or an item bouncing
  // slowly in it; rarity ribbon + burst tint; name + stars + type/role plate below. ×10: Next ▶ steps through all ten
  // (Skip ▸▸ jumps to the end), then the recap grid. The burst is the generated art when DONE, else CSS rays.
  let lastResults = [], rvAt = 0, rvRaf = 0;
  const TINT = { legendary: '#ffcf3a', super: '#c46bff', rare: '#4aa8ff', basic: '#9ad0ff', item: '#7fe0a8', new: '#ff9a3a' };
  // GGG1 (Phase 7.6): no "(pity)" stamp anywhere the player looks — the guarantee mechanic + its banner counter are unchanged
  function reveal(results) {
    lastResults = results; rvAt = 0;
    BM.Audio.playMusic('gacha_fanfare');
    const art = BM.Sprites.artSrc('ui/reveal_burst');
    $('rv-burst').style.backgroundImage = art ? `url("${art}")` : '';
    $('rv-burst').classList.toggle('art', !!art); $('rv-burst').dataset.fallback = art ? 'art' : 'css';
    show('rv-stage', true); show('rv-recap', false);
    show('scr-reveal', true);
    showOne();
  }
  function showOne() {
    const r = lastResults[rvAt], many = lastResults.length > 1, stage = $('rv-stage');
    cancelAnimationFrame(rvRaf);
    const fig = $('rv-figure'), plate = $('rv-plate'); fig.innerHTML = ''; plate.innerHTML = '';
    let tint, ribbon;
    stage.className = 'rv-stage rv-' + r.kind + (r.isNew ? ' new' : '');
    if (r.line) {
      const line = BM.LINES[r.line], f = line.forms[0], rar = BM.rarityOf(r.line);
      tint = TINT[rar.id]; ribbon = (r.kind === 'legendary' ? '✨ LEGENDARY ✨' : rar.name.toUpperCase()) + (r.isNew ? ' · NEW!' : '');
      stage.dataset.line = r.line; stage.dataset.rarity = rar.id; delete stage.dataset.item;
      const cv = document.createElement('canvas'); cv.className = 'rv-mon'; cv.width = 360; cv.height = 300; fig.appendChild(cv);
      const sp = BM.Sprites.get(f), g = cv.getContext('2d'), sc = Math.min(270 / sp.h, 330 / sp.w);
      const draw = (now) => { g.clearRect(0, 0, cv.width, cv.height); const fr = sp.run[Math.floor(now / 110) % sp.run.length];
        g.drawImage(fr, cv.width / 2 - sp.ax * sc, cv.height - 6 - sp.ay * sc, sp.w * sc, sp.h * sc); rvRaf = requestAnimationFrame(draw); };
      rvRaf = requestAnimationFrame(draw);
      plate.innerHTML = `<span class="rv-pname">${line.name}</span><span class="rv-pstars" style="color:${rar.color}">${'★'.repeat(rar.stars)}</span>`;
      const chips = document.createElement('div'); chips.className = 'bc-chips rv-chips';
      // DDD1 (Phase 7.6): the type is its icon + the plain word — no coloured highlight box behind the word (the icon already says it)
      for (const t of f.types) chips.appendChild(BM.typeLabel(t, 'rv-type'));
      const rl = BM.roleLabel(f), rc = document.createElement('span'); rc.className = 'bc-chip role'; rc.textContent = `${rl.icon} ${rl.text}`; chips.appendChild(rc);
      plate.appendChild(chips);
      plate.insertAdjacentHTML('beforeend', r.dupe ? '<span class="rv-ptag">Already a friend! +XP</span>' : '<span class="rv-ptag new">NEW FRIEND!</span>');
      setTimeout(() => BM.Audio.cry(f.id, f.size, 1, 'ui'), 350);
    } else {
      const it = BM.ITEM_INFO[r.item];
      tint = TINT.item; ribbon = r.kind === 'battle' ? 'BATTLE ITEM' : r.kind === 'evo' ? 'EVOLUTION ITEM' : 'XP CANDY';
      stage.dataset.item = r.item; delete stage.dataset.line; stage.dataset.rarity = 'item';
      fig.innerHTML = `<span class="rv-item">${ui.itemIcon(r.item)}</span>`;
      plate.innerHTML = `<span class="rv-pname">${it.name}</span><span class="rv-ptag">${it.blurb || ''}</span>`;
    }
    stage.style.setProperty('--rv-tint', tint);
    $('rv-ribbon').textContent = ribbon;
    $('rv-count').textContent = many ? `${rvAt + 1} / ${lastResults.length}` : '';
    const last = rvAt >= lastResults.length - 1;
    $('btn-rv-next').textContent = last ? (many ? 'See all ▶' : 'OK!') : 'Next ▶';
    show('btn-rv-skip', many && !last);
    // re-trigger the entrance animation
    fig.classList.remove('in'); void fig.offsetWidth; fig.classList.add('in');
  }
  function recap() {
    cancelAnimationFrame(rvRaf);
    const results = lastResults, grid = $('reveal-grid'); grid.innerHTML = '';
    grid.classList.toggle('ten', results.length > 1);
    const best = results.some((r) => r.kind === 'legendary') ? 'legendary' : results.some((r) => r.isNew) ? 'new' : '';
    $('reveal-title').textContent = best === 'legendary' ? '✨ LEGENDARY! ✨' : best === 'new' ? 'New friends!' : 'You got…';
    results.forEach((r, i) => {
      const c = document.createElement('div');
      c.className = 'rv-card rv-' + r.kind + (r.isNew ? ' new' : '') + (r.dupe ? ' dupe' : '');
      c.style.animationDelay = (i * 0.06) + 's';
      if (r.line) {
        const line = BM.LINES[r.line], rar = BM.rarityOf(r.line);
        c.dataset.line = r.line; c.classList.add('rar-' + rar.id);
        c.appendChild(ui.thumb(line.forms[0], 110, false));
        c.insertAdjacentHTML('beforeend', `<span class="rv-stars">${'★'.repeat(rar.stars)}</span><span class="rv-name">${line.name}</span>` +
          (r.dupe ? `<span class="rv-tag">Already a friend! +XP</span>` : '<span class="rv-tag new">NEW!</span>'));
      } else {
        const it = BM.ITEM_INFO[r.item]; c.dataset.item = r.item;
        c.insertAdjacentHTML('beforeend', `<span class="rv-icon">${ui.itemIcon(r.item)}</span><span class="rv-name">${it.name}</span><span class="rv-tag">${r.kind === 'battle' ? 'battle item' : r.kind === 'evo' ? 'evolution item' : 'XP'}</span>`);
      }
      grid.appendChild(c);
    });
    show('rv-stage', false); show('rv-recap', true); ui.fit($('scr-reveal'));
  }
  function closeReveal() { cancelAnimationFrame(rvRaf); BM.Audio.sfx('tap'); show('scr-reveal', false); BM.Audio.playMusic('gacha'); render(); }
  tap($('btn-rv-next'), () => {
    if (rvAt < lastResults.length - 1) { rvAt++; BM.Audio.sfx('tap'); showOne(); return; }
    if (lastResults.length > 1) { BM.Audio.sfx('tap'); recap(); } else closeReveal();
  });
  tap($('btn-rv-skip'), () => { BM.Audio.sfx('tap'); recap(); });
  tap($('btn-reveal-ok'), closeReveal);

  return { render, reveal, recap, get revealAt() { return rvAt; }, get lastResults() { return lastResults; }, setBanner: (id) => { bannerId = id; }, setCurrency: (c) => { currency = c; } };
};
