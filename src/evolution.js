// Evolution scene (Phase 4): plays the `evolution` music key and a white-flash silhouette morph from the old form to
// the new one, then "Congratulations!". Used after the result screen (level evolutions) and from a character's detail
// panel (EVOLVE! badge, stones / held items). play(list, done): list = [{ line, from, to }], played one after another.
window.BM = window.BM || {};
BM.EvoScene = function (ui) {
  const { $, tap, show } = ui;
  const cv = $('evo-canvas'), g = cv.getContext('2d'), text = $('evo-text'), ok = $('btn-evo-ok');
  const T_IN = 1.0, T_MORPH = 4.2, T_FLASH = 4.7, T_END = 5.2; // seconds
  let queue = [], onDone = null, cur = null, raf = 0;
  const test = { played: [] }; // e2e hook

  function silhouette(form, color) {
    const sp = BM.Sprites.get(form), fr = sp.run[0];
    const c = document.createElement('canvas'); c.width = Math.ceil(sp.w); c.height = Math.ceil(sp.h);
    const x = c.getContext('2d'); x.drawImage(fr, 0, 0, sp.w, sp.h);
    if (color) { x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height); }
    return { c, sp };
  }
  function drawForm(img, scale, alpha) {
    const { c, sp } = img, H = cv.height * 0.62 * scale, s = H / sp.h;
    g.save(); g.globalAlpha = alpha;
    g.drawImage(c, cv.width / 2 - sp.ax * s, cv.height * 0.84 - sp.ay * s, sp.w * s, sp.h * s);
    g.restore();
  }
  function frame(now) {
    if (!cur) return;
    const t = (now - cur.t0) / 1000, W = cv.width, H = cv.height;
    const bg = g.createRadialGradient(W / 2, H * 0.55, 10, W / 2, H * 0.55, W * 0.7);
    bg.addColorStop(0, t > T_MORPH ? '#fff7d6' : '#4a5fa8'); bg.addColorStop(1, '#141a33');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const sizeOld = cur.oldForm.size || 1, sizeNew = cur.newForm.size || 1;
    if (t < T_IN) drawForm(cur.old, 1, 1);
    else if (t < T_MORPH) {
      // alternate the two white silhouettes, faster and faster
      const k = (t - T_IN) / (T_MORPH - T_IN), rate = 2 + k * k * 18, which = Math.floor((t - T_IN) * rate) % 2;
      const sc = which ? sizeNew / sizeOld : 1;
      drawForm(which ? cur.newW : cur.oldW, Math.min(1.25, sc), 1);
      g.fillStyle = `rgba(255,255,255,${0.15 + 0.25 * k})`;
      for (let i = 0; i < 10; i++) { const a = t * 2 + i * 0.63, r = W * (0.18 + 0.1 * Math.sin(t * 3 + i)); g.beginPath(); g.arc(W / 2 + Math.cos(a) * r, H * 0.55 + Math.sin(a) * r * 0.7, 4 + 3 * k, 0, 7); g.fill(); }
    } else if (t < T_FLASH) { g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); }
    else {
      drawForm(cur.neu, Math.min(1.25, sizeNew / sizeOld), 1);
      const fade = Math.max(0, 1 - (t - T_FLASH) / 0.5);
      if (fade) { g.fillStyle = `rgba(255,255,255,${fade})`; g.fillRect(0, 0, W, H); }
      g.fillStyle = '#ffe14a';
      for (let i = 0; i < 8; i++) { const a = i * 0.785 + t, r = W * 0.3 + Math.sin(t * 4 + i) * 10; g.font = '900 22px system-ui'; g.fillText('✦', W / 2 + Math.cos(a) * r, H * 0.5 + Math.sin(a) * r * 0.6); }
    }
    if (t >= T_FLASH && !cur.announced) {
      cur.announced = true;
      text.textContent = `Congratulations! Your ${cur.oldForm.name} evolved into ${cur.newForm.name}!`;
      BM.Audio.cry(cur.newForm.id, cur.newForm.size);
      BM.Audio.sfx('upgrade');
    }
    if (t >= T_END && ok.classList.contains('hidden')) show('btn-evo-ok', true);
    raf = requestAnimationFrame(frame);
  }
  function next() {
    cancelAnimationFrame(raf);
    const e = queue.shift();
    if (!e) { cur = null; show('scr-evo', false); const cb = onDone; onDone = null; if (cb) cb(); return; }
    const oldForm = BM.FORMS[e.from], newForm = BM.FORMS[e.to];
    BM.Save.evolve(e.line, e.to); // unlock + field (already done when a stone was used)
    test.played.push({ line: e.line, from: e.from, to: e.to });
    cur = { ...e, oldForm, newForm, t0: performance.now(), old: silhouette(oldForm), oldW: silhouette(oldForm, '#fff'), newW: silhouette(newForm, '#fff'), neu: silhouette(newForm), announced: false };
    text.textContent = `What? ${oldForm.name} is evolving!`;
    show('btn-evo-ok', false);
    BM.Audio.stopMusic(); BM.Audio.playMusic('evolution');
    raf = requestAnimationFrame(frame);
  }
  function play(list, done) {
    queue = list.slice(); onDone = done || null;
    show('scr-evo', true);
    ui.fit($('scr-evo'));
    next();
  }
  tap(ok, () => { BM.Audio.sfx('tap'); next(); });
  // Skip ahead (tap the scene while it plays) — the scene still unlocks the form.
  tap(cv, () => { if (cur && (performance.now() - cur.t0) / 1000 < T_FLASH) cur.t0 = performance.now() - T_FLASH * 1000; });
  return { play, get active() { return !!cur; }, test };
};
