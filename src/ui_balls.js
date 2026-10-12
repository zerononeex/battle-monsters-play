// N1 (design addendum, Phase 7): AP is shown with POKÉ BALLS, never ⚡ (⚡ reads as the Electric ELEMENT — it stays only
// as the Electric type icon / paralysis). The AP Generator's level is a BALL LADDER: Lv 1 Poké · 2 Great · 3 Quick ·
// 4 Ultra · 5 Luxury · 6 Premier · 7 Cherish · 8 Master. Each ball uses its generated icon (assets/ui/icons/<id>.png →
// BM.ART['icons/<id>'], ASSET_PROMPTS #252–#257; Poké #205 + Master #206 already DONE) and a CSS-drawn ball until then.
window.BM = window.BM || {};
BM.GEN_BALLS = [null, 'poke_ball', 'great_ball', 'quick_ball', 'ultra_ball', 'luxury_ball', 'premier_ball', 'cherish_ball', 'master_ball'];
BM.BALL_NAMES = { poke_ball: 'Poké Ball', great_ball: 'Great Ball', quick_ball: 'Quick Ball', ultra_ball: 'Ultra Ball', luxury_ball: 'Luxury Ball',
  premier_ball: 'Premier Ball', cherish_ball: 'Cherish Ball', master_ball: 'Master Ball' };
// <img> of the ball's art, else a CSS ball (`.ball.b-<id>`, drawn in style.css). `cls` adds a size class.
BM.ballHtml = function (id = 'poke_ball', cls = '') {
  const src = BM.Sprites && BM.Sprites.artSrc('icons/' + id);
  return src ? `<img class="ball-img ${cls}" src="${src}" alt="${BM.BALL_NAMES[id] || ''}" data-ball="${id}">`
    : `<span class="ball b-${id} ${cls}" data-ball="${id}" role="img" aria-label="${BM.BALL_NAMES[id] || ''}"></span>`;
};
// The AP glyph used next to every AP number (HUD counter, card costs, generator cost, detail screen).
BM.apIcon = (cls = '') => BM.ballHtml('poke_ball', 'ap-ball ' + cls);
// The generator button face for level `lv`: the per-level face art (assets/ui/icons/ap_generator_<lv>.png, G5b extension
// #258) when DONE, else that level's ball.
BM.genFaceHtml = function (lv) {
  const face = BM.Sprites && BM.Sprites.artSrc('icons/ap_generator_' + lv);
  return face ? `<img src="${face}" alt="" data-ball="${BM.GEN_BALLS[lv]}">` : BM.ballHtml(BM.GEN_BALLS[lv], 'gen-ball');
};
// JJ1 (one ticket, one art): EVERY player-visible Battle Ticket is the shared battle_ticket.png. The 🎫 emoji is only the
// pre-art fallback inside this helper — never the rendered choice once the art exists.
BM.ticketIcon = function (cls = '') {
  const src = BM.Sprites && BM.Sprites.artSrc('icons/battle_ticket');
  return src ? `<img class="tk-img ${cls}" src="${src}" alt="ticket" data-ticket="1">` : `<span class="tk-emo ${cls}" data-ticket="1">🎫</span>`;
};
// S1 (Phase 7.5): PC Box = the Pokémon Center PC terminal icon (assets/ui/icons/pc_box.png, ASSET_PROMPTS #317); 📦 until it lands.
BM.pcIcon = function (cls = '') {
  const src = BM.Sprites && BM.Sprites.artSrc('icons/pc_box');
  return src ? `<img class="pc-img ${cls}" src="${src}" alt="" data-pc="1">` : `<span class="pc-emo ${cls}" data-pc="1">📦</span>`;
};

// DDD1 (Phase 7.6): a type shown as its icon art + the plain word — no highlight box. Without the icon art (fallback) the word
// gets a small dot in the type colour so the type still reads at a glance.
BM.typeLabel = function (t, cls) {
  const ic = BM.Sprites.artSrc('icons/type_' + t), s = document.createElement('span');
  s.className = 'type-label ' + (cls || ''); s.dataset.type = t;
  s.innerHTML = (ic ? `<img src="${ic}" alt="">` : `<i class="tl-dot" style="background:${BM.TYPE_COLORS[t]}"></i>`) + `<span class="tl-t">${t}</span>`;
  return s;
};
