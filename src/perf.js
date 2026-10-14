// Phase 8 step 5 — performance overlay (hidden dev mode only: hold a logo 2 s, or ?dev). Reads the numbers off a real iPad:
//   FPS (and the 1% low) · frame interval ms (avg / worst of the last 2 s) · the JS work split per frame: sim (all fixed steps,
//   so 3× battle speed shows as ~3× sim) · draw (canvas) · hud (DOM) · units per side · fx + floating texts · battle speed.
// Two stress buttons make the worst cases reproducible on the device: "Fill 30" (2 × the field cap) keeps BOTH sides topped up at the field cap
// (20 + 20) for as long as it is on; "Burst" fires a timed burst at once. Nothing here runs unless dev mode is on.
window.BM = window.BM || {};
BM.Perf = (function () {
  const N = 240; // ring buffer of frames (~4 s at 60 fps)
  const iv = new Float32Array(N), sim = new Float32Array(N), draw = new Float32Array(N), hud = new Float32Array(N);
  let i = 0, n = 0, lastT = 0, t0 = 0, tSim = 0, tDraw = 0, el = null, lastShow = 0, info = {}, hooks = {};
  let on = false;
  const now = () => performance.now();
  function frameStart(tms) {
    if (!on) return;
    if (lastT) { iv[i] = tms - lastT; }
    lastT = tms; t0 = now(); tSim = tDraw = t0;
  }
  function afterSim() { if (on) tSim = now(); }
  function afterDraw() { if (on) tDraw = now(); }
  function frameEnd(o) {
    if (!on) return;
    const t = now();
    sim[i] = tSim - t0; draw[i] = tDraw - tSim; hud[i] = t - tDraw; info = o || {};
    i = (i + 1) % N; n = Math.min(N, n + 1);
    if (t - lastShow > 250) { lastShow = t; render(); }
  }
  // stats over the last `ms` of frames
  function stats(ms = 2000) {
    const out = { frames: 0, avgIv: 0, worstIv: 0, low1: 0, sim: 0, draw: 0, hud: 0, work: 0, worstWork: 0 };
    const ivs = [];
    let acc = 0;
    for (let k = 1; k <= n && acc < ms; k++) {
      const j = (i - k + N) % N; if (!iv[j]) continue;
      acc += iv[j]; ivs.push(iv[j]); out.frames++;
      out.sim += sim[j]; out.draw += draw[j]; out.hud += hud[j];
      const w = sim[j] + draw[j] + hud[j]; out.work += w; out.worstWork = Math.max(out.worstWork, w);
    }
    if (!out.frames) return out;
    for (const k of ['sim', 'draw', 'hud', 'work']) out[k] /= out.frames;
    out.avgIv = acc / out.frames; out.worstIv = Math.max(...ivs);
    ivs.sort((a, b) => b - a); out.low1 = ivs[Math.floor(ivs.length * 0.01)] || out.worstIv; // the slowest 1% of frames
    out.fps = 1000 / out.avgIv; out.fpsLow = 1000 / out.low1;
    return out;
  }
  function ensureEl() {
    if (el) return el;
    el = document.createElement('div'); el.id = 'perf-overlay'; el.className = 'perf-overlay hidden';
    el.innerHTML = `<pre id="perf-text"></pre><div class="perf-btns"><button id="perf-fill" type="button">Fill ${2 * BM.C.MAX_PER_SIDE}</button><button id="perf-burst" type="button">Burst</button></div>`;
    document.body.appendChild(el);
    el.querySelector('#perf-fill').addEventListener('pointerdown', (e) => { e.stopPropagation(); hooks.fill && hooks.fill(); render(); });
    el.querySelector('#perf-burst').addEventListener('pointerdown', (e) => { e.stopPropagation(); hooks.burst && hooks.burst(); });
    return el;
  }
  const f1 = (x) => (x || 0).toFixed(1);
  function render() {
    if (!el) return;
    const s = stats(), o = info;
    el.querySelector('#perf-text').textContent =
      `FPS ${Math.round(s.fps || 0)}  (1% low ${Math.round(s.fpsLow || 0)})\n` +
      `frame ${f1(s.avgIv)} ms · worst ${f1(s.worstIv)} ms\n` +
      `work ${f1(s.work)} ms: sim ${f1(s.sim)} · draw ${f1(s.draw)} · hud ${f1(s.hud)}\n` +
      `units ${o.mine || 0}+${o.foes || 0} · fx ${o.fx || 0} · text ${o.texts || 0}\n` +
      `speed ${o.speed || 1}× · ${o.steps || 0} steps/frame · dpr ${o.dpr || 1}`;
    el.querySelector('#perf-fill').classList.toggle('on', !!(hooks.filling && hooks.filling()));
    place();
  }
  // sits in the gap between the speed button and the AP pill (top row), so it never covers the HUD or the base HP bars
  function place() {
    const sp = document.getElementById('btn-speed'), ap = document.getElementById('ap-pill');
    if (!sp || !ap) return;
    const a = sp.getBoundingClientRect(), b = ap.getBoundingClientRect(), left = a.right + 8, room = b.left - 8 - left;
    el.style.left = left + 'px'; el.style.top = Math.max(4, a.top) + 'px'; el.style.transform = 'none';
    el.style.fontSize = ''; const w = el.offsetWidth;
    if (w > room) el.style.fontSize = Math.max(7, 11 * room / w).toFixed(1) + 'px';
  }
  // dev mode + battle screen decide visibility; `enable` also resets the buffer so a new battle reads clean numbers
  function setOn(v) {
    if (v === on) return;
    on = v; i = n = 0; lastT = 0;
    ensureEl().classList.toggle('hidden', !v);
  }
  return { frameStart, afterSim, afterDraw, frameEnd, stats, setOn, get on() { return on; }, attach: (h) => { hooks = h; } };
})();
