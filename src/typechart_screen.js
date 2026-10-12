// CCC1 (Phase 7.6): the Type Chart, opened from Settings. The full 18 × 18 map — attacking type down the left, defending type
// across the top, type icons on both axes — rendered cell by cell from BM.typeMultiplier, the very function the battle
// engine uses (single source of truth, no hand-typed copy). Kid-readable: ▲ strong (green), ▼ weak (red), ✕ no effect (dark),
// blank = normal. Tapping a type icon spotlights its row and column. Sized in JS so the whole grid always fits the screen.
window.BM = window.BM || {};
BM.TypeChart = function (ui) {
  const { $, tap, show } = ui;
  const MARK = { 2: ['strong', '▲'], 0.5: ['weak', '▼'], 0: ['none', '✕'] };
  let focus = null;
  const icon = (t) => { const s = BM.Sprites.artSrc('icons/type_' + t); return s ? `<img src="${s}" alt="${t}">` : `<i style="background:${BM.TYPE_COLORS[t]}"></i>`; };
  function render() {
    const grid = $('tc-grid'); grid.innerHTML = '';
    const T = BM.TYPES, n = T.length + 1;
    // fit: the grid gets the panel's free height and width, cells stay square
    const box = $('tc-body').getBoundingClientRect(), side = $('tc-side').getBoundingClientRect();
    const cs = Math.floor(Math.min((box.height - 4) / n, (box.width - side.width - 14) / n));
    grid.style.setProperty('--cs', Math.max(12, cs) + 'px');
    grid.style.gridTemplateColumns = `repeat(${n}, var(--cs))`;
    const cell = (cls, html, data) => { const d = document.createElement('div'); d.className = 'tc-cell ' + cls; d.innerHTML = html; Object.assign(d.dataset, data || {}); grid.appendChild(d); return d; };
    cell('tc-corner', '<span class="tc-c-atk">⚔</span><span class="tc-c-def">🛡</span>');
    for (const d of T) { const h = cell('tc-head def' + (focus === d ? ' on' : ''), icon(d), { def: d }); tap(h, () => { focus = focus === d ? null : d; render(); }); }
    for (const a of T) {
      const h = cell('tc-head atk' + (focus === a ? ' on' : ''), icon(a), { atk: a }); tap(h, () => { focus = focus === a ? null : a; render(); });
      for (const d of T) {
        const m = BM.typeMultiplier(a, [d]), [k, sym] = MARK[m] || ['norm', ''];
        const hl = focus && (focus === a || focus === d) ? ' hl' : focus ? ' dim' : '';
        cell('tc-m ' + k + hl, sym, { atk: a, def: d, m: String(m) });
      }
    }
  }
  function open() { show('scr-types', true); focus = null; requestAnimationFrame(render); }
  tap($('btn-types-x'), () => show('scr-types', false));
  $('scr-types').addEventListener('pointerdown', (e) => { if (e.target.id === 'scr-types') { e.preventDefault(); show('scr-types', false); } });
  window.addEventListener('resize', () => { if (!$('scr-types').classList.contains('hidden')) render(); });
  return { open, render, get focus() { return focus; } };
};
