// Lane battle simulation. Pure logic, fixed timestep, no drawing — render.js reads its state and
// the `events` queue (hits, faints, spawns) for visuals and sound.
window.BM = window.BM || {};
BM.Battle = function (stage, profile, opts = {}) {
  const C = BM.C;
  let seed = opts.seed != null ? opts.seed : (Math.random() * 1e9) | 0;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const baseHP = stage.baseHP || C.baseHP(stage.level);

  const S = {
    stage, t: 0, ap: C.START_AP, gen: 1, units: [], nextId: 1, events: [], result: null, speedMul: 1,
    playerBase: { hp: baseHP, max: baseHP }, enemyBase: { hp: baseHP, max: baseHP },
    team: profile.team.filter((id) => profile.lines[id]).map((id) => ({
      line: id, form: BM.FORMS[profile.lines[id].form], level: profile.lines[id].level, cd: 0,
    })),
    waves: stage.waves.map((w) => ({ ...w, next: w.start, spawned: 0 })),
    ace: stage.ace ? { ...stage.ace, out: false } : null, // leader's ace: once, at enemy base < 70% or 90 s (§4.4)
    battled: [],                                           // line ids fielded at least once (team XP, §4.3)
  };

  function count(side) { let n = 0; for (const u of S.units) if (u.side === side && !u.dead) n++; return n; }
  function makeUnit(form, level, side, x) {
    const st = BM.unitStats(form, level);
    const u = { id: S.nextId++, form, level, side, x, yOff: rnd() * 2 - 1, ...st, maxHp: st.hp,
      atkTimer: 0, windup: -1, strikeT: 0, target: null, state: 'walk', dead: false, deadT: 0, animT: rnd() };
    S.units.push(u);
    S.events.push({ type: 'spawn', unit: u });
    return u;
  }

  // ---- player actions ----
  function canSpawn(slot) {
    const c = S.team[slot];
    if (!c || S.result) return 'none';
    if (count(1) >= C.MAX_PER_SIDE) return 'full';
    if (c.cd > 0) return 'cooldown';
    if (S.ap < c.form.cost) return 'ap';
    return 'ok';
  }
  function spawn(slot) {
    const why = canSpawn(slot);
    if (why !== 'ok') return why;
    const c = S.team[slot];
    S.ap -= c.form.cost;
    c.cd = c.form.cd;
    makeUnit(c.form, c.level, 1, C.PLAYER_BASE_FRONT - 8 + rnd() * 16); // jitter: BR-001
    if (!S.battled.includes(c.line)) S.battled.push(c.line);
    return 'ok';
  }
  function genInfo() {
    const g = C.GEN[S.gen];
    return { level: S.gen, rate: g[0], cap: g[1], cost: g[2], max: S.gen >= C.GEN_MAX };
  }
  function upgradeGen() {
    const g = genInfo();
    if (S.result || g.max) return 'max';
    if (S.ap < g.cost) return 'ap';
    S.ap -= g.cost; S.gen++;
    S.events.push({ type: 'upgrade' });
    return 'ok';
  }

  // ---- simulation ----
  function nearestFoe(u) {
    let best = null, bestD = Infinity;
    for (const o of S.units) {
      if (o.dead || o.side === u.side) continue;
      const d = (o.x - u.x) * u.side;
      if (d >= -10 && d < bestD) { bestD = d; best = o; }
    }
    return { unit: best, dist: Math.max(0, bestD) };
  }
  function baseDist(u) { return u.side === 1 ? C.ENEMY_BASE_FRONT - u.x : u.x - C.PLAYER_BASE_FRONT; }

  function dealHit(u) {
    let tgt = u.target;
    if (tgt && tgt !== 'base' && (tgt.dead || Math.abs(tgt.x - u.x) > u.range + 25)) tgt = null;
    if (!tgt) { const f = nearestFoe(u); if (f.unit && f.dist <= u.range) tgt = f.unit; else if (baseDist(u) <= u.range) tgt = 'base'; }
    if (!tgt) return;
    u.strikeT = 0.18;
    if (tgt === 'base') {
      const base = u.side === 1 ? S.enemyBase : S.playerBase;
      base.hp = Math.max(0, base.hp - u.dmg);
      S.events.push({ type: 'baseHit', side: -u.side, attacker: u, dmg: u.dmg });
      if (base.hp <= 0 && !S.result) end(u.side === 1 ? 'win' : 'lose');
      return;
    }
    const mult = BM.typeMultiplier(u.form.attackType, tgt.form.types);
    const dmg = mult === 0 ? 0 : Math.max(1, Math.round(u.dmg * mult));
    tgt.hp -= dmg;
    S.events.push({ type: 'hit', attacker: u, target: tgt, mult, dmg });
    if (tgt.hp <= 0 && !tgt.dead) { tgt.dead = true; tgt.hp = 0; S.events.push({ type: 'faint', unit: tgt }); }
  }

  function end(result) {
    S.result = result;
    for (const u of S.units) {
      if (!u.dead && ((result === 'win' && u.side === -1) || (result === 'lose' && u.side === 1))) {
        u.dead = true; S.events.push({ type: 'faint', unit: u, quiet: true });
      }
    }
    S.events.push({ type: 'end', result });
  }

  function step(dt) {
    dt *= S.speedMul;
    for (const u of S.units) { u.animT += dt; if (u.strikeT > 0) u.strikeT -= dt; if (u.dead) u.deadT += dt; }
    S.units = S.units.filter((u) => !u.dead || u.deadT < 0.6);
    if (S.result) return;
    S.t += dt;
    const g = genInfo();
    S.ap = Math.min(g.cap, S.ap + g.rate * dt);
    for (const c of S.team) if (c.cd > 0) c.cd = Math.max(0, c.cd - dt);

    for (const w of S.waves) {
      if (S.t < w.next || (w.count != null && w.spawned >= w.count)) continue;
      if (count(-1) >= C.MAX_PER_SIDE) { w.next = S.t + 1; continue; }
      makeUnit(BM.FORMS[w.form], w.level, -1, C.ENEMY_BASE_FRONT + 8 - rnd() * 16);
      w.spawned++; w.next += w.every;
    }

    const A = S.ace;
    if (A && !A.out && (S.enemyBase.hp < S.enemyBase.max * C.ACE_BASE_FRAC || S.t >= C.ACE_TIME)) {
      A.out = true; // the ace ignores the side cap: it always comes out (normal size until the Phase 7 giant boss)
      const u = makeUnit(BM.FORMS[A.form], A.level, -1, C.ENEMY_BASE_FRONT - 4);
      u.ace = true;
      S.events.push({ type: 'ace', unit: u, leader: stage.leader });
    }

    for (const u of S.units) {
      if (u.dead) continue;
      u.atkTimer -= dt;
      if (u.windup >= 0) {
        u.windup -= dt;
        if (u.windup < 0) { dealHit(u); u.atkTimer = Math.max(0, u.interval - C.ATTACK_WINDUP); if (S.result) return; }
        continue;
      }
      const f = nearestFoe(u);
      let target = null;
      if (f.unit && f.dist <= u.range) target = f.unit;
      else if (baseDist(u) <= u.range) target = 'base';
      if (target) {
        u.state = 'attack';
        if (u.atkTimer <= 0) { u.target = target; u.windup = C.ATTACK_WINDUP; }
      } else {
        u.state = 'walk';
        u.x += u.side * u.speed * dt;
      }
    }
  }

  return { S, step, spawn, canSpawn, upgradeGen, genInfo, count };
};
