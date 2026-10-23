export const cards = [
  // BASIC CARDS
  {
    id: 'ew_strike',
    name: 'Strike',
    art: '🗡',
    cost: 1,
    type: 'attack',
    rarity: 'basic',
    target: 'enemy',
    text: 'Deal $dmg damage.',
    base: { dmg: 6 },
    up: { dmg: 4 },
    effects: [ { t: 'damage', n: '$dmg' } ],
  },
  {
    id: 'ew_guard',
    name: 'Guard',
    art: '🛡',
    cost: 1,
    type: 'skill',
    rarity: 'basic',
    target: 'self',
    text: 'Gain $blk Block.',
    base: { blk: 6 },
    up: { blk: 4 },
    effects: [ { t: 'block', n: '$blk' } ],
  },
  // COMMON CARDS
  {
    id: 'ew_emberlash',
    name: 'Ember Lash',
    art: '🕯',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. Gain $str Strength. Lose $hp HP.',
    base: { dmg: 7, str: 1, hp: 2 },
    up: { dmg: 3, str: 1, hp: 0 },
    effects: [
      { t: 'damage', n: '$dmg' },
      { t: 'buff', target: 'self', buff: 'strength', n: '$str' },
      { t: 'self_damage', n: '$hp' }
    ]
  },
  {
    id: 'ew_flamewhip',
    name: 'Flame Whip',
    art: '🔥',
    cost: 2,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. Apply $vul Vulnerable.',
    base: { dmg: 15, vul: 2 },
    up: { dmg: 5, vul: 1 },
    effects: [
      { t: 'damage', n: '$dmg' },
      { t: 'buff', target: 'target', buff: 'vulnerable', n: '$vul' }
    ]
  },
  {
    id: 'ew_ragingblow',
    name: 'Raging Blow',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. If you have Strength, deal $bonus more.',
    base: { dmg: 7, bonus: 3 },
    up: { dmg: 3, bonus: 2 },
    effects: [
      { t: 'damage', n: '$dmg' },
      { t: 'damage', n: '$bonus', when: { buff: 'strength' } }
    ]
  },
  {
    id: 'ew_sear',
    name: 'Sear',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. Apply $psn Poison.',
    base: { dmg: 6, psn: 2 },
    up: { dmg: 2, psn: 1 },
    effects: [
      { t: 'damage', n: '$dmg' },
      { t: 'buff', target: 'target', buff: 'poison', n: '$psn' }
    ]
  },
  {
    id: 'ew_hotblood',
    name: 'Hot-Blooded',
    art: '🩸',
    cost: 1,
    type: 'power',
    rarity: 'common',
    target: 'self',
    text: 'Lose $hp HP. Gain $str Strength.',
    base: { hp: 1, str: 1 },
    up: { hp: 0, str: 1 },
    effects: [
      { t: 'self_damage', n: '$hp' },
      { t: 'buff', target: 'self', buff: 'strength', n: '$str' }
    ]
  },
  {
    id: 'ew_ignite',
    name: 'Ignite',
    art: '🔥',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    target: 'self',
    text: 'Gain $blk Block. Apply $psn Poison to all enemies.',
    base: { blk: 5, psn: 1 },
    up: { blk: 3, psn: 1 },
    effects: [
      { t: 'block', n: '$blk' },
      { t: 'buff', target: 'all_enemies', buff: 'poison', n: '$psn' }
    ]
  },
  // UNCOMMON CARDS
  {
    id: 'ew_conflagrate',
    name: 'Conflagrate',
    cost: 2,
    type: 'attack',
    rarity: 'uncommon',
    target: 'all_enemies',
    text: 'Deal $dmg damage to ALL enemies. Apply $vul Vulnerable.',
    base: { dmg: 10, vul: 1 },
    up: { dmg: 5, vul: 1 },
    effects: [
      { t: 'damage', n: '$dmg', hits: 'all' },
      { t: 'buff', target: 'all_enemies', buff: 'vulnerable', n: '$vul' }
    ]
  },
  {
    id: 'ew_adrenal_burn',
    name: 'Adrenal Burn',
    art: '🔥',
    cost: 0,
    type: 'skill',
    rarity: 'uncommon',
    target: 'self',
    text: 'Draw $n cards. Lose $hp HP.',
    base: { n: 2, hp: 1 },
    up: { n: 1, hp: 0 },
    effects: [
      { t: 'draw', n: '$n' },
      { t: 'self_damage', n: '$hp' }
    ]
  },
  {
    id: 'ew_heatup',
    name: 'Heat Up',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    target: 'self',
    text: 'Gain $str Strength.',
    base: { str: 1 },
    up: { str: 1 },
    effects: [ { t: 'buff', target: 'self', buff: 'strength', n: '$str' } ]
  },
  {
    id: 'ew_pyreform',
    name: 'Pyreform',
    art: '🔥',
    cost: 2,
    type: 'skill',
    rarity: 'uncommon',
    target: 'self',
    text: 'Gain $blk Block. Heal $hp HP.',
    base: { blk: 12, hp: 3 },
    up: { blk: 4, hp: 2 },
    effects: [ { t: 'block', n: '$blk' }, { t: 'heal', n: '$hp' } ]
  },
  {
    id: 'ew_burningrage',
    name: 'Burning Rage',
    art: '🔥',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    target: 'self',
    text: 'Gain $str Strength. Lose $hp HP.',
    base: { str: 2, hp: 1 },
    up: { str: 1, hp: 0 },
    effects: [
      { t: 'buff', target: 'self', buff: 'strength', n: '$str' },
      { t: 'self_damage', n: '$hp' }
    ]
  },
  {
    id: 'ew_blazingfinish',
    name: 'Blazing Finish',
    cost: 1,
    type: 'attack',
    rarity: 'uncommon',
    target: 'enemy',
    text: 'Deal $dmg damage. If enemy is Vulnerable, deal $bonus more.',
    base: { dmg: 8, bonus: 6 },
    up: { dmg: 3, bonus: 2 },
    effects: [ { t: 'damage', n: '$dmg' }, { t: 'damage', n: '$bonus', when: { buff: 'vulnerable', target: 'target' } } ]
  },
  {
    id: 'ew_emberstorm',
    name: 'Emberstorm',
    art: '🕯',
    cost: 2,
    type: 'attack',
    rarity: 'uncommon',
    target: 'all_enemies',
    text: 'Deal $dmg damage to ALL enemies.',
    base: { dmg: 11 },
    up: { dmg: 6 },
    effects: [ { t: 'damage', n: '$dmg', hits: 'all' } ]
  },
  // RARE CARDS
  {
    id: 'ew_pyroclasm',
    name: 'Pyroclasm',
    art: '🌋',
    cost: 3,
    type: 'attack',
    rarity: 'rare',
    target: 'all_enemies',
    text: 'Deal $dmg damage to ALL enemies. Apply $psn Poison.',
    base: { dmg: 22, psn: 3 },
    up: { dmg: 6, psn: 2 },
    effects: [
      { t: 'damage', n: '$dmg', hits: 'all' },
      { t: 'buff', target: 'all_enemies', buff: 'poison', n: '$psn' }
    ]
  },
  {
    id: 'ew_burningsoul',
    name: 'Burning Soul',
    art: '🔥',
    cost: 2,
    type: 'power',
    rarity: 'rare',
    target: 'self',
    text: 'Gain $str Strength and $dex Dexterity.',
    base: { str: 2, dex: 2 },
    up: { str: 1, dex: 1 },
    effects: [
      { t: 'buff', target: 'self', buff: 'strength', n: '$str' },
      { t: 'buff', target: 'self', buff: 'dexterity', n: '$dex' }
    ]
  },
  {
    id: 'ew_volcanicrush',
    name: 'Volcanic Rush',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    target: 'enemy',
    text: 'Deal $dmg damage. If enemy is Poisoned, apply $vul Vulnerable.',
    base: { dmg: 28, vul: 3 },
    up: { dmg: 5, vul: 1 },
    effects: [ { t: 'damage', n: '$dmg' }, { t: 'buff', target: 'target', buff: 'vulnerable', n: '$vul' } ]
  },
  {
    id: 'ew_berserker',
    name: 'Berserker',
    art: '😤',
    cost: 3,
    type: 'power',
    rarity: 'rare',
    target: 'self',
    text: 'Gain $str Strength.',
    base: { str: 2 },
    up: { str: 1 },
    effects: [ { t: 'buff', target: 'self', buff: 'strength', n: '$str' } ]
  },
  {
    id: 'ew_moltenarmor',
    name: 'Molten Armor',
    cost: 2,
    type: 'skill',
    rarity: 'rare',
    target: 'self',
    text: 'Gain $blk Block. At end of turn, gain $blk2 Block.',
    base: { blk: 14, blk2: 6 },
    up: { blk: 4, blk2: 2 },
    effects: [ { t: 'block', n: '$blk' }, { t: 'buff', target: 'self', buff: 'metallicize', n: '$blk2' } ]
  },
  {
    id: 'ew_recklessfury',
    name: 'Reckless Fury',
    art: '😤',
    cost: 0,
    type: 'skill',
    rarity: 'rare',
    target: 'self',
    text: 'Lose $hp HP. Draw $n cards. Gain $ene Energy.',
    base: { hp: 4, n: 3, ene: 1 },
    up: { hp: 0, n: 1, ene: 1 },
    effects: [
      { t: 'self_damage', n: '$hp' },
      { t: 'draw', n: '$n' },
      { t: 'energy', n: '$ene' }
    ]
  },
  // More commons to reach 20 cards
  {
    id: 'ew_scorch',
    name: 'Scorch',
    art: '☀',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. Apply $frail Frail.',
    base: { dmg: 9, frail: 1 },
    up: { dmg: 3, frail: 1 },
    effects: [ { t: 'damage', n: '$dmg' }, { t: 'buff', target: 'target', buff: 'frail', n: '$frail' } ]
  },
  {
    id: 'ew_fireform',
    name: 'Fireform',
    art: '🔥',
    cost: 2,
    type: 'power',
    rarity: 'uncommon',
    target: 'self',
    text: 'Gain $thn Thorns.',
    base: { thn: 2 },
    up: { thn: 1 },
    effects: [ { t: 'buff', target: 'self', buff: 'thorns', n: '$thn' } ]
  },
  {
    id: 'ew_burnout',
    name: 'Burnout',
    art: '🔥',
    cost: 0,
    type: 'skill',
    rarity: 'uncommon',
    target: 'self',
    text: 'Gain $blk Block. Exhaust your hand.',
    base: { blk: 8 },
    up: { blk: 3 },
    effects: [ { t: 'block', n: '$blk' }, { t: 'exhaust_hand' } ]
  },
  {
    id: 'ew_fierygrasp',
    name: 'Fiery Grasp',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. Add 1 Stone to your hand.',
    base: { dmg: 5 },
    up: { dmg: 2 },
    effects: [ { t: 'damage', n: '$dmg' }, { t: 'add_card', card: 'c_stone', to: 'hand', n: 1 } ]
  },
  {
    id: 'ew_spark',
    name: 'Spark',
    art: '✨',
    cost: 0,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage.',
    base: { dmg: 3 },
    up: { dmg: 2 },
    effects: [ { t: 'damage', n: '$dmg' } ]
  },
];
