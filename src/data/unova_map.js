// Unova campaign map (Sinnoh + Unova prompt Act 2 U-S4) — the Hoenn / Sinnoh map pattern: positions are fractions of the 16:9 map box,
// roughed in from the queued map prompt (assets/maps/unova.png, Batch 14 P0a: Nuvema south-east, Accumula / Striaton / Nacrene along the
// south, Pinwheel Forest, Castelia on its pier, the Desert Resort, Nimbasa in the middle, Driftveil + Chargestone west, Mistralton /
// Celestial Tower / Twist Mountain / Icirrus / Dragonspiral north-west, Opelucid north-east, Victory Road + the League north-east).
// Act 3 A1 (2026-10-13): every node nudged onto the painted art (Castelia on its towers, Driftveil port, Chargestone cave, the
// League + N's Castle on the cliff palace, Victory Road up the east trail). NO Prism Tower entry of any kind (VVV1).
//   nodes[stageId] = [x, y] · via[stageId] = waypoints walked FROM the previous stage TO this one · labels = label side
window.BM = window.BM || {};
BM.UNOVA_MAP = {
  art: 'maps/unova',
  nodes: {
    unova_01_nuvema: [0.83, 0.79], unova_02_accumula: [0.79, 0.7], unova_03_dreamyard: [0.69, 0.62],
    unova_04_striaton: [0.66, 0.71], unova_05_lenora: [0.54, 0.68], unova_06_pinwheel: [0.42, 0.74],
    unova_07_burgh: [0.22, 0.8], unova_08_desert: [0.48, 0.58], unova_09_elesa: [0.55, 0.4],
    unova_10_cold_storage: [0.35, 0.6], unova_11_clay: [0.12, 0.55], unova_12_chargestone: [0.12, 0.42],
    unova_13_celestial: [0.2, 0.14], unova_14_skyla: [0.17, 0.26], unova_15_twist_mountain: [0.5, 0.24],
    unova_16_brycen: [0.45, 0.1], unova_17_dragonspiral: [0.29, 0.15], unova_18_drayden: [0.62, 0.2],
    unova_19_victory_road: [0.87, 0.45], unova_20_shauntal: [0.72, 0.31], unova_21_grimsley: [0.79, 0.33],
    unova_22_caitlin: [0.74, 0.2], unova_23_marshal: [0.82, 0.19], unova_24_ns_castle: [0.77, 0.09],
    unova_25_alder: [0.83, 0.26],
  },
  via: {
    unova_05_lenora: [[0.6, 0.7]],
    unova_07_burgh: [[0.34, 0.66], [0.28, 0.7]],
    unova_08_desert: [[0.34, 0.66], [0.42, 0.62]],
    unova_10_cold_storage: [[0.45, 0.4], [0.38, 0.52]],
    unova_11_clay: [[0.24, 0.56]],
    unova_13_celestial: [[0.2, 0.34], [0.22, 0.22]],
    unova_15_twist_mountain: [[0.3, 0.28], [0.42, 0.22]],
    unova_17_dragonspiral: [[0.38, 0.18]],
    unova_18_drayden: [[0.38, 0.2], [0.52, 0.16]],
    unova_19_victory_road: [[0.7, 0.36], [0.82, 0.4]],
    unova_20_shauntal: [[0.8, 0.4]],
  },
  labels: {
    unova_01_nuvema: 'left', unova_02_accumula: 'right', unova_03_dreamyard: 'right', unova_04_striaton: 'right', unova_05_lenora: 'above',
    unova_06_pinwheel: 'left', unova_07_burgh: 'right', unova_08_desert: 'right', unova_09_elesa: 'right', unova_10_cold_storage: 'left',
    unova_11_clay: 'right', unova_12_chargestone: 'right', unova_13_celestial: 'left', unova_14_skyla: 'right', unova_15_twist_mountain: 'right',
    unova_16_brycen: 'right', unova_17_dragonspiral: 'left', unova_18_drayden: 'right', unova_19_victory_road: 'right', unova_20_shauntal: 'left',
    unova_21_grimsley: 'right', unova_22_caitlin: 'left', unova_23_marshal: 'right', unova_24_ns_castle: 'right', unova_25_alder: 'right' },
  // procedural fallback scenery (drawn only if assets/maps/unova.png fails to load): a ring of land around the middle
  land: [[0.06, 0.04], [0.60, 0.04], [0.90, 0.18], [0.94, 0.60], [0.86, 0.94], [0.56, 0.94], [0.36, 0.86], [0.10, 0.70], [0.04, 0.30]],
  islands: [[0.48, 0.90, 0.03]],
  mountains: [[0.38, 0.12], [0.34, 0.16], [0.68, 0.14], [0.74, 0.20], [0.22, 0.32]],
  forests: [[0.40, 0.72], [0.44, 0.76], [0.36, 0.76], [0.70, 0.62]],
  water: [[0.30, 0.10, 0.02], [0.56, 0.80, 0.03]],
  music: 'map_unova',
};
BM.REGION_MAPS.unova = { map: BM.UNOVA_MAP, stages: BM.UNOVA_STAGES, music: 'map_unova' };
