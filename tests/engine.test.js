import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, hashSeed, dailySeed } from '../src/engine/rng.js';
import { DATA, validateData } from '../src/engine/registry.js';
import { generateMap } from '../src/engine/map.js';
import { createRun, serializeRun, deserializeRun, rollCardReward, deckCount, reachable, enterNode, encounterFor } from '../src/engine/run.js';
import { startCombat, playCard, endTurn, liveCard, makeInstance, serializeCombat, deserializeCombat } from '../src/engine/combat.js';
import { dealDamage, gainBlock, addBuff, attackDamage, resolveNum } from '../src/engine/effects.js';

// ---------- rng ----------

// ---------- combat save/restore ----------
test('combat survives serialize/deserialize round-trip', () => {
  const run = createRun({ seed: 'save-combat-1', classId: 'emberwright' });
  const C = startCombat(run, encounterFor(run, 'combat'));
  // play one card so state is non-pristine
  const inst = C.player.hand.find(i => liveCard(i).cost <= C.player.energy);
  if (inst) playCard(C, inst.uid, 0);
  const blob = JSON.parse(JSON.stringify(serializeCombat(C)));
  const C2 = deserializeCombat(blob, run);
  assert.equal(C2.enemies.length, C.enemies.length);
  assert.equal(C2.player.hand.length, C.player.hand.length);
  assert.equal(C2.player.energy, C.player.energy);
  assert.equal(C2.turn, C.turn);
  C.enemies.forEach((e, i) => {
    assert.equal(C2.enemies[i].hp, e.hp);
    assert.equal(C2.enemies[i].block, e.block);
    assert.deepEqual(C2.enemies[i].buffs, e.buffs);
    if (e.nextMove) assert.equal(C2.enemies[i].nextMove.id, e.nextMove.id);
  });
  // restored combat must still be playable
  const playable = C2.player.hand.find(i => liveCard(i).cost <= C2.player.energy);
  if (playable) {
    const res = playCard(C2, playable.uid, 0);
    assert.ok(res.ok);
  }
  // finished combat must not serialize
  const run2 = createRun({ seed: 'save-combat-2', classId: 'emberwright' });
  const C3 = startCombat(run2, encounterFor(run2, 'combat'));
  let guard = 0;
  while (!C3.over && guard++ < 100) {
    let played = true;
    while (played && !C3.over) {
      played = false;
      for (const i of C3.player.hand) {
        const res = playCard(C3, i.uid, 0);
        if (res.ok) { played = true; break; }
      }
    }
    if (!C3.over) endTurn(C3);
  }
  assert.ok(C3.over);
  assert.equal(serializeCombat(C3), null);
});

test('rng is deterministic per seed', () => {
  const a = makeRng('seed-1'), b = makeRng('seed-1');
  for (let i = 0; i < 50; i++) assert.equal(a.next(), b.next());
  assert.notEqual(makeRng('x').next(), makeRng('y').next());
});
test('rng state save/restore', () => {
  const r = makeRng('s');
  r.next(); r.next();
  const st = r.getState();
  const v1 = r.next();
  r.setState(st);
  assert.equal(r.next(), v1);
});
test('shuffle preserves multiset', () => {
  const r = makeRng('sh');
  const arr = [1, 2, 3, 4, 5, 6, 7, 8];
  const s = r.shuffle(arr);
  assert.deepEqual([...s].sort(), [...arr].sort());
});
test('dailySeed format', () => {
  assert.match(dailySeed(new Date(Date.UTC(2026, 9, 23))), /^emberday-2026-10-23$/);
});

// ---------- data ----------
test('content data passes validation', () => {
  const errs = validateData();
  assert.deepEqual(errs, []);
});
test('content volume minimums', () => {
  assert.ok(DATA.cards.length >= 72, `cards=${DATA.cards.length}`);
  assert.ok(DATA.enemies.length >= 35, `enemies=${DATA.enemies.length}`);
  assert.ok(DATA.relics.length >= 20, `relics=${DATA.relics.length}`);
  assert.ok(DATA.classes.length === 3);
  for (const act of [1, 2, 3]) {
    assert.ok(DATA.enemies.filter(e => e.act === act && e.tier === 'normal').length >= 5, `act ${act} normals`);
    assert.ok(DATA.enemies.filter(e => e.act === act && e.tier === 'boss').length >= 3, `act ${act} bosses`);
  }
});
test('every class starting deck resolves and each class has a card pool', () => {
  for (const cls of DATA.classes) {
    for (const id of cls.starting_deck) assert.ok(DATA.cardById.has(id), `${cls.id} -> ${id}`);
    const pool = DATA.cards.filter(c => c.id.startsWith(cls.card_pool_prefix) && c.rarity !== 'basic');
    assert.ok(pool.length >= 15, `${cls.id} pool too small: ${pool.length}`);
  }
});

// ---------- map ----------
test('map connectivity and structure', () => {
  for (let s = 0; s < 25; s++) {
    const rng = makeRng('map-' + s);
    const grid = generateMap(rng, 1);
    assert.equal(grid.length, 15);
    assert.equal(grid[14][0].type, 'boss');
    for (let r = 0; r < 14; r++) {
      const childParents = new Map(grid[r + 1].map(n => [n.col, 0]));
      for (const n of grid[r]) {
        assert.ok(n.next.length >= 1, `dead end at ${r},${n.col}`);
        for (const c of n.next) {
          assert.ok(c >= 0 && c < grid[r + 1].length, `bad edge ${r},${n.col} -> ${c}`);
          childParents.set(c, childParents.get(c) + 1);
        }
      }
      for (const [col, parents] of childParents) assert.ok(parents >= 1, `orphan at ${r + 1},${col}`);
    }
    // at least one rest before row 13
    assert.ok(grid.slice(0, 13).some(row => row.some(n => n.type === 'rest')));
  }
});

// ---------- combat math ----------
function dummyEnt(hp = 50) { return { hp, maxHp: hp, block: 0, buffs: {}, alive: true }; }

test('block absorbs damage before hp', () => {
  const e = dummyEnt(30);
  gainBlock(e, 10);
  dealDamage(e, 15);
  assert.equal(e.hp, 25);
  assert.equal(e.block, 0);
});
test('strength adds per hit, vulnerable multiplies', () => {
  const a = dummyEnt(); addBuff(a, 'strength', 3);
  assert.equal(attackDamage(a, 6), 9);
  const t = dummyEnt(50); addBuff(t, 'vulnerable', 2);
  const r = dealDamage(t, 10);
  assert.equal(r.lost, 15);
});
test('frail halves gained block; dexterity adds then decays', () => {
  const e = dummyEnt(); addBuff(e, 'frail', 1);
  gainBlock(e, 9); assert.equal(e.block, 4);
  const f = dummyEnt(); addBuff(f, 'dexterity', 2);
  gainBlock(f, 5); assert.equal(f.block, 7);
});
test('thorns reflect damage', () => {
  const attacker = dummyEnt(40), defender = dummyEnt(40);
  addBuff(defender, 'thorns', 4);
  dealDamage(defender, 10, { attacker });
  assert.equal(defender.hp, 30);
  assert.equal(attacker.hp, 36);
});
test('$token resolution with upgrade', () => {
  const def = DATA.cardById.get('ew_strike');
  const base = liveCard({ id: 'ew_strike', upgraded: false });
  const up = liveCard({ id: 'ew_strike', upgraded: true });
  assert.equal(resolveNum('$dmg', base), def.base.dmg);
  assert.equal(resolveNum('$dmg', up), def.base.dmg + (def.up?.dmg || 0));
});

// ---------- combat flow ----------
test('combat starts with 5 cards and 3 energy', () => {
  const run = createRun({ seed: 'flow-1', classId: DATA.classes[0].id });
  const C = startCombat(run, ['e_cinder_imp'] .filter(id => DATA.enemyById.has(id))
    .concat(DATA.enemies.filter(e => e.act === 1 && e.tier === 'normal').slice(0, 1).map(e => e.id)).slice(0, 1));
  assert.equal(C.player.hand.length, 5);
  assert.equal(C.player.energy, 3);
  assert.equal(C.turn, 1);
});
test('playing a strike costs energy and damages the enemy', () => {
  const run = createRun({ seed: 'flow-2', classId: DATA.classes[0].id });
  const enemyDef = DATA.enemies.find(e => e.act === 1 && e.tier === 'normal');
  const C = startCombat(run, [enemyDef.id]);
  const strike = C.player.hand.find(i => i.id === 'ew_strike');
  assert.ok(strike, 'opening hand should contain a strike');
  const before = C.enemies[0].hp;
  const r = playCard(C, strike.uid, 0);
  assert.equal(r.ok, true);
  assert.equal(C.player.energy, 2);
  assert.ok(C.enemies[0].hp < before);
});
test('unplayable cards cannot be played', () => {
  const curse = DATA.cards.find(c => c.unplayable);
  if (!curse) return;
  const run = createRun({ seed: 'flow-3', classId: DATA.classes[0].id });
  run.deck.push(makeInstance(curse.id, false));
  const C = startCombat(run, [DATA.enemies.find(e => e.act === 1).id]);
  C.player.hand.push(makeInstance(curse.id, false));
  const inst = C.player.hand[C.player.hand.length - 1];
  const r = playCard(C, inst.uid, 0);
  assert.equal(r.ok, false);
});
test('a full auto-combat terminates with win or loss', () => {
  const run = createRun({ seed: 'flow-4', classId: DATA.classes[0].id });
  const group = encounterFor(run, 'combat');
  const C = startCombat(run, group);
  let guard = 0;
  while (!C.over && guard++ < 100) {
    for (const inst of [...C.player.hand]) {
      const chk = playCard(C, inst.uid, 0);
      if (chk.ok && C.over) break;
    }
    if (!C.over) endTurn(C);
  }
  assert.ok(['win', 'loss'].includes(C.over), 'combat must resolve');
});

// ---------- run ----------
test('run save/load round-trip', () => {
  const run = createRun({ seed: 'save-1', classId: DATA.classes[1].id });
  const t = reachable(run)[0];
  enterNode(run, t.row, t.col);
  run.gold += 37;
  const s = JSON.parse(JSON.stringify(serializeRun(run)));
  const back = deserializeRun(s);
  assert.equal(back.gold, run.gold);
  assert.equal(back.row, run.row);
  assert.equal(back.deck.length, run.deck.length);
  assert.equal(back.rng.next(), run.rng.next());
});
test('card rewards respect pool and copy limits', () => {
  const run = createRun({ seed: 'rew-1', classId: DATA.classes[2].id });
  for (let i = 0; i < 30; i++) {
    for (const pick of rollCardReward(run)) {
      assert.ok(pick.id.startsWith('gw_') || pick.id.startsWith('c_'), `off-pool ${pick.id}`);
      assert.ok(deckCount(run, pick.id) < 2, `copy limit ${pick.id}`);
      run.deck.push({ uid: i * 10, id: pick.id, upgraded: pick.upgraded });
    }
  }
});
test('encounterFor returns valid ids per act', () => {
  for (const cls of DATA.classes) {
    const run = createRun({ seed: 'enc-' + cls.id, classId: cls.id });
    for (const act of [1, 2, 3]) {
      run.act = act;
      for (const type of ['combat', 'elite', 'boss']) {
        const ids = encounterFor(run, type);
        assert.ok(ids.length >= 1);
        for (const id of ids) {
          const e = DATA.enemyById.get(id);
          assert.ok(e, `missing enemy ${id}`);
          assert.equal(e.act, act);
          if (type === 'boss') assert.equal(e.tier, 'boss');
          if (type === 'elite') assert.equal(e.tier, 'elite');
        }
      }
    }
  }
});
