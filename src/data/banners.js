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
// Banners the profile can see: its reached regions' (Kanto always; Johto once Kanto is beaten)
BM.bannersFor = (p) => BM.BANNERS.filter((b) => BM.regionReached(b.region, p));
// Every line a banner can give (legendaries + the rest).
BM.bannerPool = (b) => [...b.legendaries, ...b.lines];
