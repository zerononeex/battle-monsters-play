// Question screen (Phase 6; Phase 7.5 PP1/MM1/NN1). Player-facing names: "Clear Stage" (opened from a stage's pre-battle
// screen — 6 right in a row at grade + 2 clears it) and "Answer & Earn Poké Balls" (opened from the Safari Zone — 1 Poké Ball
// per right answer, +3 bonus at every 5th in a row, VVV1). The word "Challenge" is internal only. One mixed stream (rules: challenge.js): math = a big question +
// 8 option buttons; spelling = NN1 VISUAL spelling — the word is SHOWN in writing with its picture clue (V2: only where the
// picture is the word itself), empty slots and shuffled letter tiles; nothing is spoken (hear-and-spell was removed: speech
// never worked on the user's iPad). The current screen's music keeps playing; correct / wrong are WebAudio SFX.
window.BM = window.BM || {};
BM.ChallengeScreen = function (ui) {
  const { $, tap, toast, show } = ui;
  const CH = BM.CHALLENGE;
  const prof = () => BM.Save.profile();
  let run = null, stageId = null, timer = 0, lastOut = null;
  const MODE_TXT = { clear: '⭐ Clear Stage', earn: 'Answer & Earn Poké Balls' };

  // ---------- Clear Stage panel (pre-battle → Clear Stage) ----------
  function choose(id) {
    stageId = id;
    const p = prof(), st = BM.stageById(id), gc = BM.Challenge.gradeFor(p, 'clear');
    const wins = p.cleared[id] || 0;
    $('btn-ch-clear').innerHTML = `<span class="cp-t">⭐ Clear this stage</span><small>Answer ${CH.GOAL} in a row · Grade ${gc}<br>${wins ? 'replay' : 'first-clear'} rewards, no battle</small>`;
    // P1/MM1: the pre-battle button is Clear Stage only; Poké Balls are earned in the Safari Zone
    $('btn-ch-tickets').innerHTML = `<span class="cp-t">${BM.ballHtml('poke_ball', 'cp-ball')} Want Poké Balls?</span><small>Answer & earn them in the Safari Zone</small>`;
    $('chmode-help').textContent = `${st.name}: math and spelling, all mixed up!`;
    show('scr-chmode', true); ui.fit($('scr-chmode'));
  }
  tap($('btn-ch-clear'), () => { BM.Audio.sfx('tap'); show('scr-chmode', false); open('clear'); });
  tap($('btn-ch-tickets'), () => { BM.Audio.sfx('deny'); toast('Poké Balls are earned in the 🎰 Safari Zone!'); });
  const closeChooser = () => show('scr-chmode', false);
  tap($('btn-chmode-x'), closeChooser);
  $('scr-chmode').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-chmode') { e.preventDefault(); closeChooser(); } });

  // ---------- run ----------
  function open(mode, rnd) {
    clearTimeout(timer);
    run = BM.Challenge.start({ mode, stageId: mode === 'earn' ? null : stageId, rnd });
    ui.go('challenge'); // no music change: the screen's theme keeps playing (NN1: nothing is spoken, so no ducking)
    renderTop(); renderQ();
  }
  // P1/MM1: the earn mode is launched from the SAFARI ZONE ("Answer & Earn Poké Balls") — earn where you spend.
  function openEarn(from) { earnFrom = from || 'gacha'; stageId = null; open('earn'); }
  let earnFrom = null;
  function renderTop() {
    const st = run.stageId && BM.stageById(run.stageId);
    $('ch-mode').textContent = `${MODE_TXT[run.mode]} · Grade ${run.grade}`;
    $('ch-stage').innerHTML = st ? '' : `${BM.ballHtml('poke_ball', 'ch-ball')} Safari Zone`; if (st) $('ch-stage').textContent = st.name;
    const m = $('ch-meter'); m.innerHTML = '';
    if (run.mode === 'clear') {
      for (let i = 0; i < CH.GOAL; i++) { const d = document.createElement('i'); d.className = i < run.streak ? 'on' : ''; m.appendChild(d); }
      const n = document.createElement('b'); n.id = 'ch-progress'; n.textContent = `${run.streak} / ${CH.GOAL}`; m.appendChild(n);
      $('ch-earned').textContent = '';
    } else {
      const n = document.createElement('b'); n.id = 'ch-progress'; n.textContent = `🔥 ${run.streak} in a row`; m.appendChild(n);
      $('ch-earned').innerHTML = `${BM.ballHtml('poke_ball', 'ch-ball')} +<b id="ch-balls">${run.balls}</b> <small>this run</small>`;
    }
  }
  function renderQ() {
    const q = run.q, card = $('ch-card');
    card.innerHTML = ''; card.className = 'ch-card ' + q.kind; card.dataset.kind = q.kind;
    show('ch-feedback', false);
    const left = document.createElement('div'); left.className = 'ch-left';
    if (q.kind === 'math') {
      card.innerHTML = `<div class="ch-q" id="ch-q"></div><div class="ch-opts" id="ch-opts"></div>`;
      $('ch-q').textContent = q.text;
      for (const o of q.options) {
        const b = document.createElement('button'); b.className = 'ch-opt' + (q.grey.includes(o) ? ' grey' : ''); b.dataset.opt = o; b.textContent = o;
        tap(b, () => onMath(o, b));
        $('ch-opts').appendChild(b);
      }
      renderTries();
      return;
    }
    // NN1 spelling: the word SHOWN in writing + its picture clue (V2: only where the picture IS the word) on the left;
    // slots + letter tiles on the right — copy the word with the tiles. Nothing is spoken.
    const pic = document.createElement('div'); pic.className = 'ch-pic';
    if (q.form && BM.FORMS[q.form]) pic.appendChild(ui.thumb(BM.FORMS[q.form], 180, false));
    else if (q.pic) pic.textContent = q.pic;
    if (q.form || q.pic) left.appendChild(pic);
    else left.classList.add('word-only'); // V2: no picture for this word — the written word carries it, shown big
    const word = document.createElement('div'); word.className = 'ch-word'; word.id = 'ch-word'; word.textContent = q.word;
    word.style.fontSize = `min(${q.form || q.pic ? 8 : 11}vh, ${(27 / q.word.length).toFixed(2)}vw)`; // long words shrink to fit the column
    left.appendChild(word);
    card.appendChild(left);
    const right = document.createElement('div'); right.className = 'ch-right';
    const c = document.createElement('div'); c.className = 'ch-clue'; c.id = 'ch-clue'; c.textContent = 'Spell it with the letters!';
    right.appendChild(c);
    const slots = document.createElement('div'); slots.className = 'ch-slots'; slots.id = 'ch-slots';
    right.appendChild(slots);
    const tiles = document.createElement('div'); tiles.className = 'ch-tiles'; tiles.id = 'ch-tiles';
    right.appendChild(tiles);
    card.appendChild(right);
    renderSpell();
  }
  // slots + tiles (re-rendered after every tap)
  function renderSpell() {
    const q = run.q, slots = $('ch-slots'), tiles = $('ch-tiles');
    slots.innerHTML = ''; tiles.innerHTML = '';
    const n = q.word.length, big = n > 9;
    slots.style.setProperty('--n', n); tiles.style.setProperty('--n', q.tiles.length);
    slots.classList.toggle('long', big); tiles.classList.toggle('long', q.tiles.length > 12);
    for (let k = 0; k < n; k++) {
      const s = document.createElement('button'); s.className = 'ch-slot' + (k < q.filled.length ? ' full' : '') + (k === q.filled.length ? ' next' : '');
      s.dataset.slot = k; s.textContent = k < q.filled.length ? q.tiles[q.filled[k]].ch : '';
      tap(s, () => { const r = run.tapSlot(k); if (r.result === 'returned') { BM.Audio.sfx('tap'); renderSpell(); } });
      slots.appendChild(s);
    }
    q.tiles.forEach((t, i) => {
      const b = document.createElement('button'); b.className = 'ch-tile' + (t.used ? ' used' : '') + (t.grey ? ' grey' : '');
      b.dataset.tile = i; b.textContent = t.used ? '' : t.ch;
      tap(b, () => onTile(i, b));
      tiles.appendChild(b);
    });
    renderTries();
  }
  function renderTries() {
    const q = run.q; let el = $('ch-tries');
    if (!el) { el = document.createElement('div'); el.id = 'ch-tries'; el.className = 'ch-tries'; $('ch-card').appendChild(el); }
    el.innerHTML = '';
    for (let i = 0; i < q.allow; i++) { const h = document.createElement('i'); h.textContent = i < q.allow - q.mistakes ? '❤️' : '🤍'; el.appendChild(h); }
  }
  // V1: short utterances — the word alone, then the clue sentence (which contains it)

  function onMath(o, btn) {
    const r = run.tapOption(o);
    if (r.result === 'ignored') return;
    lastOut = r;
    if (r.result === 'wrong') { BM.Audio.sfx('wrong'); btn.classList.add('grey', 'shake'); renderTries(); return; }
    for (const b of document.querySelectorAll('.ch-opt')) b.classList.toggle('right', b.dataset.opt === run.q.answer);
    if (r.result === 'discard') btn.classList.add('grey');
    after(r);
  }
  function onTile(i, btn) {
    const r = run.tapTile(i);
    if (r.result === 'ignored') return;
    lastOut = r;
    if (r.result === 'fill') { BM.Audio.sfx('tap'); renderSpell(); return; }
    if (r.result === 'wrong') { BM.Audio.sfx('wrong'); renderSpell(); const nb = document.querySelector(`.ch-tile[data-tile="${i}"]`); if (nb) nb.classList.add('shake'); return; }
    renderSpell();
    after(r);
  }
  // correct / discard: feedback (the word spelled out for spelling), then the next question — or the end of the run
  function after(r) {
    const q = run.q, fb = $('ch-feedback');
    BM.Audio.sfx(r.result === 'correct' ? (r.cleared ? 'streak' : 'correct') : 'wrong');
    fb.className = 'ch-feedback ' + r.result + ' ' + q.kind;
    let html = '';
    if (q.kind === 'spell') {
      html = `<div class="fb-word">${q.word.split('').map((c) => `<span>${c}</span>`).join('')}</div>`;
      html += `<div class="fb-msg">${r.result === 'correct' ? '🎉 You spelled it! 🎉' : 'That one is spelled like this — keep going!'}</div>`;
    } else html = `<div class="fb-msg">${r.result === 'correct' ? '✨ Correct! ✨' : `It was <b>${q.answer}</b> — keep going!`}</div>`;
    if (r.paid) html += `<div class="fb-pay">+${r.paid} ${BM.ballHtml('poke_ball', 'fb-ball')} Poké Ball${r.paid > 1 ? 's' : ''}!</div>`; // MM1
    fb.innerHTML = html; show('ch-feedback', true);
    renderTop();
    const wait = q.kind === 'spell' ? 2200 : r.result === 'correct' ? 800 : 1800;
    clearTimeout(timer);
    timer = setTimeout(advance, wait);
  }
  function advance() {
    clearTimeout(timer);
    if (!run || screenNot() || !run.q.done) return;
    show('ch-feedback', false);
    if (run.cleared) { ui.cleared(run); return; }
    if (run.over) { showOver(); return; }
    run.next(); renderTop(); renderQ();
  }
  const screenNot = () => ui.screen() !== 'challenge';
  $('ch-feedback').addEventListener('pointerdown', (e) => { e.preventDefault(); advance(); }); // tap = skip the wait

  // auto-clear run ended by a discard: "7 / 10"
  function showOver() {
    $('chover-n').textContent = `${run.best} / ${CH.GOAL}`;
    $('chover-sub').textContent = run.best >= 7 ? 'So close — you can do it!' : 'Good try — have another go!';
    show('scr-chover', true); ui.fit($('scr-chover'));
  }
  tap($('btn-chover-again'), () => { BM.Audio.sfx('tap'); show('scr-chover', false); open('clear'); });
  tap($('btn-chover-back'), () => { BM.Audio.sfx('tap'); show('scr-chover', false); leave(); });
  function leave() {
    clearTimeout(timer);
    if (run && run.mode === 'earn' && run.balls) toast(`+${run.balls} Poké Ball${run.balls > 1 ? 's' : ''} this run — great work!`);
    if (run && run.mode === 'earn' && earnFrom) { const f = earnFrom; earnFrom = null; ui.go(f); return; } // back to the Safari Zone: live totals
    ui.back();
  }
  tap($('btn-ch-stop'), () => { BM.Audio.sfx('tap'); leave(); });

  return { choose, open, openEarn, leave, advance, rerender: () => { renderTop(); renderQ(); }, get run() { return run; }, get last() { return lastOut; }, get stageId() { return stageId; }, set stageId(v) { stageId = v; } };
};
