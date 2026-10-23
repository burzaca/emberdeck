// Headless auto-player: exercises the engine end-to-end, reports win rate + crashes.
// Usage: node scripts/simulate.js [runs] [classId]
import { DATA, validateData } from '../src/engine/registry.js';
import {
  createRun, reachable, enterNode, encounterFor, combatRewards, takeRewardGold,
  restHeal, restUpgrade, applyRunEffects, completeNode, pickEvent,
  generateShop, buyShopItem,
} from '../src/engine/run.js';
import { startCombat, playCard, endTurn, canPlay, makeInstance, usePotion } from '../src/engine/combat.js';

const N = parseInt(process.argv[2] || '20', 10);
const classes = process.argv[3] ? [process.argv[3]] : DATA.classes.map(c => c.id);

const errs = validateData();
if (errs.length) { console.error('DATA ERRORS:'); errs.forEach(e => console.error(' -', e)); process.exit(1); }

// Decent policy: attack the weakest, block when lethal incoming, potions when low,
// prefer higher-rarity rewards, rest when hurt, upgrade otherwise.
function autoCombat(run, C) {
  let guard = 0;
  while (!C.over && guard++ < 200) {
    if (C.player.hp < C.player.maxHp * 0.45) {
      const p = DATA.potions.filter(x => run.potions.includes(x.id) && x.combat_only &&
        (x.effects || []).some(v => v.t === 'block' || v.t === 'heal' || v.t === 'energy'))[0];
      if (p) { usePotion(C, p.id); run.potions = run.potions.filter(x => x !== p.id); }
    }
    let played = true;
    while (played && !C.over) {
      played = false;
      const alive = C.enemies.filter(e => e.alive);
      const weakest = alive.sort((a, b) => a.hp - b.hp)[0];
      const tIdx = weakest ? C.enemies.indexOf(weakest) : null;
      const incoming = C.enemies.reduce((s, e) =>
        s + (e.nextMove && (e.nextMove.intent === 'attack' || e.nextMove.intent === 'attack_debuff')
          ? (e.nextMove.dmg || 0) * (e.nextMove.hits || 1) : 0), 0);
      const needBlock = incoming > C.player.hp - C.player.block;
      const playable = C.player.hand
        .map((inst) => ({ inst, chk: canPlay(C, inst) }))
        .filter((x) => x.chk.ok);
      const has = (x, t) => (x.chk.card.effects || []).some((v) => v.t === t);
      const isAtk = (x) => has(x, 'damage');
      const isBlk = (x) => has(x, 'block');
      const isPow = (x) => (x.chk.card.type === 'power' || has(x, 'buff') || has(x, 'debuff') || has(x, 'draw') || has(x, 'energy'));
      const debuffValue = (x) => {
        const effs = x.chk.card.effects || [];
        const tgt = alive[0];
        if (!tgt) return 0;
        let v = 0;
        for (const e of effs) {
          if (e.t === 'debuff' || e.t === 'apply') {
            const b = e.buff || (e.debuff && e.debuff.buff);
            if (!b) continue;
            const already = tgt.buffs[b] > 0;
            if (b === 'vulnerable') v += already ? 10 : 55;
            if (b === 'frail') v += already ? 8 : 45;
            if (b === 'poison') v += already ? 20 : 40;
            if (b === 'entangle') v += 30;
          }
        }
        return v;
      };
      const early = C.turn <= 2;
      let ordered;
      const scoreCard = (x) => {
        if (needBlock && isBlk(x)) return 100;
        const dv = debuffValue(x);
        if (isAtk(x)) return 60 + dv * 0.3;
        if (dv > 0) return 40 + dv;
        if (isPow(x) && early) return 50;
        if (isBlk(x)) return 30;
        return 20;
      };
      ordered = [...playable].sort((a, b) => scoreCard(b) - scoreCard(a));
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

const RARITY_RANK = { rare: 3, uncommon: 2, common: 1, basic: 0 };
function pickBestReward(run, picks) {
  if (!picks.length) return;
  picks.sort((a, b) => {
    const ra = RARITY_RANK[DATA.cardById.get(a.id).rarity] || 0;
    const rb = RARITY_RANK[DATA.cardById.get(b.id).rarity] || 0;
    return rb - ra;
  });
  run.deck.push(makeInstance(picks[0].id, picks[0].upgraded));
}

function simulate(classId, seed) {
  const run = createRun({ seed, classId });
  let guard = 0;
  while (!run.finished && guard++ < 500) {
    const reach = reachable(run);
    if (!reach.length) throw new Error('no reachable nodes');
    const lowHp = run.hp < run.maxHp * 0.6;
    let target = reach[0];
    if (lowHp) { const rest = reach.find(n => run.map[n.row][n.col].type === 'rest'); if (rest) target = rest; }
    const node = enterNode(run, target.row, target.col);
    switch (node.type) {
      case 'combat': case 'elite': case 'boss': {
        const group = encounterFor(run, node.type);
        const C = startCombat(run, group);
        const result = autoCombat(run, C);
        if (result === 'loss') {
          run.finished = 'death';
          run._death = { row: target.row, col: target.col, type: node.type, enemies: group, hp: run.hp };
          return run;
        }
        const rw = combatRewards(run, node.type);
        takeRewardGold(run, rw);
        pickBestReward(run, rw.cards);
        if (rw.relic) run.relics.push(rw.relic);
        if (rw.potion && run.potions.length < 3) run.potions.push(rw.potion);
        break;
      }
      case 'rest': {
        const cands = run.deck.filter(i => !i.upgraded && DATA.cardById.get(i.id).upgrade);
        if (run.hp < run.maxHp * 0.55 || !cands.length) restHeal(run);
        else {
          cands.sort((a, b) => (RARITY_RANK[DATA.cardById.get(b.id).rarity] || 0) - (RARITY_RANK[DATA.cardById.get(a.id).rarity] || 0));
          restUpgrade(run, cands[0].uid);
        }
        break;
      }
      case 'shop': {
        const shop = generateShop(run);
        // human-like: relic first, then best affordable card, potion if flush
        if (shop.relic && run.gold - shop.relic.price >= 30) buyShopItem(run, shop.relic);
        const cards = shop.cards.filter(c => !c.sold && c.price <= run.gold - 20)
          .sort((a, b) => (RARITY_RANK[DATA.cardById.get(b.id).rarity] || 0) - (RARITY_RANK[DATA.cardById.get(a.id).rarity] || 0));
        if (cards.length) buyShopItem(run, cards[0]);
        if (run.gold > 150 && run.potions.length < 3 && shop.potions.length) buyShopItem(run, shop.potions[0]);
        break;
      }
      case 'treasure': run.gold += 20; break;
      case 'event': {
        const ev = pickEvent(run);
        if (ev) applyRunEffects(run, ev.options[ev.options.length - 1].effects); // safe option
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
      results.push({ cls, seed, outcome: run.finished, act: run.act, deck: run.deck.length, hp: run.hp, death: run._death });
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
console.log(`\nAUTOPLAYER SIMULATION — ${N} runs per class (blocks, potions, best-rarity rewards)`);
const deaths = results.filter(r => r.outcome === 'death' && r.death);
const byType = {};
for (const d of deaths) { const k = d.death.type; byType[k] = byType[k] || { n: 0, rows: [], foes: {} }; byType[k].n++; byType[k].rows.push(d.death.row); for (const f of d.death.enemies) byType[k].foes[f] = (byType[k].foes[f] || 0) + 1; }
for (const [t, s] of Object.entries(byType)) {
  const top = Object.entries(s.foes).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([f,n])=>`${f}x${n}`).join(', ');
  console.log(`death@${t}: n=${s.n} rows=[${s.rows.sort((a,b)=>a-b).join(',')}] topFoes: ${top}`);
}
for (const [cls, s] of Object.entries(byCls)) {
  const avgAct = (s.acts.reduce((a, b) => a + b, 0) / s.acts.length).toFixed(2);
  console.log(`${cls.padEnd(14)} win=${s.win} death=${s.death} crash=${s.crash} avgActReached=${avgAct}`);
}
const crashes = results.filter(r => r.outcome === 'CRASH');
if (crashes.length) { console.log('\nFirst crash detail:'); console.log(crashes[0].error); process.exit(2); }
