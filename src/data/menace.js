// HOENN ACT 2 STEP 9.5 PART B — GYM ESCALATION (user playtest 2026-10-12: "the kids are steamrolling the entire game"), in every
// region's gym, Elite Four and Champion stages (Kanto, Johto, Hoenn). Regular stages and the Prism Tower are untouched.
//   1. LEADER'S MENACE — every leader / E4 / Champion ACE carries exactly ONE signature threat, assigned per leader by type /
//      theme (the table below, deterministic — published in CURRENT_STATE):
//        area    its attacks splash onto nearby player units (the Splash machinery, ~1 unit radius: BM.MENACE.AREA_R)
//        status  each hit may inflict its type's status at 25% (standard durations): Freeze (Ice) · Poison (Poison / Grass) ·
//                Paralyze (Electric) · Burn (Fire); other types take the nearest theme (Psychic / Ghost Hypnosis → Sleep,
//                Dragon's Dragon Breath → Paralyze, Bug stings → Poison, Phoebe's Will-O-Wisp → Burn)
//        giant   ~1.5× size, +50% HP, +25% damage — ON TOP of the ace's own build (a §4.4 giant ace stays a giant ace; the
//                BR-052 ×4 / ×1.5 numbers are untouched)
//      The pre-battle screen shows the threat with an icon and one plain line (BM.menaceLine). It is the ace's only menace: the
//      §4.4 signature move (`sig`) is the ace's MOVE, not a menace, and stays as shipped.
//   2. LAST STAND — the FIRST time the enemy base falls to 50% or below, the leader sends the remaining themed Pokémon ALL AT ONCE
//      at their base (battle.js): gym 1–2: 5 · gym 3–4: 6 · gym 5–6: 7 · gym 7–8: 8 · Elite Four: 9 · Champion: 10. Drawn from the
//      stage's own enemy pool at the stage's level; exempt from trickle pacing (user ask); over the side cap the rest pour in as
//      slots free — never dropped. Exactly once per battle. Banner: BM.LAST_STAND_TEXT.
// Scope: every stage of kind gym / e4 / champion with a leader (Mt. Silver's Red counts as a Champion). Hoenn's Sky Pillar is a
// legendary capstone with no leader — not a leader stage, so neither rule applies there.
window.BM = window.BM || {};
BM.MENACE = { AREA_R: 70, STATUS_CHANCE: 0.25, GIANT: { size: 1.5, hp: 1.5, dmg: 1.25 } };
BM.MENACE_KINDS = {
  area: { icon: '💥', word: 'AREA', text: (who) => `Watch out: ${who} hits a whole AREA!` },
  status: { icon: null, word: 'STATUS', text: (who, s) => `Watch out: ${who} can ${BM.MENACE_VERB[s]}!` },
  giant: { icon: '💪', word: 'GIANT', text: (who) => `Watch out: ${who} is GIANT!` },
};
BM.MENACE_VERB = { freeze: 'FREEZE you', poison: 'POISON you', paralyze: 'PARALYZE you', burn: 'BURN you', sleep: 'put you to SLEEP' };
// the type rule: the four named statuses, then the nearest theme for the rest (used when a table row names `status` alone)
BM.MENACE_STATUS_OF_TYPE = { ice: 'freeze', poison: 'poison', grass: 'poison', electric: 'paralyze', fire: 'burn',
  psychic: 'sleep', ghost: 'sleep', fairy: 'sleep', normal: 'sleep', bug: 'poison', dragon: 'paralyze', water: 'freeze',
  flying: 'paralyze', dark: 'poison', fighting: 'paralyze', rock: 'paralyze', ground: 'paralyze', steel: 'paralyze' };
// THE TABLE — stage id → [kind, status (status rows only), who (the possessive name when the stage's leader line is a group)]
BM.LEADER_MENACE = {
  // Kanto
  kanto_05_brock: ['giant'], kanto_08_misty: ['area'], kanto_10_surge: ['status', 'paralyze'], kanto_13_erika: ['status', 'poison'],
  kanto_15_koga: ['area'], kanto_17_sabrina: ['status', 'sleep'], kanto_19_blaine: ['status', 'burn'], kanto_20_giovanni: ['giant'],
  kanto_21_lorelei: ['status', 'freeze'], kanto_22_bruno: ['giant'], kanto_23_agatha: ['status', 'poison'], kanto_24_lance: ['area'],
  kanto_25_champion: ['status', 'burn'],
  // Johto
  johto_05_falkner: ['area'], johto_08_bugsy: ['status', 'poison'], johto_11_whitney: ['giant'], johto_14_morty: ['area'],
  johto_16_jasmine: ['giant'], johto_17_chuck: ['area'], johto_19_pryce: ['status', 'freeze'], johto_21_clair: ['area'],
  johto_23_elitefour: ['status', 'burn', 'Karen'], johto_24_champion: ['giant'], johto_25_mtsilver: ['status', 'paralyze'],
  // Hoenn
  hoenn_04_roxanne: ['area'], hoenn_06_brawly: ['area'], hoenn_08_wattson: ['status', 'paralyze'], hoenn_11_flannery: ['giant'],
  hoenn_13_norman: ['giant'], hoenn_14_winona: ['status', 'paralyze'], hoenn_17_tate_liza: ['status', 'sleep'], hoenn_19_wallace: ['area'],
  hoenn_20_sidney: ['giant'], hoenn_21_phoebe: ['status', 'burn'], hoenn_22_glacia: ['status', 'freeze'], hoenn_23_drake: ['area'],
  hoenn_24_champion: ['giant'],
  // Sinnoh (Act 1 S4, from day one — the type rule: Grass → Poison, Ice → Freeze, Electric → Paralyze, Fire → Burn; Fantina's Ghost
  // Hypnosis → Sleep; Aaron's Drapion (Poison) → Poison). Cynthia's GIANT is the ruled one (U4: giant Mega Garchomp).
  sinnoh_04_roark: ['giant'], sinnoh_07_gardenia: ['status', 'poison'], sinnoh_08_fantina: ['status', 'sleep'], sinnoh_10_maylene: ['area'],
  sinnoh_11_wake: ['area'], sinnoh_12_byron: ['giant'], sinnoh_15_candice: ['status', 'freeze'], sinnoh_19_volkner: ['status', 'paralyze'],
  sinnoh_20_aaron: ['status', 'poison'], sinnoh_21_bertha: ['giant'], sinnoh_22_flint: ['status', 'burn'], sinnoh_23_lucian: ['area'],
  sinnoh_24_champion: ['giant'],
  // Unova (Act 2 U-S4, from day one): the triple Striaton monkeys hit an AREA; Lenora's Watchog GIANT; Burgh's Leavanny (Bug/Grass →
  // Poison); Elesa's Zebstrika PARALYZE; Clay's Excadrill GIANT; Skyla's Swanna AREA; Brycen's Beartic FREEZE; Drayden's Haxorus AREA;
  // Shauntal's Chandelure (Ghost/Fire → Burn); Grimsley's Bisharp GIANT; Caitlin's Gothitelle SLEEP; Marshal's Conkeldurr GIANT;
  // N's Zekrom PARALYZE (Electric); Alder's Volcarona GIANT (ruled, U2).
  unova_04_striaton: ['area'], unova_05_lenora: ['giant'], unova_07_burgh: ['status', 'poison'], unova_09_elesa: ['status', 'paralyze'],
  unova_11_clay: ['giant'], unova_14_skyla: ['area'], unova_16_brycen: ['status', 'freeze'], unova_18_drayden: ['area'],
  unova_20_shauntal: ['status', 'burn'], unova_21_grimsley: ['giant'], unova_22_caitlin: ['status', 'sleep'], unova_23_marshal: ['giant'],
  unova_24_ns_castle: ['status', 'paralyze', 'N'], unova_25_alder: ['giant'],
  // Kalos (Kalos + Alola build, from day one — the type rule): Viola's Vivillon (Bug → Poison); Grant's twin fossils GIANT; Korrina's
  // Hawlucha AREA; Ramos's Gogoat (Grass → Poison); Clemont's Heliolisk PARALYZE; Valerie's Sylveon (Fairy → Sleep); Olympia's Meowstic
  // SLEEP; Wulfric's Avalugg FREEZE; Malva's Talonflame BURN; Siebold's Barbaracle AREA; Wikstrom's Aegislash GIANT; Drasna's Noivern
  // AREA; Diantha's Mega Gardevoir GIANT. The capstone (Rogue Mega Night) has no leader — no menace.
  kalos_04_viola: ['status', 'poison'], kalos_07_grant: ['giant'], kalos_10_korrina: ['area'], kalos_11_ramos: ['status', 'poison'],
  kalos_13_clemont: ['status', 'paralyze'], kalos_14_valerie: ['status', 'sleep'], kalos_17_olympia: ['status', 'sleep'], kalos_19_wulfric: ['status', 'freeze'],
  kalos_20_malva: ['status', 'burn'], kalos_21_siebold: ['area'], kalos_22_wikstrom: ['giant'], kalos_23_drasna: ['area'], kalos_24_champion: ['giant'],
  // Alola (from day one): the 8 trials (their TOTEMS are the aces) + the 4 kahunas + the Lanakila Elite Four + Kukui. Ilima's Gumshoos
  // (Normal → Sleep); Hala's Crabrawler AREA; Lana's Araquanid (Water → Freeze); Kiawe's Alolan Marowak BURN; Mallow's Lurantis (Grass →
  // Poison); Olivia's Lycanroc GIANT; Sophocles's Togedemaru PARALYZE; Acerola's Mimikyu SLEEP; Nanu's Alolan Persian AREA; the captainless
  // canyon's Kommo-o AREA (who = "Vast Poni Canyon"); Mina's Ribombee SLEEP; Hapu's Mudsdale GIANT; E4 Hala's Crabominable FREEZE, Olivia's Lycanroc
  // GIANT, Acerola's Palossand SLEEP, Kahili's Toucannon BURN; Kukui's Lycanroc GIANT. Necrozma (node 27) has no leader — no menace.
  alola_03_ilima: ['status', 'sleep'], alola_05_hala: ['area'], alola_07_lana: ['status', 'freeze'], alola_08_kiawe: ['status', 'burn'],
  alola_09_mallow: ['status', 'poison'], alola_10_olivia: ['giant'], alola_13_sophocles: ['status', 'paralyze'], alola_14_acerola: ['status', 'sleep'],
  alola_16_nanu: ['area'], alola_19_vast_poni: ['area', null, 'Vast Poni Canyon'], alola_20_mina: ['status', 'sleep'], alola_21_hapu: ['giant'],
  alola_22_hala_e4: ['status', 'freeze'], alola_23_olivia_e4: ['giant'], alola_24_acerola_e4: ['status', 'sleep'], alola_25_kahili_e4: ['status', 'burn'],
  alola_26_kukui: ['giant'],
  // Galar (Galar + Paldea build, from day one — the type rule): Milo's Eldegoss (Grass → Poison); Nessa's Drednaw (Water → Freeze);
  // Kabu's Centiskorch BURN; Bea's Machamp AREA; Allister's Gengar (Ghost/Poison → POISON, the type rule); Opal's Alcremie (Fairy → Sleep); Gordie's Coalossal
  // GIANT; Melony's Lapras FREEZE; Piers's Obstagoon AREA; Raihan's Duraludon GIANT; Marnie's Grimmsnarl (Fairy → Sleep); Hop's
  // Rillaboom (Grass → Poison); the Darkest Day: Rose's Copperajah GIANT (Steel); Leon's Charizard GIANT (the Champion precedent);
  // Mustard's Urshifu (node 26, the Master Dojo — post-game, a leader stage) AREA (Fighting).
  galar_06_milo: ['status', 'poison'], galar_08_nessa: ['status', 'freeze'], galar_09_kabu: ['status', 'burn'], galar_11_bea: ['area'],
  galar_12_allister: ['status', 'poison'], galar_14_opal: ['status', 'sleep'], galar_16_gordie: ['giant'], galar_17_melony: ['status', 'freeze'],
  galar_19_piers: ['area'], galar_20_raihan: ['giant'], galar_22_marnie: ['status', 'sleep'], galar_23_hop: ['status', 'poison'],
  galar_24_eternatus: ['giant'], galar_25_leon: ['giant'], galar_26_dojo: ['area'],
  // Paldea (Galar + Paldea build, from day one — the type rule): the 8 gyms + the 6 Titan stages (the TITANS are the aces; who = the
  // Titan's site, the Vast Poni Canyon precedent) + the Elite Four + Geeta + Nemona. Katy's Teddiursa (Bug theme → Poison); the Stony
  // Cliff's Klawf GIANT; Brassius's Sudowoodo (Grass → Poison); the Open Sky's Bombirdier AREA; Iono's Mismagius PARALYZE (Electric gym);
  // the Lurking Steel's Orthworm GIANT; Kofu's Crabominable (Water → Freeze); Larry's Staraptor GIANT; Ryme's Toxtricity PARALYZE (Electric —
  // the type rule); Tulip's Florges SLEEP (Psychic); the Quaking Earth's Great Tusk + Iron Treads AREA (Earthquake-class); Grusha's Altaria FREEZE
  // (Ice gym); the False Dragon's Dondozo GIANT; E4 Rika's Clodsire POISON, Poppy's Tinkaton GIANT, Larry's Flamigo (Flying → Paralyze),
  // Hassel's Baxcalibur AREA (the Dragon precedent); Geeta's Glimmora GIANT; Nemona's Pawmot GIANT. Team Star bases are trainer stages
  // (no menace); Area Zero Depths (node 29) has no leader — no menace.
  paldea_04_katy: ['status', 'poison'], paldea_05_klawf: ['giant', null, 'the Stony Cliff'], paldea_06_brassius: ['status', 'poison'],
  paldea_07_bombirdier: ['area', null, 'the Open Sky'], paldea_09_iono: ['status', 'paralyze'], paldea_11_orthworm: ['giant', null, 'the Lurking Steel'],
  paldea_12_kofu: ['status', 'freeze'], paldea_14_larry: ['giant'], paldea_15_ryme: ['status', 'paralyze'], paldea_16_tulip: ['status', 'sleep'],
  paldea_17_great_tusk: ['area', null, 'the Quaking Earth'], paldea_18_iron_treads: ['area', null, 'the Quaking Earth'], paldea_19_grusha: ['status', 'freeze'],
  paldea_22_false_dragon: ['giant', null, 'the False Dragon'], paldea_23_rika: ['status', 'poison'], paldea_24_poppy: ['giant'],
  paldea_25_larry_e4: ['status', 'paralyze'], paldea_26_hassel: ['area'], paldea_27_geeta: ['giant'], paldea_28_nemona: ['giant'],
};
BM.LAST_STAND_TEXT = '🔥 The Leader is making a last stand!';
BM.isLeaderStage = (st) => !!(st && !st.dev && !st.bonus && st.leader && ['gym', 'e4', 'champion'].includes(st.kind));
// the gym's number inside its region (1–8, by stage order) — the last-stand size ladder
BM.gymNumber = (st) => BM.STAGES.filter((s) => s.kind === 'gym' && s.region === st.region && !s.dev).sort((a, b) => a.num - b.num).indexOf(st) + 1;
BM.lastStandCount = function (st) {
  if (!BM.isLeaderStage(st)) return 0;
  if (st.kind === 'champion') return 10;
  if (st.kind === 'e4') return 9;
  const g = BM.gymNumber(st);
  // Alola's island challenge has 12 gym-kind stages (8 trials + 4 grand trials): its ladder is the same 5 → 8, stretched over 12
  const n = BM.STAGES.filter((s) => s.kind === 'gym' && s.region === st.region && !s.dev).length;
  return g ? 4 + Math.ceil(Math.ceil(g * 8 / Math.max(8, n)) / 2) : 0; // 1–2: 5 · 3–4: 6 · 5–6: 7 · 7–8: 8
};
// a stage's menace, resolved: { kind, status, icon, word, line } — null on any other stage
BM.menaceOf = function (st) {
  const row = st && st.ace && BM.isLeaderStage(st) && BM.LEADER_MENACE[st.id];
  if (!row) return null;
  const [kind, s0] = row, f = BM.FORMS[st.ace.form];
  const status = kind === 'status' ? s0 || BM.MENACE_STATUS_OF_TYPE[f.attackType || f.types[0]] : null;
  const K = BM.MENACE_KINDS[kind];
  return { kind, status, icon: status ? BM.STATUS[status].icon : K.icon, word: status ? status.toUpperCase() : K.word };
};
// the one plain pre-battle line ("Watch out: Flannery's Torkoal is GIANT!"); `known` = false hides the species (X1 hidden intel)
BM.menaceLine = function (st, known = true) {
  const m = BM.menaceOf(st);
  if (!m) return '';
  const row = BM.LEADER_MENACE[st.id], who = row[2] || st.leader;
  const owner = `${who}'${/s$/.test(who) ? '' : 's'} ${st.ace.totem ? (st.ace.title || 'Totem') + ' ' : ''}${known ? BM.FORMS[st.ace.form].name : 'ace'}`; // Alola: "Ilima's Totem Gumshoos"
  return BM.MENACE_KINDS[m.kind].text(owner, m.status);
};
