// SINNOH CHAIN COMPLETENESS (Sinnoh + Unova prompt Act 1 S2; EE1 forward + FFF1 backward over the combined Kanto + Johto + Hoenn +
// Sinnoh roster). PokéAPI evolution chains (prep pack report §2), with the game's standing calls:
//   - U1: BUDEW IS IN — it leaves the baby exclusion (the Riolu / Togepi precedent: a baby that STARTS a player line is a form);
//     the other Gen 4 babies stay out (Chingling, Bonsly, Mime Jr., Happiny, Munchlax, Mantyke).
//   - regional branch bases are their own species keys (growlithe_hisui → arcanine_hisui, voltorb_hisui → electrode_hisui,
//     qwilfish_hisui → overqwil — Johto Qwilfish keeps NO in-game evolution, UUU1); the Hisuian Typhlosion branch's bases are
//     Cyndaquil / Quilava (species keys cyndaquil / quilava, shared art + cry — the Gallade-branch rule), so Quilava → Typhlosion
//     + Hisuian Typhlosion.
//   - Burmy → Wormadam / Mothim (gender → branch, C9): `burmy_mothim` is canon-identical to Burmy, so waves field `burmy` and
//     Mothim sits on Burmy's chain here.
//   - Lickitung (Gen 1 support row) → Lickilicky.
// The forward holds stay: Linoone → Obstagoon, Mr. Mime → Mr. Rime (Galar).
window.BM = window.BM || {};
Object.assign(BM.EVO_CANON, {
  turtwig: ['grotle'], grotle: ['torterra'], torterra: [], chimchar: ['monferno'], monferno: ['infernape'], infernape: [],
  piplup: ['prinplup'], prinplup: ['empoleon'], empoleon: [], shinx: ['luxio'], luxio: ['luxray'], luxray: [],
  budew: ['roselia'], cranidos: ['rampardos'], rampardos: [], combee: ['vespiquen'], vespiquen: [], buizel: ['floatzel'], floatzel: [],
  drifloon: ['drifblim'], drifblim: [], buneary: ['lopunny'], lopunny: [], stunky: ['skuntank'], skuntank: [],
  riolu: ['lucario'], lucario: [], croagunk: ['toxicroak'], toxicroak: [], snover: ['abomasnow'], abomasnow: [], rotom: [],
  gible: ['gabite'], gabite: ['garchomp'], garchomp: [], shieldon: ['bastiodon'], bastiodon: [], glameow: ['purugly'], purugly: [],
  starly: ['staravia'], staravia: ['staraptor'], staraptor: [], pachirisu: [], hippopotas: ['hippowdon'], hippowdon: [],
  skorupi: ['drapion'], drapion: [], bronzor: ['bronzong'], bronzong: [], spiritomb: [], shellos: ['gastrodon'], gastrodon: [],
  finneon: ['lumineon'], lumineon: [], growlithe_hisui: ['arcanine_hisui'], arcanine_hisui: [], typhlosion_hisui: [],
  quilava: ['typhlosion', 'typhlosion_hisui'],
  dialga: [], heatran: [], regigigas: [], uxie: [], darkrai: [], shaymin: [], palkia: [], cresselia: [], mesprit: [], azelf: [],
  enamorus: [], manaphy: [], giratina: [], arceus: [],
  bidoof: ['bibarel'], bibarel: [], kricketot: ['kricketune'], kricketune: [], burmy: ['wormadam', 'mothim'], wormadam: [], mothim: [],
  cherubi: ['cherrim'], cherrim: [], chatot: [], carnivine: [], phione: [], lickitung: ['lickilicky'], lickilicky: [],
  voltorb_hisui: ['electrode_hisui'], electrode_hisui: [], qwilfish_hisui: ['overqwil'], overqwil: [],
});
Object.assign(BM.PRE_CANON, {
  turtwig: null, grotle: 'turtwig', torterra: 'grotle', chimchar: null, monferno: 'chimchar', infernape: 'monferno',
  piplup: null, prinplup: 'piplup', empoleon: 'prinplup', shinx: null, luxio: 'shinx', luxray: 'luxio',
  budew: null, cranidos: null, rampardos: 'cranidos', combee: null, vespiquen: 'combee', buizel: null, floatzel: 'buizel',
  drifloon: null, drifblim: 'drifloon', buneary: null, lopunny: 'buneary', stunky: null, skuntank: 'stunky',
  riolu: null, lucario: 'riolu', croagunk: null, toxicroak: 'croagunk', snover: null, abomasnow: 'snover', rotom: null,
  gible: null, gabite: 'gible', garchomp: 'gabite', shieldon: null, bastiodon: 'shieldon', glameow: null, purugly: 'glameow',
  starly: null, staravia: 'starly', staraptor: 'staravia', pachirisu: null, hippopotas: null, hippowdon: 'hippopotas',
  skorupi: null, drapion: 'skorupi', bronzor: null, bronzong: 'bronzor', spiritomb: null, shellos: null, gastrodon: 'shellos',
  finneon: null, lumineon: 'finneon', growlithe_hisui: null, arcanine_hisui: 'growlithe_hisui', typhlosion_hisui: 'quilava',
  dialga: null, heatran: null, regigigas: null, uxie: null, darkrai: null, shaymin: null, palkia: null, cresselia: null, mesprit: null,
  azelf: null, enamorus: null, manaphy: null, giratina: null, arceus: null,
  bidoof: null, bibarel: 'bidoof', kricketot: null, kricketune: 'kricketot', burmy: null, wormadam: 'burmy', mothim: 'burmy',
  cherubi: null, cherrim: 'cherubi', chatot: null, carnivine: null, phione: null, lickitung: null, lickilicky: 'lickitung',
  voltorb_hisui: null, electrode_hisui: 'voltorb_hisui', qwilfish_hisui: null, overqwil: 'qwilfish_hisui',
});
// U1: Budew leaves the exclusion list (it is a form now); the other Gen 4 babies stay out
delete BM.PRE_EXCLUDED.budew;
Object.assign(BM.PRE_EXCLUDED, { chingling: 'baby', bonsly: 'baby', mime_jr: 'baby', happiny: 'baby', munchlax: 'baby', mantyke: 'baby' });
// species key overrides: the Hisuian Typhlosion branch's bases ARE Cyndaquil / Quilava (shared art + cry, C8)
BM.FORMS.cyndaquil_typhlosion_hisui.speciesId = 'cyndaquil';
BM.FORMS.quilava_typhlosion_hisui.speciesId = 'quilava';
// Candice's ace (stage 15): Froslass (a Hoenn enemy-only species) is now an ACE-class form — its attack sheet is queued (#… in
// the Sinnoh batch), so it is no longer run-only
BM.FORMS.froslass.aceClass = true; BM.FORMS.froslass.runOnly = false; BM.FORMS.froslass.artRegion = 'sinnoh';
