import test from 'node:test';
import assert from 'node:assert/strict';
import { DATA } from '../src/engine/registry.js';
import { createRun, applyRunEffects, addPotion } from '../src/engine/run.js';
import { startCombat, endTurn, playCard, liveCard, makeInstance } from '../src/engine/combat.js';
import { addBuff, dealDamage } from '../src/engine/effects.js';

const run = (seed = 'edge-1', cls = 'emberwright') => createRun({ seed, classId: cls });

// ---------- run-level effect guards ----------
test('lose_gold clamps at zero, never negative', () => {
  const r = run();
  r.gold = 10;
  applyRunEffects(r, [{ t: 'lose_gold', n: 30 }]);
  assert.equal(r.gold, 0);
});

test('hp_loss_pct and self_damage never drop HP below 1', () => {
  const r = run();
  r.hp = 2;
  applyRunEffects(r, [{ t: 'hp_loss_pct', pct: 0.9 }]);
  assert.ok(r.hp >= 1);
  applyRunEffects(r, [{ t: 'self_damage', n: 999 }]);
  assert.ok(r.hp >= 1);
});

test('heal caps at maxHp', () => {
  const r = run();
  r.hp = r.maxHp - 3;
  applyRunEffects(r, [{ t: 'heal', n: 999 }]);
  assert.equal(r.hp, r.maxHp);
});

test('gain_potion respects the 3-slot cap', () => {
  const r = run();
  for (const p of DATA.potions.slice(0, 5)) applyRunEffects(r, [{ t: 'gain_potion' }]);
  assert.ok(r.potions.length <= 3);
});

test('upgrade_random with nothing upgradeable is a no-op', () => {
  const r = run();
  r.deck = r.deck.filter(i => DATA.cardById.get(i.id).rarity === 'basic');
  const before = r.deck.map(i => i.upgraded);
  applyRunEffects(r, [{ t: 'upgrade_random' }]);
  assert.deepEqual(r.deck.map(i => i.upgraded), before);
});

test('gain_relic with an exhausted pool is a no-op, not a crash', () => {
  const r = run();
  r.relics = DATA.relics.filter(x => x.rarity === 'common' && !x.starter).map(x => x.id);
  applyRunEffects(r, [{ t: 'gain_relic', rarity: 'common' }]);
  assert.ok(r.relics.length === DATA.relics.filter(x => x.rarity === 'common' && !x.starter).length);
});

// ---------- combat edges ----------
test('empty draw pile reshuffles the discard pile', () => {
  const r = run();
  const C = startCombat(r, ['e_ruin_rat']);
  C.player.drawPile = C.player.drawPile.slice(0, 1);
  C.player.discard = r.deck.slice(0, 6);
  endTurn(C); // enemy phase + new player turn draws through the reshuffle
  assert.ok(C.player.hand.length > 0);
  assert.ok(C.player.drawPile.length + C.player.discard.length + C.player.hand.length >= 6);
});

test('drawing from a truly empty deck does not crash', () => {
  const r = run();
  const C = startCombat(r, ['e_ruin_rat']);
  C.player.drawPile = [];
  C.player.discard = [];
  endTurn(C);
  assert.ok(!C.over || C.over === 'win' || C.over === 'loss');
});

test('poison kills the player at turn start -> loss', () => {
  const r = run();
  const C = startCombat(r, ['e_ruin_rat']);
  C.player.hp = 1;
  C.player.block = 0;
  addBuff(C.player, 'poison', 9);
  endTurn(C); // enemy hits (rat), then next player-turn-start poison tick
  // either the rat or the poison finished it — must be a clean loss, not a hang
  let guard = 0;
  while (!C.over && guard++ < 50) endTurn(C);
  assert.equal(C.over, 'loss');
});

test('thorns can kill the attacker and end the fight cleanly', () => {
  const r = run();
  const C = startCombat(r, ['e_ruin_rat']);
  C.player.buffs.thorns = 50;
  C.player.hp = 99; C.player.maxHp = 99;
  let guard = 0;
  while (!C.over && guard++ < 30) endTurn(C);
  assert.equal(C.over, 'win');
});

test('unplayable status cards cannot be played', () => {
  const r = run();
  r.deck.push(makeInstance('c_curse_bind', false));
  const C = startCombat(r, ['e_ruin_rat']);
  C.player.hand = [makeInstance('c_curse_bind', false)];
  const inst = C.player.hand[0];
  const res = playCard(C, inst.uid, 0);
  assert.equal(res.ok, false);
});
