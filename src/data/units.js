// Unit data. Adding a Pokémon = a data entry here + its sprite sheets — never new engine code.
// Fields: id, name, line (unit line id), types, attackType, bst/baseHP/baseSpe (roster-v1 base stats),
// role, trait (+ dodge) — Phase 4 traits, BM.TRAITS in constants.js, rationale in docs/ROLE_TRAITS.md — cost (AP), cd (cooldown s), size (draw scale), evo ({level} | {item, minLevel} for the NEXT form
// is on the next form as `evolvesFrom` + `evo`), enemyOnly, sprite (key in BM.SPRITES, optional).
window.BM = window.BM || {};
BM.FORMS = {};
BM.LINES = {};

BM.addLine = function (line) {
  BM.LINES[line.id] = line;
  line.forms.forEach((f, i) => {
    f.line = line.id;
    f.stage = i;
    f.evolvesFrom = i > 0 ? line.forms[i - 1].id : null;
    f.attackType = f.attackType || f.types[0];
    f.size = f.size || [1, 1.2, 1.45][i] || 1;
    BM.FORMS[f.id] = f;
  });
};

// Evolution field `evo` on a form says how THAT form is reached from the previous one:
//   { level: N }                    real evolution level (or the house-rule level, BUILD_PLAN §4.6)
//   { item: 'fire_stone', minLevel } stone / held item used from the collection screen, with a level floor
//   { level: N, rule: 'trade' | 'friendship' }  non-level method simplified to a level (§4.6)
// Costs/cooldowns for Build 1's 15 + Mew/Mewtwo are §4.2 (approved). The 5 lines added in Phase 3 (Growlithe,
// Psyduck, Meowth, Scyther, Aerodactyl) and the 3 legendary birds follow the same §4.2 tier pattern (D 40–90 base ·
// C 180–210 · B 300–320 · A 500–650 · legendary 1100). Costs for the other Kanto lines are tier-based PROPOSALS —
// they only matter once those lines are pullable (Phase 5), and are tuned in Phase 8.
// Line flags: free (starter) · legendary · gachaOnly (only from a banner) · rewardOnly (never in a banner pool;
// granted by `rewardStage`'s first clear) · branch (one of several base variants of a species).

// ================= Build 1's 15 lines (BUILD_PLAN §2) =================
BM.addLine({ id: 'bulbasaur', name: 'Bulbasaur', free: true, forms: [
  { id: 'bulbasaur', name: 'Bulbasaur', types: ['grass', 'poison'], bst: 318, baseHP: 45, baseSpe: 45, role: 'ranged', cost: 75, cd: 4 },
  { id: 'ivysaur', name: 'Ivysaur', types: ['grass', 'poison'], bst: 405, baseHP: 60, baseSpe: 60, role: 'ranged', cost: 180, cd: 8, evo: { level: 16 } },
  { id: 'venusaur', name: 'Venusaur', trait: 'splash', types: ['grass', 'poison'], bst: 525, baseHP: 80, baseSpe: 80, role: 'ranged', cost: 520, cd: 20, evo: { level: 32 } },
] });
BM.addLine({ id: 'charmander', name: 'Charmander', free: true, forms: [
  { id: 'charmander', name: 'Charmander', types: ['fire'], bst: 309, baseHP: 39, baseSpe: 65, role: 'balanced', cost: 75, cd: 4 },
  { id: 'charmeleon', name: 'Charmeleon', types: ['fire'], bst: 405, baseHP: 58, baseSpe: 80, role: 'ranged', cost: 190, cd: 8, evo: { level: 16 } },
  { id: 'charizard', name: 'Charizard', trait: 'splash', types: ['fire', 'flying'], bst: 534, baseHP: 78, baseSpe: 100, role: 'ranged', cost: 600, cd: 22, evo: { level: 36 } },
] });
BM.addLine({ id: 'squirtle', name: 'Squirtle', free: true, forms: [
  { id: 'squirtle', name: 'Squirtle', types: ['water'], bst: 314, baseHP: 44, baseSpe: 43, role: 'balanced', cost: 75, cd: 4 },
  { id: 'wartortle', name: 'Wartortle', types: ['water'], bst: 405, baseHP: 59, baseSpe: 58, role: 'balanced', cost: 180, cd: 8, evo: { level: 16 } },
  { id: 'blastoise', name: 'Blastoise', trait: 'sniper', types: ['water'], bst: 530, baseHP: 79, baseSpe: 78, role: 'bruiser', cost: 560, cd: 22, evo: { level: 36 } },
] });
BM.addLine({ id: 'pikachu', name: 'Pikachu', forms: [
  { id: 'pikachu', name: 'Pikachu', trait: 'swift', types: ['electric'], bst: 320, baseHP: 35, baseSpe: 90, role: 'rusher', cost: 90, cd: 4 },
  { id: 'raichu', name: 'Raichu', trait: 'swift', types: ['electric'], bst: 485, baseHP: 60, baseSpe: 110, role: 'rusher', cost: 320, cd: 10, evo: { item: 'thunder_stone', minLevel: 20 } },
] });
BM.addLine({ id: 'magikarp', name: 'Magikarp', forms: [
  // cheap joke wall (§4.2): decent HP, Splash = 1 damage
  { id: 'magikarp', name: 'Magikarp', trait: 'splash', types: ['water'], bst: 200, baseHP: 20, baseSpe: 80, role: 'tank', cost: 40, cd: 2, hp: 160, dmg: 1 },
  { id: 'gyarados', name: 'Gyarados', trait: 'splash', types: ['water', 'flying'], attackType: 'water', bst: 540, baseHP: 95, baseSpe: 81, role: 'bruiser', cost: 620, cd: 24, evo: { level: 20 }, size: 1.55 },
] });
BM.addLine({ id: 'gastly', name: 'Gastly', forms: [
  { id: 'gastly', name: 'Gastly', trait: 'flyer', types: ['ghost', 'poison'], bst: 310, baseHP: 30, baseSpe: 80, role: 'rusher', cost: 80, cd: 4 },
  { id: 'haunter', name: 'Haunter', trait: 'flyer', types: ['ghost', 'poison'], bst: 405, baseHP: 45, baseSpe: 95, role: 'rusher', cost: 200, cd: 8, evo: { level: 25 } },
  { id: 'gengar', name: 'Gengar', trait: 'flyer', types: ['ghost', 'poison'], bst: 500, baseHP: 60, baseSpe: 110, role: 'rusher', cost: 540, cd: 20, evo: { level: 38, rule: 'trade' } },
] });
BM.addLine({ id: 'abra', name: 'Abra', forms: [
  { id: 'abra', name: 'Abra', trait: 'dodger', dodge: 0.3, types: ['psychic'], bst: 310, baseHP: 25, baseSpe: 90, role: 'ranged', cost: 70, cd: 4 },
  { id: 'kadabra', name: 'Kadabra', trait: 'dodger', dodge: 0.2, types: ['psychic'], bst: 400, baseHP: 40, baseSpe: 105, role: 'ranged', cost: 200, cd: 8, evo: { level: 16 } },
  { id: 'alakazam', name: 'Alakazam', trait: 'sniper', types: ['psychic'], bst: 500, baseHP: 55, baseSpe: 120, role: 'ranged', cost: 560, cd: 20, evo: { level: 36, rule: 'trade' } },
] });
BM.addLine({ id: 'machop', name: 'Machop', forms: [
  { id: 'machop', name: 'Machop', types: ['fighting'], bst: 305, baseHP: 70, baseSpe: 35, role: 'bruiser', cost: 80, cd: 4 },
  { id: 'machoke', name: 'Machoke', types: ['fighting'], bst: 405, baseHP: 80, baseSpe: 45, role: 'bruiser', cost: 210, cd: 8, evo: { level: 28 } },
  { id: 'machamp', name: 'Machamp', trait: 'swift', types: ['fighting'], bst: 505, baseHP: 90, baseSpe: 55, role: 'bruiser', cost: 580, cd: 22, evo: { level: 40, rule: 'trade' } },
] });
BM.addLine({ id: 'vulpix', name: 'Vulpix', forms: [
  { id: 'vulpix', name: 'Vulpix', types: ['fire'], bst: 299, baseHP: 38, baseSpe: 65, role: 'rusher', cost: 80, cd: 4 },
  { id: 'ninetales', name: 'Ninetales', trait: 'dodger', dodge: 0.2, types: ['fire'], bst: 505, baseHP: 73, baseSpe: 100, role: 'rusher', cost: 500, cd: 18, evo: { item: 'fire_stone', minLevel: 20 } },
] });
BM.addLine({ id: 'lapras', name: 'Lapras', forms: [
  { id: 'lapras', name: 'Lapras', trait: 'splash', types: ['water', 'ice'], attackType: 'ice', bst: 535, baseHP: 130, baseSpe: 60, role: 'tank', cost: 600, cd: 25, size: 1.45 },
] });
BM.addLine({ id: 'jigglypuff', name: 'Jigglypuff', forms: [
  { id: 'jigglypuff', name: 'Jigglypuff', trait: 'splash', types: ['normal', 'fairy'], bst: 270, baseHP: 115, baseSpe: 20, role: 'tank', cost: 60, cd: 3 },
  { id: 'wigglytuff', name: 'Wigglytuff', trait: 'splash', types: ['normal', 'fairy'], bst: 435, baseHP: 140, baseSpe: 45, role: 'tank', cost: 300, cd: 12, evo: { item: 'moon_stone', minLevel: 20 } },
] });
BM.addLine({ id: 'cubone', name: 'Cubone', forms: [
  { id: 'cubone', name: 'Cubone', types: ['ground'], bst: 320, baseHP: 50, baseSpe: 35, role: 'balanced', cost: 80, cd: 4 },
  { id: 'marowak', name: 'Marowak', trait: 'sniper', types: ['ground'], bst: 425, baseHP: 60, baseSpe: 45, role: 'balanced', cost: 300, cd: 10, evo: { level: 28 } },
] });
BM.addLine({ id: 'eevee_water', name: 'Water Eevee', branch: 'eevee', forms: [
  { id: 'eevee_water', name: 'Water Eevee', cry: 'eevee', sprite: 'eevee_water', trait: 'rusher', types: ['water'], bst: 325, baseHP: 55, baseSpe: 55, role: 'ranged', cost: 80, cd: 4 },
  { id: 'vaporeon', name: 'Vaporeon', trait: 'dodger', dodge: 0.2, types: ['water'], bst: 525, baseHP: 130, baseSpe: 65, role: 'ranged', cost: 520, cd: 20, evo: { item: 'water_stone', minLevel: 20 } },
] });
BM.addLine({ id: 'snorlax', name: 'Snorlax', forms: [
  { id: 'snorlax', name: 'Snorlax', trait: 'tank', types: ['normal'], bst: 540, baseHP: 160, baseSpe: 30, role: 'tank', cost: 650, cd: 28, size: 1.55 },
] });
BM.addLine({ id: 'dratini', name: 'Dratini', forms: [
  { id: 'dratini', name: 'Dratini', types: ['dragon'], bst: 300, baseHP: 41, baseSpe: 50, role: 'bruiser', cost: 85, cd: 5 },
  { id: 'dragonair', name: 'Dragonair', types: ['dragon'], bst: 420, baseHP: 61, baseSpe: 70, role: 'bruiser', cost: 320, cd: 12, evo: { level: 30 } },
  { id: 'dragonite', name: 'Dragonite', trait: 'rusher', types: ['dragon', 'flying'], attackType: 'dragon', bst: 600, baseHP: 91, baseSpe: 80, role: 'bruiser', cost: 1000, cd: 45, evo: { level: 55 }, size: 1.55 },
] });

// ================= The other Kanto unit lines =================
// Build 1's +5 (Phase 3, design addendum 2026-10-10: roster grows 15 -> 20) are among them: Growlithe, Psyduck,
// Meowth -> Persian, Scyther -> Scizor, Aerodactyl (see BM.BUILD1_LINES). Not starters: they unlock from the Phase 5
// banners and already appear as enemies in §4.11 stages.
BM.addLine({ id: 'psyduck', name: 'Psyduck', forms: [
  { id: 'psyduck', name: 'Psyduck', types: ['water'], bst: 320, baseHP: 50, baseSpe: 55, role: 'balanced', cost: 80, cd: 4 },
  { id: 'golduck', name: 'Golduck', trait: 'rusher', types: ['water'], bst: 500, baseHP: 80, baseSpe: 85, role: 'bruiser', cost: 540, cd: 20, evo: { level: 33 } },
] });
BM.addLine({ id: 'meowth', name: 'Meowth', branch: 'meowth', forms: [
  { id: 'meowth', name: 'Meowth', trait: 'swift', types: ['normal'], bst: 290, baseHP: 40, baseSpe: 90, role: 'rusher', cost: 70, cd: 3 },
  { id: 'persian', name: 'Persian', trait: 'dodger', dodge: 0.2, types: ['normal'], bst: 440, baseHP: 65, baseSpe: 115, role: 'rusher', cost: 300, cd: 10, evo: { level: 28 } },
] });
BM.addLine({ id: 'meowth_galar', name: 'Galar Meowth', branch: 'meowth', forms: [
  { id: 'meowth_galar', name: 'Galar Meowth', cry: 'meowth', types: ['steel'], bst: 290, baseHP: 50, baseSpe: 40, role: 'balanced', cost: 70, cd: 3 },
  { id: 'perrserker', name: 'Perrserker', types: ['steel'], bst: 440, baseHP: 70, baseSpe: 50, role: 'bruiser', cost: 310, cd: 10, evo: { level: 28 } },
] });
BM.addLine({ id: 'growlithe', name: 'Growlithe', forms: [
  { id: 'growlithe', name: 'Growlithe', types: ['fire'], bst: 350, baseHP: 55, baseSpe: 60, role: 'balanced', cost: 85, cd: 4 },
  { id: 'arcanine', name: 'Arcanine', trait: 'rusher', types: ['fire'], bst: 555, baseHP: 90, baseSpe: 95, role: 'bruiser', cost: 600, cd: 22, evo: { item: 'fire_stone', minLevel: 20 }, size: 1.45 },
] });
BM.addLine({ id: 'ditto', name: 'Ditto', forms: [
  { id: 'ditto', name: 'Ditto', types: ['normal'], bst: 288, baseHP: 48, baseSpe: 48, role: 'balanced', cost: 70, cd: 3 },
] });
BM.addLine({ id: 'pinsir', name: 'Pinsir', forms: [
  { id: 'pinsir', name: 'Pinsir', types: ['bug'], bst: 500, baseHP: 65, baseSpe: 85, role: 'bruiser', cost: 520, cd: 20, size: 1.25 },
] });
BM.addLine({ id: 'scyther', name: 'Scyther', branch: 'scyther', forms: [
  { id: 'scyther', name: 'Scyther', trait: 'swift', types: ['bug', 'flying'], attackType: 'bug', bst: 500, baseHP: 70, baseSpe: 105, role: 'bruiser', cost: 500, cd: 18, size: 1.25 },
  { id: 'scizor', name: 'Scizor', trait: 'tank', types: ['bug', 'steel'], attackType: 'steel', bst: 500, baseHP: 70, baseSpe: 65, role: 'bruiser', cost: 560, cd: 20, evo: { item: 'metal_coat', minLevel: 20 }, size: 1.3 },
] });
BM.addLine({ id: 'scyther_kleavor', name: 'Scyther (Kleavor)', branch: 'scyther', forms: [
  // second base Scyther, art differentiated (design addendum: branched lines)
  { id: 'scyther_kleavor', name: 'Scyther', cry: 'scyther', types: ['bug', 'flying'], attackType: 'bug', bst: 500, baseHP: 70, baseSpe: 105, role: 'bruiser', cost: 500, cd: 18, size: 1.25 },
  { id: 'kleavor', name: 'Kleavor', types: ['bug', 'rock'], attackType: 'rock', bst: 500, baseHP: 70, baseSpe: 85, role: 'bruiser', cost: 560, cd: 20, evo: { item: 'black_augurite', minLevel: 20 }, size: 1.35 },
] });
BM.addLine({ id: 'porygon', name: 'Porygon', forms: [
  { id: 'porygon', name: 'Porygon', types: ['normal'], bst: 395, baseHP: 65, baseSpe: 40, role: 'ranged', cost: 190, cd: 7 },
  { id: 'porygon2', name: 'Porygon2', types: ['normal'], bst: 515, baseHP: 85, baseSpe: 60, role: 'ranged', cost: 320, cd: 12, evo: { item: 'up_grade', minLevel: 20 } },
  { id: 'porygon_z', name: 'Porygon-Z', types: ['normal'], bst: 535, baseHP: 85, baseSpe: 90, role: 'ranged', cost: 560, cd: 20, evo: { item: 'dubious_disc', minLevel: 36 } },
] });
BM.addLine({ id: 'aerodactyl', name: 'Aerodactyl', forms: [
  { id: 'aerodactyl', name: 'Aerodactyl', trait: 'rusher', types: ['rock', 'flying'], attackType: 'rock', bst: 515, baseHP: 80, baseSpe: 130, role: 'rusher', cost: 540, cd: 18, size: 1.4 },
] });
// Mewtwo: the reward for beating Kanto (design addendum, LEGENDARY CHANGES) — never in a banner pool.
BM.addLine({ id: 'mewtwo', name: 'Mewtwo', legendary: true, rewardOnly: true, rewardStage: 'kanto_25_champion', forms: [
  { id: 'mewtwo', name: 'Mewtwo', types: ['psychic'], bst: 680, baseHP: 106, baseSpe: 130, role: 'legend', cost: 1200, cd: 60, size: 1.45 },
] });
BM.addLine({ id: 'mew', name: 'Mew', legendary: true, gachaOnly: true, forms: [
  { id: 'mew', name: 'Mew', types: ['psychic'], bst: 600, baseHP: 100, baseSpe: 100, role: 'legend', cost: 1100, cd: 60, size: 1.05 },
] });
// The legendary birds: Kanto's gacha legendaries (Banner A = Articuno + Zapdos, Banner B = Moltres + Mew).
BM.addLine({ id: 'articuno', name: 'Articuno', legendary: true, gachaOnly: true, forms: [
  { id: 'articuno', name: 'Articuno', types: ['ice', 'flying'], attackType: 'ice', bst: 580, baseHP: 90, baseSpe: 85, role: 'legend', cost: 1100, cd: 60, size: 1.45 },
] });
BM.addLine({ id: 'zapdos', name: 'Zapdos', legendary: true, gachaOnly: true, forms: [
  { id: 'zapdos', name: 'Zapdos', types: ['electric', 'flying'], attackType: 'electric', bst: 580, baseHP: 90, baseSpe: 100, role: 'legend', cost: 1100, cd: 60, size: 1.45 },
] });
BM.addLine({ id: 'moltres', name: 'Moltres', legendary: true, gachaOnly: true, forms: [
  { id: 'moltres', name: 'Moltres', types: ['fire', 'flying'], attackType: 'fire', bst: 580, baseHP: 90, baseSpe: 90, role: 'legend', cost: 1100, cd: 60, size: 1.45 },
] });
// The other seven typed Eevees: each base Eevee carries the type of its evolution (design addendum).
[
  ['electric', 'Electric', 'jolteon', 'Jolteon', 65, 130, 'rusher', { item: 'thunder_stone', minLevel: 20 }],
  ['fire', 'Fire', 'flareon', 'Flareon', 65, 65, 'bruiser', { item: 'fire_stone', minLevel: 20 }],
  ['psychic', 'Psychic', 'espeon', 'Espeon', 65, 110, 'ranged', { level: 25, rule: 'friendship' }],
  ['dark', 'Dark', 'umbreon', 'Umbreon', 95, 65, 'tank', { level: 25, rule: 'friendship' }],
  ['grass', 'Grass', 'leafeon', 'Leafeon', 65, 95, 'balanced', { item: 'leaf_stone', minLevel: 20 }],
  ['ice', 'Ice', 'glaceon', 'Glaceon', 65, 65, 'ranged', { item: 'ice_stone', minLevel: 20 }],
  ['fairy', 'Fairy', 'sylveon', 'Sylveon', 95, 60, 'ranged', { level: 25, rule: 'friendship' }],
].forEach(([type, label, evoId, evoName, hp, spe, role, evo]) => BM.addLine({ id: 'eevee_' + type, name: label + ' Eevee', branch: 'eevee', forms: [
  // II1 (user 2026-10-11): every typed base Eevee renders from the ONE canonical Eevee sheet set (assets/units/eevee_water —
  // brown fur, cream ruff + tail tip); the variants differ only in type and attack (combat.js). No per-variant recolours.
  { id: 'eevee_' + type, name: label + ' Eevee', cry: 'eevee', sprite: 'eevee_water', types: [type], bst: 325, baseHP: 55, baseSpe: 55, role: 'ranged', cost: 80, cd: 4 },
  { id: evoId, name: evoName, types: [type], bst: 525, baseHP: hp, baseSpe: spe, role, cost: 520, cd: 20, evo },
] }));

// The 37 Kanto unit lines in collection order (Build 1's 20 first, then the rest; the 3 birds added in Phase 3).
BM.KANTO_LINES = ['bulbasaur', 'charmander', 'squirtle', 'pikachu', 'magikarp', 'gastly', 'abra', 'machop', 'vulpix',
  'lapras', 'jigglypuff', 'cubone', 'eevee_water', 'snorlax', 'dratini',
  'growlithe', 'psyduck', 'meowth', 'scyther', 'aerodactyl',
  'meowth_galar', 'ditto', 'pinsir', 'scyther_kleavor', 'porygon',
  'articuno', 'zapdos', 'moltres', 'mew', 'mewtwo',
  'eevee_electric', 'eevee_fire', 'eevee_psychic', 'eevee_dark', 'eevee_grass', 'eevee_ice', 'eevee_fairy'];
BM.BUILD1_LINES = BM.KANTO_LINES.slice(0, 20);

// RARITY (Phase 5 layout pass, design addendum "UI LAYOUT DIRECTION") — a DATA field per line, shown on cards, used by
// the Characters sort/filter and the gacha reveal. Assignment rule (table + reasons: docs/ROLE_TRAITS.md; user veto pass
// later): Legendary = legendary/mythical lines · Super Rare = Dratini line, Lapras, Snorlax, Aerodactyl, Porygon, Ditto ·
// Rare = the other banner lines that evolve late (final form at Lv 28+ or trade) or are single-stage · Basic = starters,
// gift lines (Magikarp, Water Eevee) and common lines.
BM.RARITIES = [
  { id: 'basic', name: 'Basic', stars: 1, color: '#9aa7b8' },
  { id: 'rare', name: 'Rare', stars: 2, color: '#3d8fe0' },
  { id: 'super', name: 'Super Rare', stars: 3, color: '#b04fe0' },
  { id: 'legendary', name: 'Legendary', stars: 4, color: '#f0b020' },
];
{
  const R = {
    super: ['dratini', 'lapras', 'snorlax', 'aerodactyl', 'porygon', 'ditto'],
    rare: ['gastly', 'abra', 'machop', 'cubone', 'psyduck', 'meowth', 'meowth_galar', 'scyther', 'scyther_kleavor', 'pinsir'],
  };
  for (const line of Object.values(BM.LINES)) {
    if (line.enemyOnly) continue;
    line.rarity = line.rarity || (line.legendary ? 'legendary' : R.super.includes(line.id) ? 'super' : R.rare.includes(line.id) ? 'rare' : 'basic');
  }
}
BM.rarityOf = (lineId) => BM.RARITIES.find((r) => r.id === (BM.LINES[lineId] && BM.LINES[lineId].rarity)) || BM.RARITIES[0];

// Evolution / held items referenced by `evo.item` live in items.js (BM.ITEM_INFO / BM.ITEMS).

// New profiles start with the 3 free starters + Pikachu (what Phase 1 played with).
BM.DEFAULT_TEAM = ['bulbasaur', 'charmander', 'squirtle', 'pikachu'];
BM.TEAM_SIZE = 10;
