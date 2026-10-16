// STANDING RULE for every region's banners (user, locked 2026-10-12 — design addendum "SAFARI ZONE LEGENDARY POOL RULE"):
// a region's Safari Zone banners together carry that region's FULL legendary set, EXCEPT the single beat-the-region reward
// legendary, which stays rewardOnly and is NEVER pullable (Mewtwo / Lugia / Rayquaza pattern). Region builders: every other
// legendary / mythical of the new region goes on one of its banners. The 2% legendary rate does not change.
//
// Kanto gacha banners — DATA ONLY in Phase 3 (pulls, rates, pity and the reveal are built in Phase 5).
// BUILD_PLAN §4.8 as amended 2026-10-10: Mewtwo is NOT in any pool (he is the beat-Kanto reward, rewardOnly);
// the Kanto legendaries are the birds + Mew, two per banner, and a banner's pity guarantees one of ITS two.
// The 3 starters are free and on neither banner. A line only becomes pullable once its art is DONE (§2).
window.BM = window.BM || {};
BM.BANNERS = [
  {
    id: 'kanto_a', region: 'kanto', name: 'Kanto Banner A',
    legendaries: ['articuno', 'zapdos'],
    lines: ['pikachu', 'magikarp', 'abra', 'gastly', 'cubone', 'growlithe', 'pinsir', 'scyther', 'porygon', 'meowth',
      'eevee_water', 'eevee_fire', 'eevee_psychic', 'eevee_ice'],
  },
  {
    id: 'kanto_b', region: 'kanto', name: 'Kanto Banner B',
    legendaries: ['moltres', 'mew'],
    lines: ['jigglypuff', 'machop', 'vulpix', 'lapras', 'snorlax', 'dratini', 'psyduck', 'ditto', 'aerodactyl',
      'scyther_kleavor', 'meowth_galar', 'eevee_electric', 'eevee_dark', 'eevee_grass', 'eevee_fairy'],
  },
];
// JOHTO (Johto prompt v9 Step 3): two Johto banners, same economy as Kanto (30 / 45 / 17 / 8 loot mix, legendary 2% per pull,
// guaranteed by the 100th pull — batch1 step 5; HHH1 was 60 — non-legendary pulls favour unowned 75%, dupes → XP Candy L worth). Shown in the Safari Zone
// once the profile REACHES Johto (Kanto beaten). Banner A = Raikou + Entei · Banner B = Suicune + Ho-Oh + Celebi (mythical, Mew's
// slot). LUGIA IS ON NO BANNER (rewardOnly: the Johto Champion's first clear — the Mewtwo rule). The Johto lines handed out as stage
// gifts (Cyndaquil, Totodile, Chikorita — Professor Elm's three —, Togepi, the Bellossom-branch Oddish, Shuckle) are on neither
// banner, like Kanto's starters; the other 24 lines are split in two (branch pairs apart, the Meowth / Galar Meowth precedent).
BM.BANNERS.push(
  {
    id: 'johto_a', region: 'johto', name: 'Johto Banner A', short: 'Johto A',
    legendaries: ['raikou', 'entei'],
    lines: ['marill', 'wooper', 'murkrow', 'girafarig', 'pineco', 'snubbull', 'sneasel', 'slugma', 'houndour', 'phanpy', 'elekid', 'larvitar'],
  },
  {
    id: 'johto_b', region: 'johto', name: 'Johto Banner B', short: 'Johto B',
    legendaries: ['suicune', 'ho_oh', 'celebi'],
    lines: ['wooper_paldea', 'misdreavus', 'wobbuffet', 'dunsparce', 'sneasel_hisui', 'teddiursa', 'swinub', 'corsola', 'corsola_galar', 'delibird', 'smeargle', 'magby'],
  },
);
// HOENN (Hoenn prompt Step 3, prep C2/C3 "Ruby / Sapphire" — Kakashi's locked call): same economy, shown once the profile REACHES
// Hoenn (Johto beaten). Banner A ("Ruby") = Groudon + Latios + Regirock + Registeel + Jirachi (mythical slot) · Banner B ("Sapphire")
// = Kyogre + Latias + Regice + Deoxys (mythical slot). Per-legendary odds are lower with 5 / 4 legendaries per banner — accepted;
// the 2% rate and the 60-pull guarantee are unchanged. RAYQUAZA IS ON NO BANNER (rewardOnly: the Hoenn Champion's first clear).
// 12 non-legendary lines each: version exclusives follow their version (Mawile → A, Sableye → B), the pseudo-legendaries split
// (Bagon A, Beldum B), the Ralts branches apart. The starters (Treecko, Torchic, Mudkip — stage gifts) are on neither banner.
BM.BANNERS.push(
  {
    id: 'hoenn_a', region: 'hoenn', name: 'Hoenn Banner A', short: 'Hoenn A', theme: 'Ruby',
    legendaries: ['groudon', 'latios', 'regirock', 'registeel', 'jirachi'],
    lines: ['ralts_gallade', 'mawile', 'aron', 'meditite', 'electrike', 'plusle', 'trapinch', 'cacnea', 'corphish', 'shuppet', 'absol', 'bagon'],
  },
  {
    id: 'hoenn_b', region: 'hoenn', name: 'Hoenn Banner B', short: 'Hoenn B', theme: 'Sapphire',
    legendaries: ['kyogre', 'latias', 'regice', 'deoxys'],
    lines: ['ralts', 'sableye', 'minun', 'carvanha', 'wailmer', 'spoink', 'swablu', 'barboach', 'feebas', 'duskull', 'spheal', 'beldum'],
  },
);
// SINNOH (Sinnoh + Unova prompt Act 1 S3, pack C2 / C3 — "Diamond / Pearl", 6 + 6 legendaries): same economy, the guarantee on the
// 100th pull; shown once the profile REACHES Sinnoh (Hoenn beaten). Banner A ("Diamond", time) = Dialga + Heatran + Regigigas + Uxie +
// Darkrai + Shaymin (the two mythicals) · Banner B ("Pearl", space) = Palkia + Cresselia + Mesprit + Azelf + Enamorus + Manaphy.
// GIRATINA (the Champion's reward) and ARCEUS (node 26's reward) are on NO banner. 12 lines each: Cranidos / Stunky (Diamond) → A,
// Shieldon / Glameow (Pearl) → B; the one pseudo (Gible) → A, the other Super Rare (Spiritomb) → B; Riolu on A AND the stage-13 gift
// (the Beldum precedent). The starters + the Hisuian Typhlosion branch (stage gifts) are on neither.
BM.BANNERS.push(
  {
    id: 'sinnoh_a', region: 'sinnoh', name: 'Sinnoh Banner A', short: 'Sinnoh A', theme: 'Diamond',
    legendaries: ['dialga', 'heatran', 'regigigas', 'uxie', 'darkrai', 'shaymin'],
    lines: ['shinx', 'cranidos', 'combee', 'drifloon', 'stunky', 'riolu', 'snover', 'gible', 'starly', 'hippopotas', 'bronzor', 'growlithe_hisui'],
  },
  {
    id: 'sinnoh_b', region: 'sinnoh', name: 'Sinnoh Banner B', short: 'Sinnoh B', theme: 'Pearl',
    legendaries: ['palkia', 'cresselia', 'mesprit', 'azelf', 'enamorus', 'manaphy'],
    lines: ['roselia', 'buizel', 'buneary', 'croagunk', 'rotom', 'shieldon', 'glameow', 'pachirisu', 'skorupi', 'spiritomb', 'shellos', 'finneon'],
  },
);
// UNOVA (Act 2 U-S3, pack C4 / C5 — "Black / White", 6 + 6 legendaries, two mythicals each): shown once the profile REACHES Unova
// (Sinnoh beaten). Banner A ("Black") = Reshiram + Tornadus + Cobalion + Terrakion + Victini + Meloetta · Banner B ("White") = Zekrom +
// Thundurus + Virizion + Landorus + Keldeo + Genesect. KYUREM (N's Castle reward) is on NO banner; Enamorus stays on Sinnoh B.
// Lines: version exclusives follow their version (Vullaby / Cottonee → A, Rufflet / Petilil → B); branch pairs apart (Zorua A / Hisuian
// Zorua B, Rufflet B / Hisuian Braviary A, Petilil B / Hisuian Lilligant A); the pseudo Deino → A, the other Super Rare Larvesta → B;
// Basculegion (user ruling) → A. The starters + the Hisuian Samurott branch (stage gifts) are on neither.
BM.BANNERS.push(
  {
    id: 'unova_a', region: 'unova', name: 'Unova Banner A', short: 'Unova A', theme: 'Black',
    legendaries: ['reshiram', 'tornadus', 'cobalion', 'terrakion', 'victini', 'meloetta'],
    lines: ['zorua', 'drilbur', 'scraggy', 'golett', 'deino', 'vullaby', 'cottonee', 'timburr', 'pawniard', 'archen', 'rufflet_braviary_hisui', 'petilil_lilligant_hisui', 'basculin_white_striped'],
  },
  {
    id: 'unova_b', region: 'unova', name: 'Unova Banner B', short: 'Unova B', theme: 'White',
    legendaries: ['zekrom', 'thundurus', 'virizion', 'landorus', 'keldeo', 'genesect'],
    lines: ['zorua_hisui', 'joltik', 'litwick', 'tynamo', 'venipede', 'audino', 'axew', 'rufflet', 'petilil', 'sandile', 'tirtouga', 'emolga', 'larvesta'],
  },
);
// KALOS (Kalos + Alola build, pack C4 — "X / Y", U4 as drafted: 3 + 2 legendaries; Kalos has no regular legendary, so the banners are thin
// — canon, nothing padded): shown once the profile REACHES Kalos (Unova beaten). Banner A ("X") = Xerneas + Diancie + Volcanion (the two
// mythical slots) · Banner B ("Y") = Yveltal + Hoopa. ZYGARDE (Diantha's reward) is on NO banner. 12 lines each: X exclusives (Swirlix,
// Clauncher) → A, Y exclusives (Spritzee, Skrelp) → B; the fossils split (Tyrunt A / Amaura B); branch pairs apart (Goomy A / Hisuian
// Goodra B, Bergmite B / Hisuian Avalugg A). The starters (stage gifts) are on neither.
BM.BANNERS.push(
  {
    id: 'kalos_a', region: 'kalos', name: 'Kalos Banner A', short: 'Kalos A', theme: 'X',
    legendaries: ['xerneas', 'diancie', 'volcanion'],
    lines: ['fletchling', 'litleo', 'honedge', 'swirlix', 'clauncher', 'tyrunt', 'inkay', 'goomy', 'noibat', 'helioptile', 'espurr', 'bergmite_avalugg_hisui'],
  },
  {
    id: 'kalos_b', region: 'kalos', name: 'Kalos Banner B', short: 'Kalos B', theme: 'Y',
    legendaries: ['yveltal', 'hoopa'],
    lines: ['flabebe', 'pancham', 'spritzee', 'skrelp', 'amaura', 'binacle', 'hawlucha', 'phantump', 'pumpkaboo', 'klefki', 'bergmite', 'goomy_goodra_hisui'],
  },
);
// ALOLA (Kalos + Alola build, pack C4 + the user's U2b ruling — "Ultra Sun / Ultra Moon"): shown once the profile REACHES Alola (Kalos
// beaten). The ruling's tier (the 4 Tapus + the 7 Sun / Moon Ultra Beasts) split 6 / 5, and the HELD lines PLACED (U2b): A gains
// Blacephalon, Marshadow, Zeraora; B gains Stakataka, the Poipole line, Magearna, the Meltan line → A 9 legendaries · B 9.
// SOLGALEO + LUNALA (Kukui's reward), NECROZMA (node 27) and TYPE: NULL (the node-17 gift) are on NO banner. 13 lines each: version
// exclusives follow their version (Turtonator, Lycanroc Midday, Alolan Sandshrew → A; Drampa, Lycanroc Midnight, Alolan Vulpix → B);
// branch pairs apart; one Super Rare each (Jangmo-o A / Mimikyu B). The starters + the Hisuian Decidueye branch (gifts) are on neither.
BM.BANNERS.push(
  {
    id: 'alola_a', region: 'alola', name: 'Alola Banner A', short: 'Alola A', theme: 'Ultra Sun',
    legendaries: ['tapu_koko', 'tapu_bulu', 'buzzwole', 'kartana', 'xurkitree', 'guzzlord', 'blacephalon', 'marshadow', 'zeraora'],
    lines: ['pikipek', 'grubbin', 'rockruff', 'mareanie', 'fomantis', 'stufful', 'jangmo_o', 'turtonator', 'rattata_alola', 'sandshrew_alola', 'diglett_alola', 'grimer_alola', 'pikachu_raichu_alola'],
  },
  {
    id: 'alola_b', region: 'alola', name: 'Alola Banner B', short: 'Alola B', theme: 'Ultra Moon',
    legendaries: ['tapu_lele', 'tapu_fini', 'pheromosa', 'celesteela', 'nihilego', 'stakataka', 'poipole', 'magearna', 'meltan'],
    lines: ['cutiefly', 'rockruff_lycanroc_midnight', 'dewpider', 'salandit', 'bounsweet', 'wimpod', 'mimikyu', 'drampa', 'vulpix_alola', 'meowth_alola', 'geodude_alola', 'exeggcute_exeggutor_alola', 'cubone_marowak_alola'],
  },
);
// GALAR (Galar + Paldea build, pack C5 + Kakashi ruling 1 — "Sword / Shield"): shown once the profile REACHES Galar (Alola beaten).
// Ruling 1 moved the Kubfu → Urshifu lines OFF the banners (the Isle of Armor node 26 gift) → A 5 legendaries · B 5. ZACIAN + ZAMAZENTA
// (Leon's reward) are on NO banner. 13 lines each (the pack's C5 sets — removing the Kubfu lines touches the legendary slots only):
// version exclusives follow their version (Flapple, Stonjourner, Galarian Farfetch'd / Darumaka → A; Appletun, Eiscue, Galarian Ponyta →
// B); branch pairs apart (Flapple A / Appletun B, Galarian Slowbro A / Slowking B); one Super Rare each (Dreepy A / Duraludon B).
BM.BANNERS.push(
  {
    id: 'galar_a', region: 'galar', name: 'Galar Banner A', short: 'Galar A', theme: 'Sword',
    legendaries: ['eternatus', 'regieleki', 'glastrier', 'zapdos_galar', 'moltres_galar'],
    lines: ['rookidee', 'wooloo', 'rolycoly', 'applin', 'sizzlipede', 'hatenna', 'stonjourner', 'dreepy', 'farfetchd_galar', 'darumaka_galar', 'zigzagoon_galar', 'slowpoke_galar', 'yamask_galar'],
  },
  {
    id: 'galar_b', region: 'galar', name: 'Galar Banner B', short: 'Galar B', theme: 'Shield',
    legendaries: ['calyrex', 'regidrago', 'spectrier', 'zarude', 'articuno_galar'],
    lines: ['yamper', 'chewtle', 'applin_appletun', 'toxtricity', 'sinistea', 'impidimp', 'eiscue', 'duraludon', 'ponyta_galar', 'slowpoke_slowking_galar', 'mr_mime_galar', 'stunfisk_galar', 'koffing_weezing_galar'],
  },
);
// PALDEA (Galar + Paldea build, pack C3 — ruling 4: TWO banners as drafted, "Scarlet / Violet"): shown once the profile REACHES Paldea
// (Leon beaten). A = the 10 ANCIENT Paradox species + Ting-Lu, Chi-Yu, Okidogi, Ogerpon (14) · B = the 10 FUTURE Paradox species +
// Wo-Chien, Chien-Pao, Munkidori, Fezandipiti, Pecharunt (15). KORAIDON + MIRAIDON (Geeta's reward) and TERAPAGOS (Area Zero) are on NO
// banner. 13 lines each; Armarouge A / Ceruledge B apart; one Super Rare each (Frigibax A / Gimmighoul B). Archaludon rides Galar B's
// Duraludon line.
BM.BANNERS.push(
  {
    id: 'paldea_a', region: 'paldea', name: 'Paldea Banner A', short: 'Paldea A', theme: 'Scarlet',
    legendaries: ['great_tusk', 'scream_tail', 'brute_bonnet', 'flutter_mane', 'slither_wing', 'sandy_shocks', 'roaring_moon', 'walking_wake', 'gouging_fire', 'raging_bolt', 'ting_lu', 'chi_yu', 'okidogi', 'ogerpon'],
    lines: ['pawmi', 'fidough', 'smoliv', 'nacli', 'charcadet', 'tinkatink', 'frigibax', 'maschiff', 'capsakid', 'varoom', 'tauros_paldea', 'applin_dipplin', 'mankey'],
  },
  {
    id: 'paldea_b', region: 'paldea', name: 'Paldea Banner B', short: 'Paldea B', theme: 'Violet',
    legendaries: ['iron_treads', 'iron_bundle', 'iron_hands', 'iron_jugulis', 'iron_moth', 'iron_thorns', 'iron_valiant', 'iron_leaves', 'iron_boulder', 'iron_crown', 'wo_chien', 'chien_pao', 'munkidori', 'fezandipiti', 'pecharunt'],
    lines: ['tandemaus', 'charcadet_ceruledge', 'tadbulb', 'wattrel', 'shroodle', 'finizen', 'greavard', 'glimmet', 'gimmighoul', 'poltchageist', 'flittle', 'cetoddle', 'tatsugiri'],
  },
);
// Banners the profile can see: its reached regions' (Kanto always; Johto once Kanto is beaten)
BM.bannersFor = (p) => BM.BANNERS.filter((b) => BM.regionReached(b.region, p));
// Every line a banner can give (legendaries + the rest).
BM.bannerPool = (b) => [...b.legendaries, ...b.lines];
