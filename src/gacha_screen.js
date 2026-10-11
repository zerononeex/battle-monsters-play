// Gacha screen (Phase 5): banner tabs, banner card (its two legendaries + pool + pity counter), currency picker (tickets
// or Poké Balls, both balances shown), Pull ×1 / ×10, Master Ball trade, Legendary Gacha, and the reveal. Rules: gacha.js.
window.BM = window.BM || {};
BM.GachaScreen = function (ui) {
  const { $, tap, toast, show } = ui;
  const G = BM.GACHA, Ga = BM.Gacha;
  const prof = () => BM.Save.profile();
  let bannerId = BM.BANNERS[0].id, currency = 'tickets';
  const icon = (key, emo) => { const s = BM.Sprites.artSrc('icons/' + key); return s ? `<img src="${s}" alt="">` : emo; };
  const TK = () => icon('battle_ticket', '🎫'), PB = () => icon('poke_ball', '🔴'), MB = () => icon('master_ball', '🟣');
  const legendNames = (b) => b.legendaries.map((id) => BM.LINES[id].name).join(' or ');

  function render() {
    const p = prof(), b = Ga.banner(bannerId);
    ui.renderWallet();
    // tabs
    const tabs = $('banner-tabs'); tabs.innerHTML = '';
    for (const bb of BM.BANNERS) {
      const t = document.createElement('button'); t.className = 'banner-tab' + (bb.id === bannerId ? ' on' : ''); t.dataset.banner = bb.id;
      t.innerHTML = `<span class="bt-name">${bb.name.replace('Kanto ', '')}</span><span class="bt-leg">${bb.legendaries.map((id) => BM.LINES[id].name).join(' + ')}</span>`;
      tap(t, () => { bannerId = bb.id; BM.Audio.sfx('tap'); render(); });
      tabs.appendChild(t);
    }
    // banner card: the two legendaries big, the pool as a strip (silhouettes = not met yet), the pity counter
    const card = $('banner-card'); card.innerHTML = ''; card.dataset.banner = b.id;
    // H3: the banner's generated key art (assets/ui/banners/<id>.png, ASSET_PROMPTS #250–#251) takes over the panel when DONE
    const key = BM.Sprites.artSrc('ui/banner_' + b.id);
    card.style.backgroundImage = key ? `linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.35)), url("${key}")` : '';
    card.classList.toggle('has-art', !!key);
    const legs = document.createElement('div'); legs.className = 'bc-legs';
    for (const id of b.legendaries) {
      const d = document.createElement('div'); d.className = 'bc-leg';
      d.appendChild(ui.thumb(BM.LINES[id].forms[0], 170, false));
      const n = document.createElement('span'); n.className = 'bc-name'; n.textContent = BM.LINES[id].name + (p.lines[id] ? ' ✓' : ''); d.appendChild(n);
      // H3: TYPE icons + ROLE label as chips under each legendary
      const f = BM.LINES[id].forms[0], chips = document.createElement('div'); chips.className = 'bc-chips'; chips.dataset.line = id;
      for (const t of f.types) {
        const ic = BM.Sprites.artSrc('icons/type_' + t), c = document.createElement('span');
        c.className = 'bc-chip type'; c.dataset.type = t; c.style.background = BM.TYPE_COLORS[t];
        c.innerHTML = (ic ? `<img src="${ic}" alt="">` : '') + t; chips.appendChild(c);
      }
      const rl = BM.roleLabel(f), rc = document.createElement('span'); rc.className = 'bc-chip role'; rc.textContent = `${rl.icon} ${rl.text}`; chips.appendChild(rc);
      d.appendChild(chips);
      legs.appendChild(d);
    }
    card.appendChild(legs);
    const pity = document.createElement('div'); pity.className = 'bc-pity'; pity.id = 'pity-text';
    const left = Ga.pityLeft(b.id);
    pity.innerHTML = `<b>${legendNames(b)}</b> guaranteed in <b class="pity-n">${left}</b> pull${left === 1 ? '' : 's'}!`;
    card.appendChild(pity);
    const bar = document.createElement('div'); bar.className = 'bc-bar'; bar.innerHTML = `<i style="width:${Math.round((G.PITY - left) / G.PITY * 100)}%"></i>`; card.appendChild(bar);
    const pool = document.createElement('div'); pool.className = 'bc-pool';
    for (const id of Ga.commons(b)) {
      const owned = !!p.lines[id], c = ui.thumb(BM.LINES[id].forms[0], 56, !owned);
      c.title = owned ? BM.LINES[id].name : '???'; c.dataset.line = id; pool.appendChild(c);
    }
    card.appendChild(pool);
    const odds = document.createElement('div'); odds.className = 'bc-odds';
    odds.textContent = `Legendary 2% · Pokémon 30% · XP candy 45% · battle item 17% · evolution item 8% · new friends first!`;
    card.appendChild(odds);
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
    $('btn-legend').innerHTML = `${MB()} Legendary Gacha <small>${mbs ? `×${mbs} Master Ball${mbs > 1 ? 's' : ''}` : '🔒 needs a Master Ball'}</small>`;
    $('btn-legend').disabled = !mbs;
  }
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
    BM.Audio.sfx('upgrade'); toast('You got a Master Ball! The Legendary Gacha is open.'); render();
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
  const closeLegend = () => show('scr-legend', false);
  tap($('btn-legend-x'), closeLegend);
  $('scr-legend').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-legend') { e.preventDefault(); closeLegend(); } });

  // ---------- reveal ----------
  let lastResults = [];
  function reveal(results) {
    lastResults = results;
    BM.Audio.playMusic('gacha_fanfare');
    const grid = $('reveal-grid'); grid.innerHTML = '';
    grid.classList.toggle('ten', results.length > 1);
    const best = results.some((r) => r.kind === 'legendary') ? 'legendary' : results.some((r) => r.isNew) ? 'new' : '';
    $('reveal-title').textContent = best === 'legendary' ? '✨ LEGENDARY! ✨' : best === 'new' ? 'A new friend!' : 'You got…';
    results.forEach((r, i) => {
      const c = document.createElement('div');
      c.className = 'rv-card rv-' + r.kind + (r.isNew ? ' new' : '') + (r.dupe ? ' dupe' : '');
      c.style.animationDelay = (i * 0.12) + 's';
      if (r.line) {
        const line = BM.LINES[r.line], rar = BM.rarityOf(r.line);
        c.dataset.line = r.line; c.classList.add('rar-' + rar.id);
        c.appendChild(ui.thumb(line.forms[0], 110, false));
        c.insertAdjacentHTML('beforeend', `<span class="rv-stars">${'★'.repeat(rar.stars)}</span><span class="rv-name">${line.name}</span>` +
          (r.dupe ? `<span class="rv-tag">Already a friend! +XP</span>` : `<span class="rv-tag new">NEW!${r.pity ? ' (pity)' : ''}</span>`));
      } else {
        const it = BM.ITEM_INFO[r.item]; c.dataset.item = r.item;
        c.insertAdjacentHTML('beforeend', `<span class="rv-icon">${ui.itemIcon(r.item)}</span><span class="rv-name">${it.name}</span><span class="rv-tag">${r.kind === 'battle' ? 'battle item' : r.kind === 'evo' ? 'evolution item' : 'XP'}</span>`);
      }
      grid.appendChild(c);
    });
    show('scr-reveal', true); ui.fit($('scr-reveal'));
    if (results.some((r) => r.line)) setTimeout(() => { const r = results.find((x) => x.line); const f = BM.LINES[r.line].forms[0]; BM.Audio.cry(f.id, f.size, 1, 'ui'); }, 600);
  }
  tap($('btn-reveal-ok'), () => { BM.Audio.sfx('tap'); show('scr-reveal', false); BM.Audio.playMusic('gacha'); render(); });

  return { render, reveal, get lastResults() { return lastResults; }, setBanner: (id) => { bannerId = id; }, setCurrency: (c) => { currency = c; } };
};
