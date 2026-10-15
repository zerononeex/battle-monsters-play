// ART AUDIT (Johto Act 1 Step 8 / Act 2 Step 9): what the game still draws on a placeholder, from DATA + the manifest alone (no
// rendering) — so a headless test, the dev console and Act 2's "placeholder audit ZERO" all read the same list.
//   forms:  every form of every line (+ Mega forms) whose sheets are not wired: the run sheet always; the attack sheet too for
//           anything that is not run-only fodder (runOnly forms lunge — §4.10)
//   images: the stage backgrounds, enemy bases, region maps, banner key art and item icons the data names but the manifest lacks
// Each entry carries its region ('kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'unova' | 'kalos' | 'alola') so an Act 1 can prove the shipped regions stay at ZERO while the new
// region lists exactly its queue.
window.BM = window.BM || {};
BM.ART_REGIONS = ['hoenn', 'sinnoh', 'unova', 'kalos', 'alola']; // the regions whose art queues are their own (Kanto / Johto share theirs)
BM.artAudit = function () {
  const SF = BM.SPRITE_FILES || {}, ART = BM.ART || {}, BG = BM.BG_FILES || {};
  const forms = [];
  for (const f of Object.values(BM.FORMS)) {
    const k = f.sprite || f.id, sf = SF[k] || {}, need = [];
    if (!sf.run) need.push('run');
    if (!f.runOnly && f.attackArt !== 'run' && !sf.attack) need.push('attack'); // attackArt 'run': the run-sheet lunge fallback (Hoenn #892 / #902)
    // `artRegion` on a form = the region whose queue holds its missing sheet (Froslass's Sinnoh-queued attack sheet on a Hoenn line)
    const lr = f.artRegion || (BM.LINES[f.line] && BM.LINES[f.line].region);
    if (need.length) forms.push({ id: f.id, need, region: BM.ART_REGIONS.includes(lr) ? lr : f.mega || lr === 'johto' ? 'johto' : 'kanto' });
  }
  const images = [], want = (key, have, region) => { if (!have) images.push({ key, region }); };
  for (const st of BM.STAGES) {
    if (st.dev) continue;
    const r = st.artRegion || (BM.ART_REGIONS.includes(st.region) ? st.region : st.hoenn ? 'hoenn' : st.region === 'johto' || st.bonus === 'mega' ? 'johto' : 'kanto');
    want('bg/' + (st.bgArt || st.background), BG[st.bgArt] || BG[st.background], r); // a gym / E4 interior (bgArt) or its town
    if (st.baseArt) want('bases/' + st.baseArt, ART['bases/' + st.baseArt], r);
  }
  for (const [r, R] of Object.entries(BM.REGION_MAPS || {})) want(R.map.art, ART[R.map.art], r);
  // Kalos + Alola build: the Alola wide carousel card + the shared Totem aura effect (queued in the Alola batch)
  want('ui/regionw_alola', ART['ui/regionw_alola'], 'alola');
  want('fx/totem_aura', (BM.FX_FILES || {}).totem_aura, 'alola');
  for (const b of BM.BANNERS) want('ui/banner_' + b.id, ART['ui/banner_' + b.id], b.region);
  for (const [id, it] of Object.entries(BM.ITEM_INFO)) want('icons/' + id, ART['icons/' + id], it.region || (it.kind === 'mega' ? 'johto' : 'kanto'));
  const uniq = (a) => a.filter((x, i) => a.findIndex((y) => y.key === x.key) === i);
  return { forms, images: uniq(images), sheets: forms.reduce((n, f) => n + f.need.length, 0) };
};
