// Galar campaign map (Galar + Paldea build) — positions are fractions of the 16:9 map box, roughed in from the queued map prompt
// (assets/maps/galar.png, art-queue #1948: a Great-Britain-shaped island — Postwick / Wedgehurst in the south, Motostoke and the Wild
// Area centre-south, Hammerlocke centre, Stow-on-Side west, Glimwood / Ballonlea west-north, Circhester north-west, Spikemuth north-east,
// Wyndon far north; the Isle of Armor (node 26, post-game) off the east coast). Act 3 (art landed): every node re-placed onto the PAINTED landmarks
// (the painted map differs from the prompt's layout — Turffield's farm fields, the Galar Mine hills, Motostoke's factories, the Hammerlocke
// castle, the Stow-on-Side mesa, the mushroom forest, the snowy east coast = Circhester + Circhester Bay, Wyndon + Rose Tower north). The top-right corner (x > 0.86, y < 0.14) stays empty — the game's buttons sit there.
window.BM = window.BM || {};
BM.GALAR_MAP = {
  art: 'maps/galar',
  nodes: {
    galar_01_postwick: [0.44, 0.93], galar_02_wedgehurst: [0.37, 0.86], galar_03_route2: [0.52, 0.8],
    galar_04_wild_area: [0.47, 0.69], galar_05_bede: [0.22, 0.74], galar_06_milo: [0.37, 0.61],
    galar_07_hulbury: [0.69, 0.65], galar_08_nessa: [0.63, 0.58], galar_09_kabu: [0.33, 0.79],
    galar_10_hammerlocke: [0.31, 0.63], galar_11_bea: [0.33, 0.49], galar_12_allister: [0.29, 0.44],
    galar_13_glimwood: [0.19, 0.5], galar_14_opal: [0.16, 0.6], galar_15_route8: [0.4, 0.31],
    galar_16_gordie: [0.8, 0.61], galar_17_melony: [0.85, 0.57], galar_18_route9: [0.81, 0.75],
    galar_19_piers: [0.69, 0.43], galar_20_raihan: [0.27, 0.55], galar_21_route10: [0.51, 0.27],
    galar_22_marnie: [0.46, 0.12], galar_23_hop: [0.53, 0.12], galar_24_eternatus: [0.51, 0.05],
    galar_25_leon: [0.58, 0.15], galar_26_dojo: [0.88, 0.42],
  },
  via: {}, // walks go straight between the nodes (nudged onto the painted art when it lands)
  labels: {
    galar_01_postwick: 'right', galar_02_wedgehurst: 'left', galar_03_route2: 'right', galar_04_wild_area: 'left', galar_05_bede: 'left',
    galar_06_milo: 'left', galar_07_hulbury: 'left', galar_08_nessa: 'right', galar_09_kabu: 'right', galar_10_hammerlocke: 'left',
    galar_11_bea: 'right', galar_12_allister: 'left', galar_13_glimwood: 'left', galar_14_opal: 'left', galar_15_route8: 'right',
    galar_16_gordie: 'left', galar_17_melony: 'right', galar_18_route9: 'right', galar_19_piers: 'right', galar_20_raihan: 'right',
    galar_21_route10: 'left', galar_22_marnie: 'left', galar_23_hop: 'right', galar_24_eternatus: 'right', galar_25_leon: 'left',
    galar_26_dojo: 'right' },
  // procedural fallback scenery (drawn only if assets/maps/galar.png fails to load): a tall Great-Britain-shaped island, the Isle of
  // Armor off the east coast
  land: [[0.42, 0.03], [0.6, 0.03], [0.66, 0.14], [0.8, 0.22], [0.82, 0.34], [0.7, 0.44], [0.71, 0.58], [0.7, 0.72], [0.6, 0.86],
    [0.52, 0.97], [0.36, 0.95], [0.3, 0.84], [0.25, 0.72], [0.2, 0.58], [0.12, 0.42], [0.14, 0.27], [0.28, 0.14]],
  islands: [[0.82, 0.62, 0.035]],
  mountains: [[0.58, 0.26], [0.62, 0.22], [0.5, 0.18], [0.66, 0.34]],
  forests: [[0.36, 0.88], [0.22, 0.4], [0.18, 0.34]],
  water: [[0.44, 0.64, 0.03], [0.5, 0.74, 0.025], [0.72, 0.2, 0.03]],
  music: 'map_galar',
};
BM.REGION_MAPS.galar = { map: BM.GALAR_MAP, stages: BM.GALAR_STAGES, music: 'map_galar' };
