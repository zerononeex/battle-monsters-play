// Full 18-type effectiveness chart (attacking type -> defending type multiplier).
// Only non-1x entries are listed. Dual-type defenders multiply both entries (4x / 0.25x / 0).
window.BM = window.BM || {};
BM.TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

BM.TYPE_COLORS = {
  normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#f7d02c', grass: '#7ac74c',
  ice: '#96d9d6', fighting: '#c22e28', poison: '#a33ea1', ground: '#e2bf65', flying: '#a98ff3',
  psychic: '#f95587', bug: '#a6b91a', rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc',
  dark: '#705746', steel: '#b7b7ce', fairy: '#d685ad',
};

BM.TYPE_CHART = {
  normal:   { '0.5': ['rock', 'steel'], '0': ['ghost'] },
  fire:     { '2': ['grass', 'ice', 'bug', 'steel'], '0.5': ['fire', 'water', 'rock', 'dragon'] },
  water:    { '2': ['fire', 'ground', 'rock'], '0.5': ['water', 'grass', 'dragon'] },
  electric: { '2': ['water', 'flying'], '0.5': ['electric', 'grass', 'dragon'], '0': ['ground'] },
  grass:    { '2': ['water', 'ground', 'rock'], '0.5': ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'] },
  ice:      { '2': ['grass', 'ground', 'flying', 'dragon'], '0.5': ['fire', 'water', 'ice', 'steel'] },
  fighting: { '2': ['normal', 'ice', 'rock', 'dark', 'steel'], '0.5': ['poison', 'flying', 'psychic', 'bug', 'fairy'], '0': ['ghost'] },
  poison:   { '2': ['grass', 'fairy'], '0.5': ['poison', 'ground', 'rock', 'ghost'], '0': ['steel'] },
  ground:   { '2': ['fire', 'electric', 'poison', 'rock', 'steel'], '0.5': ['grass', 'bug'], '0': ['flying'] },
  flying:   { '2': ['grass', 'fighting', 'bug'], '0.5': ['electric', 'rock', 'steel'] },
  psychic:  { '2': ['fighting', 'poison'], '0.5': ['psychic', 'steel'], '0': ['dark'] },
  bug:      { '2': ['grass', 'psychic', 'dark'], '0.5': ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'] },
  rock:     { '2': ['fire', 'ice', 'flying', 'bug'], '0.5': ['fighting', 'ground', 'steel'] },
  ghost:    { '2': ['psychic', 'ghost'], '0.5': ['dark'], '0': ['normal'] },
  dragon:   { '2': ['dragon'], '0.5': ['steel'], '0': ['fairy'] },
  dark:     { '2': ['psychic', 'ghost'], '0.5': ['fighting', 'dark', 'fairy'] },
  steel:    { '2': ['ice', 'rock', 'fairy'], '0.5': ['fire', 'water', 'electric', 'steel'] },
  fairy:    { '2': ['fighting', 'dragon', 'dark'], '0.5': ['fire', 'poison', 'steel'] },
};

// Multiplier for an attack of `atkType` against a defender with `defTypes` (array). No type = 1.
BM.typeMultiplier = function (atkType, defTypes) {
  if (!atkType || !defTypes) return 1;
  const row = BM.TYPE_CHART[atkType];
  let m = 1;
  for (const d of defTypes) {
    for (const k of ['2', '0.5', '0']) {
      if (row[k] && row[k].includes(d)) m *= Number(k);
    }
  }
  return m;
};
