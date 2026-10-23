// Run lifecycle: the meta-loop around combat. Pure logic, no DOM.
import { DATA } from './registry.js';
import { makeRng } from './rng.js';
import { generateMap, reachableFrom } from './map.js';
import { makeInstance } from './combat.js';

export function createRun({ seed, classId }) {
  const cls = DATA.classById.get(classId);
  if (!cls) throw new Error(`unknown class ${classId}`);
  const rng = makeRng(seed);
  const run = {
    seed,
    rng,
    char: cls,
    hp: cls.hp,
    maxHp: cls.hp,
    gold: 99,
    deck: [],
    relics: [],
    potions: [],
    act: 1,
    map: null,
    row: -1,
    col: -1,
    state: 'map',
    node: null,
    reward: null,
    shop: null,
    event: null,
    restUsed: false,
    stats: { kills: 0, turns: 0, dmgDealt: 0, dmgTaken: 0, cardsPlayed: 0, startedAt: Date.now() },
    rngState: 0,
    finished: null, // 'victory' | 'death'
  };
  run.relicById = relicById;
  run.makeCardInstance = (id, up) => makeInstance(id, up);
  for (const id of cls.starting_deck) run.deck.push(makeInstance(id, false));
  run.relics.push(cls.starting_relic);
  run.map = generateMap(rng, 1);
  return run;
}

// --- helpers on run ---
export function relicById(id) { return DATA.relicById.get(id); }
export function addRelic(run, id) { if (!run.relics.includes(id)) run.relics.push(id); }
export function addPotion(run, id) { if (run.potions.length < 3) run.potions.push(id); }
export function deckCount(run, cardId) { return run.deck.filter(i => i.id === cardId).length; }
export function makeCardInstance(run, cardId, upgraded) { return makeInstance(cardId, upgraded); }

export function reachable(run) { return reachableFrom(run.map, run.row, run.col); }

export function enterNode(run, row, col) {
  const reach = reachable(run);
  if (!reach.some(n => n.row === row && n.col === col)) throw new Error('node not reachable');
  run.row = row; run.col = col;
  run.node = run.map[row][col];
  run.restUsed = false;
  for (const rid of run.relics) {
    const r = relicById(rid);
    if (r?.hooks?.map_move) applyRunEffects(run, r.hooks.map_move);
  }
  return run.node;
}

// Enemy groups for a node.
export function encounterFor(run, nodeType) {
  const act = run.act;
  const pool = DATA.enemies.filter(e => e.act === act);
  if (nodeType === 'boss') {
    const bosses = pool.filter(e => e.tier === 'boss');
    return [run.rng.pick(bosses).id];
  }
  if (nodeType === 'elite') {
    const elites = pool.filter(e => e.tier === 'elite');
    return [run.rng.pick(elites).id];
  }
  const normals = pool.filter(e => e.tier === 'normal');
  const count = run.row < 4 ? run.rng.int(1, 2) : run.rng.int(1, 3);
  const group = [];
  for (let i = 0; i < count; i++) group.push(run.rng.pick(normals).id);
  return group;
}

// --- rewards ---
export function rollCardReward(run, n = 3) {
  const prefix = run.char.card_pool_prefix;
  const rarityW = run.rng.chance(0.12 + run.act * 0.03) ? 'rare' : run.rng.chance(0.35) ? 'uncommon' : 'common';
  const pool = DATA.cards.filter(c =>
    (c.id.startsWith(prefix) || c.id.startsWith('c_')) &&
    c.rarity === rarityW &&
    deckCount(run, c.id) < 2 &&
    c.rarity !== 'basic');
  const fallback = DATA.cards.filter(c => (c.id.startsWith(prefix) || c.id.startsWith('c_')) && c.rarity === 'common' && c.rarity !== 'basic');
  const use = pool.length ? pool : fallback;
  const picks = [];
  const chosen = new Set();
  for (let i = 0; i < n && use.length; i++) {
    let card, guard = 0;
    do { card = run.rng.pick(use); guard++; } while (chosen.has(card.id) && guard < 20);
    chosen.add(card.id);
    const upgraded = run.act >= 2 && run.rng.chance(0.4) && card.upgradeable !== false;
    picks.push({ id: card.id, upgraded });
  }
  return picks;
}

export function combatRewards(run, nodeType) {
  const gold = nodeType === 'boss' ? run.rng.int(45, 60)
    : nodeType === 'elite' ? run.rng.int(25, 35)
    : run.rng.int(10, 22);
  const reward = { gold, cards: rollCardReward(run), potion: null, relic: null };
  const potionChance = nodeType === 'boss' ? 1 : nodeType === 'elite' ? 0.5 : 0.3;
  if (run.potions.length < 3 && run.rng.chance(potionChance)) {
    const pool = DATA.potions;
    reward.potion = run.rng.pick(pool).id;
  }
  if (nodeType === 'elite' || nodeType === 'boss') {
    const rarity = nodeType === 'boss' ? 'boss' : run.rng.weighted([['common', 5], ['uncommon', 3], ['rare', 1]]);
    let pool = DATA.relics.filter(r => r.rarity === rarity && !run.relics.includes(r.id) && !r.starter);
    if (!pool.length) pool = DATA.relics.filter(r => r.rarity === 'common' && !run.relics.includes(r.id) && !r.starter);
    if (pool.length) reward.relic = run.rng.pick(pool).id;
  }
  return reward;
}

export function takeRewardCard(run, pick) {
  if (!pick) return;
  run.deck.push(makeInstance(pick.id, pick.upgraded));
}
export function takeRewardGold(run, reward) { run.gold += reward.gold; }
export function takeRewardPotion(run, reward) { if (reward.potion) addPotion(run, reward.potion); }
export function takeRewardRelic(run, reward) { if (reward.relic) addRelic(run, reward.relic); }

// --- rest ---
export function restHeal(run) {
  const amt = Math.floor(run.maxHp * 0.3);
  run.hp = Math.min(run.maxHp, run.hp + amt);
  run.restUsed = true;
  for (const rid of run.relics) {
    const r = relicById(rid);
    if (r?.hooks?.rest) applyRunEffects(run, r.hooks.rest);
  }
  return amt;
}
export function restUpgrade(run, uid) {
  const inst = run.deck.find(i => i.uid === uid);
  if (inst) inst.upgraded = true;
  run.restUsed = true;
}

// --- shop ---
export function generateShop(run) {
  const shop = { cards: [], potions: [], relic: null, removeCost: run.rng.int(55, 75), removed: false };
  const prefix = run.char.card_pool_prefix;
  for (let i = 0; i < 5; i++) {
    const rarity = run.rng.weighted([['common', 55], ['uncommon', 32], ['rare', 13]]);
    const pool = DATA.cards.filter(c => (c.id.startsWith(prefix) || c.id.startsWith('c_')) && c.rarity === rarity && c.rarity !== 'basic');
    if (!pool.length) continue;
    const card = run.rng.pick(pool);
    const price = rarity === 'common' ? run.rng.int(40, 65) : rarity === 'uncommon' ? run.rng.int(70, 95) : run.rng.int(130, 160);
    shop.cards.push({ id: card.id, upgraded: false, price, sold: false });
  }
  for (let i = 0; i < 2; i++) {
    shop.potions.push({ id: run.rng.pick(DATA.potions).id, price: run.rng.int(40, 60), sold: false });
  }
  const relicPool = DATA.relics.filter(r => (r.rarity === 'shop' || r.rarity === 'common' || r.rarity === 'uncommon') && !run.relics.includes(r.id) && !r.starter);
  if (relicPool.length) shop.relic = { id: run.rng.pick(relicPool).id, price: run.rng.int(110, 150), sold: false };
  return shop;
}

export function buyShopItem(run, item) {
  if (item.sold || run.gold < item.price) return false;
  run.gold -= item.price;
  item.sold = true;
  if (item.id.startsWith('p_') || DATA.potionById.has(item.id)) addPotion(run, item.id);
  else if (DATA.relicById.has(item.id)) addRelic(run, item.id);
  else run.deck.push(makeInstance(item.id, item.upgraded));
  return true;
}

export function shopRemoveCard(run, uid) {
  if (!run.shop || run.gold < run.shop.removeCost || run.shop.removed) return false;
  const idx = run.deck.findIndex(i => i.uid === uid);
  if (idx === -1) return false;
  run.gold -= run.shop.removeCost;
  run.deck.splice(idx, 1);
  run.shop.removed = true;
  return true;
}

// --- events ---
export function pickEvent(run) {
  const pool = DATA.events.filter(e => (e.act || []).includes(run.act));
  if (!pool.length) return null;
  return run.rng.weighted(pool.map(e => [e, e.weight || 1]));
}

export function applyRunEffects(run, effects) {
  const results = [];
  for (const v of effects || []) {
    switch (v.t) {
      case 'self_damage': run.hp = Math.max(1, run.hp - v.n); break;
      case 'heal': run.hp = Math.min(run.maxHp, run.hp + v.n); break;
      case 'gold': run.gold += v.n; break;
      case 'gain_gold': run.gold += v.n; break;
      case 'lose_gold': run.gold = Math.max(0, run.gold - v.n); break;
      case 'hp_loss_pct': run.hp = Math.max(1, run.hp - Math.max(1, Math.floor(run.hp * v.pct))); break;
      case 'add_card': run.deck.push(makeInstance(v.card, false)); break;
      case 'gain_relic': {
        let pool = DATA.relics.filter(r => r.rarity === (v.rarity || 'common') && !run.relics.includes(r.id) && !r.starter);
        if (pool.length) addRelic(run, run.rng.pick(pool).id);
        break;
      }
      case 'gain_potion': {
        if (run.potions.length < 3) addPotion(run, run.rng.pick(DATA.potions).id);
        break;
      }
      case 'upgrade_random': {
        const cands = run.deck.filter(i => {
          const def = DATA.cardById.get(i.id);
          return !i.upgraded && def.upgradeable !== false && def.rarity !== 'basic';
        });
        if (cands.length) run.rng.pick(cands).upgraded = true;
        break;
      }
      case 'remove_card': results.push({ needsRemove: true }); break;
      default: break; // combat-only verbs ignored at run level
    }
  }
  return results;
}

// --- progression ---
export function completeNode(run) {
  run.node = null;
  if (run.row === 14) {
    if (run.act >= 3) { run.finished = 'victory'; run.state = 'victory'; return run.state; }
    run.act += 1;
    run.map = generateMap(run.rng, run.act);
    run.row = -1; run.col = -1;
    run.state = 'map';
    return run.state;
  }
  run.state = 'map';
  return run.state;
}

export function onCombatLoss(run) { run.finished = 'death'; run.state = 'death'; }

// --- save/load (plain JSON) ---
export function serializeRun(run) {
  return {
    seed: run.seed, char: run.char.id, hp: run.hp, maxHp: run.maxHp, gold: run.gold,
    deck: run.deck, relics: run.relics, potions: run.potions,
    act: run.act, map: run.map, row: run.row, col: run.col, state: run.state,
    restUsed: run.restUsed, stats: run.stats, rngState: run.rng.getState(),
    finished: run.finished,
  };
}

export function deserializeRun(s) {
  const run = createRun({ seed: s.seed, classId: s.char });
  Object.assign(run, {
    hp: s.hp, maxHp: s.maxHp, gold: s.gold, deck: s.deck, relics: s.relics,
    potions: s.potions, act: s.act, map: s.map, row: s.row, col: s.col,
    state: s.state, restUsed: s.restUsed, stats: s.stats, finished: s.finished,
  });
  run.rng.setState(s.rngState);
  return run;
}
