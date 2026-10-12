// Johto campaign map (Johto prompt Step 4) — the Phase 3 map in the Johto region: positions are fractions of the 16:9 map box,
// nudged (Act 2 Step 9) so each node sits on its painted location in assets/maps/johto.png (#337) — the painted layout
// differs from the HGSS geography the prompt described, and the art wins. The procedural `land` / `mountains` / `forests` /
// `water` / `islands` scenery below is only the fallback drawn if the map image fails to load. NO Prism Tower entry of any kind (MMM1 / VVV1):
// a region's map carries only its region's stages.
//   nodes[stageId] = [x, y] · via[stageId] = waypoints walked FROM the previous stage TO this one · labels = label side
window.BM = window.BM || {};
BM.JOHTO_MAP = {
  art: 'maps/johto',
  nodes: {
    johto_01_newbark: [0.84, 0.82], johto_02_cherrygrove: [0.55, 0.88], johto_03_route31: [0.58, 0.72],
    johto_04_sprout: [0.46, 0.56], johto_05_falkner: [0.60, 0.60], johto_06_unioncave: [0.47, 0.77],
    johto_07_slowpokewell: [0.36, 0.82], johto_08_bugsy: [0.37, 0.72], johto_09_ilex: [0.24, 0.66],
    johto_10_goldenrod: [0.33, 0.44], johto_11_whitney: [0.42, 0.44], johto_12_nationalpark: [0.20, 0.10],
    johto_13_burnedtower: [0.27, 0.26], johto_14_morty: [0.36, 0.19], johto_15_lighthouse: [0.06, 0.37],
    johto_16_jasmine: [0.12, 0.33], johto_17_chuck: [0.11, 0.57], johto_18_lakeofrage: [0.55, 0.10],
    johto_19_pryce: [0.68, 0.48], johto_20_icepath: [0.58, 0.28], johto_21_clair: [0.79, 0.32],
    johto_22_victoryroad: [0.84, 0.66], johto_23_elitefour: [0.72, 0.19], johto_24_champion: [0.77, 0.12],
    johto_25_mtsilver: [0.88, 0.25],
  },
  via: {
    johto_02_cherrygrove: [[0.70, 0.86]],
    johto_04_sprout: [[0.52, 0.66]],
    johto_06_unioncave: [[0.54, 0.68]],
    johto_07_slowpokewell: [[0.42, 0.84]],
    johto_10_goldenrod: [[0.28, 0.52]],
    johto_12_nationalpark: [[0.30, 0.36], [0.24, 0.20]],
    johto_15_lighthouse: [[0.22, 0.22], [0.10, 0.28]],
    johto_17_chuck: [[0.08, 0.46]],
    johto_18_lakeofrage: [[0.14, 0.45], [0.22, 0.30], [0.36, 0.25], [0.48, 0.22], [0.53, 0.16]],
    johto_19_pryce: [[0.60, 0.20], [0.64, 0.38]],
    johto_20_icepath: [[0.64, 0.36]],
    johto_21_clair: [[0.68, 0.25]],
    johto_22_victoryroad: [[0.82, 0.45]],
    johto_23_elitefour: [[0.80, 0.50], [0.76, 0.30]],
    johto_25_mtsilver: [[0.82, 0.20]],
  },
  labels: { johto_01_newbark: 'right', johto_09_ilex: 'left', johto_02_cherrygrove: 'left', johto_04_sprout: 'left', johto_05_falkner: 'right',
    johto_07_slowpokewell: 'left', johto_08_bugsy: 'right', johto_10_goldenrod: 'left', johto_11_whitney: 'right',
    johto_13_burnedtower: 'left', johto_14_morty: 'right', johto_16_jasmine: 'right',
    johto_17_chuck: 'above', johto_18_lakeofrage: 'right', johto_21_clair: 'left', johto_22_victoryroad: 'left',
    johto_23_elitefour: 'left', johto_24_champion: 'above', johto_25_mtsilver: 'above' },
  // procedural fallback scenery (drawn only if assets/maps/johto.png fails to load)
  land: [[0.10, 0.04], [0.40, 0.03], [0.70, 0.03], [0.97, 0.05], [0.98, 0.40], [0.97, 0.88], [0.80, 0.95], [0.60, 0.93],
    [0.40, 0.95], [0.22, 0.90], [0.13, 0.70], [0.12, 0.30]],
  islands: [[0.07, 0.62, 0.05], [0.13, 0.80, 0.015], [0.10, 0.86, 0.012]],
  mountains: [[0.51, 0.22], [0.55, 0.20], [0.72, 0.15], [0.76, 0.17], [0.86, 0.50], [0.90, 0.44], [0.95, 0.56], [0.97, 0.62],
    [0.44, 0.66], [0.80, 0.18]],
  forests: [[0.24, 0.74], [0.28, 0.72], [0.22, 0.79], [0.60, 0.05], [0.66, 0.06], [0.33, 0.38], [0.58, 0.64], [0.48, 0.30]],
  water: [[0.62, 0.08, 0.04], [0.46, 0.38, 0.02]],
  music: 'map_johto',
};
// Region registry: each shipped region's map + campaign stage list (map.js, the home carousel, the ending)
BM.REGION_MAPS = {
  kanto: { map: BM.KANTO_MAP, stages: BM.KANTO_STAGES, music: 'map_kanto' },
  johto: { map: BM.JOHTO_MAP, stages: BM.JOHTO_STAGES, music: 'map_johto' },
};
BM.regionOfStage = (st) => (st && st.region) || (st && st.id && st.id.startsWith('johto_') ? 'johto' : 'kanto');
// The walk polyline that arrives at stage `toId` from the stage before it in its region's campaign order.
BM.mapPath = function (toId) {
  const R = BM.REGION_MAPS[BM.regionOfStage(BM.stageById(toId))], M = R.map, ST = R.stages, i = ST.findIndex((s) => s.id === toId);
  if (i <= 0) return [M.nodes[toId]];
  return [M.nodes[ST[i - 1].id], ...(M.via[toId] || []), M.nodes[toId]];
};
