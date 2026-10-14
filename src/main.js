// Screens, HUD, input and the main loop.
(function () {
  const $ = (id) => document.getElementById(id);
  const C = BM.C;
  const canvas = $('field');
  const R = BM.Render(canvas);
  let B = null;            // current battle
  let paused = false;
  let speed = 1;           // XX1: battle speed (1 | 2 | 3) — fixed sim steps per real second × speed
  let screen = 'profiles';
  let devMode = /[?&]dev\b/.test(location.search);
  let mapRegion = 'kanto'; // Johto (Step 1/4): which region's map the map screen shows
  let settingsFrom = null; // 'title' | 'battle'
  let teamFrom = 'title';  // where the team screen's back button goes ('title' | 'prebattle')
  let preStage = null;     // stage id shown on the pre-battle screen
  // PHASE 11 friend battles: the live session while its battle is on screen (null in every other mode) and which sim side is
  // "me" (1 = the campaign player / the host; -1 = the guest, whose screen is drawn mirrored). The campaign never changes them.
  let PV = null, mySide = 1;

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
    show('scr-challenge', name === 'challenge');
    show('scr-bonus', name === 'bonus'); // Phase 6: no music change — the screen you came from keeps playing
    show('scr-friend', name === 'friend'); show('scr-fpause', false);
    show('scr-chmode', false); show('scr-chover', false);
    show('scr-result', false); show('scr-ending', false); show('scr-pause', false); show('scr-bag', false); show('scr-line', false); show('scr-filter', false); show('scr-peek', false); show('scr-rename', false); show('scr-reveal', false); show('scr-legend', false);
    canvas.style.visibility = name === 'battle' ? 'visible' : 'hidden';
    if (name === 'profiles') { BM.Audio.playMusic('title'); renderProfiles(); }
    if (name === 'title') { BM.Audio.playMusic('title'); renderChip(); renderRegions(); renderHomeTower(); }
    // music by screen: map = map_kanto, pre-battle = the stage's town key, battle = its category key (startBattle)
    // Johto: the map screen shows the region last opened from the home carousel / the region of the stage just played; its music is
    // map_kanto / map_johto (map_johto plays map_kanto until its MP3 is supplied — the Step 0 fallback rule)
    if (name === 'map') { BM.Audio.playMusic(BM.REGION_MAPS[mapRegion].music); show('btn-map-dev', devMode); show('btn-map-dev-rules', devMode); KMap.setRegion(mapRegion); KMap.render(); }
    if (name === 'bonus') { BM.Audio.playMusic('tower'); Bonus.render(); } // FF3: the Tower's own theme
    if (name === 'prebattle') renderPrebattle();
    if (name === 'collection') { BM.Audio.playMusic('team'); Scr.renderCollection(); }
    if (name === 'team') { BM.Audio.playMusic('team'); Scr.renderTeam(); }
    if (name === 'gacha') { BM.Audio.playMusic('gacha'); Gacha.render(); }
    if (name === 'friend' && BM.Audio.currentKey !== 'title') BM.Audio.playMusic('title');
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
  // batch1 step 6: the Grade row in Settings (2–7, current lit); a tap saves it and refreshes the home chip + the picker card
  function applyGrade() {
    const p = prof(), gb = $('set-grade-btns');
    if (!gb.children.length) for (const g of BM.Save.GRADES) {
      const b = document.createElement('button'); b.className = 'grade-btn'; b.dataset.grade = g; b.innerHTML = `${g}<small>grade</small>`;
      tap(b, () => { if (!prof() || BM.Save.setGrade(g) == null) return; BM.Audio.sfx('tap'); applyGrade(); renderChip(); renderProfiles(); });
      gb.appendChild(b);
    }
    for (const b of gb.children) b.classList.toggle('on', !!p && Number(b.dataset.grade) === p.grade);
  }
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
  let towerFrom = 'title'; // HH1 + MMM1 (VVV1): the Tower is entered ONLY from the pinned home slot — back returns home
  const Types = BM.TypeChart({ $, tap, show }); // CCC1
  tap($('btn-types'), () => { BM.Audio.sfx('tap'); Types.open(); });
  const Bonus = BM.BonusScreen({ $, tap, toast, fit, go: (n) => go(n), from: () => towerFrom, itemIcon: (id) => Scr.itemIcon(id), openPrebattle: (id) => { preStage = id; go('prebattle'); } });
  // MMM1 (VVV1): the Tower opens after Brock, from the pinned home slot ONLY — there is no map-side entry
  function openTower() {
    const p = prof();
    if (!(p.cleared[BM.BONUS_OPEN_AFTER] > 0)) { BM.Audio.sfx('deny'); toast('Beat Brock to open the Prism Tower!'); return; }
    towerFrom = 'title'; BM.Audio.sfx('tap'); go('bonus');
  }
  tap($('btn-home-tower'), () => openTower());
  // HH1 pinned home slot: the tower art (the regenerated #260 backdrop) + its state
  function renderHomeTower() {
    const p = prof(), open = !!(p && p.cleared[BM.BONUS_OPEN_AFTER] > 0), art = BM.Sprites.artSrc('ui/bonus_zone'), el = $('btn-home-tower');
    el.querySelector('.ht-art').style.backgroundImage = art ? `url("${art}")` : '';
    el.querySelector('.ht-art').textContent = ''; el.classList.toggle('locked', !open);
    el.querySelector('.ht-sub').textContent = open ? 'XP + treasure · tap!' : '🔒 Beat Brock';
  }
  // P1/MM1: the earn mode lives on the Safari Zone screen (own grade, mixed math + spelling, 1 Poké Ball per right answer)
  tap($('btn-earn'), () => { BM.Audio.sfx('tap'); Chal.openEarn('gacha'); });
  const KMap = BM.MapScreen({ $, tap, toast, go: (n) => go(n), openPrebattle: (id) => { preStage = id; go('prebattle'); } });

  // ---------- home (F5): region tiles replace PLAY; Teams · All Characters · Items below ----------
  const REGIONS = [
    { id: 'kanto', name: 'Kanto', art: 'ui/region_kanto', color: ['#7ec86a', '#2f7fb8'], emoji: '🌋' },
    { id: 'johto', name: 'Johto', art: 'ui/region_johto', color: ['#c9a36a', '#7a4f2f'], emoji: '🔔' },
    { id: 'hoenn', name: 'Hoenn', art: 'ui/region_hoenn', color: ['#5ec9c9', '#2f5fa8'], emoji: '🌊' },
    { id: 'sinnoh', name: 'Sinnoh', art: 'ui/region_sinnoh', color: ['#a8b8e8', '#4f4f8f'], emoji: '❄️' },
    { id: 'unova', name: 'Unova', art: 'ui/region_unova', color: ['#9aa4b8', '#2f3f5f'], emoji: '🌉' }, // the roadmap ends at Unova
  ];
  // a shipped region's locked card says which Champion opens it (Hoenn Step 1: Hoenn opens after the Johto Champion)
  const LOCK_TEXT = { johto: 'Beat the Kanto Champion to open Johto', hoenn: 'Beat the Johto Champion to open Hoenn', sinnoh: 'Beat the Hoenn Champion to open Sinnoh', unova: 'Beat the Sinnoh Champion to open Unova' };
  const titleSpriteEl = $('title-sprite'); // (addendum: the region card shows the REGION — no Pokémon pasted on top)
  // H2 Region Carousel: ONE big region card (its map art), ◀ ▶ arrows + dots flip regions; tap the card = its map.
  let regionAt = 0, swiped = false;
  function renderRegions() {
    const box = $('regions'); box.innerHTML = '';
    const p = prof(), r = REGIONS[regionAt];
    // Johto (Step 1): a region's card is LIVE once the profile reaches it (Kanto always; Johto after the Kanto Champion) — a
    // locked teaser otherwise. Its stage count is its own region's.
    const open = BM.regionReached(r.id, p), RS = (BM.REGION_MAPS[r.id] || {}).stages || [];
    const cleared = RS.filter((s) => p && p.cleared[s.id] > 0).length, total = RS.length;
    const b = document.createElement('button');
    b.className = 'region-tile' + (open ? '' : ' locked'); b.dataset.region = r.id;
    // a WIDE picture fills the card (assets/ui/regions_wide/<key>.png, or Kanto's map); a portrait region tile (#210–#213)
    // is shown whole over the region's gradient instead of being cropped to a strip
    const wide = BM.Sprites.artSrc('ui/regionw_' + r.id) || (BM.REGION_MAPS[r.id] && BM.Sprites.artSrc(BM.REGION_MAPS[r.id].map.art));
    const tall = !wide && BM.Sprites.artSrc(r.art), art = wide || tall, grad = `linear-gradient(160deg, ${r.color[0]}, ${r.color[1]})`;
    b.style.backgroundImage = wide ? `url("${wide}")` : tall ? `url("${tall}"), ${grad}` : grad;
    b.classList.toggle('portrait', !!tall);
    b.innerHTML = (art ? '' : `<span class="rt-emoji">${r.emoji}</span>`) + `<span class="rt-name">${r.name}</span>` +
      `<span class="rt-sub">${open ? (p && p.regionsDone && p.regionsDone[r.id] ? `🏆 ${r.name} complete! · ${cleared} / ${total} stages ✓` : `${cleared} / ${total} stages ✓ · tap to play!`) : LOCK_TEXT[r.id] ? '🔒 ' + LOCK_TEXT[r.id] : '🔒 Coming later'}</span>`;
    b.classList.toggle('complete', !!(p && p.regionsDone && p.regionsDone[r.id]));
    // opens on RELEASE (pointerup) so a sideways swipe flips the region instead of opening it
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); BM.Audio.unlock(); });
    b.addEventListener('pointerup', () => {
      if (swiped) return;
      if (!open) { BM.Audio.sfx('deny'); toast(LOCK_TEXT[r.id] ? LOCK_TEXT[r.id] + '!' : `${r.name} opens in a later update!`); return; }
      BM.Audio.sfx('tap'); mapRegion = r.id; go('map');
    });
    box.appendChild(b);
    const dots = $('reg-dots'); dots.innerHTML = '';
    REGIONS.forEach((x, i) => { const d = document.createElement('i'); d.className = i === regionAt ? 'on' : ''; d.dataset.region = x.id; dots.appendChild(d); });
    renderWallet();
  }
  function flipRegion(k) { regionAt = (regionAt + k + REGIONS.length) % REGIONS.length; BM.Audio.sfx('tap'); renderRegions(); }
  tap($('btn-reg-prev'), () => flipRegion(-1));
  // the carousel still SWIPES: a horizontal drag of ≥ 40 px on the card flips region (a short tap still opens it)
  (function () {
    let x0 = null, y0 = 0;
    $('regions').addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; swiped = false; }, true);
    $('regions').addEventListener('pointerup', (e) => { if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; setTimeout(() => flipRegion(dx < 0 ? 1 : -1), 0); } }, true);
  })();
  tap($('btn-reg-next'), () => flipRegion(1));
  // Ticket wallet (home + gacha): tickets and Poké Balls (+ Master Balls when held)
  function walletHtml() {
    const p = prof(); if (!p) return '';
    const pb = BM.Sprites.artSrc('icons/poke_ball'), mb = BM.Sprites.artSrc('icons/master_ball');
    const i = (src, emo) => (src ? `<img src="${src}" alt="">` : emo);
    return `<span class="w-tk">${BM.ticketIcon()}<b>${p.tickets}</b></span><span class="w-pb">${i(pb, '🔴')}<b>${p.items.poke_ball || 0}</b></span>` +
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
    const xp = BM.Sprites.artSrc('icons/xp_candy_s');
    const tkHtml = BM.ticketIcon();
    if (r.tickets) add(`${tkHtml} +${r.tickets} tickets`);
    if (r.xp) add(`${xp ? `<img src="${xp}" alt="">` : '⭐'} +${r.xp.toLocaleString()} XP${r.xpLines ? ` × ${r.xpLines.length}` : ' each'}`);
    if (r.item) add(`${itemIconHtml(r.item)} ${BM.ITEMS[r.item]}`, 'new');
    if (r.candy) for (const [id, n] of Object.entries(r.candy)) add(`${itemIconHtml(id)} ${n > 1 ? n + '× ' : ''}${BM.ITEMS[id]}`, 'new');
    // T1 (pre-battle preview): the guaranteed win candy's size range
    if (r.preview && BM.winCandy(r.preview)) add(`${BM.winCandyBand(r.preview).table.map(([id]) => itemIconHtml(id)).join('')} + ${BM.WIN_CANDY_N} XP candies every win`, 'new');
    // stage drop table rolls (Phase 4): stored in the bag / ticket wallet
    for (const d of r.drops || []) {
      if (d.item === 'tickets') add(`${tkHtml} +${d.n} bonus tickets`, 'drop');
      else add(`${itemIconHtml(d.item)} ${d.n > 1 ? d.n + '× ' : ''}${BM.ITEMS[d.item]}`, 'drop new');
    }
    if (r.prize) for (const [id, n] of Object.entries(r.prize)) add(`${itemIconHtml(id)} ${n > 1 ? n + '× ' : ''}${BM.ITEMS[id]}${id === 'master_ball' ? '! (the Legendary Safari Zone)' : ''}`, 'new legend');
    if (r.masterBall) add(`${itemIconHtml('master_ball')} Master Ball! (the Legendary Safari Zone)`, 'new legend');
    if (r.gift && r.giftNew !== false) add(`🎁 New character: ${BM.LINES[r.gift].name}!`, 'new');
    if (r.megaUnlocked) add('💎 Mega Evolution unlocked! (Mega Stones: the Safari Zone, the Prism Tower, Johto stages)', 'new legend'); // Johto Step 6
    if (r.megaRayquaza) add('💎 Mega Rayquaza unlocked! (no stone needed)', 'new legend'); // Hoenn Step 6 (U4)
  }
  function renderPrebattle() {
    const st = BM.stageById(preStage), p = prof();
    if (!st.dev && !st.bonus) mapRegion = BM.regionOfStage(st); // ◀ Map / the result's Map return to this stage's region
    BM.Audio.playMusic(st.townMusic);
    const bg = (st.bgArt && BM.Sprites.artSrc('bg/' + st.bgArt)) || BM.Sprites.artSrc('bg/' + st.background);
    $('scr-prebattle').style.backgroundImage = bg ? `url("${bg}")` : '';
    $('pre-kicker').textContent = st.dev ? 'DEV' : st.bonus ? `🗼 Prism Tower · ${st.bonus === 'xp' ? 'XP floor' : 'Treasure vault'}` : `Stage ${st.num} · ${KIND[st.kind]}`;
    show('btn-pre-challenge', !st.bonus); // Clear Stage (auto-clear) does NOT apply to the Prism Tower
    $('btn-pre-challenge').querySelector('.cb-s').textContent = `Answer ${BM.CHALLENGE.GOAL} in a row`; // PP1 subtext
    $('btn-pre-back').textContent = st.bonus ? '◀ Tower' : '◀ Map';
    $('pre-name').textContent = st.name;
    $('pre-sub').textContent = st.leader ? `Leader ${st.leader}` : st.place ? `at the ${st.place}` : '';
    // VV1: a stage with special rules shows them as a badge (Kanto + the Prism Tower never have any)
    const rules = BM.ruleBadges(st), rb = $('pre-rules');
    rb.innerHTML = ''; show('pre-rules', rules.length > 0);
    if (rules.length) {
      rb.innerHTML = '<span class="rb-h">⚠ Special rules</span>' + rules.map((r) => `<span class="rb-r" data-rule="${r.type}">${r.icon === 'ap' ? BM.apIcon() : r.icon} ${r.text}</span>`).join('');
      const { out } = BM.legalTeam(st, p);
      if (out.length) rb.insertAdjacentHTML('beforeend', `<span class="rb-out">Can't battle here: ${out.map((id) => BM.FORMS[p.lines[id].form].name).join(', ')}</span>`);
    }
    const foes = $('pre-foes'); foes.innerHTML = '';
    // Hoenn Step 9.5 Part B: the leader's menace — its icon + one plain line (the ace's species stays hidden until a first win, X1)
    const men = BM.menaceOf(st), pm = $('pre-menace');
    show('pre-menace', !!men);
    pm.innerHTML = men ? `<span class="pm-i">${men.icon}</span><span class="pm-t"></span>` : '';
    if (men) { pm.dataset.menace = men.kind; pm.querySelector('.pm-t').textContent = BM.menaceLine(st, st.dev || BM.Save.revealed(st.id)); }
    // X1 HIDDEN ENEMY INTEL (amends J1): until the profile has DEFEATED this stage once (a challenge auto-clear counts) the
    // preview is black silhouettes + "?" (count visible, species/types hidden); a loss reveals nothing.
    const known = st.dev || BM.Save.revealed(st.id);
    $('pre-foes-h').textContent = known ? "Who you'll meet" : "Who's that Pokémon? Win once to find out!";
    for (const e of BM.stagePreview(st)) {
      const f = BM.FORMS[e.form], d = document.createElement('div');
      d.className = 'foe' + (e.ace ? ' ace' : '') + (known ? '' : ' hidden-foe'); d.dataset.form = known ? e.form : '';
      d.appendChild(Scr.thumb(f, 110, !known));
      if (!known) { const q = document.createElement('span'); q.className = 'fq'; q.textContent = '?'; d.appendChild(q); }
      const n = document.createElement('span'); n.className = 'fn'; n.textContent = (e.ace ? '★ ' : '') + (known ? f.name : '???'); d.appendChild(n);
      if (known) {
        const ty = document.createElement('span'); ty.className = 'ftypes';
        ty.innerHTML = f.types.map((t) => { const ic = BM.Sprites.artSrc('icons/type_' + t); return ic ? `<img src="${ic}" alt="${t}" title="${t}" data-type="${t}">` : `<i data-type="${t}" style="background:${BM.TYPE_COLORS[t]}">${t}</i>`; }).join('');
        d.appendChild(ty);
      }
      const l = document.createElement('span'); l.className = 'fl'; l.textContent = !known ? 'Lv ?' : e.min === e.max ? `Lv ${e.min}` : `Lv ${e.min}–${e.max}`; d.appendChild(l);
      foes.appendChild(d);
    }
    // batch1 step 7: the team row — a Pokémon away from its home region says so ("Away from home — fights at Lv N")
    const tr = $('pre-team'); tr.innerHTML = '';
    for (const id of p.team) {
      const l = p.lines[id]; if (!l) continue;
      const f = BM.FORMS[l.form], tag = BM.awayTag(f, l.level, st), d = document.createElement('div');
      d.className = 'pt-mon' + (tag ? ' away' : ''); d.dataset.line = id;
      d.appendChild(Scr.thumb(f, 72, false));
      const lv = document.createElement('span'); lv.className = 'pt-lv'; lv.textContent = `Lv ${l.level}`; d.appendChild(lv);
      if (tag) { const a = document.createElement('span'); a.className = 'away-tag'; a.textContent = tag; d.appendChild(a); }
      tr.appendChild(d);
    }
    const wins = p.cleared[st.id] || 0;
    $('pre-rew-h').textContent = wins ? `Cleared ×${wins} — replay rewards` : 'First-clear rewards';
    rewardChips({ ...BM.stageRewards(st, !wins), preview: st }, $('pre-rewards'));
    // what this stage's drop table can give (icons only; the roll happens on a win)
    const finds = BM.dropPreview(st, p); // era-gated rows (Sun Stone in the Tower, Mega Stones) only once they can drop
    if (finds.length) { const d = document.createElement('span'); d.className = 'reward finds'; d.innerHTML = 'May find: ' + finds.map((id) => id === 'tickets' ? BM.ticketIcon() : itemIconHtml(id)).join(''); $('pre-rewards').appendChild(d); }
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
        if (r === 'none') { BM.Audio.sfx('deny'); toast(`No ${it.name} yet — find them in the Safari Zone${id === 'dowsing_machine' ? ' or on stages' : ''}!`); return; }
        BM.Audio.sfx(r === 'on' ? 'upgrade' : 'tap'); if (r === 'on') toast(`${it.name}: ${it.blurb}`);
        renderPreItems(); fit($('scr-prebattle'));
      });
      box.appendChild(b);
    }
  }
  tap($('btn-pre-back'), () => { BM.Audio.sfx('tap'); go(BM.isBonus(BM.stageById(preStage)) ? 'bonus' : 'map'); });
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
    hudShown = {};
    const wrap = $('cards'); wrap.innerHTML = ''; cardEls = [];
    const team = B.pocket(mySide).team; // friend battles: the guest's own cards (side -1)
    const n = Math.max(5, team.length);
    wrap.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    wrap.classList.toggle('many', n > 5);
    for (let i = 0; i < n; i++) {
      const c = team[i];
      const el = document.createElement('button');
      if (!c) { el.className = 'card empty'; wrap.appendChild(el); cardEls.push(null); continue; }
      el.className = 'card'; el.dataset.form = c.form.id;
      const cv = document.createElement('canvas'); cv.width = 140; cv.height = 110;
      const sp = BM.Sprites.get(c.form), s = Math.min(100 / sp.h, 132 / sp.w), g = cv.getContext('2d');
      g.drawImage(sp.run[0], 70 - sp.ax * s, 104 - sp.ay * s, sp.w * s, sp.h * s);
      el.innerHTML = '<span class="cd"></span><span class="cdnum"></span>';
      el.prepend(cv);
      const lv = document.createElement('span'); lv.className = 'clv'; lv.textContent = 'Lv ' + c.level; el.appendChild(lv);
      // batch1 step 7: away from its home region → the card says so and the level it fights at
      // friend battles: a capped battle shows true level → fight level ("Lv 65 → 50") — the numbers' reason, like the away tag
      const away = PV ? (c.fightLv !== c.level ? BM.Pvp.levelTag(c.level, c.fightLv) : '') : BM.awayTag(c.form, c.level, B.S.stage);
      if (away) { el.classList.add('away'); const a = document.createElement('span'); a.className = 'away-tag'; a.textContent = away; el.appendChild(a); }
      const name = document.createElement('span'); name.className = 'cname'; name.textContent = c.form.name; el.appendChild(name);
      const cost = document.createElement('span'); cost.className = 'ccost'; cost.innerHTML = BM.apIcon() + c.cost; el.appendChild(cost);
      // VV1: a card this stage's rule keeps out is greyed for the whole battle and SAYS why, in kid words
      if (c.rule) { el.classList.add('rule'); el.dataset.rule = c.rule; const w = document.createElement('span'); w.className = 'crule'; w.innerHTML = `🚫 Costs ${c.cost}<br>Max ${B.S.stage.restrict.apMax} here`; el.appendChild(w); }
      tap(el, () => {
        if (paused) return;
        if (c.rule) { BM.Audio.sfx('deny'); toast(`${c.form.name}: ${c.rule}.`); return; }
        // friend battles: the tap is an INPUT (applied ~0.2 s later on both iPads); 'pending' = already on its way
        const r = PV ? PV.input('spawn', i) : B.spawn(i);
        if (r === 'ok') { dismissHint('spawn'); if (PV) { el.classList.remove('sent'); void el.offsetWidth; el.classList.add('sent'); } } // the spawn event plays the cry (G8)
        else if (r === 'pending') { /* already sent */ } else {
          BM.Audio.sfx('deny'); el.classList.remove('denied'); void el.offsetWidth; el.classList.add('denied');
          if (r === 'full') toast('Field full!'); // Step 2: 15 out already — nothing sent, no AP spent
        }
      });
      wrap.appendChild(el);
      cardEls.push({ el, slot: i, cd: el.querySelector('.cd'), cdnum: el.querySelector('.cdnum'), last: '' });
    }
  }
  tap($('btn-gen'), () => {
    if (paused || !B) return;
    const r = PV ? PV.input('genup') : B.upgradeGen();
    if (r === 'pending') return;
    const gb = $('btn-gen');
    if (r === 'ok') { BM.Audio.sfx('upgrade'); dismissHint('gen'); gb.classList.remove('bump'); void gb.offsetWidth; gb.classList.add('bump'); }
    else { BM.Audio.sfx('deny'); gb.classList.remove('denied'); void gb.offsetWidth; gb.classList.add('denied'); }
  });

  function startBattle(stageId) {
    const st = BM.stageById(stageId);
    if (!BM.isPlayable(st)) return;
    preStage = stageId; genShown = 0; hudShown = {};
    speed = [1, 2, 3].includes(prof().settings.battleSpeed) ? prof().settings.battleSpeed : 1; showSpeed();
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

  let genShown = 0; // N1: generator face (ball) currently drawn
  let hudShown = {}; // Phase 8 perf: last values written to the HUD DOM (write on change only)
  function updateHud() {
    const S = B.S, g = B.genInfo(mySide), pk = B.pocket(mySide);
    // Phase 8 perf: the HUD writes the DOM only when a value CHANGES (it used to rewrite the AP numbers and rebuild the generator
    // cost's ball icon with innerHTML every frame — each write re-styles / re-paints text under the AAA1 shadow-ring outlines)
    const hs = hudShown;
    const ap = Math.floor(pk.ap); if (hs.ap !== ap) { hs.ap = ap; $('ap-num').textContent = ap; }
    if (hs.cap !== g.cap) { hs.cap = g.cap; $('ap-cap').textContent = g.cap; }
    if (hs.lv !== g.level) { hs.lv = g.level; $('gen-lv').textContent = g.level; }
    if (genShown !== g.level) { genShown = g.level; $('gen-icon').innerHTML = BM.genFaceHtml(g.level) + (g.max ? '' : '<i>▲</i>'); $('btn-gen').dataset.ball = BM.GEN_BALLS[g.level]; }
    const cost = g.max ? 'MAX' : g.cost; if (hs.cost !== cost) { hs.cost = cost; $('gen-cost').innerHTML = g.max ? 'MAX' : BM.apIcon() + g.cost; }
    const gb = $('btn-gen'), gs = g.max ? 'max' : pk.ap < g.cost ? 'cant' : 'ready';
    if (hs.gen !== gs) { hs.gen = gs; gb.classList.toggle('cant', gs === 'cant'); gb.classList.toggle('ready', gs === 'ready'); }
    cardEls.forEach((c) => {
      if (!c) return;
      const t = pk.team[c.slot], why = B.canSpawn(c.slot, mySide);
      const state = why + ':' + Math.ceil(t.cd);
      const h = t.cd > 0 ? Math.round((t.cd / t.form.cd) * 1000) / 10 : 0; // the cooldown sweep, in 0.1% steps (smooth, but no rewrite when still)
      if (c.cdH !== h) { c.cdH = h; c.cd.style.height = h + '%'; }
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
      else if (ev.type === 'spawn') BM.Audio.cry(ev.unit.form.id, ev.unit.form.size, ev.unit.side === mySide ? 1 : C.CRY_ENEMY_VOL, ev.unit.side * mySide);
      else if (ev.type === 'end' && !PV) setTimeout(() => showResult(ev.result), 900); // friend battles: the session shows the result
    }
    B.S.events.length = 0;
  }
  let resultMode = 'battle'; // 'battle' | 'challenge' (the challenge-result screen reuses this panel)
  function setResultMode(m) {
    resultMode = m;
    show('btn-retry', m === 'battle'); show('result-art', m === 'challenge');
  }
  function showResult(result, opts = {}) {
    if (!B) return;
    setResultMode('battle');
    const st = B.S.stage;
    $('btn-map').textContent = st.bonus ? '🗼 Prism Tower' : 'Map';
    if (result === 'win') {
      // Bonus XP stages pay the WHOLE team you brought; everything else pays the lines that battled (§4.3)
      const r = BM.Save.recordWin(st.id, st.bonus === 'xp' ? B.S.team.map((c) => c.line) : B.S.battled, Math.random, B.S.items);
      lastRewards = r;
      if (r.first && !st.dev && !st.bonus) KMap.queueWalk(st.id);
      $('result-title').textContent = 'VICTORY!'; $('result-title').classList.remove('lose');
      $('result-sub').textContent = r.first ? `${st.name} cleared! First-clear rewards:` : `${st.name} cleared again!`;
      rewardChips(r, $('result-rewards'));
      for (const id of r.used || []) { const d = document.createElement('span'); d.className = 'reward used'; d.innerHTML = `${itemIconHtml(id)} ${BM.ITEM_INFO[id].name} used${id === 'xp_bonus' ? ' (+50% XP)' : id === 'dowsing_machine' && r.dowsed ? ` → found ${BM.ITEMS[r.dowsed]}!` : ''}`; $('result-rewards').appendChild(d); }
      if (r.giftNew) { const d = document.createElement('span'); d.className = 'reward'; d.textContent = r.giftOnTeam ? 'Added to your team!' : 'Add them on the Team screen!'; $('result-rewards').appendChild(d); }
      renderXpRows(r);
      celebrate(r);
      BM.Audio.playMusic(st.kind === 'gym' ? 'victory_gym' : 'victory'); // gym wins: victory_gym INSTEAD of victory
    } else {
      // M1 LOSS XP, DD1 unmissable (Phase 7.5): effort counts — EVERY Pokémon you brought (all team slots, fought or not)
      // earns 30% of the win XP (+1% per 2% of the den destroyed, max 50%); the defeat screen ALWAYS shows it, per Pokémon.
      // A forfeit (Quit from pause) lands here too and pays the same way.
      const destroyed = 1 - B.S.enemyBase.hp / B.S.enemyBase.max;
      const r = st.dev ? null : BM.Save.recordLoss(st.id, B.S.team.map((c) => c.line), destroyed);
      lastRewards = r;
      $('result-title').textContent = opts.forfeit ? 'Battle ended' : 'Oh no!'; $('result-title').classList.add('lose');
      $('result-sub').textContent = r ? `Good try! Your whole team earned ${r.xp.toLocaleString()} XP each` : 'Your base fell — nothing lost. Try again?';
      $('result-rewards').innerHTML = (r ? `<span class="reward loss-xp">⭐ +${r.xp.toLocaleString()} XP × ${r.xpLines.length} · ${Math.round(r.pct * 100)}% of the win XP · you knocked ${Math.round(destroyed * 100)}% off the den</span>` : '') +
        (B.S.items.length ? `<span class="reward kept">🎒 Your battle items are safe — they're only used up when you win.</span>` : '');
      if (r) renderXpRows(r); else $('result-xp').innerHTML = '';
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
    setResultMode('challenge'); $('btn-map').textContent = 'Map';
    if (r.first && !st.dev) KMap.queueWalk(st.id);
    const bg = BM.Sprites.artSrc('bg/' + st.background);
    $('result-art').style.backgroundImage = bg ? `url("${bg}")` : 'linear-gradient(160deg, #7ec8f5, #b6e3a0)';
    $('result-art').innerHTML = `<span class="ra-tag">⭐ ${BM.CHALLENGE.GOAL} in a row!</span>`;
    $('result-title').textContent = 'STAGE CLEAR!'; $('result-title').classList.remove('lose');
    $('result-sub').textContent = r.first ? `${st.name} cleared by answering! First-clear rewards:` : `${st.name} cleared again by answering!`;
    rewardChips(r, $('result-rewards'));
    if (r.giftNew) { const d = document.createElement('span'); d.className = 'reward'; d.textContent = r.giftOnTeam ? 'Added to your team!' : 'Add them on the Team screen!'; $('result-rewards').appendChild(d); }
    renderXpRows(r);
    celebrate(r);
    BM.Audio.playMusic(st.kind === 'gym' ? 'victory_gym' : 'victory');
    show('scr-result', true);
    fit($('scr-result'));
  }
  // MEWTWO GRANT (Phase 7): the Champion's first clear — a glowing announcement on the result screen (it joins the PC Box
  // at Lv 1) + its cry; the ending screen follows when the result screen is left.
  function celebrate(r) {
    const box = $('result-cele');
    box.innerHTML = '';
    // Sinnoh node 26: a legendary gift WITHOUT a region ending (Arceus, "The Original One") gets the same celebration
    const cele = !!(r && r.giftNew && r.gift && (r.regionComplete || BM.LINES[r.gift].legendary));
    show('result-cele', cele);
    if (!cele) return;
    const f = BM.LINES[r.gift].forms[0];
    box.appendChild(Scr.thumb(f, 150, false));
    box.insertAdjacentHTML('beforeend', `<div class="rc-text"><b>${f.name} joins your team!</b><span>The legend of ${BM.REGION_NAMES[r.regionComplete || BM.LINES[r.gift].region] || 'Kanto'} chose YOU — it's in your PC Box at Lv 1${r.giftOnTeam ? ' and on your team' : ''}.</span></div>`);
    setTimeout(() => BM.Audio.cry(f.id, f.size, 1, 'ui'), 700);
  }
  // ENDING (Phase 7): after the Champion falls for the first time — the `credits` track, a region-complete summary
  // (stages cleared, friends, legendaries) and "Back to map". Kanto then shows complete on the home carousel.
  function showEnding(region) {
    const p = prof(), owned = Object.keys(p.lines).filter((id) => BM.LINES[id] && !BM.LINES[id].enemyOnly);
    const legends = owned.filter((id) => BM.LINES[id].legendary);
    const RS = BM.REGION_MAPS[region].stages, cleared = RS.filter((s) => p.cleared[s.id] > 0).length;
    $('end-title').textContent = `${region[0].toUpperCase() + region.slice(1)} complete!`;
    $('end-sub').textContent = `${p.name}, you beat the Champion and became the hero of ${region[0].toUpperCase() + region.slice(1)}!`;
    $('end-stats').innerHTML = `<div class="es"><b>${cleared} / ${RS.length}</b><span>stages cleared</span></div>` +
      `<div class="es"><b>${owned.length}</b><span>Pokémon friends</span></div><div class="es"><b>${legends.length}</b><span>legendaries</span></div>`;
    const lg = $('end-legends'); lg.innerHTML = '';
    for (const id of legends) { const c = Scr.thumb(BM.LINES[id].forms[0], 96, false); c.dataset.line = id; lg.appendChild(c); }
    // Johto: Kanto's ending opens Johto (it is live now); Johto's ending unlocks Mega Evolution and points at Mt. Silver
    // Hoenn: Johto's ending also opens Hoenn; Hoenn's ending opens Mega Rayquaza and points at the falling star over Sky Pillar
    $('end-next').textContent = { kanto: 'Johto is open — find it on the home screen!', johto: 'Mega Evolution is unlocked — and Hoenn is open! Someone is waiting at the top of Mt. Silver…',
      hoenn: 'Rayquaza can Mega Evolve now! And a falling star is heading for the top of Sky Pillar… — and Sinnoh is open!',
      sinnoh: 'Unova is open! And a strange rift is tearing open above Spear Pillar…', unova: 'You are the hero of five regions! Champion Alder is waiting for one more battle…' }[region] || 'A new adventure is waiting!';
    show('scr-ending', true); fit($('scr-ending'));
    BM.Audio.playMusic('credits');
  }
  tap($('btn-end-map'), () => { BM.Audio.sfx('tap'); show('scr-ending', false); B = null; go('map'); });
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
  tap($('btn-map'), () => { BM.Audio.sfx('tap'); afterResult(() => { const rc = lastRewards && lastRewards.regionComplete; B = null; if (rc) { lastRewards.regionComplete = null; show('scr-result', false); showEnding(rc); } else go(BM.isBonus(BM.stageById(preStage)) ? 'bonus' : 'map'); }); });

  // ---------- PHASE 11: Battle a Friend ----------
  // The battle screen is shared with the campaign; only the inputs (sent, not applied), the side, the mirror and the result differ.
  function startPvp(sess) {
    PV = sess; mySide = sess.mySide; B = sess.B; paused = false;
    genShown = 0; hudShown = {}; speed = sess.speed; showSpeed();
    $('btn-speed').classList.toggle('locked', sess.role !== 'host');
    layout(); R.clearFx(); R.setMirror(mySide === -1);
    $('armed-icons').innerHTML = '';
    window.__battle = B; // test hook
    go('battle'); buildCards(); show('hint', false);
    const me = sess.me.name, fr = sess.friend.name;
    $('pvp-names').innerHTML = `<b class="pn-me"></b><span>VS</span><b class="pn-fr"></b><i>${BM.Pvp.levelName(sess.level)}</i>`;
    $('pvp-names').querySelector('.pn-me').textContent = me; $('pvp-names').querySelector('.pn-fr').textContent = fr;
    show('pvp-names', true);
    BM.Audio.playMusic(B.S.stage.music);
    BM.Audio.preloadCries([...B.S.team, ...B.S.foe.team].map((c) => c.form.id));
  }
  function endPvp() {
    PV = null; mySide = 1; B = null; paused = false;
    R.setMirror(false); R.clearFx(); show('pvp-names', false); $('btn-speed').classList.remove('locked');
    show('scr-fpause', false);
  }
  function pvpPause(on, by) {
    if (!PV) return;
    if (on) BM.Audio.suspend(); else BM.Audio.resume();
    $('fpause-title').textContent = by === 'friend' ? 'Paused by your friend' : 'Paused';
    $('fpause-sub').textContent = by === 'friend' ? `${PV.friend.name} paused the battle. Either of you can resume.` : `${PV.friend.name}'s battle is paused too.`;
    show('scr-fpause', on); if (on) fit($('scr-fpause'));
  }
  function pvpSpeed(v) { speed = v; showSpeed(); }
  const Friend = BM.FriendScreen({ $, tap, toast, show, fit, go: (n) => go(n), screen: () => screen, prof: () => prof(), thumb: (...a) => Scr.thumb(...a),
    startPvp, endPvp, pvpPause, pvpSpeed });
  tap($('btn-friend'), () => { BM.Audio.sfx('tap'); Friend.open(); });

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
    show('grade-set', !!prof()); applyGrade();
    // Johto Step 6: the profile's Mega Evolution state, in kid words
    show('mega-status', !!prof() && settingsFrom !== 'battle');
    if (prof()) { const p = prof(), own = BM.MEGA_STONES.filter((s) => p.items[s] > 0).length;
      $('mega-status').innerHTML = BM.megaUnlocked(p) ? `💎 Mega Evolution: <b>unlocked!</b> · ${own} / ${BM.MEGA_STONES.length} Mega Stones` : '💎 Mega Evolution: 🔒 beat the Johto Champion to unlock it'; }
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
  tap($('btn-pause'), () => { if (PV) { if (PV.state === 'battle' && !PV.paused) { BM.Audio.sfx('tap'); PV.pause(true); } return; } if (B && !B.S.result) openSettings('battle'); });
  // XX1 (Phase 7.6): 1× → 2× → 3× → 1×. The battle runs `speed` × as many FIXED 1/30 s steps per real second — every system
  // (marching, attacks, cooldowns, AP generation, waves, gates) scales together and the simulation is step-for-step identical
  // at any speed, so balance per battle-second is unchanged. Music is never touched (its clock is the audio element's own).
  // The choice is remembered per profile (settings.battleSpeed, save v9).
  function showSpeed() { $('speed-num').textContent = speed + '×'; $('btn-speed').dataset.speed = speed; }
  tap($('btn-speed'), () => {
    if (!B || B.S.result) return;
    // friend battles: the HOST's speed drives both iPads; the guest's button shows it, greyed
    if (PV) { if (PV.role !== 'host') { BM.Audio.sfx('deny'); toast('Your friend picks the battle speed'); return; } PV.setSpeed(speed % 3 + 1); return; }
    speed = speed % 3 + 1; BM.Audio.sfx('tap'); showSpeed();
    if (prof()) { prof().settings.battleSpeed = speed; BM.Save.persist(); }
  });
  tap($('btn-resume'), closeSettings);
  tap($('btn-close-settings'), () => { BM.Audio.sfx('tap'); closeSettings(); });
  // DD1: quitting a started battle is a FORFEIT — it counts as a loss for XP (the defeat screen shows what the team earned)
  tap($('btn-quit'), () => {
    show('scr-pause', false); paused = false; BM.Audio.resume();
    if (B && !B.S.result && !B.S.stage.dev) { B.S.result = 'lose'; B.S.forfeit = true; showResult('lose', { forfeit: true }); return; }
    const bonus = B && BM.isBonus(B.S.stage); B = null; go(bonus ? 'bonus' : 'map');
  });
  document.addEventListener('visibilitychange', () => {
    if (PV) { if (document.hidden && PV.state === 'battle' && !PV.paused) PV.pause(true); return; } // shared pause (both iPads)
    if (document.hidden && screen === 'battle' && B && !B.S.result && !paused) openSettings('battle');
  });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  window.addEventListener('resize', () => {
    layout(); if (B) buildCards(); if (screen === 'map') KMap.layout();
    // rotation / resize: open panels re-fit the new viewport (never scroll)
    for (const o of document.querySelectorAll('.overlay:not(.hidden)')) if (o.querySelector('.fit')) fit(o);
    if (screen === 'prebattle') fit($('scr-prebattle'));
    if (screen === 'friend') Friend.fit();
  });

  // ---------- loop ----------
  const DT = 1 / C.TICK_HZ;
  let acc = 0, lastT = performance.now();
  // Phase 8 perf overlay (dev mode only): "Fill 30" keeps both sides at the field cap — your cards + the stage's own foes
  let stressFill = false;
  function stressTick() {
    if (!stressFill || !B || B.S.result) return;
    const S = B.S; S.ap = 1e6;
    for (let k = 0; k < 4 && B.count(1) < C.MAX_PER_SIDE; k++) { const c = S.team[(S.t * 7 + k) % S.team.length | 0]; c.cd = 0; B.spawn(S.team.indexOf(c)); }
    const pool = S.stage.waves || [];
    for (let k = 0; k < 4 && pool.length && B.count(-1) < C.MAX_PER_SIDE; k++) { const w = pool[(Math.random() * pool.length) | 0]; B.devSpawnEnemy(w.form, w.level); }
  }
  BM.Perf.attach({ fill: () => { stressFill = !stressFill; }, filling: () => stressFill, burst: () => B && B.devBurst() });
  function frame(tms) {
    const now = tms / 1000;
    let dt = Math.min(0.25, (tms - lastT) / 1000); lastT = tms;
    if (screen === 'title') titleSprite(now);
    if (screen === 'map') KMap.tick(tms);
    // friend battles: the session's clock runs every frame (lobby keep-alive, countdown, lockstep stepping)
    Friend.frame(dt);
    if (screen === 'battle' && B && PV) {
      onBattleEvents();
      R.draw(B, performance.now() / 1000);
      updateHud();
    } else if (screen === 'battle' && B) {
      BM.Perf.setOn(devMode); BM.Perf.frameStart(tms);
      let steps = 0;
      if (!paused) {
        acc += dt * speed; // XX1: more fixed steps per real second, never a bigger step
        while (acc >= DT) { B.step(DT); acc -= DT; steps++; }
        if (stressFill) stressTick();
        onBattleEvents();
        tutorialTick();
      }
      BM.Perf.afterSim();
      R.draw(B, performance.now() / 1000);
      BM.Perf.afterDraw();
      updateHud();
      if (BM.Perf.on) BM.Perf.frameEnd({ mine: B.count(1), foes: B.count(-1), fx: R.fxCount, texts: R.textCount, speed, steps, dpr: R.dpr });
    } else if (BM.Perf.on) { BM.Perf.setOn(false); stressFill = false; }
    requestAnimationFrame(frame);
  }

  // real title art / logo / AP icon once their ASSET_PROMPTS entries are DONE (placeholders otherwise)
  function applyArt() {
    const key = BM.Sprites.artSrc('ui/title_key_art');
    if (key) for (const id of ['scr-title', 'scr-profiles']) { $(id).style.backgroundImage = `url("${key}")`; $(id).classList.add('has-art'); }
    const logo = BM.Sprites.artSrc('ui/logo');
    if (logo) for (const id of ['logo', 'logo-pick']) { $(id).innerHTML = `<img src="${logo}" alt="Battle Monsters">`; $(id).classList.add('img'); }
    // N1: AP = a Poké Ball everywhere (the old ⚡ AP icon art is no longer used); the generator face = its level's ball
    document.querySelector('.ap-icon').innerHTML = BM.apIcon('ap-pill-ball');
    // S1: every PC Box spot shows the Pokémon Center PC terminal (📦 until ASSET_PROMPTS #317 lands)
    for (const el of document.querySelectorAll('.pc-ico')) el.innerHTML = BM.pcIcon();
    // batch1 step 8: the Safari Zone button = the Safari Ball (its icon art when icons/safari_ball lands, the CSS ball until then)
    for (const el of document.querySelectorAll('.safari-ico')) el.innerHTML = BM.ballHtml('safari_ball');
    // Phase 11: Battle a Friend = two Poké Balls facing off (VS) — no gambling imagery
    for (const el of document.querySelectorAll('.vs-ico')) el.innerHTML = BM.ballHtml('poke_ball', 'vs-ball') + '<b class="vs-x">VS</b>' + BM.ballHtml('poke_ball', 'vs-ball');
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
  window.BM.debug = { types: Types, get battle() { return B; }, get speed() { return speed; }, startBattle, go, get screen() { return screen; }, map: KMap, bonus: Bonus, render: R, evo: Evo, screens: Scr, gacha: Gacha, challenge: Chal, fit, openPrebattle: (id) => { preStage = id; go('prebattle'); },
    get preStage() { return preStage; }, showEnding, friend: Friend, get pvp() { return PV; }, get mySide() { return mySide; }, get lastRewards() { return lastRewards; }, setDev: (v) => { devMode = !!v; }, stress: (v) => { stressFill = !!v; } };
})();
