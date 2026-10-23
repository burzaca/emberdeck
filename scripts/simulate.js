// Headless auto-player: exercises the engine end-to-end, reports win rate + crashes.
// Usage: node scripts/simulate.js [runs] [classId]
import { DATA, validateData } from '../src/engine/registry.js';
import { makeRng } from '../src/engine/rng.js';
import {
  createRun, reachable, enterNode, encounterFor, combatRewards, takeRewardGold,
  restHeal, restUpgrade, applyRunEffects, completeNode, pickEvent,
} from '../src/engine/run.js';
import { startCombat, playCard, endTurn, canPlay, liveCard, makeInstance } from '../src/engine/combat.js';

const N = parseInt(process.argv[2] || '20', 10);
const classes = process.argv[3] ? [process.argv[3]] : DATA.classes.map(c => c.id);

const errs = validateData();
if (errs.length) { console.error('DATA ERRORS:'); errs.forEach(e => console.error(' -', e)); process.exit(1); }

function autoCombat(run, C) {
  let guard = 0;
  while (!C.over && guard++ < 200) {
    // play greedily: attacks first, then anything playable
    let played = true;
    while (played && !C.over) {
      played = false;
      const weakest = C.enemies.filter(e => e.alive).sort((a, b) => a.hp - b.hp)[0];
      const tIdx = weakest ? C.enemies.indexOf(weakest) : null;
      const playable = C.player.hand
        .map((inst) => ({ inst, chk: canPlay(C, inst) }))
        .filter((x) => x.chk.ok);
      const isAtk = (x) => (x.chk.card.effects || []).some((v) => v.t === 'damage');
      const ordered = [...playable.filter(isAtk), ...playable.filter((x) => !isAtk(x))];
      for (const { inst, chk } of ordered) {
        const res = playCard(C, inst.uid, isAtk({ inst, chk }) ? tIdx : null);
        if (res.ok) { played = true; break; }
      }
    }
    if (!C.over) endTurn(C);
  }
  if (guard >= 200) throw new Error('combat did not resolve in 200 turns');
  return C.over;
}

function pickReward(run) {
  const picks = run._rewardCards || [];
  if (picks.length) run.deck.push(makeInstance(picks[0].id, picks[0].upgraded));
}

function simulate(classId, seed) {
  const run = createRun({ seed, classId });
  let guard = 0;
  while (!run.finished && guard++ < 500) {
    const reach = reachable(run);
    if (!reach.length) throw new Error('no reachable nodes');
    // prefer rest if low hp, else first node
    const lowHp = run.hp < run.maxHp * 0.55;
    let target = reach[0];
    if (lowHp) { const rest = reach.find(n => run.map[n.row][n.col].type === 'rest'); if (rest) target = rest; }
    const node = enterNode(run, target.row, target.col);
    switch (node.type) {
      case 'combat': case 'elite': case 'boss': {
        const C = startCombat(run, encounterFor(run, node.type));
        const result = autoCombat(run, C);
        if (result === 'loss') { run.finished = 'death'; return run; }
        const rw = combatRewards(run, node.type);
        takeRewardGold(run, rw);
        run._rewardCards = rw.cards;
        pickReward(run);
        if (rw.relic) run.relics.push(rw.relic);
        if (rw.potion && run.potions.length < 3) run.potions.push(rw.potion);
        break;
      }
      case 'rest':
        if (run.hp < run.maxHp * 0.8) restHeal(run);
        else { const cands = run.deck.filter(i => !i.upgraded); if (cands.length) restUpgrade(run, run.rng.pick(cands).uid); }
        break;
      case 'shop': break; // skip
      case 'treasure': run.gold += 20; break;
      case 'event': {
        const ev = pickEvent(run);
        if (ev) {
          const safe = ev.options[ev.options.length - 1];
          applyRunEffects(run, safe.effects);
        }
        break;
      }
    }
    completeNode(run);
  }
  if (guard >= 500) throw new Error('run did not finish in 500 nodes');
  return run;
}

const results = [];
for (const cls of classes) {
  for (let i = 0; i < N; i++) {
    const seed = `sim-${cls}-${i}`;
    try {
      const run = simulate(cls, seed);
      results.push({ cls, seed, outcome: run.finished, act: run.act, deck: run.deck.length, hp: run.hp });
    } catch (e) {
      results.push({ cls, seed, outcome: 'CRASH', error: e.message });
      console.error(`CRASH ${cls} ${seed}: ${e.stack}`);
    }
  }
}
const byCls = {};
for (const r of results) {
  byCls[r.cls] = byCls[r.cls] || { win: 0, death: 0, crash: 0, acts: [] };
  if (r.outcome === 'victory') byCls[r.cls].win++;
  else if (r.outcome === 'death') byCls[r.cls].death++;
  else byCls[r.cls].crash++;
  byCls[r.cls].acts.push(r.act || 0);
}
console.log(`\nSIMPLE-AI SIMULATION — ${N} runs per class (greedy policy, no potions/shops)`);
for (const [cls, s] of Object.entries(byCls)) {
  const avgAct = (s.acts.reduce((a, b) => a + b, 0) / s.acts.length).toFixed(2);
  console.log(`${cls.padEnd(14)} win=${s.win} death=${s.death} crash=${s.crash} avgActReached=${avgAct}`);
}
const crashes = results.filter(r => r.outcome === 'CRASH');
if (crashes.length) { console.log('\nFirst crash detail:'); console.log(crashes[0].error); process.exit(2); }
