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
  leaf_stone: { name: 'Leaf Stone', kind: 'evo', emoji: '🍃' },
  ice_stone: { name: 'Ice Stone', kind: 'evo', emoji: '❄️' },
  metal_coat: { name: 'Metal Coat', kind: 'evo', emoji: '🔩' },
  black_augurite: { name: 'Black Augurite', kind: 'evo', emoji: '🪨' },
  up_grade: { name: 'Up-Grade', kind: 'evo', emoji: '💾' },
  dubious_disc: { name: 'Dubious Disc', kind: 'evo', emoji: '💿' },
  poke_ball: { name: 'Poké Ball', kind: 'ball', emoji: '🔴', blurb: '1 = one pull · 9 = a 10-pull' },
  master_ball: { name: 'Master Ball', kind: 'ball', emoji: '🟣', blurb: 'Opens the Legendary Gacha' },
  // battle items (Phase 5): armed before a battle, used up only when you WIN
  speed_up: { name: 'Speed Up', kind: 'battle', battle: true, emoji: '⏩', blurb: 'The battle runs 1.5× faster' },
  gen_lv8: { name: 'Generator Lv 8', kind: 'battle', battle: true, emoji: '🔋', blurb: 'Start with the AP Generator at Lv 8' },
  xp_bonus: { name: 'XP Bonus', kind: 'battle', battle: true, emoji: '✨', blurb: '+50% team XP from the win' },
  full_ap: { name: 'Full AP Start', kind: 'battle', battle: true, emoji: '💯', blurb: 'Start the battle with full AP' },
  dowsing_machine: { name: 'Dowsing Machine', kind: 'dowsing', battle: true, emoji: '📡', blurb: 'Win to find the stage\'s rarest treasure' },
};
for (const [id, it] of Object.entries(BM.ITEM_INFO)) { it.id = id; it.blurb = it.blurb || 'Helps a character evolve'; }
BM.ITEMS = Object.fromEntries(Object.entries(BM.ITEM_INFO).map(([id, it]) => [id, it.name])); // id -> name
BM.BAG_ORDER = Object.keys(BM.ITEM_INFO);
BM.BATTLE_ITEMS = BM.BAG_ORDER.filter((id) => BM.ITEM_INFO[id].battle); // pre-battle item row order
// Battle-item effects (tunable): Speed Up multiplier, XP Bonus multiplier.
BM.BATTLE_ITEM_FX = { speedMul: 1.5, xpMul: 1.5 };

// XP curve (§4.3): total XP to reach Lv L = L³, capped at BM.C.LEVEL_CAP (60 → 216,000).
BM.xpForLevel = (lv) => Math.pow(lv, 3);
BM.levelFromXp = (xp) => Math.max(1, Math.min(BM.C.LEVEL_CAP, Math.floor(Math.cbrt(Math.max(1, xp)) + 1e-9)));
