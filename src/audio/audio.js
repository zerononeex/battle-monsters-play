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
    sfxGain = ac.createGain(); sfxGain.gain.value = soundOn ? 1 : 0; sfxGain.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }
  // iOS needs a user gesture before audio can start.
  function unlock() {
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
    superEffective() { if (throttled('se', 250)) return; const t = ac.currentTime; [523, 659, 784, 1047].forEach((f, i) => tone(sfxGain, t + i * 0.05, f, 0.08, 0.09, 'square', 0.25)); },
    notVery() { if (throttled('nv', 250)) return; tone(sfxGain, ac.currentTime, 330, 0.12, 0.07, 'triangle', 0.5, 220); },
    noEffect() { if (throttled('ne', 250)) return; tone(sfxGain, ac.currentTime, 120, 0.18, 0.12, 'triangle', 0.5, 90); },
    faint() { if (throttled('faint', 80)) return; tone(sfxGain, ac.currentTime, 600, 0.3, 0.07, 'square', 0.125, 120); },
    upgrade() { const t = ac.currentTime; [392, 523, 659, 784, 1047].forEach((f, i) => tone(sfxGain, t + i * 0.06, f, 0.1, 0.09, 'square', 0.5)); },
    win() {}, lose() {},
  };
  function sfx(name) {
    if (!ac || !soundOn) return;
    try { SFX[name] && SFX[name](); } catch (e) { /* audio is never fatal */ }
  }

  // Pokémon-STYLE cry: original synth chirp derived from the form id (deterministic, not a recording).
  function cry(formId, size = 1) {
    if (!ac || !soundOn || throttled('cry', 220)) return;
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
      tone(sfxGain, at, f0, d, 0.06, 'square', [0.125, 0.25, 0.5][(h >>> (i + 3)) % 3], f1);
      at += d * 0.85;
    }
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
      const el = new Audio(file);
      el.loop = loop; el.volume = musicOn ? 0.7 : 0;
      el.play().catch(() => {});
      current = { key, el, stop() { el.pause(); el.src = ''; } };
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
    const out = ac.createGain(); out.gain.value = 1; out.connect(musicGain);
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

  function setMusic(on) {
    musicOn = on;
    if (musicGain) musicGain.gain.value = on ? 1 : 0;
    if (current && current.el) current.el.volume = on ? 0.7 : 0;
  }
  function setSound(on) { soundOn = on; if (sfxGain) sfxGain.gain.value = on ? 1 : 0; }
  function suspend() { if (ac && ac.state === 'running') ac.suspend(); if (current && current.el) current.el.pause(); }
  function resume() { if (ac && ac.state === 'suspended') ac.resume(); if (current && current.el) current.el.play().catch(() => {}); }

  return { unlock, sfx, cry, playMusic, stopMusic, setMusic, setSound, suspend, resume,
    get currentKey() { return current && current.key; },
    // what is playing now: 'mp3' (a supplied art-src/music file) or 'synth' (the WebAudio fallback) — tests + dev
    get currentSource() { return current ? (current.el ? 'mp3' : 'synth') : null; },
    get currentEl() { return current && current.el; } };
})();
