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
    // FFF1 (Phase 7.6): Diglett — Dugtrio's pre-evolution was missing from the game entirely (found by the user's gallery audit)
    E('diglett', 'Diglett', ['ground'], 265, 10, 95, 'rusher', { trait: 'dodger', dodge: 0.2, size: 0.8 }),
    // III1a (Phase 8, user-approved): Seel + Shellder — Dewgong's / Cloyster's pre-evolutions, found missing by the FFF1 backward test
    E('seel', 'Seel', ['water'], 325, 65, 45, 'balanced', { attackType: 'ice' }), // Icy Wind: the Ice line Dewgong grows into
    E('shellder', 'Shellder', ['water'], 305, 30, 40, 'tank', { size: 0.85 }), // Def 100: a small shell wall that clamps
    E('dugtrio', 'Dugtrio', ['ground'], 425, 35, 120, 'rusher', { trait: 'dodger', dodge: 0.25, size: 1.1 }),
    // Phase 7.5 EE1 evolution sweep (missing stages of in-game species; canon stats PokéAPI) + CC2 Electrode + the two
    // Gen 1 stages the sweep's additions imply (Butterfree after Metapod, Golem after Graveler — chain test, BR-068)
    E('pidgeotto', 'Pidgeotto', ['normal', 'flying'], 349, 63, 71, 'balanced', { trait: 'flyer', attackType: 'flying', size: 1.15 }),
    E('raticate', 'Raticate', ['normal'], 413, 55, 97, 'rusher', { size: 1.1 }),
    E('metapod', 'Metapod', ['bug'], 205, 50, 30, 'tank', { size: 0.85, dmg: 1 }), // Harden: a wall that barely hits
    E('butterfree', 'Butterfree', ['bug', 'flying'], 395, 60, 70, 'ranged', { trait: 'flyer', attackType: 'bug', size: 1.15 }),
    E('graveler', 'Graveler', ['rock', 'ground'], 390, 55, 35, 'tank', { size: 1.15 }),
    E('golem', 'Golem', ['rock', 'ground'], 495, 80, 45, 'tank', { size: 1.4 }),
    E('clefable', 'Clefable', ['fairy'], 483, 95, 60, 'balanced', { size: 1.15 }),
    E('gloom', 'Gloom', ['grass', 'poison'], 395, 60, 40, 'ranged', { size: 1 }),
    E('tentacruel', 'Tentacruel', ['water', 'poison'], 515, 80, 100, 'ranged', { size: 1.3 }),
    E('electrode', 'Electrode', ['electric'], 490, 60, 150, 'rusher', { size: 1 }), // CC2: the fastest Pokémon in Gen 1
    E('crobat', 'Crobat', ['poison', 'flying'], 535, 85, 130, 'rusher', { trait: 'flyer', attackType: 'poison', size: 1.3 }),
    E('steelix', 'Steelix', ['steel', 'ground'], 510, 75, 30, 'tank', { size: 1.8 }),
    E('tangrowth', 'Tangrowth', ['grass'], 535, 100, 50, 'tank', { size: 1.4 }),
    E('rhyperior', 'Rhyperior', ['ground', 'rock'], 535, 115, 40, 'bruiser', { attackType: 'rock', size: 1.65 }),
    // CC1: Bruno's Hitmonchan — heavy melee bruiser; the elemental punches flash fire / ice / electric, damage stays Fighting
    E('hitmonchan', 'Hitmonchan', ['fighting'], 455, 50, 76, 'bruiser', { size: 1.25, aceClass: true }),
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
    mr_mime: 'medium', rapidash: 'medium', dewgong: 'medium', cloyster: 'medium', hitmonlee: 'medium', dugtrio: 'medium',
    pidgeotto: 'medium', raticate: 'medium', metapod: 'medium', butterfree: 'large', graveler: 'medium', golem: 'large', clefable: 'medium',
    gloom: 'medium', tentacruel: 'medium', electrode: 'medium', crobat: 'large', steelix: 'large', tangrowth: 'medium', rhyperior: 'large',
    hitmonchan: 'medium' };
  for (const f of fodder) f.sizeClass = SIZE[f.id] || 'fodder';
  for (const f of bosses) f.sizeClass = 'boss';
  // Hitmonchan is an ace-class enemy (run + attack sheets, CC1); the others are run-only wave fodder
  for (const f of fodder) BM.addLine({ id: f.id, name: f.name, enemyOnly: true, forms: [{ ...f, runOnly: !f.aceClass, size: f.size || 1 }] });
  for (const f of bosses) BM.addLine({ id: f.id, name: f.name, enemyOnly: true, forms: [{ ...f, size: f.size || 1 }] });
  BM.ENEMY_ONLY = [...fodder, ...bosses].map((f) => f.id);
})();

// EE1 CHAIN COMPLETENESS (Phase 7.5): the canonical FORWARD evolutions of every species in the game (PokéAPI chains). In scope:
// Gen 1 stages + the cross-gen evolutions of Kanto species already adopted (Scizor, Kleavor, Porygon2/Z, Perrserker, the
// Eeveelutions, Crobat, Steelix, Tangrowth, Rhyperior). OUT by the user's standing roster rule: baby pre-evolutions (Pichu,
// Igglybuff, Cleffa, Mime Jr., Munchlax, Tyrogue) and Mr. Rime. `BM.EVO_PENDING` = canonical evolutions NOT added, each
// waiting on a user call (BUG_REGISTRY BR-068) — the chain test lists them instead of failing silently.
// Pre-evolutions are not required (enemy lines enter at the stage the waves need: Dewgong, Cloyster, Dugtrio…).
BM.EVO_CANON = {
  bulbasaur: ['ivysaur'], ivysaur: ['venusaur'], charmander: ['charmeleon'], charmeleon: ['charizard'], squirtle: ['wartortle'], wartortle: ['blastoise'],
  pikachu: ['raichu'], magikarp: ['gyarados'], gastly: ['haunter'], haunter: ['gengar'], abra: ['kadabra'], kadabra: ['alakazam'],
  machop: ['machoke'], machoke: ['machamp'], vulpix: ['ninetales'], jigglypuff: ['wigglytuff'], cubone: ['marowak'], dratini: ['dragonair'], dragonair: ['dragonite'],
  psyduck: ['golduck'], meowth: ['persian'], meowth_galar: ['perrserker'], growlithe: ['arcanine'], scyther: ['scizor', 'kleavor'],
  porygon: ['porygon2'], porygon2: ['porygon_z'], eevee: ['vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
  pidgey: ['pidgeotto'], pidgeotto: ['pidgeot'], rattata: ['raticate'], caterpie: ['metapod'], metapod: ['butterfree'],
  geodude: ['graveler'], graveler: ['golem'], zubat: ['golbat'], golbat: ['crobat'], clefairy: ['clefable'],
  diglett: ['dugtrio'], seel: ['dewgong'], shellder: ['cloyster'], oddish: ['gloom'], gloom: ['vileplume', 'bellossom'], staryu: ['starmie'], tentacool: ['tentacruel'], voltorb: ['electrode'], ekans: ['arbok'],
  koffing: ['weezing'], tangela: ['tangrowth'], rhyhorn: ['rhydon'], rhydon: ['rhyperior'], venonat: ['venomoth'], ponyta: ['rapidash'],
  onix: ['steelix'], mr_mime: [], hitmonlee: [], hitmonchan: [], snorlax: [], lapras: [], ditto: [], pinsir: [], aerodactyl: [],
  // final forms (nothing further in scope)
  bellossom: [], // EEE1 (Phase 7.6): present, Johto-gated
  venusaur: [], charizard: [], blastoise: [], raichu: [], gyarados: [], gengar: [], alakazam: [], machamp: [], ninetales: [],
  wigglytuff: [], marowak: [], vaporeon: [], dragonite: [], golduck: [], persian: [], perrserker: [], arcanine: [], scizor: [],
  kleavor: [], porygon_z: [], mewtwo: [], mew: [], articuno: [], zapdos: [], moltres: [], jolteon: [], flareon: [],
  espeon: [], umbreon: [], leafeon: [], glaceon: [], sylveon: [], pidgeot: [], arbok: [], venomoth: [], rapidash: [],
  dewgong: [], cloyster: [], dugtrio: [], raticate: [], butterfree: [], golem: [], clefable: [], tentacruel: [], electrode: [],
  crobat: [], steelix: [], tangrowth: [], rhyperior: [], starmie: [], vileplume: [], weezing: [],
};
// FFF1 (Phase 7.6): BACKWARD chain completeness — the canonical PRE-evolution of every species in the game (PokéAPI; null = a
// first stage). The 7.5 test only checked forward, so Diglett (Dugtrio's pre-evolution) slipped through. `PRE_EXCLUDED` = the
// standing roster exclusion (baby pre-evolutions). `PRE_PENDING` = gaps the backward test found that wait on art + a user call.
BM.PRE_CANON = {
  bulbasaur: null, ivysaur: 'bulbasaur', venusaur: 'ivysaur', charmander: null, charmeleon: 'charmander', charizard: 'charmeleon',
  squirtle: null, wartortle: 'squirtle', blastoise: 'wartortle', pikachu: 'pichu', raichu: 'pikachu', magikarp: null, gyarados: 'magikarp',
  gastly: null, haunter: 'gastly', gengar: 'haunter', abra: null, kadabra: 'abra', alakazam: 'kadabra', machop: null, machoke: 'machop',
  machamp: 'machoke', vulpix: null, ninetales: 'vulpix', lapras: null, jigglypuff: 'igglybuff', wigglytuff: 'jigglypuff', cubone: null,
  marowak: 'cubone', eevee: null, vaporeon: 'eevee', jolteon: 'eevee', flareon: 'eevee', espeon: 'eevee', umbreon: 'eevee', leafeon: 'eevee',
  glaceon: 'eevee', sylveon: 'eevee', snorlax: 'munchlax', dratini: null, dragonair: 'dratini', dragonite: 'dragonair', growlithe: null,
  arcanine: 'growlithe', psyduck: null, golduck: 'psyduck', meowth: null, persian: 'meowth', meowth_galar: null, perrserker: 'meowth_galar',
  scyther: null, scizor: 'scyther', kleavor: 'scyther', aerodactyl: null, ditto: null, pinsir: null, porygon: null, porygon2: 'porygon',
  porygon_z: 'porygon2', articuno: null, zapdos: null, moltres: null, mew: null, mewtwo: null,
  pidgey: null, pidgeotto: 'pidgey', pidgeot: 'pidgeotto', rattata: null, raticate: 'rattata', caterpie: null, metapod: 'caterpie',
  butterfree: 'metapod', geodude: null, graveler: 'geodude', golem: 'graveler', zubat: null, golbat: 'zubat', crobat: 'golbat',
  clefairy: 'cleffa', clefable: 'clefairy', oddish: null, gloom: 'oddish', vileplume: 'gloom', bellossom: 'gloom', staryu: null,
  starmie: 'staryu', tentacool: null, tentacruel: 'tentacool', voltorb: null, electrode: 'voltorb', ekans: null, arbok: 'ekans',
  koffing: null, weezing: 'koffing', tangela: null, tangrowth: 'tangela', rhyhorn: null, rhydon: 'rhyhorn', rhyperior: 'rhydon',
  venonat: null, venomoth: 'venonat', ponyta: null, rapidash: 'ponyta', seel: null, dewgong: 'seel', shellder: null, cloyster: 'shellder',
  hitmonlee: 'tyrogue', hitmonchan: 'tyrogue', diglett: null, dugtrio: 'diglett', onix: null, steelix: 'onix', mr_mime: 'mime_jr',
};
BM.PRE_EXCLUDED = { pichu: 'baby', igglybuff: 'baby', cleffa: 'baby', munchlax: 'baby', tyrogue: 'baby', mime_jr: 'baby' };
// III1a (Phase 8): Seel + Shellder added (user-approved, art #335/#336 + cries landed) — nothing pending.
BM.PRE_PENDING = {};
// EEE1 (Phase 7.6): Bellossom was the last pending evolution — added as its own Johto-gated line (units.js). Nothing pending.
BM.EVO_PENDING = {};
// species key of a form: branch variants share their species (every typed Eevee = eevee, Kleavor's Scyther = scyther)
BM.speciesOf = (f) => (f.line && f.line.startsWith('eevee_') && f.stage === 0 ? 'eevee' : f.id === 'scyther_kleavor' ? 'scyther' : f.id === 'oddish_bellossom' ? 'oddish' : f.id === 'gloom_bellossom' ? 'gloom' : f.id);
