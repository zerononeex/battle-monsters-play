// All Characters (collection), character detail, item bag and Team (deck + presets) screens. Built by main.js.
// Playtest rule F2: NO screen scrolls — grids size their cards to the viewport, overlays scale to fit (ui.fit).
window.BM = window.BM || {};
BM.Screens = function (ui) {
  const { $, tap, toast, show } = ui;
  const prof = () => BM.Save.profile();

  // ---------- shared helpers ----------
  // Draws a form's first run frame into a canvas; locked forms become a dark silhouette.
  function thumb(form, size, locked) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d'), sp = BM.Sprites.get(form), fr = sp.run[0];
    const s = Math.min((size * 0.92) / sp.h, (size * 0.96) / sp.w);
    g.imageSmoothingEnabled = true;
    g.drawImage(fr, size / 2 - sp.ax * s, size * 0.97 - sp.ay * s, sp.w * s, sp.h * s);
    if (locked) { g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgba(40,40,60,.55)'; g.fillRect(0, 0, size, size); }
    return c;
  }
  function typePills(types) {
    const d = document.createElement('div'); d.className = 'types';
    for (const t of types) {
      const p = document.createElement('span'), icon = BM.Sprites.artSrc('icons/type_' + t);
      p.className = 'type-pill' + (icon ? '' : ' noicon');
      p.style.background = BM.TYPE_COLORS[t];
      p.innerHTML = (icon ? `<img src="${icon}" alt="">` : '') + t;
      d.appendChild(p);
    }
    return d;
  }
  const itemIcon = (id) => { const i = BM.Sprites.artSrc('icons/' + id); return i ? `<img src="${i}" alt="">` : `<span class="emo">${BM.ITEM_INFO[id].emoji}</span>`; };
  // Trait chip (tiny icon + word) so kids learn them; `long` adds the one-line rule.
  function traitChip(form, long) {
    const t = BM.formTrait(form);
    if (!t) return null;
    const d = document.createElement('span'); d.className = 'trait trait-' + t.id;
    d.textContent = `${t.icon} ${t.name}` + (long ? ` — ${BM.traitText(form)}` : '');
    return d;
  }
  // How a locked form is reached, in kid words.
  function unlockText(form) {
    const e = form.evo;
    if (!e) return '';
    if (e.item) return `${BM.ITEMS[e.item]} at Lv ${e.minLevel}+`;
    return `Evolves at Lv ${e.level}`;
  }
  const ownedLines = () => BM.KANTO_LINES.filter((id) => prof().lines[id]);
  // How a not-yet-owned line is met, in kid words.
  function meetText(line) {
    if (line.rewardOnly) return 'Beat the Kanto Champion to meet this legend!';
    const gift = BM.KANTO_STAGES.find((s) => s.gift === line.id && !line.legendary);
    if (gift) return `A gift at ${gift.name}`;
    const banner = BM.BANNERS.find((b) => BM.bannerPool(b).includes(line.id));
    if (line.legendary && banner) return `Legendary — Safari Zone ${banner.name.replace('Kanto ', '')} (or the Legendary Safari Zone)`;
    return banner ? `Safari Zone ${banner.name.replace('Kanto ', '')}` : 'Safari Zone';
  }
  // Sizes a grid's cards so `n` of them fit the element's box without scrolling (F2). aspect = card height / width.
  function fitGrid(el, n, aspect, gap, maxCols) {
    const W = el.clientWidth, H = el.clientHeight;
    let best = { s: 0, c: 1 };
    for (let c = 1; c <= Math.min(n, maxCols || 16); c++) {
      const r = Math.ceil(n / c), w = (W - gap * (c - 1)) / c, h = (H - gap * (r - 1)) / r;
      const s = Math.min(w, h / aspect);
      if (s > best.s) best = { s, c };
    }
    const w = Math.floor(best.s), h = Math.floor(best.s * aspect);
    el.style.gridTemplateColumns = `repeat(${best.c}, ${w}px)`;
    el.style.gridAutoRows = h + 'px';
    el.style.gap = gap + 'px';
    el.style.setProperty('--cw', w + 'px');
    return w;
  }
  // XP progress inside the current level (0..1) on the L³ curve.
  function xpFrac(xp, lv) {
    if (lv >= BM.C.LEVEL_CAP) return 1;
    const a = BM.xpForLevel(lv), b = BM.xpForLevel(lv + 1);
    return Math.max(0, Math.min(1, (xp - a) / (b - a)));
  }

  // ---------- Sort + filter (C4 tweak: one Filter button -> one popup; shared by All Characters and the team picker) ----
  const SORTS = [
    { id: 'rarity', name: '⭐ Rarity' }, { id: 'level', name: '📈 Level' }, { id: 'speed', name: '👟 Speed' },
    { id: 'attack', name: '💥 Attack' }, { id: 'range', name: '🎯 Range' }, { id: 'cost', name: BM.apIcon() + ' AP cost' },
  ];
  const ROLE_CHIPS = [
    ...Object.entries(BM.TRAITS).map(([id, t]) => ({ id, name: `${t.icon} ${t.name}`, test: (f) => f.trait === id })),
    { id: 'far', name: '🏹 Ranged', test: (f, st) => st.range > BM.C.MELEE_RANGE },
    { id: 'close', name: '👊 Close', test: (f, st) => st.range <= BM.C.MELEE_RANGE },
  ];
  const F = { sort: null, desc: true, types: new Set(), roles: new Set(), rarity: new Set(), owned: 'all' };
  const lineForm = (id) => { const l = prof().lines[id]; return BM.FORMS[l ? l.form : BM.LINES[id].forms[0].id]; };
  const lineLevel = (id) => (prof().lines[id] ? prof().lines[id].level : 1);
  function sortValue(id, key) {
    const f = lineForm(id), st = BM.unitStats(f, lineLevel(id));
    return { rarity: BM.rarityOf(id).stars, level: prof().lines[id] ? lineLevel(id) : 0, speed: st.speed, attack: st.dmg, range: st.range, cost: BM.effCost(f, lineLevel(id)) }[key];
  }
  // Applies the filter + sort to a list of line ids. `ownedOnly` = the team picker (the Show section is hidden there).
  function applyFilter(ids, ownedOnly) {
    let out = ids.filter((id) => {
      const owned = !!prof().lines[id], f = lineForm(id), st = BM.unitStats(f, lineLevel(id));
      if (!ownedOnly && F.owned === 'owned' && !owned) return false;
      if (!ownedOnly && F.owned === 'unmet' && owned) return false;
      if (F.types.size && !f.types.some((t) => F.types.has(t))) return false;
      if (F.roles.size && !ROLE_CHIPS.some((r) => F.roles.has(r.id) && r.test(f, st))) return false;
      if (F.rarity.size && !F.rarity.has(BM.rarityOf(id).id)) return false;
      return true;
    });
    if (F.sort) {
      const order = new Map(ids.map((id, i) => [id, i]));
      out = out.slice().sort((x, y) => (sortValue(y, F.sort) - sortValue(x, F.sort)) * (F.desc ? 1 : -1) || order.get(x) - order.get(y));
    }
    return out;
  }
  const filterCount = () => F.types.size + F.roles.size + F.rarity.size + (F.owned !== 'all' ? 1 : 0) + (F.sort ? 1 : 0);
  let filterCtx = null; // { ids, ownedOnly, done }
  function openFilter(ctxArg) {
    filterCtx = ctxArg;
    show('flt-owned-sec', !ctxArg.ownedOnly);
    renderFilter();
    show('scr-filter', true);
    ui.fit($('scr-filter'));
  }
  function chip(box, label, onState, fn, extra) {
    const b = document.createElement('button'); b.className = 'flt-chip' + (onState ? ' on' : '') + (extra ? ' ' + extra : '');
    b.innerHTML = label; tap(b, () => { BM.Audio.sfx('tap'); fn(); renderFilter(); }); box.appendChild(b); return b;
  }
  function renderFilter() {
    const sortBox = $('flt-sort'); sortBox.innerHTML = '';
    for (const so of SORTS) chip(sortBox, so.name, F.sort === so.id, () => { F.sort = F.sort === so.id ? null : so.id; }).dataset.sort = so.id;
    $('flt-dir').textContent = F.desc ? '↓ High first' : '↑ Low first';
    const own = $('flt-owned'); own.innerHTML = '';
    for (const [id, name] of [['all', 'Everyone'], ['owned', '✓ My friends'], ['unmet', '??? Not met yet']]) chip(own, name, F.owned === id, () => { F.owned = id; }).dataset.owned = id;
    const types = $('flt-types'); types.innerHTML = '';
    for (const t of BM.TYPES) {
      const icon = BM.Sprites.artSrc('icons/type_' + t);
      const b = chip(types, (icon ? `<img src="${icon}" alt="">` : '') + `<span>${t}</span>`, F.types.has(t), () => { F.types.has(t) ? F.types.delete(t) : F.types.add(t); }, 'type-chip');
      b.style.setProperty('--tc', BM.TYPE_COLORS[t]); b.dataset.type = t;
    }
    const roles = $('flt-traits'); roles.innerHTML = '';
    for (const r of ROLE_CHIPS) chip(roles, r.name, F.roles.has(r.id), () => { F.roles.has(r.id) ? F.roles.delete(r.id) : F.roles.add(r.id); }).dataset.role = r.id;
    const rar = $('flt-rarity'); rar.innerHTML = '';
    for (const r of BM.RARITIES) chip(rar, '★'.repeat(r.stars) + ' ' + r.name, F.rarity.has(r.id), () => { F.rarity.has(r.id) ? F.rarity.delete(r.id) : F.rarity.add(r.id); }).dataset.rarity = r.id;
    if (filterCtx) $('flt-n').textContent = `(${applyFilter(filterCtx.ids, filterCtx.ownedOnly).length})`;
  }
  tap($('flt-dir'), () => { F.desc = !F.desc; BM.Audio.sfx('tap'); renderFilter(); });
  function closeFilter() { show('scr-filter', false); if (filterCtx && filterCtx.done) filterCtx.done(); updateFilterBadges(); }
  tap($('btn-filter-x'), closeFilter);
  tap($('btn-filter-done'), () => { BM.Audio.sfx('tap'); closeFilter(); });
  tap($('btn-filter-reset'), () => { F.sort = null; F.desc = true; F.types.clear(); F.roles.clear(); F.rarity.clear(); F.owned = 'all'; BM.Audio.sfx('tap'); renderFilter(); });
  $('scr-filter').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-filter') { e.preventDefault(); closeFilter(); } });
  function updateFilterBadges() { const n = filterCount(); for (const el of document.querySelectorAll('.filter-btn .fcount')) el.textContent = n ? ` ${n}` : ''; }

  // A character card (All Characters grid + team picker): rarity stars, Lv, sprite, name, trait + form dots.
  function lineCard(id, ts, cls) {
    const p = prof(), line = BM.LINES[id], l = p.lines[id], f = BM.FORMS[l.form], rar = BM.rarityOf(id);
    const card = document.createElement('button'); card.className = cls + ' rar-' + rar.id; card.dataset.line = id;
    card.innerHTML = `<span class="lv">Lv ${l.level}</span><span class="rar" title="${rar.name}">${'★'.repeat(rar.stars)}</span>`;
    card.appendChild(thumb(f, ts, false));
    const n = document.createElement('span'); n.className = 'coll-name'; n.textContent = f.name; card.appendChild(n);
    const foot = document.createElement('span'); foot.className = 'coll-foot';
    const tc = traitChip(f); if (tc) foot.appendChild(tc);
    const dots = document.createElement('span'); dots.className = 'dots';
    for (const lf of line.forms) { const d = document.createElement('i'); d.className = lf.id === l.form ? 'on' : l.unlocked.includes(lf.id) ? '' : 'lockd'; dots.appendChild(d); }
    if (line.forms.length > 1) foot.appendChild(dots);
    card.appendChild(foot);
    return card;
  }

  // ---------- All Characters (C4 grid; Filter popup) ----------
  function renderCollection() {
    const p = prof(), grid = $('coll-grid');
    grid.innerHTML = '';
    const owned = ownedLines(), ids = applyFilter(BM.KANTO_LINES, false);
    $('coll-count').textContent = `${owned.length} / ${BM.KANTO_LINES.length}`;
    show('btn-dev-unlock', ui.devMode()); show('btn-dev-items', ui.devMode());
    updateFilterBadges();
    // cards are sized for the FULL roster so filtering never makes them jump in size
    const w = fitGrid(grid, BM.KANTO_LINES.length, 1.22, Math.max(4, Math.min(10, Math.round(window.innerWidth / 120))));
    const ts = Math.max(48, Math.min(128, Math.round(w * 0.8)));
    if (!ids.length) { const d = document.createElement('div'); d.className = 'bench-empty'; d.textContent = 'Nobody matches — tap Filter → Reset.'; grid.appendChild(d); }
    for (const id of ids) {
      if (!p.lines[id]) { grid.appendChild(unownedCard(BM.LINES[id], ts)); continue; }
      const card = lineCard(id, ts, 'coll-card');
      if (BM.Save.pendingEvolution(id)) { const b = document.createElement('span'); b.className = 'evo-badge'; b.textContent = 'EVOLVE!'; card.appendChild(b); }
      tap(card, () => { BM.Audio.sfx('tap'); openLine(id, p.lines[id].form); });
      grid.appendChild(card);
    }
  }
  tap($('btn-coll-filter'), () => { BM.Audio.sfx('tap'); openFilter({ ids: BM.KANTO_LINES, ownedOnly: false, done: renderCollection }); });
  // Not owned yet: the base form as a dark silhouette, name hidden, plus how to meet it.
  function unownedCard(line, ts) {
    const card = document.createElement('button'); card.className = 'coll-card unowned'; card.dataset.line = line.id;
    card.appendChild(thumb(line.forms[0], ts, true));
    const n = document.createElement('span'); n.className = 'coll-name'; n.textContent = '???'; card.appendChild(n);
    const h = document.createElement('span'); h.className = 'coll-hint'; const how = meetText(line); h.innerHTML = line.rewardOnly ? '🏆' : how.startsWith('A gift') ? '🎁' : line.legendary ? '✨' : BM.ticketIcon(); card.appendChild(h);
    card.title = meetText(line);
    tap(card, () => { BM.Audio.sfx('deny'); toast(meetText(line)); });
    return card;
  }

  // Battle numbers at the line's level: HP, damage, march speed, reach, EFFECTIVE AP cost (L1) and cooldown (fixed).
  function battleRow(row, f, st, level) {
    row.innerHTML = '';
    const range = st.range > BM.C.MELEE_RANGE ? 'Far' : 'Close';
    for (const [k, v, key] of [['❤️', st.hp], ['💥', st.dmg], ['👟', Math.round(st.speed)], ['🎯', range], [BM.apIcon(), BM.effCost(f, level), 'cost'], ['⏱', f.cd + 's']]) {
      const s2 = document.createElement('span'); s2.className = 'stat'; if (key) s2.dataset.k = key; s2.innerHTML = `${k} <b>${v}</b>`; row.appendChild(s2);
    }
  }
  // ---------- character detail (D1 Pokédex Entry; F1: ✕ / tap outside / Close; fits the viewport) ----------
  const STAT_NAMES = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
  let openId = null, openForm = null;
  function openLine(id, formId) {
    openId = id; openForm = formId;
    const line = BM.LINES[id], l = prof().lines[id], rar = BM.rarityOf(id);
    $('line-title').innerHTML = '';
    $('line-title').append(`${line.name} · Lv ${l.level} `);
    const rs = document.createElement('span'); rs.className = 'rar-tag rar-' + rar.id; rs.textContent = '★'.repeat(rar.stars) + ' ' + rar.name; $('line-title').appendChild(rs);
    const f = BM.FORMS[formId], locked = !l.unlocked.includes(f.id), st = BM.unitStats(f, l.level);
    // LEFT: framed sprite + cry button + types / trait
    const frame = $('dex-frame'); frame.innerHTML = '';
    frame.appendChild(thumb(f, 200, locked));
    const nm = document.createElement('span'); nm.className = 'dex-name'; nm.textContent = locked ? '???' : f.name; frame.appendChild(nm);
    $('btn-cry').disabled = locked;
    const tags = $('dex-tags'); tags.innerHTML = '';
    if (!locked) { tags.appendChild(typePills(f.types)); const tc = traitChip(f, true); if (tc) tags.appendChild(tc); }
    // RIGHT: the six real base stats (Pokédex style, bars) + battle numbers at the line's level
    const box = $('dex-stats'); box.innerHTML = '';
    const bs = BM.BASE_STATS[f.id] || [f.baseHP, 0, 0, 0, 0, f.baseSpe];
    STAT_NAMES.forEach((name, i) => {
      const row = document.createElement('div'); row.className = 'dex-stat'; row.dataset.stat = name;
      const v = locked ? '—' : bs[i], pct = locked ? 0 : Math.min(100, Math.round((bs[i] / 160) * 100));
      row.innerHTML = `<span class="ds-n">${name}</span><span class="ds-v">${v}</span><span class="ds-bar"><i style="width:${pct}%;background:${bs[i] >= 100 ? '#4cc25a' : bs[i] >= 70 ? '#f5c542' : '#f08a50'}"></i></span>`;
      box.appendChild(row);
    });
    const info = $('line-info'); info.innerHTML = '';
    const xp = document.createElement('div'); xp.className = 'xp-line';
    const nextTxt = l.level >= BM.C.LEVEL_CAP ? 'MAX level' : `${(BM.xpForLevel(l.level + 1) - l.xp).toLocaleString()} XP to Lv ${l.level + 1}`;
    xp.innerHTML = `<span class="xp-bar"><i style="width:${Math.round(xpFrac(l.xp, l.level) * 100)}%"></i></span><span>${nextTxt}</span>`;
    info.appendChild(xp);
    if (locked) { const h = document.createElement('div'); h.className = 'dex-locked'; h.textContent = `${unlockText(f)} to meet this character!`; info.appendChild(h); }
    else {
      const row = document.createElement('div'); row.className = 'stat-row battle-row';
      battleRow(row, f, st, l.level);
      info.appendChild(row);
      const cap = document.createElement('div'); cap.className = 'battle-cap'; cap.textContent = l.form === f.id ? 'In battle (this form battles)' : 'In battle';
      info.insertBefore(cap, row);
    }
    // BOTTOM: evolution chain (tap a form to view it) + the item actions on the same row
    const forms = $('line-forms'); forms.innerHTML = '';
    line.forms.forEach((g, i) => {
      if (i > 0) { const ar = document.createElement('span'); ar.className = 'chain-arrow'; ar.textContent = '▶'; forms.appendChild(ar); }
      const lk = !l.unlocked.includes(g.id);
      const b = document.createElement('button');
      b.className = 'line-form' + (lk ? ' locked' : '') + (g.id === formId ? ' sel' : '');
      b.dataset.form = g.id;
      b.appendChild(thumb(g, 72, lk));
      const n = document.createElement('span'); n.className = 'fname'; n.textContent = lk ? '???' : g.name; b.appendChild(n);
      if (lk) {
        const k = document.createElement('span'); k.className = 'lock';
        k.innerHTML = g.evo && g.evo.item ? itemIcon(g.evo.item) + ' ' : '🔒 ';
        k.appendChild(document.createTextNode(unlockText(g)));
        b.appendChild(k);
      }
      tap(b, () => { BM.Audio.sfx('tap'); openLine(id, g.id); });
      forms.appendChild(b);
    });
    renderLineItems(id);
    show('scr-line', true);
    ui.fit($('scr-line'));
  }
  tap($('btn-cry'), () => { if (openForm) { const f = BM.FORMS[openForm]; BM.Audio.cry(f.id, f.size, 1, 'dex'); } });
  // Item buttons on the detail panel: EVOLVE! (a level evolution waiting for its scene), the evolution item for the
  // next form (refused kindly below the §4.6 level floor), XP candies and Rare Candy (counts from the bag).
  function renderLineItems(id) {
    const p = prof(), l = p.lines[id], line = BM.LINES[id], box = $('line-items');
    box.innerHTML = '';
    const btn = (html, cls, fn) => { const b = document.createElement('button'); b.className = 'item-btn ' + (cls || ''); b.innerHTML = html; tap(b, fn); box.appendChild(b); return b; };
    const pend = BM.Save.pendingEvolution(id);
    if (pend) btn(`✨ EVOLVE! → ${pend.name}`, 'evolve', () => ui.playEvolution([{ line: id, from: l.form, to: pend.id }], () => { reopen(); }));
    const next = line.forms.find((f, i) => i > 0 && !l.unlocked.includes(f.id) && l.unlocked.includes(line.forms[i - 1].id));
    if (next && next.evo && next.evo.item) {
      const n = p.items[next.evo.item] || 0;
      btn(`${itemIcon(next.evo.item)} Use ${BM.ITEMS[next.evo.item]} <small>×${n}</small>`, 'stone' + (n ? '' : ' none'), () => use(id, next.evo.item));
    }
    for (const it of ['xp_candy_s', 'xp_candy_m', 'xp_candy_l', 'rare_candy']) {
      const n = p.items[it] || 0;
      if (n) btn(`${itemIcon(it)} ${BM.ITEM_INFO[it].name} <small>×${n}</small>`, 'candy', () => use(id, it));
    }
    if (!box.children.length) { const d = document.createElement('div'); d.className = 'items-none'; d.textContent = 'Win stages to find candies and stones for this character!'; box.appendChild(d); }
  }
  function use(id, itemId) {
    const l = prof().lines[id], from = l.form, r = BM.Save.useItem(id, itemId);
    if (!r.ok) { BM.Audio.sfx('deny'); toast(r.msg); return; }
    if (r.evolveTo) { ui.playEvolution([{ line: id, from, to: r.evolveTo, item: itemId }], reopen); return; }
    BM.Audio.sfx('upgrade'); toast(r.msg);
    reopen();
  }
  function reopen() { if (ui.screen() === 'collection') renderCollection(); if (openId) openLine(openId, prof().lines[openId].form); }
  function closeLine() { show('scr-line', false); openId = null; }
  tap($('btn-line-close'), closeLine);
  tap($('btn-line-x'), closeLine);
  $('scr-line').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-line') { e.preventDefault(); closeLine(); } });
  tap($('btn-coll-back'), () => { BM.Audio.sfx('tap'); ui.go('title'); });
  tap($('btn-dev-unlock'), () => { BM.Save.devUnlockAll(); toast('DEV: every Kanto line + form unlocked (Lv 36)'); renderCollection(); });
  tap($('btn-dev-items'), () => { BM.Save.devGrantItems(); toast('DEV: +5 of every item'); renderCollection(); });

  // ---------- item bag ----------
  function openBag() {
    const p = prof(), grid = $('bag-grid');
    grid.innerHTML = '';
    const cell = (icon, name, n, blurb, soon) => {
      const d = document.createElement('div'); d.className = 'bag-item' + (n ? '' : ' empty');
      d.innerHTML = `<span class="bi-icon">${icon}</span><span class="bi-n">×${n}</span><span class="bi-name"></span><span class="bi-blurb"></span>` + (soon ? '<span class="soon">coming soon</span>' : '');
      d.querySelector('.bi-name').textContent = name; d.querySelector('.bi-blurb').textContent = blurb;
      grid.appendChild(d);
    };
    cell(BM.ticketIcon(), 'Battle Tickets', p.tickets, '10 = one Safari Zone pull', false);
    for (const id of BM.BAG_ORDER) {
      const it = BM.ITEM_INFO[id], n = p.items[id] || 0;
      if (!n && it.kind === 'evo' && !['thunder_stone', 'fire_stone', 'water_stone', 'moon_stone', 'leaf_stone', 'ice_stone', 'metal_coat'].includes(id)) continue;
      if (!n && id === 'master_ball') continue;
      cell(itemIcon(id), it.name, n, it.blurb, it.soon);
    }
    show('scr-bag', true);
    ui.fit($('scr-bag'));
  }
  const closeBag = () => show('scr-bag', false);
  tap($('btn-bag-x'), closeBag);
  $('scr-bag').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-bag') { e.preventDefault(); closeBag(); } });
  tap($('btn-coll-bag'), () => { BM.Audio.sfx('tap'); openBag(); });

  // ---------- Team builder TA (Phase 7 fix-first; replaces the T3 circles + picker popup) ----------
  // Header: ◀ name ▶ (preset arrows) + ✏️ rename + buy slot. Middle: the 10 slots (tap = select · tap the selected one
  // again = next form · ✕ = off). Bottom: owned Pokémon strip, scrolling LEFT–RIGHT inside itself (tap = place in the
  // selected slot). Press-and-hold a block or a slot = stats peek.
  let selSlot = 0;
  const HOLD_MS = 450;
  // pointer helper: tap fires on release (so a press-and-hold can become a peek, and a horizontal drag scrolls the strip)
  function tapOrHold(el, onTap, onHold) {
    let t = 0, timer = 0, x0 = 0, y0 = 0, moved = false, held = false;
    el.addEventListener('pointerdown', (e) => {
      BM.Audio.unlock(); t = performance.now(); x0 = e.clientX; y0 = e.clientY; moved = false; held = false;
      clearTimeout(timer); timer = setTimeout(() => { if (!moved) { held = true; onHold(e); } }, HOLD_MS);
    });
    el.addEventListener('pointermove', (e) => { if (Math.hypot(e.clientX - x0, e.clientY - y0) > 12) { moved = true; clearTimeout(timer); } });
    el.addEventListener('pointerup', (e) => { clearTimeout(timer); if (t && !moved && !held) onTap(e); t = 0; });
    for (const ev of ['pointercancel', 'pointerleave']) el.addEventListener(ev, () => { clearTimeout(timer); t = 0; });
  }
  function renderTeam() {
    const p = prof(), deck = $('deck');
    deck.innerHTML = '';
    if (selSlot > p.team.length) selSlot = p.team.length;
    if (selSlot >= BM.TEAM_SIZE) selSlot = BM.TEAM_SIZE - 1;
    $('team-name').textContent = BM.Save.loadoutName(p.loadoutAt);
    $('team-count').textContent = `${p.team.length} / ${BM.TEAM_SIZE}`;
    $('team-presets').textContent = `${p.loadoutAt + 1} of ${p.loadoutSlots}`;
    for (let i = 0; i < BM.TEAM_SIZE; i++) {
      const id = p.team[i];
      const el = document.createElement('button'); el.dataset.slot = i;
      const sel = i === selSlot ? ' sel' : '';
      if (!id) {
        el.className = 'deck-slot empty' + sel; el.innerHTML = '<span>＋</span>';
        tap(el, () => { BM.Audio.sfx('tap'); selSlot = Math.min(i, p.team.length); renderTeam(); });
        deck.appendChild(el); continue;
      }
      const line = BM.LINES[id], l = p.lines[id], f = BM.FORMS[l.form], rar = BM.rarityOf(id);
      el.className = 'deck-slot rar-' + rar.id + sel; el.dataset.line = id;
      el.innerHTML = `<span class="slv">Lv ${l.level}</span>`;
      el.appendChild(thumb(f, 120, false));
      const n = document.createElement('span'); n.className = 'dname'; n.textContent = f.name; el.appendChild(n);
      const dots = document.createElement('span'); dots.className = 'dots';
      for (const lf of line.forms) { const d = document.createElement('i'); d.className = lf.id === l.form ? 'on' : l.unlocked.includes(lf.id) ? '' : 'lockd'; dots.appendChild(d); }
      el.appendChild(dots);
      const c = document.createElement('span'); c.className = 'dcost'; c.innerHTML = BM.apIcon() + BM.effCost(f, l.level); el.appendChild(c);
      const rm = document.createElement('span'); rm.className = 'rm'; rm.textContent = '✕'; el.appendChild(rm);
      tapOrHold(el, (e) => {
        const r = rm.getBoundingClientRect(), pad = 6; // ✕ is a child with pointer-events: none — hit-test its box
        if (e.clientX >= r.left - pad && e.clientX <= r.right + pad && e.clientY >= r.top - pad && e.clientY <= r.bottom + pad) { removeFromTeam(id); return; }
        if (selSlot === i) cycleForm(id); else { BM.Audio.sfx('tap'); selSlot = i; renderTeam(); }
      }, () => peek(id));
      deck.appendChild(el);
    }
    const total = p.team.reduce((a, id) => a + BM.effCost(BM.FORMS[p.lines[id].form], p.lines[id].level), 0);
    $('team-sum').innerHTML = `${p.team.length} Pokémon · ${BM.apIcon()} ${total.toLocaleString()} AP to field everyone once`;
    const L = BM.Save.LOADOUT;
    $('btn-buy-preset').innerHTML = p.loadoutSlots < L.MAX ? `＋ Team slot ${BM.ticketIcon()}${L.PRICE}` : 'All 20 slots';
    $('btn-buy-preset').classList.toggle('maxed', p.loadoutSlots >= L.MAX);
    renderStrip();
  }
  // Tap the selected slot again = the next unlocked form battles (Battle Cats form cycle).
  function cycleForm(id) {
    const l = prof().lines[id], forms = BM.LINES[id].forms.filter((g) => l.unlocked.includes(g.id));
    if (forms.length < 2) { BM.Audio.sfx('tap'); toast('Hold to see stats · ✕ takes it off'); return; }
    const g = forms[(forms.findIndex((x) => x.id === l.form) + 1) % forms.length];
    BM.Save.setForm(id, g.id); BM.Audio.cry(g.id, g.size, 1, 'ui'); toast(`${g.name} will battle!`); renderTeam();
  }
  // Bottom strip: every owned Pokémon (after the Filter) as a block — image + name + level. Only the strip scrolls.
  function renderStrip() {
    const p = prof(), strip = $('ta-strip'), keep = strip.scrollLeft;
    strip.innerHTML = '';
    updateFilterBadges();
    const occ = p.team[selSlot];
    $('ta-box-title').textContent = occ ? `PC Box — tap to swap slot ${selSlot + 1} (${BM.FORMS[p.lines[occ].form].name})` : `PC Box — tap to put in slot ${selSlot + 1}`;
    const ids = applyFilter(ownedLines(), true);
    const ts = Math.max(44, Math.min(110, Math.round(strip.clientHeight * 0.62)));
    if (!ids.length) { const d = document.createElement('div'); d.className = 'bench-empty'; d.textContent = 'Nobody matches — tap Filter → Reset.'; strip.appendChild(d); }
    for (const id of ids) {
      const l = p.lines[id], f = BM.FORMS[l.form], rar = BM.rarityOf(id);
      const b = document.createElement('button'); b.className = 'ta-block rar-' + rar.id; b.dataset.line = id;
      b.innerHTML = `<span class="lv">Lv ${l.level}</span>`;
      b.appendChild(thumb(f, ts, false));
      const n = document.createElement('span'); n.className = 'tb-name'; n.textContent = f.name; b.appendChild(n);
      const at = p.team.indexOf(id);
      if (at >= 0) { b.classList.add('on-team'); const t = document.createElement('span'); t.className = 'on-team-tag'; t.textContent = `slot ${at + 1}`; b.appendChild(t); }
      tapOrHold(b, () => place(id), () => peek(id));
      strip.appendChild(b);
    }
    strip.scrollLeft = keep;
  }
  function place(id) {
    const p = prof(), r = BM.Save.placeInTeam(selSlot, id);
    if (r === 'none') { BM.Audio.sfx('deny'); toast('Your team is full — pick a slot to swap!'); return; }
    if (r === 'same') { BM.Audio.sfx('tap'); return; }
    const f = BM.FORMS[p.lines[id].form]; BM.Audio.cry(f.id, f.size, 1, 'ui');
    toast(`${f.name} joins slot ${p.team.indexOf(id) + 1}!`);
    if (p.team.length < BM.TEAM_SIZE && selSlot < BM.TEAM_SIZE - 1 && p.team[selSlot] === id && selSlot === p.team.length - 1) selSlot = p.team.length; // next empty slot
    renderTeam();
  }
  // Stats peek (mini D1): press-and-hold a block or a slot.
  function peek(id) {
    const l = prof().lines[id], f = BM.FORMS[l.form], st = BM.unitStats(f, l.level), rar = BM.rarityOf(id);
    BM.Audio.sfx('tap');
    $('peek-title').textContent = `${f.name} · Lv ${l.level} · ${'★'.repeat(rar.stars)}`;
    const left = $('peek-left'); left.innerHTML = '';
    left.appendChild(thumb(f, 150, false)); left.appendChild(typePills(f.types));
    const tc = traitChip(f, true); if (tc) left.appendChild(tc);
    const box = $('peek-stats'); box.innerHTML = '';
    const bs = BM.BASE_STATS[f.id] || [f.baseHP, 0, 0, 0, 0, f.baseSpe];
    STAT_NAMES.forEach((name, i) => {
      const row = document.createElement('div'); row.className = 'dex-stat';
      row.innerHTML = `<span class="ds-n">${name}</span><span class="ds-v">${bs[i]}</span><span class="ds-bar"><i style="width:${Math.min(100, Math.round(bs[i] / 160 * 100))}%;background:${bs[i] >= 100 ? '#4cc25a' : bs[i] >= 70 ? '#f5c542' : '#f08a50'}"></i></span>`;
      box.appendChild(row);
    });
    battleRow($('peek-battle'), f, st, l.level);
    show('scr-peek', true); ui.fit($('scr-peek'));
  }
  const closePeek = () => show('scr-peek', false);
  tap($('btn-peek-x'), closePeek);
  $('scr-peek').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-peek') { e.preventDefault(); closePeek(); } });
  function flipTeam(k) {
    const p = prof(), n = p.loadoutSlots, i = (p.loadoutAt + k + n) % n, empty = !p.loadouts[i];
    BM.Save.switchLoadout(i); BM.Audio.sfx('tap'); selSlot = 0;
    toast(empty ? `${BM.Save.loadoutName(i)} — a copy to change as you like` : `${BM.Save.loadoutName(i)}!`); renderTeam();
  }
  tap($('btn-team-prev'), () => flipTeam(-1));
  tap($('btn-team-next'), () => flipTeam(1));
  tap($('btn-buy-preset'), () => {
    const p = prof(), L = BM.Save.LOADOUT, r = BM.Save.buyLoadoutSlot();
    if (r === 'ok') { BM.Audio.sfx('upgrade'); toast(`Team slot ${p.loadoutSlots} unlocked! Use ▶ to get there.`); renderTeam(); }
    else { BM.Audio.sfx('deny'); toast(r === 'tickets' ? `A new team slot costs ${L.PRICE} tickets — you have ${p.tickets}.` : 'All 20 team slots unlocked!'); }
  });
  tap($('btn-team-rename'), () => {
    BM.Audio.sfx('tap'); $('rename-input').value = BM.Save.loadoutName(prof().loadoutAt);
    show('scr-rename', true); ui.fit($('scr-rename'));
  });
  function doRename() {
    $('rename-input').blur(); BM.Save.renameLoadout(prof().loadoutAt, $('rename-input').value);
    show('scr-rename', false); BM.Audio.sfx('upgrade'); renderTeam();
  }
  tap($('btn-rename-ok'), doRename);
  tap($('btn-rename-cancel'), () => { $('rename-input').blur(); show('scr-rename', false); });
  $('rename-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') doRename(); });
  tap($('btn-team-filter'), () => { BM.Audio.sfx('tap'); openFilter({ ids: ownedLines(), ownedOnly: true, done: renderStrip }); });
  function removeFromTeam(id) {
    if (!BM.Save.removeFromTeam(id)) { BM.Audio.sfx('deny'); toast('Your team needs at least one Pokémon!'); return; }
    BM.Audio.sfx('tap'); renderTeam();
  }
  tap($('btn-team-back'), () => { BM.Audio.sfx('tap'); ui.teamBack(); });

  return { renderCollection, renderTeam, place, peek, selectSlot: (i) => { selSlot = i; renderTeam(); }, get selSlot() { return selSlot; }, applyFilter, filterState: F, thumb, openBag, openLine, traitChip, itemIcon, xpFrac };
};
