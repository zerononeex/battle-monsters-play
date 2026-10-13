// Sinnoh campaign map (Sinnoh + Unova prompt Act 1 S4) — the Hoenn map pattern in the Sinnoh region: positions are fractions of the
// 16:9 map box, roughed in from the queued map prompt's layout (assets/maps/sinnoh.png, Batch 13 P0a — Twinleaf south-west, Jubilife,
// Oreburgh at the foot of Mt. Coronet, Eterna north, Spear Pillar on the peak, Hearthome / Solaceon / Veilstone east, Pastoria + the
// Great Marsh south-east, Canalave + Iron Island far west, Snowpoint far north, Sunyshore south-east coast, the League on its island
// east). Act 3 A1 (2026-10-13): every node nudged onto the painted art (Iron Island on its islet, the League on the temple island,
// Spear Pillar on the summit ring, Arceus above it). The procedural scenery is only the fallback drawn
// while / if the map image is missing. NO Prism Tower entry of any kind (VVV1). Node 26 (Arceus, post-game) sits above Spear Pillar.
//   nodes[stageId] = [x, y] · via[stageId] = waypoints walked FROM the previous stage TO this one · labels = label side
window.BM = window.BM || {};
BM.SINNOH_MAP = {
  art: 'maps/sinnoh',
  nodes: {
    sinnoh_01_twinleaf: [0.27, 0.86], sinnoh_02_sandgem: [0.315, 0.82], sinnoh_03_jubilife: [0.28, 0.67],
    sinnoh_04_roark: [0.34, 0.44], sinnoh_05_windworks: [0.57, 0.4], sinnoh_06_eterna_forest: [0.2, 0.42],
    sinnoh_07_gardenia: [0.25, 0.29], sinnoh_08_fantina: [0.59, 0.58], sinnoh_09_solaceon: [0.62, 0.46],
    sinnoh_10_maylene: [0.72, 0.43], sinnoh_11_wake: [0.76, 0.74], sinnoh_12_byron: [0.13, 0.64],
    sinnoh_13_iron_island: [0.05, 0.79], sinnoh_14_lakes: [0.8, 0.56], sinnoh_15_candice: [0.2, 0.11],
    sinnoh_16_galactic_hq: [0.67, 0.24], sinnoh_17_spear_pillar: [0.355, 0.11], sinnoh_18_distortion_world: [0.55, 0.16],
    sinnoh_19_volkner: [0.88, 0.77], sinnoh_20_aaron: [0.77, 0.31], sinnoh_21_bertha: [0.86, 0.31],
    sinnoh_22_flint: [0.77, 0.245], sinnoh_23_lucian: [0.86, 0.245], sinnoh_24_champion: [0.815, 0.185],
    sinnoh_25_hisui_rift: [0.42, 0.2], sinnoh_26_arceus: [0.4, 0.075],
  },
  via: {
    sinnoh_03_jubilife: [[0.3, 0.76]],
    sinnoh_04_roark: [[0.3, 0.56]],
    sinnoh_05_windworks: [[0.45, 0.3], [0.52, 0.36]],
    sinnoh_06_eterna_forest: [[0.45, 0.3], [0.3, 0.38]],
    sinnoh_07_gardenia: [[0.22, 0.34]],
    sinnoh_08_fantina: [[0.3, 0.56], [0.45, 0.64], [0.52, 0.6]],
    sinnoh_10_maylene: [[0.66, 0.44]],
    sinnoh_11_wake: [[0.68, 0.56], [0.72, 0.66]],
    sinnoh_12_byron: [[0.6, 0.68], [0.4, 0.72], [0.2, 0.66]],
    sinnoh_13_iron_island: [[0.08, 0.74]],
    sinnoh_14_lakes: [[0.2, 0.7], [0.45, 0.66], [0.68, 0.6]],
    sinnoh_15_candice: [[0.62, 0.4], [0.45, 0.24], [0.3, 0.16]],
    sinnoh_16_galactic_hq: [[0.35, 0.2], [0.55, 0.22]],
    sinnoh_17_spear_pillar: [[0.5, 0.22], [0.4, 0.16]],
    sinnoh_18_distortion_world: [[0.45, 0.13]],
    sinnoh_19_volkner: [[0.65, 0.3], [0.7, 0.6], [0.82, 0.72]],
    sinnoh_20_aaron: [[0.8, 0.5], [0.77, 0.4]],
    sinnoh_25_hisui_rift: [[0.7, 0.18], [0.55, 0.2]],
    sinnoh_26_arceus: [[0.37, 0.1]],
  },
  labels: {
    sinnoh_01_twinleaf: 'left', sinnoh_02_sandgem: 'right', sinnoh_03_jubilife: 'right', sinnoh_04_roark: 'right', sinnoh_05_windworks: 'right',
    sinnoh_06_eterna_forest: 'left', sinnoh_07_gardenia: 'right', sinnoh_08_fantina: 'right', sinnoh_09_solaceon: 'right', sinnoh_10_maylene: 'left',
    sinnoh_11_wake: 'left', sinnoh_12_byron: 'right', sinnoh_13_iron_island: 'right', sinnoh_14_lakes: 'right', sinnoh_15_candice: 'right',
    sinnoh_16_galactic_hq: 'left', sinnoh_17_spear_pillar: 'right', sinnoh_18_distortion_world: 'right', sinnoh_19_volkner: 'left', sinnoh_20_aaron: 'left',
    sinnoh_21_bertha: 'right', sinnoh_22_flint: 'left', sinnoh_23_lucian: 'right', sinnoh_24_champion: 'above', sinnoh_25_hisui_rift: 'right',
    sinnoh_26_arceus: 'right' },
  // procedural fallback scenery (drawn only if assets/maps/sinnoh.png fails to load): one big northern land, Mt. Coronet down the middle
  land: [[0.10, 0.04], [0.60, 0.03], [0.86, 0.18], [0.88, 0.50], [0.94, 0.66], [0.92, 0.86], [0.70, 0.92], [0.40, 0.95], [0.14, 0.92],
    [0.12, 0.70], [0.04, 0.54], [0.08, 0.30]],
  islands: [[0.05, 0.44, 0.035], [0.95, 0.48, 0.06]],
  mountains: [[0.46, 0.20], [0.48, 0.30], [0.47, 0.42], [0.49, 0.52], [0.45, 0.62], [0.40, 0.08]],
  forests: [[0.22, 0.38], [0.26, 0.40], [0.18, 0.46], [0.62, 0.70]],
  water: [[0.13, 0.84, 0.02], [0.78, 0.58, 0.025], [0.35, 0.08, 0.02]],
  music: 'map_sinnoh',
};
BM.REGION_MAPS.sinnoh = { map: BM.SINNOH_MAP, stages: BM.SINNOH_STAGES, music: 'map_sinnoh' };
