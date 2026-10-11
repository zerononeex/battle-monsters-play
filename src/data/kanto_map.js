// Kanto campaign map (design addendum 2026-10-10 "Campaign map screen"). Positions are fractions of a 16:9 map box
// (x: 0 = west edge, 1 = east; y: 0 = north, 1 = south), laid out after the real FireRed/LeafGreen town map.
// Retune these numbers once the map art (ASSET_PROMPTS #180) is DONE so the nodes sit on its towns.
//   nodes[stageId] = [x, y]
//   via[stageId]   = waypoints of the path walked FROM the previous stage TO this one (real routes, in order)
window.BM = window.BM || {};
BM.KANTO_MAP = {
  art: 'maps/kanto', // BM.ART key once assets/maps/kanto.png is DONE
  nodes: {
    kanto_01_pallet: [0.20, 0.80],
    kanto_02_viridian: [0.20, 0.56],    // Route 1 north
    kanto_03_forest: [0.20, 0.36],      // Route 2 north into Viridian Forest
    kanto_04_pewter: [0.20, 0.16],
    kanto_05_brock: [0.28, 0.20],
    kanto_06_mtmoon: [0.42, 0.11],      // Route 3 east
    kanto_07_cerulean: [0.62, 0.14],    // Route 4 east
    kanto_08_misty: [0.70, 0.21],
    kanto_09_vermilion: [0.62, 0.75],   // Route 5 -> Underground Path -> Route 6 south
    kanto_10_surge: [0.70, 0.81],
    kanto_11_lavender: [0.86, 0.43],    // Route 11 east, Route 12 north
    kanto_12_celadon: [0.42, 0.44],     // Route 8 west, Underground Path, Route 7
    kanto_13_erika: [0.35, 0.37],
    kanto_14_fuchsia: [0.50, 0.89],     // Route 16 -> Cycling Road (17) -> Route 18
    kanto_15_koga: [0.58, 0.93],
    kanto_16_saffron: [0.62, 0.44],
    kanto_17_sabrina: [0.69, 0.37],
    kanto_18_cinnabar: [0.25, 0.94],    // Routes 19-20 by sea
    kanto_19_blaine: [0.16, 0.95],
    kanto_20_giovanni: [0.13, 0.60],    // Route 21 north through Pallet to Viridian
    kanto_21_lorelei: [0.06, 0.47],     // Route 22 west, Route 23 + Victory Road north
    kanto_22_bruno: [0.06, 0.36],
    kanto_23_agatha: [0.06, 0.25],
    kanto_24_lance: [0.06, 0.14],
    kanto_25_champion: [0.13, 0.05],    // Indigo Plateau
  },
  via: {
    kanto_06_mtmoon: [[0.34, 0.12]],
    kanto_07_cerulean: [[0.52, 0.11]],
    kanto_09_vermilion: [[0.58, 0.22], [0.58, 0.66]],
    kanto_11_lavender: [[0.80, 0.81], [0.86, 0.64]],
    kanto_12_celadon: [[0.76, 0.50], [0.50, 0.50]],
    kanto_14_fuchsia: [[0.30, 0.40], [0.30, 0.84], [0.42, 0.89]],
    kanto_16_saffron: [[0.56, 0.82], [0.62, 0.75]],
    kanto_18_cinnabar: [[0.62, 0.75], [0.50, 0.89], [0.38, 0.96]],
    kanto_20_giovanni: [[0.20, 0.80], [0.20, 0.66]],
    kanto_21_lorelei: [[0.06, 0.60]],
  },
  // Node label side where the default (below; above near the south edge) would collide.
  labels: { kanto_18_cinnabar: 'right', kanto_19_blaine: 'left', kanto_15_koga: 'right', kanto_21_lorelei: 'right',
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
