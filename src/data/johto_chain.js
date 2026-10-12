// JOHTO CHAIN COMPLETENESS (Johto prompt Step 2; EE1 forward + FFF1 backward, extended to the combined Kanto + Johto roster).
// PokéAPI evolution chains, with the game's standing calls: babies stay excluded (BM.PRE_EXCLUDED); regional branch bases are
// their own species keys (wooper_paldea → clodsire, sneasel_hisui → sneasler, corsola_galar → cursola); Johto Corsola and Johto
// Qwilfish have NO in-game evolution (Cursola / Overqwil evolve only from the Galarian / Hisuian forms — UUU1 F3; Hisuian
// Qwilfish is not in the game, so Overqwil is parked and its queued sheet #537 is unused).
window.BM = window.BM || {};
Object.assign(BM.EVO_CANON, {
  cyndaquil: ['quilava'], quilava: ['typhlosion'], typhlosion: [], totodile: ['croconaw'], croconaw: ['feraligatr'], feraligatr: [],
  chikorita: ['bayleef'], bayleef: ['meganium'], meganium: [], togepi: ['togetic'], togetic: ['togekiss'], togekiss: [],
  marill: ['azumarill'], azumarill: [], wooper: ['quagsire'], quagsire: [], wooper_paldea: ['clodsire'], clodsire: [],
  murkrow: ['honchkrow'], honchkrow: [], misdreavus: ['mismagius'], mismagius: [], wobbuffet: [], girafarig: ['farigiraf'], farigiraf: [],
  pineco: ['forretress'], forretress: [], dunsparce: ['dudunsparce'], dudunsparce: [], snubbull: ['granbull'], granbull: [], shuckle: [],
  sneasel: ['weavile'], weavile: [], sneasel_hisui: ['sneasler'], sneasler: [], teddiursa: ['ursaring'], ursaring: ['ursaluna'], ursaluna: [],
  slugma: ['magcargo'], magcargo: [], swinub: ['piloswine'], piloswine: ['mamoswine'], mamoswine: [], corsola: [], corsola_galar: ['cursola'], cursola: [],
  delibird: [], houndour: ['houndoom'], houndoom: [], phanpy: ['donphan'], donphan: [], smeargle: [],
  elekid: ['electabuzz'], electabuzz: ['electivire'], electivire: [], magby: ['magmar'], magmar: ['magmortar'], magmortar: [],
  larvitar: ['pupitar'], pupitar: ['tyranitar'], tyranitar: [], celebi: [], raikou: [], entei: [], suicune: [], ho_oh: [], lugia: [],
  sentret: ['furret'], furret: [], hoothoot: ['noctowl'], noctowl: [], ledyba: ['ledian'], ledian: [], spinarak: ['ariados'], ariados: [],
  chinchou: ['lanturn'], lanturn: [], natu: ['xatu'], xatu: [], mareep: ['flaaffy'], flaaffy: ['ampharos'], ampharos: [], sudowoodo: [],
  poliwag: ['poliwhirl'], poliwhirl: ['poliwrath', 'politoed'], poliwrath: [], politoed: [], hoppip: ['skiploom'], skiploom: ['jumpluff'], jumpluff: [],
  aipom: ['ambipom'], ambipom: [], sunkern: ['sunflora'], sunflora: [], yanma: ['yanmega'], yanmega: [], unown: [],
  slowpoke: ['slowbro', 'slowking'], slowbro: [], slowking: [], gligar: ['gliscor'], gliscor: [], qwilfish: [], heracross: [],
  remoraid: ['octillery'], octillery: [], mantine: [], skarmory: [], horsea: ['seadra'], seadra: ['kingdra'], kingdra: [],
  stantler: ['wyrdeer'], wyrdeer: [], hitmontop: [], smoochum: ['jynx'], jynx: [], miltank: [], chansey: ['blissey'], blissey: [],
});
Object.assign(BM.PRE_CANON, {
  cyndaquil: null, quilava: 'cyndaquil', typhlosion: 'quilava', totodile: null, croconaw: 'totodile', feraligatr: 'croconaw',
  chikorita: null, bayleef: 'chikorita', meganium: 'bayleef', togepi: null, togetic: 'togepi', togekiss: 'togetic',
  marill: 'azurill', azumarill: 'marill', wooper: null, quagsire: 'wooper', wooper_paldea: null, clodsire: 'wooper_paldea',
  murkrow: null, honchkrow: 'murkrow', misdreavus: null, mismagius: 'misdreavus', wobbuffet: 'wynaut', girafarig: null, farigiraf: 'girafarig',
  pineco: null, forretress: 'pineco', dunsparce: null, dudunsparce: 'dunsparce', snubbull: null, granbull: 'snubbull', shuckle: null,
  sneasel: null, weavile: 'sneasel', sneasel_hisui: null, sneasler: 'sneasel_hisui', teddiursa: null, ursaring: 'teddiursa', ursaluna: 'ursaring',
  slugma: null, magcargo: 'slugma', swinub: null, piloswine: 'swinub', mamoswine: 'piloswine', corsola: null, corsola_galar: null, cursola: 'corsola_galar',
  delibird: null, houndour: null, houndoom: 'houndour', phanpy: null, donphan: 'phanpy', smeargle: null,
  elekid: null, electabuzz: 'elekid', electivire: 'electabuzz', magby: null, magmar: 'magby', magmortar: 'magmar',
  larvitar: null, pupitar: 'larvitar', tyranitar: 'pupitar', celebi: null, raikou: null, entei: null, suicune: null, ho_oh: null, lugia: null,
  sentret: null, furret: 'sentret', hoothoot: null, noctowl: 'hoothoot', ledyba: null, ledian: 'ledyba', spinarak: null, ariados: 'spinarak',
  chinchou: null, lanturn: 'chinchou', natu: null, xatu: 'natu', mareep: null, flaaffy: 'mareep', ampharos: 'flaaffy', sudowoodo: 'bonsly',
  poliwag: null, poliwhirl: 'poliwag', poliwrath: 'poliwhirl', politoed: 'poliwhirl', hoppip: null, skiploom: 'hoppip', jumpluff: 'skiploom',
  aipom: null, ambipom: 'aipom', sunkern: null, sunflora: 'sunkern', yanma: null, yanmega: 'yanma', unown: null,
  slowpoke: null, slowbro: 'slowpoke', slowking: 'slowpoke', gligar: null, gliscor: 'gligar', qwilfish: null, heracross: null,
  remoraid: null, octillery: 'remoraid', mantine: 'mantyke', skarmory: null, horsea: null, seadra: 'horsea', kingdra: 'seadra',
  stantler: null, wyrdeer: 'stantler', hitmontop: 'tyrogue', smoochum: null, jynx: 'smoochum', miltank: null, chansey: 'happiny', blissey: 'chansey',
});
// the later-gen babies of Johto lines join the standing exclusion (prep report §2)
Object.assign(BM.PRE_EXCLUDED, { azurill: 'baby', wynaut: 'baby', bonsly: 'baby', mantyke: 'baby', happiny: 'baby' });
// species key overrides: the Lake of Rage's red Gyarados is a Gyarados (a palette variant with its own sheets, not a new species);
// a Mega form is its base species (mega.js sets `speciesId` on each)
BM.FORMS.gyarados_red.speciesId = 'gyarados';
{ const prev = BM.speciesOf; BM.speciesOf = (f) => f.speciesId || prev(f); }
