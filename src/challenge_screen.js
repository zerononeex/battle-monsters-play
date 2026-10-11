// Challenge screen (Phase 6): opened from a stage's pre-battle screen (🧠 Challenge → Clear this stage / Earn tickets).
// One mixed stream (rules: challenge.js): math = a big question + 8 option buttons; spelling = hear-and-spell — the device
// SPEAKS the word inside a clue sentence (speechSynthesis; 🔊 replays, unlimited), a picture clue, empty slots and
// shuffled letter tiles. The word's text is NEVER on screen until it is answered or discarded — then it is shown spelled
// out with a little celebration (the learning moment). No speech engine → the clue sentence is shown with the word's
// letters blanked (tiles still work). The current screen's music keeps playing; correct / wrong are WebAudio SFX.
window.BM = window.BM || {};
// Text-to-speech wrapper (tests read `log`; `available` false → the blanked-clue fallback).
BM.Speech = (function () {
  const log = [];
  const available = () => typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
  function speak(text) {
    log.push(text);
    if (!available()) return false;
    try {
      const s = window.speechSynthesis; s.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.05;
      s.speak(u); return true;
    } catch (e) { return false; }
  }
  const stop = () => { try { if (available()) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
  return { speak, stop, available, log };
})();

BM.ChallengeScreen = function (ui) {
  const { $, tap, toast, show } = ui;
  const CH = BM.CHALLENGE;
  const prof = () => BM.Save.profile();
  let run = null, stageId = null, timer = 0, lastOut = null;
  const MODE_TXT = { clear: '⭐ Clear the stage', tickets: '🎫 Earn tickets' };

  // ---------- mode chooser (pre-battle → 🧠 Challenge) ----------
  function choose(id) {
    stageId = id;
    const p = prof(), st = BM.stageById(id), gc = BM.Challenge.gradeFor(p, 'clear'), gt = BM.Challenge.gradeFor(p, 'tickets');
    const wins = p.cleared[id] || 0;
    $('btn-ch-clear').innerHTML = `<span class="cp-t">⭐ Clear this stage</span><small>${CH.GOAL} right in a row · Grade ${gc}<br>${wins ? 'replay' : 'first-clear'} rewards, no battle</small>`;
    $('btn-ch-tickets').innerHTML = `<span class="cp-t">🎫 Earn tickets</span><small>Grade ${gt} · 1 🎫 each right<br>+${CH.BONUS} bonus every ${CH.BONUS_EVERY} in a row</small>`;
    $('chmode-help').textContent = `${st.name}: math and spelling, all mixed up!`;
    show('scr-chmode', true); ui.fit($('scr-chmode'));
  }
  tap($('btn-ch-clear'), () => { BM.Audio.sfx('tap'); show('scr-chmode', false); open('clear'); });
  tap($('btn-ch-tickets'), () => { BM.Audio.sfx('tap'); show('scr-chmode', false); open('tickets'); });
  const closeChooser = () => show('scr-chmode', false);
  tap($('btn-chmode-x'), closeChooser);
  $('scr-chmode').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-chmode') { e.preventDefault(); closeChooser(); } });

  // ---------- run ----------
  function open(mode, rnd) {
    clearTimeout(timer);
    run = BM.Challenge.start({ mode, stageId, rnd });
    ui.go('challenge'); // no music change: the pre-battle (town) theme keeps playing
    renderTop(); renderQ();
  }
  function renderTop() {
    const st = BM.stageById(stageId);
    $('ch-mode').textContent = `${MODE_TXT[run.mode]} · Grade ${run.grade}`;
    $('ch-stage').textContent = st.name;
    const m = $('ch-meter'); m.innerHTML = '';
    if (run.mode === 'clear') {
      for (let i = 0; i < CH.GOAL; i++) { const d = document.createElement('i'); d.className = i < run.streak ? 'on' : ''; m.appendChild(d); }
      const n = document.createElement('b'); n.id = 'ch-progress'; n.textContent = `${run.streak} / ${CH.GOAL}`; m.appendChild(n);
      $('ch-earned').textContent = '';
    } else {
      const n = document.createElement('b'); n.id = 'ch-progress'; n.textContent = `🔥 ${run.streak} in a row`; m.appendChild(n);
      const tk = BM.Sprites.artSrc('icons/battle_ticket');
      $('ch-earned').innerHTML = `${tk ? `<img src="${tk}" alt="">` : '🎫'} +<b id="ch-tickets">${run.tickets}</b> <small>this run</small>`;
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
    // spelling: picture + 🔊 on the left; slots + tiles on the right
    const pic = document.createElement('div'); pic.className = 'ch-pic';
    if (q.form && BM.FORMS[q.form]) pic.appendChild(ui.thumb(BM.FORMS[q.form], 180, false)); else pic.textContent = q.pic;
    left.appendChild(pic);
    const speech = BM.Speech.available();
    if (speech) {
      const say = document.createElement('button'); say.className = 'ch-say'; say.id = 'btn-ch-say'; say.setAttribute('aria-label', 'Hear it again'); say.textContent = '🔊';
      tap(say, () => { BM.Audio.sfx('tap'); speak(); }); left.appendChild(say);
    }
    card.appendChild(left);
    const right = document.createElement('div'); right.className = 'ch-right';
    if (!speech) { // fallback: the clue with the word's letters blanked
      const c = document.createElement('div'); c.className = 'ch-clue'; c.id = 'ch-clue';
      c.textContent = q.sentence.replace(new RegExp(q.word, 'ig'), '＿'.repeat(q.word.length));
      right.appendChild(c);
    }
    const slots = document.createElement('div'); slots.className = 'ch-slots'; slots.id = 'ch-slots';
    right.appendChild(slots);
    const tiles = document.createElement('div'); tiles.className = 'ch-tiles'; tiles.id = 'ch-tiles';
    right.appendChild(tiles);
    card.appendChild(right);
    renderSpell();
    if (speech) speak();
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
  function speak() { const q = run.q; if (q && q.kind === 'spell') BM.Speech.speak(`${q.word}. ${q.sentence} ${q.word}.`); }

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
    BM.Audio.sfx(r.result === 'correct' ? (r.bonus ? 'streak' : 'correct') : 'wrong');
    fb.className = 'ch-feedback ' + r.result + ' ' + q.kind;
    let html = '';
    if (q.kind === 'spell') {
      html = `<div class="fb-word">${q.word.split('').map((c) => `<span>${c}</span>`).join('')}</div>`;
      html += `<div class="fb-msg">${r.result === 'correct' ? '🎉 You spelled it! 🎉' : 'That one is spelled like this — keep going!'}</div>`;
    } else html = `<div class="fb-msg">${r.result === 'correct' ? '✨ Correct! ✨' : `It was <b>${q.answer}</b> — keep going!`}</div>`;
    if (r.paid) html += `<div class="fb-pay">+${r.paid} 🎫${r.bonus ? ` (${CH.BONUS_EVERY} in a row bonus!)` : ''}</div>`;
    fb.innerHTML = html; show('ch-feedback', true);
    renderTop();
    if (q.kind === 'spell' && r.result === 'correct') BM.Speech.speak(q.word);
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
    clearTimeout(timer); BM.Speech.stop();
    if (run && run.mode === 'tickets' && run.tickets) toast(`+${run.tickets} tickets this run — great work!`);
    ui.back();
  }
  tap($('btn-ch-stop'), () => { BM.Audio.sfx('tap'); leave(); });

  return { choose, open, advance, speak, rerender: () => { renderTop(); renderQ(); }, get run() { return run; }, get last() { return lastOut; }, get stageId() { return stageId; }, set stageId(v) { stageId = v; } };
};
