// Original WebAudio chiptune fallbacks (no existing Pokémon melodies). One per music key slot;
// keys without a hand-written song get a seeded procedural tune, so no slot is ever silent.
// Notation: 16th-note steps separated by spaces. 'C5' = note on, '-' = hold, '.' = rest.
// Drums: k = kick, s = snare, h = hat.
window.BM = window.BM || {};
BM.SONGS = {
  battle_wild: {
    bpm: 152, loop: true,
    tracks: [
      { wave: 'square', duty: 0.25, vol: 0.10, notes:
        'E5 - . E5 D5 - C5 - D5 - E5 - A4 - - - ' +
        'F5 - . F5 E5 - D5 - C5 - D5 - E5 - - - ' +
        'D5 - . D5 C5 - B4 - G4 - B4 - D5 - G5 - ' +
        'E5 - - - D#5 - E5 - B4 - G#4 - E4 - - - ' +
        'A4 - C5 - E5 - A5 - G5 - E5 - C5 - D5 - ' +
        'F5 - E5 - D5 - C5 - A4 - C5 - F5 - - - ' +
        'G5 - F5 - D5 - B4 - D5 - G5 - B5 - - - ' +
        'G#5 - - - E5 - - - B4 - - - E5 - . . ' },
      { wave: 'triangle', vol: 0.20, notes:
        'A2 - A3 - A2 - A3 - A2 - A3 - G2 - G3 - ' +
        'F2 - F3 - F2 - F3 - F2 - F3 - E2 - E3 - ' +
        'G2 - G3 - G2 - G3 - G2 - G3 - B2 - G2 - ' +
        'E2 - E3 - E2 - E3 - E2 - E3 - G#2 - B2 - ' +
        'A2 - A3 - A2 - A3 - A2 - A3 - G2 - G3 - ' +
        'F2 - F3 - F2 - F3 - F2 - F3 - E2 - E3 - ' +
        'G2 - G3 - G2 - G3 - G2 - G3 - B2 - G2 - ' +
        'E2 - E3 - E2 - E3 - E2 - E3 - E2 - E2 - ' },
      { drums: true, vol: 0.18, notes: 'k . h . s . h . k k h . s . h h '.repeat(8) },
    ],
  },
  victory: {
    bpm: 150, loop: false,
    tracks: [
      { wave: 'square', duty: 0.5, vol: 0.11, notes: 'C5 E5 G5 C6 - . G5 C6 - . E6 - - - - - - - D6 - E6 - F6 - E6 - - - - - - - - - ' },
      { wave: 'square', duty: 0.25, vol: 0.07, notes: 'E4 G4 C5 E5 - . C5 E5 - . G5 - - - - - - - B5 - C6 - A5 - G5 - - - - - - - - - ' },
      { wave: 'triangle', vol: 0.2, notes: 'C3 - - - C3 - - - C3 - - - - - - - G2 - - - G2 - - - C3 - - - - - - - - - ' },
      { drums: true, vol: 0.18, notes: 'k . . . s . . . k . s s s s s s k . . . s . . . k . . . . . . . . . ' },
    ],
  },
  // Gym badge fanfare: longer and grander than `victory` (original melody).
  victory_gym: {
    bpm: 132, loop: false,
    tracks: [
      { wave: 'square', duty: 0.5, vol: 0.11, notes:
        'G4 - C5 - E5 - G5 - - - E5 - G5 - - - A5 - G5 - F5 - E5 - D5 - - - - - - - ' +
        'E5 - F5 - G5 - C6 - - - B5 - A5 - - - G5 - A5 - B5 - C6 - - - - - - - - - - - ' },
      { wave: 'square', duty: 0.25, vol: 0.07, notes:
        'E4 - E4 - G4 - C5 - - - C5 - E5 - - - F5 - E5 - D5 - C5 - B4 - - - - - - - ' +
        'C5 - D5 - E5 - G5 - - - G5 - F5 - - - E5 - F5 - G5 - E5 - - - - - - - - - - - ' },
      { wave: 'triangle', vol: 0.2, notes:
        'C3 - - - C3 - - - A2 - - - A2 - - - F2 - - - F2 - - - G2 - - - G2 - - - ' +
        'C3 - - - C3 - - - F2 - - - F2 - - - G2 - - - G2 - - - C3 - - - - - - - - - - - ' },
      { drums: true, vol: 0.18, notes: 'k . h . s . h . '.repeat(8) + 'k . h . s . h . k . s . s s s s k . . . . . . . . . . . . . . . ' },
    ],
  },
  defeat: {
    bpm: 96, loop: false,
    tracks: [
      { wave: 'triangle', vol: 0.22, notes: 'E5 - - . C5 - - . A4 - - . F4 - - - - - - - ' },
      { wave: 'square', duty: 0.125, vol: 0.04, notes: 'C4 - - . A3 - - . F3 - - . D3 - - - - - - - ' },
    ],
  },
};

// Procedural fallback for keys without a hand-written song: deterministic from the key name.
BM.proceduralSong = function (key) {
  let h = 2166136261;
  for (const c of key) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  const minor = /battle|lavender|champion|elite/.test(key);
  const scale = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const roots = ['C', 'D', 'E', 'F', 'G', 'A'];
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIdx = NAMES.indexOf(roots[Math.floor(rnd() * roots.length)]);
  const prog = minor ? [[0, 5, 6, 4], [0, 3, 6, 4], [0, 5, 3, 4]] : [[0, 4, 5, 3], [0, 3, 4, 4], [0, 5, 3, 4]];
  const chords = prog[Math.floor(rnd() * prog.length)];
  const fast = /battle/.test(key);
  const bpm = fast ? 140 + Math.floor(rnd() * 20) : 92 + Math.floor(rnd() * 24);
  const note = (deg, oct) => {
    const semis = scale[((deg % 7) + 7) % 7] + 12 * Math.floor(deg / 7) + rootIdx;
    return NAMES[((semis % 12) + 12) % 12] + (oct + Math.floor(semis / 12));
  };
  let lead = '', bass = '', drums = '';
  let deg = 0;
  for (let rep = 0; rep < 2; rep++) {
    for (const c of chords) {
      for (let s = 0; s < 16; s++) {
        if (s % 4 === 0) { deg = c + [0, 2, 4][Math.floor(rnd() * 3)]; lead += note(deg, 5) + ' '; }
        else if (s % 2 === 0 && rnd() < 0.6) { deg += rnd() < 0.5 ? 1 : -1; lead += note(deg, 5) + ' '; }
        else lead += (rnd() < 0.75 ? '- ' : '. ');
        bass += (s % 4 === 0 ? note(c, 2) : s % 4 === 2 ? note(c + (fast ? 7 : 4), 2) : '-') + ' ';
        drums += (s % 8 === 0 ? 'k' : s % 8 === 4 ? (fast ? 's' : 'h') : (fast && s % 2 === 0 ? 'h' : '.')) + ' ';
      }
    }
  }
  return {
    bpm, loop: true, tracks: [
      { wave: 'square', duty: 0.25, vol: 0.08, notes: lead },
      { wave: 'triangle', vol: 0.18, notes: bass },
      { drums: true, vol: fast ? 0.15 : 0.08, notes: drums },
    ],
  };
};
