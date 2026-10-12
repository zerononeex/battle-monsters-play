// PHASE 11 LIVE FRIEND BATTLES — the match logic (no DOM). Two iPads, two saves, one lane: the host is side 1 (left on the
// host's screen), the guest side -1 (the guest's screen is drawn mirrored so each kid defends the LEFT base).
//  - HELLO: trainer name + team snapshot (line, form, level × up to 6), validated against local data — never trust the wire.
//  - Battle level (the fairness rule): 25 / 50 / 75 / 100 / Free-for-All, picked by the host; in a capped battle EVERY Pokémon
//    fights AT that level (stats AND AP cost), up or down. Free-for-All = true levels.
//  - Lockstep on ONE shared seed: both iPads run the same deterministic sim (BM.Battle with opts.pvp). A tap becomes an INPUT
//    { t, kind: spawn | genup, slot } applied at tick + INPUT_DELAY on BOTH sims; inputs are the only gameplay data sent. A
//    side may only step tick N once the friend has reported tick N − INPUT_DELAY + 1 (so every input for N has arrived).
//  - Desync guard: a CHECKSUM every SUM_EVERY ticks; on a mismatch the HOST sends a full state SNAPSHOT and the guest adopts it.
//  - Stakes: NONE. Nothing here touches a profile (no XP, candies, tickets, drops, clears, pity).
window.BM = window.BM || {};
BM.Pvp = (function () {
  const PROTO = 1;
  const LEVELS = [25, 50, 75, 100, 0];    // 0 = Free-for-All
  const INPUT_DELAY = 6, SUM_EVERY = 150; // ticks (30 per battle-second)
  const ARENA_LEVEL = 100;                // base HP = BM.C.baseHP(100) = 31,000 each (tuned up from the Champion-stage 60 = 19,000: pvp.mjs tune)
  const COUNTDOWN = 3;                    // seconds of 3-2-1
  const QUIET_MS = 12000;                 // no word from the friend for this long = the connection is gone
  const TEAM_MAX = () => BM.TEAM_SIZE || 6;
  const levelName = (cap) => (cap ? `Lv ${cap}` : 'Free-for-All');
  const fightLevel = (level, cap) => (cap ? cap : level);
  // the shown level: "Lv 65 → 50" when the fight level differs from the true level, else "Lv 65"
  const levelTag = (level, cap) => (fightLevel(level, cap) !== level ? `Lv ${level} → ${fightLevel(level, cap)}` : `Lv ${level}`);

  // The arena: region-NEUTRAL (no `region` → nobody is away), both bases equal, no waves / aces / bursts / items / drops.
  // Background: the Kanto Champion Room art (a symmetric trophy hall with no regional landmarks) — reused, no new art queued.
  const ARENA = { id: 'pvp_arena', name: 'Friend Battle', kind: 'pvp', pvp: true, level: ARENA_LEVEL, baseHP: null,
    waves: [], noBursts: true, background: 'indigo_plateau', bgArt: 'champion_room', music: 'battle_trainer' };
  const arena = () => (ARENA.baseHP == null ? Object.assign(ARENA, { baseHP: BM.C.baseHP(ARENA_LEVEL) }) : ARENA);

  // a fingerprint of the local roster data: two iPads on different game versions would build different sims
  let fp = null;
  function fingerprint() {
    if (fp) return fp;
    let h = 0x811c9dc5;
    const mix = (s) => { s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } };
    for (const id of Object.keys(BM.FORMS).sort()) { const f = BM.FORMS[id]; mix(id); mix(f.cost); mix(f.cd); mix(f.bst); mix(f.baseHP); mix(f.role); mix(f.types); }
    mix(JSON.stringify(BM.C.GEN)); mix(BM.C.MAX_PER_SIDE); mix(JSON.stringify(BM.C.BOUNTY));
    return (fp = (h >>> 0).toString(36));
  }

  // ---- HELLO ----
  // the active profile's current team: for each slot the line id, the chosen form and the level
  function teamSnapshot(p) {
    return (p.team || []).filter((id) => p.lines[id]).slice(0, TEAM_MAX()).map((id) => ({ line: id, form: p.lines[id].form, level: p.lines[id].level }));
  }
  const hello = (p) => ({ k: 'hello', v: PROTO, data: fingerprint(), name: String(p.name || 'Trainer').slice(0, 12), team: teamSnapshot(p) });
  const MAX_LV = () => Math.max(BM.C.LEVEL_CAP, ...Object.values(BM.CAP_LADDER || {}), 100);
  // validate a HELLO from the wire against LOCAL data; anything unknown is rejected
  function validateHello(m) {
    if (!m || typeof m !== 'object' || m.k !== 'hello') return { ok: false, why: 'bad' };
    if (m.v !== PROTO || m.data !== fingerprint()) return { ok: false, why: 'version' };
    if (!Array.isArray(m.team) || !m.team.length || m.team.length > TEAM_MAX()) return { ok: false, why: 'team' };
    const seen = new Set(), team = [];
    for (const e of m.team) {
      if (!e || typeof e !== 'object') return { ok: false, why: 'team' };
      const { line, form, level } = e;
      if (typeof line !== 'string' || typeof form !== 'string' || !Object.prototype.hasOwnProperty.call(BM.LINES, line)) return { ok: false, why: 'team' };
      const L = BM.LINES[line], F = Object.prototype.hasOwnProperty.call(BM.FORMS, form) ? BM.FORMS[form] : null;
      if (L.enemyOnly || !F || F.line !== line || F.enemyOnly) return { ok: false, why: 'team' };
      if (!Number.isInteger(level) || level < 1 || level > MAX_LV()) return { ok: false, why: 'team' };
      if (seen.has(line)) return { ok: false, why: 'team' };
      seen.add(line); team.push({ line, form, level });
    }
    const name = (typeof m.name === 'string' ? m.name : '').replace(/[\u0000-\u001f\u007f<>]/g, '').slice(0, 12).trim() || 'Friend';
    return { ok: true, name, team };
  }

  // ---- the battle ----
  function makeBattle(seed, cap, hostTeam, guestTeam) {
    return BM.Battle(arena(), { team: [], lines: {}, armed: [] }, { seed, items: [], pvp: { teams: [hostTeam, guestTeam], cap } });
  }
  // CHECKSUM: unit ids, positions, HP, both base HPs, both AP pools (+ generators, the tick and the RNG state), exact bits
  const fbuf = new DataView(new ArrayBuffer(8));
  function checksum(B) {
    const S = B.S;
    let h = 0x811c9dc5;
    const num = (v) => { fbuf.setFloat64(0, v === 0 ? 0 : +v); for (let i = 0; i < 8; i++) { h ^= fbuf.getUint8(i); h = Math.imul(h, 16777619); } };
    num(S.tick); num(B.rng.get()); num(S.playerBase.hp); num(S.enemyBase.hp); num(S.ap); num(S.gen); num(S.foe.ap); num(S.foe.gen);
    for (const u of S.units) { num(u.id); num(u.x); num(u.hp); num(u.dead ? 1 : 0); }
    return (h >>> 0).toString(16);
  }
  // SNAPSHOT: the engine's state shape — units (form → id, target / status source → unit id), bases, both AP pockets,
  // generators, cooldowns, the tick, the clock and the RNG state. JSON-safe.
  function snapshot(B) {
    const S = B.S;
    const unit = (u) => { const o = {}; for (const k of Object.keys(u)) { const v = u[k];
      if (k === 'form') o.form = v.id; else if (k === 'target') o.target = v && v !== 'base' ? { id: v.id } : v;
      else if (k === 'st') o.st = v ? { ...v, from: v.from ? v.from.id : null } : null; else o[k] = v; } return o; };
    const pocket = (P) => ({ ap: P.ap, gen: P.gen, bountyPaid: P.bountyPaid || 0, cds: P.team.map((c) => c.cd) });
    return { tick: S.tick, t: S.t, seed: B.rng.get(), nextId: S.nextId, result: S.result, units: S.units.map(unit),
      bases: [S.playerBase.hp, S.enemyBase.hp], host: pocket(S), guest: pocket(S.foe) };
  }
  function restore(B, snap) {
    const S = B.S, byId = new Map();
    S.units = snap.units.map((o) => { const u = { ...o, form: BM.FORMS[o.form] }; byId.set(u.id, u); return u; });
    // a target / status source that already left the field comes back as a stub that behaves the same (dead, never "this unit")
    for (const u of S.units) {
      if (u.target && u.target !== 'base') u.target = byId.get(u.target.id) || { id: u.target.id, dead: true, x: 0 };
      if (u.st) u.st = { ...u.st, from: u.st.from == null ? null : byId.get(u.st.from) || { id: u.st.from, dmg: 0 } };
    }
    S.tick = snap.tick; S.t = snap.t; S.nextId = snap.nextId; S.result = snap.result;
    S.playerBase.hp = snap.bases[0]; S.enemyBase.hp = snap.bases[1];
    for (const [P, p] of [[S, snap.host], [S.foe, snap.guest]]) { P.ap = p.ap; P.gen = p.gen; P.bountyPaid = p.bountyPaid; p.cds.forEach((cd, i) => { if (P.team[i]) P.team[i].cd = cd; }); }
    B.rng.set(snap.seed);
    S.events.length = 0;
  }

  // ---- the session: lobby → countdown → lockstep battle → result → rematch / done ----
  // opts: { transport, role: 'host' | 'guest', profile, level (host), speed (host), seed () → int, onEvent (ev) }
  function Session(o) {
    const T = o.transport, role = o.role, host = role === 'host';
    const emit = (type, data = {}) => { if (o.onEvent) o.onEvent({ type, ...data }); };
    const s = {
      role, mySide: host ? 1 : -1, state: 'lobby', level: host ? (LEVELS.includes(o.level) ? o.level : 50) : null, speed: host ? o.speed || 1 : 1,
      me: { name: String(o.profile.name || 'Trainer').slice(0, 12), team: teamSnapshot(o.profile), ready: false }, friend: null,
      B: null, paused: false, pausedBy: null, countdown: 0, winner: 0, endReason: null, rematchAsk: false,
      stats: { sums: 0, sumOk: 0, mismatches: 0, snapshots: 0, late: 0, resultMismatch: 0, maxLead: 0 },
    };
    let peerTk = 0, acc = 0, seq = 0, quietMs = 0, pingMs = 0, matchSeed = 0;
    let log = new Map(), mySums = new Map(), theirSums = new Map(), pending = [], hostEnd = null, localEnded = false;
    const send = (m) => T.send(m);
    function closeWith(reason, kind) {
      if (s.state === 'closed') return;
      const was = s.state;
      s.state = 'closed'; s.endReason = reason;
      try { T.close(); } catch (e) { /* gone */ }
      emit(kind || 'closed', { reason, was });
    }
    T.onMessage((m) => { quietMs = 0; try { onMsg(m); } catch (e) { closeWith('bad', 'error'); } });
    T.onClose(() => { if (s.state !== 'closed') closeWith(s.state === 'battle' || s.state === 'countdown' ? 'lost' : 'left-drop', 'lost'); });
    send({ ...hello(o.profile), ...(host ? { level: s.level, speed: s.speed } : {}) });

    function onMsg(m) {
      if (!m || typeof m.k !== 'string' || s.state === 'closed') return;
      switch (m.k) {
        case 'hello': {
          const v = validateHello(m);
          if (!v.ok) { send({ k: 'bye', why: v.why }); closeWith(v.why === 'version' ? 'version' : 'bad', 'error'); return; }
          s.friend = { name: v.name, team: v.team, ready: false };
          if (!host) { s.level = LEVELS.includes(m.level) ? m.level : 50; s.speed = [1, 2, 3].includes(m.speed) ? m.speed : 1; }
          emit('hello'); emit('lobby'); return;
        }
        case 'cfg': if (!host && LEVELS.includes(m.level) && s.state === 'lobby') { s.level = m.level; s.me.ready = false; if (s.friend) s.friend.ready = false; emit('lobby'); } return;
        case 'ready':
          if (!s.friend || s.state !== 'lobby') return;
          if (host && m.on && m.lv !== s.level) return; // readied for an old level: ignored (the guest sees the new level and readies again)
          s.friend.ready = !!m.on; emit('lobby'); if (host) maybeGo(); return;
        case 'go':
          if (host || s.state !== 'lobby' || !LEVELS.includes(m.level)) return;
          s.level = m.level; s.speed = [1, 2, 3].includes(m.speed) ? m.speed : 1; startCountdown(m.seed | 0); return;
        case 'in': {
          if (s.state !== 'battle' && s.state !== 'countdown') return;
          if (!['spawn', 'genup'].includes(m.kind) || !Number.isInteger(m.t) || !(m.kind === 'genup' || (Number.isInteger(m.slot) && m.slot >= 0 && m.slot < TEAM_MAX()))) return;
          if (s.B && m.t < s.B.S.tick) s.stats.late++; // can't happen under the lockstep rule; the checksum would catch its effect
          addInput(m.t, -s.mySide, m.kind, m.slot | 0, m.n | 0); return;
        }
        case 'tk': if (Number.isInteger(m.t) && m.t > peerTk) peerTk = m.t; return;
        case 'sum': if (Number.isInteger(m.t)) { theirSums.set(m.t, String(m.h)); compareSum(m.t); } return;
        case 'snap': if (!host && s.B && m.s) adopt(m.s); return;
        case 'end':
          if (host) { if (!s.B.S.result && s.state === 'battle') { s.stats.resultMismatch++; sendSnap(); } return; } // the guest ended alone: resync it
          hostEnd = { t: m.t | 0, w: m.w === -1 ? -1 : 1 }; return;
        case 'pause': if (s.state === 'battle') { s.paused = !!m.on; s.pausedBy = m.on ? 'friend' : null; emit('pause'); } return;
        case 'speed': if (!host && [1, 2, 3].includes(m.v)) { s.speed = m.v; emit('speed'); } return;
        case 'rematch': if (s.state === 'result') { s.rematchAsk = true; toLobby(); } return;
        case 'bye': closeWith(s.state === 'battle' || s.state === 'countdown' ? 'friend-left-battle' : 'friend-left', 'left'); return;
        case 'ping': return;
        default: return;
      }
    }

    // ---- lobby ----
    function setLevel(lv) {
      if (!host || s.state !== 'lobby' || !LEVELS.includes(lv) || lv === s.level) return false;
      s.level = lv; s.me.ready = false; if (s.friend) s.friend.ready = false; // changing it clears both READY states
      send({ k: 'cfg', level: lv }); emit('lobby'); return true;
    }
    function ready(on = true) {
      if (s.state !== 'lobby' || !s.friend) return false;
      s.me.ready = !!on; send({ k: 'ready', on: !!on, lv: s.level }); emit('lobby'); if (host) maybeGo(); return true;
    }
    function maybeGo() {
      if (!host || s.state !== 'lobby' || !s.me.ready || !s.friend || !s.friend.ready) return;
      const seed = (o.seed ? o.seed() : (Math.random() * 2 ** 31)) | 0;
      send({ k: 'go', seed, level: s.level, speed: s.speed });
      startCountdown(seed);
    }
    function startCountdown(seed) {
      matchSeed = seed;
      s.state = 'countdown'; s.countdown = COUNTDOWN;
      const hostTeam = host ? s.me.team : s.friend.team, guestTeam = host ? s.friend.team : s.me.team;
      s.B = makeBattle(seed, s.level, hostTeam, guestTeam);
      peerTk = 0; acc = 0; seq = 0; log = new Map(); mySums = new Map(); theirSums = new Map(); pending = []; hostEnd = null; localEnded = false;
      s.paused = false; s.pausedBy = null; s.winner = 0; s.rematchAsk = false;
      emit('countdown');
    }
    function toLobby() {
      s.state = 'lobby'; s.me.ready = false; if (s.friend) s.friend.ready = false; s.B = null; s.paused = false;
      emit('lobby');
    }

    // ---- inputs ----
    function addInput(t, side, kind, slot, n) {
      if (!log.has(t)) log.set(t, []);
      log.get(t).push({ side, kind, slot, n });
    }
    // a local tap: validated now (kid feedback), applied at tick + INPUT_DELAY on both sims
    function input(kind, slot = 0) {
      if (s.state !== 'battle' || s.paused || !s.B || s.B.S.result || localEnded) return 'wait';
      const B = s.B, side = s.mySide, P = B.pocket(side), spend = pending.reduce((a, x) => a + x.cost, 0);
      let cost;
      if (kind === 'spawn') {
        if (pending.some((x) => x.kind === 'spawn' && x.slot === slot)) return 'pending';
        const why = B.canSpawn(slot, side); if (why !== 'ok') return why;
        cost = P.team[slot].cost;
      } else if (kind === 'genup') {
        if (pending.some((x) => x.kind === 'genup')) return 'pending';
        const g = B.genInfo(side); if (g.max) return 'max';
        cost = g.cost;
      } else return 'none';
      if (P.ap - spend < cost) return 'ap';
      const t = B.S.tick + INPUT_DELAY, n = ++seq;
      pending.push({ kind, slot, cost, t });
      addInput(t, side, kind, slot, n);
      send({ k: 'in', t, kind, slot, n });
      return 'ok';
    }
    function applyInputs(t) {
      const list = log.get(t);
      if (!list) return;
      // deterministic order on both iPads: the host's inputs first, then the guest's, each in the order they were made
      list.sort((a, b) => b.side - a.side || a.n - b.n);
      for (const x of list) { if (x.kind === 'spawn') s.B.spawn(x.slot, x.side); else s.B.upgradeGen(x.side); }
    }

    // ---- desync guard ----
    function compareSum(t) {
      if (!mySums.has(t) || !theirSums.has(t)) return;
      s.stats.sums++;
      if (mySums.get(t) === theirSums.get(t)) s.stats.sumOk++;
      else { s.stats.mismatches++; emit('mismatch', { t }); if (host) sendSnap(); }
      mySums.delete(t); theirSums.delete(t);
    }
    function sendSnap() { s.stats.snapshots++; send({ k: 'snap', s: snapshot(s.B) }); }
    function adopt(snap) {
      const B = s.B, back = B.S.tick;
      restore(B, snap); s.stats.snapshots++;
      for (const t of [...mySums.keys()]) if (t >= snap.tick) mySums.delete(t);
      localEnded = !!B.S.result;
      // catch back up to where this iPad was (its own inputs for those ticks are in the log); the replayed ticks make no noise
      let guard = 0;
      while (B.S.tick < back && !B.S.result && guard++ < 100000) stepOnce();
      B.S.events.length = 0;
      if (B.S.result) localEnded = true;
      emit('resync', { tick: snap.tick });
    }

    // one lockstep tick: checksum (every SUM_EVERY ticks, before that tick's inputs) → this tick's inputs → the sim step
    function stepOnce() {
      const B = s.B, t = B.S.tick;
      if (t > 0 && t % SUM_EVERY === 0 && !mySums.has(t)) { const h = checksum(B); mySums.set(t, h); send({ k: 'sum', t, h }); compareSum(t); }
      applyInputs(t);
      pending = pending.filter((x) => x.t > t);
      B.tick();
      if (log.size > 64) for (const k of log.keys()) if (k < B.S.tick - 600) log.delete(k);
    }
    // ---- the clock (call every frame with real seconds) ----
    function update(dt) {
      if (s.state === 'closed') return 0;
      const ms = dt * 1000;
      quietMs += ms; pingMs += ms;
      if (pingMs >= 2000) { pingMs = 0; send({ k: 'ping' }); }
      if (quietMs >= QUIET_MS) { closeWith(s.state === 'battle' || s.state === 'countdown' ? 'lost' : 'left-drop', 'lost'); return 0; }
      if (s.state === 'countdown') {
        s.countdown -= dt;
        if (s.countdown <= 0) { s.state = 'battle'; s.countdown = 0; send({ k: 'tk', t: 0 }); emit('battle'); }
        return 0;
      }
      if (s.state !== 'battle' || s.paused) return 0;
      return run(dt * s.speed);
    }
    // step the sim as far as the clock AND the lockstep rule allow
    function run(simDt) {
      const B = s.B, DT = 1 / BM.C.TICK_HZ;
      acc += simDt;
      let steps = 0;
      while (acc >= DT - 1e-9 && steps < 40) {
        if (B.S.result || localEnded) { acc = 0; break; }
        if (B.S.tick >= peerTk + INPUT_DELAY) { acc = Math.min(acc, DT * INPUT_DELAY); break; } // waiting for the friend's iPad
        stepOnce(); steps++; acc -= DT;
      }
      if (steps) send({ k: 'tk', t: B.S.tick });
      s.stats.maxLead = Math.max(s.stats.maxLead, B.S.tick - peerTk);
      // the end: the host's sim is the referee; the guest shows the result once the host's agrees (or adopts the host's)
      if (B.S.result && !localEnded) {
        localEnded = true;
        const w = B.S.result === 'win' ? 1 : -1;
        send({ k: 'end', t: B.S.tick, w });
        if (host) finish(w);
      }
      if (!host && s.state === 'battle' && hostEnd) {
        if (localEnded && B.S.result) { const w = B.S.result === 'win' ? 1 : -1; if (w !== hostEnd.w) s.stats.resultMismatch++; finish(hostEnd.w); }
        else if (B.S.tick >= hostEnd.t) { s.stats.resultMismatch++; finish(hostEnd.w); }
      }
      return steps;
    }
    function finish(w) {
      if (s.state !== 'battle') return;
      s.state = 'result'; s.winner = w; s.paused = false;
      emit('end', { won: w === s.mySide });
    }

    // ---- pause / speed / rematch / leave ----
    function pause(on) {
      if (s.state !== 'battle') return false;
      s.paused = !!on; s.pausedBy = on ? 'me' : null; send({ k: 'pause', on: !!on }); emit('pause'); return true;
    }
    function setSpeed(v) {
      if (!host || ![1, 2, 3].includes(v)) return false;
      s.speed = v; send({ k: 'speed', v }); emit('speed'); return true;
    }
    function rematch() { if (s.state !== 'result') return false; send({ k: 'rematch' }); toLobby(); return true; }
    function leave() { if (s.state === 'closed') return; send({ k: 'bye' }); closeWith('me', 'closed'); }

    Object.defineProperties(s, { seed: { get: () => matchSeed }, peerTick: { get: () => peerTk }, pendingInputs: { get: () => pending.length } });
    return Object.assign(s, { update, input, setLevel, ready, pause, setSpeed, rematch, leave, _forceSnap: () => { if (host && s.B) sendSnap(); } });
  }

  return { PROTO, LEVELS, INPUT_DELAY, SUM_EVERY, ARENA_LEVEL, COUNTDOWN, ARENA: arena, levelName, fightLevel, levelTag, fingerprint,
    teamSnapshot, hello, validateHello, makeBattle, checksum, snapshot, restore, Session };
})();
