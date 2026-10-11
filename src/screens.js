// Collection ("Friends") and Team (deck) screens. Built by main.js with its UI helpers.
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
  // How a locked form is reached, in kid words.
  function unlockText(form) {
    const e = form.evo;
    if (!e) return '';
    if (e.item) return `${BM.ITEMS[e.item]} at Lv ${e.minLevel}+`;
    return `Evolves at Lv ${e.level}`;
  }
  function itemIcon(form) {
    return form.evo && form.evo.item ? BM.Sprites.artSrc('icons/' + form.evo.item) : null;
  }
  const ownedLines = () => BM.KANTO_LINES.filter((id) => prof().lines[id]);
  // How a not-yet-owned line is met, in kid words.
  function meetText(line) {
    if (line.rewardOnly) return '??? Beat the Kanto Champion to meet this legend!';
    const gift = BM.KANTO_STAGES.find((s) => s.gift === line.id && !line.legendary);
    if (gift) return `🎁 A gift at ${gift.name}`;
    const banner = BM.BANNERS.find((b) => BM.bannerPool(b).includes(line.id));
    if (line.legendary && banner) return `✨ Legendary — ${banner.name} (Gacha, coming soon)`;
    return banner ? `🎟 ${banner.name} (Gacha, coming soon)` : '🎟 Gacha (coming soon)';
  }

  // ---------- collection ----------
  function renderCollection() {
    const p = prof(), grid = $('coll-grid');
    grid.innerHTML = '';
    const owned = ownedLines();
    $('coll-count').textContent = `${owned.length} / ${BM.KANTO_LINES.length}`;
    show('btn-dev-unlock', ui.devMode());
    for (const id of BM.KANTO_LINES) {
      if (!p.lines[id]) { grid.appendChild(unownedCard(BM.LINES[id])); continue; }
      const line = BM.LINES[id], l = p.lines[id];
      const card = document.createElement('button'); card.className = 'coll-card'; card.dataset.line = id;
      card.innerHTML = `<div class="coll-top"><span class="coll-name"></span><span class="lv">Lv ${l.level}</span></div>`;
      card.querySelector('.coll-name').textContent = line.name;
      const row = document.createElement('div'); row.className = 'coll-forms';
      for (const f of line.forms) {
        const locked = !l.unlocked.includes(f.id);
        const t = document.createElement('div');
        t.className = 'form-thumb' + (locked ? ' locked' : '') + (l.form === f.id ? ' fielded' : '');
        t.appendChild(thumb(f, 96, locked));
        const n = document.createElement('span'); n.className = 'fname'; n.textContent = locked ? '???' : f.name; t.appendChild(n);
        if (locked) { const k = document.createElement('span'); k.className = 'lock'; k.textContent = '🔒 ' + unlockText(f); t.appendChild(k); }
        row.appendChild(t);
      }
      card.appendChild(row);
      card.appendChild(typePills(line.forms[0].types));
      tap(card, () => { BM.Audio.sfx('tap'); openLine(id, l.form); });
      grid.appendChild(card);
    }
  }
  // Not owned yet: the whole line as dark silhouettes, names hidden, plus how to meet it.
  function unownedCard(line) {
    const card = document.createElement('button'); card.className = 'coll-card unowned'; card.dataset.line = line.id;
    card.innerHTML = '<div class="coll-top"><span class="coll-name">???</span></div>';
    const row = document.createElement('div'); row.className = 'coll-forms';
    for (const f of line.forms) {
      const t = document.createElement('div'); t.className = 'form-thumb locked';
      t.appendChild(thumb(f, 96, true));
      const n = document.createElement('span'); n.className = 'fname'; n.textContent = '???'; t.appendChild(n);
      row.appendChild(t);
    }
    card.appendChild(row);
    const h = document.createElement('div'); h.className = 'coll-hint'; h.textContent = meetText(line); card.appendChild(h);
    tap(card, () => { BM.Audio.sfx('deny'); toast(meetText(line)); });
    return card;
  }
  function openLine(id, formId) {
    const line = BM.LINES[id], l = prof().lines[id];
    $('line-title').textContent = `${line.name} · Lv ${l.level}`;
    const forms = $('line-forms'); forms.innerHTML = '';
    for (const f of line.forms) {
      const locked = !l.unlocked.includes(f.id);
      const b = document.createElement('button');
      b.className = 'line-form' + (locked ? ' locked' : '') + (f.id === formId ? ' sel' : '');
      b.appendChild(thumb(f, 120, locked));
      const n = document.createElement('span'); n.className = 'fname'; n.textContent = locked ? '???' : f.name; b.appendChild(n);
      if (locked) {
        const k = document.createElement('span'); k.className = 'lock';
        const icon = itemIcon(f);
        k.innerHTML = (icon ? `<img src="${icon}" alt="" style="height:28px;vertical-align:middle"> ` : '🔒 ');
        k.appendChild(document.createTextNode(unlockText(f)));
        b.appendChild(k);
      }
      tap(b, () => { BM.Audio.sfx('tap'); openLine(id, f.id); });
      forms.appendChild(b);
    }
    const f = BM.FORMS[formId], locked = !l.unlocked.includes(f.id), st = BM.unitStats(f, l.level);
    const info = $('line-info'); info.innerHTML = '';
    const head = document.createElement('div'); head.style.marginBottom = '8px';
    head.textContent = locked ? `${unlockText(f)} to meet this friend!` : `${f.name} at Lv ${l.level}${l.form === f.id ? ' — on your team in this form' : ''}`;
    info.appendChild(head);
    if (!locked) {
      info.appendChild(typePills(f.types));
      const row = document.createElement('div'); row.className = 'stat-row'; row.style.marginTop = '8px';
      const range = st.range > BM.C.MELEE_RANGE ? 'Far' : 'Close';
      for (const [k, v] of [['❤️ HP', st.hp], ['💥 Power', st.dmg], ['👟 Speed', Math.round(st.speed)], ['🎯 Reach', range], ['⚡ AP', f.cost], ['⏱ Recharge', f.cd + 's']]) {
        const s = document.createElement('span'); s.className = 'stat'; s.innerHTML = `${k} <b>${v}</b>`; row.appendChild(s);
      }
      info.appendChild(row);
    }
    show('scr-line', true);
  }
  tap($('btn-line-close'), () => { show('scr-line', false); });
  tap($('btn-coll-back'), () => { BM.Audio.sfx('tap'); ui.go('title'); });
  tap($('btn-dev-unlock'), () => { BM.Save.devUnlockAll(); toast('DEV: every Kanto line + form unlocked (Lv 36)'); renderCollection(); });

  // ---------- team (deck) ----------
  function renderTeam() {
    const p = prof(), deck = $('deck'), bench = $('bench');
    deck.innerHTML = ''; bench.innerHTML = '';
    $('team-count').textContent = `${p.team.length} / ${BM.TEAM_SIZE}`;
    for (let i = 0; i < BM.TEAM_SIZE; i++) {
      const id = p.team[i];
      const el = document.createElement('button');
      if (!id) {
        el.className = 'deck-slot empty'; el.textContent = '＋';
        tap(el, () => toast('Tap a friend below to add them!'));
        deck.appendChild(el); continue;
      }
      const line = BM.LINES[id], l = p.lines[id], f = BM.FORMS[l.form];
      el.className = 'deck-slot'; el.dataset.line = id;
      el.innerHTML = `<span class="slotno">${i + 1}</span>`;
      el.appendChild(thumb(f, 120, false));
      const n = document.createElement('span'); n.className = 'dname'; n.textContent = f.name; el.appendChild(n);
      const dots = document.createElement('span'); dots.className = 'dots';
      for (const lf of line.forms) {
        const d = document.createElement('i');
        d.className = lf.id === l.form ? 'on' : l.unlocked.includes(lf.id) ? '' : 'lockd';
        dots.appendChild(d);
      }
      el.appendChild(dots);
      const c = document.createElement('span'); c.className = 'dcost'; c.textContent = '⚡' + f.cost; el.appendChild(c);
      const rm = document.createElement('span'); rm.className = 'rm'; rm.textContent = '✕'; el.appendChild(rm);
      tap(rm, (e) => { e.stopPropagation(); removeFromTeam(id); });
      tap(el, (e) => { if (e.target === rm) return; cycleForm(id); });
      deck.appendChild(el);
    }
    const benchIds = ownedLines().filter((id) => !p.team.includes(id));
    if (!benchIds.length) { const d = document.createElement('div'); d.className = 'bench-empty'; d.textContent = 'Everyone you own is on the team!'; bench.appendChild(d); }
    for (const id of benchIds) {
      const l = p.lines[id], f = BM.FORMS[l.form];
      const b = document.createElement('button'); b.className = 'bench-card'; b.dataset.line = id;
      b.appendChild(thumb(f, 110, false));
      const n = document.createElement('span'); n.className = 'dname'; n.textContent = f.name; b.appendChild(n);
      tap(b, () => addToTeam(id));
      bench.appendChild(b);
    }
  }
  // Tap a deck slot: field the next UNLOCKED form of that line (shared line level; baby forms stay fieldable).
  function cycleForm(id) {
    const l = prof().lines[id], forms = BM.LINES[id].forms.map((f) => f.id).filter((f) => l.unlocked.includes(f));
    if (forms.length < 2) { BM.Audio.sfx('deny'); toast(`${BM.FORMS[l.form].name} has no other form yet — level up to evolve!`); return; }
    const next = forms[(forms.indexOf(l.form) + 1) % forms.length];
    BM.Save.setForm(id, next);
    BM.Audio.cry(next, BM.FORMS[next].size);
    toast(`${BM.FORMS[next].name} will battle!`);
    renderTeam();
  }
  function addToTeam(id) {
    const p = prof();
    if (p.team.length >= BM.TEAM_SIZE) { BM.Audio.sfx('deny'); toast('Team is full (10) — tap ✕ on someone first'); return; }
    p.team.push(id); BM.Save.persist(); BM.Audio.sfx('tap'); renderTeam();
  }
  function removeFromTeam(id) {
    const p = prof();
    if (p.team.length <= 1) { BM.Audio.sfx('deny'); toast('Your team needs at least one Pokémon!'); return; }
    p.team = p.team.filter((t) => t !== id); BM.Save.persist(); BM.Audio.sfx('tap'); renderTeam();
  }
  tap($('btn-team-back'), () => { BM.Audio.sfx('tap'); ui.teamBack(); });

  return { renderCollection, renderTeam, cycleForm, thumb };
};
