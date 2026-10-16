// Paldea campaign map (Galar + Paldea build) — positions are fractions of the 16:9 map box, roughed in from the queued map prompt
// (assets/maps/paldea.png, #2177: the round Iberia-like peninsula with the Great Crater (Area Zero) in the middle, Mesagoza just south
// of it, Cabo Poco on the south coast, Cortondo south-west / Artazon south-east, Levincia on the east coast, Cascarrafa + the Asado
// Desert west, Medali north-west, Montenevera north-east, Alfornada on the south-west coast, Glaseado Mountain north, Casseroya Lake
// north-west, the Pokémon League east of Mesagoza). Team Star camps sit on the prompt's camp spots; Atticus's base (Tagtree Thicket)
// sits north-east (canon). Act 3 (art landed): every node re-placed onto the PAINTED landmarks
// (the Academy, the League palace north-east of the crater, the five Team Star camp flags, the oasis, the neon port, the red canyon). The top-right corner stays free.
window.BM = window.BM || {};
BM.PALDEA_MAP = {
  art: 'maps/paldea',
  nodes: {
    paldea_01_cabo_poco: [0.44, 0.89], paldea_02_los_platos: [0.62, 0.83], paldea_03_mesagoza: [0.51, 0.7],
    paldea_04_katy: [0.28, 0.66], paldea_05_klawf: [0.16, 0.61], paldea_06_brassius: [0.7, 0.73],
    paldea_07_bombirdier: [0.34, 0.79], paldea_08_giacomo: [0.31, 0.27], paldea_09_iono: [0.86, 0.62],
    paldea_10_mela: [0.78, 0.52], paldea_11_orthworm: [0.76, 0.4], paldea_12_kofu: [0.21, 0.41],
    paldea_13_atticus: [0.7, 0.33], paldea_14_larry: [0.3, 0.13], paldea_15_ryme: [0.68, 0.15],
    paldea_16_tulip: [0.07, 0.67], paldea_17_great_tusk: [0.08, 0.44], paldea_18_iron_treads: [0.12, 0.53],
    paldea_19_grusha: [0.49, 0.07], paldea_20_ortega: [0.55, 0.17], paldea_21_eri: [0.47, 0.18],
    paldea_22_false_dragon: [0.13, 0.12], paldea_23_rika: [0.57, 0.24], paldea_24_poppy: [0.59, 0.31],
    paldea_25_larry_e4: [0.66, 0.31], paldea_26_hassel: [0.68, 0.25], paldea_27_geeta: [0.63, 0.2],
    paldea_28_nemona: [0.47, 0.62], paldea_29_area_zero: [0.5, 0.46],
  },
  via: {}, // nodes sit on the prompt's landmarks; walks go straight between them
  labels: {
    paldea_01_cabo_poco: 'right', paldea_02_los_platos: 'right', paldea_03_mesagoza: 'right', paldea_04_katy: 'left', paldea_05_klawf: 'left',
    paldea_06_brassius: 'right', paldea_07_bombirdier: 'left', paldea_08_giacomo: 'right', paldea_09_iono: 'left', paldea_10_mela: 'right',
    paldea_11_orthworm: 'right', paldea_12_kofu: 'left', paldea_13_atticus: 'right', paldea_14_larry: 'left', paldea_15_ryme: 'right',
    paldea_16_tulip: 'right', paldea_17_great_tusk: 'right', paldea_18_iron_treads: 'right', paldea_19_grusha: 'right', paldea_20_ortega: 'left',
    paldea_21_eri: 'right', paldea_22_false_dragon: 'left', paldea_23_rika: 'left', paldea_24_poppy: 'right', paldea_25_larry_e4: 'right',
    paldea_26_hassel: 'right', paldea_27_geeta: 'left', paldea_28_nemona: 'left', paldea_29_area_zero: 'right' },
  // procedural fallback scenery (drawn only if assets/maps/paldea.png fails to load): a round sunny peninsula around the Great Crater
  land: [[0.08, 0.14], [0.36, 0.06], [0.72, 0.1], [0.9, 0.3], [0.92, 0.62], [0.78, 0.88], [0.52, 0.97], [0.22, 0.94], [0.06, 0.72], [0.04, 0.4]],
  islands: [[0.92, 0.8, 0.03]],
  mountains: [[0.44, 0.14], [0.5, 0.12], [0.62, 0.2], [0.72, 0.36]],
  forests: [[0.32, 0.74], [0.68, 0.32], [0.66, 0.78]],
  water: [[0.24, 0.2, 0.05], [0.5, 0.46, 0.05]],
  music: 'map_paldea',
};
BM.REGION_MAPS.paldea = { map: BM.PALDEA_MAP, stages: BM.PALDEA_STAGES, music: 'map_paldea' };
