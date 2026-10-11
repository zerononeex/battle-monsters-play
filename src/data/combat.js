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
    bulbasaur: ['Razor Leaf', 'leaf', 230], ivysaur: ['Razor Leaf', 'leaf', 240], venusaur: ['Petal Blizzard', 'leaf', 250],
    charmander: ['Ember', 'flame', 140], charmeleon: ['Flamethrower', 'flame', 200], charizard: ['Flamethrower', 'flame', 250],
    squirtle: ['Water Gun', 'water', 150], wartortle: ['Water Gun', 'water', 170], blastoise: ['Hydro Pump', 'water', 200],
    pikachu: ['Thunder Shock', 'bolt', 120], raichu: ['Thunderbolt', 'bolt', 160],
    magikarp: ['Splash', 'splash', 60], gyarados: ['Surf', 'water', 90],
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
    articuno: ['Blizzard', 'ice', 260], zapdos: ['Thunder', 'bolt', 260], moltres: ['Heat Wave', 'flame', 240],
    // enemy-only species
    pidgey: ['Gust', 'wing', 60], pidgeot: ['Wing Attack', 'wing', 70], rattata: ['Hyper Fang', 'fang', 60],
    caterpie: ['Bug Bite', 'fang', 60], geodude: ['Rock Throw', 'rock', 100], zubat: ['Leech Life', 'fang', 60],
    golbat: ['Wing Attack', 'wing', 60], clefairy: ['Double Slap', 'slap', 60, 2], oddish: ['Acid', 'poison', 180],
    staryu: ['Water Gun', 'water', 150], tentacool: ['Poison Sting', 'needle', 120], voltorb: ['Spark', 'spark', 60],
    ekans: ['Poison Fang', 'fang', 60], arbok: ['Poison Fang', 'fang', 60], koffing: ['Sludge', 'poison', 160],
    tangela: ['Vine Whip', 'vine', 120, 2], rhyhorn: ['Horn Attack', 'horn', 60], venonat: ['Sleep Powder', 'psy', 180],
    venomoth: ['Psybeam', 'psy', 230], mr_mime: ['Psychic', 'psy', 220], ponyta: ['Flame Wheel', 'flame', 60],
    rapidash: ['Flame Wheel', 'flame', 70], dewgong: ['Aurora Beam', 'ice', 220], cloyster: ['Spike Cannon', 'needle', 150, 3],
    hitmonlee: ['Double Kick', 'kick', 60, 2], dugtrio: ['Dig (three heads)', 'rock', 60, 3],
    onix: ['Rock Slide', 'rock', 110], starmie: ['Swift', 'star', 230], vileplume: ['Petal Blizzard', 'leaf', 220],
    weezing: ['Sludge Bomb', 'poison', 200], rhydon: ['Earthquake', 'rock', 80],
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
  // K3 AREA ATTACKS (data per form): aoe = radius in lane units of the zone around the target, in front of the attacker —
  // EVERY foe in it takes the hit (0 / missing = single-target). The old Splash trait (50% to neighbours) became this:
  // a Splash form without its own number gets 70. Bosses and legendaries carry the big ones.
  const AREA = {
    venusaur: 90, charizard: 90, ninetales: 70, gyarados: 100, magikarp: 60, lapras: 80, jigglypuff: 70, wigglytuff: 100,
    snorlax: 50, dragonite: 80, porygon_z: 80, aerodactyl: 80, kleavor: 60,
    articuno: 140, zapdos: 110, moltres: 140, mew: 100, mewtwo: 160,
    onix: 70, vileplume: 100, weezing: 110, rhydon: 120, koffing: 50, cloyster: 0,
  };
  // K4 STATUS EFFECTS (data per form): only flagged moves inflict; chances 10–25%; legendaries' signature moves are
  // reliable (1.0). freeze ❄ (Ice: stops ~2 s) · paralyze ⚡ (Electric: move + attack speed halved ~4 s) · sleep 💤
  // (Sing / Spore / powders: stops ~3 s, wakes when hit) · poison ☠ (damage over ~5 s). Bosses / legendaries take half.
  const STATUS = {
    lapras: ['freeze', 0.15], eevee_ice: ['freeze', 0.1], glaceon: ['freeze', 0.15], dewgong: ['freeze', 0.15], articuno: ['freeze', 1],
    pikachu: ['paralyze', 0.15], raichu: ['paralyze', 0.2], eevee_electric: ['paralyze', 0.1], voltorb: ['paralyze', 0.2], zapdos: ['paralyze', 1],
    jigglypuff: ['sleep', 0.2], wigglytuff: ['sleep', 0.25], venonat: ['sleep', 0.15], haunter: ['sleep', 0.1],
    oddish: ['poison', 0.2], koffing: ['poison', 0.25], weezing: ['poison', 0.25], tentacool: ['poison', 0.2], ekans: ['poison', 0.25], arbok: ['poison', 0.2],
    // Mewtwo's Psystrike freezes the whole cluster it hits — the showcase signature (design addendum K4)
    mewtwo: ['freeze', 1],
  };
  BM.STATUS = {
    freeze: { icon: '❄', name: 'Frozen', dur: 2, stop: true, color: '#bff0ff' },
    paralyze: { icon: '⚡', name: 'Paralyzed', dur: 4, slow: 0.5, color: '#ffe14a' },
    sleep: { icon: '💤', name: 'Asleep', dur: 3, stop: true, wakeOnHit: true, color: '#ffffff' },
    poison: { icon: '☠', name: 'Poisoned', dur: 5, dot: 1.0, color: '#d08cff' }, // dot = total poison damage over the duration, × the attacker's per-attack damage
  };
  BM.STATUS_BOSS_MUL = 0.5;
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
      aoe: AREA[form.id] != null ? AREA[form.id] : form.trait === 'splash' ? 70 : 0,
      status: STATUS[form.id] ? STATUS[form.id][0] : null, statusChance: STATUS[form.id] ? STATUS[form.id][1] : 0,
    };
    return (BM.COMBAT[form.id] = c);
  };
  BM.COMBAT_MOVES = MOVES; BM.COMBAT_AREA = AREA; BM.COMBAT_STATUS = STATUS;
})();

// L2 SEREBII-GROUNDED COST AUDIT (user 2026-10-11, Phase 7). Every roster form's BASE AP cost is re-derived from its real
// power, not rarity or vibes: power = HP^0.4 × DPS^0.6 at Lv 1 from the real base stats (BM.BASE_STATS via §4.2 + role +
// trait + G9 attack rate), times its extras — AREA attack (K3), STATUS (K4), dodge, Ground immunity, reach. Then
//   cost = 75 × (power / starters' power)^0.85, rounded to 5, floor 40
// so a starter costs ~75 and an evolution step (BST +~30%) costs ~+40–60% (no ×3–7 jumps). `costFix` on a form = a veto
// override. The §4.2 cost stays as `cost0` (before/after table: docs/ROLE_TRAITS.md). L1 then scales the base cost with
// level (BM.effCost, +1%/Lv, cap ×1.5).
(function () {
  BM.COST_AUDIT = { base: 75, exp: 0.85, floor: 40, step: 5 };
  BM.powerOf = function (form) {
    const st = BM.unitStats(form, 1), cb = BM.combatOf(form);
    const dps = st.dmg / st.interval;
    let extra = 1;
    if (st.aoe > 0) extra += Math.min(0.4, st.aoe / 350);                                  // area attack
    if (cb.status) extra += Math.min(0.4, cb.statusChance * (cb.status === 'poison' ? 0.8 : 1.2)); // status
    if (st.dodge) extra += st.dodge * 0.8;                                                  // dodge = effective HP
    if (st.immune) extra += 0.06;                                                           // Ground can't hit it
    extra += Math.max(0, st.range - BM.C.MELEE_RANGE) / 1500;                               // reach keeps it safe
    return Math.pow(st.hp, 0.4) * Math.pow(dps, 0.6) * extra; // damage weighs a little more than HP: a lane battle is won by pushing
  };
  let ref = 0;
  BM.auditCost = function (form) {
    const A = BM.COST_AUDIT;
    if (!ref) ref = (BM.powerOf(BM.FORMS.bulbasaur) + BM.powerOf(BM.FORMS.charmander) + BM.powerOf(BM.FORMS.squirtle)) / 3;
    if (form.costFix) return form.costFix;
    const c = A.base * Math.pow(BM.powerOf(form) / ref, A.exp);
    return Math.max(A.floor, Math.round(c / A.step) * A.step);
  };
  for (const f of Object.values(BM.FORMS)) {
    if (BM.LINES[f.line] && BM.LINES[f.line].enemyOnly) continue;
    if (f.cost0 == null) f.cost0 = f.cost;
  }
  for (const f of Object.values(BM.FORMS)) if (f.cost0 != null) f.cost = BM.auditCost(f);
})();

// Q1 COST CAP — the kids' fun rule (user ruling 2026-10-11; SUPERSEDES the L2 audit's absolute scale, its power ordering
// survives INSIDE the bands). Base (Lv 1) cost bands: fodder basics 40–60 · standard basics 60–75 (anchor Squirtle 75) ·
// stage-1 evolutions 75–85 (anchor Wartortle 85) · stage-2 evolutions + strong singles 85–95 (anchor Blastoise 90–95) ·
// legendaries 100–120. Inside a band the L2 audited price (`costAudit`) decides: legendaries spread over the band by it,
// the others are the audit scaled to the band's anchor and clamped into it (so steps inside a line are ≈ +10). L1 then
// scales gently with level, and the EFFECTIVE cost is HARD-CAPPED at 150 AP at any level (BM.effCost, constants.js).
// "Fodder basics" = base forms of the weakest species (real BST < 305: Magikarp, Jigglypuff, Ditto, Meowth, Vulpix, Dratini…).
(function () {
  BM.COST_BANDS = {
    fodder: { lo: 40, hi: 60, name: 'Fodder basic' }, basic: { lo: 60, hi: 75, k: 1, name: 'Standard basic' },
    stage1: { lo: 75, hi: 85, k: 0.85, name: 'Stage-1 evolution' }, stage2: { lo: 85, hi: 95, k: 0.62, name: 'Stage-2 / strong single' },
    legend: { lo: 100, hi: 120, name: 'Legendary' },
  };
  BM.costBand = function (f) {
    const line = BM.LINES[f.line];
    if (line.legendary) return 'legend';
    if (line.forms.length === 1) return f.bst < 305 ? 'fodder' : 'stage2';
    if (f.stage === 0) return f.bst < 305 ? 'fodder' : 'basic';
    return f.stage === 1 ? 'stage1' : 'stage2';
  };
  const forms = Object.values(BM.FORMS).filter((f) => f.cost0 != null);
  for (const f of forms) f.costAudit = f.cost; // the L2 price (power ordering)
  const r5 = (x) => Math.round(x / 5) * 5;
  const span = (band) => { const a = forms.filter((f) => BM.costBand(f) === band).map((f) => f.costAudit); return [Math.min(...a), Math.max(...a)]; };
  const S = { fodder: span('fodder'), legend: span('legend') };
  for (const f of forms) {
    if (f.costFix) { f.cost = f.costFix; continue; }
    const b = BM.costBand(f), B = BM.COST_BANDS[b];
    let c;
    if (b === 'fodder' || b === 'legend') { const [lo, hi] = S[b]; c = B.lo + (hi > lo ? (f.costAudit - lo) / (hi - lo) : 1) * (B.hi - B.lo); }
    else c = f.costAudit * B.k;
    f.cost = Math.max(B.lo, Math.min(B.hi, r5(c)));
  }
})();
