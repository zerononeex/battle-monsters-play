// Canvas renderer for the battlefield. Reads battle state; owns only visual effects.
window.BM = window.BM || {};
BM.Render = function (canvas) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, fieldH = 0, dpr = 1, bgCanvas = null, bgKey = null;
  const fx = [];      // projectiles / bursts
  const texts = [];   // floating effectiveness text
  let lastBig = -1;
  const TOP_SAFE = 104; // below the pause button / AP pill row
  let labels = [];      // placeholder name tags drawn this frame (skip overlapping ones)

  function resize(hudH) {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    fieldH = H - hudH;
    bgCanvas = null;
  }
  const L = {
    ground: () => fieldH * 0.84,
    baseW: () => Math.min(W * 0.13, fieldH * 0.42),
    sx(x) { const bw = L.baseW(), l = bw * 0.55, r = W - bw * 0.55; return l + (x / BM.C.LANE) * (r - l); },
    unitH: (form) => fieldH * 0.17 * form.size,
    depth: (u) => u.yOff * fieldH * 0.035,
  };

  // ---------- placeholder backgrounds (one look per location until its assets/backgrounds art is DONE) ----------
  const TOWN = { sky: ['#7ec8f5', '#d4f0ff'], hill: '#8fcf7a', trees: '#4f9a4a', grass: '#6cc04a', grass2: '#5aa83c', lane: '#d9b77a' };
  const PH_BG = {
    pallet_town: { ...TOWN, houses: [[0.3, 70, '#c94a3d'], [0.47, 90, '#c94a3d'], [0.66, 70, '#c94a3d']] },
    viridian_city: { ...TOWN, houses: [[0.28, 80, '#d8473a'], [0.46, 70, '#3d74d1'], [0.66, 110, '#7a8a99']] },
    viridian_forest: { ...TOWN, sky: ['#5f9e6a', '#a9d9a0'], hill: '#3f7f45', trees: '#2f6a36', grass: '#4f9a3c', grass2: '#3f8a30', lane: '#b89c66', forest: true, cloud: 'rgba(220,255,220,.35)' },
    pewter_city: { ...TOWN, sky: ['#9cc4e4', '#e0ecf4'], mountains: '#8d8a86', hill: '#a7b08f', trees: '#6b8a55', lane: '#c9b89a', wall: '#d9d5cc', houses: [[0.3, 80, '#7d7a76'], [0.5, 120, '#9a8a70'], [0.7, 70, '#7d7a76']] },
    mt_moon: { ...TOWN, cave: true, grass: '#5a5068', grass2: '#4a4258', lane: '#8a7f95' },
    cerulean_city: { ...TOWN, hill: '#86c9a0', river: '#4aa8e8', houses: [[0.28, 80, '#3d74d1'], [0.5, 100, '#2f9fd8'], [0.7, 80, '#3d74d1']] },
    vermilion_city: { ...TOWN, sky: ['#f59a5a', '#ffe0a8'], sea: '#3d8fd1', hill: '#9cc77a', trees: '#5c9a48', cloud: 'rgba(255,230,200,.8)', houses: [[0.2, 70, '#e07a2e']] },
    lavender_town: { ...TOWN, sky: ['#6a4f8f', '#c9b3e0'], hill: '#7f8f86', trees: '#4f6a5a', grass: '#7aa070', grass2: '#6a9060', lane: '#b8a890', tower: true, cloud: 'rgba(240,230,255,.5)', houses: [[0.25, 70, '#7a4fa8'], [0.75, 70, '#7a4fa8']] },
    celadon_city: { ...TOWN, city: true, trees: '#3f8f4a', houses: [[0.56, 70, '#3fa86a']] },
  };
  function drawBg(key) {
    const c = document.createElement('canvas');
    c.width = Math.round(W * dpr); c.height = Math.round(fieldH * dpr);
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    const img = BM.Sprites.bg(key);
    if (img) {
      const s = Math.max(W / img.width, fieldH / img.height);
      g.drawImage(img, (W - img.width * s) / 2, fieldH - img.height * s, img.width * s, img.height * s);
      return c;
    }
    const P = PH_BG[key] || PH_BG.pallet_town, gy = L.ground();
    if (P.cave) {
      // cave interior (Mt. Moon): rock walls, stalactites, a few glowing Moon Stone sparkles
      g.fillStyle = '#2c2638'; g.fillRect(0, 0, W, fieldH);
      g.fillStyle = '#3d3550';
      for (let x = -20; x < W + 40; x += 70) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 35, 40 + ((x * 13) % 60)); g.lineTo(x + 70, 0); g.fill(); }
      g.fillStyle = '#4a4160';
      g.beginPath(); g.moveTo(0, gy * 0.8);
      for (let x = 0; x <= W; x += 50) g.lineTo(x, gy * 0.7 - ((x * 7) % 40));
      g.lineTo(W, gy); g.lineTo(0, gy); g.fill();
      g.fillStyle = 'rgba(180,200,255,.8)';
      for (const [sx, sy] of [[0.22, 0.35], [0.5, 0.25], [0.74, 0.4], [0.62, 0.55]]) { g.beginPath(); g.arc(W * sx, gy * sy, 4, 0, 7); g.fill(); }
    } else {
      const sky = g.createLinearGradient(0, 0, 0, gy);
      sky.addColorStop(0, P.sky[0]); sky.addColorStop(1, P.sky[1]);
      g.fillStyle = sky; g.fillRect(0, 0, W, gy);
      g.fillStyle = P.cloud || 'rgba(255,255,255,.9)';
      for (const [cx, cy, sc] of [[0.18, 0.16, 1], [0.55, 0.1, 1.3], [0.82, 0.22, 0.9]]) {
        for (const [dx, dy, r] of [[0, 0, 22], [24, -8, 26], [50, 0, 20], [24, 6, 22]]) {
          g.beginPath(); g.arc(W * cx + dx * sc, fieldH * cy + dy * sc, r * sc, 0, Math.PI * 2); g.fill();
        }
      }
      if (P.mountains) { // grey peaks behind the town (Pewter)
        g.fillStyle = P.mountains;
        for (let x = -60; x < W + 60; x += 160) { g.beginPath(); g.moveTo(x, gy * 0.75); g.lineTo(x + 90, gy * 0.32 + ((x * 3) % 50)); g.lineTo(x + 180, gy * 0.75); g.fill(); }
      }
      if (P.sea) { // harbour + a big white ship (Vermilion)
        g.fillStyle = P.sea; g.fillRect(0, gy * 0.6, W, gy * 0.25);
        const sx = W * 0.62, sy = gy * 0.66;
        g.fillStyle = '#f4f4f4'; g.beginPath(); g.moveTo(sx - 150, sy); g.lineTo(sx + 170, sy); g.lineTo(sx + 140, sy + 34); g.lineTo(sx - 130, sy + 34); g.fill();
        g.fillStyle = '#3d6fd1'; g.fillRect(sx - 140, sy + 14, 290, 7);
        g.fillStyle = '#f4f4f4'; g.fillRect(sx - 80, sy - 26, 160, 26);
        g.fillStyle = '#c94a3d'; g.fillRect(sx - 30, sy - 56, 22, 30); g.fillRect(sx + 20, sy - 56, 22, 30);
      }
      // far hills + tree line
      g.fillStyle = P.hill;
      g.beginPath(); g.moveTo(0, gy * 0.72);
      for (let x = 0; x <= W; x += 40) g.lineTo(x, gy * 0.72 - Math.sin(x / 140) * 18 - 10);
      g.lineTo(W, gy); g.lineTo(0, gy); g.fill();
      g.fillStyle = P.trees;
      const tr = P.forest ? 46 : 22, step = P.forest ? 52 : 34;
      for (let x = -10; x < W + 30; x += step) { g.beginPath(); g.arc(x, gy * (P.forest ? 0.6 : 0.74), tr, Math.PI, 0); g.fill(); g.fillRect(x - tr, gy * (P.forest ? 0.6 : 0.74), tr * 2, gy * 0.3); }
      if (P.forest) { g.fillStyle = '#5a3d26'; for (let x = 20; x < W; x += 104) g.fillRect(x, gy * 0.62, 12, gy * 0.2); }
      if (P.tower) { // Pokémon Tower (Lavender)
        const tx = W * 0.5, tw = 90;
        g.fillStyle = '#8a7aa8'; g.fillRect(tx - tw / 2, gy * 0.1, tw, gy * 0.72);
        g.fillStyle = '#5b4a7a'; for (let k = 0; k < 6; k++) g.fillRect(tx - tw / 2 - 8, gy * (0.12 + k * 0.12), tw + 16, 8);
        g.fillStyle = '#f5e9a8'; for (let k = 0; k < 5; k++) g.fillRect(tx - 10, gy * (0.17 + k * 0.12), 20, 14);
      }
      if (P.city) { // tall city blocks (Celadon)
        for (const [bx, bw, bh, col] of [[0.24, 110, 0.55, '#d8d2c0'], [0.42, 80, 0.4, '#b9c7d9'], [0.72, 130, 0.62, '#e2c8a8']]) {
          g.fillStyle = col; g.fillRect(W * bx - bw / 2, gy * (0.82 - bh), bw, gy * bh);
          g.fillStyle = 'rgba(70,100,140,.55)';
          for (let wy = gy * (0.86 - bh); wy < gy * 0.76; wy += 22) for (let wx = W * bx - bw / 2 + 10; wx < W * bx + bw / 2 - 14; wx += 22) g.fillRect(wx, wy, 12, 12);
        }
      }
      for (const [hx, hw, roof] of P.houses || []) { // small houses, roof colour per town
        const x = W * hx, y = gy * 0.82, h = hw * 0.6;
        g.fillStyle = P.wall || '#f4efe2'; g.fillRect(x - hw / 2, y - h, hw, h);
        g.fillStyle = roof; g.beginPath(); g.moveTo(x - hw / 2 - 8, y - h); g.lineTo(x, y - h - hw * 0.42); g.lineTo(x + hw / 2 + 8, y - h); g.fill();
        g.fillStyle = '#6a8fb5'; g.fillRect(x - hw / 4, y - h * 0.65, hw / 6, hw / 6); g.fillRect(x + hw / 10, y - h * 0.65, hw / 6, hw / 6);
        g.fillStyle = '#8a5a3a'; g.fillRect(x - 6, y - h * 0.45, 12, h * 0.45);
      }
      if (P.river) { g.fillStyle = P.river; g.fillRect(0, gy * 0.79, W, gy * 0.035); }
    }
    // ground: verge + dirt lane
    g.fillStyle = P.grass; g.fillRect(0, gy * 0.82, W, fieldH);
    g.fillStyle = P.lane; g.fillRect(0, gy - fieldH * 0.06, W, fieldH * 0.12);
    g.fillStyle = 'rgba(0,0,0,.06)';
    for (let x = 0; x < W; x += 18) g.fillRect(x, gy - fieldH * 0.06 + ((x * 7) % 23), 6, 3);
    g.fillStyle = P.grass2; g.fillRect(0, gy + fieldH * 0.06, W, fieldH);
    return c;
  }

  // ---------- bases ----------
  function drawBase(side, hpFrac) {
    const bw = L.baseW(), gy = L.ground() + fieldH * 0.04, bh = bw * 1.25;
    const x = side === 1 ? bw * 0.05 : W - bw * 1.05;
    ctx.save();
    ctx.lineWidth = 4; ctx.strokeStyle = '#1c1c28';
    const img = BM.Sprites.art(side === 1 ? 'bases/player_base' : 'bases/enemy_wild_den');
    if (img) {
      const s = Math.min(bw * 1.15 / img.width, bh * 1.05 / img.height), w = img.width * s, h = img.height * s;
      ctx.drawImage(img, x + bw / 2 - w / 2, gy - h, w, h);
    } else if (side === 1) {
      // player: trainer tower, blue roof, ball emblem
      ctx.fillStyle = '#f5f1e6'; ctx.fillRect(x + bw * 0.12, gy - bh * 0.78, bw * 0.76, bh * 0.78); ctx.strokeRect(x + bw * 0.12, gy - bh * 0.78, bw * 0.76, bh * 0.78);
      ctx.fillStyle = '#3d6fd1'; ctx.beginPath(); ctx.moveTo(x, gy - bh * 0.76); ctx.lineTo(x + bw / 2, gy - bh); ctx.lineTo(x + bw, gy - bh * 0.76); ctx.closePath(); ctx.fill(); ctx.stroke();
      const cx = x + bw / 2, cy = gy - bh * 0.5, r = bw * 0.2;
      ctx.fillStyle = '#e8463c'; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#8a5a3a'; ctx.fillRect(x + bw * 0.4, gy - bh * 0.22, bw * 0.2, bh * 0.22);
    } else {
      // enemy: wild den — rocky mound with a dark cave mouth
      ctx.fillStyle = '#8b7b68';
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + bw * 0.08, gy - bh * 0.55); ctx.lineTo(x + bw * 0.3, gy - bh * 0.85);
      ctx.lineTo(x + bw * 0.62, gy - bh * 0.95); ctx.lineTo(x + bw * 0.9, gy - bh * 0.6); ctx.lineTo(x + bw, gy); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6f6152'; ctx.beginPath(); ctx.moveTo(x + bw * 0.3, gy - bh * 0.85); ctx.lineTo(x + bw * 0.45, gy - bh * 0.6); ctx.lineTo(x + bw * 0.62, gy - bh * 0.95); ctx.fill();
      ctx.fillStyle = '#2a2230'; ctx.beginPath(); ctx.ellipse(x + bw * 0.45, gy, bw * 0.22, bh * 0.3, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(x + bw * 0.4, gy - bh * 0.12, 3, 0, 7); ctx.arc(x + bw * 0.5, gy - bh * 0.12, 3, 0, 7); ctx.fill();
      ctx.fillStyle = '#4f9a4a'; ctx.beginPath(); ctx.arc(x + bw * 0.82, gy - bh * 0.62, bw * 0.12, 0, 7); ctx.fill(); ctx.stroke();
    }
    // HP bar + number
    const barW = bw * 0.9, bx = x + bw * 0.05, by = Math.max(TOP_SAFE + 8, gy - bh - 30);
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(bx - 3, by - 3, barW + 6, 18, 8); ctx.fill();
    ctx.fillStyle = hpFrac > 0.5 ? '#5ad35a' : hpFrac > 0.2 ? '#f5c542' : '#f05050';
    roundRect(bx, by, Math.max(0, barW * hpFrac), 12, 6); ctx.fill();
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function baseLabel(S) {
    const bw = L.baseW(), gy = L.ground() + fieldH * 0.04, bh = bw * 1.25;
    ctx.save(); ctx.font = `800 ${Math.round(Math.max(13, bw * 0.13))}px system-ui, sans-serif`; ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.fillStyle = '#fff';
    for (const [side, b] of [[1, S.playerBase], [-1, S.enemyBase]]) {
      const cx = side === 1 ? bw * 0.55 : W - bw * 0.55;
      const t = `${Math.ceil(b.hp)} / ${b.max}`;
      const ly = Math.max(TOP_SAFE, gy - bh - 38);
      ctx.strokeText(t, cx, ly); ctx.fillText(t, cx, ly);
    }
    ctx.restore();
  }

  // ---------- units ----------
  function drawUnit(u) {
    const sp = BM.Sprites.get(u.form);
    let frame;
    if (u.windup >= 0) frame = sp.attack[0];
    else if (u.strikeT > 0) frame = sp.attack[sp.attack.length - 1];
    else if (u.state === 'attack') frame = sp.run[0];
    else frame = sp.run[Math.floor(u.animT * 9) % sp.run.length];
    const h = L.unitH(u.form) * (u.boss ? 2 : 1), s = h / sp.h;
    let x = L.sx(u.x);
    const y = L.ground() + L.depth(u);
    // run-only sprites "lunge" on the strike (enemy wave fodder: run sheet + type effect only)
    if (u.strikeT > 0 && sp.attack.length === 1) x += u.side * h * 0.15;
    ctx.save();
    if (u.dead) ctx.globalAlpha = Math.max(0, 1 - u.deadT / 0.6);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x, y, h * 0.32, h * 0.07, 0, 0, 7); ctx.fill();
    ctx.translate(x, y);
    if (u.side === -1) ctx.scale(-1, 1);
    if (u.dead) ctx.translate(0, u.deadT * h * 0.4);
    ctx.drawImage(frame, -sp.ax * s, -sp.ay * s, sp.w * s, sp.h * s);
    ctx.restore();
    if (!u.dead) {
      if (u.ace) { // leader's ace marker
        ctx.save(); ctx.font = `900 ${Math.round(Math.max(14, h * 0.2))}px system-ui, sans-serif`; ctx.textAlign = 'center';
        ctx.lineWidth = 4; ctx.strokeStyle = '#2a1a3a'; ctx.fillStyle = '#ffd84a';
        ctx.strokeText('★ ACE', x, y - h - 14); ctx.fillText('★ ACE', x, y - h - 14); ctx.restore();
      }
      if (u.hp < u.maxHp) {
        const bw = h * 0.6, by = y - h - 8;
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 7);
        ctx.fillStyle = u.side === 1 ? '#5ad35a' : '#f05050'; ctx.fillRect(x - bw / 2, by, bw * (u.hp / u.maxHp), 5);
      }
      if (u.side === 1) { // small Lv tag under your units (Phase 4)
        ctx.save(); ctx.font = `800 ${Math.round(Math.max(10, h * 0.13))}px system-ui, sans-serif`; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(20,28,50,.85)'; ctx.fillStyle = '#ffe14a';
        const ty = y + Math.max(11, h * 0.13) + (sp.placeholder ? h * 0.16 : 2);
        ctx.strokeText('Lv ' + u.level, x, ty); ctx.fillText('Lv ' + u.level, x, ty); ctx.restore();
      }
      const ly = y + h * 0.2, lw = h * 0.9;
      if (sp.placeholder && !labels.some((r) => Math.abs(r[0] - x) < (r[2] + lw) / 2 && Math.abs(r[1] - ly) < 16)) {
        labels.push([x, ly, lw]);
        ctx.save(); ctx.font = `700 ${Math.round(Math.max(11, h * 0.14))}px system-ui, sans-serif`; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.fillStyle = '#fff';
        ctx.strokeText(u.form.name, x, y + h * 0.2); ctx.fillText(u.form.name, x, y + h * 0.2); ctx.restore();
      }
    }
  }

  // ---------- effects ----------
  function onEvent(ev, now) {
    if (ev.type === 'dodge') {
      const t = ev.target, ty = L.ground() + L.depth(t) - L.unitH(t.form);
      if (!texts.some((x) => x.text === 'Dodged!' && now - x.t0 < 0.5)) texts.push({ text: 'Dodged!', x: Math.min(Math.max(L.sx(t.x), 120), W - 120), y: ty, t0: now, dur: 0.8, size: 24, color: '#bff5ff' });
    } else if (ev.type === 'hit' && ev.splash) { // Splash trait: a small burst on the neighbour, no projectile
      const t = ev.target, ty = L.ground() + L.depth(t) - L.unitH(t.form) * 0.5;
      fx.push({ kind: 'burst', x: L.sx(t.x), y: ty, color: BM.TYPE_COLORS[ev.attacker.form.attackType] || '#fff', art: null, dir: ev.attacker.side, t0: now + 0.12, dur: 0.25 });
      if (ev.mult === 0) addText(0, L.sx(t.x), ty - L.unitH(t.form) * 0.6, now);
    } else if (ev.type === 'hit') {
      const a = ev.attacker, t = ev.target, cb = BM.combatOf(a.form), dt = (ev.k || 0) * 0.11; // multi-hit: staggered
      const color = BM.TYPE_COLORS[a.form.attackType] || '#fff';
      const ty = L.ground() + L.depth(t) - L.unitH(t.form) * 0.5;
      const ay = L.ground() + L.depth(a) - L.unitH(a.form) * 0.55;
      moveFx(cb, a, L.sx(a.x), ay, L.sx(t.x), ty, color, now + dt);
      if (ev.mult !== 1) addText(ev.mult, L.sx(t.x), ty - L.unitH(t.form) * 0.6, now);
    } else if (ev.type === 'baseHit') {
      const bw = L.baseW(), a = ev.attacker;
      const x = ev.side === -1 ? W - bw * 0.6 : bw * 0.6;
      moveFx(BM.combatOf(a.form), a, L.sx(a.x), L.ground() + L.depth(a) - L.unitH(a.form) * 0.55,
        x + (Math.random() - 0.5) * bw * 0.4, L.ground() - bw * 0.5 + (Math.random() - 0.5) * bw * 0.4, BM.TYPE_COLORS[a.form.attackType], now + (ev.k || 0) * 0.11);
    } else if (ev.type === 'ace') {
      texts.push({ text: `${ev.leader || 'The leader'} sends out ${ev.unit.form.name}!`, x: W * 0.5, y: fieldH * 0.32, t0: now, dur: 2.2, size: 36, color: '#ffb347' });
    } else if (ev.type === 'bounty' && ev.paid > 0) { // G3: "+N AP" floats up from the defeated enemy (nothing at the cap)
      const t = ev.unit, ty = L.ground() + L.depth(t) - L.unitH(t.form) * (t.ace ? 1.1 : 0.9);
      if (texts.length > 10) texts.shift();
      texts.push({ text: ev.paid > 0 ? `+${ev.paid} AP` : 'AP full!', x: Math.min(Math.max(L.sx(t.x), 60), W - 60), y: ty, t0: now, dur: 1.0,
        size: ev.cls === 'boss' ? 34 : 22, color: ev.paid > 0 ? '#7ff5ff' : '#c9d6e8', bounty: true });
    } else if (ev.type === 'upgrade') {
      texts.push({ text: 'AP GENERATOR UP!', x: W * 0.5, y: fieldH * 0.3, t0: now, dur: 1.2, size: 34, color: '#7ff5ff' });
    }
  }
  // G9: the attack's species-flavoured visual (combat.js `fx`). A generated move sprite (assets/effects/moves/<fx>.png ->
  // BM.FX_FILES['move_<fx>']) is used when DONE; until then a procedural visual by kind — projectile (Razor Leaf, Bonemerang,
  // Shadow Ball…), stream (Ember breath, Water Gun, Thunder Shock, beams) or melee (Fury Swipes, punches, bites…). The
  // per-type effect sprite plays as the impact burst.
  function moveFx(cb, a, x0, y0, x1, y1, color, t0) {
    if (fx.length > 90) fx.splice(0, fx.length - 90);
    const art = BM.Sprites.fx('move_' + cb.fx), impact = BM.Sprites.fx(a.form.attackType), dir = a.side;
    const fly = cb.kind === 'projectile' ? Math.min(0.3, 0.12 + Math.abs(x1 - x0) / 2500) : cb.kind === 'stream' ? 0.16 : 0;
    if (art) fx.push({ kind: cb.kind === 'melee' ? 'burst' : 'shot', x0, y0, x1, y1, x: x1, y: y1, color, art, dir, t0, dur: fly || 0.3 });
    else if (cb.kind !== 'melee') fx.push({ kind: cb.kind, fxn: cb.fx, x0, y0, x1, y1, color, dir, t0, dur: fly + (cb.kind === 'stream' ? 0.12 : 0), seed: Math.random() });
    fx.push({ kind: 'move', fxn: cb.fx, x: x1, y: y1, color, dir, t0: t0 + fly, dur: 0.28, seed: Math.random() });
    if (impact) fx.push({ kind: 'burst', x: x1, y: y1, color, art: impact, dir, t0: t0 + fly, dur: 0.22 });
  }
  // Procedural species visuals (no sprite yet). All sizes scale with the field height.
  function drawMoveProc(f, k) {
    const u = fieldH * 0.02, c = f.color;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (f.kind === 'projectile') {
      const x = f.x0 + (f.x1 - f.x0) * k, y = f.y0 + (f.y1 - f.y0) * k - Math.sin(k * Math.PI) * (f.fxn === 'bone' ? u * 3 : u);
      ctx.translate(x, y); ctx.rotate(['leaf', 'bone', 'star'].includes(f.fxn) ? k * 14 * f.dir : 0);
      ctx.fillStyle = c; ctx.strokeStyle = '#1c1c28'; ctx.lineWidth = 2;
      if (f.fxn === 'leaf') { ctx.beginPath(); ctx.ellipse(0, 0, u * 1.6, u * 0.6, 0.5, 0, 7); ctx.fillStyle = '#5ac83a'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-u * 1.4, 0); ctx.lineTo(u * 1.4, 0); ctx.stroke(); }
      else if (f.fxn === 'bone') { ctx.fillStyle = '#f4efe2'; ctx.fillRect(-u * 1.6, -u * 0.3, u * 3.2, u * 0.6); ctx.strokeRect(-u * 1.6, -u * 0.3, u * 3.2, u * 0.6); for (const sx of [-1.6, 1.6]) for (const sy of [-0.4, 0.4]) { ctx.beginPath(); ctx.arc(sx * u, sy * u, u * 0.45, 0, 7); ctx.fill(); ctx.stroke(); } }
      else if (f.fxn === 'star') { ctx.fillStyle = '#ffe14a'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? u * 0.6 : u * 1.5, an = i * Math.PI / 5; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (f.fxn === 'needle') { ctx.strokeStyle = c; ctx.lineWidth = u * 0.4; for (const o of [-0.7, 0, 0.7]) { ctx.beginPath(); ctx.moveTo(-u * 1.8 * f.dir, o * u); ctx.lineTo(u * 0.6 * f.dir, o * u); ctx.stroke(); } }
      else if (f.fxn === 'ice') { ctx.fillStyle = '#bff0ff'; ctx.beginPath(); ctx.moveTo(u * 1.8 * f.dir, 0); ctx.lineTo(-u * f.dir, -u * 0.7); ctx.lineTo(-u * 0.6 * f.dir, 0); ctx.lineTo(-u * f.dir, u * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (f.fxn === 'rock') { ctx.fillStyle = '#9a7a55'; ctx.beginPath(); for (let i = 0; i < 7; i++) { const an = i / 7 * 7, r = u * (1 + ((f.seed * 10 + i) % 1) * 0.4); ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (f.fxn === 'psy') { ctx.strokeStyle = c; ctx.lineWidth = u * 0.35; for (let i = 0; i < 3; i++) { ctx.globalAlpha = 1 - i * 0.3; ctx.beginPath(); ctx.arc(-i * u * 1.2 * f.dir, 0, u * (1.4 + i * 0.3), 0, 7); ctx.stroke(); } }
      else if (f.fxn === 'sing') { ctx.fillStyle = c; ctx.font = `900 ${Math.round(u * 3)}px system-ui`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeText('♪', 0, u); ctx.fillText('♪', 0, u); ctx.strokeText('♫', -u * 2 * f.dir, -u); ctx.fillText('♫', -u * 2 * f.dir, -u); }
      else { // shadow / poison / fairy orbs
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, u * 1.6); g.addColorStop(0, '#fff'); g.addColorStop(0.35, c); g.addColorStop(1, f.fxn === 'shadow' ? '#2a1a3a' : c);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, u * 1.4, 0, 7); ctx.fill();
        if (f.fxn === 'fairy') { ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(Math.cos(i + k * 9) * u * 2, Math.sin(i + k * 9) * u * 2, u * 0.3, 0, 7); ctx.fill(); } }
      }
      return;
    }
    if (f.kind === 'stream') { // attacker -> target: breath / jet / bolt / beam / vine
      const reach = Math.min(1, k / 0.6), x2 = f.x0 + (f.x1 - f.x0) * reach, y2 = f.y0 + (f.y1 - f.y0) * reach;
      ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      if (f.fxn === 'flame') {
        for (let i = 0; i < 9; i++) { const q = i / 8, x = f.x0 + (x2 - f.x0) * q, y = f.y0 + (y2 - f.y0) * q + Math.sin(i * 2.3 + k * 20) * u * q;
          ctx.fillStyle = i % 3 === 0 ? '#ffe14a' : i % 3 === 1 ? '#ff8a2a' : '#e8463c'; ctx.beginPath(); ctx.arc(x, y, u * (0.5 + q * 1.1), 0, 7); ctx.fill(); }
      } else if (f.fxn === 'water') {
        ctx.strokeStyle = '#7ec8f5'; ctx.lineWidth = u * 1.1; ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = u * 0.35; ctx.beginPath(); ctx.moveTo(f.x0, f.y0 - u * 0.2); ctx.lineTo(x2, y2 - u * 0.2); ctx.stroke();
        ctx.fillStyle = '#d4f0ff'; for (let i = 0; i < 4; i++) { const q = (i / 4 + k) % 1; ctx.beginPath(); ctx.arc(f.x0 + (x2 - f.x0) * q, f.y0 + (y2 - f.y0) * q - u, u * 0.4, 0, 7); ctx.fill(); }
      } else if (f.fxn === 'bolt') {
        ctx.strokeStyle = '#ffe14a'; ctx.lineWidth = u * 0.6; ctx.shadowColor = '#fff7a0'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(f.x0, f.y0);
        for (let i = 1; i <= 6; i++) { const q = i / 6; ctx.lineTo(f.x0 + (x2 - f.x0) * q, f.y0 + (y2 - f.y0) * q + (i < 6 ? ((i * 37 + Math.floor(k * 12)) % 3 - 1) * u * 1.4 : 0)); }
        ctx.stroke();
      } else if (f.fxn === 'vine') {
        ctx.strokeStyle = '#3f8a30'; ctx.lineWidth = u * 0.5; ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.quadraticCurveTo((f.x0 + x2) / 2, Math.min(f.y0, y2) - u * 4, x2, y2); ctx.stroke();
      } else { // beam (Solar Beam, Tri Attack, Hyper Beam…)
        ctx.strokeStyle = f.color; ctx.lineWidth = u * 1.4; ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = u * 0.5; ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(x2, y2); ctx.stroke();
      }
      return;
    }
    // melee / impact visuals at the target
    ctx.translate(f.x, f.y); ctx.globalAlpha = 1 - k;
    const r = u * (1.2 + k * 1.6);
    ctx.strokeStyle = f.fxn === 'slash' ? '#fff' : f.color; ctx.lineWidth = u * 0.45;
    if (f.fxn === 'slash' || f.fxn === 'wing') { for (const o of [-0.8, 0, 0.8]) { ctx.beginPath(); ctx.moveTo(-r + o * u, -r); ctx.lineTo(r + o * u, r); ctx.stroke(); } }
    else if (f.fxn === 'fang') { ctx.fillStyle = '#fff'; for (const sy of [-1, 1]) for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * u * 0.9 - u * 0.4, sy * r * 0.9); ctx.lineTo(i * u * 0.9, sy * r * 0.2); ctx.lineTo(i * u * 0.9 + u * 0.4, sy * r * 0.9); ctx.fill(); ctx.stroke(); } }
    else if (f.fxn === 'splash') { ctx.fillStyle = '#7ec8f5'; for (let i = 0; i < 6; i++) { const an = -Math.PI * (0.15 + i * 0.14); ctx.beginPath(); ctx.arc(Math.cos(an) * r, Math.sin(an) * r, u * 0.4, 0, 7); ctx.fill(); } }
    else if (f.fxn === 'spark') { ctx.strokeStyle = '#ffe14a'; for (let i = 0; i < 5; i++) { const an = i * 1.26 + f.seed * 6; ctx.beginPath(); ctx.moveTo(Math.cos(an) * u * 0.5, Math.sin(an) * u * 0.5); ctx.lineTo(Math.cos(an + 0.3) * r * 0.7, Math.sin(an + 0.3) * r * 0.7); ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); ctx.stroke(); } }
    else { // punch / kick / slam / horn / slap / dragon: a star-burst
      ctx.fillStyle = '#fff'; ctx.beginPath(); for (let i = 0; i < 12; i++) { const rr = i % 2 ? r * 0.45 : r; const an = i * Math.PI / 6; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  function addText(mult, x, y, now) {
    let text, size, color;
    if (mult >= 2) { text = mult >= 4 ? 'SUPER EFFECTIVE!!' : 'SUPER EFFECTIVE!'; size = mult >= 4 ? 46 : 40; color = '#ffe14a'; }
    else if (mult === 0) { text = 'No effect!'; size = 30; color = '#c9d6e8'; }
    else { text = 'Not very effective…'; size = 22; color = '#e8e8e8'; }
    // throttle so a big fight doesn't become a wall of text
    if (mult >= 2 && now - lastBig < 0.35) return;
    if (mult < 2 && texts.some((t) => t.text === text && now - t.t0 < 0.6)) return;
    if (mult >= 2) lastBig = now;
    if (texts.length > 6) texts.shift();
    texts.push({ text, x: Math.min(Math.max(x, 170), W - 170), y, t0: now, dur: mult >= 2 ? 1.3 : 0.9, size, color });
  }
  // Attack-effect sprite (separate per-type sheet, BR-005): frame 0 in flight, 1 full size, 2 impact burst.
  function drawFxArt(f, k) {
    const a = f.art, h = fieldH * 0.11;
    let x, y, fr, sc = h / a.h;
    if (f.kind === 'shot') { x = f.x0 + (f.x1 - f.x0) * k; y = f.y0 + (f.y1 - f.y0) * k; fr = a.frames[k < 0.4 ? 0 : 1]; }
    else { x = f.x; y = f.y; fr = a.frames[Math.min(a.frames.length - 1, 2)]; sc *= 0.9 + k * 0.4; ctx.globalAlpha = k > 0.6 ? (1 - k) / 0.4 : 1; }
    ctx.translate(x, y);
    if (f.dir === -1) ctx.scale(-1, 1); // effects are drawn facing right; enemies fire left
    ctx.drawImage(fr, -a.ax * sc, -a.ay * sc, a.w * sc, a.h * sc);
  }
  function drawFx(now) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i], k = (now - f.t0) / f.dur;
      if (k >= 1) { fx.splice(i, 1); continue; }
      if (k < 0) continue; // scheduled impact frame
      ctx.save();
      if (f.art) { drawFxArt(f, k); ctx.restore(); continue; }
      if (f.kind === 'projectile' || f.kind === 'stream' || f.kind === 'move') { drawMoveProc(f, k); ctx.restore(); continue; }
      if (f.kind === 'shot') {
        const x = f.x0 + (f.x1 - f.x0) * k, y = f.y0 + (f.y1 - f.y0) * k;
        ctx.fillStyle = f.color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); ctx.stroke();
        ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x - (f.x1 - f.x0) * 0.06, y - (f.y1 - f.y0) * 0.06, 6, 0, 7); ctx.fill();
      } else {
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.color; ctx.fillStyle = '#fff'; ctx.lineWidth = 4;
        const r = 8 + k * 26;
        ctx.beginPath();
        for (let j = 0; j < 8; j++) { const a = (j / 8) * Math.PI * 2; ctx.moveTo(f.x + Math.cos(a) * r * 0.4, f.y + Math.sin(a) * r * 0.4); ctx.lineTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r); }
        ctx.stroke(); ctx.beginPath(); ctx.arc(f.x, f.y, 6 * (1 - k), 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i], k = (now - t.t0) / t.dur;
      if (k >= 1) { texts.splice(i, 1); continue; }
      const pop = k < 0.12 ? 0.6 + (k / 0.12) * 0.5 : k < 0.2 ? 1.1 - ((k - 0.12) / 0.08) * 0.1 : 1;
      const sz = Math.round(t.size * pop * Math.min(1, W / 900));
      ctx.save(); ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      ctx.font = `900 ${sz}px system-ui, 'Arial Black', sans-serif`; ctx.textAlign = 'center';
      ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, sz / 6); ctx.strokeStyle = '#2a1a3a';
      const y = t.y - k * 40;
      ctx.strokeText(t.text, t.x, y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, y);
      ctx.restore();
    }
  }

  function draw(B, now) {
    const S = B.S;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!bgCanvas || bgKey !== S.stage.background) { bgCanvas = drawBg(S.stage.background); bgKey = S.stage.background; }
    ctx.drawImage(bgCanvas, 0, 0, W, fieldH);
    drawBase(1, S.playerBase.hp / S.playerBase.max);
    drawBase(-1, S.enemyBase.hp / S.enemyBase.max);
    labels = [];
    const order = S.units.slice().sort((a, b) => a.yOff - b.yOff);
    for (const u of order) drawUnit(u);
    drawFx(now);
    baseLabel(S);
  }
  function clearFx() { fx.length = 0; texts.length = 0; }
  // Screen rects (CSS px) of the two base HP bars incl. their number labels — tests check the hint never covers them.
  function hpBarRects() {
    const bw = L.baseW(), gy = L.ground() + fieldH * 0.04, bh = bw * 1.25;
    return [1, -1].map((side) => {
      const x = side === 1 ? bw * 0.05 : W - bw * 1.05, top = Math.max(TOP_SAFE, gy - bh - 38) - 18;
      return { x: Math.min(x + bw * 0.05, (side === 1 ? bw * 0.55 : W - bw * 0.55) - 60), y: top, w: Math.max(bw * 0.9, 120), h: Math.max(TOP_SAFE + 8, gy - bh - 30) + 15 - top };
    });
  }
  return { resize, draw, onEvent, clearFx, hpBarRects, get fieldH() { return fieldH; } };
};
