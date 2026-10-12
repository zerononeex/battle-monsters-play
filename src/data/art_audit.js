// ART AUDIT (Johto Act 1 Step 8 / Act 2 Step 9): what the game still draws on a placeholder, from DATA + the manifest alone (no
// rendering) — so a headless test, the dev console and Act 2's "placeholder audit ZERO" all read the same list.
//   forms:  every form of every line (+ Mega forms) whose sheets are not wired: the run sheet always; the attack sheet too for
//           anything that is not run-only fodder (runOnly forms lunge — §4.10)
//   images: the stage backgrounds, enemy bases, region maps, banner key art and item icons the data names but the manifest lacks
// Each entry carries its region ('kanto' | 'johto') so Act 1 can prove Kanto stays at ZERO while Johto lists exactly its queue.
window.BM = window.BM || {};
BM.artAudit = function () {
  const SF = BM.SPRITE_FILES || {}, ART = BM.ART || {}, BG = BM.BG_FILES || {};
  const forms = [];
  for (const f of Object.values(BM.FORMS)) {
    const k = f.sprite || f.id, sf = SF[k] || {}, need = [];
    if (!sf.run) need.push('run');
    if (!f.runOnly && !sf.attack) need.push('attack');
    if (need.length) forms.push({ id: f.id, need, region: f.mega || (BM.LINES[f.line] && BM.LINES[f.line].region === 'johto') ? 'johto' : 'kanto' });
  }
  const images = [], want = (key, have, region) => { if (!have) images.push({ key, region }); };
  for (const st of BM.STAGES) {
    if (st.dev) continue;
    const r = st.region === 'johto' || st.bonus === 'mega' ? 'johto' : 'kanto';
    want('bg/' + (st.bgArt || st.background), BG[st.bgArt] || BG[st.background], r); // a gym / E4 interior (bgArt) or its town
    if (st.baseArt) want('bases/' + st.baseArt, ART['bases/' + st.baseArt], r);
  }
  for (const [r, R] of Object.entries(BM.REGION_MAPS || {})) want(R.map.art, ART[R.map.art], r);
  for (const b of BM.BANNERS) want('ui/banner_' + b.id, ART['ui/banner_' + b.id], b.region);
  for (const [id, it] of Object.entries(BM.ITEM_INFO)) want('icons/' + id, ART['icons/' + id], it.region === 'johto' || it.kind === 'mega' ? 'johto' : 'kanto');
  const uniq = (a) => a.filter((x, i) => a.findIndex((y) => y.key === x.key) === i);
  return { forms, images: uniq(images), sheets: forms.reduce((n, f) => n + f.need.length, 0) };
};
