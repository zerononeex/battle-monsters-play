// Hoenn campaign map (Hoenn prompt Step 4) — the Johto map pattern in the Hoenn region: positions are fractions of the 16:9 map
// box, placed from the RSE geography (U12: approximate — Act 2 Step 9 nudges every node onto its painted location in
// assets/maps/hoenn.png once the map art lands; the art wins, the Johto lesson). The procedural scenery below is only the
// fallback drawn while / if the map image is missing. NO Prism Tower entry of any kind (VVV1): a region's map carries only its
// region's stages. Norman (node 13) is the Petalburg RETURN trip — the token walks back west from Mauville.
//   nodes[stageId] = [x, y] · via[stageId] = waypoints walked FROM the previous stage TO this one · labels = label side
window.BM = window.BM || {};
BM.HOENN_MAP = {
  art: 'maps/hoenn',
  nodes: {
    hoenn_01_littleroot: [0.30, 0.84], hoenn_02_oldale: [0.30, 0.70], hoenn_03_petalburg_woods: [0.17, 0.66],
    hoenn_04_roxanne: [0.09, 0.44], hoenn_05_granite_cave: [0.08, 0.86], hoenn_06_brawly: [0.16, 0.92],
    hoenn_07_slateport: [0.40, 0.80], hoenn_08_wattson: [0.40, 0.55], hoenn_09_verdanturf: [0.27, 0.52],
    hoenn_10_meteor_falls: [0.15, 0.24], hoenn_11_flannery: [0.33, 0.34], hoenn_12_desert: [0.43, 0.38],
    hoenn_13_norman: [0.22, 0.68], hoenn_14_winona: [0.52, 0.22], hoenn_15_mt_pyre: [0.66, 0.36],
    hoenn_16_aqua_hideout: [0.72, 0.20], hoenn_17_tate_liza: [0.88, 0.36], hoenn_18_seafloor_cavern: [0.80, 0.56],
    hoenn_19_wallace: [0.72, 0.58], hoenn_20_sidney: [0.88, 0.70], hoenn_21_phoebe: [0.93, 0.76],
    hoenn_22_glacia: [0.88, 0.82], hoenn_23_drake: [0.93, 0.88], hoenn_24_champion: [0.86, 0.93],
    hoenn_25_sky_pillar: [0.58, 0.82],
  },
  via: {
    hoenn_04_roxanne: [[0.12, 0.56]],
    hoenn_05_granite_cave: [[0.06, 0.62], [0.06, 0.76]],
    hoenn_07_slateport: [[0.26, 0.92], [0.36, 0.88]],
    hoenn_08_wattson: [[0.40, 0.68]],
    hoenn_10_meteor_falls: [[0.20, 0.40]],
    hoenn_11_flannery: [[0.24, 0.26]],
    hoenn_12_desert: [[0.38, 0.36]],
    hoenn_13_norman: [[0.40, 0.48], [0.32, 0.56], [0.25, 0.64]],
    hoenn_14_winona: [[0.34, 0.48], [0.46, 0.30]],
    hoenn_15_mt_pyre: [[0.58, 0.26]],
    hoenn_16_aqua_hideout: [[0.68, 0.28]],
    hoenn_17_tate_liza: [[0.80, 0.24]],
    hoenn_18_seafloor_cavern: [[0.86, 0.46]],
    hoenn_20_sidney: [[0.80, 0.66]],
    hoenn_25_sky_pillar: [[0.76, 0.90], [0.66, 0.86]],
  },
  labels: { hoenn_01_littleroot: 'right', hoenn_02_oldale: 'right', hoenn_03_petalburg_woods: 'left', hoenn_04_roxanne: 'right',
    hoenn_05_granite_cave: 'right', hoenn_06_brawly: 'right', hoenn_07_slateport: 'right', hoenn_08_wattson: 'right', hoenn_09_verdanturf: 'left',
    hoenn_10_meteor_falls: 'right', hoenn_11_flannery: 'above', hoenn_12_desert: 'right', hoenn_13_norman: 'above', hoenn_14_winona: 'above',
    hoenn_15_mt_pyre: 'right', hoenn_16_aqua_hideout: 'above', hoenn_17_tate_liza: 'above', hoenn_18_seafloor_cavern: 'left', hoenn_19_wallace: 'left',
    hoenn_20_sidney: 'left', hoenn_21_phoebe: 'left', hoenn_22_glacia: 'left', hoenn_23_drake: 'left', hoenn_24_champion: 'left', hoenn_25_sky_pillar: 'above' },
  // procedural fallback scenery (drawn only if assets/maps/hoenn.png fails to load): the mainland west, the sea and islands east
  land: [[0.03, 0.10], [0.30, 0.06], [0.62, 0.08], [0.78, 0.14], [0.76, 0.42], [0.62, 0.50], [0.50, 0.66], [0.46, 0.86],
    [0.34, 0.95], [0.20, 0.80], [0.04, 0.70]],
  islands: [[0.10, 0.88, 0.04], [0.88, 0.34, 0.045], [0.74, 0.58, 0.04], [0.90, 0.80, 0.07], [0.58, 0.82, 0.025]],
  mountains: [[0.30, 0.30], [0.34, 0.26], [0.38, 0.30], [0.14, 0.20], [0.66, 0.34], [0.12, 0.30]],
  forests: [[0.16, 0.62], [0.20, 0.60], [0.50, 0.18], [0.56, 0.18], [0.26, 0.48]],
  water: [[0.06, 0.52, 0.02]],
  music: 'map_hoenn',
};
BM.REGION_MAPS.hoenn = { map: BM.HOENN_MAP, stages: BM.HOENN_STAGES, music: 'map_hoenn' };
