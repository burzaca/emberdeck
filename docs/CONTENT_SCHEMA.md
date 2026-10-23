# EMBERDECK content schema (authoritative)

All content lives in `src/data/*.js` as **pure data** — plain exported objects/arrays,
no functions, no imports except nothing. The engine interprets everything.
Numbers that upgrade use `$name` tokens resolved from the card's `up` map.

## Card (`src/data/cards_<class>.js` → `export const cards = [...]`)

```js
{
  id: 'ew_strike',            // unique, prefix: ew_ emberwright, vd_ verdant, gw_ gravewarden, c_ colorless
  name: 'Spark Cut',
  cost: 1,                    // 0-3 energy
  type: 'attack',             // attack | skill | power
  rarity: 'basic',            // basic | common | uncommon | rare
  target: 'enemy',            // enemy | all_enemies | self | none
  text: 'Deal $dmg damage.',  // player-facing; $tokens allowed
  base: { dmg: 6 },           // REQUIRED whenever $tokens are used: token -> base value
  up: { dmg: 4 },             // optional: token -> increment when upgraded
  effects: [                  // executed in order
    { t: 'damage', n: '$dmg', hits: 1 },
    { t: 'block',  n: 5 },
    { t: 'buff', target: 'self',  buff: 'strength',  n: 1 },
    { t: 'buff', target: 'target', buff: 'vulnerable', n: 2 },
    { t: 'buff', target: 'target', buff: 'poison', n: '$psn' },
    { t: 'draw', n: 1 },
    { t: 'discard_all', hand: true },
    { t: 'heal', n: 4 },
    { t: 'self_damage', n: 2 },
    { t: 'gold', n: 3 },
    { t: 'add_card', card: 'c_stone', to: 'hand', n: 1 }, // to: hand|draw|discard
    { t: 'exhaust_hand' },
    { t: 'lose_block', n: 'all' },
    { t: 'energy', n: 1 },
    { t: 'hp_loss_pct', pct: 0.1 },   // lose % of current HP
    { t: 'double_next_block' },
    { t: 'vuln_all', n: 1 },
    { t: 'hits_alive' },              // hit all enemies once (damage uses $n from a preceding damage verb? NO — use {t:'damage', n:$x, hits:'all'} instead)
  ],
  keywords: ['exhaust'],      // display-only tags: exhaust | innate | ethereal | retain | unplayable
  exhaust: false,             // card leaves combat after play
  innate: false,              // must be in opening hand
  ethereal: false,            // discarded at end of turn if in hand
  retain: false,              // kept in hand at end of turn
  upgradeable: true,          // false for tokens like curses
}
```

Damage verbs: `{ t:'damage', n: 6, hits: 1 }`, multi-hit `{ hits: 3 }`, all enemies
`{ t:'damage', n: 5, all: true }`. Strength applies per hit; Vulnerable on target
multiplies incoming damage ×1.5 (round down).

## Buffs (fixed list — do NOT invent new ones)

| id | behavior |
|---|---|
| strength | +n damage per attack hit |
| dexterity | +n block from block moves; decays by 1 at end of your turn |
| vulnerable | takes ×1.5 damage; decrements at end of the holder's turn |
| frail | gains ×0.5 block (round down); decrements at end of holder's turn |
| poison | at start of holder's turn: lose n HP (halved after), then n -= ceil(n/2) |
| regen | at start of holder's turn: heal n, then n -= 1 |
| thorns | when attacked by a hit, deal n back to attacker |
| ritual | at combat end: gain n Strength (boss mechanic) |
| metallicize | at end of your turn: gain n Block |
| entangle | enemy gains no Block this turn; decrements at end of enemy's turn |
|wrath | +n damage taken by the holder; never decays (curse-ish buff used by enemies) |
| shield | absorbs damage before HP; decrements by 1 per combat (not turn) |

## Relic (`src/data/relics.js` → `export const relics = [...]`)

```js
{ id: 'r_ember_heart', name: 'Ember Heart', rarity: 'common', // common|uncommon|rare|boss|shop
  text: 'At the start of each combat, gain 1 Strength.',
  hooks: { combat_start: [{ t:'buff', target:'self', buff:'strength', n:1 }] },
  // allowed hooks: combat_start, turn_start, turn_end, card_played, enemy_died,
  //               combat_end, rest, map_move, damaged
  limit: null } // optional: max triggers per combat/turn, e.g. {per:'combat', n:1}
```

## Enemy (`src/data/enemies.js` → `export const enemies = [...]`)

```js
{ id: 'e_cinder_imp', name: 'Cinder Imp', hp: [22, 26], // rolled in range per run
  act: 1,                     // 1|2|3 ; act 3 = bosses (id prefix b1_ b2_ b3_ for boss pools)
  tier: 'normal',             // normal | elite | boss
  intent_weight: null,        // optional reserved, keep null
  moves: [
    { id:'scratch', intent:'attack', dmg: 7, weight: 3 },
    { id:'guard',   intent:'block',  block: 6, weight: 2 },
    { id:'flare',   intent:'debuff', debuff: { buff:'poison', n:3 }, weight: 2 },
    { id:'rally',   intent:'buff',   buff: { buff:'strength', n:2 }, weight: 1 },
    { id:'roar',    intent:'strength_up', n: 2, weight: 1 }, // passive, no intent shown until used
  ],
  opener: 'scratch',          // first move id (optional)
  no_repeat: true,            // never pick the same move twice in a row (optional)
  flavor: 'A shrieking knot of coals.' }
```

Intents shown to player: attack (sword), block (shield), debuff (down arrow),
buff (up arrow), attack_debuff (sword+arrow), unknown (?). Keep move `intent` within:
attack | block | debuff | buff | attack_debuff | strength_up.

Multi-move enemies attack with `dmg` per hit; use `hits: 2` inside a move for multi-hit.

## Event (`src/data/events.js` → `export const events = [...]`)

```js
{ id: 'ev_forge', name: 'The Cold Forge', act: [1,2,3], weight: 3,
  text: 'A forge glows...', 
  options: [
    { label: 'Stoke it', effects: [{ t:'self_damage', n:5 }, { t:'upgrade_random' }] },
    { label: 'Leave', effects: [] },
  ] }
```

Event verbs (in addition to card verbs): `{ t:'upgrade_random' }`, `{ t:'remove_card' }`
(UI opens picker), `{ t:'gain_relic', rarity:'common' }`, `{ t:'gain_gold', n: 25 }`,
`{ t:'lose_gold', n: 10 }`, `{ t:'heal', n: 10 }`, `{ t:'add_card', card:'c_curse_x', to:'draw' }`,
`{ t:'gain_potion' }`.

## Potions (`src/data/potions.js` → `export const potions = [...]`)

```js
{ id:'p_ember', name:'Ember Tonic', rarity:'common',
  text:'Apply 3 Weak...', // use only buffs from the fixed list
  combat_only: true, effects:[{ t:'buff', target:'all_enemies', buff:'vulnerable', n:2 }] }
```

## Classes (`src/data/classes.js`)

```js
{ id:'emberwright', name:'Emberwright', hp: 70,
  blurb:'...', starting_deck:['ew_strike','ew_guard','c_stone',...],
  starting_relic:'r_ember_charm',
  card_pool_prefix:'ew_' }   // rewards draw from ew_* + c_* cards
```

## Conventions
- 20 class cards each (5 basic starter variants + commons/uncommons/rare), 12 colorless (`c_`).
- All ids unique across files. No functions anywhere in data files.
- Text ≤ 120 chars. Use `...` sparingly. Bulgarian players will read English UI — keep it simple.
- Balance targets: Act 1 normal fights 10-20 HP enemy damage/turn total; elites ~2x; bosses spike.
