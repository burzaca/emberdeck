// Central content registry: loads all data files, indexes them, validates hard.
import { cards as ewCards } from '../data/cards_emberwright.js';
import { cards as vdCards } from '../data/cards_verdant.js';
import { cards as gwCards } from '../data/cards_gravewarden.js';
import { cards as cCards } from '../data/cards_colorless.js';
import { enemies } from '../data/enemies.js';
import { relics } from '../data/relics.js';
import { potions } from '../data/potions.js';
import { events } from '../data/events.js';
import { classes } from '../data/classes.js';

export const VALID_BUFFS = new Set(['strength','dexterity','vulnerable','frail','poison','regen','thorns','ritual','metallicize','entangle','wrath','shield']);
export const VALID_VERBS = new Set(['damage','block','buff','draw','discard_all','heal','self_damage','gold','add_card','exhaust_hand','lose_block','energy','hp_loss_pct','double_next_block','vuln_all','none']);
export const VALID_RUN_VERBS = new Set(['upgrade_random','remove_card','gain_relic','gain_gold','lose_gold','gain_potion','gain_card']);
export const VALID_INTENTS = new Set(['attack','block','debuff','buff','attack_debuff','strength_up','ritual']);
export const VALID_HOOKS = new Set(['combat_start','turn_start','turn_end','card_played','enemy_died','combat_end','rest','map_move','damaged']);
export const VALID_TYPES = new Set(['attack','skill','power']);
export const VALID_RARITIES = new Set(['basic','common','uncommon','rare','boss','shop','starter','curse','status']);
export const VALID_TARGETS = new Set(['enemy','all_enemies','self','none']);

const allCards = [...ewCards, ...vdCards, ...gwCards, ...cCards];

export const DATA = {
  cards: allCards,
  cardById: new Map(allCards.map(c => [c.id, c])),
  enemies,
  enemyById: new Map(enemies.map(e => [e.id, e])),
  relics,
  relicById: new Map(relics.map(r => [r.id, r])),
  potions,
  potionById: new Map(potions.map(p => [p.id, p])),
  events,
  classes,
  classById: new Map(classes.map(c => [c.id, c])),
};

export function validateData() {
  const errors = [];
  const seen = new Set();
  const checkEffects = (effects, where) => {
    for (const v of effects || []) {
      if (!VALID_VERBS.has(v.t) && !VALID_RUN_VERBS.has(v.t)) errors.push(`${where}: unknown verb '${v.t}'`);
      if (v.t === 'buff' && !VALID_BUFFS.has(v.buff)) errors.push(`${where}: unknown buff '${v.buff}'`);
      if (v.t === 'add_card' && !DATA.cardById.has(v.card)) errors.push(`${where}: add_card references missing card '${v.card}'`);
    }
  };
  for (const c of DATA.cards) {
    if (seen.has(c.id)) errors.push(`duplicate card id '${c.id}'`); seen.add(c.id);
    if (!VALID_TYPES.has(c.type)) errors.push(`card ${c.id}: bad type '${c.type}'`);
    if (!VALID_RARITIES.has(c.rarity)) errors.push(`card ${c.id}: bad rarity '${c.rarity}'`);
    if (!VALID_TARGETS.has(c.target)) errors.push(`card ${c.id}: bad target '${c.target}'`);
    if (typeof c.cost !== 'number' || c.cost < 0 || c.cost > 3) errors.push(`card ${c.id}: bad cost`);
    checkEffects(c.effects, `card ${c.id}`);
    for (const v of c.effects || []) {
      for (const key of ['n']) {
        const val = v[key];
        if (typeof val === 'string' && val.startsWith('$')) {
          const tok = val.slice(1);
          if (!(tok in (c.base || {}))) errors.push(`card ${c.id}: effect token $${tok} missing from base map`);
        }
      }
    }
    if (c.text) {
      for (const m of c.text.matchAll(/\$(\w+)/g)) {
        if (!(m[1] in (c.base || {}))) errors.push(`card ${c.id}: text token $${m[1]} missing from base map`);
      }
    }
  }
  for (const e of DATA.enemies) {
    if (seen.has(e.id)) errors.push(`duplicate enemy id '${e.id}'`); seen.add(e.id);
    if (!Array.isArray(e.hp) || e.hp.length !== 2) errors.push(`enemy ${e.id}: hp must be [min,max]`);
    if (![1, 2, 3].includes(e.act)) errors.push(`enemy ${e.id}: bad act`);
    if (!['normal', 'elite', 'boss'].includes(e.tier)) errors.push(`enemy ${e.id}: bad tier`);
    for (const m of e.moves || []) {
      if (!VALID_INTENTS.has(m.intent)) errors.push(`enemy ${e.id}: bad intent '${m.intent}'`);
      if (typeof m.weight !== 'number') errors.push(`enemy ${e.id} move ${m.id}: missing weight`);
    }
    if (e.opener && !(e.moves || []).some(m => m.id === e.opener)) errors.push(`enemy ${e.id}: opener '${e.opener}' not in moves`);
  }
  for (const r of DATA.relics) {
    if (seen.has(r.id)) errors.push(`duplicate relic id '${r.id}'`); seen.add(r.id);
    for (const [hook, effects] of Object.entries(r.hooks || {})) {
      if (!VALID_HOOKS.has(hook)) errors.push(`relic ${r.id}: bad hook '${hook}'`);
      checkEffects(effects, `relic ${r.id}.${hook}`);
    }
  }
  for (const p of DATA.potions) {
    if (seen.has(p.id)) errors.push(`duplicate potion id '${p.id}'`); seen.add(p.id);
    checkEffects(p.effects, `potion ${p.id}`);
  }
  for (const ev of DATA.events) {
    if (seen.has(ev.id)) errors.push(`duplicate event id '${ev.id}'`); seen.add(ev.id);
    for (const o of ev.options || []) checkEffects(o.effects, `event ${ev.id}.${o.label}`);
    if (!(ev.options || []).some(o => /leave|walk away|nothing|decline|refuse|leave it|pass/i.test(o.label))) errors.push(`event ${ev.id}: no safe leave option`);
  }
  for (const cl of DATA.classes) {
    if (seen.has(cl.id)) errors.push(`duplicate class id '${cl.id}'`); seen.add(cl.id);
    for (const id of cl.starting_deck || []) if (!DATA.cardById.has(id)) errors.push(`class ${cl.id}: missing starter card '${id}'`);
    if (!DATA.relicById.has(cl.starting_relic)) errors.push(`class ${cl.id}: missing starting relic '${cl.starting_relic}'`);
  }
  return errors;
}
