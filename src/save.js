// Browser-local saves: 3 profile slots, versioned with a migration chain (BUG_REGISTRY BR-006).
// Export/import code per profile: "BM<v>-<z|j><base64url payload>-<crc32 hex>"
//   payload = JSON {v, p: profile}; z = deflate-raw compressed (CompressionStream), j = plain JSON.
window.BM = window.BM || {};
BM.Save = (function () {
  const KEY = 'battle-monsters.save';
  const VERSION = 8;
  const SLOTS = 3;
  const GRADES = [2, 3, 4, 5, 6, 7]; // grade drives the Phase 6 math difficulty; set at creation only
  // MIGRATIONS[n] upgrades a WHOLE save from version n to n+1. Never edit a shipped step; append.
  const MIGRATIONS = {
    // v1 (Phase 1): one profile, lines {level, form}, no grade picker.
    // v2: per-line `unlocked` form list (form choice on the team screen); grade null = ask once on the picker.
    1: (d) => {
      for (const p of d.profiles) {
        if (!p) continue;
        for (const id of Object.keys(p.lines || {})) {
          const l = p.lines[id];
          l.unlocked = Array.isArray(l.unlocked) ? l.unlocked : [l.form];
          if (!l.unlocked.includes(l.form)) l.unlocked.push(l.form);
        }
        p.team = (p.team || []).slice(0, 10);
      }
      if (d.active == null || !d.profiles[d.active]) d.active = null;
      return d;
    },
    // v3 (Phase 3): reward wallet. tickets (§4.5: 30 to start + the first-clear tickets of stages already cleared),
    // items {itemId: count} (+ the fixed drops of stages already cleared), per-line total `xp` on the L³ curve
    // (§4.3; a Lv L line starts at L³ — Phase 4 turns xp into levels), mapAt (where the map token stands).
    2: (d) => {
      for (const p of d.profiles) {
        if (!p) continue;
        p.tickets = START_TICKETS;
        p.items = {};
        for (const id of Object.keys(p.lines || {})) p.lines[id].xp = Math.pow(Math.max(1, p.lines[id].level | 0), 3);
        for (const sid of Object.keys(p.cleared || {})) {
          const st = BM.stageById(sid);
          if (!st || st.dev || !(p.cleared[sid] > 0)) continue;
          const r = BM.stageRewards(st, true);
          p.tickets += r.tickets;
          if (r.item) p.items[r.item] = (p.items[r.item] || 0) + 1;
          if (r.gift) giveLine(p, r.gift);
        }
        p.mapAt = null;
      }
      return d;
    },
    // v4 (Phase 4): stored XP becomes levels (level = ∛xp, cap 60 — every Phase 3 line was still Lv 1), and preset
    // teams (playtest F4): loadouts[] (null or { team, forms }) with loadoutSlots free slots (more bought with tickets).
    3: (d) => {
      for (const p of d.profiles) {
        if (!p) continue;
        for (const id of Object.keys(p.lines || {})) { const l = p.lines[id]; l.level = BM.levelFromXp(Math.max(l.xp || 1, Math.pow(l.level || 1, 3))); }
        p.loadoutSlots = LOADOUT.FREE;
        p.loadouts = Array(LOADOUT.FREE).fill(null);
      }
      return d;
    },
    // v5 (Phase 5): T3 preset rail — `loadoutAt` = the preset being edited (the team IS that preset; edits auto-save to
    // it); gacha — `pity` {bannerId: pulls since that banner's last legendary}, `pulls` {bannerId: total}; battle items —
    // `armed` [itemIds] chosen on the pre-battle screen (consumed only on a WIN).
    4: (d) => {
      for (const p of d.profiles) {
        if (!p) continue;
        // the current team becomes a circle WITHOUT touching saved presets: the preset that already equals it, else the
        // first empty circle; only if all are full does circle 1 become current (and its team is loaded on use)
        p.loadouts = Array.isArray(p.loadouts) ? p.loadouts : [];
        const team = (p.team || []).slice(), key = team.join();
        let at = p.loadouts.findIndex((lo) => lo && Array.isArray(lo.team) && lo.team.join() === key);
        if (at < 0) at = p.loadouts.findIndex((lo) => !lo);
        if (at < 0 && p.loadouts.length < (p.loadoutSlots || LOADOUT.FREE)) at = p.loadouts.length;
        if (at < 0) at = 0;
        else if (!p.loadouts[at] && team.length) p.loadouts[at] = { team, forms: Object.fromEntries(team.map((id) => [id, p.lines[id] && p.lines[id].form])) };
        p.loadoutAt = at;
        p.pity = {}; p.pulls = {}; p.armed = [];
      }
      return d;
    },
    // v6 (Phase 6): the challenge mistake allowances become per-profile settings (sliders) — old profiles get the
    // defaults: math 2 (range 2–10), spelling 3 (range 3–10).
    5: (d) => {
      for (const p of d.profiles) {
        if (!p) continue;
        p.settings = p.settings || { music: true, sound: true };
        p.settings.mathMistakes = MISTAKES.mathMistakes.def;
        p.settings.spellMistakes = MISTAKES.spellMistakes.def;
      }
      return d;
    },
    // v7 (Phase 7): J1 hidden enemy intel — `attempted` {stageId: 1} = the profile has started that stage at least once
    // (a cleared stage was attempted, so it starts revealed); TA team names live on each preset (`name`, optional).
    6: (d) => {
      for (const p of d.profiles) {
        if (!p) continue;
        p.attempted = {};
        for (const sid of Object.keys(p.cleared || {})) if (p.cleared[sid] > 0) p.attempted[sid] = 1;
        p.regionsDone = {}; // regions fully beaten (the Champion's first clear) — the home carousel shows them complete
      }
      return d;
    },
    // v8 (Phase 7.5): X1 — enemy intel is revealed by the first CLEAR (known = cleared(stage)), not the first attempt. The v7
    // `attempted` flags are dropped: a cleared stage stays revealed through `cleared`, an attempted-but-uncleared one hides
    // again. Nothing else changes (lossless).
    7: (d) => {
      for (const p of d.profiles) if (p) delete p.attempted;
      return d;
    },
  };
  const MISTAKES = { mathMistakes: { def: 2, min: 2, max: 10 }, spellMistakes: { def: 3, min: 3, max: 10 } }; // = BM.CHALLENGE.SLIDERS
  const START_TICKETS = 30; // §4.5: a new profile starts with 3 pulls
  const LOADOUT = { FREE: 10, MAX: 20, PRICE: 50 }; // F4: 10 free preset teams, buy up to 20 at 50 tickets each
  const XP_CAP = Math.pow(BM.C.LEVEL_CAP, 3);

  function newProfile(slot, name, grade) {
    const p = {
      slot, name: name || 'Player ' + (slot + 1), grade: grade || null, created: Date.now(),
      settings: { music: true, sound: true, mathMistakes: MISTAKES.mathMistakes.def, spellMistakes: MISTAKES.spellMistakes.def },
      cleared: {},               // stageId -> number of wins
      lines: {},                 // lineId -> { level, xp (total, L³ curve), form (fielded), unlocked: [formIds] }
      team: BM.DEFAULT_TEAM.slice(),
      tickets: START_TICKETS,    // Battle Tickets (spent on the Phase 5 banners)
      items: {},                 // itemId -> count (stones / held items; used from the collection in Phase 4)
      mapAt: null,               // stage id the map token stands on (null = place it without walking)
      loadoutSlots: LOADOUT.FREE, // preset teams (F4)
      loadouts: Array(LOADOUT.FREE).fill(null), // null | { team: [lineIds], forms: { lineId: formId } }
      loadoutAt: 0,              // T3: the preset being edited (the team auto-saves into it)
      pity: {},                  // bannerId -> pulls since that banner's last legendary (§4.5 pity at 40)
      pulls: {},                 // bannerId -> total pulls
      armed: [],                 // battle items armed for the next battle (consumed only on a WIN)
      regionsDone: {},           // Phase 7: regions fully beaten (the Champion's first clear: Mewtwo + Master Ball + ending)
    };
    for (const id of BM.DEFAULT_TEAM) giveLine(p, id);
    p.loadouts[0] = { team: p.team.slice(), forms: Object.fromEntries(p.team.map((id) => [id, p.lines[id].form])) };
    return p;
  }
  function giveLine(p, id) {
    const line = BM.LINES[id];
    if (!line || line.enemyOnly || p.lines[id]) return false;
    p.lines[id] = { level: 1, xp: 1, form: line.forms[0].id, unlocked: [line.forms[0].id] };
    return true;
  }
  function blank() { return { v: VERSION, active: null, profiles: Array(SLOTS).fill(null) }; }

  let data = blank();
  let memoryOnly = false;

  function migrate(d) {
    if (!d || typeof d.v !== 'number' || !Array.isArray(d.profiles)) throw new Error('Not a Battle Monsters save');
    if (d.v > VERSION) throw new Error('Save is from a newer version of the game');
    while (d.v < VERSION) {
      const step = MIGRATIONS[d.v];
      if (!step) throw new Error('No migration from save v' + d.v);
      d = step(d); d.v += 1;
    }
    while (d.profiles.length < SLOTS) d.profiles.push(null);
    d.profiles.forEach((p, i) => p && sanitize(p, i));
    return d;
  }
  // Drop anything that no longer exists in data (renamed/removed lines/forms) so a save never crashes the game.
  function sanitize(p, slot) {
    p.slot = slot;
    p.settings = { music: true, sound: true, ...(p.settings || {}) };
    for (const [k, r] of Object.entries(MISTAKES)) { const v = Number(p.settings[k]); p.settings[k] = Number.isFinite(v) ? Math.max(r.min, Math.min(r.max, Math.round(v))) : r.def; }
    p.cleared = p.cleared || {};
    p.tickets = Math.max(0, Number.isFinite(p.tickets) ? Math.floor(p.tickets) : START_TICKETS);
    p.items = p.items && typeof p.items === 'object' ? p.items : {};
    for (const k of Object.keys(p.items)) if (!BM.ITEMS[k] || !(p.items[k] > 0)) delete p.items[k];
    if (p.mapAt != null && !BM.stageById(p.mapAt)) p.mapAt = null;
    for (const id of Object.keys(p.lines || {})) {
      const line = BM.LINES[id], l = p.lines[id];
      if (!line || line.enemyOnly) { delete p.lines[id]; continue; }
      const ids = line.forms.map((f) => f.id);
      l.level = Math.max(1, Math.min(BM.C.LEVEL_CAP, l.level | 0 || 1));
      l.xp = Math.min(XP_CAP, Math.max(Math.pow(l.level, 3), Number.isFinite(l.xp) ? Math.floor(l.xp) : 0));
      l.level = BM.levelFromXp(l.xp); // the level always follows the total XP (§4.3)
      l.unlocked = (l.unlocked || []).filter((f) => ids.includes(f));
      if (!l.unlocked.includes(ids[0])) l.unlocked.unshift(ids[0]); // the base form is always fieldable
      if (!l.unlocked.includes(l.form)) l.form = l.unlocked[0];
    }
    p.team = [...new Set(p.team || [])].filter((id) => p.lines[id]).slice(0, BM.TEAM_SIZE);
    p.loadoutSlots = Math.max(LOADOUT.FREE, Math.min(LOADOUT.MAX, p.loadoutSlots | 0));
    p.loadouts = Array.from({ length: p.loadoutSlots }, (_, i) => {
      const lo = (p.loadouts || [])[i];
      if (!lo || !Array.isArray(lo.team)) return null;
      const team = [...new Set(lo.team)].filter((id) => p.lines[id]).slice(0, BM.TEAM_SIZE);
      const forms = {};
      for (const id of team) { const f = lo.forms && lo.forms[id]; if (f && p.lines[id].unlocked.includes(f)) forms[id] = f; }
      if (!team.length) return null;
      const name = typeof lo.name === 'string' ? lo.name.trim().slice(0, 14) : '';
      return name ? { team, forms, name } : { team, forms };
    });
    p.loadoutAt = Math.max(0, Math.min(p.loadoutSlots - 1, p.loadoutAt | 0));
    const counts = (o) => Object.fromEntries(Object.entries(o && typeof o === 'object' ? o : {}).filter(([k, v]) => BM.BANNERS && BM.BANNERS.some((b) => b.id === k) && v >= 0).map(([k, v]) => [k, Math.floor(v)]));
    p.pity = counts(p.pity); p.pulls = counts(p.pulls);
    p.regionsDone = Object.fromEntries(Object.keys(p.regionsDone && typeof p.regionsDone === 'object' ? p.regionsDone : {}).map((k) => [k, 1]));
    delete p.attempted; // X1 (v8): intel follows `cleared`
    p.armed = [...new Set(Array.isArray(p.armed) ? p.armed : [])].filter((id) => BM.ITEM_INFO[id] && BM.ITEM_INFO[id].battle && p.items[id] > 0);
    return p;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      data = raw ? migrate(JSON.parse(raw)) : blank();
    } catch (e) {
      console.warn('Save unavailable, playing without saving', e);
      data = blank(); memoryOnly = true;
    }
    persist();
    return data;
  }
  function persist() {
    if (memoryOnly) return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('Save failed', e); }
  }
  function profile() { return data.active == null ? null : data.profiles[data.active]; }
  function list() { return data.profiles; }
  function select(slot) { if (data.profiles[slot]) { data.active = slot; persist(); } return profile(); }
  function create(slot, name, grade) {
    data.profiles[slot] = newProfile(slot, String(name || '').trim().slice(0, 12) || null, grade);
    data.active = slot; persist();
    return profile();
  }
  // Only for a profile that has no grade yet (a migrated Phase 1 save) — grade is not a setting.
  function finishSetup(slot, grade, name) {
    const p = data.profiles[slot];
    if (p && p.grade == null && GRADES.includes(grade)) {
      p.grade = grade;
      if (name && String(name).trim()) p.name = String(name).trim().slice(0, 12);
      persist();
    }
  }
  function eraseProfile(slot) {
    data.profiles[slot] = null;
    if (data.active === slot) data.active = null;
    persist();
  }

  // ---------- export / import codes ----------
  const CRC = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0'); }
  const b64u = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = (s) => { const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  async function pipe(bytes, Stream) {
    const out = new Response(new Blob([bytes]).stream().pipeThrough(new Stream('deflate-raw')));
    return new Uint8Array(await out.arrayBuffer());
  }
  async function exportCode(slot) {
    const p = data.profiles[slot];
    if (!p) return null;
    const { slot: _s, ...rest } = p;
    const json = new TextEncoder().encode(JSON.stringify({ v: VERSION, p: rest }));
    let mode = 'j', body = json;
    if (typeof CompressionStream !== 'undefined') { try { body = await pipe(json, CompressionStream); mode = 'z'; } catch (e) { body = json; } }
    return `BM${VERSION}-${mode}${b64u(body)}-${crc32(json)}`;
  }
  // Decodes + verifies a code. Returns { profile } or { error: 'kid-readable reason' }.
  async function decodeCode(code) {
    const m = /^BM(\d+)-([zj])([A-Za-z0-9_-]+)-([0-9a-f]{8})$/.exec(String(code || '').replace(/\s+/g, ''));
    if (!m) return { error: "That doesn't look like a Battle Monsters code." };
    let json;
    try {
      let bytes = unb64u(m[3]);
      if (m[2] === 'z') {
        if (typeof DecompressionStream === 'undefined') return { error: 'This device is too old to read that code.' };
        bytes = await pipe(bytes, DecompressionStream);
      }
      if (crc32(bytes) !== m[4]) return { error: 'That code has a typo in it (checksum failed).' };
      json = JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return { error: 'That code is broken or incomplete.' }; }
    if (+m[1] !== json.v) return { error: 'That code is broken (version mismatch).' };
    try {
      const d = migrate({ v: json.v, active: 0, profiles: [json.p] });
      return { profile: d.profiles[0] };
    } catch (e) { return { error: e.message }; }
  }
  async function importCode(code, slot) {
    const r = await decodeCode(code);
    if (r.error) return r;
    data.profiles[slot] = sanitize(r.profile, slot);
    persist();
    return { profile: data.profiles[slot] };
  }

  // ---------- line / form helpers (team + collection screens) ----------
  function setForm(lineId, formId) {
    const l = profile().lines[lineId];
    if (l && l.unlocked.includes(formId)) { l.form = formId; if (profile().team.includes(lineId)) saveTeam(); persist(); return true; }
    return false;
  }
  // ---------- XP, levels, evolution, items (Phase 4) ----------
  // Adds XP to a line (capped at Lv 60's 216,000) and re-derives its level. Returns { from, to, xpBefore, xpAfter }.
  function addXp(p, id, n) {
    const l = p.lines[id], from = l.level, xpBefore = l.xp;
    l.xp = Math.min(XP_CAP, l.xp + Math.max(0, Math.floor(n)));
    l.level = BM.levelFromXp(l.xp);
    return { id, from, to: l.level, xpBefore, xpAfter: l.xp };
  }
  // The next form a line can evolve into BY LEVEL right now (real level, or the §4.6 trade/friendship level), not yet
  // unlocked — the EVOLVE! badge / evolution scene. Item evolutions are never pending: they need the item used.
  function pendingEvolution(id, p = profile()) {
    const l = p && p.lines[id], line = BM.LINES[id];
    if (!l || !line) return null;
    const next = nextLocked(line, l);
    return next && next.evo && next.evo.level && l.level >= next.evo.level ? next : null;
  }
  function nextLocked(line, l) {
    for (let i = 1; i < line.forms.length; i++) {
      const f = line.forms[i];
      if (!l.unlocked.includes(f.id)) return l.unlocked.includes(line.forms[i - 1].id) ? f : null;
    }
    return null;
  }
  // Unlocks `formId` (the evolution scene calls this) and fields it; the earlier forms stay fieldable (form cycling).
  function evolve(id, formId) {
    const p = profile(), l = p.lines[id], f = BM.FORMS[formId];
    if (!l || !f || f.line !== id || l.unlocked.includes(formId)) return false;
    l.unlocked.push(formId);
    l.unlocked.sort((a, b) => BM.FORMS[a].stage - BM.FORMS[b].stage);
    l.form = formId;
    persist();
    return true;
  }
  // Uses one item on a line (collection detail panel). Returns { ok, msg } plus { evolveTo } for a stone / held item
  // (consumed + unlocked here; the UI then plays the evolution scene) or { from, to } for XP candy / Rare Candy.
  function useItem(id, itemId) {
    const p = profile(), l = p.lines[id], it = BM.ITEM_INFO[itemId], line = BM.LINES[id];
    if (!l || !it) return { ok: false, msg: 'Nothing happened.' };
    const have = p.items[itemId] || 0;
    if (it.kind === 'evo') {
      const next = nextLocked(line, l), target = line.forms.find((f) => f.evo && f.evo.item === itemId);
      if (!target) return { ok: false, msg: `${line.name} can't use a ${it.name}.` };
      if (l.unlocked.includes(target.id)) return { ok: false, msg: `${target.name} is already your friend!` };
      if (next !== target) return { ok: false, msg: `Evolve into ${next ? next.name : 'the form before'} first!` };
      if (l.level < target.evo.minLevel) { const k = target.evo.minLevel - l.level; return { ok: false, msg: `${target.name} needs Lv ${target.evo.minLevel} — ${k} more level${k === 1 ? '' : 's'}!` }; }
      if (!have) return { ok: false, msg: `You need a ${it.name} — win stages to find one!` };
      take(p, itemId); evolve(id, target.id);
      return { ok: true, evolveTo: target.id, msg: `${it.name} used!` };
    }
    if (it.kind === 'xp' || it.kind === 'candy') {
      if (!have) return { ok: false, msg: `You have no ${it.name} yet — win stages to find them!` };
      if (l.level >= BM.C.LEVEL_CAP) return { ok: false, msg: `${line.name} is already Lv ${BM.C.LEVEL_CAP} — the top level!` };
      take(p, itemId);
      // Rare Candy: +1 level at any level — XP becomes exactly the next level's L³ threshold
      const r = addXp(p, id, it.kind === 'candy' ? BM.xpForLevel(l.level + 1) - l.xp : it.xp);
      persist();
      return { ok: true, ...r, msg: r.to > r.from ? `Level up! Lv ${r.from} → ${r.to}` : `+${it.xp.toLocaleString()} XP` };
    }
    return { ok: false, msg: `${it.name}: coming soon!` };
  }
  function take(p, itemId) { p.items[itemId]--; if (!(p.items[itemId] > 0)) delete p.items[itemId]; }
  function give(p, itemId, n = 1) { p.items[itemId] = (p.items[itemId] || 0) + n; }

  // A WON stage: count the clear and store its rewards. `battled` = line ids fielded at least once in that battle (they
  // get the team XP, §4.3, which now raises their level). Drops are rolled from the stage's drop table (`rnd` = test
  // seed). Returns what was given, for the result screen: tickets, xp, xpLines [{id, from, to, xpBefore, xpAfter}],
  // drops [{item, n}], item (§4.6 fixed stone), gift, evolve [line ids whose level evolution is now pending].
  // `used` = battle items that were armed for this battle: a WIN consumes one of each (a loss never calls this, so a loss
  // keeps them); XP Bonus multiplies the team XP, a Dowsing Machine adds the stage's rarest drop (BM.rarestDrop).
  // `opts.keepArmed` (a challenge auto-clear, Phase 6): no battle was fought, so armed items stay armed and untouched.
  function recordWin(stageId, battled, rnd = Math.random, used = [], opts = {}) {
    const p = profile(), st = BM.stageById(stageId);
    if (!p || !st) return null;
    const first = !(p.cleared[stageId] > 0);
    p.cleared[stageId] = (p.cleared[stageId] || 0) + 1;
    const r = BM.stageRewards(st, first);
    if (st.dev) { r.tickets = 0; r.xp = 0; }
    r.used = (used || []).filter((id) => BM.ITEM_INFO[id] && BM.ITEM_INFO[id].battle && p.items[id] > 0);
    for (const id of r.used) take(p, id);
    if (!opts.keepArmed) p.armed = []; // a win uses them up — arm again for the next battle
    if (r.used.includes('xp_bonus')) { r.xp = Math.round(r.xp * BM.BATTLE_ITEM_FX.xpMul); r.xpBonus = true; }
    p.tickets += r.tickets;
    r.xpLines = []; r.evolve = [];
    for (const id of new Set(battled || [])) {
      const l = p.lines[id];
      if (!l || !r.xp) continue;
      const pend = pendingEvolution(id, p);
      r.xpLines.push(addXp(p, id, r.xp));
      if (!pend && pendingEvolution(id, p)) r.evolve.push(id);
    }
    if (r.item) give(p, r.item);
    r.drops = st.dev ? [] : BM.rollDrops(st, first, rnd);
    if (r.used.includes('dowsing_machine') && !st.dev) {
      const rare = BM.rarestDrop(st);
      if (rare) { const o = r.drops.find((d) => d.item === rare); if (o) o.n++; else r.drops.push({ item: rare, n: 1 }); r.dowsed = rare; }
    }
    for (const d of r.drops) { if (d.item === 'tickets') p.tickets += d.n; else give(p, d.item, d.n); }
    // T1: every win adds a guaranteed XP candy on top of the drop roll (rolled after it, so seeded drop tests are unchanged) (the Tower's XP floors keep their own tier candy)
    const wc = BM.winCandy(st, rnd);
    if (wc) { r.candy = { ...(r.candy || {}) }; r.candy[wc] = (r.candy[wc] || 0) + 1; r.winCandy = wc; }
    if (r.candy) for (const [id, n] of Object.entries(r.candy)) give(p, id, n); // Tower XP floor candy + the T1 win candy
    // REGION COMPLETE (Phase 7): the region's final stage (the Champion) on its FIRST clear grants the region's Master Ball
    // (§4 economy: 1 per region fully beaten) — the Mewtwo line comes as the stage gift below (rewardOnly, joins at Lv 1).
    // A replay never re-grants (first only); the ending screen plays from the result screen.
    if (first && st.regionFinal) { give(p, 'master_ball'); r.masterBall = 1; r.regionComplete = st.region || 'kanto'; p.regionsDone = { ...(p.regionsDone || {}), [r.regionComplete]: 1 }; }
    if (r.gift) {
      r.giftNew = giveLine(p, r.gift);
      if (r.giftNew && p.team.length < BM.TEAM_SIZE) { p.team.push(r.gift); r.giftOnTeam = true; saveTeam(); }
    }
    persist();
    return r;
  }

  // M1 LOSS XP (user 2026-10-11, "it's a kids game"): a LOST battle still pays the team — 30% of the XP a win would pay
  // now, + 1% for every 2% of the enemy base's HP destroyed, capped at 50%. Every line the caller passes; no tickets, no drops,
  // no clear (armed items were never touched). Campaign + Prism Tower battles; challenge runs never call this. DD1 (Phase 7.5):
  // the caller passes the WHOLE brought team (all slots, fought or not); a forfeit is a loss too.
  BM.LOSS_XP = { base: 0.3, per2: 0.01, cap: 0.5 };
  function recordLoss(stageId, battled, destroyedFrac) {
    const p = profile(), st = BM.stageById(stageId);
    if (!p || !st || st.dev) return null;
    const first = !(p.cleared[stageId] > 0), win = winXp(st, first);
    const pct = Math.min(BM.LOSS_XP.cap, BM.LOSS_XP.base + Math.floor(Math.max(0, Math.min(1, destroyedFrac)) * 100 / 2 + 1e-9) * BM.LOSS_XP.per2);
    const xp = Math.round(win * pct);
    const r = { loss: true, pct, xp, winXp: win, xpLines: [], evolve: [] };
    for (const id of new Set(battled || [])) {
      if (!p.lines[id] || !xp) continue;
      const pend = pendingEvolution(id, p);
      r.xpLines.push(addXp(p, id, xp));
      if (!pend && pendingEvolution(id, p)) r.evolve.push(id);
    }
    persist();
    return r;
  }
  // the team XP a WIN of this stage pays now (campaign §4.3; Bonus Zone XP stages pay their tier's XP)
  function winXp(st, first) { return st.bonusXp || BM.stageRewards(st, first).xp; }

  // ---------- preset teams (F4) ----------
  function saveLoadout(i) {
    const p = profile();
    if (!(i >= 0 && i < p.loadoutSlots)) return false;
    const name = p.loadouts[i] && p.loadouts[i].name;
    p.loadouts[i] = { team: p.team.slice(), forms: Object.fromEntries(p.team.map((id) => [id, p.lines[id].form])) };
    if (name) p.loadouts[i].name = name;
    persist(); return true;
  }
  function loadLoadout(i) {
    const p = profile(), lo = p.loadouts[i];
    if (!lo) return false;
    const team = lo.team.filter((id) => p.lines[id]);
    if (!team.length) return false;
    p.team = team;
    for (const id of team) if (lo.forms[id] && p.lines[id].unlocked.includes(lo.forms[id])) p.lines[id].form = lo.forms[id];
    persist(); return true;
  }
  // Pre-battle item row: tap = arm / disarm a battle item you own (stored until a WIN uses it up).
  function toggleArmed(itemId) {
    const p = profile(), it = BM.ITEM_INFO[itemId];
    if (!it || !it.battle) return 'none';
    if (p.armed.includes(itemId)) { p.armed = p.armed.filter((x) => x !== itemId); persist(); return 'off'; }
    if (!(p.items[itemId] > 0)) return 'none';
    p.armed.push(itemId); persist(); return 'on';
  }
  // T3: the team IS the current preset — every team edit is written back into loadouts[loadoutAt].
  function saveTeam() { const p = profile(); saveLoadout(p.loadoutAt); }
  // T3 rail: tap circle i = switch to preset i (the current team stays saved in its own circle). An empty preset starts as
  // a copy of the current team, so a team is never empty.
  function switchLoadout(i) {
    const p = profile();
    if (!(i >= 0 && i < p.loadoutSlots)) return false;
    saveLoadout(p.loadoutAt);
    p.loadoutAt = i;
    if (!loadLoadout(i)) saveLoadout(i);
    persist(); return true;
  }
  // Tap-to-place: put `lineId` into team slot `slot` (0-based; a slot past the end appends). If the line is already on
  // the team it swaps places with the slot's occupant. Returns 'ok' | 'same' | 'none'.
  function placeInTeam(slot, lineId) {
    const p = profile();
    if (!p.lines[lineId]) return 'none';
    const team = p.team.slice(), at = team.indexOf(lineId);
    if (slot >= team.length) { if (at >= 0) return 'same'; if (team.length >= BM.TEAM_SIZE) return 'none'; team.push(lineId); }
    else if (at === slot) return 'same';
    else if (at >= 0) { team[at] = team[slot]; team[slot] = lineId; }
    else team[slot] = lineId;
    p.team = team; saveTeam(); return 'ok';
  }
  function removeFromTeam(lineId) {
    const p = profile();
    if (p.team.length <= 1 || !p.team.includes(lineId)) return false;
    p.team = p.team.filter((t) => t !== lineId); saveTeam(); return true;
  }
  // Returns 'ok' | 'max' | 'tickets'
  function buyLoadoutSlot() {
    const p = profile();
    if (p.loadoutSlots >= LOADOUT.MAX) return 'max';
    if (p.tickets < LOADOUT.PRICE) return 'tickets';
    p.tickets -= LOADOUT.PRICE; p.loadoutSlots++; p.loadouts.push(null);
    persist(); return 'ok';
  }

  // Settings slider (Phase 6): clamps to the slider's range and saves.
  function setMistakes(key, v) {
    const p = profile(), r = MISTAKES[key];
    if (!p || !r) return null;
    p.settings[key] = Math.max(r.min, Math.min(r.max, Math.round(Number(v)) || r.def)); persist();
    return p.settings[key];
  }
  // TA: rename the current preset (✏️). Empty = back to the default "Team N".
  function renameLoadout(i, name) {
    const p = profile(); if (!(i >= 0 && i < p.loadoutSlots)) return false;
    if (!p.loadouts[i]) saveLoadout(i);
    const n = String(name || '').trim().slice(0, 14);
    if (n) p.loadouts[i].name = n; else delete p.loadouts[i].name;
    persist(); return true;
  }
  const loadoutName = (i, p = profile()) => (p.loadouts[i] && p.loadouts[i].name) || `Team ${i + 1}`;
  // X1 (Phase 7.5, amends J1): a stage's enemies are KNOWN once the profile has DEFEATED it (a challenge auto-clear counts — it
  // goes through recordWin); a loss reveals nothing. Per stage, per profile; Prism Tower floors too.
  const revealed = (stageId, p = profile()) => !!(p && p.cleared && p.cleared[stageId] > 0);
  function setMapAt(stageId) { const p = profile(); if (p && p.mapAt !== stageId) { p.mapAt = stageId; persist(); } }

  // Dev/test only (hidden dev mode): own every Kanto line, unlock every form, set levels.
  function devUnlockAll() {
    const p = profile();
    for (const id of BM.KANTO_LINES) {
      giveLine(p, id);
      const l = p.lines[id];
      l.unlocked = BM.LINES[id].forms.map((f) => f.id);
      l.xp = Math.max(l.xp || 0, Math.pow(36, 3));
      l.level = BM.levelFromXp(l.xp);
    }
    persist();
  }
  // Dev/test only: 5 of every item (the real sources are the stage drop tables).
  function devGrantItems() { const p = profile(); for (const id of BM.BAG_ORDER) give(p, id, 5); persist(); }

  return { load, persist, profile, list, select, create, finishSetup, eraseProfile, exportCode, decodeCode, importCode,
    setForm, devUnlockAll, devGrantItems, giveLine, recordWin, setMapAt, addXpTo: (p, id, n) => addXp(p, id, n), addXp: (id, n) => { const r = addXp(profile(), id, n); persist(); return r; },
    pendingEvolution, evolve, useItem, saveLoadout, loadLoadout, buyLoadoutSlot, saveTeam, switchLoadout, placeInTeam, removeFromTeam, toggleArmed, setMistakes, recordLoss, winXp, renameLoadout, loadoutName, revealed, MISTAKES, LOADOUT, START_TICKETS, VERSION, SLOTS, GRADES, KEY, get memoryOnly() { return memoryOnly; } };
})();
