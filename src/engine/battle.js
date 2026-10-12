// Lane battle simulation. Pure logic, fixed timestep, no drawing — render.js reads its state and
// the `events` queue (hits, faints, spawns) for visuals and sound.
window.BM = window.BM || {};
BM.Battle = function (stage, profile, opts = {}) {
  const C = BM.C;
  let seed = opts.seed != null ? opts.seed : (Math.random() * 1e9) | 0;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // J2: the bases are DECOUPLED — the player base keeps 1000 + 300 × level (the kids' fail state); the enemy base follows
  // the raw-number curve (BM.enemyBaseHP, stages.js).
  const baseHP = stage.baseHP || C.baseHP(stage.level);
  const enemyHP = stage.baseHP || (BM.enemyBaseHP ? BM.enemyBaseHP(stage) : baseHP);

  // VV1 (Phase 7.6): stage restrictions (restrictions.js) — a field-cap override for both sides and an AP cost ceiling
  const CAP = BM.fieldCap ? BM.fieldCap(stage) : C.MAX_PER_SIDE;
  const S = {
    stage, t: 0, ap: C.START_AP, gen: 1, units: [], nextId: 1, events: [], result: null, speedMul: 1,
    playerBase: { hp: baseHP, max: baseHP }, enemyBase: { hp: enemyHP, max: enemyHP },
    team: profile.team.filter((id) => profile.lines[id]).map((id) => ({
      line: id, form: BM.FORMS[profile.lines[id].form], level: profile.lines[id].level, cd: 0,
      cost: BM.effCost(BM.FORMS[profile.lines[id].form], profile.lines[id].level), // L1: +1%/Lv, cap ×1.5
      // batch1 step 7 HOME-REGION RULE: the level its HP / damage fight at on this stage (half, rounded up, when away from home)
      fightLv: BM.battleLevel(BM.FORMS[profile.lines[id].form], profile.lines[id].level, stage),
    })).map((c) => ({ ...c, rule: BM.cardRuleWhy ? BM.cardRuleWhy(stage, c.cost) : null })), // VV1: why it may not deploy here
    cap: CAP,
    waves: stage.waves.map((w) => ({ ...w, next: w.start, spawned: 0 })),
    ace: stage.ace ? { ...stage.ace, out: false } : null, // leader's ace: once, at enemy base < 70% or 90 s (§4.4)
    // Hoenn: more one-time giants per stage — a second ace (Tate & Liza's twin, Seafloor Cavern's Groudon) at its OWN base-HP
    // threshold `at` (never inside a counter-burst), or a WW1 giant BLOCKER (`blocker: true`) that walks out at `time` seconds
    extraAces: (stage.extraAces || []).map((a) => ({ ...a, out: false })),
    battled: [],                                           // line ids fielded at least once (team XP, §4.3)
    bursts: [],                                            // K2 log: { kind: 'timer' | 'threshold', t, at, n }
  };
  // K2 wave cadence: timed bursts + HP-threshold counter-bursts (with a wall-breaker)
  const CAD = BM.waveCadence && stage.waves && stage.waves.length && !stage.noBursts ? BM.waveCadence(stage) : null;
  const rint = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  // OOO1 pack size for one trickle release of `form`. The trickle stretch (CAD.trickle) is PER BODY: a wave that releases packs
  // of ~2.5 waits ~2.5× as long between releases, so the same bodies arrive together instead of one by one.
  function packMean(form) {
    if (!CAD || !CAD.pack) return 1;
    const cls = BM.sizeClass(form);
    if (cls === 'boss' || form.boss) return 1;
    if (cls === 'large') return CAD.pack[1] >= 3 ? 1.35 : 1;
    return (CAD.pack[0] + CAD.pack[1]) / 2;
  }
  function packSize(form) {
    if (!CAD || !CAD.pack) return 1;
    const cls = BM.sizeClass(form);
    if (cls === 'boss' || form.boss) return 1;
    if (cls === 'large') return CAD.pack[1] >= 3 && rnd() < 0.35 ? 2 : 1;
    return rint(CAD.pack[0], CAD.pack[1]);
  }
  if (CAD) { S.cad = CAD; S.nextBurst = CAD.first; S.thrFired = CAD.thresholds.map(() => false); for (const w of S.waves) w.every *= CAD.trickle * packMean(BM.FORMS[w.form]); }
  // Y1 GATE (user, Phase 7.5): a stage's strongest enemy types never exist at second zero — they debut through ONE gate (stage
  // data `gate`): TIMER (`by: 'time'`, start spawning `at` seconds in) or BASE HP (`by: 'hp'`, the moment the enemy base drops
  // to `at` = 0.9, with an immediate reinforcement of each gated form). Until it opens, gated forms are held out of the trickle,
  // the bursts, the wall-breaker and the ace. `S.firstSpawn` logs each form's first appearance (the sim's gate check).
  const G = stage.gate ? { by: stage.gate.by, at: stage.gate.at, forms: new Set(stage.gate.forms), open: false, openT: null } : null;
  S.gate = G; S.firstSpawn = {};
  const gated = (formId) => !!(G && !G.open && G.forms.has(formId));
  if (G && G.by === 'time') for (const w of S.waves) if (G.forms.has(w.form)) w.next = Math.max(w.next, G.at);

  // Battle items armed on the pre-battle screen (consumed only on a WIN — BM.Save.recordWin). In-battle effects here.
  const items = (opts.items || profile.armed || []).filter((id) => BM.ITEM_INFO[id] && BM.ITEM_INFO[id].battle);
  S.items = items;
  if (items.includes('speed_up')) S.speedMul = BM.BATTLE_ITEM_FX.speedMul;
  if (items.includes('gen_lv8')) S.gen = C.GEN_MAX;
  if (items.includes('full_ap')) S.ap = C.GEN[S.gen][1];
  function count(side) { let n = 0; for (const u of S.units) if (u.side === side && !u.dead) n++; return n; }
  function makeUnit(form, level, side, x, statLevel = level) {
    const st = BM.unitStats(form, statLevel); // statLevel: the home-region rule's fighting level (player units only)
    const u = { id: S.nextId++, form, level, side, x, yOff: rnd() * 2 - 1, ...st, maxHp: st.hp,
      atkTimer: 0, windup: -1, strikeT: 0, target: null, state: 'walk', dead: false, deadT: 0, animT: rnd(), st: null, sigT: C.SIG.first };
    // K4: a reliable status (legendaries' signature) is a SPECIAL move — it lands every C.SIG.every seconds, not every hit
    if (u.status && u.statusChance >= 1) { u.sig = { move: BM.combatOf(form).move, aoe: u.aoe, status: u.status }; u.status = null; u.statusChance = 0; }
    S.units.push(u);
    if (side === -1 && S.firstSpawn[form.id] == null) S.firstSpawn[form.id] = Math.round(S.t * 100) / 100; // enemies only (Y1 check)
    S.events.push({ type: 'spawn', unit: u });
    return u;
  }

  // ---- player actions ----
  function canSpawn(slot) {
    const c = S.team[slot];
    if (!c || S.result) return 'none';
    if (c.rule) return 'rule'; // VV1: this stage's AP ceiling
    if (count(1) >= CAP) return 'full';
    if (c.cd > 0) return 'cooldown';
    if (S.ap < c.cost) return 'ap';
    return 'ok';
  }
  function spawn(slot) {
    const why = canSpawn(slot);
    if (why !== 'ok') return why;
    const c = S.team[slot];
    S.ap -= c.cost;
    c.cd = c.form.cd;
    makeUnit(c.form, c.level, 1, C.PLAYER_BASE_FRONT - 8 + rnd() * 16, c.fightLv); // jitter: BR-001
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
      for (let k = 0; k < (u.hits || 1); k++) S.events.push({ type: 'baseHit', side: -u.side, attacker: u, dmg: u.dmg / (u.hits || 1), k });
      if (base.hp <= 0 && !S.result) end(u.side === 1 ? 'win' : 'lose');
      return;
    }
    // G9: a multi-hit move (Fury Swipes ×3…) splits the attack's damage across its hits (k = hit index, for the visuals).
    // K3: an AREA attack (aoe > 0) lands every hit on EVERY foe in the zone around the target, in front of the attacker.
    const per = u.dmg / (u.hits || 1);
    // SIGNATURE (giant aces' `sig`, legendaries' reliable status): every C.SIG.every s the attack becomes the special move —
    // its big area and its status on everything it hits (reliable)
    const sigNow = !!(u.sig && u.sigT <= 0);
    if (sigNow) { u.sigT = u.sig.every || C.SIG.every; S.events.push({ type: 'signature', attacker: u, move: u.sig.move }); }
    const radius = sigNow && u.sig.aoe != null ? u.sig.aoe : u.aoe;
    u.sigNow = sigNow;
    const zone = radius > 0 ? S.units.filter((o) => o !== tgt && !o.dead && o.side !== u.side && Math.abs(o.x - tgt.x) <= radius && (o.x - u.x) * u.side >= -10) : [];
    if (zone.length) S.events.push({ type: 'aoe', attacker: u, target: tgt, n: zone.length + 1, radius, sig: sigNow });
    for (let k = 0; k < (u.hits || 1); k++) {
      if (!tgt.dead) hitUnit(u, tgt, per, false, k);
      for (const o of zone) if (!o.dead) hitUnit(u, o, per, true, k);
    }
  }
  // One hit on one unit: Dodger trait may dodge it; Flyer trait (or the type chart) can make it "No effect!". K4: a hit
  // that lands may inflict the attacker's status (its chance; a signature = reliable); a hit wakes a sleeper.
  function hitUnit(u, tgt, raw, splash, k = 0) {
    if (tgt.dodge && rnd() < tgt.dodge) { S.events.push({ type: 'dodge', attacker: u, target: tgt, splash, k }); return; }
    const mult = tgt.immune && tgt.immune.includes(u.form.attackType) ? 0 : BM.typeMultiplier(u.form.attackType, tgt.form.types);
    const dmg = mult === 0 ? 0 : Math.max(1, Math.round(raw * mult));
    tgt.hp -= dmg;
    S.events.push({ type: 'hit', attacker: u, target: tgt, mult, dmg, splash, k });
    if (tgt.hp <= 0 && !tgt.dead) { tgt.dead = true; tgt.hp = 0; tgt.st = null; S.events.push({ type: 'faint', unit: tgt }); if (tgt.side === -1) bounty(tgt); return; }
    if (dmg > 0 && tgt.st && BM.STATUS[tgt.st.type].wakeOnHit && tgt.st.from !== u) clearStatus(tgt);
    if (dmg > 0 && k === 0) {
      if (u.sigNow && u.sig.status) inflict(tgt, u.sig.status, u);
      else if (u.status && rnd() < u.statusChance) inflict(tgt, u.status, u);
    }
  }
  const bossy = (t) => !!(t.ace || t.boss || t.form.boss || (BM.LINES[t.form.line] && BM.LINES[t.form.line].legendary));
  function inflict(tgt, type, from) {
    const def = BM.STATUS[type];
    const dur = def.dur * (bossy(tgt) ? BM.STATUS_BOSS_MUL : 1);
    tgt.st = { type, t: dur, dur, from, dps: def.dot ? (def.dot * from.dmg) / def.dur : 0 };
    if (def.stop) tgt.windup = -1;
    S.events.push({ type: 'status', unit: tgt, status: type, dur });
  }
  function clearStatus(t) { const type = t.st && t.st.type; t.st = null; if (type) S.events.push({ type: 'statusEnd', unit: t, status: type }); }
  // G3 AP BOUNTY: a defeated enemy pays AP at once by its size class — up to the current cap, never above it (and never
  // takes AP away if a Full-AP start already sits at the cap). The event carries what was really paid for "+N AP".
  function bounty(u) {
    const cls = u.ace ? 'boss' : BM.sizeClass(u.form), n = C.BOUNTY[cls] || 0, cap = genInfo().cap;
    const before = S.ap;
    S.ap = Math.max(S.ap, Math.min(cap, S.ap + n));
    S.bountyPaid = (S.bountyPaid || 0) + (S.ap - before);
    S.events.push({ type: 'bounty', unit: u, cls, n, paid: Math.round(S.ap - before) });
  }

  // K2: a burst group spawns at once at the enemy base. Timer bursts: 3–5 from the stage's theme (+ one AoE / status
  // carrier when the stage has them). Threshold bursts: 3 + one WALL-BREAKER (the theme's strongest form, +2 levels,
  // HP ×2.5, knock-back proof) that ignores the side cap.
  function spawnBurst(kind, at) {
    const n = kind === 'timer' ? rint(CAD.size[0], CAD.size[1]) : CAD.counterSize;
    const pool = CAD.pool.filter((w) => !gated(w.form)), carriers = CAD.carriers.filter((w) => !gated(w.form)); // Y1
    if (!pool.length) return;
    const list = [];
    for (let i = 0; i < n; i++) list.push(pool[Math.floor(rnd() * pool.length)]);
    if (carriers.length) list[list.length - 1] = carriers[Math.floor(rnd() * carriers.length)];
    let made = 0;
    for (const w of list) {
      if (count(-1) >= CAP) break;
      makeUnit(BM.FORMS[w.form], w.level, -1, C.ENEMY_BASE_FRONT + 8 - made * 14 - rnd() * 8); made++;
    }
    let breaker = null;
    if (kind === 'threshold' && CAD.breaker.form) {
      // Y1: a gated wall-breaker waits for its gate — until then the strongest UNgated form breaks the wall
      let bf = CAD.breaker.form;
      if (gated(bf)) { let bv = -1; for (const w of pool) { const f = BM.FORMS[w.form], v = f.bst + f.baseHP; if (v > bv) { bv = v; bf = w.form; } } }
      breaker = makeUnit(BM.FORMS[bf], CAD.breaker.level, -1, C.ENEMY_BASE_FRONT - 6);
      breaker.breaker = true; breaker.kbResist = true; breaker.hp = breaker.maxHp = Math.round(breaker.hp * CAD.breakerHp); made++;
    }
    const rec = { kind, t: Math.round(S.t * 10) / 10, at, n: made, breaker: breaker ? breaker.form.id : null };
    S.bursts.push(rec);
    S.events.push({ type: 'burst', ...rec });
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

    // Y1: open the gate (timer or base HP); a base-HP gate sends one of each gated form at once (an early reinforcement)
    if (G && !G.open && ((G.by === 'time' && S.t >= G.at) || (G.by === 'hp' && S.enemyBase.hp <= S.enemyBase.max * G.at))) {
      G.open = true; G.openT = Math.round(S.t * 100) / 100;
      S.events.push({ type: 'gate', by: G.by });
      if (G.by === 'hp') for (const w of S.waves) {
        if (!G.forms.has(w.form)) continue;
        if (count(-1) < CAP + 2) { makeUnit(BM.FORMS[w.form], w.level, -1, C.ENEMY_BASE_FRONT + 4 - rnd() * 12); w.spawned++; }
        w.next = Math.max(w.next, S.t + w.every);
      }
    }
    for (const w of S.waves) {
      if (gated(w.form)) continue;
      if (S.t < w.next || (w.count != null && w.spawned >= w.count)) continue;
      if (count(-1) >= CAP) { w.next = S.t + 1; continue; }
      // OOO1: a trickle release is a PACK of fodder / medium units (extras 1–2 levels lower); large units come solo (a pair
      // late on, when the pack range allows 3+); aces / bosses always solo
      const n = packSize(BM.FORMS[w.form]);
      // BR-099 (Hoenn tables, `packBase`): the extras come as the line's BASE form — more, weaker bodies, not more power
      for (let k = 0; k < n && count(-1) < CAP; k++) makeUnit(BM.FORMS[k && stage.packBase ? BM.packBaseOf(w.form) : w.form], k ? Math.max(1, w.level - CAD.packLv) : w.level, -1, C.ENEMY_BASE_FRONT + 8 - k * 12 - rnd() * 16);
      w.spawned++; w.next += w.every;
    }

    // K2: timed bursts (3–5 at once every ~20–30 s) and HP-threshold counter-bursts (75 / 50 / 25%) with a wall-breaker
    if (CAD) {
      if (S.t >= S.nextBurst) { spawnBurst('timer', null); S.nextBurst = S.t + rint(CAD.every[0], CAD.every[1]); }
      CAD.thresholds.forEach((at, i) => { if (!S.thrFired[i] && S.enemyBase.hp < S.enemyBase.max * at) { S.thrFired[i] = true; spawnBurst('threshold', at); } });
    }

    const A = S.ace;
    if (A && !A.out && !gated(A.form) && (S.enemyBase.hp < S.enemyBase.max * C.ACE_BASE_FRAC || S.t >= C.ACE_TIME)) {
      A.out = true; // the ace ignores the side cap: it always comes out (§4.4)
      const u = makeUnit(BM.FORMS[A.form], A.level, -1, C.ENEMY_BASE_FRONT - 4);
      u.ace = true;
      // GIANT BOSS (§4.4, Phase 7: gym aces from stage 13, every Elite Four ace, the Champion's ace): 2× sprite, HP ×6,
      // damage ×2, can't be knocked back, and its SIGNATURE move (big AoE, reliable status) from the stage data.
      if (A.giant) {
        u.boss = true; u.giant = true; u.kbResist = true;
        u.hp = u.maxHp = Math.round(u.hp * C.GIANT.hp); u.dmg = Math.round(u.dmg * C.GIANT.dmg);
        if (A.sig) { u.sig = A.sig; if (A.sig.reach) u.range = Math.max(u.range, A.sig.reach); } // used every C.SIG.every s
      }
      S.events.push({ type: 'ace', unit: u, leader: stage.leader, giant: !!A.giant });
    }
    for (const X of S.extraAces) {
      if (X.out || gated(X.form) || !((X.at != null && S.enemyBase.hp < S.enemyBase.max * X.at) || (X.time != null && S.t >= X.time))) continue;
      X.out = true;
      const u = makeUnit(BM.FORMS[X.form], X.level, -1, C.ENEMY_BASE_FRONT - 4);
      u.ace = true; // boss bounty + the ace marker (a blocker too)
      if (X.giant) {
        u.boss = true; u.giant = true; u.kbResist = true;
        u.hp = u.maxHp = Math.round(u.hp * C.GIANT.hp); u.dmg = Math.round(u.dmg * C.GIANT.dmg);
        if (X.sig) { u.sig = X.sig; if (X.sig.reach) u.range = Math.max(u.range, X.sig.reach); }
      }
      S.events.push({ type: 'ace', unit: u, leader: X.blocker ? null : stage.leader, giant: !!X.giant, blocker: !!X.blocker });
    }

    // K4 status: tick durations, poison damage over time
    for (const u of S.units) {
      if (u.dead || !u.st) continue;
      u.st.t -= dt;
      if (u.st.dps) {
        u.hp -= u.st.dps * dt;
        if (u.hp <= 0) { u.hp = 0; u.dead = true; S.events.push({ type: 'faint', unit: u }); if (u.side === -1) bounty(u); continue; }
      }
      if (u.st.t <= 0) clearStatus(u);
    }

    for (const u of S.units) {
      if (u.dead) continue;
      const sd = u.st && BM.STATUS[u.st.type];
      if (sd && sd.stop) { u.state = 'attack'; continue; } // frozen / asleep: no march, no attack
      const udt = sd && sd.slow ? dt * sd.slow : dt;      // paralyzed: move + attack speed halved
      u.atkTimer -= udt; if (u.sig) u.sigT -= udt;
      if (u.windup >= 0) {
        u.windup -= udt;
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
        u.x += u.side * u.speed * udt;
      }
    }
  }

  // Phase 8 perf stress (dev overlay + perf tests only — never called by normal play): one enemy of a form, up to the side cap,
  // and a timed burst on demand.
  const devSpawnEnemy = (formId, level) => (count(-1) < CAP ? makeUnit(BM.FORMS[formId], level, -1, C.ENEMY_BASE_FRONT + 8 - rnd() * 16) : null);
  const devBurst = () => { if (CAD) spawnBurst('timer', null); };
  return { S, step, spawn, canSpawn, upgradeGen, genInfo, count, hitUnitForTest: (u, tgt, raw) => hitUnit(u, tgt, raw, false), devSpawnEnemy, devBurst };
};
