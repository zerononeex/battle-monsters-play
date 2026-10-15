// Items — data only (BUILD_PLAN §4.3 XP items, §4.6 evolution items; design addendum 2026-10-10 "item drops").
// Stored in profile.items as { itemId: count }; Battle Tickets live in profile.tickets (not an item).
//   kind: evo     stone / held item — used on a line from the collection under the §4.6 level floor (form.evo.minLevel)
//         xp      XP candy — `xp` points to ONE chosen line (§4.3: S 500 · M 3,000 · L 15,000)
//         candy   Rare Candy — +1 level at any level (the line's XP becomes exactly the next level's L³)
//         ball    Poké Ball (1 = one pull, 9 = a 10-pull) / Master Ball (opens the Legendary Gacha) — Phase 5
//         battle  single-use battle item (Phase 5, design addendum "gacha loot"): armed on the pre-battle screen,
//                 consumed ONLY on a WIN (a loss keeps it). `battle: true` + its effect in BM.Battle (opts.items).
//         dowsing Dowsing Machine — a battle item too: a WIN with it armed guarantees the stage's rarest drop
//   icon: BM.ART key 'icons/<id>' when its ASSET_PROMPTS entry is DONE, else the emoji.
window.BM = window.BM || {};
BM.ITEM_INFO = {
  xp_candy_s: { name: 'XP Candy S', kind: 'xp', xp: 500, emoji: '🍬', blurb: '+500 XP for one character' },
  xp_candy_m: { name: 'XP Candy M', kind: 'xp', xp: 3000, emoji: '🍬', blurb: '+3,000 XP for one character' },
  xp_candy_l: { name: 'XP Candy L', kind: 'xp', xp: 15000, emoji: '🍬', blurb: '+15,000 XP for one character' },
  rare_candy: { name: 'Rare Candy', kind: 'candy', emoji: '🍭', blurb: '+1 level for one character' },
  thunder_stone: { name: 'Thunder Stone', kind: 'evo', emoji: '⚡' },
  fire_stone: { name: 'Fire Stone', kind: 'evo', emoji: '🔥' },
  water_stone: { name: 'Water Stone', kind: 'evo', emoji: '💧' },
  moon_stone: { name: 'Moon Stone', kind: 'evo', emoji: '🌙' },
  sun_stone: { name: 'Sun Stone', kind: 'evo', emoji: '☀️', region: 'johto' }, // EEE1: defined now; drops arrive with Johto (none in Kanto / the Tower)
  leaf_stone: { name: 'Leaf Stone', kind: 'evo', emoji: '🍃' },
  ice_stone: { name: 'Ice Stone', kind: 'evo', emoji: '❄️' },
  metal_coat: { name: 'Metal Coat', kind: 'evo', emoji: '🔩' },
  black_augurite: { name: 'Black Augurite', kind: 'evo', emoji: '🪨' },
  up_grade: { name: 'Up-Grade', kind: 'evo', emoji: '💾' },
  dubious_disc: { name: 'Dubious Disc', kind: 'evo', emoji: '💿' },
  // Johto (Step 2, BUILD_PLAN §4.6 house-rule items for the Johto lines' evolutions; icons ASSET_PROMPTS #605–#610). Johto-era:
  // they drop only from Johto stages (and the gacha's evolution-item slot of a Johto banner).
  shiny_stone: { name: 'Shiny Stone', kind: 'evo', emoji: '✨', region: 'johto' },
  dusk_stone: { name: 'Dusk Stone', kind: 'evo', emoji: '🌑', region: 'johto' },
  razor_claw: { name: 'Razor Claw', kind: 'evo', emoji: '🗡️', region: 'johto' },
  electirizer: { name: 'Electirizer', kind: 'evo', emoji: '🔌', region: 'johto' },
  magmarizer: { name: 'Magmarizer', kind: 'evo', emoji: '🌋', region: 'johto' },
  peat_block: { name: 'Peat Block', kind: 'evo', emoji: '🟫', region: 'johto' },
  // Hoenn (Step 2, §4.6 translations C9; icons in the Hoenn queue): Dawn Stone (Kirlia → Gallade), Prism Scale (Feebas → Milotic),
  // Reaper Cloth (Dusclops → Dusknoir). Hoenn-era: they drop only from Hoenn stages and the Tower vault's Hoenn-gated rows.
  dawn_stone: { name: 'Dawn Stone', kind: 'evo', emoji: '🌅', region: 'hoenn' },
  prism_scale: { name: 'Prism Scale', kind: 'evo', emoji: '🌈', region: 'hoenn' },
  reaper_cloth: { name: 'Reaper Cloth', kind: 'evo', emoji: '🧣', region: 'hoenn' },
  // Unova (Act 2 U-S2, pack C9): Leader's Crest — Bisharp → Kingambit (canon "defeat 3 Bisharp holding one" → the item, Lv 36 floor).
  leaders_crest: { name: "Leader's Crest", kind: 'evo', emoji: '🎖️', region: 'unova' },
  // Kalos (Kalos + Alola build, pack C9): the two held-item trades → the item, one-step Lv 20 — Swirlix → Slurpuff, Spritzee → Aromatisse.
  whipped_dream: { name: 'Whipped Dream', kind: 'evo', emoji: '🍰', region: 'kalos' },
  sachet: { name: 'Sachet', kind: 'evo', emoji: '👝', region: 'kalos' },
  poke_ball: { name: 'Poké Ball', kind: 'ball', emoji: '🔴', blurb: '1 = one pull · 9 = a 10-pull' },
  master_ball: { name: 'Master Ball', kind: 'ball', emoji: '🟣', blurb: 'Opens the Legendary Safari Zone' },
  // MEGA STONES (Johto Step 6): kind 'mega' — OWNING one (never used up) lets its line field that Mega form once Mega Evolution is
  // unlocked (Johto Champion cleared). Ids = the queued icon save-as keys EXACTLY (ASSET_PROMPTS #591–#604, #621–#625; BR-007).
  venusaurite: { name: 'Venusaurite', kind: 'mega', emoji: '💎' }, charizardite_x: { name: 'Charizardite X', kind: 'mega', emoji: '💎' },
  charizardite_y: { name: 'Charizardite Y', kind: 'mega', emoji: '💎' }, blastoisinite: { name: 'Blastoisinite', kind: 'mega', emoji: '💎' },
  alakazite: { name: 'Alakazite', kind: 'mega', emoji: '💎' }, gengarite: { name: 'Gengarite', kind: 'mega', emoji: '💎' },
  gyaradosite: { name: 'Gyaradosite', kind: 'mega', emoji: '💎' }, pinsirite: { name: 'Pinsirite', kind: 'mega', emoji: '💎' },
  aerodactylite: { name: 'Aerodactylite', kind: 'mega', emoji: '💎' }, mewtwonite_x: { name: 'Mewtwonite X', kind: 'mega', emoji: '💎' },
  mewtwonite_y: { name: 'Mewtwonite Y', kind: 'mega', emoji: '💎' }, scizorite: { name: 'Scizorite', kind: 'mega', emoji: '💎' },
  houndoominite: { name: 'Houndoominite', kind: 'mega', emoji: '💎' }, tyranitarite: { name: 'Tyranitarite', kind: 'mega', emoji: '💎' },
  meganiumite: { name: 'Meganiumite', kind: 'mega', emoji: '💎' }, feraligite: { name: 'Feraligite', kind: 'mega', emoji: '💎' },
  dragoninite: { name: 'Dragoninite', kind: 'mega', emoji: '💎' }, raichunite_x: { name: 'Raichunite X', kind: 'mega', emoji: '💎' },
  raichunite_y: { name: 'Raichunite Y', kind: 'mega', emoji: '💎' },
  // Hoenn (Step 6): the 18 classic Hoenn stones + Absolite Z (Legends: Z-A Mega Dimension). Ids = the queued icon save-as keys
  // EXACTLY (assets/ui/icons/<id>.png). Mega Rayquaza has NO stone (gate: own Rayquaza + Hoenn Champion cleared — mega.js).
  sceptilite: { name: 'Sceptilite', kind: 'mega', emoji: '💎', region: 'hoenn' }, blazikenite: { name: 'Blazikenite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  swampertite: { name: 'Swampertite', kind: 'mega', emoji: '💎', region: 'hoenn' }, gardevoirite: { name: 'Gardevoirite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  galladite: { name: 'Galladite', kind: 'mega', emoji: '💎', region: 'hoenn' }, sablenite: { name: 'Sablenite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  mawilite: { name: 'Mawilite', kind: 'mega', emoji: '💎', region: 'hoenn' }, aggronite: { name: 'Aggronite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  medichamite: { name: 'Medichamite', kind: 'mega', emoji: '💎', region: 'hoenn' }, manectite: { name: 'Manectite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  sharpedonite: { name: 'Sharpedonite', kind: 'mega', emoji: '💎', region: 'hoenn' }, altarianite: { name: 'Altarianite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  banettite: { name: 'Banettite', kind: 'mega', emoji: '💎', region: 'hoenn' }, absolite: { name: 'Absolite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  salamencite: { name: 'Salamencite', kind: 'mega', emoji: '💎', region: 'hoenn' }, metagrossite: { name: 'Metagrossite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  latiasite: { name: 'Latiasite', kind: 'mega', emoji: '💎', region: 'hoenn' }, latiosite: { name: 'Latiosite', kind: 'mega', emoji: '💎', region: 'hoenn' },
  absolite_z: { name: 'Absolite Z', kind: 'mega', emoji: '💎', region: 'hoenn' },
  // Sinnoh (Act 1 S6, pack C16): 4 classic + 5 Legends: Z-A stones. Ids = the queued icon save-as keys EXACTLY (ASSET_PROMPTS
  // Batch 13, assets/ui/icons/<id>.png — the houndoominite lesson). Heatranite + Darkranite: the Safari Mega section ONLY.
  lopunnite: { name: 'Lopunnite', kind: 'mega', emoji: '💎', region: 'sinnoh' }, lucarionite: { name: 'Lucarionite', kind: 'mega', emoji: '💎', region: 'sinnoh' },
  lucarionite_z: { name: 'Lucarionite Z', kind: 'mega', emoji: '💎', region: 'sinnoh' }, abomasite: { name: 'Abomasite', kind: 'mega', emoji: '💎', region: 'sinnoh' },
  garchompite: { name: 'Garchompite', kind: 'mega', emoji: '💎', region: 'sinnoh' }, garchompite_z: { name: 'Garchompite Z', kind: 'mega', emoji: '💎', region: 'sinnoh' },
  staraptite: { name: 'Staraptite', kind: 'mega', emoji: '💎', region: 'sinnoh' }, heatranite: { name: 'Heatranite', kind: 'mega', emoji: '💎', region: 'sinnoh' },
  darkranite: { name: 'Darkranite', kind: 'mega', emoji: '💎', region: 'sinnoh' },
  // Unova (Act 2 U-S6, pack C14): Mega Audino (classic) + the seven Legends: Z-A stones of Unova player lines. Ids = the queued icon
  // save-as keys EXACTLY (ASSET_PROMPTS Batch 14). No Unova legendary has a Mega; no Safari-only stone this region (pack C11).
  audinite: { name: 'Audinite', kind: 'mega', emoji: '💎', region: 'unova' }, emboarite: { name: 'Emboarite', kind: 'mega', emoji: '💎', region: 'unova' },
  excadrite: { name: 'Excadrite', kind: 'mega', emoji: '💎', region: 'unova' }, scraftinite: { name: 'Scraftinite', kind: 'mega', emoji: '💎', region: 'unova' },
  golurkite: { name: 'Golurkite', kind: 'mega', emoji: '💎', region: 'unova' }, chandelurite: { name: 'Chandelurite', kind: 'mega', emoji: '💎', region: 'unova' },
  eelektrossite: { name: 'Eelektrossite', kind: 'mega', emoji: '💎', region: 'unova' }, scolipite: { name: 'Scolipite', kind: 'mega', emoji: '💎', region: 'unova' },
  // Kalos (Kalos + Alola build, pack C14): Diancite (classic) + the nine Legends: Z-A stones of Kalos player lines. Ids = the queued
  // icon save-as keys EXACTLY. U8 (ruled): NO Zygardite — Mega Zygarde takes the Mega Rayquaza gate (own Zygarde + the Kalos Champion).
  diancite: { name: 'Diancite', kind: 'mega', emoji: '💎', region: 'kalos' }, chesnaughtite: { name: 'Chesnaughtite', kind: 'mega', emoji: '💎', region: 'kalos' },
  delphoxite: { name: 'Delphoxite', kind: 'mega', emoji: '💎', region: 'kalos' }, greninjite: { name: 'Greninjite', kind: 'mega', emoji: '💎', region: 'kalos' },
  pyroarite: { name: 'Pyroarite', kind: 'mega', emoji: '💎', region: 'kalos' }, malamarite: { name: 'Malamarite', kind: 'mega', emoji: '💎', region: 'kalos' },
  meowsticite: { name: 'Meowsticite', kind: 'mega', emoji: '💎', region: 'kalos' }, dragalgite: { name: 'Dragalgite', kind: 'mega', emoji: '💎', region: 'kalos' },
  barbaracite: { name: 'Barbaracite', kind: 'mega', emoji: '💎', region: 'kalos' }, hawluchanite: { name: 'Hawluchanite', kind: 'mega', emoji: '💎', region: 'kalos' },
  // Alola (U2a, user ruling): Golisopite + Drampanite — the Legends: Z-A Megas of two Alola player lines (no Z-Crystals anywhere)
  golisopite: { name: 'Golisopite', kind: 'mega', emoji: '💎', region: 'alola' }, drampanite: { name: 'Drampanite', kind: 'mega', emoji: '💎', region: 'alola' },
  // battle items (Phase 5): armed before a battle, used up only when you WIN
  speed_up: { name: 'Speed Up', kind: 'battle', battle: true, emoji: '⏩', blurb: 'The battle runs 1.5× faster' },
  gen_lv8: { name: 'Generator Lv 8', kind: 'battle', battle: true, emoji: '🔋', blurb: 'Start with the AP Generator at Lv 8' },
  xp_bonus: { name: 'XP Bonus', kind: 'battle', battle: true, emoji: '✨', blurb: '+50% team XP from the win' },
  full_ap: { name: 'Full AP Start', kind: 'battle', battle: true, emoji: '💯', blurb: 'Start the battle with full AP' },
  dowsing_machine: { name: 'Dowsing Machine', kind: 'dowsing', battle: true, emoji: '📡', blurb: 'Win to find the stage\'s rarest treasure' },
};
for (const [id, it] of Object.entries(BM.ITEM_INFO)) { it.id = id; it.blurb = it.blurb || (it.kind === 'mega' ? 'A Mega Stone — lets one Pokémon Mega Evolve' : 'Helps a character evolve'); }
BM.ITEMS = Object.fromEntries(Object.entries(BM.ITEM_INFO).map(([id, it]) => [id, it.name])); // id -> name
BM.BAG_ORDER = Object.keys(BM.ITEM_INFO);
BM.BATTLE_ITEMS = BM.BAG_ORDER.filter((id) => BM.ITEM_INFO[id].battle); // pre-battle item row order
// Battle-item effects (tunable): Speed Up multiplier, XP Bonus multiplier.
BM.BATTLE_ITEM_FX = { speedMul: 1.5, xpMul: 1.5 };

// XP curve (§4.3): total XP to reach Lv L = L³, capped at the profile's level cap (Kanto 60 → 216,000).
// RR1 CAP LADDER (Johto prompt Step 1): the GLOBAL level cap is a ladder value — 60 in Kanto, 65 once Johto is unlocked (Kanto
// beaten), 70 with Hoenn… — for every line, everywhere. The XP curve never changes; a line held at a cap simply keeps earning
// towards the next one. BM.C.LEVEL_CAP stays the base rung (60).
BM.CAP_LADDER = { kanto: 60, johto: 65, hoenn: 70, sinnoh: 75, unova: 80, kalos: 85, alola: 90 }; // Sinnoh + Unova prompt S1 / U-S1: 75 · 80; Kalos + Alola build: 85 · 90
BM.levelCap = (p) => { let cap = BM.C.LEVEL_CAP; for (const r of BM.REGION_ORDER) if (BM.CAP_LADDER[r] && BM.regionReached(r, p)) cap = Math.max(cap, BM.CAP_LADDER[r]); return cap; };
BM.xpForLevel = (lv) => Math.pow(lv, 3);
BM.levelFromXp = (xp, cap = BM.C.LEVEL_CAP) => Math.max(1, Math.min(cap, Math.floor(Math.cbrt(Math.max(1, xp)) + 1e-9)));

// EEE1 (Phase 7.6): REGION GATES on evolutions. A region counts as REACHED only once it has shipped AND the region before it is
// beaten (beating Kanto unlocks Johto — the regionsDone flag from Phase 7). Johto prompt Step 1: Johto SHIPS — a profile that has
// beaten Kanto reaches it (its home card goes live, the cap rises to 65, `requiresRegion: 'johto'` evolutions open).
BM.SHIPPED_REGIONS = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola']; // Hoenn prompt Step 1: Hoenn ships, reached once Johto is beaten (cap 70); Sinnoh Act 1 S1: Sinnoh, once the Hoenn Champion is beaten (cap 75); Unova Act 2 U-S1: Unova, once the Sinnoh Champion is beaten (cap 80); Kalos + Alola build: Kalos once the Unova region is done (N's Castle, cap 85), Alola once the Kalos Champion is beaten (cap 90)
BM.REGION_ORDER = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];
BM.REGION_NAMES = { kanto: 'Kanto', johto: 'Johto', hoenn: 'Hoenn', sinnoh: 'Sinnoh', unova: 'Unova', kalos: 'Kalos', alola: 'Alola', galar: 'Galar', paldea: 'Paldea' };
BM.regionReached = (region, p) => {
  if (!BM.SHIPPED_REGIONS.includes(region)) return false;
  const i = BM.REGION_ORDER.indexOf(region);
  return i <= 0 || !!(p && p.regionsDone && p.regionsDone[BM.REGION_ORDER[i - 1]]);
};
BM.evoGateOpen = (form, p) => !(form.evo && form.evo.requiresRegion) || BM.regionReached(form.evo.requiresRegion, p);
// the honest lock label, in kid words: "Needs a Sun Stone · Unlocks when you reach Johto."
BM.evoLockText = (form) => `Needs a ${BM.ITEMS[form.evo.item] || 'special item'} · Unlocks when you reach ${BM.REGION_NAMES[form.evo.requiresRegion]}.`;
