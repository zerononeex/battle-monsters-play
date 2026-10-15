// Kanto campaign map = stage select (design addendum "Campaign map screen"). The 25 stages are nodes on a path that
// follows the real Kanto geography; a trainer token stands on the current stage, cleared nodes are marked, the next
// node pulses, future nodes are dimmed/locked, and after a first clear the token walks the path to the next town.
// Map art (BM.ART['maps/kanto']) replaces the procedural placeholder once ASSET_PROMPTS #180 is DONE.
window.BM = window.BM || {};
BM.MapScreen = function (ui) {
  const { $, tap, toast } = ui;
  // Johto (Step 4): the screen shows ONE region's map at a time (setRegion) — Kanto's or Johto's nodes, paths, art and token
  let region = 'kanto', M = BM.KANTO_MAP, ST = BM.KANTO_STAGES;
  function setRegion(r) {
    if (r === region || !BM.REGION_MAPS[r]) return;
    region = r; M = BM.REGION_MAPS[r].map; ST = BM.REGION_MAPS[r].stages; PATH = null; NODE_S = null; queued = null;
    box.dataset.region = r;
  }
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
      if (['gym', 'e4', 'champion'].includes(st.kind) || ['kanto_03_forest', 'kanto_06_mtmoon', 'johto_03_route31', 'johto_06_unioncave', 'johto_09_ilex', 'johto_12_nationalpark', 'johto_18_lakeofrage', 'johto_20_icepath', 'johto_22_victoryroad', 'hoenn_03_petalburg_woods', 'hoenn_05_granite_cave', 'hoenn_10_meteor_falls', 'hoenn_12_desert', 'hoenn_15_mt_pyre', 'hoenn_18_seafloor_cavern', 'hoenn_25_sky_pillar', 'sinnoh_06_eterna_forest', 'sinnoh_13_iron_island', 'sinnoh_14_lakes', 'sinnoh_17_spear_pillar', 'sinnoh_18_distortion_world', 'sinnoh_25_hisui_rift', 'sinnoh_26_arceus', 'unova_03_dreamyard', 'unova_06_pinwheel', 'unova_08_desert', 'unova_12_chargestone', 'unova_13_celestial', 'unova_15_twist_mountain', 'unova_17_dragonspiral', 'unova_19_victory_road',
        'kalos_02_santalune_forest', 'kalos_08_glittering_cave', 'kalos_12_power_plant', 'kalos_15_pokeball_factory', 'kalos_16_frost_cavern', 'kalos_18_flare_hq',
        'alola_04_ten_carat', 'alola_06_paniola', 'alola_11_aether', 'alola_17_lusamine', 'alola_18_poni', 'alola_27_necrozma'].includes(st.id) || st.noTown) continue;
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
      b.innerHTML = `<span class="mn-num">${s === 'cleared' ? st.num : NODE_ICON[st.kind] || st.num}</span>` +
        (s === 'soon' || s === 'locked' ? '<span class="mn-lock">🔒</span>' : '');
      const lbl = document.createElement('span'); lbl.className = 'mn-label ' + (M.labels[st.id] || (y > 0.84 ? 'above' : ''));
      lbl.textContent = st.mapLabel || (st.leader && st.kind !== 'champion' ? st.leader : st.name);
      b.appendChild(lbl);
      tap(b, () => onNode(st, s, i));
      nodesEl.appendChild(b);
    });
  }
  function onNode(st, s, i) {
    if (s === 'soon') { BM.Audio.sfx('deny'); toast(`${st.name} opens in a later update!`); return; }
    if (s === 'locked') { BM.Audio.sfx('deny'); toast(`Beat ${ST[i - 1].name} first!`); return; }
    BM.Audio.sfx('tap');
    // F7 (BR-020): the trainer walks along the path to the tapped node FIRST, then the pre-battle screen opens
    if (walk.active) { if (walk.to !== st.id) startWalk(null, st.id, () => ui.openPrebattle(st.id)); return; } // J3: retarget now
    const at = tokenAt();
    if (at === st.id) { ui.openPrebattle(st.id); return; }
    startWalk(at, st.id, () => ui.openPrebattle(st.id));
  }
  // The node the token stands on: where it was last walked to (profile.mapAt) if that node is reachable, else the
  // current stage.
  function tokenAt() {
    const at = prof().mapAt, i = idx(at), t = idx(tokenTarget());
    return i >= 0 && i <= t && nodeState(i) !== 'locked' && nodeState(i) !== 'soon' ? at : ST[t].id;
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

  // ---------- J3 TOKEN SPRINT (playtest batch 4): the token travels the campaign path at a run — ~0.25 s per node hop,
  // total travel CAPPED at 2.0 s for any distance (speed scales with distance), a tap on another node mid-walk retargets
  // at once from where the token is, and the pre-battle opens the moment he arrives (F7). The whole campaign path is one
  // polyline; the token's position is a single number `s` along it (node i sits at NODE_S[i]).
  BM.C.MAP_HOP_S = 0.25; BM.C.MAP_TRAVEL_CAP = 1.95; BM.C.MAP_RUN_FRAME_MS = 70; // cap 1.95 s → ≤ 2.0 s incl. the last frame
  let PATH = null, NODE_S = null;
  const segLen = (a, b) => Math.hypot((b[0] - a[0]) * 16, (b[1] - a[1]) * 9);
  function buildPath() {
    PATH = [{ p: M.nodes[ST[0].id], s: 0 }]; NODE_S = [0];
    for (let i = 1; i < ST.length; i++) {
      for (const q of BM.mapPath(ST[i].id).slice(1)) { const last = PATH[PATH.length - 1]; PATH.push({ p: q, s: last.s + segLen(last.p, q) }); }
      NODE_S.push(PATH[PATH.length - 1].s);
    }
  }
  function pointAt(sv) {
    if (!PATH) buildPath();
    for (let i = 1; i < PATH.length; i++) {
      const a = PATH[i - 1], b = PATH[i];
      if (sv <= b.s || i === PATH.length - 1) { const f = b.s > a.s ? Math.max(0, Math.min(1, (sv - a.s) / (b.s - a.s))) : 1; return [a.p[0] + (b.p[0] - a.p[0]) * f, a.p[1] + (b.p[1] - a.p[1]) * f]; }
    }
    return PATH[0].p;
  }
  // fractional node index of a path position (for the hop count)
  function nodeIndexAt(sv) {
    for (let i = 1; i < NODE_S.length; i++) if (sv <= NODE_S[i]) return i - 1 + (NODE_S[i] > NODE_S[i - 1] ? (sv - NODE_S[i - 1]) / (NODE_S[i] - NODE_S[i - 1]) : 1);
    return NODE_S.length - 1;
  }
  BM.mapTravelSeconds = (hops) => Math.min(BM.C.MAP_TRAVEL_CAP, Math.max(0.15, hops * BM.C.MAP_HOP_S));
  let tokenS = 0;
  function startWalk(fromId, toId, onEnd) {
    if (!PATH) buildPath();
    const s0 = walk.active ? tokenS : NODE_S[idx(fromId)], s1 = NODE_S[idx(toId)];
    const hops = Math.abs(nodeIndexAt(s1) - nodeIndexAt(s0));
    walk.onEnd = onEnd || null;
    Object.assign(walk, { active: true, s0, s1, t0: performance.now(), dur: BM.mapTravelSeconds(hops) * 1000, from: walk.active ? walk.from : fromId, to: toId, hops, started: walk.active ? walk.started : performance.now() });
    box.classList.add('walking');
    tokenEl.classList.toggle('flip', s1 < s0);
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
    tokenS = walk.s0 + (walk.s1 - walk.s0) * Math.min(1, k * (2 - k));
    placeToken(pointAt(tokenS));
    drawToken(Math.floor(now / BM.C.MAP_RUN_FRAME_MS)); // sped-up run cycle while travelling
    if (k >= 1) {
      walk.active = false; box.classList.remove('walking');
      tokenS = walk.s1;
      BM.Save.setMapAt(walk.to);
      test.walks.push({ from: walk.from, to: walk.to, ms: Math.round(now - walk.started), hops: walk.hops });
      tokenEl.classList.remove('flip'); drawToken(0);
      renderNodes();
      BM.Audio.sfx('upgrade');
      const cb = walk.onEnd; walk.onEnd = null;
      if (cb) cb();
    }
  }
  function render() {
    layout();
    renderNodes();
    const target = tokenTarget(), from = queued;
    queued = null;
    walk.active = false; walk.onEnd = null; box.classList.remove('walking');
    // after a FIRST clear the token walks on to the newly opened stage; otherwise it stays where the kid walked it (F7)
    if (!PATH) buildPath();
    if (from && idx(from) >= 0 && idx(from) < idx(target)) { placeToken(M.nodes[from]); drawToken(0); startWalk(from, target); }
    else { const at = tokenAt(); tokenS = NODE_S[idx(at)]; placeToken(M.nodes[at]); drawToken(0); BM.Save.setMapAt(at); }
    $('map-tickets').innerHTML = BM.ticketIcon() + `<b>${prof().tickets}</b>`;
  }
  tap($('btn-map-back'), () => { BM.Audio.sfx('tap'); ui.go('title'); });
  tap($('btn-map-dev'), () => { BM.Audio.sfx('tap'); ui.openPrebattle('dev_types'); });
  // VV1 dev: each tap opens the next restriction test stage (Small Field · Small Cards · Both Rules)
  let ruleAt = 0;
  tap($('btn-map-dev-rules'), () => { BM.Audio.sfx('tap'); const ids = ['dev_rule_cap', 'dev_rule_ap', 'dev_rule_both']; ui.openPrebattle(ids[ruleAt++ % ids.length]); });

  let queued = null; // stage id just cleared for the first time: walk from it to the next stage on the next render
  return { render, setRegion, get region() { return region; }, queueWalk: (id) => { queued = id; }, tokenAt, layout: () => { if (bw) { layout(); renderNodes(); } }, tick: walkTick, nodeState, tokenTarget, walk, test };
};
