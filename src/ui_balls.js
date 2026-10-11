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
