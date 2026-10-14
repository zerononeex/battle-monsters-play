// Math challenge generator (Phase 6, BUILD_PLAN §4.7 as amended by the design addendum). Grades K–8 (K = grade 0; K / 1 / 8
// added 2026-10-14, user's son — grades 2–7 unchanged):
//   K  count objects to 20, more / fewer groups, + / − within 10, patterns + shapes
//   G1 add/sub within 20, skip-count by 2s / 5s / 10s, one-step word problems, compare two-digit numbers
//   G2 add/sub to 100, simple ×        G3 add/sub to 1,000, ×/÷ facts       G4 multi-digit ×, long ÷, fractions intro
//   G5 fractions / decimals, multi-step G6 ratios, percents, integers        G7 algebra intro, exponents
//   G8 negatives, one-step equations, squares / exponents, fraction ↔ decimal ↔ percent, area + perimeter
// Every question has 8 options: exactly ONE correct; the 7 distractors are plausible (off-by-one / off-by-ten, swapped
// digits, wrong operation, a forgotten carry, adding the bottoms of fractions…), never duplicated, and never EQUAL in
// value to the answer (so "2/4" can't sit beside a correct "1/2"). Pure + seedable: question(grade, rnd[, n]) — n = the option
// count (default 8; the pre-stage question asks with 4: the answer + the first 3 hand-picked distractors).
// A question may carry `cls` (a style hint for the screens): 'pic' = multi-line picture text (counting, pictured sums),
// 'word' = a word problem (wraps), 'groups' = the options are picture groups (smaller, wrapping option text). Space-separated when several apply.
window.BM = window.BM || {};
BM.MathGen = (function () {
  const OPTIONS = 8;
  let N = OPTIONS; // options wanted for the question being built (question()'s n)
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const MINUS = '−';
  // An option: { t: text shown, v: numeric value (equality test) }
  const I = (n) => ({ t: n < 0 ? MINUS + -n : String(n), v: n });
  function F(n, d) { // a fraction in lowest terms (d > 0); whole numbers show as integers
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1; n /= g; d /= g;
    return d === 1 ? I(n) : { t: (n < 0 ? MINUS + -n : n) + '/' + d, v: n / d };
  }
  const D = (x) => { const v = Math.round(x * 1000) / 1000; return { t: (v < 0 ? MINUS : '') + String(Math.abs(v)), v }; };
  const swapDigits = (n) => { const s = String(Math.abs(n)); if (s.length < 2) return null; const t = s.slice(0, -2) + s.slice(-1) + s.slice(-2, -1); return Number(t) * (n < 0 ? -1 : 1); };
  // column addition / subtraction with the carry / borrow forgotten (a classic error)
  const noCarryAdd = (a, b) => { let r = 0, m = 1; while (a || b) { r += ((a % 10 + b % 10) % 10) * m; a = Math.floor(a / 10); b = Math.floor(b / 10); m *= 10; } return r; };
  const noBorrowSub = (a, b) => { let r = 0, m = 1; while (a || b) { r += Math.abs(a % 10 - b % 10) * m; a = Math.floor(a / 10); b = Math.floor(b / 10); m *= 10; } return r; };
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = (n) => String(n).split('').map((c) => SUP[+c]).join('');
  const neg = (n) => (n < 0 ? MINUS + -n : String(n));
  const par = (n) => (n < 0 ? `(${MINUS}${-n})` : String(n)); // (−4) inside an expression

  // Builds the 8 options: the answer, then the hand-picked plausible distractors in order, then `filler()` values.
  function build(r, grade, topic, text, ans, cands, filler, opts = {}) {
    const out = [ans], seenT = new Set([ans.t]), seenV = [ans.v];
    const ok = (o) => o && Number.isFinite(o.v) && !seenT.has(o.t) && !seenV.some((v) => Math.abs(v - o.v) < 1e-9) && (opts.neg || o.v >= 0);
    const add = (o) => { if (out.length < N && ok(o)) { out.push(o); seenT.add(o.t); seenV.push(o.v); } };
    for (const c of cands) add(typeof c === 'number' ? (opts.dec ? D(c) : I(c)) : c);
    for (let i = 0; i < 400 && out.length < N; i++) { const c = filler(i); add(typeof c === 'number' ? (opts.dec ? D(c) : I(c)) : c); }
    // shuffle (Fisher–Yates with the run's rnd)
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return { kind: 'math', grade, topic, text, answer: ans.t, options: out.map((o) => o.t) };
  }
  // Text-option build (patterns, shapes, picture groups): the answer, then the distractor strings in order (deduped), shuffled.
  function buildText(r, grade, topic, text, ans, cands, extra = {}) {
    const out = [ans];
    for (const c of cands) if (out.length < N && c && !out.includes(c)) out.push(c);
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return { kind: 'math', grade, topic, text, answer: ans, options: out, ...extra };
  }
  const shuffled = (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const THINGS = ['🍎', '⭐', '🐟', '🌸', '🍓', '🐞', '🎈', '🍪', '🐥', '⚽'];
  const row = (e, n) => { const g = []; for (let i = 0; i < n; i += 5) g.push(e.repeat(Math.min(5, n - i))); return g; }; // groups of 5
  const picRows = (e, n) => { const g = row(e, n), out = []; for (let i = 0; i < g.length; i += 2) out.push(g.slice(i, i + 2).join(' ')); return out.join('\n'); }; // 10 per line
  const SHAPES = [['circle', '🔵'], ['square', '🟩'], ['triangle', '🔺'], ['star', '⭐'], ['heart', '❤️'], ['diamond', '🔷']];
  const SHAPE_NAMES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'rectangle', 'oval'];
  const PAT = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '🟤', '⚫'];
  const WHO = ['Pikachu', 'Eevee', 'Bulbasaur', 'Squirtle', 'Charmander', 'Jigglypuff', 'Togepi', 'Psyduck'];
  const STUFF = [['berries', 'berry'], ['Poké Balls', 'Poké Ball'], ['apples', 'apple'], ['shells', 'shell'], ['stickers', 'sticker'], ['leaves', 'leaf']];
  const Pc = (n) => ({ t: n + '%', v: n });
  const cls = (c, q) => { q.cls = c; return q; };

  // Integer filler: nearby values first, wider later (stays ≥ 0 unless negatives are allowed).
  const near = (r, a, spread) => (i) => a + (r() < 0.5 ? -1 : 1) * ri(r, 1, Math.max(3, Math.round(spread * (1 + i / 20))));

  const T = {
    // ---- Kindergarten (grade 0) ----
    countObj(r) { const e = pick(r, THINGS), n = ri(r, 1, 20);
      return cls('pic', build(r, 0, 'count', `How many ${e}?\n${picRows(e, n)}`, I(n), [n + 1, n - 1, n + 2, n - 2, n + 5, n - 5, n + 3], near(r, n, 3))); },
    moreFewer(r) {
      const e = pick(r, THINGS), more = r() < 0.5, counts = shuffled(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, Math.min(N, 8));
      const best = more ? Math.max(...counts) : Math.min(...counts), grp = (n) => row(e, n).join(' ');
      return buildText(r, 0, 'compare', `Which group has ${more ? 'MORE' : 'FEWER'}?`, grp(best), counts.filter((c) => c !== best).map(grp), { cls: 'word groups' }); },
    addTen(r) { const e = pick(r, THINGS), a = ri(r, 1, 6), b = ri(r, 1, 10 - a), s = a + b;
      return cls('pic', build(r, 0, 'add', `${e.repeat(a)} + ${e.repeat(b)}\n${a} + ${b} = ?`, I(s), [s + 1, s - 1, s + 2, s - 2, Math.abs(a - b), a, b], near(r, s, 3))); },
    subTen(r) { const e = pick(r, THINGS), a = ri(r, 2, 10), b = ri(r, 1, Math.min(5, a - 1)), d = a - b;
      return cls('pic', build(r, 0, 'sub', `${a} ${e} take away ${b}\n${a} − ${b} = ?`, I(d), [d + 1, d - 1, d + 2, a + b, a, b, d + 3], near(r, d, 3))); },
    pattern(r) {
      const cols = shuffled(r, PAT), unit = r() < 0.6 ? cols.slice(0, 2) : r() < 0.5 ? cols.slice(0, 3) : [cols[0], cols[0], cols[1]];
      const len = unit.length === 2 ? 5 : 5 + (r() < 0.5 ? 0 : 1), seq = []; for (let i = 0; i < len; i++) seq.push(unit[i % unit.length]);
      const ans = unit[len % unit.length];
      return buildText(r, 0, 'pattern', `What comes next?\n${seq.join(' ')} ❓`, ans, [...unit.filter((c) => c !== ans), ...cols.filter((c) => !unit.includes(c))], { cls: 'pic' }); },
    shape(r) { const [name, e] = pick(r, SHAPES);
      return buildText(r, 0, 'shape', `What shape is this?\n${e}`, name, shuffled(r, SHAPE_NAMES.filter((x) => x !== name)), { cls: 'pic' }); },
    // ---- Grade 1 ----
    add20(r) { const a = ri(r, 2, 15), b = ri(r, 2, 20 - a), s = a + b;
      return build(r, 1, 'add', `${a} + ${b} = ?`, I(s), [s + 1, s - 1, s + 2, s - 2, Math.abs(a - b), s + 10, s - 10], near(r, s, 4)); },
    sub20(r) { const a = ri(r, 6, 20), b = ri(r, 1, a - 1), d = a - b;
      return build(r, 1, 'sub', `${a} − ${b} = ?`, I(d), [d + 1, d - 1, d + 2, d - 2, a + b, d + 10, b], near(r, d, 4)); },
    skipCount(r) { const k = pick(r, [2, 5, 10]), s = k * ri(r, 0, k === 10 ? 6 : k === 5 ? 12 : 20), seq = [s, s + k, s + 2 * k, s + 3 * k], v = s + 4 * k;
      return cls('word', build(r, 1, 'skip', `${seq.join(', ')}, ?`, I(v), [v + 1, v - 1, v + k, v - 2 * k, seq[3] + 1, v + 10, v - 10].filter((x) => x !== seq[3]), near(r, v, k + 2))); },
    wordProblem(r) {
      const who = pick(r, WHO), [pl, sg] = pick(r, STUFF), take = r() < 0.5;
      const a = take ? ri(r, 5, 20) : ri(r, 2, 15), b = take ? ri(r, 1, a - 1) : ri(r, 1, 20 - a), v = take ? a - b : a + b;
      const text = take ? `${who} has ${a} ${a === 1 ? sg : pl}. ${who} gives away ${b}. How many are left?`
        : `${who} has ${a} ${a === 1 ? sg : pl} and finds ${b} more. How many now?`;
      return cls('word', build(r, 1, 'word', text, I(v), [take ? a + b : Math.abs(a - b), v + 1, v - 1, v + 2, v - 2, a, b], near(r, v, 4))); },
    compare2(r) {
      const big = r() < 0.5, a = ri(r, 12, 98), sw = swapDigits(a), base = [a, sw, a + 10, a - 10, a + 1, a - 1, a + 20, a - 20];
      const nums = []; for (const n of [...base, ...shuffled(r, Array.from({ length: 80 }, (_, i) => 10 + i))]) if (nums.length < N && n >= 10 && n <= 99 && !nums.includes(n)) nums.push(n);
      const ans = big ? Math.max(...nums) : Math.min(...nums);
      return buildText(r, 1, 'compare', `Which number is the ${big ? 'BIGGEST' : 'SMALLEST'}?`, String(ans), nums.filter((n) => n !== ans).map(String), { cls: 'word' }); },
    // ---- Grade 2 ----
    add100(r) { const a = ri(r, 10, 89), b = ri(r, 2, 99 - a), s = a + b;
      return build(r, 2, 'add', `${a} + ${b} = ?`, I(s), [s + 1, s - 1, s + 10, s - 10, swapDigits(s), Math.abs(a - b), noCarryAdd(a, b)], near(r, s, 8)); },
    sub100(r) { const a = ri(r, 21, 99), b = ri(r, 3, a - 2), d = a - b;
      return build(r, 2, 'sub', `${a} − ${b} = ?`, I(d), [d + 1, d - 1, d + 10, d - 10, a + b, swapDigits(d), noBorrowSub(a, b)], near(r, d, 8)); },
    mulSimple(r) { const a = pick(r, [2, 5, 10]), b = ri(r, 1, 10), m = a * b;
      return build(r, 2, 'mul', `${a} × ${b} = ?`, I(m), [a * (b + 1), a * (b - 1), a + b, m + 1, m - 1, m + 10], near(r, m, 6)); },
    // ---- Grade 3 ----
    add1000(r) { const a = ri(r, 105, 879), b = ri(r, 15, 990 - a), s = a + b;
      return build(r, 3, 'add', `${a} + ${b} = ?`, I(s), [s + 1, s - 1, s + 10, s - 10, s + 100, s - 100, noCarryAdd(a, b), swapDigits(s)], near(r, s, 20)); },
    sub1000(r) { const a = ri(r, 210, 999), b = ri(r, 15, a - 20), d = a - b;
      return build(r, 3, 'sub', `${a} − ${b} = ?`, I(d), [d + 1, d - 1, d + 10, d - 10, d + 100, noBorrowSub(a, b), a + b, swapDigits(d)], near(r, d, 20)); },
    mulFacts(r) { const a = ri(r, 2, 10), b = ri(r, 2, 10), m = a * b;
      return build(r, 3, 'mul', `${a} × ${b} = ?`, I(m), [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, a + b, m + 1, m - 1], near(r, m, 8)); },
    divFacts(r) { const b = ri(r, 2, 10), q = ri(r, 2, 10), a = b * q;
      return build(r, 3, 'div', `${a} ÷ ${b} = ?`, I(q), [q + 1, q - 1, q + 2, q - 2, a - b, b, a + b], near(r, q, 4)); },
    // ---- Grade 4 ----
    mulMulti(r) {
      const two = r() < 0.5, a = two ? ri(r, 12, 49) : ri(r, 102, 899), b = two ? ri(r, 11, 29) : ri(r, 3, 9), m = a * b;
      const partial = two ? a * (b % 10) + Math.floor(b / 10) * a : a * b + 10;
      return build(r, 4, 'mul', `${a} × ${b} = ?`, I(m), [m + 10, m - 10, m + a, m - a, partial, swapDigits(m), m + 100], near(r, m, Math.max(20, m * 0.05))); },
    longDiv(r) { const d = ri(r, 3, 9), q = ri(r, 14, Math.floor(999 / d)), a = d * q;
      return build(r, 4, 'div', `${a} ÷ ${d} = ?`, I(q), [q + 1, q - 1, q + 10, q - 10, swapDigits(q), a - d, q + 2], near(r, q, 6)); },
    fracOf(r) { const d = pick(r, [2, 3, 4, 5, 10]), k = ri(r, 2, d === 10 ? 9 : 12), n = ri(r, 1, d - 1), N = d * k, ans = n * k;
      return build(r, 4, 'frac', `${n}/${d} of ${N} = ?`, I(ans), [k, N - ans, ans + k, ans - k, ans + 1, n * N, N / n | 0], near(r, ans, 5)); },
    fracAddSame(r) { const d = pick(r, [4, 5, 6, 8, 10, 12]), a = ri(r, 1, d - 2), b = ri(r, 1, d - 1 - a);
      return build(r, 4, 'frac', `${a}/${d} + ${b}/${d} = ?`, F(a + b, d), [F(a + b, d + d), F(a + b + 1, d), F(a + b - 1, d), F(a * b, d), F(Math.abs(a - b), d), F(a + b, d - 1)],
        (i) => F(ri(r, 1, d + 2 + (i >> 4)), pick(r, [d, d, d * 2, d + 1, d - 1, d + 2]))); },
    // ---- Grade 5 ----
    fracAddUnlike(r) {
      const pairs = [[2, 3], [2, 5], [3, 4], [2, 4], [3, 6], [4, 6], [2, 6], [4, 8], [3, 5], [5, 10], [2, 8]];
      const [d1, d2] = pick(r, pairs), a = ri(r, 1, d1 - 1), b = ri(r, 1, d2 - 1), sub = r() < 0.4 && a / d1 > b / d2;
      const n = sub ? a * d2 - b * d1 : a * d2 + b * d1, den = d1 * d2, l = d1 * d2 / gcd(d1, d2);
      return build(r, 5, 'frac', `${a}/${d1} ${sub ? '−' : '+'} ${b}/${d2} = ?`, F(n, den),
        [F(sub ? Math.abs(a - b) : a + b, d1 + d2), F(sub ? Math.abs(a - b) : a + b, l), F(n * l / den + 1, l), F(n * l / den - 1, l), F(a * b, den), F(sub ? a * d2 + b * d1 : Math.abs(a * d2 - b * d1), den)],
        (i) => F(ri(r, 1, 2 * l + (i >> 4)), pick(r, [l, l, 2 * l, d1, d2, d1 + d2]))); },
    decimals(r) {
      const p = pick(r, [10, 100]), x = ri(r, 11, 99 * (p / 10)) / p, y = ri(r, 11, 99 * (p / 10)) / p, sub = r() < 0.5 && x > y, v = sub ? x - y : x + y, st = 1 / p;
      const fx = (z) => D(z).t;
      return build(r, 5, 'dec', `${fx(x)} ${sub ? '−' : '+'} ${fx(y)} = ?`, D(v), [v + st, v - st, v + 1, v - 1, v * 10, v / 10, v + 10 * st, sub ? x + y : Math.abs(x - y)],
        (i) => v + (r() < 0.5 ? -1 : 1) * ri(r, 1, 9 + i) * st, { dec: true }); },
    decTimes(r) { const x = ri(r, 11, 999) / 100, k = pick(r, [10, 100]), v = x * k;
      return build(r, 5, 'dec', `${D(x).t} × ${k} = ?`, D(v), [x * (k === 10 ? 100 : 10), x / 10, x + k, v + 1, v - 1, v + 0.1, x * k * 10], (i) => v + (r() < 0.5 ? -1 : 1) * ri(r, 1, 9 + i) / 10, { dec: true }); },
    multiStep(r) {
      const a = ri(r, 2, 12), b = ri(r, 2, 9), c = ri(r, 2, 30);
      if (r() < 0.5) { const v = a * b + c; return build(r, 5, 'steps', `${a} × ${b} + ${c} = ?`, I(v), [a * (b + c), v + 1, v - 1, a + b + c, v + 10, v - a, a * b - c], near(r, v, 10)); }
      const v = (a + b) * c;
      return build(r, 5, 'steps', `(${a} + ${b}) × ${c} = ?`, I(v), [a + b * c, v + c, v - c, v + 1, v - 1, a * b * c, (a + b) + c], near(r, v, 12)); },
    fracTimesWhole(r) { const d = pick(r, [2, 3, 4, 5, 6, 8]), n = ri(r, 1, d - 1), k = ri(r, 2, 9), N = d * k, v = n * k;
      return build(r, 5, 'frac', `${n}/${d} × ${N} = ?`, I(v), [n * N, k, v + k, v - k, v + 1, N - v, v * 2], near(r, v, 5)); },
    // ---- Grade 6 ----
    ratio(r) { const a = ri(r, 1, 9), b = ri(r, 2, 12), k = ri(r, 2, 9);
      if (r() < 0.5) return build(r, 6, 'ratio', `${a} : ${b} = ? : ${b * k}`, I(a * k), [a + k, a * k + a, a * k - a, b * k - b, a * (k + 1), a * (k - 1), a + b * k - b], near(r, a * k, 6));
      return build(r, 6, 'ratio', `${a} : ${b} = ${a * k} : ?`, I(b * k), [b + k, b * k + b, b * k - b, a * k + b, b * (k + 1), b * (k - 1), b + a * k - a], near(r, b * k, 6)); },
    percent(r) { const pc = pick(r, [5, 10, 20, 25, 30, 40, 50, 75]), base = pick(r, [20, 40, 60, 80, 100, 120, 200, 240, 300, 400]), v = pc * base / 100;
      return build(r, 6, 'pct', `${pc}% of ${base} = ?`, D(v), [base - v, v * 10, v / 10, pc, base / pc, v + pc, v + 5, v - 5].map((x) => D(x)), (i) => Math.max(0, v + (r() < 0.5 ? -1 : 1) * ri(r, 1, 5 + i)), { dec: true }); },
    integers(r) {
      const a = ri(r, -20, 20) || 7, b = ri(r, -15, 15) || -4, sub = r() < 0.5, v = sub ? a - b : a + b;
      return build(r, 6, 'int', `${neg(a)} ${sub ? '−' : '+'} ${par(b)} = ?`, I(v), [-v, v + 1, v - 1, sub ? a + b : a - b, Math.abs(a) + Math.abs(b), -(Math.abs(a) + Math.abs(b)), v + 2, v - 2],
        (i) => v + (r() < 0.5 ? -1 : 1) * ri(r, 1, 6 + i), { neg: true }); },
    intMul(r) { const a = -ri(r, 2, 12), b = ri(r, 2, 12) * (r() < 0.5 ? -1 : 1), v = a * b;
      return build(r, 6, 'int', `${par(a)} × ${par(b)} = ?`, I(v), [-v, a + b, v + 1, v - 1, v + Math.abs(a), v - Math.abs(b), -(a + b)], (i) => v + (r() < 0.5 ? -1 : 1) * ri(r, 1, 8 + i), { neg: true }); },
    // ---- Grade 7 ----
    solve(r) {
      const a = ri(r, 2, 9), x = ri(r, -6, 12) || 3, b = ri(r, -20, 20) || 5, c = a * x + b;
      const sb = b < 0 ? `− ${-b}` : `+ ${b}`;
      return build(r, 7, 'alg', `${a}x ${sb} = ${neg(c)},  x = ?`, I(x), [-x, x + 1, x - 1, c - b, c + b, (c + b) / a, x + 2, c / a].filter((v) => Number.isInteger(v)),
        (i) => x + (r() < 0.5 ? -1 : 1) * ri(r, 1, 5 + i), { neg: true }); },
    power(r) {
      const [a, n] = pick(r, [[2, 3], [2, 4], [2, 5], [2, 6], [3, 2], [3, 3], [3, 4], [4, 2], [4, 3], [5, 2], [5, 3], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [10, 3], [11, 2], [12, 2]]), v = Math.pow(a, n);
      return build(r, 7, 'exp', `${a}${sup(n)} = ?`, I(v), [a * n, Math.pow(a, n - 1), Math.pow(n, a) < 5000 ? Math.pow(n, a) : v + 2 * a, a + n, v + 1, v - 1, v + a, v * 2], near(r, v, Math.max(6, v * 0.1))); },
    sqrt(r) { const s = ri(r, 2, 15), n = s * s;
      return build(r, 7, 'exp', `√${n} = ?`, I(s), [n / 2, s + 1, s - 1, s * 2, s + 2, n - s, s * 3].filter((v) => Number.isInteger(v)), near(r, s, 4)); },
    orderOps(r) { const a = ri(r, 2, 9), b = ri(r, 2, 6), v = a + b * b;
      return build(r, 7, 'exp', `${a} + ${b}${sup(2)} = ?`, I(v), [(a + b) * (a + b), a + b * 2, (a + b) * 2, v + 1, v - 1, a * b * b, a * a + b], near(r, v, 6)); },
    // ---- Grade 8 ----
    negOps(r) {
      const op = pick(r, ['+', '−', '×']), a = (ri(r, 1, 25)) * (r() < 0.6 ? -1 : 1), b = (op === '×' ? ri(r, 2, 12) : ri(r, 1, 25)) * (r() < 0.6 ? -1 : 1);
      const v = op === '+' ? a + b : op === '−' ? a - b : a * b;
      const wrong = op === '+' ? a - b : op === '−' ? a + b : a + b;
      return build(r, 8, 'int', `${neg(a)} ${op} ${par(b)} = ?`, I(v), [-v, wrong, -wrong, v + 1, v - 1, v + 10, v - 10], (i) => v + (r() < 0.5 ? -1 : 1) * ri(r, 1, 6 + i), { neg: true }); },
    oneStep(r) {
      const x = ri(r, -12, 15) || 4;
      if (r() < 0.5) { const a = ri(r, -15, 20) || 6, b = x + a, sa = a < 0 ? `− ${-a}` : `+ ${a}`;
        return build(r, 8, 'alg', `x ${sa} = ${neg(b)},  x = ?`, I(x), [b + a, -x, x + 1, x - 1, b, -b + a, x + 2], (i) => x + (r() < 0.5 ? -1 : 1) * ri(r, 1, 5 + i), { neg: true }); }
      const a = ri(r, 2, 12) * (r() < 0.25 ? -1 : 1), b = a * x;
      return build(r, 8, 'alg', `${a < 0 ? MINUS + -a : a}x = ${neg(b)},  x = ?`, I(x), [b - a, b * a, -x, x + 1, x - 1, b + a, x * 2].filter((v) => Number.isInteger(v)), (i) => x + (r() < 0.5 ? -1 : 1) * ri(r, 1, 5 + i), { neg: true }); },
    squares(r) {
      const t = r();
      if (t < 0.4) { const a = ri(r, 2, 15), v = a * a; return build(r, 8, 'exp', `${a}${sup(2)} = ?`, I(v), [a * 2, v + a, v - a, (a + 1) * (a + 1), (a - 1) * (a - 1), v + 1, v + 10], near(r, v, Math.max(6, v * 0.1))); }
      if (t < 0.7) { const a = ri(r, 2, 9), paren = r() < 0.5, v = paren ? a * a : -(a * a); // (−a)² = a², but −a² = −(a²)
        return build(r, 8, 'exp', paren ? `(${MINUS}${a})${sup(2)} = ?` : `${MINUS}${a}${sup(2)} = ?`, I(v), [-v, -2 * a, 2 * a, v + 1, v - 1, v - a, v + a], (i) => v + (r() < 0.5 ? -1 : 1) * ri(r, 1, 6 + i), { neg: true }); }
      const [a, n] = pick(r, [[2, 3], [2, 4], [2, 5], [3, 3], [4, 3], [5, 3], [10, 3], [10, 4], [2, 0], [7, 0], [1, 6]]), v = Math.pow(a, n);
      return build(r, 8, 'exp', `${a}${sup(n)} = ?`, I(v), [a * n, n === 0 ? 0 : Math.pow(a, n - 1), a + n, v + 1, v * 2, a, n], near(r, v, Math.max(4, v * 0.1))); },
    fdp(r) {
      const pairs = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [1, 25], [1, 8]];
      const [n, d] = pick(r, pairs), pc = n * 100 / d, dec = n / d, t = r();
      if (t < 0.34) return build(r, 8, 'pct', `${n}/${d} = ?%`, Pc(pc), [Pc(n * 10), Pc(d), Pc(pc / 10), Pc(pc * 10), Pc(n + d), Pc(100 - pc), Pc(pc + 5)], (i) => Pc(Math.max(1, pc + (r() < 0.5 ? -1 : 1) * ri(r, 1, 10 + i))), {});
      if (t < 0.67) return build(r, 8, 'dec', `${pc}% = ? (decimal)`, D(dec), [pc, dec * 10, dec / 10, n + d / 100, 1 - dec, dec + 0.1, n / 10], (i) => Math.max(0.01, dec + (r() < 0.5 ? -1 : 1) * ri(r, 1, 9 + i) / 100), { dec: true });
      return build(r, 8, 'frac', `${D(dec).t} = ? (fraction)`, F(n, d), [F(n, d * 10), F(d, n * 10), F(n + 1, d), F(n, d + 1), F(1, n + d), F(n * 10, d), F(d - n, d)], (i) => F(ri(r, 1, 9), pick(r, [2, 4, 5, 8, 10, 20, 100]))); },
    areaPerim(r) {
      if (r() < 0.25) { const b = ri(r, 2, 12) * 2, h = ri(r, 2, 12), v = b * h / 2;
        return cls('word', build(r, 8, 'geo', `Triangle: base ${b}, height ${h}.\nArea = ?`, I(v), [b * h, b + h, 2 * (b + h), v + h, v - h, v + 1, b * h * 2], near(r, v, 6))); }
      const l = ri(r, 3, 15), w = ri(r, 2, l - 1), area = r() < 0.5, v = area ? l * w : 2 * (l + w);
      return cls('word', build(r, 8, 'geo', `Rectangle ${l} by ${w}.\n${area ? 'Area' : 'Perimeter'} = ?`, I(v), [area ? 2 * (l + w) : l * w, l + w, area ? l * w * 2 : l + w + l, v + 1, v - 1, v + l, v - w], near(r, v, 6))); },
  };
  // Grade bands: [topic, weight]
  const BANDS = {
    0: [['countObj', 3], ['moreFewer', 2], ['addTen', 2], ['subTen', 2], ['pattern', 1], ['shape', 1]],
    1: [['add20', 3], ['sub20', 3], ['skipCount', 2], ['wordProblem', 2], ['compare2', 2]],
    2: [['add100', 4], ['sub100', 4], ['mulSimple', 2]],
    3: [['add1000', 3], ['sub1000', 3], ['mulFacts', 2], ['divFacts', 2]],
    4: [['mulMulti', 3], ['longDiv', 3], ['fracOf', 2], ['fracAddSame', 2]],
    5: [['fracAddUnlike', 3], ['decimals', 2], ['decTimes', 1], ['multiStep', 2], ['fracTimesWhole', 2]],
    6: [['ratio', 3], ['percent', 3], ['integers', 3], ['intMul', 1]],
    7: [['solve', 4], ['power', 2], ['sqrt', 2], ['orderOps', 2]],
    8: [['negOps', 2], ['oneStep', 3], ['squares', 2], ['fdp', 2], ['areaPerim', 2]],
  };
  // K = grade 0. A missing / non-numeric grade falls back to 2 (the old default); numbers clamp into K–8.
  const MIN_GRADE = 0, MAX_GRADE = 8, DEFAULT_GRADE = 2;
  const clampGrade = (g) => { const n = g == null || g === '' ? NaN : Math.floor(Number(g)); return Number.isFinite(n) ? Math.max(MIN_GRADE, Math.min(MAX_GRADE, n)) : DEFAULT_GRADE; };
  const gradeLabel = (g) => (Number(g) === 0 ? 'K' : String(g)); // shown as "K" for Kindergarten
  function question(grade, rnd = Math.random, n = OPTIONS) {
    const g = clampGrade(grade), band = BANDS[g];
    let w = rnd() * band.reduce((s, b) => s + b[1], 0);
    const topic = band.find((b) => (w -= b[1]) < 0) || band[0];
    N = Math.max(2, Math.min(OPTIONS, n | 0 || OPTIONS));
    let q;
    try { q = T[topic[0]](rnd); } finally { N = OPTIONS; }
    q.grade = g; q.topicId = topic[0];
    return q;
  }
  return { question, BANDS, OPTIONS, MIN_GRADE, MAX_GRADE, DEFAULT_GRADE, clampGrade, gradeLabel, topics: T };
})();
