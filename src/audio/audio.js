// WebAudio: SFX + Pokémon-style cries (original synth, never recordings) + key-driven music.
// Music rule: play art-src/music/<key>.mp3 if supplied, else the chiptune fallback for that key.
window.BM = window.BM || {};
BM.Audio = (function () {
  let ac = null, master, musicGain, sfxGain, noiseBuf;
  let musicOn = true, soundOn = true;
  const NOTE_IDX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

  function ensure() {
    if (ac) return ac;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ac = new Ctx();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = musicOn ? 1 : 0; musicGain.connect(master);
    duckGain = ac.createGain(); duckGain.gain.value = duckLevel; duckGain.connect(musicGain); // P2: music → duck → music on/off
    sfxGain = ac.createGain(); sfxGain.gain.value = soundOn ? 1 : 0; sfxGain.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }
  // iOS needs a user gesture before audio can start — for the AudioContext AND for every <audio> element. Music uses ONE
  // shared element (BR-016): the first tap plays it (silent clip) so later tracks may start without a tap — e.g. the
  // victory song, which starts from a timer after the battle ends. A NEW Audio() per track is refused there by iOS.
  const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  let musicEl = null, elUnlocked = false;
  function shared() {
    if (!musicEl) { musicEl = new Audio(); musicEl.preload = 'auto'; musicEl.setAttribute('playsinline', ''); }
    return musicEl;
  }
  function unlock() {
    const el = shared();
    if (!elUnlocked) {
      elUnlocked = true;
      if (!current || !current.el) { // nothing streaming yet: prime the element with silence inside this gesture
        el.src = SILENCE; el.play().then(() => { if (!current || !current.el) el.pause(); }).catch(() => { elUnlocked = false; });
      } else if (el.paused && musicOn) el.play().catch(() => { elUnlocked = false; }); // a track was refused before the first tap
    }
    if (!ensure()) return;
    if (ac.state === 'suspended') ac.resume();
    const b = ac.createBufferSource(); b.buffer = ac.createBuffer(1, 1, 22050); b.connect(ac.destination); b.start(0);
  }
  function freq(n) {
    const m = /^([A-G]#?)(\d)$/.exec(n);
    if (!m) return 0;
    return 440 * Math.pow(2, (NOTE_IDX[m[1]] + 12 * (Number(m[2]) + 1) - 69) / 12);
  }
  const waveCache = {};
  function pulse(duty) {
    if (waveCache[duty]) return waveCache[duty];
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    return (waveCache[duty] = ac.createPeriodicWave(re, im));
  }
  function tone(dest, t, f, dur, vol, wave = 'square', duty = 0.5, slideTo = null) {
    const o = ac.createOscillator(), g = ac.createGain();
    if (wave === 'square' && duty !== 0.5) o.setPeriodicWave(pulse(duty)); else o.type = wave;
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.setValueAtTime(vol, t + Math.max(0.01, dur - 0.03));
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dest, t, dur, vol, hp = 1000) {
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t); s.stop(t + dur);
  }
  function drum(dest, t, ch, vol) {
    if (ch === 'k') tone(dest, t, 150, 0.12, vol * 1.6, 'sine', 0.5, 40);
    else if (ch === 's') noise(dest, t, 0.12, vol, 1200);
    else if (ch === 'h') noise(dest, t, 0.04, vol * 0.5, 6000);
  }

  // ---------- SFX ----------
  const last = {};
  function throttled(name, ms) {
    const now = performance.now();
    if (last[name] && now - last[name] < ms) return true;
    last[name] = now; return false;
  }
  const SFX = {
    tap() { const t = ac.currentTime; tone(sfxGain, t, 880, 0.05, 0.08, 'square', 0.25); },
    deny() { const t = ac.currentTime; tone(sfxGain, t, 140, 0.12, 0.1, 'square', 0.5); tone(sfxGain, t + 0.1, 110, 0.12, 0.1, 'square', 0.5); },
    hit() { if (throttled('hit', 45)) return; noise(sfxGain, ac.currentTime, 0.07, 0.12, 1800); },
    baseHit() { if (throttled('base', 160)) return; const t = ac.currentTime; tone(sfxGain, t, 90, 0.15, 0.18, 'triangle', 0.5, 50); noise(sfxGain, t, 0.1, 0.08, 400); },
    superEffective() { if (throttled('superEffective', 250)) return; const t = ac.currentTime; [523, 659, 784, 1047].forEach((f, i) => tone(sfxGain, t + i * 0.05, f, 0.08, 0.09, 'square', 0.25)); },
    notVery() { if (throttled('nv', 250)) return; tone(sfxGain, ac.currentTime, 330, 0.12, 0.07, 'triangle', 0.5, 220); },
    noEffect() { if (throttled('ne', 250)) return; tone(sfxGain, ac.currentTime, 120, 0.18, 0.12, 'triangle', 0.5, 90); },
    faint() { if (throttled('faint', 80)) return; tone(sfxGain, ac.currentTime, 600, 0.3, 0.07, 'square', 0.125, 120); },
    dodge() { if (throttled('dodge', 200)) return; noise(sfxGain, ac.currentTime, 0.12, 0.06, 3000); },
    upgrade() { const t = ac.currentTime; [392, 523, 659, 784, 1047].forEach((f, i) => tone(sfxGain, t + i * 0.06, f, 0.1, 0.09, 'square', 0.5)); },
    // Phase 6 challenges: a bright two-note "ding" for a right answer, a soft low "bonk" for a wrong tap, a run-up for a
    // 10-in-a-row ticket bonus
    correct() { const t = ac.currentTime; tone(sfxGain, t, 784, 0.09, 0.1, 'square', 0.25); tone(sfxGain, t + 0.08, 1175, 0.16, 0.1, 'square', 0.25); },
    wrong() { const t = ac.currentTime; tone(sfxGain, t, 220, 0.16, 0.12, 'triangle', 0.5, 150); },
    streak() { const t = ac.currentTime; [523, 659, 784, 1047, 1319].forEach((f, i) => tone(sfxGain, t + i * 0.07, f, 0.12, 0.1, 'square', 0.25)); },
    win() {}, lose() {},
  };
  // Supplied sound files (G8): art-src/sfx/<key>.mp3 (BM.SFX_FILES) and art-src/cries/<species>.mp3 (BM.CRY_FILES) are
  // decoded once into AudioBuffers and played through the SFX bus (so the Sound toggle silences them too). Until a file
  // is supplied — or while it is still loading — the WebAudio synth plays that slot. Never fatal.
  const buffers = {}; // src -> AudioBuffer | 'loading' | 'failed'
  function loadBuffer(src) {
    if (!src || buffers[src] || !ensure()) return;
    buffers[src] = 'loading';
    fetch(src).then((r) => r.arrayBuffer()).then((ab) => new Promise((ok, bad) => ac.decodeAudioData(ab, ok, bad)))
      .then((buf) => { buffers[src] = buf; }).catch(() => { buffers[src] = 'failed'; });
  }
  function playBuffer(src, vol) {
    const buf = buffers[src];
    if (!buf || typeof buf === 'string') { loadBuffer(src); return false; }
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = buf; g.gain.value = vol; s.connect(g); g.connect(sfxGain); s.start();
    return true;
  }
  const SFX_FILE_KEYS = { superEffective: 'super_effective' }; // synth name -> reserved art-src/sfx key
  // What the last sound was (tests + dev): { kind: 'sfx'|'cry', key, source: 'mp3'|'synth', vol }; `played` counts
  // sound requests that reached the speakers' bus (nothing counts while Sound is OFF; throttled repeats may still count).
  const stats = { played: 0, last: null };
  function sfx(name) {
    if (!ac || !soundOn) return;
    try {
      const fk = SFX_FILE_KEYS[name], file = fk && BM.SFX_FILES && BM.SFX_FILES[fk];
      if (file) { // a supplied file replaces the synth sting (same throttle); synth while it is still loading
        if (throttled(name, 250)) return;
        if (playBuffer(file, 0.9)) { stats.played++; stats.last = { kind: 'sfx', key: name, source: 'mp3', vol: 0.9 }; return; }
        delete last[name];
      }
      if (SFX[name]) { SFX[name](); stats.played++; stats.last = { kind: 'sfx', key: name, source: 'synth', vol: 1 }; }
    } catch (e) { /* audio is never fatal */ }
  }

  // Spawn cry (G8). Key-driven like music: art-src/cries/<species>.mp3 when the user has supplied one (BM.CRY_FILES,
  // key = BM.cryKey(form)), else an original Pokémon-STYLE synth chirp derived from the form id (deterministic, never a
  // recording). `vol` 1 = player units, enemies play quieter (BM.C.CRY_ENEMY_VOL). Throttled per side so a wave of
  // spawns doesn't become noise.
  function cry(formId, size = 1, vol = 1, side = 1) {
    if (!ac || !soundOn || throttled('cry' + side, 220)) return;
    const form = BM.FORMS && BM.FORMS[formId], key = form && BM.cryKey ? BM.cryKey(form) : formId;
    const file = BM.CRY_FILES && BM.CRY_FILES[key];
    if (file && playBuffer(file, vol)) { stats.played++; stats.last = { kind: 'cry', key, source: 'mp3', vol }; return; }
    synthCry(formId, size, vol);
    stats.played++; stats.last = { kind: 'cry', key, source: 'synth', vol };
  }
  // Starts decoding the supplied cries for these forms (battle start) so the first spawn already uses the file.
  function preloadCries(formIds) {
    if (!BM.CRY_FILES || !ensure()) return;
    for (const id of formIds) { const f = BM.FORMS[id], k = f && BM.cryKey(f); if (k && BM.CRY_FILES[k]) loadBuffer(BM.CRY_FILES[k]); }
    if (BM.SFX_FILES) for (const k of Object.values(SFX_FILE_KEYS)) if (BM.SFX_FILES[k]) loadBuffer(BM.SFX_FILES[k]);
  }
  function synthCry(formId, size, vol) {
    let h = 7;
    for (const c of formId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const r = (k) => ((h >>> k) & 255) / 255;
    const base = (320 + r(0) * 600) / size;
    const t = ac.currentTime, parts = 2 + (h % 2);
    let at = t;
    for (let i = 0; i < parts; i++) {
      const d = 0.07 + r(i * 3 + 2) * 0.08;
      const f0 = base * (1 + (r(i * 5 + 1) - 0.3) * 0.8);
      const f1 = f0 * (0.6 + r(i * 7 + 4) * 0.9);
      tone(sfxGain, at, f0, d, 0.06 * vol, 'square', [0.125, 0.25, 0.5][(h >>> (i + 3)) % 3], f1);
      at += d * 0.85;
    }
  }

  // ---------- P2 music ducking (playtest: kids couldn't hear the spoken spelling word) ----------
  // duck(level): the music plays at `level` (1 = normal) — ~0.1 for a whole challenge run, ~0.02 while a word is spoken.
  // MP3s: iOS ignores <audio>.volume, so the shared element is routed through WebAudio (a gain node) the first time it is
  // ducked with a RUNNING AudioContext (never before — an un-resumed context would silence the music); until then (and if
  // routing is refused) <audio>.volume carries the duck. The synth music sits behind the same duck gain.
  let duckLevel = 1, duckGain = null, elRouted = false;
  function routeEl() {
    if (elRouted || !musicEl || !ac || ac.state !== 'running') return;
    try { const src = ac.createMediaElementSource(musicEl); src.connect(duckGain); musicEl.__bmSrc = src; elRouted = true; musicEl.volume = 0.7; } catch (e) { elRouted = false; }
  }
  function duck(level) {
    duckLevel = Math.max(0, Math.min(1, level));
    if (ensure()) { routeEl(); duckGain.gain.setTargetAtTime(duckLevel, ac.currentTime, 0.05); }
    if (musicEl && !elRouted) musicEl.volume = 0.7 * duckLevel;
  }

  // ---------- Music ----------
  let current = null; // { key, el?, timer?, stop() }
  function playMusic(key) {
    if (!BM.MUSIC_KEYS[key]) { console.warn('Unknown music key (not in MUSIC_PROMPTS.md):', key); return; }
    if (current && current.key === key) return;
    stopMusic();
    const loop = BM.MUSIC_KEYS[key].loop;
    const file = BM.MUSIC_FILES[key];
    if (file) {
      const el = shared();
      el.src = file; el.loop = loop; el.volume = elRouted ? 0.7 : 0.7 * duckLevel;
      el.currentTime = 0;
      if (musicOn) el.play().catch(() => {}); // music off: the track is loaded but stays paused (G4)
      current = { key, el, stop() { el.pause(); } };
      return;
    }
    if (!ensure()) return;
    const song = BM.SONGS[key] || BM.proceduralSong(key);
    current = startSequencer(key, song);
  }
  function startSequencer(key, song) {
    const stepDur = 60 / song.bpm / 4;
    const tracks = song.tracks.map((tr) => ({ ...tr, steps: tr.notes.trim().split(/\s+/) }));
    const total = Math.max(...tracks.map((t) => t.steps.length));
    const out = ac.createGain(); out.gain.value = 1; out.connect(duckGain);
    let step = 0, nextTime = ac.currentTime + 0.08, done = false;
    function noteLen(tr, i) {
      let n = 1;
      while (tr.steps[(i + n) % tr.steps.length] === '-' && n < 32) n++;
      return n;
    }
    const timer = setInterval(() => {
      if (done) return;
      while (nextTime < ac.currentTime + 0.2) {
        if (!song.loop && step >= total) { done = true; break; }
        for (const tr of tracks) {
          const i = step % tr.steps.length, tok = tr.steps[i];
          if (tok === '-' || tok === '.') continue;
          if (tr.drums) drum(out, nextTime, tok, tr.vol);
          else tone(out, nextTime, freq(tok), noteLen(tr, i) * stepDur * 0.95, tr.vol, tr.wave, tr.duty || 0.5);
        }
        step++; nextTime += stepDur;
      }
    }, 25);
    return { key, stop() { clearInterval(timer); out.gain.setValueAtTime(0, ac.currentTime); setTimeout(() => out.disconnect(), 300); } };
  }
  function stopMusic() { if (current) { current.stop(); current = null; } }

  // G4 (BR-025): iOS ignores <audio>.volume, so turning music off must PAUSE the element (and mute the synth bus).
  function setMusic(on) {
    musicOn = on;
    if (musicGain) musicGain.gain.value = on ? 1 : 0;
    if (current && current.el) { if (on) current.el.play().catch(() => {}); else current.el.pause(); }
  }
  function setSound(on) { soundOn = on; if (sfxGain) sfxGain.gain.value = on ? 1 : 0; }
  function suspend() { if (ac && ac.state === 'running') ac.suspend(); if (current && current.el) current.el.pause(); }
  function resume() { if (ac && ac.state === 'suspended') ac.resume(); if (current && current.el && musicOn) current.el.play().catch(() => {}); }

  return { unlock, sfx, cry, preloadCries, playMusic, stopMusic, setMusic, setSound, suspend, resume, duck,
    get duckLevel() { return duckLevel; }, get ctx() { return ac; },
    get currentKey() { return current && current.key; },
    get soundOn() { return soundOn; }, get musicOn() { return musicOn; }, stats,
    // what is playing now: 'mp3' (a supplied art-src/music file) or 'synth' (the WebAudio fallback) — tests + dev
    get currentSource() { return current ? (current.el ? 'mp3' : 'synth') : null; },
    get currentEl() { return current && current.el; },
    // is music audible right now? (an MP3 actually playing, or the synth with music on) — G4 test
    get musicAudible() { return !!current && musicOn && (current.el ? !current.el.paused : true); } };
})();
