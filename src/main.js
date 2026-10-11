// Screens, HUD, input and the main loop.
(function () {
  const $ = (id) => document.getElementById(id);
  const C = BM.C;
  const canvas = $('field');
  const R = BM.Render(canvas);
  let B = null;            // current battle
  let paused = false;
  let screen = 'profiles';
  let devMode = /[?&]dev\b/.test(location.search);
  let settingsFrom = null; // 'title' | 'battle'
  let teamFrom = 'title';  // where the team screen's back button goes ('title' | 'prebattle')
  let preStage = null;     // stage id shown on the pre-battle screen

  const show = (id, on = true) => $(id).classList.toggle('hidden', !on);
  function go(name) {
    screen = name;
    show('scr-profiles', name === 'profiles');
    show('scr-title', name === 'title');
    show('scr-map', name === 'map');
    show('scr-prebattle', name === 'prebattle');
    show('scr-battle', name === 'battle');
    show('scr-collection', name === 'collection');
    show('scr-team', name === 'team');
    show('scr-gacha', name === 'gacha');
    show('scr-challenge', name === 'challenge'); // Phase 6: no music change — the screen you came from keeps playing
    show('scr-chmode', false); show('scr-chover', false);
    if (name !== 'challenge') BM.Speech.stop();
    show('scr-result', false); show('scr-pause', false); show('scr-bag', false); show('scr-line', false); show('scr-filter', false); show('scr-picker', false); show('scr-reveal', false); show('scr-legend', false);
    canvas.style.visibility = name === 'battle' ? 'visible' : 'hidden';
    if (name === 'profiles') { BM.Audio.playMusic('title'); renderProfiles(); }
    if (name === 'title') { BM.Audio.playMusic('title'); renderChip(); renderRegions(); }
    // music by screen: map = map_kanto, pre-battle = the stage's town key, battle = its category key (startBattle)
    if (name === 'map') { BM.Audio.playMusic('map_kanto'); show('btn-map-dev', devMode); KMap.render(); }
    if (name === 'prebattle') renderPrebattle();
    if (name === 'collection') { BM.Audio.playMusic('team'); Scr.renderCollection(); }
    if (name === 'team') { BM.Audio.playMusic('team'); Scr.renderTeam(); }
    if (name === 'gacha') { BM.Audio.playMusic('gacha'); Gacha.render(); }
  }
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1800); }

  // fast, reliable taps on iPad: act on pointerdown for game controls
  function tap(el, fn) { el.addEventListener('pointerdown', (e) => { e.preventDefault(); BM.Audio.unlock(); fn(e); }); }

  // ---------- profile + settings ----------
  function prof() { return BM.Save.profile(); }
  function applySettings() {
    const s = prof() ? prof().settings : { music: true, sound: true };
    BM.Audio.setMusic(s.music); BM.Audio.setSound(s.sound);
    $('tg-music').innerHTML = `🎵 Music: <b>${s.music ? 'ON' : 'OFF'}</b>`; $('tg-music').classList.toggle('off', !s.music);
    $('tg-sound').innerHTML = `🔊 Sound: <b>${s.sound ? 'ON' : 'OFF'}</b>`; $('tg-sound').classList.toggle('off', !s.sound);
    applySliders();
  }
  // Phase 6: per-profile mistake allowances for challenges (sliders)
  function applySliders() {
    const s = prof() ? prof().settings : { mathMistakes: 2, spellMistakes: 3 };
    $('sl-math').value = s.mathMistakes; $('sl-math-v').textContent = s.mathMistakes;
    $('sl-spell').value = s.spellMistakes; $('sl-spell-v').textContent = s.spellMistakes;
  }
  for (const [id, key] of [['sl-math', 'mathMistakes'], ['sl-spell', 'spellMistakes']]) {
    $(id).addEventListener('input', () => { if (!prof()) return; BM.Save.setMistakes(key, $(id).value); applySliders(); });
    $(id).addEventListener('change', () => BM.Audio.sfx('tap'));
  }
  tap($('tg-music'), () => { if (!prof()) return; prof().settings.music = !prof().settings.music; BM.Save.persist(); applySettings(); BM.Audio.sfx('tap'); });
  tap($('tg-sound'), () => { if (!prof()) return; prof().settings.sound = !prof().settings.sound; BM.Save.persist(); applySettings(); BM.Audio.sfx('tap'); });

  // press-and-hold confirm (erase profile, replace a profile with an imported code)
  // `onTap` (optional): a release before `ms` counts as a plain tap (preset slots: tap = load, hold = overwrite).
  function hold(btn, ms, fn, onTap) {
    const fill = btn.querySelector('.erase-fill, .hold-fill');
    let t0 = 0, raf = 0, fired = false;
    const stop = () => { cancelAnimationFrame(raf); t0 = 0; if (fill) fill.style.width = '0'; };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); BM.Audio.unlock(); t0 = performance.now(); fired = false;
      const tick = () => {
        const k = (performance.now() - t0) / ms;
        if (fill) fill.style.width = Math.min(100, k * 100) + '%';
        if (k >= 1) { fired = true; stop(); fn(); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    btn.addEventListener('pointerup', () => { const short = t0 && !fired; stop(); if (short && onTap) onTap(); });
    for (const ev of ['pointerleave', 'pointercancel']) btn.addEventListener(ev, stop);
  }
  // F2/F8: an overlay panel (or the pre-battle panel) that is taller/wider than the viewport is scaled down to fit —
  // no screen ever scrolls.
  function fit(root) {
    const el = root.querySelector('.fit') || root;
    el.style.transform = '';
    const W = window.innerWidth * 0.97, H = window.innerHeight * 0.97;
    const s = Math.min(1, W / el.offsetWidth, H / el.offsetHeight);
    el.style.transform = s < 1 ? `scale(${s})` : '';
    return s;
  }
  // erase profile: press and hold 3 s -> the slot is empty again, back to the picker
  hold($('btn-erase'), 3000, () => {
    const p = prof(); if (!p) return;
    BM.Save.eraseProfile(p.slot);
    show('scr-pause', false);
    applySettings(); B = null; paused = false;
    go('profiles'); toast('Profile erased');
  });

  // ---------- profiles: picker, create, share codes ----------
  function renderProfiles() {
    const list = $('slot-list'); list.innerHTML = '';
    BM.Save.list().forEach((p, i) => {
      const b = document.createElement('button');
      if (p) {
        const owned = Object.keys(p.lines).length, cleared = Object.keys(p.cleared).length;
        b.className = 'slot';
        b.innerHTML = `<span class="s-num">Player ${i + 1}</span><span class="s-name"></span>` +
          `<span class="s-grade">${p.grade ? 'Grade ' + p.grade : 'Grade ?'}</span>` +
          `<span class="s-stats">${owned} character${owned === 1 ? '' : 's'} · ${cleared} stage${cleared === 1 ? '' : 's'}</span>`;
        b.querySelector('.s-name').textContent = p.name;
        tap(b, () => {
          BM.Audio.sfx('tap');
          if (p.grade == null) { openCreate(i, p); return; } // a Phase 1 save: ask its grade once
          BM.Save.select(i); applySettings(); go('title');
        });
      } else {
        b.className = 'slot empty';
        b.innerHTML = `<span class="s-num">Player ${i + 1}</span><span class="s-name">＋ New</span>`;
        tap(b, () => { BM.Audio.sfx('tap'); openCreate(i, null); });
      }
      list.appendChild(b);
    });
  }
  let creating = { slot: 0, grade: null, existing: null };
  function openCreate(slot, existing) {
    creating = { slot, grade: null, existing };
    $('create-title').textContent = existing ? 'Welcome back!' : `New player ${slot + 1}`;
    $('create-name').value = existing ? existing.name : '';
    const gb = $('grade-btns'); gb.innerHTML = '';
    for (const g of BM.Save.GRADES) {
      const b = document.createElement('button'); b.className = 'grade-btn'; b.innerHTML = `${g}<small>grade</small>`;
      tap(b, () => { creating.grade = g; BM.Audio.sfx('tap'); [...gb.children].forEach((c) => c.classList.toggle('on', c === b)); });
      gb.appendChild(b);
    }
    show('scr-create', true);
  }
  tap($('btn-create-go'), () => {
    if (!creating.grade) { BM.Audio.sfx('deny'); toast('Tap your grade first!'); return; }
    const name = $('create-name').value.trim();
    if (!name) { BM.Audio.sfx('deny'); toast('Type your name first!'); $('create-name').focus(); return; }
    $('create-name').blur();
    if (creating.existing) { BM.Save.finishSetup(creating.slot, creating.grade, name); BM.Save.select(creating.slot); }
    else BM.Save.create(creating.slot, name, creating.grade);
    BM.Audio.sfx('upgrade');
    show('scr-create', false); applySettings(); go('title');
  });
  tap($('btn-create-cancel'), () => { $('create-name').blur(); show('scr-create', false); });
  $('create-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });

  function renderChip() {
    const p = prof(); if (!p) return;
    $('chip-name').textContent = p.name;
    $('chip-grade').textContent = 'Grade ' + p.grade;
  }
  tap($('btn-switch'), () => { BM.Audio.sfx('tap'); go('profiles'); });

  // share code (export) for the active profile
  tap($('btn-export'), async () => {
    const p = prof(); if (!p) return;
    BM.Audio.sfx('tap');
    openCode('export');
    $('code-text').value = 'Making your code…';
    $('code-text').value = await BM.Save.exportCode(p.slot);
  });
  tap($('btn-import'), () => { BM.Audio.sfx('tap'); openCode('import'); });
  function openCode(mode) {
    const exp = mode === 'export';
    $('code-title').textContent = exp ? `${prof().name}'s save code` : 'Load a save code';
    $('code-help').textContent = exp ? 'Copy this code and keep it somewhere safe (Notes, a message to a grown-up).'
      : 'Paste a save code, then tap the player slot to load it into.';
    $('code-text').value = ''; $('code-text').readOnly = exp;
    $('code-status').textContent = ''; $('code-status').className = 'code-status';
    show('code-export-btns', exp);
    const slots = $('code-import-slots'); slots.innerHTML = '';
    show('code-import-slots', !exp);
    if (!exp) BM.Save.list().forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'slot-pick' + (p ? ' taken' : '');
      b.innerHTML = p ? `<span class="hold-fill"></span><span>Replace ${i + 1}: </span><span class="nm"></span><br><span style="font-size:13px">hold 2 s</span>`
        : `<span>Load into ${i + 1} (empty)</span>`;
      if (p) b.querySelector('.nm').textContent = p.name;
      if (p) hold(b, 2000, () => doImport(i)); else tap(b, () => doImport(i));
      slots.appendChild(b);
    });
    show('scr-code', true);
    fit($('scr-code'));
  }
  async function doImport(slot) {
    const st = $('code-status');
    const r = await BM.Save.importCode($('code-text').value, slot);
    if (r.error) { st.textContent = r.error; st.className = 'code-status bad'; BM.Audio.sfx('deny'); return; }
    st.textContent = `Loaded ${r.profile.name} into Player ${slot + 1}!`; st.className = 'code-status good';
    BM.Audio.sfx('upgrade');
    renderProfiles(); openCode('import'); $('code-status').textContent = `Loaded ${r.profile.name} into Player ${slot + 1}!`; $('code-status').className = 'code-status good';
  }
  tap($('btn-code-copy'), async () => {
    const t = $('code-text');
    try { await navigator.clipboard.writeText(t.value); toast('Copied!'); }
    catch (e) { t.focus(); t.select(); t.setSelectionRange(0, t.value.length); try { document.execCommand('copy'); toast('Copied!'); } catch (e2) { toast('Press and hold the code to copy it'); } }
  });
  tap($('btn-code-close'), () => { show('scr-code', false); if (screen === 'profiles') renderProfiles(); });

  const Scr = BM.Screens({ $, tap, toast, show, hold, fit, go: (n) => go(n), devMode: () => devMode, teamBack: () => go(teamFrom),
    screen: () => screen, playEvolution: (list, done) => Evo.play(list, () => { if (screen === 'collection' || screen === 'team') BM.Audio.playMusic('team'); if (done) done(); }) });
  const Evo = BM.EvoScene({ $, tap, show, fit });
  const Gacha = BM.GachaScreen({ $, tap, toast, show, fit, go: (n) => go(n), thumb: (...a) => Scr.thumb(...a), itemIcon: (id) => Scr.itemIcon(id), renderWallet: () => renderWallet() });
  const Chal = BM.ChallengeScreen({ $, tap, toast, show, fit, go: (n) => go(n), thumb: (...a) => Scr.thumb(...a), screen: () => screen,
    back: () => go('prebattle'), cleared: (run) => showChallengeResult(run) });
  const KMap = BM.MapScreen({ $, tap, toast, go: (n) => go(n), openPrebattle: (id) => { preStage = id; go('prebattle'); } });

  // ---------- home (F5): region tiles replace PLAY; Teams · All Characters · Items below ----------
  const REGIONS = [
    { id: 'kanto', name: 'Kanto', open: true, art: 'ui/region_kanto', color: ['#7ec86a', '#2f7fb8'], emoji: '🌋' },
    { id: 'johto', name: 'Johto', art: 'ui/region_johto', color: ['#c9a36a', '#7a4f2f'], emoji: '🔔' },
    { id: 'hoenn', name: 'Hoenn', art: 'ui/region_hoenn', color: ['#5ec9c9', '#2f5fa8'], emoji: '🌊' },
    { id: 'sinnoh', name: 'Sinnoh & Beyond', art: 'ui/region_sinnoh', color: ['#a8b8e8', '#4f4f8f'], emoji: '❄️' },
  ];
  const titleSpriteEl = $('title-sprite'); // (addendum: the region card shows the REGION — no Pokémon pasted on top)
  // H2 Region Carousel: ONE big region card (its map art), ◀ ▶ arrows + dots flip regions; tap the card = its map.
  let regionAt = 0;
  function renderRegions() {
    const box = $('regions'); box.innerHTML = '';
    const p = prof(), cleared = BM.KANTO_STAGES.filter((s) => p && p.cleared[s.id] > 0).length;
    const r = REGIONS[regionAt];
    const b = document.createElement('button');
    b.className = 'region-tile' + (r.open ? '' : ' locked'); b.dataset.region = r.id;
    // a WIDE picture fills the card (assets/ui/regions_wide/<key>.png, or Kanto's map); a portrait region tile (#210–#213)
    // is shown whole over the region's gradient instead of being cropped to a strip
    const wide = BM.Sprites.artSrc('ui/regionw_' + r.id) || (r.id === 'kanto' && BM.Sprites.artSrc('maps/kanto'));
    const tall = !wide && BM.Sprites.artSrc(r.art), art = wide || tall, grad = `linear-gradient(160deg, ${r.color[0]}, ${r.color[1]})`;
    b.style.backgroundImage = wide ? `url("${wide}")` : tall ? `url("${tall}"), ${grad}` : grad;
    b.classList.toggle('portrait', !!tall);
    b.innerHTML = (art ? '' : `<span class="rt-emoji">${r.emoji}</span>`) + `<span class="rt-name">${r.name}</span>` +
      `<span class="rt-sub">${r.open ? `${cleared} / ${BM.KANTO_STAGES.length} stages ✓ · tap to play!` : '🔒 Coming later'}</span>`;
    tap(b, () => {
      if (!r.open) { BM.Audio.sfx('deny'); toast(`${r.name} opens in a later update!`); return; }
      BM.Audio.sfx('tap'); go('map');
    });
    box.appendChild(b);
    const dots = $('reg-dots'); dots.innerHTML = '';
    REGIONS.forEach((x, i) => { const d = document.createElement('i'); d.className = i === regionAt ? 'on' : ''; d.dataset.region = x.id; dots.appendChild(d); });
    renderWallet();
  }
  function flipRegion(k) { regionAt = (regionAt + k + REGIONS.length) % REGIONS.length; BM.Audio.sfx('tap'); renderRegions(); }
  tap($('btn-reg-prev'), () => flipRegion(-1));
  tap($('btn-reg-next'), () => flipRegion(1));
  // Ticket wallet (home + gacha): tickets and Poké Balls (+ Master Balls when held)
  function walletHtml() {
    const p = prof(); if (!p) return '';
    const tk = BM.Sprites.artSrc('icons/battle_ticket'), pb = BM.Sprites.artSrc('icons/poke_ball'), mb = BM.Sprites.artSrc('icons/master_ball');
    const i = (src, emo) => (src ? `<img src="${src}" alt="">` : emo);
    return `<span class="w-tk">${i(tk, '🎫')}<b>${p.tickets}</b></span><span class="w-pb">${i(pb, '🔴')}<b>${p.items.poke_ball || 0}</b></span>` +
      (p.items.master_ball ? `<span class="w-mb">${i(mb, '🟣')}<b>${p.items.master_ball}</b></span>` : '');
  }
  function renderWallet() { for (const el of document.querySelectorAll('.wallet')) el.innerHTML = walletHtml(); }
  tap($('btn-team'), () => { BM.Audio.sfx('tap'); teamFrom = 'title'; go('team'); });
  tap($('btn-collection'), () => { BM.Audio.sfx('tap'); go('collection'); });
  tap($('btn-items'), () => { BM.Audio.sfx('tap'); Scr.openBag(); });
  tap($('btn-gacha'), () => { BM.Audio.sfx('tap'); go('gacha'); });
  tap($('btn-title-settings'), () => openSettings('title'));
  for (const id of ['logo', 'logo-pick']) (function (el) { // long-press a logo 2 s to toggle hidden dev mode
    let timer = 0;
    el.addEventListener('pointerdown', () => { timer = setTimeout(() => { devMode = !devMode; toast(devMode ? 'Dev mode ON' : 'Dev mode OFF'); }, 2000); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(timer));
  })($(id));
  function titleSprite(now) {
    const c = titleSpriteEl, g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    const sp = BM.Sprites.get(BM.FORMS.pikachu);
    const f = sp.run[Math.floor(now * 9) % sp.run.length];
    const s = (c.height - 10) / sp.h;
    g.drawImage(f, c.width / 2 - sp.ax * s, c.height - 6 - sp.ay * s + 6, sp.w * s, sp.h * s);
  }

  // ---------- pre-battle ----------
  const KIND = { wild: 'Wild Pokémon', trainer: 'Trainer battle', gym: 'Gym battle', e4: 'Elite Four', champion: 'Champion' };
  const itemIconHtml = (id) => Scr.itemIcon(id);
  function rewardChips(r, el) {
    el.innerHTML = '';
    const add = (html, cls) => { const d = document.createElement('span'); d.className = 'reward' + (cls ? ' ' + cls : ''); d.innerHTML = html; el.appendChild(d); return d; };
    const tk = BM.Sprites.artSrc('icons/battle_ticket'), xp = BM.Sprites.artSrc('icons/xp_candy_s');
    const tkHtml = tk ? `<img src="${tk}" alt="">` : '🎫';
    if (r.tickets) add(`${tkHtml} +${r.tickets} tickets`);
    if (r.xp) add(`${xp ? `<img src="${xp}" alt="">` : '⭐'} +${r.xp.toLocaleString()} XP${r.xpLines ? ` × ${r.xpLines.length}` : ' each'}`);
    if (r.item) add(`${itemIconHtml(r.item)} ${BM.ITEMS[r.item]}`, 'new');
    // stage drop table rolls (Phase 4): stored in the bag / ticket wallet
    for (const d of r.drops || []) {
      if (d.item === 'tickets') add(`${tkHtml} +${d.n} bonus tickets`, 'drop');
      else add(`${itemIconHtml(d.item)} ${d.n > 1 ? d.n + '× ' : ''}${BM.ITEMS[d.item]}`, 'drop new');
    }
    if (r.gift && r.giftNew !== false) add(`🎁 New character: ${BM.LINES[r.gift].name}!`, 'new');
  }
  function renderPrebattle() {
    const st = BM.stageById(preStage), p = prof();
    BM.Audio.playMusic(st.townMusic);
    const bg = BM.Sprites.artSrc('bg/' + st.background);
    $('scr-prebattle').style.backgroundImage = bg ? `url("${bg}")` : '';
    $('pre-kicker').textContent = st.dev ? 'DEV' : `Stage ${st.num} · ${KIND[st.kind]}`;
    $('pre-name').textContent = st.name;
    $('pre-sub').textContent = st.leader ? `Leader ${st.leader}` : st.place ? `at the ${st.place}` : '';
    const foes = $('pre-foes'); foes.innerHTML = '';
    for (const e of BM.stagePreview(st)) {
      const f = BM.FORMS[e.form], d = document.createElement('div');
      d.className = 'foe' + (e.ace ? ' ace' : '');
      d.appendChild(Scr.thumb(f, 110, false));
      const n = document.createElement('span'); n.className = 'fn'; n.textContent = (e.ace ? '★ ' : '') + f.name; d.appendChild(n);
      const l = document.createElement('span'); l.className = 'fl'; l.textContent = e.min === e.max ? `Lv ${e.min}` : `Lv ${e.min}–${e.max}`; d.appendChild(l);
      foes.appendChild(d);
    }
    const wins = p.cleared[st.id] || 0;
    $('pre-rew-h').textContent = wins ? `Cleared ×${wins} — replay rewards` : 'First-clear rewards';
    rewardChips(BM.stageRewards(st, !wins), $('pre-rewards'));
    // what this stage's drop table can give (icons only; the roll happens on a win)
    const finds = BM.dropPreview(st);
    if (finds.length) { const d = document.createElement('span'); d.className = 'reward finds'; d.innerHTML = 'May find: ' + finds.map((id) => id === 'tickets' ? '🎫' : itemIconHtml(id)).join(''); $('pre-rewards').appendChild(d); }
    renderPreItems();
    fit($('scr-prebattle'));
  }
  // Battle items row: icon + count per battle item; tap to arm / disarm (only owned ones). A loss keeps them.
  function renderPreItems() {
    const p = prof(), box = $('pre-items'); box.innerHTML = '';
    for (const id of BM.BATTLE_ITEMS) {
      const it = BM.ITEM_INFO[id], n = p.items[id] || 0, on = p.armed.includes(id);
      const b = document.createElement('button');
      b.className = 'pre-item' + (on ? ' on' : '') + (n ? '' : ' none'); b.dataset.item = id; b.title = it.blurb;
      b.innerHTML = `<span class="pi-icon">${itemIconHtml(id)}</span><span class="pi-n">×${n}</span><span class="pi-name">${it.name}</span>` + (on ? '<span class="pi-on">✓</span>' : '');
      tap(b, () => {
        const r = BM.Save.toggleArmed(id);
        if (r === 'none') { BM.Audio.sfx('deny'); toast(`No ${it.name} yet — find them in the Gacha${id === 'dowsing_machine' ? ' or on stages' : ''}!`); return; }
        BM.Audio.sfx(r === 'on' ? 'upgrade' : 'tap'); if (r === 'on') toast(`${it.name}: ${it.blurb}`);
        renderPreItems(); fit($('scr-prebattle'));
      });
      box.appendChild(b);
    }
  }
  tap($('btn-pre-back'), () => { BM.Audio.sfx('tap'); go('map'); });
  tap($('btn-pre-team'), () => { BM.Audio.sfx('tap'); teamFrom = 'prebattle'; go('team'); });
  tap($('btn-pre-go'), () => { BM.Audio.sfx('tap'); startBattle(preStage); });
  tap($('btn-pre-challenge'), () => { BM.Audio.sfx('tap'); Chal.choose(preStage); });

  // ---------- battle ----------
  let cardEls = [];
  let hint = { shown: {}, el: $('hint'), until: 0 };
  // F9: one row holds every team card (up to 10), so the bar is a little taller than Phase 3's
  function hudHeight() { return Math.round(Math.max(140, Math.min(220, window.innerHeight * 0.26))); }
  function layout() {
    const h = hudHeight();
    document.documentElement.style.setProperty('--hud-h', h + 'px');
    R.resize(h);
  }
  // F9 (BR-018): ALL team cards in one row; the whole card is the button (its children never take the tap).
  function buildCards() {
    const wrap = $('cards'); wrap.innerHTML = ''; cardEls = [];
    const n = Math.max(5, B.S.team.length);
    wrap.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    wrap.classList.toggle('many', n > 5);
    for (let i = 0; i < n; i++) {
      const c = B.S.team[i];
      const el = document.createElement('button');
      if (!c) { el.className = 'card empty'; wrap.appendChild(el); cardEls.push(null); continue; }
      el.className = 'card'; el.dataset.form = c.form.id;
      const cv = document.createElement('canvas'); cv.width = 140; cv.height = 110;
      const sp = BM.Sprites.get(c.form), s = Math.min(100 / sp.h, 132 / sp.w), g = cv.getContext('2d');
      g.drawImage(sp.run[0], 70 - sp.ax * s, 104 - sp.ay * s, sp.w * s, sp.h * s);
      el.innerHTML = '<span class="cd"></span><span class="cdnum"></span>';
      el.prepend(cv);
      const lv = document.createElement('span'); lv.className = 'clv'; lv.textContent = 'Lv ' + c.level; el.appendChild(lv);
      const name = document.createElement('span'); name.className = 'cname'; name.textContent = c.form.name; el.appendChild(name);
      const cost = document.createElement('span'); cost.className = 'ccost'; cost.textContent = '⚡' + c.form.cost; el.appendChild(cost);
      tap(el, () => {
        if (paused) return;
        const r = B.spawn(i);
        if (r === 'ok') dismissHint('spawn'); // the spawn event plays the cry (G8)
        else { BM.Audio.sfx('deny'); el.classList.remove('denied'); void el.offsetWidth; el.classList.add('denied'); }
      });
      wrap.appendChild(el);
      cardEls.push({ el, slot: i, cd: el.querySelector('.cd'), cdnum: el.querySelector('.cdnum'), last: '' });
    }
  }
  tap($('btn-gen'), () => {
    if (paused || !B) return;
    const r = B.upgradeGen();
    const gb = $('btn-gen');
    if (r === 'ok') { BM.Audio.sfx('upgrade'); dismissHint('gen'); gb.classList.remove('bump'); void gb.offsetWidth; gb.classList.add('bump'); }
    else { BM.Audio.sfx('deny'); gb.classList.remove('denied'); void gb.offsetWidth; gb.classList.add('denied'); }
  });

  function startBattle(stageId) {
    const st = BM.stageById(stageId);
    if (!BM.isPlayable(st)) return;
    preStage = stageId;
    layout();
    R.clearFx();
    B = BM.Battle(st, prof(), { items: prof().armed.filter((id) => prof().items[id] > 0) });
    $('armed-icons').innerHTML = B.S.items.map((id) => `<span class="armed" data-item="${id}" title="${BM.ITEM_INFO[id].name}">${itemIconHtml(id)}</span>`).join('');
    window.__battle = B; // test hook
    paused = false;
    go('battle');
    buildCards();
    BM.Audio.playMusic(st.music);
    BM.Audio.preloadCries([...B.S.team.map((c) => c.form.id), ...st.waves.map((w) => w.form), ...(st.ace ? [st.ace.form] : [])]);
    hint.shown = {};
    if (st.tutorial) setHint('spawn', 'Tap a Pokémon card to send it out!');
  }
  function setHint(key, text) {
    if (hint.shown[key]) return;
    hint.shown[key] = 'on';
    hint.el.textContent = text; show('hint', true);
  }
  function dismissHint(key) {
    if (hint.shown[key] === 'on') { hint.shown[key] = 'done'; show('hint', false); }
  }
  function tutorialTick() {
    const st = B.S.stage;
    if (!st.tutorial) return;
    const g = B.genInfo();
    if (hint.shown.spawn === 'done' && !hint.shown.gen && !g.max && B.S.ap >= g.cost && B.S.t > 12) setHint('gen', 'Got spare AP? Tap the AP Generator to make AP faster!');
    if (hint.shown.gen === 'done' && !hint.shown.base && B.S.t > 30) { setHint('base', 'Knock down the wild den on the right to win!'); setTimeout(() => dismissHint('base'), 4000); }
  }

  function updateHud() {
    const S = B.S, g = B.genInfo();
    $('ap-num').textContent = Math.floor(S.ap);
    $('ap-cap').textContent = g.cap;
    $('gen-lv').textContent = g.level;
    $('gen-cost').textContent = g.max ? 'MAX' : '⚡' + g.cost;
    const gb = $('btn-gen');
    gb.classList.toggle('cant', !g.max && S.ap < g.cost);
    gb.classList.toggle('ready', !g.max && S.ap >= g.cost);
    cardEls.forEach((c) => {
      if (!c) return;
      const t = S.team[c.slot], why = B.canSpawn(c.slot);
      const state = why + ':' + Math.ceil(t.cd);
      c.cd.style.height = (t.cd > 0 ? (t.cd / t.form.cd) * 100 : 0) + '%';
      if (state === c.last) return;
      c.last = state;
      c.el.classList.toggle('cant', why === 'ap' || why === 'full');
      c.el.classList.toggle('full', why === 'full');
      c.cdnum.textContent = t.cd > 0 ? Math.ceil(t.cd) : '';
    });
  }

  function onBattleEvents() {
    const now = performance.now() / 1000;
    for (const ev of B.S.events) {
      R.onEvent(ev, now);
      if (ev.type === 'hit') {
        if (ev.mult >= 2) BM.Audio.sfx('superEffective');
        else if (ev.mult === 0) BM.Audio.sfx('noEffect');
        else if (ev.mult < 1) BM.Audio.sfx('notVery');
        else BM.Audio.sfx('hit');
      } else if (ev.type === 'dodge') BM.Audio.sfx('dodge');
      else if (ev.type === 'baseHit') BM.Audio.sfx('baseHit');
      else if (ev.type === 'faint' && !ev.quiet) BM.Audio.sfx('faint');
      // G8: every Pokémon cries when it spawns — yours at full volume, enemies a touch quieter
      else if (ev.type === 'spawn') BM.Audio.cry(ev.unit.form.id, ev.unit.form.size, ev.unit.side === 1 ? 1 : C.CRY_ENEMY_VOL, ev.unit.side);
      else if (ev.type === 'end') setTimeout(() => showResult(ev.result), 900);
    }
    B.S.events.length = 0;
  }
  let resultMode = 'battle'; // 'battle' | 'challenge' (the challenge-result screen reuses this panel)
  function setResultMode(m) {
    resultMode = m;
    show('btn-retry', m === 'battle'); show('result-art', m === 'challenge');
  }
  function showResult(result) {
    if (!B) return;
    setResultMode('battle');
    const st = B.S.stage;
    if (result === 'win') {
      const r = BM.Save.recordWin(st.id, B.S.battled, Math.random, B.S.items);
      lastRewards = r;
      if (r.first && !st.dev) KMap.queueWalk(st.id);
      $('result-title').textContent = 'VICTORY!'; $('result-title').classList.remove('lose');
      $('result-sub').textContent = r.first ? `${st.name} cleared! First-clear rewards:` : `${st.name} cleared again!`;
      rewardChips(r, $('result-rewards'));
      for (const id of r.used || []) { const d = document.createElement('span'); d.className = 'reward used'; d.innerHTML = `${itemIconHtml(id)} ${BM.ITEM_INFO[id].name} used${id === 'xp_bonus' ? ' (+50% XP)' : id === 'dowsing_machine' && r.dowsed ? ` → found ${BM.ITEMS[r.dowsed]}!` : ''}`; $('result-rewards').appendChild(d); }
      if (r.giftNew) { const d = document.createElement('span'); d.className = 'reward'; d.textContent = r.giftOnTeam ? 'Added to your team!' : 'Add them on the Team screen!'; $('result-rewards').appendChild(d); }
      renderXpRows(r);
      BM.Audio.playMusic(st.kind === 'gym' ? 'victory_gym' : 'victory'); // gym wins: victory_gym INSTEAD of victory
    } else {
      lastRewards = null;
      $('result-title').textContent = 'Oh no!'; $('result-title').classList.add('lose');
      $('result-sub').textContent = 'Your base fell — nothing lost. Try again?';
      $('result-rewards').innerHTML = B.S.items.length ? `<span class="reward kept">🎒 Your battle items are safe — they're only used up when you win.</span>` : ''; $('result-xp').innerHTML = '';
      BM.Audio.playMusic('defeat');
    }
    show('hint', false);
    show('scr-result', true);
    fit($('scr-result'));
  }
  // Challenge auto-clear (10 in a row): the stage is cleared through the SAME recordWin path as a battle win (done in
  // challenge.js); this shows the challenge-result screen — stage art + reward chips + XP rows — with the stage's normal
  // victory key, and Map walks the token on exactly like a win.
  function showChallengeResult(run) {
    const st = BM.stageById(run.stageId), r = run.rewards;
    B = null; lastRewards = r;
    setResultMode('challenge');
    if (r.first && !st.dev) KMap.queueWalk(st.id);
    const bg = BM.Sprites.artSrc('bg/' + st.background);
    $('result-art').style.backgroundImage = bg ? `url("${bg}")` : 'linear-gradient(160deg, #7ec8f5, #b6e3a0)';
    $('result-art').innerHTML = `<span class="ra-tag">🧠 ${BM.CHALLENGE.GOAL} in a row!</span>`;
    $('result-title').textContent = 'STAGE CLEAR!'; $('result-title').classList.remove('lose');
    $('result-sub').textContent = r.first ? `${st.name} cleared by Challenge! First-clear rewards:` : `${st.name} cleared again by Challenge!`;
    rewardChips(r, $('result-rewards'));
    if (r.giftNew) { const d = document.createElement('span'); d.className = 'reward'; d.textContent = r.giftOnTeam ? 'Added to your team!' : 'Add them on the Team screen!'; $('result-rewards').appendChild(d); }
    renderXpRows(r);
    BM.Audio.playMusic(st.kind === 'gym' ? 'victory_gym' : 'victory');
    show('scr-result', true);
    fit($('scr-result'));
  }
  // Per battled line: a "+XP" bar that fills (wrapping on each level up) and "Level up! Lv 9 → 11"; lines whose level
  // evolution is now due say so — the evolution scene plays when the result screen is left (Retry / Map).
  function renderXpRows(r) {
    const box = $('result-xp'); box.innerHTML = '';
    for (const x of r.xpLines) {
      const f = BM.FORMS[prof().lines[x.id].form], row = document.createElement('div');
      row.className = 'xp-row'; row.dataset.line = x.id;
      row.appendChild(Scr.thumb(f, 56, false));
      const mid = document.createElement('div'); mid.className = 'xp-mid';
      mid.innerHTML = `<span class="xp-name"></span><span class="xp-bar"><i></i></span><span class="xp-txt">+${(x.xpAfter - x.xpBefore).toLocaleString()} XP</span>`;
      mid.querySelector('.xp-name').textContent = f.name;
      row.appendChild(mid);
      const lv = document.createElement('span'); lv.className = 'xp-lv'; lv.textContent = `Lv ${x.to}`; row.appendChild(lv);
      box.appendChild(row);
      const bar = mid.querySelector('i'), txt = mid.querySelector('.xp-txt');
      bar.style.transition = 'none'; bar.style.width = Math.round(Scr.xpFrac(x.xpBefore, x.from) * 100) + '%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = 'width .7s ease-out';
        if (x.to > x.from) {
          bar.style.width = '100%';
          setTimeout(() => { bar.style.transition = 'none'; bar.style.width = '0%';
            requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = 'width .6s ease-out'; bar.style.width = Math.round(Scr.xpFrac(x.xpAfter, x.to) * 100) + '%'; })); }, 750);
          txt.textContent = `Level up! Lv ${x.from} → ${x.to}`; row.classList.add('up');
          if (r.evolve.includes(x.id)) { const e = document.createElement('span'); e.className = 'xp-evo'; e.textContent = '✨ is evolving!'; mid.appendChild(e); }
        } else bar.style.width = Math.round(Scr.xpFrac(x.xpAfter, x.to) * 100) + '%';
      }));
    }
  }
  // Leaving the result screen: play every due level evolution (one after another, incl. a second step) first.
  function afterResult(next) {
    const ids = (lastRewards && lastRewards.evolve) || [];
    const step = () => {
      const id = ids.find((i) => BM.Save.pendingEvolution(i));
      if (!id) { next(); return; }
      const pend = BM.Save.pendingEvolution(id);
      show('scr-result', false);
      Evo.play([{ line: id, from: prof().lines[id].form, to: pend.id }], step);
    };
    step();
  }
  tap($('btn-retry'), () => { if (resultMode !== 'battle' || !B) return; BM.Audio.sfx('tap'); afterResult(() => startBattle(B.S.stage.id)); });
  let lastRewards = null;
  tap($('btn-map'), () => { BM.Audio.sfx('tap'); afterResult(() => { B = null; go('map'); }); });

  // ---------- pause / settings ----------
  function openSettings(from) {
    settingsFrom = from;
    if (from === 'battle') { paused = true; BM.Audio.suspend(); }
    show('btn-export', !!prof());
    show('btn-dev-music', devMode);
    $('pause-title').textContent = from === 'battle' ? 'Paused' : 'Settings';
    show('pause-battle-btns', from === 'battle');
    show('btn-close-settings', from !== 'battle');
    show('mistake-sliders', !!prof());
    applySliders();
    show('scr-pause', true);
    fit($('scr-pause'));
  }
  // Dev mode: step through all 28 music keys to hear every slot (shows whether the MP3 or the fallback plays).
  let devKey = -1;
  tap($('btn-dev-music'), () => {
    const keys = Object.keys(BM.MUSIC_KEYS); devKey = (devKey + 1) % keys.length;
    BM.Audio.playMusic(keys[devKey]);
    $('btn-dev-music').textContent = `DEV ♪ ${devKey + 1}/${keys.length}: ${keys[devKey]} (${BM.Audio.currentSource})`;
  });
  function closeSettings() {
    show('scr-pause', false);
    if (settingsFrom === 'battle') { paused = false; BM.Audio.resume(); }
  }
  tap($('btn-pause'), () => { if (B && !B.S.result) openSettings('battle'); });
  tap($('btn-resume'), closeSettings);
  tap($('btn-close-settings'), () => { BM.Audio.sfx('tap'); closeSettings(); });
  tap($('btn-quit'), () => { show('scr-pause', false); paused = false; BM.Audio.resume(); B = null; go('map'); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === 'battle' && B && !B.S.result && !paused) openSettings('battle');
  });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  window.addEventListener('resize', () => {
    layout(); if (B) buildCards(); if (screen === 'map') KMap.layout();
    // rotation / resize: open panels re-fit the new viewport (never scroll)
    for (const o of document.querySelectorAll('.overlay:not(.hidden)')) if (o.querySelector('.fit')) fit(o);
    if (screen === 'prebattle') fit($('scr-prebattle'));
  });

  // ---------- loop ----------
  const DT = 1 / C.TICK_HZ;
  let acc = 0, lastT = performance.now();
  function frame(tms) {
    const now = tms / 1000;
    let dt = Math.min(0.25, (tms - lastT) / 1000); lastT = tms;
    if (screen === 'title') titleSprite(now);
    if (screen === 'map') KMap.tick(tms);
    if (screen === 'battle' && B) {
      if (!paused) {
        acc += dt;
        while (acc >= DT) { B.step(DT); acc -= DT; }
        onBattleEvents();
        tutorialTick();
      }
      R.draw(B, performance.now() / 1000);
      updateHud();
    }
    requestAnimationFrame(frame);
  }

  // real title art / logo / AP icon once their ASSET_PROMPTS entries are DONE (placeholders otherwise)
  function applyArt() {
    const key = BM.Sprites.artSrc('ui/title_key_art');
    if (key) for (const id of ['scr-title', 'scr-profiles']) { $(id).style.backgroundImage = `url("${key}")`; $(id).classList.add('has-art'); }
    const logo = BM.Sprites.artSrc('ui/logo');
    if (logo) for (const id of ['logo', 'logo-pick']) { $(id).innerHTML = `<img src="${logo}" alt="Battle Monsters">`; $(id).classList.add('img'); }
    const ap = BM.Sprites.artSrc('icons/ap');
    if (ap) document.querySelector('.ap-icon').innerHTML = `<img src="${ap}" alt="AP">`;
    const gen = BM.Sprites.artSrc('icons/ap_generator'); // ASSET_PROMPTS #214 (G5b)
    if (gen) $('gen-icon').innerHTML = `<img src="${gen}" alt="">`;
  }

  // ---------- boot ----------
  BM.Save.load();
  applySettings();
  layout();
  BM.Sprites.loadAll().then(() => {
    applyArt();
    go('profiles');
    requestAnimationFrame(frame);
  });
  // first tap anywhere unlocks audio on iOS and starts the title music
  document.addEventListener('pointerdown', () => { BM.Audio.unlock(); if ((screen === 'title' || screen === 'profiles') && !BM.Audio.currentKey) BM.Audio.playMusic('title'); }, { once: false });
  window.BM.debug = { get battle() { return B; }, startBattle, go, get screen() { return screen; }, map: KMap, render: R, evo: Evo, screens: Scr, gacha: Gacha, challenge: Chal, fit, openPrebattle: (id) => { preStage = id; go('prebattle'); },
    get preStage() { return preStage; }, get lastRewards() { return lastRewards; } };
})();
