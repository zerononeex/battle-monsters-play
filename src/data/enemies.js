// Enemy-only species (BUILD_PLAN §4.10, amended 2026-10-11): `enemyOnly`, never in gacha.
//  - boss: gym/E4/Champion aces — full run + attack sheets.
//  - runOnly: wave fodder — run sheet only; their attack is a forward lunge + their type-effect sprite.
// Roster forms that appear as enemies (Psyduck, Meowth, Growlithe, Arcanine, Pinsir, Scyther, Aerodactyl, and
// Build 1's aces) are NOT here — stages use their normal roster form ids.
window.BM = window.BM || {};
(function () {
  const E = (id, name, types, bst, baseHP, baseSpe, role, extra = {}) =>
    ({ id, name, types, bst, baseHP, baseSpe, role, cost: 0, cd: 0, ...extra });
  const fodder = [
    E('pidgey', 'Pidgey', ['normal', 'flying'], 251, 40, 56, 'balanced', { trait: 'flyer', attackType: 'flying' }),
    E('pidgeot', 'Pidgeot', ['normal', 'flying'], 479, 83, 101, 'rusher', { trait: 'flyer', attackType: 'flying', size: 1.4 }),
    E('rattata', 'Rattata', ['normal'], 253, 30, 72, 'rusher'),
    E('caterpie', 'Caterpie', ['bug'], 195, 45, 45, 'balanced', { size: 0.85 }),
    E('geodude', 'Geodude', ['rock', 'ground'], 300, 40, 20, 'balanced'),
    E('zubat', 'Zubat', ['poison', 'flying'], 245, 40, 55, 'rusher', { trait: 'flyer' }),
    E('golbat', 'Golbat', ['poison', 'flying'], 455, 75, 90, 'rusher', { trait: 'flyer', size: 1.25 }),
    E('clefairy', 'Clefairy', ['fairy'], 323, 70, 35, 'balanced'),
    E('oddish', 'Oddish', ['grass', 'poison'], 320, 45, 30, 'ranged', { size: 0.9 }),
    E('staryu', 'Staryu', ['water'], 340, 30, 85, 'rusher'),
    E('tentacool', 'Tentacool', ['water', 'poison'], 335, 40, 70, 'balanced'),
    E('voltorb', 'Voltorb', ['electric'], 330, 40, 100, 'rusher', { size: 0.9 }),
    E('ekans', 'Ekans', ['poison'], 288, 35, 55, 'balanced'),
    E('arbok', 'Arbok', ['poison'], 448, 60, 80, 'bruiser', { size: 1.3 }),
    E('koffing', 'Koffing', ['poison'], 340, 40, 35, 'ranged', { trait: 'flyer' }),
    E('tangela', 'Tangela', ['grass'], 435, 65, 60, 'tank'),
    E('rhyhorn', 'Rhyhorn', ['ground', 'rock'], 345, 80, 25, 'tank', { attackType: 'ground' }),
    E('venonat', 'Venonat', ['bug', 'poison'], 305, 60, 45, 'ranged'),
    E('venomoth', 'Venomoth', ['bug', 'poison'], 450, 70, 90, 'ranged', { size: 1.25 }),
    E('mr_mime', 'Mr. Mime', ['psychic', 'fairy'], 460, 40, 90, 'ranged', { size: 1.2 }),
    E('ponyta', 'Ponyta', ['fire'], 410, 50, 90, 'rusher', { size: 1.15 }),
    E('rapidash', 'Rapidash', ['fire'], 500, 65, 105, 'rusher', { size: 1.4 }),
    E('dewgong', 'Dewgong', ['water', 'ice'], 475, 90, 70, 'tank', { attackType: 'ice', size: 1.35 }),
    E('cloyster', 'Cloyster', ['water', 'ice'], 525, 50, 70, 'tank', { attackType: 'ice', size: 1.3 }),
    E('hitmonlee', 'Hitmonlee', ['fighting'], 455, 50, 87, 'bruiser', { size: 1.25 }),
    // Phase 4: Giovanni's Dugtrio — the user's locked Dodger example (25%)
    E('dugtrio', 'Dugtrio', ['ground'], 425, 35, 120, 'rusher', { trait: 'dodger', dodge: 0.25, size: 1.1 }),
  ];
  const bosses = [
    E('onix', 'Onix', ['rock', 'ground'], 385, 35, 70, 'tank', { boss: true, size: 1.7 }),
    E('starmie', 'Starmie', ['water', 'psychic'], 520, 60, 115, 'ranged', { boss: true, size: 1.25 }),
    E('vileplume', 'Vileplume', ['grass', 'poison'], 490, 75, 50, 'ranged', { boss: true, size: 1.3 }),
    E('weezing', 'Weezing', ['poison'], 490, 65, 60, 'ranged', { trait: 'flyer', boss: true, size: 1.3 }),
    E('rhydon', 'Rhydon', ['ground', 'rock'], 485, 105, 40, 'bruiser', { boss: true, attackType: 'ground', size: 1.5 }),
  ];
  // G3 bounty size class (data): fodder 10 AP · medium 20 · large 40 · boss 150 (BM.C.BOUNTY). Base forms are fodder,
  // evolved forms medium, Pidgeot (a 3-stage final) large; gym/E4/Champion aces are always boss.
  const SIZE = { pidgeot: 'large', golbat: 'medium', arbok: 'medium', tangela: 'medium', rhyhorn: 'medium', venomoth: 'medium',
    mr_mime: 'medium', rapidash: 'medium', dewgong: 'medium', cloyster: 'medium', hitmonlee: 'medium', dugtrio: 'medium' };
  for (const f of fodder) f.sizeClass = SIZE[f.id] || 'fodder';
  for (const f of bosses) f.sizeClass = 'boss';
  for (const f of fodder) BM.addLine({ id: f.id, name: f.name, enemyOnly: true, forms: [{ ...f, runOnly: true, size: f.size || 1 }] });
  for (const f of bosses) BM.addLine({ id: f.id, name: f.name, enemyOnly: true, forms: [{ ...f, size: f.size || 1 }] });
  BM.ENEMY_ONLY = [...fodder, ...bosses].map((f) => f.id);
})();
