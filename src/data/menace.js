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
  return g ? 4 + Math.ceil(g / 2) : 0; // 1–2: 5 · 3–4: 6 · 5–6: 7 · 7–8: 8
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
  const owner = `${who}'${/s$/.test(who) ? '' : 's'} ${known ? BM.FORMS[st.ace.form].name : 'ace'}`;
  return BM.MENACE_KINDS[m.kind].text(owner, m.status);
};
