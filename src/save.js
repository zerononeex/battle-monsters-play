// Browser-local saves: 3 profile slots, versioned with a migration chain (BUG_REGISTRY BR-006).
// Export/import code per profile: "BM<v>-<z|j><base64url payload>-<crc32 hex>"
//   payload = JSON {v, p: profile}; z = deflate-raw compressed (CompressionStream), j = plain JSON.
window.BM = window.BM || {};
BM.Save = (function () {
  const KEY = 'battle-monsters.save';
  const VERSION = 3;
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
  };
  const START_TICKETS = 30; // §4.5: a new profile starts with 3 pulls

  function newProfile(slot, name, grade) {
    const p = {
      slot, name: name || 'Player ' + (slot + 1), grade: grade || null, created: Date.now(),
      settings: { music: true, sound: true },
      cleared: {},               // stageId -> number of wins
      lines: {},                 // lineId -> { level, xp (total, L³ curve), form (fielded), unlocked: [formIds] }
      team: BM.DEFAULT_TEAM.slice(),
      tickets: START_TICKETS,    // Battle Tickets (spent on the Phase 5 banners)
      items: {},                 // itemId -> count (stones / held items; used from the collection in Phase 4)
      mapAt: null,               // stage id the map token stands on (null = place it without walking)
    };
    for (const id of BM.DEFAULT_TEAM) giveLine(p, id);
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
      l.xp = Math.max(Math.pow(l.level, 3), Number.isFinite(l.xp) ? Math.floor(l.xp) : 0);
      l.unlocked = (l.unlocked || []).filter((f) => ids.includes(f));
      if (!l.unlocked.includes(ids[0])) l.unlocked.unshift(ids[0]); // the base form is always fieldable
      if (!l.unlocked.includes(l.form)) l.form = l.unlocked[0];
    }
    p.team = [...new Set(p.team || [])].filter((id) => p.lines[id]).slice(0, BM.TEAM_SIZE);
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
    if (l && l.unlocked.includes(formId)) { l.form = formId; persist(); return true; }
    return false;
  }
  // A WON stage: count the clear and store its rewards (spent from Phase 4/5). `battled` = line ids that were
  // fielded at least once in that battle (they get the team XP, §4.3). Returns what was given, for the result screen.
  function recordWin(stageId, battled) {
    const p = profile(), st = BM.stageById(stageId);
    if (!p || !st) return null;
    const first = !(p.cleared[stageId] > 0);
    p.cleared[stageId] = (p.cleared[stageId] || 0) + 1;
    const r = BM.stageRewards(st, first);
    if (st.dev) { r.tickets = 0; r.xp = 0; }
    p.tickets += r.tickets;
    r.xpLines = [];
    for (const id of new Set(battled || [])) {
      const l = p.lines[id];
      if (!l || !r.xp) continue;
      l.xp += r.xp; r.xpLines.push(id);
    }
    if (r.item) p.items[r.item] = (p.items[r.item] || 0) + 1;
    if (r.gift) {
      r.giftNew = giveLine(p, r.gift);
      if (r.giftNew && p.team.length < BM.TEAM_SIZE) { p.team.push(r.gift); r.giftOnTeam = true; }
    }
    persist();
    return r;
  }
  function setMapAt(stageId) { const p = profile(); if (p && p.mapAt !== stageId) { p.mapAt = stageId; persist(); } }

  // Dev/test only (hidden dev mode): own every Kanto line, unlock every form, set levels.
  function devUnlockAll() {
    const p = profile();
    for (const id of BM.KANTO_LINES) {
      giveLine(p, id);
      const l = p.lines[id];
      l.unlocked = BM.LINES[id].forms.map((f) => f.id);
      l.level = Math.max(l.level, 36);
      l.xp = Math.max(l.xp || 0, Math.pow(l.level, 3));
    }
    persist();
  }

  return { load, persist, profile, list, select, create, finishSetup, eraseProfile, exportCode, decodeCode, importCode,
    setForm, devUnlockAll, giveLine, recordWin, setMapAt, START_TICKETS, VERSION, SLOTS, GRADES, KEY, get memoryOnly() { return memoryOnly; } };
})();
