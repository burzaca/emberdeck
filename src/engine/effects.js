// Effect interpreter: verbs, buffs, damage math. Pure — no DOM.
// Combat state shape (C):
// C = { rng, run, player, enemies[], turn, phase, log[], doubleNextBlock,
//       pendingCards: {hand:[], draw:[], discard:[]}, triggered:{} }
// Combatant = { id, name, side:'player'|'enemy', hp, maxHp, block, buffs:{}, alive, data? }

export const BUFF_INFO = {
  strength:     { name: 'Strength',     icon: '💪', color: '#e0784a', desc: '+{n} damage per attack hit' },
  dexterity:    { name: 'Dexterity',    icon: '🤸', color: '#5ab0e0', desc: '+{n} block from Block moves; decays each turn' },
  vulnerable:   { name: 'Vulnerable',   icon: '🎯', color: '#d05a5a', desc: 'Takes ×1.5 damage; decays each turn' },
  frail:        { name: 'Frail',        icon: '🥀', color: '#b078c8', desc: 'Gains half Block; decays each turn' },
  poison:       { name: 'Poison',       icon: '☠️', color: '#7ab04a', desc: 'Loses {n} HP at turn start, then halves' },
  regen:        { name: 'Regen',        icon: '💚', color: '#4ac07a', desc: 'Heals {n} at turn start, then decays' },
  thorns:       { name: 'Thorns',       icon: '🌵', color: '#8aa04a', desc: 'Deals {n} back when hit' },
  ritual:       { name: 'Ritual',       icon: '🔮', color: '#9a6ad0', desc: 'Gains {n} Strength each turn' },
  metallicize:  { name: 'Metallicize',  icon: '🛡️', color: '#8a9ab0', desc: 'Gains {n} Block at end of turn' },
  entangle:     { name: 'Entangled',    icon: '🕸️', color: '#6a8ab0', desc: 'Gains no Block this turn' },
  wrath:        { name: 'Wrath',        icon: '😡', color: '#c04a2a', desc: 'Takes +{n} damage per hit' },
  shield:       { name: 'Shield',       icon: '🔰', color: '#4a90c0', desc: 'Gains {n} Block immediately' },
};

export function addBuff(ent, buff, n) {
  if (!BUFF_INFO[buff] || n === 0) return;
  if (buff === 'shield') { gainBlock(ent, n); return; }
  ent.buffs[buff] = (ent.buffs[buff] || 0) + n;
  if (ent.buffs[buff] <= 0) delete ent.buffs[buff];
}

export function gainBlock(ent, n) {
  if (ent.buffs.entangle) return;
  if (ent.buffs.frail) n = Math.floor(n / 2);
  if (ent.buffs.dexterity) n += ent.buffs.dexterity;
  ent.block += Math.max(0, n);
}

// Returns actual HP lost. opts: {ignoreBlock, noThorns, isPlayerAttacker, attacker}
export function dealDamage(target, amount, opts = {}) {
  let dmg = Math.max(0, amount);
  if (target.buffs.vulnerable && !opts.ignoreBuffVuln) dmg = Math.floor(dmg * 1.5);
  if (target.buffs.wrath) dmg += target.buffs.wrath;
  let lost = 0;
  if (!opts.ignoreBlock && target.block > 0) {
    const blocked = Math.min(target.block, dmg);
    target.block -= blocked;
    dmg -= blocked;
  }
  lost = Math.min(target.hp, dmg);
  target.hp -= lost;
  if (target.hp <= 0) { target.hp = 0; target.alive = false; }
  if (opts.attacker && target.buffs.thorns && !opts.noThorns) {
    dealDamage(opts.attacker, target.buffs.thorns, { ignoreBlock: false, noThorns: true, thornsFrom: target });
  }
  return { lost, dmg };
}

export function attackDamage(attacker, base) {
  let d = base + (attacker.buffs.strength || 0);
  return Math.max(0, d);
}

// Resolve $tokens in numbers using card.up increments when upgraded.
export function resolveNum(v, card) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.startsWith('$')) {
    const key = v.slice(1);
    const base = card.base?.[key] ?? 0;
    const up = card.up?.[key] ?? 0;
    return base + (card._upgraded ? up : 0);
  }
  return 0;
}

// Resolve card text for display: replace $tokens with concrete values.
export function renderText(card) {
  return (card.text || '').replace(/\$(\w+)/g, (_, k) => {
    const base = card.base?.[k] ?? 0;
    const up = card.up?.[k] ?? 0;
    return String(base + (card._upgraded ? up : 0));
  });
}

function targetsOf(C, spec, explicitTarget) {
  if (spec === 'self') return [C.player];
  if (spec === 'all_enemies') return C.enemies.filter(e => e.alive);
  if (spec === 'target') return explicitTarget && explicitTarget.alive ? [explicitTarget] : [];
  return [];
}

function log(C, entry) { C.log.push(entry); }

// Apply one verb. ctx = { card, target, source:'card'|'relic'|'potion'|'enemy' }
export function applyVerb(C, verb, ctx) {
  const self = C.player;
  const t = verb.t;
  const n = (v) => (typeof v === 'string' && v.startsWith('$')) ? resolveNum(v, ctx.card || {}) : v;

  switch (t) {
    case 'damage': {
      const base = n(verb.n);
      const hits = verb.all ? C.enemies.filter(e => e.alive).length : (verb.hits || 1);
      const list = verb.all ? C.enemies.filter(e => e.alive) : (ctx.target && ctx.target.alive ? [ctx.target] : []);
      for (let h = 0; h < hits; h++) {
        for (const tgt of list) {
          if (!tgt.alive) continue;
          const dmg = attackDamage(self, base);
          const r = dealDamage(tgt, dmg, { attacker: self });
          log(C, { t: 'damage', from: 'player', to: tgt.id, amount: dmg, lost: r.lost });
        }
      }
      break;
    }
    case 'block': {
      gainBlock(self, n(verb.n) * (C.doubleNextBlock ? 2 : 1));
      if (C.doubleNextBlock) C.doubleNextBlock = false;
      log(C, { t: 'block', to: 'player', amount: self.block });
      break;
    }
    case 'buff': {
      for (const tgt of targetsOf(C, verb.target, ctx.target)) addBuff(tgt, verb.buff, n(verb.n));
      log(C, { t: 'buff', target: verb.target, buff: verb.buff, n: n(verb.n) });
      break;
    }
    case 'vuln_all': addBuffAllEnemies(C, 'vulnerable', n(verb.n)); break;
    case 'draw': drawCards(C, n(verb.n)); break;
    case 'discard_all': {
      const hand = C.player.hand.splice(0);
      C.player.discard.push(...hand);
      log(C, { t: 'discard_all', n: hand.length });
      break;
    }
    case 'exhaust_hand': {
      const hand = C.player.hand.splice(0);
      C.player.exhaust.push(...hand);
      log(C, { t: 'exhaust_hand', n: hand.length });
      break;
    }
    case 'heal': {
      const before = self.hp;
      self.hp = Math.min(self.maxHp, self.hp + n(verb.n));
      log(C, { t: 'heal', n: self.hp - before });
      break;
    }
    case 'self_damage': {
      dealDamage(self, n(verb.n), { ignoreBlock: true });
      log(C, { t: 'self_damage', n: n(verb.n) });
      break;
    }
    case 'hp_loss_pct': {
      const amt = Math.max(1, Math.floor(self.hp * verb.pct));
      dealDamage(self, amt, { ignoreBlock: true });
      break;
    }
    case 'gold': C.run.gold += n(verb.n); break;
    case 'energy': C.player.energy += n(verb.n); break;
    case 'lose_block': self.block = 0; break;
    case 'double_next_block': C.doubleNextBlock = true; break;
    case 'add_card': {
      const insts = [];
      for (let i = 0; i < (verb.n || 1); i++) insts.push(C.run.makeCardInstance(verb.card, false));
      if (verb.to === 'hand') C.player.hand.push(...insts);
      else if (verb.to === 'draw') C.player.drawPile.unshift(...insts);
      else C.player.discard.push(...insts);
      log(C, { t: 'add_card', card: verb.card, n: insts.length, to: verb.to });
      break;
    }
    case 'none': break;
    default:
      console.warn('[engine] unhandled verb', t);
  }
}

function addBuffAllEnemies(C, buff, n) {
  for (const e of C.enemies) if (e.alive) addBuff(e, buff, n);
}

export function drawCards(C, n) {
  for (let i = 0; i < n; i++) {
    if (C.player.hand.length >= 10) break;
    if (C.player.drawPile.length === 0) {
      if (C.player.discard.length === 0) break;
      C.player.drawPile = C.rng.shuffle(C.player.discard.splice(0));
      log(C, { t: 'reshuffle' });
    }
    C.player.hand.push(C.player.drawPile.shift());
  }
}

// ---- turn machinery ----

export function startPlayerTurn(C) {
  C.turn++;
  C.phase = 'player';
  C.player.block = 0;
  tickBuffsStart(C, C.player);
  C.player.energy = C.baseEnergy || 3;
  drawCards(C, C.drawPerTurn || 5);
  runRelicHooks(C, 'turn_start');
  log(C, { t: 'turn_start', turn: C.turn });
}

export function tickBuffsStart(C, ent) {
  if (ent.buffs.poison) {
    const p = ent.buffs.poison;
    dealDamage(ent, p, { ignoreBlock: true });
    ent.buffs.poison = Math.floor(p / 2);
    if (ent.buffs.poison <= 0) delete ent.buffs.poison;
  }
  if (ent.buffs.regen) {
    const heal = Math.min(ent.buffs.regen, ent.maxHp - ent.hp);
    ent.hp += heal;
    ent.buffs.regen -= 1;
    if (ent.buffs.regen <= 0) delete ent.buffs.regen;
  }
}

export function endPlayerTurn(C) {
  C.phase = 'end';
  runRelicHooks(C, 'turn_end');
  // retain/ethereal handling done by combat.js
  if (C.player.buffs.metallicize) gainBlock(C.player, C.player.buffs.metallicize);
  decayBuff(C.player, 'dexterity', 1);
  decayBuff(C.player, 'vulnerable', 1);
  decayBuff(C.player, 'frail', 1);
  log(C, { t: 'turn_end' });
}

function decayBuff(ent, buff, by) {
  if (!ent.buffs[buff]) return;
  ent.buffs[buff] -= by;
  if (ent.buffs[buff] <= 0) delete ent.buffs[buff];
}

export function runRelicHooks(C, hook) {
  for (const rid of C.run.relics) {
    const relic = C.run.relicById(rid);
    if (!relic || !relic.hooks || !relic.hooks[hook]) continue;
    if (relic.limit) {
      const key = rid + ':' + hook + (relic.limit.per === 'combat' ? '' : ':' + C.turn);
      C.triggered[key] = (C.triggered[key] || 0);
      if (C.triggered[key] >= relic.limit.n) continue;
      C.triggered[key]++;
    }
    for (const v of relic.hooks[hook]) applyVerb(C, v, { source: 'relic', card: null, target: null });
  }
}
