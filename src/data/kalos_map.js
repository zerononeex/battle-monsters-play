// Kalos campaign map (Kalos + Alola build, Act 1) — the Unova map pattern: positions are fractions of the 16:9 map box, roughed in from
// the queued map prompt (assets/maps/kalos.png: the star-shaped land — Vaniville far south, Santalune, Lumiose in the centre, Camphrier /
// Parfum Palace west, Cyllage / Glittering Cave / Ambrette / Shalour up the west coast, Coumarine + Laverre north, Dendemille / Frost
// Cavern / Anistar north-east, Geosenge, Snowbelle + the League east). Act 3 (art landed): every node re-placed onto the PAINTED landmarks — the painted map differs from the prompt's % layout (pack U10).
// NO Prism Tower entry of any kind (VVV1).
//   nodes[stageId] = [x, y] · via[stageId] = waypoints walked FROM the previous stage TO this one · labels = label side
window.BM = window.BM || {};
BM.KALOS_MAP = {
  art: 'maps/kalos',
  nodes: {
    kalos_01_vaniville: [0.46, 0.87], kalos_02_santalune_forest: [0.49, 0.66], kalos_03_route_3: [0.4, 0.74],
    kalos_04_viola: [0.46, 0.77], kalos_05_lumiose: [0.44, 0.4], kalos_06_parfum: [0.29, 0.45],
    kalos_07_grant: [0.11, 0.5], kalos_08_glittering_cave: [0.15, 0.36], kalos_09_ambrette: [0.21, 0.56],
    kalos_10_korrina: [0.28, 0.14], kalos_11_ramos: [0.34, 0.27], kalos_12_power_plant: [0.4, 0.55],
    kalos_13_clemont: [0.55, 0.43], kalos_14_valerie: [0.69, 0.34], kalos_15_pokeball_factory: [0.64, 0.26],
    kalos_16_frost_cavern: [0.77, 0.16], kalos_17_olympia: [0.85, 0.22], kalos_18_flare_hq: [0.6, 0.72],
    kalos_19_wulfric: [0.71, 0.58], kalos_20_malva: [0.79, 0.66], kalos_21_siebold: [0.84, 0.72],
    kalos_22_wikstrom: [0.91, 0.66], kalos_23_drasna: [0.92, 0.56], kalos_24_champion: [0.86, 0.49],
    kalos_25_rogue_mega_night: [0.5, 0.32],
  },
  via: {}, // Act 3: nodes sit on the painted landmarks; walks go straight between them
  labels: {
    kalos_01_vaniville: 'right', kalos_02_santalune_forest: 'right', kalos_03_route_3: 'left', kalos_04_viola: 'right', kalos_05_lumiose: 'left',
    kalos_06_parfum: 'left', kalos_07_grant: 'right', kalos_08_glittering_cave: 'right', kalos_09_ambrette: 'right', kalos_10_korrina: 'right',
    kalos_11_ramos: 'right', kalos_12_power_plant: 'left', kalos_13_clemont: 'right', kalos_14_valerie: 'left', kalos_15_pokeball_factory: 'right',
    kalos_16_frost_cavern: 'left', kalos_17_olympia: 'left', kalos_18_flare_hq: 'right', kalos_19_wulfric: 'left', kalos_20_malva: 'left',
    kalos_21_siebold: 'left', kalos_22_wikstrom: 'right', kalos_23_drasna: 'left', kalos_24_champion: 'left', kalos_25_rogue_mega_night: 'right' },
  // procedural fallback scenery (drawn only if assets/maps/kalos.png fails to load): a star of land around Lumiose
  land: [[0.08, 0.10], [0.40, 0.06], [0.84, 0.18], [0.94, 0.48], [0.92, 0.86], [0.56, 0.96], [0.36, 0.92], [0.10, 0.62], [0.04, 0.30]],
  islands: [[0.20, 0.08, 0.03]],
  mountains: [[0.72, 0.10], [0.78, 0.14], [0.80, 0.60], [0.86, 0.58], [0.34, 0.24]],
  forests: [[0.44, 0.76], [0.50, 0.78], [0.66, 0.60], [0.60, 0.32]],
  water: [[0.06, 0.40, 0.03], [0.62, 0.10, 0.02]],
  music: 'map_kalos',
};
BM.REGION_MAPS.kalos = { map: BM.KALOS_MAP, stages: BM.KALOS_STAGES, music: 'map_kalos' };
