// Kanto gacha banners — DATA ONLY in Phase 3 (pulls, rates, pity and the reveal are built in Phase 5).
// BUILD_PLAN §4.8 as amended 2026-10-10: Mewtwo is NOT in any pool (he is the beat-Kanto reward, rewardOnly);
// the Kanto legendaries are the birds + Mew, two per banner, and a banner's pity guarantees one of ITS two.
// The 3 starters are free and on neither banner. A line only becomes pullable once its art is DONE (§2).
window.BM = window.BM || {};
BM.BANNERS = [
  {
    id: 'kanto_a', region: 'kanto', name: 'Kanto Banner A',
    legendaries: ['articuno', 'zapdos'],
    lines: ['pikachu', 'magikarp', 'abra', 'gastly', 'cubone', 'growlithe', 'pinsir', 'scyther', 'porygon', 'meowth',
      'eevee_water', 'eevee_fire', 'eevee_psychic', 'eevee_ice'],
  },
  {
    id: 'kanto_b', region: 'kanto', name: 'Kanto Banner B',
    legendaries: ['moltres', 'mew'],
    lines: ['jigglypuff', 'machop', 'vulpix', 'lapras', 'snorlax', 'dratini', 'psyduck', 'ditto', 'aerodactyl',
      'scyther_kleavor', 'meowth_galar', 'eevee_electric', 'eevee_dark', 'eevee_grass', 'eevee_fairy'],
  },
];
// Every line a banner can give (legendaries + the rest).
BM.bannerPool = (b) => [...b.legendaries, ...b.lines];
