// HOENN CHAIN COMPLETENESS (Hoenn build Act 1; EE1 forward + FFF1 backward, extended to the combined Kanto + Johto + Hoenn
// roster). PokéAPI / Showdown evolution chains (prep pack report §2), with the game's standing calls:
//   - babies stay excluded (BM.PRE_EXCLUDED): Azurill / Wynaut already are (Johto); the Gen 4 Hoenn-line babies Budew (→ Roselia,
//     U3: Budew OUT) and Chingling (→ Chimecho) join them
//   - Gen 4 forward forms are in (the EE1 precedent): Gallade, Dusknoir, Froslass, Roserade, Probopass, + Magnezone (support)
//   - Ralts's Gallade branch: the ralts_gallade line's base variants are Ralts / Kirlia (species keys ralts / kirlia — the Kanto
//     branch-base rule: a Kleavor-line Scyther is a Scyther), so Kirlia → Gardevoir + Gallade. Their own keys are charted too.
//   - the enemy branch bases (wurmple_dustox, nincada_shedinja, snorunt_froslass, clamperl_gorebyss) are not forms: waves use
//     the canon base, and Wurmple → Silcoon / Cascoon, Nincada → Ninjask / Shedinja, Snorunt → Glalie / Froslass, Clamperl →
//     Huntail / Gorebyss are chain data here
//   - Galarian Zigzagoon / Linoone → Obstagoon wait for Galar (regional variants arrive with their home region, WW1)
window.BM = window.BM || {};
Object.assign(BM.EVO_CANON, {
  treecko: ['grovyle'], grovyle: ['sceptile'], sceptile: [], torchic: ['combusken'], combusken: ['blaziken'], blaziken: [],
  mudkip: ['marshtomp'], marshtomp: ['swampert'], swampert: [], ralts: ['kirlia'], kirlia: ['gardevoir', 'gallade'], gardevoir: [],
  ralts_gallade: ['kirlia_gallade'], kirlia_gallade: ['gallade'], gallade: [], sableye: [], mawile: [],
  aron: ['lairon'], lairon: ['aggron'], aggron: [], meditite: ['medicham'], medicham: [], electrike: ['manectric'], manectric: [],
  plusle: [], minun: [], carvanha: ['sharpedo'], sharpedo: [], wailmer: ['wailord'], wailord: [], spoink: ['grumpig'], grumpig: [],
  trapinch: ['vibrava'], vibrava: ['flygon'], flygon: [], cacnea: ['cacturne'], cacturne: [], swablu: ['altaria'], altaria: [],
  barboach: ['whiscash'], whiscash: [], corphish: ['crawdaunt'], crawdaunt: [], feebas: ['milotic'], milotic: [],
  shuppet: ['banette'], banette: [], duskull: ['dusclops'], dusclops: ['dusknoir'], dusknoir: [], absol: [],
  spheal: ['sealeo'], sealeo: ['walrein'], walrein: [], bagon: ['shelgon'], shelgon: ['salamence'], salamence: [],
  beldum: ['metang'], metang: ['metagross'], metagross: [], groudon: [], latios: [], regirock: [], registeel: [], jirachi: [],
  kyogre: [], latias: [], regice: [], deoxys: [], rayquaza: [],
  poochyena: ['mightyena'], mightyena: [], zigzagoon: ['linoone'], linoone: [], wurmple: ['silcoon', 'cascoon'], silcoon: ['beautifly'],
  beautifly: [], cascoon: ['dustox'], dustox: [], lotad: ['lombre'], lombre: ['ludicolo'], ludicolo: [], seedot: ['nuzleaf'],
  nuzleaf: ['shiftry'], shiftry: [], taillow: ['swellow'], swellow: [], wingull: ['pelipper'], pelipper: [], surskit: ['masquerain'],
  masquerain: [], shroomish: ['breloom'], breloom: [], slakoth: ['vigoroth'], vigoroth: ['slaking'], slaking: [],
  nincada: ['ninjask', 'shedinja'], ninjask: [], shedinja: [], whismur: ['loudred'], loudred: ['exploud'], exploud: [],
  makuhita: ['hariyama'], hariyama: [], nosepass: ['probopass'], probopass: [], skitty: ['delcatty'], delcatty: [],
  gulpin: ['swalot'], swalot: [], numel: ['camerupt'], camerupt: [], torkoal: [], spinda: [], zangoose: [], seviper: [],
  lunatone: [], solrock: [], baltoy: ['claydol'], claydol: [], lileep: ['cradily'], cradily: [], anorith: ['armaldo'], armaldo: [],
  castform: [], kecleon: [], tropius: [], chimecho: [], snorunt: ['glalie', 'froslass'], glalie: [], froslass: [],
  clamperl: ['huntail', 'gorebyss'], huntail: [], gorebyss: [], relicanth: [], luvdisc: [], roselia: ['roserade'], roserade: [],
  volbeat: [], illumise: [], magnemite: ['magneton'], magneton: ['magnezone'], magnezone: [], goldeen: ['seaking'], seaking: [],
});
Object.assign(BM.PRE_CANON, {
  treecko: null, grovyle: 'treecko', sceptile: 'grovyle', torchic: null, combusken: 'torchic', blaziken: 'combusken',
  mudkip: null, marshtomp: 'mudkip', swampert: 'marshtomp', ralts: null, kirlia: 'ralts', gardevoir: 'kirlia',
  ralts_gallade: null, kirlia_gallade: 'ralts_gallade', gallade: 'kirlia', sableye: null, mawile: null,
  aron: null, lairon: 'aron', aggron: 'lairon', meditite: null, medicham: 'meditite', electrike: null, manectric: 'electrike',
  plusle: null, minun: null, carvanha: null, sharpedo: 'carvanha', wailmer: null, wailord: 'wailmer', spoink: null, grumpig: 'spoink',
  trapinch: null, vibrava: 'trapinch', flygon: 'vibrava', cacnea: null, cacturne: 'cacnea', swablu: null, altaria: 'swablu',
  barboach: null, whiscash: 'barboach', corphish: null, crawdaunt: 'corphish', feebas: null, milotic: 'feebas',
  shuppet: null, banette: 'shuppet', duskull: null, dusclops: 'duskull', dusknoir: 'dusclops', absol: null,
  spheal: null, sealeo: 'spheal', walrein: 'sealeo', bagon: null, shelgon: 'bagon', salamence: 'shelgon',
  beldum: null, metang: 'beldum', metagross: 'metang', groudon: null, latios: null, regirock: null, registeel: null, jirachi: null,
  kyogre: null, latias: null, regice: null, deoxys: null, rayquaza: null,
  poochyena: null, mightyena: 'poochyena', zigzagoon: null, linoone: 'zigzagoon', wurmple: null, silcoon: 'wurmple',
  beautifly: 'silcoon', cascoon: 'wurmple', dustox: 'cascoon', lotad: null, lombre: 'lotad', ludicolo: 'lombre', seedot: null,
  nuzleaf: 'seedot', shiftry: 'nuzleaf', taillow: null, swellow: 'taillow', wingull: null, pelipper: 'wingull', surskit: null,
  masquerain: 'surskit', shroomish: null, breloom: 'shroomish', slakoth: null, vigoroth: 'slakoth', slaking: 'vigoroth',
  nincada: null, ninjask: 'nincada', shedinja: 'nincada', whismur: null, loudred: 'whismur', exploud: 'loudred',
  makuhita: null, hariyama: 'makuhita', nosepass: null, probopass: 'nosepass', skitty: null, delcatty: 'skitty',
  gulpin: null, swalot: 'gulpin', numel: null, camerupt: 'numel', torkoal: null, spinda: null, zangoose: null, seviper: null,
  lunatone: null, solrock: null, baltoy: null, claydol: 'baltoy', lileep: null, cradily: 'lileep', anorith: null, armaldo: 'anorith',
  castform: null, kecleon: null, tropius: null, chimecho: 'chingling', snorunt: null, glalie: 'snorunt', froslass: 'snorunt',
  clamperl: null, huntail: 'clamperl', gorebyss: 'clamperl', relicanth: null, luvdisc: null, roselia: 'budew', roserade: 'roselia',
  volbeat: null, illumise: null, magnemite: null, magneton: 'magnemite', magnezone: 'magneton', goldeen: null, seaking: 'goldeen',
});
// the Gen 4 babies of Hoenn lines join the standing exclusion (prep report §2, U3)
Object.assign(BM.PRE_EXCLUDED, { budew: 'baby', chingling: 'baby' });
// species key overrides: the Gallade line's base variants ARE Ralts / Kirlia (shared art + cry; the scyther_kleavor / oddish_bellossom
// rule), so the chain sees one Ralts → Kirlia → Gardevoir / Gallade family (BM.speciesOf reads `speciesId`, johto_chain.js)
BM.FORMS.ralts_gallade.speciesId = 'ralts';
BM.FORMS.kirlia_gallade.speciesId = 'kirlia';
