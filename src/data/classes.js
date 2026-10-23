// Playable classes.
export const classes = [
  {
    id: 'emberwright',
    name: 'Emberwright',
    hp: 70,
    blurb: 'A smith of living fire. Every wound is fuel; every turn burns a little brighter.',
    starting_deck: ['ew_strike', 'ew_strike', 'ew_strike', 'ew_strike', 'ew_strike',
      'ew_guard', 'ew_guard', 'ew_guard', 'ew_guard', 'ew_spark'],
    starting_relic: 'r_kindling',
    card_pool_prefix: 'ew_',
  },
  {
    id: 'verdant',
    name: 'Verdant',
    hp: 75,
    blurb: 'A gardener of strange, fast-growing things. Patience, thorns, and green stubbornness.',
    starting_deck: ['vd_strike', 'vd_strike', 'vd_strike', 'vd_strike', 'vd_strike',
      'vd_guard', 'vd_guard', 'vd_guard', 'vd_guard', 'vd_bloom'],
    starting_relic: 'r_rootbound',
    card_pool_prefix: 'vd_',
  },
  {
    id: 'gravewarden',
    name: 'Gravewarden',
    hp: 70,
    blurb: 'A keeper of quiet doors. Controls the fight so thoroughly that it ends by itself.',
    starting_deck: ['gw_strike', 'gw_strike', 'gw_strike', 'gw_strike', 'gw_strike',
      'gw_guard', 'gw_guard', 'gw_guard', 'gw_guard', 'gw_grasp'],
    starting_relic: 'r_lastbreath',
    card_pool_prefix: 'gw_',
  },
];
