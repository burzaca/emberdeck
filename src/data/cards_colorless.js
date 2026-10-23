export const cards = [
  // CURSE & STATUS
  {
    id: 'c_curse_bind',
    name: 'Bind',
    cost: 0,
    type: 'skill',
    rarity: 'curse',
    target: 'none',
    unplayable: true,
    keywords: ['unplayable'],
    effects: [],
    text: 'Unplayable.'
  },
  {
    id: 'c_stone',
    name: 'Stone',
    cost: 1,
    type: 'attack',
    rarity: 'status',
    target: 'enemy',
    text: 'Deal $dmg damage.',
    base: { dmg: 0 },
    up: { dmg: 0 },
    effects: [ { t: 'damage', n: '$dmg' } ]
  },
  // COMMONS/UNCOMMONS/RARE COLORLESS
  {
    id: 'c_flash',
    name: 'Flash',
    cost: 0,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage.',
    base: { dmg: 3 },
    up: { dmg: 2 },
    effects: [ { t: 'damage', n: '$dmg' } ]
  },
  {
    id: 'c_safeguard',
    name: 'Safeguard',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    target: 'self',
    text: 'Gain $blk Block.',
    base: { blk: 7 },
    up: { blk: 3 },
    effects: [ { t: 'block', n: '$blk' } ]
  },
  {
    id: 'c_trickster',
    name: 'Trickster',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    target: 'self',
    text: 'Draw $n cards.',
    base: { n: 2 },
    up: { n: 1 },
    effects: [ { t: 'draw', n: '$n' } ]
  },
  {
    id: 'c_mirror',
    name: 'Mirror',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    target: 'self',
    text: 'Gain $blk Block. Draw $n card.',
    base: { blk: 5, n: 1 },
    up: { blk: 3, n: 1 },
    effects: [ { t: 'block', n: '$blk' }, { t: 'draw', n: '$n' } ]
  },
  {
    id: 'c_fragile',
    name: 'Fragile',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. Apply $frail Frail.',
    base: { dmg: 4, frail: 1 },
    up: { dmg: 2, frail: 1 },
    effects: [ { t: 'damage', n: '$dmg' }, { t: 'buff', target: 'target', buff: 'frail', n: '$frail' } ]
  },
  {
    id: 'c_deft',
    name: 'Deft Feet',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    target: 'self',
    text: 'Gain $dex Dexterity.',
    base: { dex: 2 },
    up: { dex: 1 },
    effects: [ { t: 'buff', target: 'self', buff: 'dexterity', n: '$dex' } ]
  },
  {
    id: 'c_bash',
    name: 'Bash',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. Apply $vul Vulnerable.',
    base: { dmg: 5, vul: 1 },
    up: { dmg: 2, vul: 1 },
    effects: [ { t: 'damage', n: '$dmg' }, { t: 'buff', target: 'target', buff: 'vulnerable', n: '$vul' } ]
  },
  {
    id: 'c_mysticbrew',
    name: 'Mystic Brew',
    cost: 0,
    type: 'skill',
    rarity: 'rare',
    target: 'self',
    text: 'Heal $hp HP. Gain $ene Energy.',
    base: { hp: 3, ene: 1 },
    up: { hp: 2, ene: 1 },
    effects: [ { t: 'heal', n: '$hp' }, { t: 'energy', n: '$ene' } ]
  },
  {
    id: 'c_penance',
    name: 'Penance',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    target: 'enemy',
    text: 'Deal $dmg damage. You lose $hp HP.',
    base: { dmg: 15, hp: 2 },
    up: { dmg: 3, hp: 0 },
    effects: [ { t: 'damage', n: '$dmg' }, { t: 'self_damage', n: '$hp' } ]
  },
  {
    id: 'c_shieldwall',
    name: 'Shieldwall',
    cost: 2,
    type: 'skill',
    rarity: 'rare',
    target: 'self',
    text: 'Gain $blk Block and $thn Thorns.',
    base: { blk: 15, thn: 2 },
    up: { blk: 5, thn: 1 },
    effects: [ { t: 'block', n: '$blk' }, { t: 'buff', target: 'self', buff: 'thorns', n: '$thn' } ]
  }
];
