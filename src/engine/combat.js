// Combat lifecycle: setup, card play, enemy AI turns, win/loss.
import { DATA } from './registry.js';
import {
  applyVerb, gainBlock, addBuff, dealDamage, attackDamage,
  startPlayerTurn, endPlayerTurn, tickBuffsStart, runRelicHooks, drawCards,
} from './effects.js';

let UID = 1;
export function resetUid() { UID = 1; }

export function makeInstance(cardId, upgraded = false) {
  return { uid: UID++, id: cardId, upgraded };
}

// Build a live card object (definition + upgrade state) from an instance.
export function liveCard(inst) {
  const def = DATA.cardById.get(inst.id);
  return { ...def, base: def.base || {}, _upgraded: !!inst.upgraded, _inst: inst };
}

export function startCombat(run, enemyIds) {
  const C = {
    rng: run.rng,
    run,
    player: {
      id: 'player', name: run.char.name, side: 'player',
      hp: run.hp, maxHp: run.maxHp, block: 0, buffs: {}, alive: true,
      energy: 0, hand: [], drawPile: [], discard: [], exhaust: [],
    },
    enemies: enemyIds.map((id, i) => {
      const def = DATA.enemyById.get(id);
      const hp = run.rng.int(def.hp[0], def.hp[1]);
      return {
        id: `${id}#${i}`, defId: id, name: def.name, side: 'enemy',
        hp, maxHp: hp, block: 0, buffs: {}, alive: true, data: def,
        nextMove: null, lastMove: null,
      };
    }),
    turn: 0, phase: 'setup', log: [], doubleNextBlock: false, triggered: {},
    baseEnergy: 3, drawPerTurn: 5,
    over: null, // 'win' | 'loss'
  };
  // deck -> draw pile
  C.player.drawPile = run.rng.shuffle(run.deck.slice());
  // innate cards first
  const innate = C.player.drawPile.filter(i => DATA.cardById.get(i.id).innate);
  if (innate.length) {
    C.player.drawPile = [
      ...innate,
      ...C.player.drawPile.filter(i => !DATA.cardById.get(i.id).innate),
    ];
  }
  runRelicHooks(C, 'combat_start');
  startPlayerTurn(C);
  planAllEnemies(C);
  return C;
}

function planAllEnemies(C) {
  for (const e of C.enemies) if (e.alive) e.nextMove = pickMove(C, e);
}

function pickMove(C, e) {
  const def = e.data;
  const turn = C.turn + 1; // move executes on the upcoming enemy phase
  if (turn === 1 && def.opener) return def.moves.find(m => m.id === def.opener);
  let pool = def.moves.filter(m => m.weight > 0);
  if (def.no_repeat && e.lastMove && pool.length > 1) pool = pool.filter(m => m.id !== e.lastMove);
  if (pool.length === 0) pool = def.moves;
  const move = C.rng.weighted(pool.map(m => [m, m.weight]));
  return move;
}

export function canPlay(C, inst) {
  const card = liveCard(inst);
  if (card.unplayable || (card.keywords || []).includes('unplayable')) return { ok: false, why: 'unplayable' };
  if (card.cost > C.player.energy) return { ok: false, why: 'energy' };
  if (card.target === 'enemy' && !C.enemies.some(e => e.alive)) return { ok: false, why: 'no_target' };
  return { ok: true, card };
}

export function playCard(C, uid, targetIdx = null) {
  const idx = C.player.hand.findIndex(i => i.uid === uid);
  if (idx === -1) return { ok: false, why: 'not_in_hand' };
  const inst = C.player.hand[idx];
  const chk = canPlay(C, inst);
  if (!chk.ok) return chk;
  const card = chk.card;
  let target = null;
  if (card.target === 'enemy') {
    const alive = C.enemies.filter(e => e.alive);
    target = targetIdx != null ? C.enemies[targetIdx] : alive[0];
    if (!target || !target.alive) target = alive[0];
  }
  C.player.energy -= card.cost;
  C.player.hand.splice(idx, 1);
  C.log.push({ t: 'play_card', card: card.id, name: card.name, target: target ? target.id : null });
  for (const v of card.effects) applyVerb(C, v, { card, target, source: 'card' });
  if (card.exhaust) C.player.exhaust.push(inst);
  else C.player.discard.push(inst);
  runRelicHooks(C, 'card_played');
  checkOver(C);
  return { ok: true };
}

export function usePotion(C, potionId) {
  const p = DATA.potionById.get(potionId);
  if (!p) return { ok: false };
  if (p.combat_only && C.phase !== 'player') return { ok: false };
  runPotionEffects(C, p);
  return { ok: true };
}

function runPotionEffects(C, p) {
  for (const v of p.effects) {
    // potion targets
    if (v.t === 'damage') {
      const alive = C.enemies.filter(e => e.alive);
      for (const tgt of (v.all ? alive : alive.slice(0, 1))) {
        const dmg = attackDamage(C.player, v.n);
        dealDamage(tgt, dmg, { attacker: C.player });
      }
    } else applyVerb(C, v, { card: null, target: null, source: 'potion' });
  }
}

export function endTurn(C) {
  if (C.over) return;
  endPlayerTurn(C);
  // discard hand (retain stays), ethereal burns
  const keep = [];
  for (const inst of C.player.hand) {
    const def = DATA.cardById.get(inst.id);
    if (def.retain) keep.push(inst);
    else if (def.ethereal) C.player.exhaust.push(inst);
    else C.player.discard.push(inst);
  }
  C.player.hand = keep;

  C.phase = 'enemy';
  for (const e of C.enemies) {
    if (!e.alive) continue;
    e.block = 0;
    tickBuffsStart(C, e);
    if (!e.alive) continue;
    const move = e.nextMove || pickMove(C, e);
    e.lastMove = move.id;
    executeEnemyMove(C, e, move);
    if (C.over) return;
    // enemy end-of-turn decay
    if (e.buffs.vulnerable) { e.buffs.vulnerable -= 1; if (e.buffs.vulnerable <= 0) delete e.buffs.vulnerable; }
    if (e.buffs.frail) { e.buffs.frail -= 1; if (e.buffs.frail <= 0) delete e.buffs.frail; }
    if (e.buffs.entangle) { e.buffs.entangle -= 1; if (e.buffs.entangle <= 0) delete e.buffs.entangle; }
    if (e.buffs.ritual) addBuff(e, 'strength', e.buffs.ritual);
  }
  planAllEnemies(C);
  if (!C.over) startPlayerTurn(C);
}

function executeEnemyMove(C, e, move) {
  C.log.push({ t: 'enemy_move', enemy: e.id, move: move.id, intent: move.intent });
  const p = C.player;
  switch (move.intent) {
    case 'attack': {
      const hits = move.hits || 1;
      for (let i = 0; i < hits; i++) {
        if (!e.alive) break;
        const dmg = attackDamage(e, move.dmg || 0);
        dealDamage(p, dmg, { attacker: e });
        runRelicHookDamaged(C, dmg);
        if (p.hp <= 0) { C.over = 'loss'; syncHp(C); return; }
      }
      break;
    }
    case 'block': gainBlock(e, move.block || 0); break;
    case 'buff': if (move.buff) addBuff(e, move.buff.buff, move.buff.n); break;
    case 'strength_up': addBuff(e, 'strength', move.n || 0); break;
    case 'debuff': if (move.debuff) addBuff(C.player, move.debuff.buff, move.debuff.n); break;
    case 'attack_debuff': {
      const hits = move.hits || 1;
      for (let i = 0; i < hits; i++) {
        const dmg = attackDamage(e, move.dmg || 0);
        dealDamage(C.player, dmg, { attacker: e });
        runRelicHookDamaged(C, dmg);
        if (C.player.hp <= 0) { C.over = 'loss'; syncHp(C); return; }
      }
      if (move.debuff) addBuff(C.player, move.debuff.buff, move.debuff.n);
      break;
    }
  }
}

function runRelicHookDamaged(C, amount) {
  for (const rid of C.run.relics) {
    const relic = C.run.relicById(rid);
    if (!relic || !relic.hooks || !relic.hooks.damaged) continue;
    if (relic.limit) {
      const key = rid + ':damaged:' + C.turn;
      C.triggered[key] = C.triggered[key] || 0;
      if (C.triggered[key] >= relic.limit.n) continue;
      C.triggered[key]++;
    }
    for (const v of relic.hooks.damaged) applyVerb(C, v, { source: 'relic', card: null, target: null });
  }
}

export function checkOver(C) {
  if (C.over) { syncHp(C); return; }
  if (C.enemies.every(e => !e.alive)) {
    C.over = 'win';
    runRelicHooks(C, 'combat_end');
    syncHp(C);
  } else if (C.player.hp <= 0) {
    C.over = 'loss';
    syncHp(C);
  }
}

function syncHp(C) { C.run.hp = Math.max(0, C.player.hp); }

// Intents for UI: what each enemy will do next turn.
export function enemyIntents(C) {
  return C.enemies.map(e => {
    if (!e.alive || !e.nextMove) return null;
    const m = e.nextMove;
    return {
      intent: m.intent,
      dmg: m.dmg != null ? attackDamage(e, m.dmg) * (m.hits || 1) : null,
      hits: m.hits || 1,
      block: m.block || 0,
    };
  });
}
