// Alola campaign map (Kalos + Alola build, Act 1) — positions are fractions of the 16:9 map box, roughed in from the queued map prompt
// (assets/maps/alola.png: Melemele in the west, Aether Paradise floating between, Akala south-centre around its volcano, Ula'ula east
// with Mount Lanakila + the League up north, Poni wild in the south-west). Act 3 (art landed): every node re-placed onto the PAINTED landmarks — the painted map differs from the prompt's % layout (pack U10).
// NO Prism Tower entry of any kind (VVV1).
window.BM = window.BM || {};
BM.ALOLA_MAP = {
  art: 'maps/alola',
  nodes: {
    alola_01_iki: [0.25, 0.23], alola_02_hauoli: [0.36, 0.19], alola_03_ilima: [0.27, 0.09],
    alola_04_ten_carat: [0.21, 0.16], alola_05_hala: [0.3, 0.15], alola_06_paniola: [0.43, 0.62],
    alola_07_lana: [0.55, 0.69], alola_08_kiawe: [0.5, 0.57], alola_09_mallow: [0.54, 0.62],
    alola_10_olivia: [0.44, 0.75], alola_11_aether: [0.41, 0.4], alola_12_malie: [0.71, 0.56],
    alola_13_sophocles: [0.8, 0.38], alola_14_acerola: [0.74, 0.45], alola_15_po_town: [0.89, 0.48],
    alola_16_nanu: [0.93, 0.66], alola_17_lusamine: [0.45, 0.35], alola_18_poni: [0.13, 0.82],
    alola_19_vast_poni: [0.24, 0.72], alola_20_mina: [0.28, 0.62], alola_21_hapu: [0.05, 0.68],
    alola_22_hala_e4: [0.77, 0.61], alola_23_olivia_e4: [0.8, 0.67], alola_24_acerola_e4: [0.86, 0.67],
    alola_25_kahili_e4: [0.88, 0.6], alola_26_kukui: [0.82, 0.49], alola_27_necrozma: [0.85, 0.41],
  },
  via: {}, // Act 3: nodes sit on the painted landmarks; walks go straight between them
  labels: {
    alola_01_iki: 'right', alola_02_hauoli: 'right', alola_03_ilima: 'left', alola_04_ten_carat: 'right', alola_05_hala: 'left',
    alola_06_paniola: 'left', alola_07_lana: 'right', alola_08_kiawe: 'right', alola_09_mallow: 'right', alola_10_olivia: 'left',
    alola_11_aether: 'left', alola_12_malie: 'left', alola_13_sophocles: 'right', alola_14_acerola: 'left', alola_15_po_town: 'left',
    alola_16_nanu: 'left', alola_17_lusamine: 'right', alola_18_poni: 'right', alola_19_vast_poni: 'right', alola_20_mina: 'right',
    alola_21_hapu: 'right', alola_22_hala_e4: 'left', alola_23_olivia_e4: 'left', alola_24_acerola_e4: 'right', alola_25_kahili_e4: 'right',
    alola_26_kukui: 'right', alola_27_necrozma: 'left' },
  // procedural fallback scenery (drawn only if assets/maps/alola.png fails to load): four islands in a turquoise sea
  land: [[0.08, 0.30], [0.30, 0.28], [0.32, 0.62], [0.10, 0.60]],
  islands: [[0.52, 0.70, 0.12], [0.74, 0.34, 0.16], [0.14, 0.80, 0.10], [0.37, 0.48, 0.03]],
  mountains: [[0.70, 0.16], [0.66, 0.20], [0.52, 0.66]],
  forests: [[0.58, 0.76], [0.26, 0.34], [0.18, 0.70]],
  water: [[0.44, 0.40, 0.04], [0.30, 0.80, 0.04]],
  music: 'map_alola',
};
BM.REGION_MAPS.alola = { map: BM.ALOLA_MAP, stages: BM.ALOLA_STAGES, music: 'map_alola' };
