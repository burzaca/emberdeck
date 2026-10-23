// EMBERDECK death/control class: Gravewarden
// Do not edit card schema without docs/CONTENT_SCHEMA.md approval.
export const cards = [
{
  id: 'gw_strike', name: 'Grave Slash', art: '🗡', cost: 1, type: 'attack', rarity: 'basic', target: 'enemy',
  text: 'Deal $dmg damage.',
  base: { dmg: 6 }, up: { dmg: 4 },
  effects: [ { t:'damage', n:'$dmg' } ],
},
{
  id: 'gw_guard', name: 'Mourner’s Guard', art: '🛡', cost: 1, type: 'skill', rarity: 'basic', target: 'self',
  text: 'Gain $blk Block.',
  base: { blk: 6 }, up: { blk: 4 },
  effects: [ { t:'block', n:'$blk' } ],
},
// Commons
{
  id: 'gw_bone_shard', name: 'Bone Shard', art: '🦴', cost: 1, type: 'attack', rarity: 'common', target: 'enemy',
  text: 'Deal $dmg damage. Apply $vn Vulnerable.',
  base: { dmg: 7, vn: 1 }, up: { dmg: 3, vn: 1 },
  effects: [ { t:'damage', n:'$dmg' }, { t:'buff', target:'target', buff:'vulnerable', n:'$vn' } ],
},
{
  id: 'gw_chill', name: 'Chilling Touch', cost: 1, type: 'skill', rarity: 'common', target: 'enemy',
  text: 'Apply $fr Frail. Draw $draw cards.',
  base: { fr: 2, draw: 1 }, up: { fr: 1, draw: 1 },
  effects: [ { t:'buff', target:'target', buff:'frail', n:'$fr' }, { t:'draw', n:'$draw' } ],
},
{
  id: 'gw_decay', name: 'Decay', cost: 1, type: 'skill', rarity: 'common', target: 'enemy',
  text: 'Apply $psn Poison. Apply $fr Frail.',
  base: { psn: 4, fr: 1 }, up: { psn: 2, fr: 1 },
  effects: [ { t:'buff', target:'target', buff:'poison', n:'$psn' }, { t:'buff', target:'target', buff:'frail', n:'$fr' } ],
},
{
  id: 'gw_sacrifice', name: 'Sacrifice', art: '🧊', cost: 0, type: 'skill', rarity: 'common', target: 'self',
  text: 'Lose $hp HP. Draw $draw cards.',
  base: { hp: 2, draw: 2 }, up: { hp: 1, draw: 1 },
  effects: [ { t:'self_damage', n:'$hp' }, { t:'draw', n:'$draw' } ],
},
{
  id: 'gw_memento', name: 'Memento', cost: 1, type: 'power', rarity: 'common', target: 'self',
  text: 'At end of turn, gain $mtc Block (Metallicize).',
  base: { mtc: 2 }, up: { mtc: 1 },
  effects: [ { t:'buff', target:'self', buff:'metallicize', n:'$mtc' } ],
},
// Uncommons
{
  id: 'gw_entangle', name: 'Entangling Grasp', art: '🕸', cost: 1, type: 'skill', rarity: 'uncommon', target: 'enemy',
  text: 'Apply $ent Entangle.',
  base: { ent: 1 }, up: { ent: 1 },
  effects: [ { t:'buff', target:'target', buff:'entangle', n:'$ent' } ],
},
{
  id: 'gw_withering', name: 'Withering Hex', art: '🔮', cost: 2, type: 'skill', rarity: 'uncommon', target: 'enemy',
  text: 'Apply $psn Poison. Apply $vn Vulnerable.',
  base: { psn: 6, vn: 2 }, up: { psn: 3, vn: 1 },
  effects: [ { t:'buff', target:'target', buff:'poison', n:'$psn' }, { t:'buff', target:'target', buff:'vulnerable', n:'$vn' } ],
},
{
  id: 'gw_necrotic', name: 'Necrotic Strength', art: '💪', cost: 1, type: 'power', rarity: 'uncommon', target: 'self',
  text: 'Lose $hp HP. Gain $str Strength.',
  base: { hp: 2, str: 2 }, up: { hp: 1, str: 1 },
  effects: [ { t:'self_damage', n:'$hp' }, { t:'buff', target:'self', buff:'strength', n:'$str' } ],
},
{
  id: 'gw_tombshield', name: 'Tomb Shield', art: '🛡', cost: 1, type: 'skill', rarity: 'uncommon', target: 'self',
  text: 'Gain $blk Block. Gain $shd Shield.',
  base: { blk: 7, shd: 2 }, up: { blk: 3, shd: 1 },
  effects: [ { t:'block', n:'$blk' }, { t:'buff', target:'self', buff:'shield', n:'$shd' } ],
},
{
  id: 'gw_omen', name: 'Omen', cost: 1, type: 'skill', rarity: 'uncommon', target: 'enemy',
  text: 'Deal $dmg damage. If target has Frail or Vulnerable, draw $draw cards.',
  base: { dmg: 6, draw: 2 }, up: { dmg: 3, draw: 1 },
  effects: [ { t:'damage', n:'$dmg' }, { t:'draw', n:'$draw' } ],
},
{
  id: 'gw_fading', name: 'Fading Echo', cost: 0, type: 'skill', rarity: 'uncommon', target: 'self',
  text: 'Discard your hand. Draw $draw cards.',
  base: { draw: 3 }, up: { draw: 2 },
  effects: [ { t:'discard_all', hand: true }, { t:'draw', n:'$draw' } ],
},
// Rares
{
  id: 'gw_ossuary', name: 'Ossuary', cost: 2, type: 'power', rarity: 'rare', target: 'self',
  text: 'At turn end, gain $mtc Block. Lose $hp HP each turn.',
  base: { mtc: 4, hp: 2 }, up: { mtc: 2, hp: 1 },
  effects: [ { t:'buff', target:'self', buff:'metallicize', n:'$mtc' }, { t:'self_damage', n:'$hp' } ],
},
{
  id: 'gw_deathbloom', name: 'Deathbloom', art: '🌸', cost: 2, type: 'attack', rarity: 'rare', target: 'all_enemies',
  text: 'Deal $dmg damage to ALL enemies. Apply $psn Poison.',
  base: { dmg: 9, psn: 5 }, up: { dmg: 5, psn: 3 },
  effects: [ { t:'damage', n:'$dmg', hits:'all' }, { t:'buff', target:'all_enemies', buff:'poison', n:'$psn' } ],
},
{
  id: 'gw_dirge', name: 'Dirge', art: '🎻', cost: 3, type: 'power', rarity: 'rare', target: 'self',
  text: 'Gain $tg Thorns. At combat end, gain $str Strength.',
  base: { tg: 4, str: 2 }, up: { tg: 2, str: 1 },
  effects: [ { t:'buff', target:'self', buff:'thorns', n:'$tg' }, { t:'buff', target:'self', buff:'strength', n:'$str' } ],
},
{
  id: 'gw_witherstrike', name: 'Witherstrike', art: '🗡', cost: 2, type: 'attack', rarity: 'rare', target: 'enemy',
  text: 'Deal $dmg damage. Apply $psn Poison. Apply $vn Vulnerable.',
  base: { dmg: 15, psn: 6, vn: 2 }, up: { dmg: 6, psn: 3, vn: 1 },
  effects: [ { t:'damage', n:'$dmg' }, { t:'buff', target:'target', buff:'poison', n:'$psn' }, { t:'buff', target:'target', buff:'vulnerable', n:'$vn' } ],
},
{
  id: 'gw_astral', name: 'Astral Chain', art: '⛓', cost: 1, type: 'power', rarity: 'rare', target: 'self',
  text: 'At start of turn, gain $blk Block. Draw $draw cards.',
  base: { blk: 4, draw: 1 }, up: { blk: 2, draw: 1 },
  effects: [ { t:'buff', target:'self', buff:'metallicize', n:'$blk' }, { t:'draw', n:'$draw' } ],
},
{
  id: 'gw_purge', name: 'Purge', cost: 1, type: 'skill', rarity: 'rare', target: 'self',
  text: 'Exhaust your hand. Draw $draw cards.',
  base: { draw: 3 }, up: { draw: 2 },
  effects: [ { t:'exhaust_hand' }, { t:'draw', n:'$draw' } ],
},
{
  id: 'gw_horrify', name: 'Horrify', cost: 1, type: 'attack', rarity: 'uncommon', target: 'all_enemies',
  text: 'Deal $dmg damage to ALL enemies. Apply $fr Frail.',
  base: { dmg: 5, fr: 1 }, up: { dmg: 2, fr: 1 },
  effects: [ { t:'damage', n:'$dmg', hits:'all' }, { t:'buff', target:'all_enemies', buff:'frail', n:'$fr' } ],
},
{
  id: 'gw_gravegift', name: 'Gravegift', art: '💀', cost: 0, type: 'skill', rarity: 'common', target: 'self',
  text: 'Gain $blk Block. Lose $hp HP.',
  base: { blk: 4, hp: 2 }, up: { blk: 1, hp: 1 },
  effects: [ { t:'block', n:'$blk' }, { t:'self_damage', n:'$hp' } ],
},
{
  id: 'gw_torment', name: 'Torment', cost: 1, type: 'attack', rarity: 'uncommon', target: 'enemy',
  text: 'Deal $dmg damage. Apply $psn Poison.',
  base: { dmg: 8, psn: 3 }, up: { dmg: 3, psn: 2 },
  effects: [ { t:'damage', n:'$dmg' }, { t:'buff', target:'target', buff:'poison', n:'$psn' } ],
},
  {
    id: 'gw_grasp',
    name: 'Grave Grasp',
    art: '💀',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    target: 'enemy',
    text: 'Deal $dmg damage. Gain $blk Block.',
    base: { dmg: 6, blk: 3 },
    up: { dmg: 2, blk: 1 },
    effects: [ { t: 'damage', n: '$dmg' }, { t: 'block', n: '$blk' } ]
  },
];
