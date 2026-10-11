// G9 STATS-DRIVEN COMBAT IDENTITY (Phase 5; design addendum G9). Every form's battle behaviour as DATA, derived from its
// REAL base stats (BM.BASE_STATS, PokéAPI; Serebii cross-check) plus a species-flavoured signature move:
//   march speed   from Speed — 20 + Speed × 0.4 lane units/s (§4.2, unchanged: Pikachu 56 > Charmander 46 > Bulbasaur 38
//                 ≈ Squirtle 37 — the REAL stats put Squirtle (43) two points below Bulbasaur (45); see ROLE_TRAITS.md)
//   attack rate   from Speed — interval × (55 / Speed)^0.3, clamped 0.8–1.25 (55 ≈ the starters' average, so the
//                 envelope stays where §4.2 put it: fast species attack more often, slow ones less)
//   melee/ranged  from the move: a special attacker (Sp. Atk ≥ Attack + 10) defaults to RANGED, a physical one to MELEE;
//                 the signature move below can override it. `reach` in lane units (melee 60; breath / water gun ~140–170;
//                 leaf / thunder ~170–240; beams 250+). Sniper trait still multiplies it.
//   hits          hits per attack animation (Fury Swipes 3, Double Kick 2, Machamp's four arms 4…). The attack's damage
//                 is SPLIT across the hits — identity changes HOW they fight, not how hard (§4.2 envelope).
//   delay         seconds between attacks (= the resulting interval, written into the ROLE_TRAITS table)
//   element + fx  element = the form's attackType; fx = the visual the renderer draws (flame, leaf, water, bolt, …), or
//                 the generated sprite assets/effects/moves/<fx>.png once its ASSET_PROMPTS entry is DONE.
// Change a row = change the data. Kakashi owns balancing; user veto pass before Phase 8 locks the numbers.
window.BM = window.BM || {};
(function () {
  // form: [move name, fx, reach (60 = melee), hits]
  const MOVES = {
    bulbasaur: ['Razor Leaf', 'leaf', 230], ivysaur: ['Razor Leaf', 'leaf', 240], venusaur: ['Solar Beam', 'beam', 270],
    charmander: ['Ember', 'flame', 140], charmeleon: ['Flamethrower', 'flame', 200], charizard: ['Flamethrower', 'flame', 250],
    squirtle: ['Water Gun', 'water', 150], wartortle: ['Water Gun', 'water', 170], blastoise: ['Hydro Pump', 'water', 200],
    pikachu: ['Thunder Shock', 'bolt', 120], raichu: ['Thunderbolt', 'bolt', 160],
    magikarp: ['Splash', 'splash', 60], gyarados: ['Waterfall', 'water', 70],
    gastly: ['Night Shade', 'shadow', 120], haunter: ['Shadow Ball', 'shadow', 140], gengar: ['Shadow Ball', 'shadow', 230],
    abra: ['Confusion', 'psy', 230], kadabra: ['Psybeam', 'psy', 240], alakazam: ['Psychic', 'psy', 260],
    machop: ['Karate Chop', 'punch', 60], machoke: ['Karate Chop', 'punch', 60], machamp: ['Dynamic Punch ×4 arms', 'punch', 60, 4],
    vulpix: ['Ember', 'flame', 140], ninetales: ['Flamethrower', 'flame', 200],
    lapras: ['Ice Beam', 'ice', 250],
    jigglypuff: ['Sing', 'sing', 120], wigglytuff: ['Hyper Voice', 'sing', 160],
    cubone: ['Bonemerang', 'bone', 150, 2], marowak: ['Bonemerang', 'bone', 170, 2],
    eevee_water: ['Water Gun', 'water', 150], vaporeon: ['Hydro Pump', 'water', 220],
    eevee_electric: ['Thunder Shock', 'bolt', 150], jolteon: ['Pin Missile', 'needle', 200, 3],
    eevee_fire: ['Ember', 'flame', 140], flareon: ['Fire Fang', 'fang', 60],
    eevee_psychic: ['Confusion', 'psy', 200], espeon: ['Psychic', 'psy', 260],
    eevee_dark: ['Bite', 'fang', 60], umbreon: ['Bite', 'fang', 60],
    eevee_grass: ['Razor Leaf', 'leaf', 200], leafeon: ['Leaf Blade', 'slash', 60],
    eevee_ice: ['Ice Shard', 'ice', 150], glaceon: ['Ice Beam', 'ice', 240],
    eevee_fairy: ['Fairy Wind', 'fairy', 170], sylveon: ['Moonblast', 'fairy', 230],
    snorlax: ['Body Slam', 'slam', 60],
    dratini: ['Dragon Tail', 'dragon', 60], dragonair: ['Dragon Tail', 'dragon', 70], dragonite: ['Outrage', 'dragon', 70],
    growlithe: ['Fire Fang', 'fang', 60], arcanine: ['Fire Fang', 'fang', 70],
    psyduck: ['Water Gun', 'water', 150], golduck: ['Hydro Pump', 'water', 200],
    meowth: ['Fury Swipes', 'slash', 60, 3], persian: ['Fury Swipes', 'slash', 60, 3],
    meowth_galar: ['Fury Swipes', 'slash', 60, 3], perrserker: ['Metal Claw', 'slash', 60, 2],
    ditto: ['Tackle', 'slam', 60],
    pinsir: ['Vice Grip', 'slash', 60],
    scyther: ['Fury Cutter', 'slash', 60, 2], scizor: ['Bullet Punch', 'punch', 60, 2],
    scyther_kleavor: ['Fury Cutter', 'slash', 60, 2], kleavor: ['Stone Axe', 'rock', 70],
    porygon: ['Tri Attack', 'beam', 220], porygon2: ['Tri Attack', 'beam', 230], porygon_z: ['Hyper Beam', 'beam', 260],
    aerodactyl: ['Rock Slide', 'rock', 90],
    mewtwo: ['Psystrike', 'psy', 280], mew: ['Psychic', 'psy', 260],
    articuno: ['Ice Beam', 'ice', 260], zapdos: ['Thunder', 'bolt', 260], moltres: ['Heat Wave', 'flame', 240],
    // enemy-only species
    pidgey: ['Gust', 'wing', 60], pidgeot: ['Wing Attack', 'wing', 70], rattata: ['Hyper Fang', 'fang', 60],
    caterpie: ['Bug Bite', 'fang', 60], geodude: ['Rock Throw', 'rock', 100], zubat: ['Leech Life', 'fang', 60],
    golbat: ['Wing Attack', 'wing', 60], clefairy: ['Double Slap', 'slap', 60, 2], oddish: ['Acid', 'poison', 180],
    staryu: ['Water Gun', 'water', 150], tentacool: ['Poison Sting', 'needle', 120], voltorb: ['Spark', 'spark', 60],
    ekans: ['Poison Fang', 'fang', 60], arbok: ['Crunch', 'fang', 60], koffing: ['Sludge', 'poison', 160],
    tangela: ['Vine Whip', 'vine', 120, 2], rhyhorn: ['Horn Attack', 'horn', 60], venonat: ['Psybeam', 'psy', 200],
    venomoth: ['Psybeam', 'psy', 230], mr_mime: ['Psychic', 'psy', 220], ponyta: ['Flame Wheel', 'flame', 60],
    rapidash: ['Flame Wheel', 'flame', 70], dewgong: ['Aurora Beam', 'ice', 220], cloyster: ['Spike Cannon', 'needle', 150, 3],
    hitmonlee: ['Double Kick', 'kick', 60, 2], dugtrio: ['Dig (three heads)', 'rock', 60, 3],
    onix: ['Rock Throw', 'rock', 110], starmie: ['Swift', 'star', 230], vileplume: ['Petal Blizzard', 'leaf', 220],
    weezing: ['Sludge Bomb', 'poison', 200], rhydon: ['Horn Drill', 'horn', 70],
  };
  // How each visual is drawn when its move sprite is not generated yet: projectile (flies), stream (attacker -> target
  // at once), or melee (a burst on the target).
  BM.FX_KINDS = {
    leaf: 'projectile', bone: 'projectile', shadow: 'projectile', rock: 'projectile', star: 'projectile', needle: 'projectile',
    ice: 'projectile', poison: 'projectile', fairy: 'projectile', psy: 'projectile', sing: 'projectile',
    flame: 'stream', water: 'stream', beam: 'stream', bolt: 'stream', vine: 'stream',
    punch: 'melee', fang: 'melee', slash: 'melee', slam: 'melee', kick: 'melee', horn: 'melee', slap: 'melee', spark: 'melee',
    dragon: 'melee', splash: 'melee', wing: 'melee',
  };
  BM.COMBAT = {};
  BM.combatOf = function (form) {
    if (BM.COMBAT[form.id]) return BM.COMBAT[form.id];
    const bs = (BM.BASE_STATS && BM.BASE_STATS[form.id]) || [form.baseHP, 50, 50, 50, 50, form.baseSpe];
    const spe = bs[5], special = bs[3] >= bs[1] + 10;
    const m = MOVES[form.id] || [special ? 'Special attack' : 'Tackle', special ? 'psy' : 'slam', special ? 200 : 60];
    const reach = m[2], fx = m[1];
    const c = {
      move: m[0], fx, kind: BM.FX_KINDS[fx] || 'melee', element: form.attackType || form.types[0],
      style: reach > BM.C.MELEE_RANGE ? 'ranged' : 'melee', reach, hits: m[3] || 1,
      special, // Sp. Atk vs Attack flavour (shown on the detail page)
      rateMul: Math.max(0.8, Math.min(1.25, Math.pow(55 / Math.max(1, spe), 0.3))),
    };
    return (BM.COMBAT[form.id] = c);
  };
  BM.COMBAT_MOVES = MOVES;
})();
