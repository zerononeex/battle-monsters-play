// PHASE 11 LIVE FRIEND BATTLES — the transport. Two iPads talk peer-to-peer (WebRTC via PeerJS and its free public broker);
// there is no game server. PeerJS is an OPTIONAL script loaded from a CDN only when "Battle a Friend" is opened: if it can't
// load (offline), nothing else in the game changes and the friend screen says "Needs internet to battle a friend".
// No game code talks to PeerJS: everything goes through this tiny interface, which a fake in-memory hub also implements (tests):
//   t.host(code) → Promise (the room is open)       t.onConnect(fn)  the friend arrived (host)
//   t.join(code) → Promise (connected to the host)  t.send(obj)  t.onMessage(fn)  t.onClose(fn)  t.onFail(fn)  t.close()
// Failures reject with an Error whose `code` is one of BM.Net.ERR's keys (its message is the kid-worded text).
window.BM = window.BM || {};
BM.Net = (function () {
  // Room codes: 6 characters from an unambiguous alphabet (no 0 / O, no 1 / I)
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', CODE_LEN = 6;
  const PREFIX = 'battlemonsters-friend-'; // game-specific PeerJS id prefix: peer id = PREFIX + code
  const PEERJS_URLS = ['https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
  const ERR = {
    'not-found': "Couldn't find that battle — check the code and try again",
    full: 'That battle already has two trainers — ask your friend for a new code',
    offline: 'Needs internet to battle a friend',
    broker: "Couldn't reach the battle helper — check the internet and try again",
    timeout: "Your friend's iPad didn't answer — try again",
    taken: 'That code is busy — try again',
  };
  const fail = (code) => Object.assign(new Error(ERR[code] || ERR.broker), { code });
  const makeCode = (rnd = Math.random) => { let s = ''; for (let i = 0; i < CODE_LEN; i++) s += ALPHABET[Math.floor(rnd() * ALPHABET.length)]; return s; };
  const cleanCode = (s) => String(s || '').toUpperCase().split('').filter((c) => ALPHABET.includes(c)).join('').slice(0, CODE_LEN);
  const validCode = (s) => typeof s === 'string' && s.length === CODE_LEN && cleanCode(s) === s;
  const peerId = (code) => PREFIX + code;

  // ---- optional PeerJS loader (once; cached result) ----
  let loading = null;
  function loadPeerJS(timeoutMs = 9000) {
    if (typeof window.Peer === 'function') return Promise.resolve(true);
    if (loading) return loading;
    loading = (async () => {
      for (const url of PEERJS_URLS) {
        const ok = await new Promise((res) => {
          if (typeof document === 'undefined') { res(false); return; }
          const s = document.createElement('script'), t = setTimeout(() => { s.onload = s.onerror = null; res(false); }, timeoutMs);
          s.src = url; s.async = true; s.crossOrigin = 'anonymous';
          s.onload = () => { clearTimeout(t); res(typeof window.Peer === 'function'); };
          s.onerror = () => { clearTimeout(t); s.remove(); res(false); };
          document.head.appendChild(s);
        });
        if (ok) return true;
      }
      loading = null; // a later tap may try again (the internet may be back)
      return false;
    })();
    return loading;
  }

  // shared callback plumbing for both transports
  // (messages that arrive before the game attaches its handler are held, then handed over in order)
  function hooks() {
    let held = [], handler = null;
    const h = { msg: (m) => { if (handler) handler(m); else held.push(m); }, close: () => {}, connect: () => {}, fail: () => {} };
    return { h, api: { onMessage: (fn) => { handler = fn; const q = held; held = []; for (const m of q) fn(m); }, onClose: (fn) => { h.close = fn; }, onConnect: (fn) => { h.connect = fn; }, onFail: (fn) => { h.fail = fn; } } };
  }

  // ---- the real transport: PeerJS DataConnection (reliable, ordered, JSON) ----
  function PeerTransport(PeerCtor = typeof window !== 'undefined' ? window.Peer : null, opts = {}) {
    const { h, api } = hooks();
    let peer = null, conn = null, ended = false, taken = false;
    const joinMs = opts.joinMs || 15000;
    const brokerErr = (e) => (e && e.type === 'peer-unavailable' ? 'not-found' : e && e.type === 'unavailable-id' ? 'taken'
      : e && (e.type === 'browser-incompatible' || e.type === 'webrtc') ? 'offline' : 'broker');
    function wire(c) {
      conn = c;
      c.on('data', (d) => { if (!ended && d && typeof d === 'object' && !(typeof d.k === 'string' && d.k[0] === '_')) h.msg(d); });
      const lost = () => { if (conn === c && !ended) { ended = true; h.close(); } };
      c.on('close', lost); c.on('error', lost);
      // the broker is only needed to meet: once connected, leave it (the code stops working for anyone else)
      try { peer.disconnect(); } catch (e) { /* already gone */ }
    }
    function host(code) {
      return new Promise((resolve, reject) => {
        if (!PeerCtor) { reject(fail('offline')); return; }
        let open = false;
        peer = new PeerCtor(peerId(code), { debug: 0 });
        peer.on('open', () => { open = true; resolve(); });
        peer.on('error', (e) => { const c = brokerErr(e); if (!open) reject(fail(c)); else if (!conn && !ended) h.fail(fail(c)); });
        peer.on('disconnected', () => { if (open && !conn && !ended) h.fail(fail('broker')); }); // lost the broker while waiting
        peer.on('connection', (c) => {
          if (taken) { c.on('open', () => { try { c.send({ k: '_full' }); } catch (e) { /* gone */ } setTimeout(() => c.close(), 400); }); return; }
          taken = true;
          c.on('open', () => { wire(c); c.send({ k: '_welcome' }); h.connect(); });
        });
      });
    }
    function join(code) {
      return new Promise((resolve, reject) => {
        if (!PeerCtor) { reject(fail('offline')); return; }
        let done = false;
        const finish = (err) => { if (done) return; done = true; clearTimeout(timer); if (err) { ended = true; try { peer.destroy(); } catch (e) { /* */ } reject(err); } else resolve(); };
        const timer = setTimeout(() => finish(fail('timeout')), joinMs);
        peer = new PeerCtor(undefined, { debug: 0 });
        peer.on('error', (e) => { if (!done) finish(fail(brokerErr(e) === 'taken' ? 'broker' : brokerErr(e))); });
        peer.on('open', () => {
          const c = peer.connect(peerId(code), { reliable: true, serialization: 'json' });
          c.on('data', (d) => {
            if (done || !d) return;
            if (d.k === '_welcome') { wire(c); finish(null); } else if (d.k === '_full') finish(fail('full'));
          });
          c.on('close', () => finish(fail('not-found')));
        });
      });
    }
    return {
      ...api, host, join,
      send: (obj) => { if (conn && !ended) try { conn.send(obj); } catch (e) { /* the close handler reports it */ } },
      close: () => { ended = true; try { if (conn) conn.close(); } catch (e) { /* */ } try { if (peer) peer.destroy(); } catch (e) { /* */ } },
      get connected() { return !!conn && !ended; },
    };
  }

  // ---- the fake in-memory transport (tests; also the UI tests' scripted friend) ----
  // Messages are JSON-copied (never shared objects) and delivered after `latency` ms: by real timers, or — `manual: true` —
  // only when the test calls hub.advance(ms) (fully deterministic headless runs).
  function FakeHub(o = {}) {
    const rooms = new Map(), queue = [];
    let now = 0, offline = !!o.offline;
    const hub = {
      latency: o.latency || 0, manual: !!o.manual, sent: 0,
      set offline(v) { offline = v; }, get offline() { return offline; },
      rooms,
      advance(ms) { now += ms; queue.sort((a, b) => a.at - b.at || a.n - b.n); while (queue.length && queue[0].at <= now) queue.shift().run(); },
      pending: () => queue.length,
      endpoint,
    };
    let n = 0;
    const later = (fn) => { if (hub.manual) queue.push({ at: now + hub.latency, n: n++, run: fn }); else setTimeout(fn, hub.latency); };
    function endpoint() {
      const { h, api } = hooks();
      let other = null, ended = false, code = null;
      const me = {
        ...api,
        host(c) {
          if (offline) return Promise.reject(fail('broker'));
          if (rooms.has(c)) return Promise.reject(fail('taken'));
          code = c; rooms.set(c, { host: me, guest: null }); return Promise.resolve();
        },
        join(c) {
          if (offline) return Promise.reject(fail('broker'));
          const r = rooms.get(c);
          if (!r) return Promise.reject(fail('not-found'));
          if (r.guest) return Promise.reject(fail('full'));
          r.guest = me; other = r.host; r.host._link(me);
          return new Promise((res) => later(() => { r.host._h.connect(); res(); }));
        },
        send(obj) {
          if (ended || !other) return;
          const copy = JSON.stringify(obj), to = other; hub.sent++;
          later(() => { if (!to._ended) to._h.msg(JSON.parse(copy)); });
        },
        close() { if (ended) return; ended = true; if (code) rooms.delete(code); const o2 = other; if (o2) later(() => o2._lost()); },
        drop() { const o2 = other; me._lost(); if (o2) o2._lost(); }, // test helper: the connection dies under both
        _link(o2) { other = o2; },
        _lost() { if (ended) return; ended = true; if (code) rooms.delete(code); h.close(); },
        get _ended() { return ended; },
        _h: h,
        get connected() { return !!other && !ended; },
      };
      return me;
    }
    return hub;
  }

  // The transport the friend screen uses: the PeerJS one, unless a test installed a fake hub (BM.Net.useFake(hub)).
  let fakeHub = null;
  const create = () => (fakeHub ? fakeHub.endpoint() : PeerTransport());
  const ready = () => (fakeHub ? Promise.resolve(true) : loadPeerJS());
  return { ALPHABET, CODE_LEN, PREFIX, PEERJS_URLS, ERR, fail, makeCode, cleanCode, validCode, peerId, loadPeerJS, PeerTransport, FakeHub,
    create, ready, useFake: (hub) => { fakeHub = hub; }, get fake() { return fakeHub; } };
})();
