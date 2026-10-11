// Kanto campaign map = stage select (design addendum "Campaign map screen"). The 25 stages are nodes on a path that
// follows the real Kanto geography; a trainer token stands on the current stage, cleared nodes are marked, the next
// node pulses, future nodes are dimmed/locked, and after a first clear the token walks the path to the next town.
// Map art (BM.ART['maps/kanto']) replaces the procedural placeholder once ASSET_PROMPTS #180 is DONE.
window.BM = window.BM || {};
BM.MapScreen = function (ui) {
  const { $, tap, toast } = ui;
  const M = BM.KANTO_MAP, ST = BM.KANTO_STAGES;
  const prof = () => BM.Save.profile();
  const box = $('map-box'), cv = $('map-canvas'), nodesEl = $('map-nodes'), tokenEl = $('map-token');
  let bw = 0, bh = 0;
  const walk = { active: false, pts: null, len: 0, t0: 0, dur: 0, to: null, done: 0, onEnd: null };
  const test = { walks: [] }; // e2e hook: every completed walk {from, to}

  // ---------- progress ----------
  const idx = (id) => ST.findIndex((s) => s.id === id);
  const cleared = (st) => (prof().cleared[st.id] || 0) > 0;
  // A node can be played when it has waves (Phase 3: stages 1–12) and the stage before it is cleared.
  function nodeState(i) {
    const st = ST[i];
    if (cleared(st)) return 'cleared';
    if (st.locked) return 'soon';
    if (i === 0 || cleared(ST[i - 1])) return 'current';
    return 'locked';
  }
  // Where the token stands: the first unlocked-but-uncleared stage, else the last cleared one.
  function tokenTarget() {
    let last = ST[0].id;
    for (let i = 0; i < ST.length; i++) {
      const s = nodeState(i);
      if (s === 'current') return ST[i].id;
      if (s === 'cleared') last = ST[i].id;
      else break;
    }
    return last;
  }

  // ---------- layout ----------
  function layout() {
    const W = window.innerWidth, H = window.innerHeight;
    bw = Math.min(W, H * 16 / 9); bh = bw * 9 / 16;
    if (bh > H) { bh = H; bw = bh * 16 / 9; }
    Object.assign(box.style, { width: bw + 'px', height: bh + 'px', left: (W - bw) / 2 + 'px', top: (H - bh) / 2 + 'px' });
    box.style.setProperty('--node', Math.round(Math.max(40, Math.min(68, bw * 0.052))) + 'px');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(bw * dpr); cv.height = Math.round(bh * dpr);
    cv.style.width = bw + 'px'; cv.style.height = bh + 'px';
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawMap(g);
  }
  const P = ([x, y]) => [x * bw, y * bh];

  // ---------- drawing ----------
  function drawMap(g) {
    const art = BM.Sprites.art(M.art);
    if (art) g.drawImage(art, 0, 0, bw, bh);
    else drawPlaceholder(g);
    drawRoutes(g);
  }
  function drawPlaceholder(g) {
    g.fillStyle = '#4a9fe0'; g.fillRect(0, 0, bw, bh);
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
    for (let y = 12; y < bh; y += 26) for (let x = (y * 7) % 50; x < bw; x += 70) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 7, y - 5, x + 14, y); g.stroke(); }
    const blob = (pts, fill) => {
      g.beginPath(); pts.forEach((p, i) => { const [x, y] = P(p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
      g.fillStyle = '#f1dc9c'; g.strokeStyle = '#f1dc9c'; g.lineWidth = bw * 0.02; g.lineJoin = 'round'; g.stroke();
      g.fillStyle = fill; g.fill();
    };
    blob(M.land, '#8fd16a');
    for (const [x, y, r] of M.islands) {
      g.beginPath(); g.arc(x * bw, y * bh, r * bw + bw * 0.01, 0, 7); g.fillStyle = '#f1dc9c'; g.fill();
      g.beginPath(); g.arc(x * bw, y * bh, r * bw, 0, 7); g.fillStyle = '#8fd16a'; g.fill();
      g.beginPath(); g.moveTo(x * bw - r * bw * 0.55, y * bh); g.lineTo(x * bw - r * bw * 0.1, y * bh - r * bw * 0.8); g.lineTo(x * bw + r * bw * 0.3, y * bh);
      g.fillStyle = '#9a6b4a'; g.fill(); // Cinnabar volcano
    }
    for (const [x, y, r] of M.water) { g.beginPath(); g.ellipse(x * bw, y * bh, r * bw * 1.4, r * bw, 0, 0, 7); g.fillStyle = '#5bb0ec'; g.fill(); }
    for (const [x, y] of M.forests) for (const [dx, dy] of [[0, 0], [0.018, 0.01], [-0.016, 0.012], [0.004, 0.026]]) {
      g.beginPath(); g.arc((x + dx) * bw, (y + dy) * bh, bw * 0.014, 0, 7); g.fillStyle = '#3f8f45'; g.fill();
    }
    for (const [x, y] of M.mountains) {
      const [cx, cy] = P([x, y]), s = bw * 0.03;
      g.beginPath(); g.moveTo(cx - s, cy + s * 0.7); g.lineTo(cx, cy - s * 0.8); g.lineTo(cx + s, cy + s * 0.7); g.closePath();
      g.fillStyle = '#a5845f'; g.fill(); g.strokeStyle = '#6e5539'; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.moveTo(cx - s * 0.32, cy - s * 0.25); g.lineTo(cx, cy - s * 0.8); g.lineTo(cx + s * 0.32, cy - s * 0.25); g.closePath();
      g.fillStyle = '#f4f1ea'; g.fill();
    }
    // town blocks under the location nodes (not gyms / Elite Four)
    for (const st of ST) {
      if (['gym', 'e4', 'champion'].includes(st.kind) || st.id === 'kanto_03_forest' || st.id === 'kanto_06_mtmoon') continue;
      const [x, y] = P(M.nodes[st.id]), s = bw * 0.012;
      for (const [dx, dy, c] of [[-1.6, -1.2, '#e8463c'], [1.2, -1.4, '#3d7dd8'], [-1.4, 1.2, '#f4efe2'], [1.4, 1.1, '#e8463c']]) {
        g.fillStyle = c; g.fillRect(x + dx * s * 1.4 - s / 2, y + dy * s * 1.4 - s / 2, s, s);
      }
    }
  }
  function drawRoutes(g) {
    const reached = idx(tokenTarget());
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 1; i < ST.length; i++) {
      const pts = BM.mapPath(ST[i].id).map(P), done = i <= reached;
      const line = (w, col, dash) => { g.setLineDash(dash || []); g.lineWidth = w; g.strokeStyle = col; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
      line(bw * 0.011, 'rgba(60,40,20,.55)');
      line(bw * 0.007, done ? '#ffd84a' : '#efe2b8', done ? null : [bw * 0.008, bw * 0.008]);
    }
    g.setLineDash([]);
  }

  // ---------- nodes ----------
  const NODE_ICON = { gym: '🏅', e4: '⭐', champion: '👑' };
  function renderNodes() {
    nodesEl.innerHTML = '';
    ST.forEach((st, i) => {
      const s = nodeState(i), [x, y] = M.nodes[st.id];
      const b = document.createElement('button');
      b.className = `map-node kind-${st.kind} ${s}`; b.dataset.stage = st.id; b.dataset.num = st.num;
      b.style.left = x * 100 + '%'; b.style.top = y * 100 + '%';
      b.innerHTML = `<span class="mn-num">${s === 'cleared' ? '✓' : NODE_ICON[st.kind] || st.num}</span>` +
        (s === 'soon' || s === 'locked' ? '<span class="mn-lock">🔒</span>' : '');
      const lbl = document.createElement('span'); lbl.className = 'mn-label ' + (M.labels[st.id] || (y > 0.84 ? 'above' : ''));
      lbl.textContent = st.leader && st.kind !== 'champion' ? st.leader : st.name;
      b.appendChild(lbl);
      tap(b, () => onNode(st, s, i));
      nodesEl.appendChild(b);
    });
  }
  function onNode(st, s, i) {
    if (walk.active) return;
    if (s === 'soon') { BM.Audio.sfx('deny'); toast(`${st.name} opens in a later update!`); return; }
    if (s === 'locked') { BM.Audio.sfx('deny'); toast(`Beat ${ST[i - 1].name} first!`); return; }
    BM.Audio.sfx('tap');
    ui.openPrebattle(st.id);
  }

  // ---------- trainer token: 4-frame walk sheet (ASSET_PROMPTS #204), procedural until it is DONE ----------
  const TRAINER = { id: 'trainer_walk', name: 'Trainer', types: ['normal'], size: 1 };
  function drawToken(frame) {
    const g = tokenEl.getContext('2d'), w = tokenEl.width, h = tokenEl.height;
    g.clearRect(0, 0, w, h);
    if (BM.Sprites.hasArt(TRAINER)) {
      const sp = BM.Sprites.get(TRAINER), fr = sp.run[frame % sp.run.length], s = Math.min(w / sp.w, (h - 2) / sp.h);
      g.imageSmoothingEnabled = false;
      g.drawImage(fr, w / 2 - sp.ax * s, h - 2 - sp.ay * s, sp.w * s, sp.h * s);
      return;
    }
    const f = frame % 4, bob = f % 2 ? -2 : 0, leg = [-5, 0, 5, 0][f];
    g.lineWidth = 3; g.strokeStyle = '#1c1c28';
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(w / 2, h - 4, 14, 4, 0, 0, 7); g.fill();
    g.fillStyle = '#2d3f8a'; g.fillRect(w / 2 - 9 + leg / 2, h - 22, 7, 16); g.fillRect(w / 2 + 2 - leg / 2, h - 22, 7, 16); // legs
    g.fillStyle = '#e8463c'; g.fillRect(w / 2 - 13, h - 44 + bob, 26, 24); g.strokeRect(w / 2 - 13, h - 44 + bob, 26, 24); // jacket
    g.fillStyle = '#ffd9b3'; g.beginPath(); g.arc(w / 2, h - 52 + bob, 11, 0, 7); g.fill(); g.stroke(); // head
    g.fillStyle = '#e8463c'; g.beginPath(); g.arc(w / 2, h - 56 + bob, 11, Math.PI, 0); g.fill(); g.stroke(); // cap
    g.fillStyle = '#fff'; g.fillRect(w / 2 - 4, h - 63 + bob, 8, 5);
    g.fillStyle = '#e8463c'; g.fillRect(w / 2 + 4, h - 57 + bob, 10, 4); // cap brim (facing right)
  }
  function placeToken([x, y]) {
    tokenEl.style.left = x * 100 + '%'; tokenEl.style.top = y * 100 + '%';
  }

  // Walk the polyline from `fromId` to `toId` (several segments when a profile skipped ahead, e.g. an old save).
  function startWalk(fromId, toId) {
    const a = idx(fromId), z = idx(toId);
    let pts = [M.nodes[fromId]];
    for (let i = a + 1; i <= z; i++) pts = pts.concat(BM.mapPath(ST[i].id).slice(1));
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot((pts[i][0] - pts[i - 1][0]) * 16, (pts[i][1] - pts[i - 1][1]) * 9);
    Object.assign(walk, { active: true, pts, len, t0: performance.now(), dur: Math.min(3200, 900 + len * 260), from: fromId, to: toId });
    box.classList.add('walking');
    BM.Audio.sfx('tap');
  }
  let idleFrame = -1;
  function walkTick(now) {
    if (!walk.active) { // waiting on the current stage: step gently in place
      const f = Math.floor(now / 380) % 4;
      if (f !== idleFrame) { idleFrame = f; drawToken(f); }
      return;
    }
    const k = Math.min(1, (now - walk.t0) / walk.dur);
    let d = k * walk.len, i = 1;
    for (; i < walk.pts.length; i++) {
      const [ax, ay] = walk.pts[i - 1], [bx, by] = walk.pts[i], seg = Math.hypot((bx - ax) * 16, (by - ay) * 9);
      if (d <= seg || i === walk.pts.length - 1) { const f = seg ? Math.min(1, d / seg) : 1; placeToken([ax + (bx - ax) * f, ay + (by - ay) * f]); tokenEl.classList.toggle('flip', bx < ax); break; }
      d -= seg;
    }
    drawToken(Math.floor(now / 130)); // walk cycle while travelling
    if (k >= 1) {
      walk.active = false; box.classList.remove('walking');
      BM.Save.setMapAt(walk.to);
      test.walks.push({ from: walk.from, to: walk.to });
      tokenEl.classList.remove('flip'); drawToken(0);
      renderNodes();
      BM.Audio.sfx('upgrade');
    }
  }

  function render() {
    layout();
    renderNodes();
    const target = tokenTarget(), at = prof().mapAt;
    walk.active = false; box.classList.remove('walking');
    if (at && idx(at) >= 0 && idx(at) < idx(target)) { placeToken(M.nodes[at]); drawToken(0); startWalk(at, target); }
    else { placeToken(M.nodes[target]); drawToken(0); BM.Save.setMapAt(target); }
    const tk = BM.Sprites.artSrc('icons/battle_ticket');
    $('map-tickets').innerHTML = (tk ? `<img src="${tk}" alt="">` : '🎫') + `<b>${prof().tickets}</b>`;
  }
  tap($('btn-map-back'), () => { BM.Audio.sfx('tap'); ui.go('title'); });
  tap($('btn-map-dev'), () => { BM.Audio.sfx('tap'); ui.openPrebattle('dev_types'); });

  return { render, layout: () => { if (bw) { layout(); renderNodes(); } }, tick: walkTick, nodeState, tokenTarget, walk, test };
};
