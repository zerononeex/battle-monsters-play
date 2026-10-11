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
    show('scr-result', false); show('scr-pause', false);
    canvas.style.visibility = name === 'battle' ? 'visible' : 'hidden';
    if (name === 'profiles') { BM.Audio.playMusic('title'); renderProfiles(); }
    if (name === 'title') { BM.Audio.playMusic('title'); renderChip(); }
    // music by screen: map = map_kanto, pre-battle = the stage's town key, battle = its category key (startBattle)
    if (name === 'map') { BM.Audio.playMusic('map_kanto'); show('btn-map-dev', devMode); KMap.render(); }
    if (name === 'prebattle') renderPrebattle();
    if (name === 'collection') { BM.Audio.playMusic('team'); Scr.renderCollection(); }
    if (name === 'team') { BM.Audio.playMusic('team'); Scr.renderTeam(); }
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
  }
  tap($('tg-music'), () => { if (!prof()) return; prof().settings.music = !prof().settings.music; BM.Save.persist(); applySettings(); BM.Audio.sfx('tap'); });
  tap($('tg-sound'), () => { if (!prof()) return; prof().settings.sound = !prof().settings.sound; BM.Save.persist(); applySettings(); BM.Audio.sfx('tap'); });

  // press-and-hold confirm (erase profile, replace a profile with an imported code)
  function hold(btn, ms, fn) {
    const fill = btn.querySelector('.erase-fill, .hold-fill');
    let t0 = 0, raf = 0;
    const stop = () => { cancelAnimationFrame(raf); t0 = 0; if (fill) fill.style.width = '0'; };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); BM.Audio.unlock(); t0 = performance.now();
      const tick = () => {
        const k = (performance.now() - t0) / ms;
        if (fill) fill.style.width = Math.min(100, k * 100) + '%';
        if (k >= 1) { stop(); fn(); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(ev, stop);
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
          `<span class="s-stats">${owned} friend${owned === 1 ? '' : 's'} · ${cleared} stage${cleared === 1 ? '' : 's'}</span>`;
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

  const Scr = BM.Screens({ $, tap, toast, show, go: (n) => go(n), devMode: () => devMode, teamBack: () => go(teamFrom) });
  const KMap = BM.MapScreen({ $, tap, toast, go: (n) => go(n), openPrebattle: (id) => { preStage = id; go('prebattle'); } });

  // ---------- title ----------
  tap($('btn-team'), () => { BM.Audio.sfx('tap'); teamFrom = 'title'; go('team'); });
  tap($('btn-collection'), () => { BM.Audio.sfx('tap'); go('collection'); });
  tap($('btn-play'), () => { BM.Audio.sfx('tap'); go('map'); });
  tap($('btn-title-settings'), () => openSettings('title'));
  for (const id of ['logo', 'logo-pick']) (function (el) { // long-press a logo 2 s to toggle hidden dev mode
    let timer = 0;
    el.addEventListener('pointerdown', () => { timer = setTimeout(() => { devMode = !devMode; toast(devMode ? 'Dev mode ON' : 'Dev mode OFF'); }, 2000); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(timer));
  })($(id));
  function titleSprite(now) {
    const c = $('title-sprite'), g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    const sp = BM.Sprites.get(BM.FORMS.pikachu);
    const f = sp.run[Math.floor(now * 9) % sp.run.length];
    const s = 130 / sp.h;
    g.drawImage(f, c.width / 2 - sp.ax * s, c.height - 6 - sp.ay * s + 6, sp.w * s, sp.h * s);
  }

  // ---------- pre-battle ----------
  const KIND = { wild: 'Wild Pokémon', trainer: 'Trainer battle', gym: 'Gym battle', e4: 'Elite Four', champion: 'Champion' };
  function itemIconHtml(id) { const i = BM.Sprites.artSrc('icons/' + id); return i ? `<img src="${i}" alt="">` : '💎'; }
  function rewardChips(r, el) {
    el.innerHTML = '';
    const add = (html, cls) => { const d = document.createElement('span'); d.className = 'reward' + (cls ? ' ' + cls : ''); d.innerHTML = html; el.appendChild(d); return d; };
    const tk = BM.Sprites.artSrc('icons/battle_ticket'), xp = BM.Sprites.artSrc('icons/xp_candy_s');
    if (r.tickets) add(`${tk ? `<img src="${tk}" alt="">` : '🎫'} +${r.tickets} tickets`);
    if (r.xp) add(`${xp ? `<img src="${xp}" alt="">` : '⭐'} +${r.xp} XP${r.xpLines ? ` × ${r.xpLines.length} friend${r.xpLines.length === 1 ? '' : 's'}` : ' each'}`);
    if (r.item) add(`${itemIconHtml(r.item)} ${BM.ITEMS[r.item]}`, 'new');
    if (r.gift && r.giftNew !== false) add(`🎁 New friend: ${BM.LINES[r.gift].name}!`, 'new');
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
  }
  tap($('btn-pre-back'), () => { BM.Audio.sfx('tap'); go('map'); });
  tap($('btn-pre-team'), () => { BM.Audio.sfx('tap'); teamFrom = 'prebattle'; go('team'); });
  tap($('btn-pre-go'), () => { BM.Audio.sfx('tap'); startBattle(preStage); });

  // ---------- battle ----------
  let cardEls = [];
  let hint = { shown: {}, el: $('hint'), until: 0 };
  function hudHeight() { return Math.round(Math.max(130, Math.min(210, window.innerHeight * 0.24))); }
  function layout() {
    const h = hudHeight();
    document.documentElement.style.setProperty('--hud-h', h + 'px');
    R.resize(h);
  }
  let cardRow = 0;
  function buildCards() {
    const wrap = $('cards'); wrap.innerHTML = ''; cardEls = [];
    const rows = Math.max(1, Math.ceil(B.S.team.length / 5));
    if (cardRow >= rows) cardRow = 0;
    show('btn-row', rows > 1);
    $('row-lbl').textContent = `${cardRow + 1}/${rows}`;
    for (let j = 0; j < 5; j++) {
      const i = cardRow * 5 + j;
      const c = B.S.team[i];
      const el = document.createElement('button');
      if (!c) { el.className = 'card empty'; wrap.appendChild(el); cardEls.push(null); continue; }
      el.className = 'card'; el.dataset.form = c.form.id;
      const cv = document.createElement('canvas'); cv.width = 140; cv.height = 110;
      const sp = BM.Sprites.get(c.form), s = Math.min(100 / sp.h, 132 / sp.w), g = cv.getContext('2d');
      g.drawImage(sp.run[0], 70 - sp.ax * s, 104 - sp.ay * s, sp.w * s, sp.h * s);
      el.innerHTML = '<span class="cd"></span><span class="cdnum"></span>';
      el.prepend(cv);
      const name = document.createElement('span'); name.className = 'cname'; name.textContent = c.form.name; el.appendChild(name);
      const cost = document.createElement('span'); cost.className = 'ccost'; cost.textContent = '⚡' + c.form.cost; el.appendChild(cost);
      tap(el, () => {
        if (paused) return;
        const r = B.spawn(i);
        if (r === 'ok') { BM.Audio.cry(c.form.id, c.form.size); dismissHint('spawn'); }
        else { BM.Audio.sfx('deny'); el.classList.remove('denied'); void el.offsetWidth; el.classList.add('denied'); }
      });
      wrap.appendChild(el);
      cardEls.push({ el, slot: i, cd: el.querySelector('.cd'), cdnum: el.querySelector('.cdnum'), last: '' });
    }
  }
  tap($('btn-row'), () => { if (!B) return; BM.Audio.sfx('tap'); cardRow++; buildCards(); });
  tap($('btn-gen'), () => {
    if (paused || !B) return;
    const r = B.upgradeGen();
    if (r === 'ok') { BM.Audio.sfx('upgrade'); dismissHint('gen'); } else BM.Audio.sfx('deny');
  });

  function startBattle(stageId) {
    const st = BM.stageById(stageId);
    if (!BM.isPlayable(st)) return;
    preStage = stageId;
    layout();
    R.clearFx();
    B = BM.Battle(st, prof());
    window.__battle = B; // test hook
    paused = false;
    go('battle');
    cardRow = 0;
    buildCards();
    BM.Audio.playMusic(st.music);
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
      } else if (ev.type === 'baseHit') BM.Audio.sfx('baseHit');
      else if (ev.type === 'faint' && !ev.quiet) BM.Audio.sfx('faint');
      else if (ev.type === 'spawn' && ev.unit.side === -1) BM.Audio.cry(ev.unit.form.id, ev.unit.form.size);
      else if (ev.type === 'end') setTimeout(() => showResult(ev.result), 900);
    }
    B.S.events.length = 0;
  }
  function showResult(result) {
    if (!B) return;
    const st = B.S.stage;
    if (result === 'win') {
      const r = BM.Save.recordWin(st.id, B.S.battled);
      lastRewards = r;
      $('result-title').textContent = 'VICTORY!'; $('result-title').classList.remove('lose');
      $('result-sub').textContent = r.first ? `${st.name} cleared! First-clear rewards:` : `${st.name} cleared again!`;
      rewardChips(r, $('result-rewards'));
      if (r.giftNew) { const d = document.createElement('span'); d.className = 'reward'; d.textContent = r.giftOnTeam ? 'Added to your team!' : 'Add them on the Team screen!'; $('result-rewards').appendChild(d); }
      BM.Audio.playMusic(st.kind === 'gym' ? 'victory_gym' : 'victory'); // gym wins: victory_gym INSTEAD of victory
    } else {
      $('result-title').textContent = 'Oh no!'; $('result-title').classList.add('lose');
      $('result-sub').textContent = 'Your base fell — nothing lost. Try again?';
      $('result-rewards').innerHTML = '';
      BM.Audio.playMusic('defeat');
    }
    show('hint', false);
    show('scr-result', true);
  }
  tap($('btn-retry'), () => { BM.Audio.sfx('tap'); startBattle(B.S.stage.id); });
  let lastRewards = null;
  tap($('btn-map'), () => { BM.Audio.sfx('tap'); B = null; go('map'); });

  // ---------- pause / settings ----------
  function openSettings(from) {
    settingsFrom = from;
    if (from === 'battle') { paused = true; BM.Audio.suspend(); }
    show('btn-export', !!prof());
    show('btn-dev-music', devMode);
    $('pause-title').textContent = from === 'battle' ? 'Paused' : 'Settings';
    show('pause-battle-btns', from === 'battle');
    show('btn-close-settings', from !== 'battle');
    show('scr-pause', true);
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
  window.addEventListener('resize', () => { layout(); if (B) buildCards(); if (screen === 'map') KMap.layout(); });

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
  window.BM.debug = { get battle() { return B; }, startBattle, go, get screen() { return screen; }, map: KMap,
    get preStage() { return preStage; }, get lastRewards() { return lastRewards; } };
})();
