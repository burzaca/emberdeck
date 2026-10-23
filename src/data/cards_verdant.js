// EMBERDECK nature/growth class: Verdant
// Do not edit card schema without docs/CONTENT_SCHEMA.md approval.
export const cards = [
{
  id: 'vd_strike', name: 'Vine Lash', cost: 1, type: 'attack', rarity: 'basic', target: 'enemy',
  text: 'Deal $dmg damage.',
  base: { dmg: 6 }, up: { dmg: 4 },
  effects: [{ t:'damage', n:'$dmg' }],
},
{
  id: 'vd_guard', name: 'Leafguard', cost: 1, type: 'skill', rarity: 'basic', target: 'self',
  text: 'Gain $blk Block.',
  base: { blk: 6 }, up: { blk: 4 },
  effects: [{ t:'block', n:'$blk' }],
},
// Commons
{
  id: 'vd_ram', name: 'Ram', cost: 1, type: 'attack', rarity: 'common', target: 'enemy',
  text: 'Deal $dmg damage. Gain $blk Block.',
  base: { dmg: 7, blk: 3 }, up: { dmg: 3, blk: 2 },
  effects: [{ t:'damage', n:'$dmg' }, { t:'block', n:'$blk' }],
},
{
  id: 'vd_bramble', name: 'Bramble Armor', cost: 1, type: 'skill', rarity: 'common', target: 'self',
  text: 'Gain $blk Block. Gain $thn Thorns.',
  base: { blk: 5, thn: 2 }, up: { blk: 3, thn: 1 },
  effects: [ { t:'block', n:'$blk' }, { t:'buff', target:'self', buff:'thorns', n:'$thn' } ],
},
{
  id: 'vd_herbal_lore', name: 'Herbal Lore', cost: 1, type: 'skill', rarity: 'common', target: 'self',
  text: 'Heal $heal HP. Draw $draw cards.',
  base: { heal: 4, draw: 1 }, up: { heal: 2, draw: 1 },
  effects: [ { t:'heal', n:'$heal' }, { t:'draw', n:'$draw' } ],
},
{
  id: 'vd_bud', name: 'Bud', cost: 0, type: 'skill', rarity: 'common', target: 'self',
  text: 'Gain $blk Block.',
  base: { blk: 3 }, up: { blk: 2 },
  effects: [ { t:'block', n:'$blk' } ],
},
{
  id: 'vd_growth', name: 'Growth Spurt', cost: 2, type: 'power', rarity: 'common', target: 'self',
  text: 'At end of turn, gain $mtc Block (Metallicize).',
  base: { mtc: 2 }, up: { mtc: 1 },
  effects: [ { t:'buff', target:'self', buff:'metallicize', n:'$mtc' } ],
},
// Uncommons
{
  id: 'vd_poison_seed', name: 'Poison Seed', cost: 1, type: 'skill', rarity: 'uncommon', target: 'enemy',
  text: 'Apply $psn Poison.',
  base: { psn: 5 }, up: { psn: 3 },
  effects: [ { t:'buff', target:'target', buff:'poison', n:'$psn' } ],
},
{
  id: 'vd_harvest', name: 'Harvest', cost: 1, type: 'skill', rarity: 'uncommon', target: 'self',
  text: 'Heal $heal HP. Gain $blk Block.',
  base: { heal: 5, blk: 5 }, up: { heal: 2, blk: 3 },
  effects: [ { t:'heal', n:'$heal' }, { t:'block', n:'$blk' } ],
},
{
  id: 'vd_rejuvenate', name: 'Rejuvenate', cost: 2, type: 'skill', rarity: 'uncommon', target: 'self',
  text: 'Heal $heal HP. Gain $rg Regen.',
  base: { heal: 7, rg: 2 }, up: { heal: 2, rg: 1 },
  effects: [ { t:'heal', n:'$heal' }, { t:'buff', target:'self', buff:'regen', n:'$rg' } ],
},
{
  id: 'vd_ivywhip', name: 'Ivywhip', cost: 1, type: 'attack', rarity: 'uncommon', target: 'enemy',
  text: 'Deal $dmg damage. Apply $vn Vulnerable.',
  base: { dmg: 8, vn: 1 }, up: { dmg: 3, vn: 1 },
  effects: [ { t:'damage', n:'$dmg' }, { t:'buff', target:'target', buff:'vulnerable', n:'$vn' } ],
},
{
  id: 'vd_surge', name: 'Surge', cost: 1, type: 'skill', rarity: 'uncommon', target: 'self',
  text: 'Gain $blk Block. Next turn, gain $blk2 Block.',
  base: { blk: 5, blk2: 5 }, up: { blk: 3, blk2: 2 },
  effects: [ { t:'block', n:'$blk' }, { t:'buff', target:'self', buff:'metallicize', n:'$blk2' } ],
},
{
  id: 'vd_thicket', name: 'Thicket', cost: 1, type: 'power', rarity: 'uncommon', target: 'self',
  text: 'Gain $thn Thorns. At start of turn, gain $blk Block.',
  base: { thn: 2, blk: 3 }, up: { thn: 1, blk: 1 },
  effects: [ { t:'buff', target:'self', buff:'thorns', n:'$thn' }, { t:'buff', target:'self', buff:'metallicize', n:'$blk' } ],
},
{
  id: 'vd_photosyn', name: 'Photosynthesize', cost: 0, type: 'power', rarity: 'uncommon', target: 'self',
  text: 'At turn end, heal $heal HP.',
  base: { heal: 2 }, up: { heal: 1 },
  effects: [ { t:'buff', target:'self', buff:'regen', n:'$heal' } ],
},
// Rares
{
  id: 'vd_wrathwood', name: 'Wrathwood', cost: 2, type: 'attack', rarity: 'rare', target: 'all_enemies',
  text: 'Deal $dmg damage to ALL enemies. Apply $psn Poison.',
  base: { dmg: 10, psn: 4 }, up: { dmg: 5, psn: 2 },
  effects: [ { t:'damage', n:'$dmg', hits:'all' }, { t:'buff', target:'all_enemies', buff:'poison', n:'$psn' } ],
},
{
  id: 'vd_lifebloom', name: 'Lifebloom', cost: 2, type: 'power', rarity: 'rare', target: 'self',
  text: 'At turn end, heal $heal HP and gain $blk Block.',
  base: { heal: 3, blk: 3 }, up: { heal: 1, blk: 2 },
  effects: [ { t:'buff', target:'self', buff:'regen', n:'$heal' }, { t:'buff', target:'self', buff:'metallicize', n:'$blk' } ],
},
{
  id: 'vd_overgrow', name: 'Overgrow', cost: 1, type: 'skill', rarity: 'rare', target: 'self',
  text: 'Gain $blk Block. Draw $draw cards. Gain $dex Dex.',
  base: { blk: 10, draw: 2, dex: 1 }, up: { blk: 3, draw: 1, dex: 1 },
  effects: [ { t:'block', n:'$blk' }, { t:'draw', n:'$draw' }, { t:'buff', target:'self', buff:'dexterity', n:'$dex' } ],
},
{
  id: 'vd_verdancy', name: 'Verdancy', cost: 3, type: 'power', rarity: 'rare', target: 'self',
  text: 'Gain $rt Ritual. At combat end, gain $str Strength.',
  base: { rt: 2, str: 2 }, up: { rt: 1, str: 1 },
  effects: [ { t:'buff', target:'self', buff:'ritual', n:'$rt' }, { t:'buff', target:'self', buff:'strength', n:'$str' } ],
},
{
  id: 'vd_vinewall', name: 'Vinewall', cost: 2, type: 'skill', rarity: 'rare', target: 'self',
  text: 'Gain $blk Block. Gain $thn Thorns. Gain $mtc Metallicize.',
  base: { blk: 15, thn: 3, mtc: 2 }, up: { blk: 5, thn: 1, mtc: 1 },
  effects: [ { t:'block', n:'$blk' }, { t:'buff', target:'self', buff:'thorns', n:'$thn' }, { t:'buff', target:'self', buff:'metallicize', n:'$mtc' } ],
},
{
  id: 'vd_seedburst', name: 'Seedburst', cost: 1, type: 'attack', rarity: 'rare', target: 'all_enemies',
  text: 'Deal $dmg damage to ALL enemies.',
  base: { dmg: 6 }, up: { dmg: 4 },
  effects: [ { t:'damage', n:'$dmg', hits:'all' } ],
},
{
  id: 'vd_nourish', name: 'Nourish', cost: 1, type: 'skill', rarity: 'uncommon', target: 'self',
  text: 'Gain $blk Block. Gain $regen Regen.',
  base: { blk: 7, regen: 2 }, up: { blk: 3, regen: 1 },
  effects: [ { t:'block', n:'$blk' }, { t:'buff', target:'self', buff:'regen', n:'$regen' } ],
},
{
  id: 'vd_thornburst', name: 'Thornburst', cost: 1, type: 'attack', rarity: 'uncommon', target: 'all_enemies',
  text: 'Deal $dmg damage to ALL enemies. Gain $thn Thorns.',
  base: { dmg: 5, thn: 2 }, up: { dmg: 2, thn: 1 },
  effects: [ { t:'damage', n:'$dmg', hits:'all' }, { t:'buff', target:'self', buff:'thorns', n:'$thn' } ],
},
{
  id: 'vd_sapswallow', name: 'Sapswallow', cost: 0, type: 'skill', rarity: 'common', target: 'self',
  text: 'Heal $heal HP.',
  base: { heal: 2 }, up: { heal: 2 },
  effects: [ { t:'heal', n:'$heal' } ],
},
{
  id: 'vd_burstblooms', name: 'Burstblooms', cost: 1, type: 'attack', rarity: 'uncommon', target: 'enemy',
  text: 'Deal $dmg damage. If fatal, draw $draw cards.',
  base: { dmg: 9, draw: 2 }, up: { dmg: 3, draw: 1 },
  effects: [ { t:'damage', n:'$dmg' }, { t:'draw', n:'$draw' } ],
},
  {
    id: 'vd_bloom',
    name: 'Bloom',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    target: 'self',
    text: 'Gain $blk Block. Heal $hp HP.',
    base: { blk: 4, hp: 2 },
    up: { blk: 2, hp: 1 },
    effects: [ { t: 'block', n: '$blk' }, { t: 'heal', n: '$hp' } ]
  },
];
