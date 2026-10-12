// Kanto campaign map (design addendum 2026-10-10 "Campaign map screen"). Positions are fractions of a 16:9 map box
// (x: 0 = west edge, 1 = east; y: 0 = north, 1 = south), laid out after the real FireRed/LeafGreen town map.
// Phase 8 (BR-015): retuned onto the towns of the #180 map art.
//   nodes[stageId] = [x, y]
//   via[stageId]   = waypoints of the path walked FROM the previous stage TO this one (real routes, in order)
window.BM = window.BM || {};
BM.KANTO_MAP = {
  art: 'maps/kanto', // BM.ART key once assets/maps/kanto.png is DONE
  // BR-015 (Phase 8 step 7): nodes + walk paths re-placed on the towns and roads of the #180 map art (it is a stylised
  // Kanto, not the FRLG grid): every node sits on its painted town / gym / cave, every path follows a painted road or the sea.
  nodes: {
    kanto_01_pallet: [0.215, 0.84],    // red-roofed village, south-west shore
    kanto_02_viridian: [0.21, 0.48],  // grey village, Route 1 north
    kanto_03_forest: [0.20, 0.35],     // the dark pine forest
    kanto_04_pewter: [0.20, 0.18],    // grey stone city, north-west
    kanto_05_brock: [0.29, 0.225],
    kanto_06_mtmoon: [0.50, 0.11],     // the big crater mountain, Route 3 east
    kanto_07_cerulean: [0.645, 0.155],   // blue town, north-east
    kanto_08_misty: [0.70, 0.235],
    kanto_09_vermilion: [0.675, 0.775],  // orange harbour town, south-east
    kanto_10_surge: [0.75, 0.87],      // by the S.S. Anne
    kanto_11_lavender: [0.88, 0.50],   // purple town + the tower, east
    kanto_12_celadon: [0.42, 0.49],    // the green city
    kanto_13_erika: [0.37, 0.40],
    kanto_14_fuchsia: [0.49, 0.80],    // the palm-and-timber village, south
    kanto_15_koga: [0.575, 0.865],
    kanto_16_saffron: [0.64, 0.49],    // the big walled city, centre-east
    kanto_17_sabrina: [0.665, 0.37],   // its tall tower
    kanto_18_cinnabar: [0.35, 0.91],   // the volcano island
    kanto_19_blaine: [0.42, 0.955],
    kanto_20_giovanni: [0.275, 0.575],  // back to Viridian (Route 21 north through Pallet)
    kanto_21_lorelei: [0.085, 0.46],   // Route 22 west, then Victory Road north through the western range
    kanto_22_bruno: [0.085, 0.36],
    kanto_23_agatha: [0.085, 0.26],
    kanto_24_lance: [0.09, 0.15],
    kanto_25_champion: [0.13, 0.055],  // Indigo Plateau (the red castle)
  },
  via: {
    kanto_06_mtmoon: [[0.45, 0.20]],
    kanto_07_cerulean: [[0.56, 0.20]],
    kanto_09_vermilion: [[0.66, 0.30], [0.66, 0.72]],
    kanto_11_lavender: [[0.85, 0.75], [0.85, 0.55]],
    kanto_12_celadon: [[0.75, 0.50], [0.50, 0.50]],
    kanto_14_fuchsia: [[0.30, 0.50], [0.30, 0.75], [0.45, 0.75]],
    kanto_16_saffron: [[0.62, 0.75], [0.66, 0.62]],
    kanto_18_cinnabar: [[0.66, 0.62], [0.62, 0.75], [0.46, 0.80], [0.38, 0.87]],
    kanto_20_giovanni: [[0.26, 0.88], [0.235, 0.72]],
    kanto_21_lorelei: [[0.14, 0.50]],
  },
  // Node label side where the default (below; above near the south edge) would collide.
  labels: { kanto_04_pewter: 'above', kanto_02_viridian: 'right', kanto_03_forest: 'right', kanto_07_cerulean: 'above',
    kanto_14_fuchsia: 'left', kanto_15_koga: 'above', kanto_09_vermilion: 'above', kanto_10_surge: 'right',
    kanto_18_cinnabar: 'above', kanto_19_blaine: 'right', kanto_21_lorelei: 'right',
    kanto_22_bruno: 'right', kanto_23_agatha: 'right', kanto_24_lance: 'right', kanto_25_champion: 'right' },
  // Procedural placeholder scenery (drawn until the map art is DONE): coast, sea, island, mountains, forests.
  land: [[0.02, 0.04], [0.30, 0.02], [0.55, 0.04], [0.80, 0.02], [0.95, 0.06], [0.96, 0.34], [0.93, 0.62], [0.95, 0.86],
    [0.78, 0.92], [0.66, 0.97], [0.44, 0.95], [0.36, 0.86], [0.27, 0.86], [0.12, 0.84], [0.02, 0.72]],
  islands: [[0.205, 0.95, 0.06]],
  mountains: [[0.38, 0.08], [0.43, 0.06], [0.47, 0.10], [0.40, 0.14], [0.80, 0.27], [0.84, 0.24], [0.03, 0.30],
    [0.09, 0.30], [0.03, 0.42], [0.10, 0.20], [0.27, 0.07], [0.90, 0.12]],
  forests: [[0.16, 0.34], [0.24, 0.33], [0.18, 0.40], [0.23, 0.40], [0.15, 0.29], [0.47, 0.79], [0.52, 0.77], [0.55, 0.82],
    [0.45, 0.82], [0.34, 0.60], [0.78, 0.66], [0.74, 0.12]],
  water: [[0.66, 0.06, 0.035], [0.46, 0.64, 0.03]],
};
// The walk polyline that arrives at stage `toId` from the stage before it in campaign order.
BM.mapPath = function (toId) {
  const M = BM.KANTO_MAP, i = BM.KANTO_STAGES.findIndex((s) => s.id === toId);
  if (i <= 0) return [M.nodes[toId]];
  return [M.nodes[BM.KANTO_STAGES[i - 1].id], ...(M.via[toId] || []), M.nodes[toId]];
};
