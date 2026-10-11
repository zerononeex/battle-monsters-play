// Challenge rules (Phase 6: Math + Spelling, BUILD_PLAN §4.5 / §4.7 as amended by the design addendum). Pure logic on the
// active profile — the screen is challenge_screen.js.
//   ONE mixed stream: math questions and hear-and-spell words interleaved (~50/50, never 3 of one kind in a row). A
//   correct answer of either kind advances the same streak.
//   Mistake allowances are per-profile SETTINGS (sliders): math default 2 (2–10), spelling default 3 (3–10). Every wrong
//   tap greys that option / tile (can't be tapped again) and counts a mistake; reaching the allowance DISCARDS the
//   question/word (the right answer / spelling is shown) and resets the streak to 0. Below it the streak survives.
//   AUTO-CLEAR mode: grade + 2 (capped at 7); 10 correct in a row clears the stage through the SAME code path as a
//   battle win (BM.Save.recordWin: first-clear tickets / XP to the current team / drops / gift), consuming no battle item;
//   a discard ends the run ("7 / 10").
//   TICKET mode: the profile's own grade, until the player stops; 1 ticket per correct + 5 bonus every 10-in-a-row,
//   straight into the wallet.
window.BM = window.BM || {};
BM.CHALLENGE = {
  DUCK_RUN: 0.1, DUCK_SPEAK: 0.02, // P2: music gain during a run / while a word is spoken
  GOAL: 10,                 // auto-clear: correct in a row
  TICKET: 1, BONUS: 5, BONUS_EVERY: 10, // ticket mode (§4.5)
  GRADE_UP: 2,              // auto-clear grade = own grade + 2 (generator capped at 7)
  SLIDERS: { mathMistakes: { def: 2, min: 2, max: 10 }, spellMistakes: { def: 3, min: 3, max: 10 } },
  MAX_SAME_KIND: 2,         // never 3 of one kind in a row
};
BM.Challenge = (function () {
  const CH = BM.CHALLENGE;
  const prof = () => BM.Save.profile();
  const gradeFor = (p, mode) => BM.MathGen.clampGrade((p.grade || 2) + (mode === 'clear' ? CH.GRADE_UP : 0));
  const allowance = (p, kind) => {
    const k = kind === 'math' ? 'mathMistakes' : 'spellMistakes', s = CH.SLIDERS[k], v = p.settings && p.settings[k];
    return Math.max(s.min, Math.min(s.max, Number.isFinite(v) ? Math.round(v) : s.def));
  };
  const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

  // A spelling word for a grade: the grade list, with the Pokémon bonus list mixed in (any grade). `used` avoids repeats.
  function spellWord(grade, rnd, used = new Set()) {
    const g = BM.MathGen.clampGrade(grade);
    const poke = rnd() < BM.SPELL_POKEMON_SHARE;
    const list = poke ? BM.WORDS_POKEMON.filter((w) => BM.FORMS[w[1]]) : BM.WORDS[g];
    let pool = list.filter((w) => !used.has(w[0]));
    if (!pool.length) pool = list;
    const w = pool[Math.floor(rnd() * pool.length)];
    return poke ? { kind: 'spell', word: w[0], form: w[1], pic: null, sentence: w[2], grade: g, pokemon: true }
      : { kind: 'spell', word: w[0], pic: w[1], form: null, sentence: w[2], grade: g, pokemon: false };
  }
  // Letter tiles: the word's letters + 3–5 decoys (letters NOT in the word), shuffled so the tiles in order never spell it.
  function makeTiles(word, rnd) {
    const nDecoy = Math.max(3, Math.min(5, Math.ceil(word.length / 3) + 1));
    const pool = LETTERS.split('').filter((c) => !word.includes(c)), decoys = [];
    while (decoys.length < nDecoy) { const c = pool[Math.floor(rnd() * pool.length)]; if (!decoys.includes(c)) decoys.push(c); }
    const chars = [...word.split(''), ...decoys];
    for (let tries = 0; tries < 50; tries++) {
      for (let i = chars.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [chars[i], chars[j]] = [chars[j], chars[i]]; }
      if (!chars.join('').includes(word)) break;
    }
    return chars.map((ch, id) => ({ id, ch, used: false, grey: false }));
  }

  // A run. opts: { mode: 'clear' | 'tickets', stageId, rnd }
  function start(opts) {
    const p = prof(), rnd = opts.rnd || Math.random, mode = opts.mode === 'clear' ? 'clear' : 'tickets';
    const run = {
      mode, stageId: opts.stageId || null, grade: gradeFor(p, mode), rnd,
      streak: 0, best: 0, asked: 0, correct: 0, tickets: 0, bonuses: 0,
      kinds: [], usedWords: new Set(), q: null, over: false, cleared: false, rewards: null,
    };
    run.next = () => next(run);
    run.tapOption = (t) => tapOption(run, t);
    run.tapTile = (i) => tapTile(run, i);
    run.tapSlot = (i) => tapSlot(run, i);
    next(run);
    return run;
  }
  function nextKind(run) {
    const k = run.kinds, n = k.length;
    if (n >= CH.MAX_SAME_KIND && k.slice(-CH.MAX_SAME_KIND).every((x) => x === k[n - 1])) return k[n - 1] === 'math' ? 'spell' : 'math';
    return run.rnd() < 0.5 ? 'math' : 'spell';
  }
  function next(run) {
    if (run.over || run.cleared) return null;
    const kind = nextKind(run), p = prof();
    let q;
    if (kind === 'math') q = BM.MathGen.question(run.grade, run.rnd);
    else { q = spellWord(run.grade, run.rnd, run.usedWords); run.usedWords.add(q.word); q.tiles = makeTiles(q.word, run.rnd); q.filled = []; }
    q.allow = allowance(p, kind); q.mistakes = 0; q.grey = []; q.done = null; // done: 'correct' | 'discard'
    run.kinds.push(kind); run.asked++;
    run.q = q;
    return q;
  }
  // correct / discard bookkeeping shared by both kinds
  function finish(run, ok) {
    const q = run.q, p = prof();
    q.done = ok ? 'correct' : 'discard';
    const out = { result: q.done, streak: 0 };
    if (ok) {
      run.streak++; run.correct++; run.best = Math.max(run.best, run.streak);
      if (run.mode === 'tickets') {
        let pay = CH.TICKET;
        if (run.streak % CH.BONUS_EVERY === 0) { pay += CH.BONUS; run.bonuses++; out.bonus = CH.BONUS; }
        p.tickets += pay; run.tickets += pay; out.paid = pay;
        BM.Save.persist();
      } else if (run.streak >= CH.GOAL) {
        // the SAME code path as a battle win: XP to the current team, no battle item consumed (armed items untouched)
        run.cleared = true;
        run.rewards = BM.Save.recordWin(run.stageId, p.team.slice(), run.rnd, [], { keepArmed: true });
        out.cleared = true;
      }
    } else {
      run.streak = 0;
      if (run.mode === 'clear') run.over = true; // losing the streak ends an auto-clear run
    }
    out.streak = run.streak;
    return out;
  }
  function tapOption(run, text) {
    const q = run.q;
    if (!q || q.kind !== 'math' || q.done || !q.options.includes(text) || q.grey.includes(text)) return { result: 'ignored' };
    if (text === q.answer) return finish(run, true);
    q.grey.push(text); q.mistakes++;
    if (q.mistakes >= q.allow) return { ...finish(run, false), answer: q.answer };
    return { result: 'wrong', left: q.allow - q.mistakes };
  }
  function tapTile(run, i) {
    const q = run.q, t = q && q.tiles && q.tiles[i];
    if (!q || q.kind !== 'spell' || q.done || !t || t.used || t.grey) return { result: 'ignored' };
    const need = q.word[q.filled.length];
    if (t.ch === need) {
      t.used = true; q.filled.push(i);
      return q.filled.length === q.word.length ? { ...finish(run, true), word: q.word } : { result: 'fill' };
    }
    q.mistakes++;
    // grey the tile unless that letter is still needed later and this tile is one of the ones that must supply it
    const stillNeeded = q.word.slice(q.filled.length).split('').filter((c) => c === t.ch).length;
    const free = q.tiles.filter((x) => x.ch === t.ch && !x.used && !x.grey).length;
    if (free > stillNeeded) { t.grey = true; q.grey.push(i); }
    if (q.mistakes >= q.allow) return { ...finish(run, false), word: q.word };
    return { result: 'wrong', greyed: t.grey, left: q.allow - q.mistakes };
  }
  // Tapping a filled slot returns that letter (and any after it) to the tiles.
  function tapSlot(run, k) {
    const q = run.q;
    if (!q || q.kind !== 'spell' || q.done || k < 0 || k >= q.filled.length) return { result: 'ignored' };
    for (const i of q.filled.slice(k)) q.tiles[i].used = false;
    q.filled.length = k;
    return { result: 'returned' };
  }
  return { start, gradeFor, allowance, spellWord, makeTiles };
})();
