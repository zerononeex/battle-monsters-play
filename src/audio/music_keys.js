// The ONLY music keys the game may play (docs/MUSIC_PROMPTS.md, 85 keys). Never rename a shipped key
// (BUG_REGISTRY BR-007); never add per-leader / per-person battle keys.
window.BM = window.BM || {};
BM.MUSIC_KEYS = {
  title: { loop: true }, map_kanto: { loop: true },
  battle_wild: { loop: true }, battle_trainer: { loop: true }, battle_gym: { loop: true },
  battle_elitefour: { loop: true }, battle_champion: { loop: true },
  victory: { loop: false }, defeat: { loop: false },
  gacha: { loop: true }, gacha_fanfare: { loop: false }, evolution: { loop: false },
  math_challenge: { loop: true }, team: { loop: true },
  town_pallet: { loop: true }, town_viridian: { loop: true }, town_pewter: { loop: true },
  town_cerulean: { loop: true }, town_vermilion: { loop: true }, town_lavender: { loop: true },
  town_celadon: { loop: true }, town_fuchsia: { loop: true }, town_saffron: { loop: true },
  town_cinnabar: { loop: true }, town_indigo: { loop: true }, route: { loop: true },
  // user-added 2026-10-10: #27 gym wins play victory_gym INSTEAD of victory; #28 credits = region-complete ending
  // screen (the screen is built in Phase 7 — the key + fallback exist now).
  victory_gym: { loop: false }, credits: { loop: true },
  // FF3 (user 2026-10-11, Phase 7.5): #29 `tower` = the Prism Tower screen + its pre-battle; #30 `battle_tower` = battles
  // inside the Tower (wins keep `victory`). WebAudio fallback until the MP3s are supplied.
  tower: { loop: true }, battle_tower: { loop: true },
  // Johto (MUSIC_PROMPTS #31–#41, Johto prompt Step 0). MUSIC FALLBACK RULE (user, 2026-10-11): a Johto key whose MP3 is not
  // supplied yet plays its PAIRED Kanto town theme (never the WebAudio synth); the moment art-src/music/<key>.mp3 lands and is
  // imported, the real track takes over. `fallback` = the paired key (BM.musicSource resolves it).
  map_johto: { loop: true, fallback: 'map_kanto' },
  town_newbark: { loop: true, fallback: 'town_pallet' }, town_cherrygrove: { loop: true, fallback: 'town_viridian' },
  town_violet: { loop: true, fallback: 'town_cerulean' }, town_azalea: { loop: true, fallback: 'town_fuchsia' },
  town_goldenrod: { loop: true, fallback: 'town_celadon' }, town_ecruteak: { loop: true, fallback: 'town_lavender' },
  town_olivine: { loop: true, fallback: 'town_vermilion' }, town_cianwood: { loop: true, fallback: 'town_cinnabar' },
  town_mahogany: { loop: true, fallback: 'town_pewter' }, town_blackthorn: { loop: true, fallback: 'town_indigo' },
  // Hoenn (MUSIC_PROMPTS #42–#57, Hoenn prompt Step 0, prep C12 pairings CONFIRMED): the same fallback rule. Verdanturf (stage 9)
  // plays town_fallarbor (the two towns share one theme in RSE).
  map_hoenn: { loop: true, fallback: 'map_kanto' },
  town_littleroot: { loop: true, fallback: 'town_pallet' }, town_oldale: { loop: true, fallback: 'town_viridian' },
  town_petalburg: { loop: true, fallback: 'town_pewter' }, town_rustboro: { loop: true, fallback: 'town_saffron' },
  town_dewford: { loop: true, fallback: 'town_cinnabar' }, town_slateport: { loop: true, fallback: 'town_vermilion' },
  town_mauville: { loop: true, fallback: 'town_celadon' }, town_lavaridge: { loop: true, fallback: 'town_cinnabar' },
  town_fallarbor: { loop: true, fallback: 'town_lavender' }, town_fortree: { loop: true, fallback: 'town_fuchsia' },
  town_lilycove: { loop: true, fallback: 'town_celadon' }, town_mossdeep: { loop: true, fallback: 'town_saffron' },
  town_sootopolis: { loop: true, fallback: 'town_cerulean' }, town_pacifidlog: { loop: true, fallback: 'town_vermilion' },
  town_evergrande: { loop: true, fallback: 'town_indigo' },
  // Sinnoh (MUSIC_PROMPTS #58–#73, Sinnoh + Unova prompt Step 0e / S7, the pack's pairings): the same fallback rule.
  map_sinnoh: { loop: true, fallback: 'map_kanto' },
  town_twinleaf: { loop: true, fallback: 'town_pallet' }, town_sandgem: { loop: true, fallback: 'town_viridian' },
  town_jubilife: { loop: true, fallback: 'town_saffron' }, town_oreburgh: { loop: true, fallback: 'town_pewter' },
  town_floaroma: { loop: true, fallback: 'town_fuchsia' }, town_eterna: { loop: true, fallback: 'town_celadon' },
  town_hearthome: { loop: true, fallback: 'town_cerulean' }, town_solaceon: { loop: true, fallback: 'town_viridian' },
  town_veilstone: { loop: true, fallback: 'town_celadon' }, town_pastoria: { loop: true, fallback: 'town_fuchsia' },
  town_celestic: { loop: true, fallback: 'town_lavender' }, town_canalave: { loop: true, fallback: 'town_vermilion' },
  town_snowpoint: { loop: true, fallback: 'town_cinnabar' }, town_sunyshore: { loop: true, fallback: 'town_vermilion' },
  town_sinnoh_league: { loop: true, fallback: 'town_indigo' },
  // Unova (MUSIC_PROMPTS #74–#85, Step 0e / U-S7): each Kanto town paired once.
  map_unova: { loop: true, fallback: 'map_kanto' },
  town_nuvema: { loop: true, fallback: 'town_pallet' }, town_accumula: { loop: true, fallback: 'town_viridian' },
  town_striaton: { loop: true, fallback: 'town_cerulean' }, town_nacrene: { loop: true, fallback: 'town_pewter' },
  town_castelia: { loop: true, fallback: 'town_saffron' }, town_nimbasa: { loop: true, fallback: 'town_celadon' },
  town_driftveil: { loop: true, fallback: 'town_vermilion' }, town_mistralton: { loop: true, fallback: 'town_fuchsia' },
  town_icirrus: { loop: true, fallback: 'town_lavender' }, town_opelucid: { loop: true, fallback: 'town_cinnabar' },
  town_unova_league: { loop: true, fallback: 'town_indigo' },
};
// Which file a key plays: its own supplied MP3, else (Johto / Hoenn) its paired Kanto key's MP3, else null (= the synth fallback).
// Returns { file, via } — `via` = the key whose file plays.
BM.musicSource = function (key) {
  const k = BM.MUSIC_KEYS[key];
  if (!k) return { file: null, via: null };
  if (BM.MUSIC_FILES[key]) return { file: BM.MUSIC_FILES[key], via: key };
  if (k.fallback && BM.MUSIC_FILES[k.fallback]) return { file: BM.MUSIC_FILES[k.fallback], via: k.fallback };
  return { file: null, via: null };
};
// key -> URL of a supplied MP3 (art-src/music/<key>.mp3). Generated by tools/build_manifests.mjs.
BM.MUSIC_FILES = BM.MUSIC_FILES || {};
