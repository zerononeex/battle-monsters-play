// PHASE 11 Battle a Friend — the screens around a live friend battle (the match logic is BM.Pvp, the wire is BM.Net).
// choose (HOST / JOIN) → host: battle level → room code + "Waiting for your friend…" · join: big-letter code entry → lobby (both
// trainers + teams face off, the battle level BIG, READY) → 3-2-1 → the battle (main.js) → result overlay (REMATCH / DONE).
// Nothing here writes to a profile: a friend battle is purely for fun.
window.BM = window.BM || {};
BM.FriendScreen = function (d) {
  const { $, tap, toast, show, fit } = d;
  const P = BM.Pvp, N = BM.Net;
  let pane = 'choose', T = null, sess = null, level = 50, entry = '', online = null, busy = false, inBattle = false, opening = 0;
  const MSG = {
    'friend-left': ['Your friend left', 'Start a new battle any time!'],
    'friend-left-battle': ['Your friend left', 'Your friend left the battle — battle over.'],
    lost: ['Connection lost — battle over', 'No winner this time. Nothing was lost — try again!'],
    'left-drop': ['Lost your friend', 'Lost the connection to your friend — try again!'],
    version: ['Different game versions', "Your friend's game is a different version — update both iPads, then try again."],
    bad: ['Oops!', "Something went wrong talking to your friend's iPad — try again."],
  };

  function setPane(p) {
    pane = p;
    for (const id of ['choose', 'host', 'wait', 'join', 'lobby', 'msg']) show('fr-' + id, id === p);
    fitPane();
  }
  // no scrolling: the visible pane is scaled down to the space under the top bar when it is bigger (phones)
  function fitPane() {
    const el = $('fr-' + pane), box = $('scr-friend').querySelector('.fr-body');
    if (!el || !box) return;
    el.style.transform = '';
    const s = Math.min(1, (box.clientWidth - 4) / el.offsetWidth, (box.clientHeight - 4) / el.offsetHeight);
    el.style.transform = s < 1 ? `scale(${s})` : '';
  }
  function open() {
    d.go('friend'); setPane('choose'); renderChoose();
    // the OPTIONAL PeerJS script loads only now (never at boot): offline = the message, everything else unchanged
    N.ready().then((ok) => { online = ok; renderChoose(); });
  }
  function renderChoose() {
    show('fr-offline', online === false);
    $('btn-fr-host').classList.toggle('off', online === false); $('btn-fr-join').classList.toggle('off', online === false);
    fitPane();
  }
  async function needNet() {
    if (online) return true;
    BM.Audio.sfx('tap');
    online = await N.ready(); renderChoose();
    if (!online) { BM.Audio.sfx('deny'); toast(N.ERR.offline); }
    return online;
  }
  function reset() {
    if (sess && sess.state !== 'closed') sess.leave();
    else if (T) T.close();
    sess = null; T = null; busy = false; opening++;
  }

  // ---------- HOST ----------
  tap($('btn-fr-host'), async () => { if (!(await needNet())) return; BM.Audio.sfx('tap'); renderLevels($('fr-levels'), false); setPane('host'); });
  function renderLevels(box, small) {
    box.innerHTML = '';
    const cur = sess ? sess.level : level;
    for (const lv of P.LEVELS) {
      const b = document.createElement('button');
      b.className = 'fr-lv' + (lv === cur ? ' on' : '') + (lv ? '' : ' ffa'); b.dataset.level = lv;
      b.textContent = lv ? String(lv) : small ? 'Free' : 'Free-for-All';
      tap(b, () => {
        if (sess) { if (sess.setLevel(lv)) BM.Audio.sfx('tap'); renderLobby(); return; }
        level = lv; BM.Audio.sfx('tap'); renderLevels(box, small);
      });
      box.appendChild(b);
    }
    if (!small) $('fr-level-help').textContent = cur ? `Every Pokémon fights at Lv ${cur} — strong and weak, up or down. Fair for everyone!` : 'Every Pokémon fights at its own level.';
  }
  tap($('btn-fr-open'), async () => {
    if (busy) return;
    busy = true; BM.Audio.sfx('tap');
    $('fr-code').textContent = '······'; $('fr-wait-msg').textContent = 'Opening the room…';
    $('fr-wait-level').textContent = `Battle level: ${P.levelName(level)}`;
    setPane('wait');
    const my = ++opening;
    let code = null, err = null;
    for (let i = 0; i < 5 && !code; i++) {
      T = N.create();
      const c = N.makeCode();
      try { await T.host(c); code = c; } catch (e) { err = e; T.close(); T = null; if (e.code !== 'taken') break; }
    }
    if (my !== opening) return; // backed out meanwhile
    busy = false;
    if (!code) { message('Oops!', (err && err.message) || N.ERR.broker); return; }
    $('fr-code').textContent = code; $('fr-code').dataset.code = code;
    $('fr-wait-msg').textContent = 'Waiting for your friend…';
    T.onFail((e) => { if (pane === 'wait') { reset(); message('Oops!', e.message); } });
    T.onConnect(() => { if (pane !== 'wait') return; startSession('host'); });
  });

  // ---------- JOIN ----------
  tap($('btn-fr-join'), async () => { if (!(await needNet())) return; BM.Audio.sfx('tap'); entry = ''; $('fr-join-err').textContent = ''; renderKeys(); setPane('join'); });
  function renderEntry() {
    const box = $('fr-entry'); box.innerHTML = '';
    for (let i = 0; i < N.CODE_LEN; i++) { const s = document.createElement('span'); s.className = 'fr-box' + (i === entry.length ? ' cur' : ''); s.textContent = entry[i] || ''; box.appendChild(s); }
    const go = $('fr-key-go'); if (go) go.classList.toggle('off', entry.length !== N.CODE_LEN || busy);
  }
  function renderKeys() {
    const box = $('fr-keys'); box.innerHTML = '';
    for (const ch of N.ALPHABET) {
      const b = document.createElement('button'); b.className = 'fr-key'; b.textContent = ch; b.dataset.key = ch;
      tap(b, () => { if (busy || entry.length >= N.CODE_LEN) return; entry += ch; BM.Audio.sfx('tap'); $('fr-join-err').textContent = ''; renderEntry(); });
      box.appendChild(b);
    }
    const del = document.createElement('button'); del.className = 'fr-key wide del'; del.id = 'fr-key-del'; del.textContent = '⌫';
    tap(del, () => { if (busy) return; entry = entry.slice(0, -1); BM.Audio.sfx('tap'); renderEntry(); });
    const go = document.createElement('button'); go.className = 'fr-key wide go'; go.id = 'fr-key-go'; go.textContent = 'Connect ▶';
    tap(go, connect);
    box.appendChild(del); box.appendChild(go);
    renderEntry();
  }
  async function connect() {
    if (busy) return;
    if (entry.length !== N.CODE_LEN) { BM.Audio.sfx('deny'); $('fr-join-err').textContent = `The code has ${N.CODE_LEN} letters and numbers`; return; }
    busy = true; BM.Audio.sfx('tap'); renderEntry();
    $('fr-join-err').textContent = 'Connecting…'; $('fr-join-err').classList.add('info');
    const my = ++opening;
    T = N.create();
    try { await T.join(entry); } catch (e) {
      if (my !== opening) return;
      T = null; busy = false; renderEntry(); BM.Audio.sfx('deny');
      $('fr-join-err').classList.remove('info'); $('fr-join-err').textContent = e.message || N.ERR['not-found'];
      return;
    }
    if (my !== opening) return;
    busy = false; $('fr-join-err').classList.remove('info'); $('fr-join-err').textContent = '';
    startSession('guest');
  }

  // ---------- the session ----------
  function startSession(role) {
    const p = d.prof();
    sess = P.Session({ transport: T, role, profile: p, level, speed: [1, 2, 3].includes(p.settings.battleSpeed) ? p.settings.battleSpeed : 1, onEvent });
    window.__friend = sess; // test hook
    $('fr-lobby-msg').textContent = 'Saying hello…';
    setPane('lobby'); renderLobby();
  }
  function onEvent(ev) {
    if (ev.type === 'hello' || ev.type === 'lobby') {
      if (sess.state === 'lobby' && inBattle) leaveBattleScreen(); // a REMATCH: back to the lobby, both READY again
      if (pane !== 'lobby') setPane('lobby');
      if (ev.type === 'hello') BM.Audio.sfx('upgrade');
      renderLobby();
    } else if (ev.type === 'countdown') {
      show('fr-count', true); $('fr-count-n').textContent = String(P.COUNTDOWN); lastCount = P.COUNTDOWN; BM.Audio.sfx('tap');
    } else if (ev.type === 'battle') {
      show('fr-count', false); inBattle = true; d.startPvp(sess);
    } else if (ev.type === 'pause') d.pvpPause(sess.paused, sess.pausedBy);
    else if (ev.type === 'speed') d.pvpSpeed(sess.speed);
    else if (ev.type === 'end') setTimeout(() => showResult(), 900);
    else if (ev.type === 'left' || ev.type === 'lost' || ev.type === 'error') {
      const [t, x] = MSG[ev.reason] || MSG.bad;
      show('fr-count', false); show('scr-fresult', false);
      if (inBattle) leaveBattleScreen();
      if (d.screen() !== 'friend') d.go('friend');
      BM.Audio.sfx('deny'); message(t, x); sess = null; T = null;
    }
  }
  let lastCount = 0;
  function renderLobby() {
    if (!sess) return;
    const me = sess.me, fr = sess.friend, cap = sess.level ?? level, host = sess.role === 'host';
    side($('fr-side-me'), me.name + ' (you)', me.team, me.ready, cap);
    if (fr) side($('fr-side-friend'), fr.name, fr.team, fr.ready, cap);
    else $('fr-side-friend').innerHTML = '<div class="fr-name">…</div><div class="fr-team"></div>';
    $('fr-lv-big').textContent = P.levelName(cap); $('fr-lv-big').dataset.level = cap;
    show('fr-lv-host', host); if (host) renderLevels($('fr-lv-host'), true);
    $('fr-lv-note').textContent = host ? 'Changing it un-readies both of you' : cap ? `Everyone fights at Lv ${cap}` : 'Everyone fights at their own level';
    const rb = $('btn-fr-ready');
    rb.textContent = me.ready ? '✓ Ready! (tap to wait)' : 'READY!';
    rb.classList.toggle('on', me.ready); rb.classList.toggle('off', !fr);
    $('fr-lobby-msg').textContent = !fr ? 'Saying hello…' : sess.rematchAsk && !me.ready ? 'Rematch! Tap READY when you are.' : me.ready && fr.ready ? 'Here we go!' : me.ready ? `Waiting for ${fr.name}…` : fr.ready ? `${fr.name} is ready!` : host ? 'Pick the level, then tap READY' : `${fr.name} picks the level — tap READY if it's OK`;
    fitPane();
  }
  function side(box, name, team, ready, cap) {
    box.innerHTML = '';
    const n = document.createElement('div'); n.className = 'fr-name'; n.textContent = name; box.appendChild(n);
    const t = document.createElement('div'); t.className = 'fr-team';
    for (const e of team) {
      const f = BM.FORMS[e.form], c = document.createElement('div');
      c.className = 'fr-mon' + (P.fightLevel(e.level, cap) !== e.level ? ' capped' : ''); c.dataset.form = e.form;
      c.appendChild(d.thumb(f, 64, false));
      const l = document.createElement('span'); l.className = 'fr-mlv'; l.textContent = P.levelTag(e.level, cap); c.appendChild(l);
      t.appendChild(c);
    }
    box.appendChild(t);
    const r = document.createElement('div'); r.className = 'fr-ready' + (ready ? ' on' : ''); r.textContent = ready ? '✓ READY' : 'not ready'; box.appendChild(r);
  }
  tap($('btn-fr-ready'), () => {
    if (!sess || !sess.friend) { BM.Audio.sfx('deny'); return; }
    if (sess.ready(!sess.me.ready)) BM.Audio.sfx(sess.me.ready ? 'upgrade' : 'tap');
    renderLobby();
  });

  // ---------- result ----------
  function showResult() {
    if (!sess || sess.state !== 'result') return;
    const won = sess.winner === sess.mySide;
    $('fresult-title').textContent = won ? 'YOU WIN!' : `${sess.friend.name} wins!`;
    $('fresult-title').classList.toggle('lose', !won);
    $('fresult-sub').textContent = won ? `You knocked down ${sess.friend.name}'s base!` : 'Great battle! Want a rematch?';
    show('scr-fresult', true); fit($('scr-fresult'));
    BM.Audio.playMusic(won ? 'victory' : 'defeat');
  }
  tap($('btn-frematch'), () => { if (!sess) return; BM.Audio.sfx('tap'); sess.rematch(); }); // → the 'lobby' event (both iPads)
  tap($('btn-fdone'), () => { BM.Audio.sfx('tap'); show('scr-fresult', false); doneHome(); });
  function leaveBattleScreen() { inBattle = false; show('scr-fpause', false); show('scr-fresult', false); d.endPvp(); if (d.screen() === 'battle') d.go('friend'); setPane('lobby'); BM.Audio.playMusic('title'); }
  function doneHome() { reset(); if (inBattle) { inBattle = false; d.endPvp(); } show('scr-fpause', false); d.go('title'); }
  tap($('btn-fresume'), () => { if (sess && sess.paused) { BM.Audio.sfx('tap'); sess.pause(false); } });
  tap($('btn-fleave'), () => { BM.Audio.sfx('tap'); doneHome(); });

  // ---------- messages / back ----------
  function message(title, text) { $('fr-msg-title').textContent = title; $('fr-msg-text').textContent = text; setPane('msg'); }
  tap($('btn-fr-msg-ok'), () => { BM.Audio.sfx('tap'); reset(); setPane('choose'); renderChoose(); });
  tap($('btn-fr-back'), () => {
    BM.Audio.sfx('tap');
    if (pane === 'choose' || pane === 'msg' || pane === 'lobby') { reset(); d.go('title'); return; }
    reset(); setPane('choose'); renderChoose();
  });

  // every frame (main.js): the session's clock — countdown, lockstep stepping, keep-alive. Returns the sim steps taken.
  function frame(dt) {
    if (!sess) return 0;
    const steps = sess.update(dt);
    if (sess && sess.state === 'countdown') { const n = Math.max(1, Math.ceil(sess.countdown)); if (n !== lastCount) { lastCount = n; $('fr-count-n').textContent = String(n); BM.Audio.sfx('tap'); } }
    return steps;
  }
  return { open, frame, fit: fitPane, get session() { return sess; }, get pane() { return pane; }, get online() { return online; }, leave: doneHome };
};
