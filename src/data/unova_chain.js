// UNOVA CHAIN COMPLETENESS (Sinnoh + Unova prompt Act 2 U-S2; EE1 forward + FFF1 backward over the combined five-region roster).
// GENERATED from docs/unova-prep/species-data.csv (`evolves_from`, PokéAPI) — the pack's mechanical check: 156 Gen 5 species, no Gen 1–4
// → Gen 5 link, Gen 5 has no babies. The game's standing calls:
//   - U5 landings: the Hisuian Samurott / Braviary / Lilligant branches start from their own typed base variants, whose species keys ARE
//     Oshawott / Dewott, Rufflet and Petilil (shared art + cry, C8 — the Gallade-branch rule), so Dewott → Samurott + Hisuian Samurott,
//     Rufflet → Braviary + Hisuian Braviary, Petilil → Lilligant + Hisuian Lilligant. Hisuian Zorua is its own base (→ Hisuian Zoroark).
//   - Basculegion evolves from WHITE-Striped Basculin (its own species key, a player line); Red-Striped Basculin has no evolution.
//   - Kingambit (Gen 9) is Bisharp's forward form (Leader's Crest, Lv 36 floor).
//   - Held, correctly (home region Galar): Galarian Yamask → Runerigus, Galarian Darumaka / Darmanitan, Galarian Stunfisk.
window.BM = window.BM || {};
Object.assign(BM.EVO_CANON, {
  snivy: ['servine'], servine: ['serperior'], serperior: [], tepig: ['pignite'], pignite: ['emboar'], emboar: [], oshawott: ['dewott'], dewott: ['samurott', 'samurott_hisui'],
  samurott: [], samurott_hisui: [], zorua: ['zoroark'], zoroark: [], zorua_hisui: ['zoroark_hisui'], zoroark_hisui: [], joltik: ['galvantula'], galvantula: [],
  drilbur: ['excadrill'], excadrill: [], scraggy: ['scrafty'], scrafty: [], golett: ['golurk'], golurk: [], deino: ['zweilous'], zweilous: ['hydreigon'],
  hydreigon: [], larvesta: ['volcarona'], volcarona: [], vullaby: ['mandibuzz'], mandibuzz: [], cottonee: ['whimsicott'], whimsicott: [], timburr: ['gurdurr'],
  gurdurr: ['conkeldurr'], conkeldurr: [], pawniard: ['bisharp'], bisharp: ['kingambit'], kingambit: [], archen: ['archeops'], archeops: [], litwick: ['lampent'],
  lampent: ['chandelure'], chandelure: [], tynamo: ['eelektrik'], eelektrik: ['eelektross'], eelektross: [], venipede: ['whirlipede'], whirlipede: ['scolipede'], scolipede: [],
  audino: [], axew: ['fraxure'], fraxure: ['haxorus'], haxorus: [], rufflet: ['braviary', 'braviary_hisui'], braviary: [], braviary_hisui: [], petilil: ['lilligant', 'lilligant_hisui'],
  lilligant: [], lilligant_hisui: [], sandile: ['krokorok'], krokorok: ['krookodile'], krookodile: [], tirtouga: ['carracosta'], carracosta: [], emolga: [],
  reshiram: [], tornadus: [], cobalion: [], terrakion: [], victini: [], meloetta: [], zekrom: [], thundurus: [],
  virizion: [], landorus: [], keldeo: [], genesect: [], kyurem: [], patrat: ['watchog'], watchog: [], lillipup: ['herdier'],
  herdier: ['stoutland'], stoutland: [], purrloin: ['liepard'], liepard: [], pansage: ['simisage'], simisage: [], pansear: ['simisear'], simisear: [],
  panpour: ['simipour'], simipour: [], munna: ['musharna'], musharna: [], pidove: ['tranquill'], tranquill: ['unfezant'], unfezant: [], blitzle: ['zebstrika'],
  zebstrika: [], roggenrola: ['boldore'], boldore: ['gigalith'], gigalith: [], woobat: ['swoobat'], swoobat: [], tympole: ['palpitoad'], palpitoad: ['seismitoad'],
  seismitoad: [], throh: [], sawk: [], sewaddle: ['swadloon'], swadloon: ['leavanny'], leavanny: [], basculin: [], basculin_white_striped: ['basculegion'],
  basculegion: [], darumaka: ['darmanitan'], darmanitan: [], maractus: [], dwebble: ['crustle'], crustle: [], sigilyph: [], yamask: ['cofagrigus'],
  cofagrigus: [], trubbish: ['garbodor'], garbodor: [], minccino: ['cinccino'], cinccino: [], gothita: ['gothorita'], gothorita: ['gothitelle'], gothitelle: [],
  solosis: ['duosion'], duosion: ['reuniclus'], reuniclus: [], ducklett: ['swanna'], swanna: [], vanillite: ['vanillish'], vanillish: ['vanilluxe'], vanilluxe: [],
  deerling: ['sawsbuck'], sawsbuck: [], karrablast: ['escavalier'], escavalier: [], shelmet: ['accelgor'], accelgor: [], foongus: ['amoonguss'], amoonguss: [],
  frillish: ['jellicent'], jellicent: [], alomomola: [], ferroseed: ['ferrothorn'], ferrothorn: [], klink: ['klang'], klang: ['klinklang'], klinklang: [],
  elgyem: ['beheeyem'], beheeyem: [], cubchoo: ['beartic'], beartic: [], cryogonal: [], stunfisk: [], mienfoo: ['mienshao'], mienshao: [],
  druddigon: [], bouffalant: [], heatmor: [], durant: [],
});
Object.assign(BM.PRE_CANON, {
  snivy: null, servine: 'snivy', serperior: 'servine', tepig: null, pignite: 'tepig', emboar: 'pignite', oshawott: null, dewott: 'oshawott',
  samurott: 'dewott', samurott_hisui: 'dewott', zorua: null, zoroark: 'zorua', zorua_hisui: null, zoroark_hisui: 'zorua_hisui', joltik: null, galvantula: 'joltik',
  drilbur: null, excadrill: 'drilbur', scraggy: null, scrafty: 'scraggy', golett: null, golurk: 'golett', deino: null, zweilous: 'deino',
  hydreigon: 'zweilous', larvesta: null, volcarona: 'larvesta', vullaby: null, mandibuzz: 'vullaby', cottonee: null, whimsicott: 'cottonee', timburr: null,
  gurdurr: 'timburr', conkeldurr: 'gurdurr', pawniard: null, bisharp: 'pawniard', kingambit: 'bisharp', archen: null, archeops: 'archen', litwick: null,
  lampent: 'litwick', chandelure: 'lampent', tynamo: null, eelektrik: 'tynamo', eelektross: 'eelektrik', venipede: null, whirlipede: 'venipede', scolipede: 'whirlipede',
  audino: null, axew: null, fraxure: 'axew', haxorus: 'fraxure', rufflet: null, braviary: 'rufflet', braviary_hisui: 'rufflet', petilil: null,
  lilligant: 'petilil', lilligant_hisui: 'petilil', sandile: null, krokorok: 'sandile', krookodile: 'krokorok', tirtouga: null, carracosta: 'tirtouga', emolga: null,
  reshiram: null, tornadus: null, cobalion: null, terrakion: null, victini: null, meloetta: null, zekrom: null, thundurus: null,
  virizion: null, landorus: null, keldeo: null, genesect: null, kyurem: null, patrat: null, watchog: 'patrat', lillipup: null,
  herdier: 'lillipup', stoutland: 'herdier', purrloin: null, liepard: 'purrloin', pansage: null, simisage: 'pansage', pansear: null, simisear: 'pansear',
  panpour: null, simipour: 'panpour', munna: null, musharna: 'munna', pidove: null, tranquill: 'pidove', unfezant: 'tranquill', blitzle: null,
  zebstrika: 'blitzle', roggenrola: null, boldore: 'roggenrola', gigalith: 'boldore', woobat: null, swoobat: 'woobat', tympole: null, palpitoad: 'tympole',
  seismitoad: 'palpitoad', throh: null, sawk: null, sewaddle: null, swadloon: 'sewaddle', leavanny: 'swadloon', basculin: null, basculin_white_striped: null,
  basculegion: 'basculin_white_striped', darumaka: null, darmanitan: 'darumaka', maractus: null, dwebble: null, crustle: 'dwebble', sigilyph: null, yamask: null,
  cofagrigus: 'yamask', trubbish: null, garbodor: 'trubbish', minccino: null, cinccino: 'minccino', gothita: null, gothorita: 'gothita', gothitelle: 'gothorita',
  solosis: null, duosion: 'solosis', reuniclus: 'duosion', ducklett: null, swanna: 'ducklett', vanillite: null, vanillish: 'vanillite', vanilluxe: 'vanillish',
  deerling: null, sawsbuck: 'deerling', karrablast: null, escavalier: 'karrablast', shelmet: null, accelgor: 'shelmet', foongus: null, amoonguss: 'foongus',
  frillish: null, jellicent: 'frillish', alomomola: null, ferroseed: null, ferrothorn: 'ferroseed', klink: null, klang: 'klink', klinklang: 'klang',
  elgyem: null, beheeyem: 'elgyem', cubchoo: null, beartic: 'cubchoo', cryogonal: null, stunfisk: null, mienfoo: null, mienshao: 'mienfoo',
  druddigon: null, bouffalant: null, heatmor: null, durant: null,
});
// species key overrides: the branch bases ARE their canon species (shared art + cry, C8)
for (const [id, sp] of [['oshawott_samurott_hisui', 'oshawott'], ['dewott_samurott_hisui', 'dewott'], ['rufflet_braviary_hisui', 'rufflet'], ['petilil_lilligant_hisui', 'petilil']]) BM.FORMS[id].speciesId = sp;
