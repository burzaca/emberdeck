// EMBERDECK main flow: screens, input, glue between engine and DOM.
import { DATA, validateData } from '../engine/registry.js';
import { dailySeed } from '../engine/rng.js';
import {
  createRun, reachable, enterNode, encounterFor, combatRewards,
  takeRewardGold, restHeal, restUpgrade, generateShop, buyShopItem, shopRemoveCard,
  pickEvent, applyRunEffects, completeNode, serializeRun, deserializeRun,
  addPotion, addRelic,
} from '../engine/run.js';
import {
  startCombat, playCard, endTurn, canPlay, liveCard, usePotion, enemyIntents, makeInstance,
  serializeCombat, deserializeCombat,
} from '../engine/combat.js';
import { BUFF_INFO } from '../engine/effects.js';
import { el, $id, show, toast, initTooltips, modal, closeModal, esc } from './dom.js';
import { cardNode } from './cards.js';
import { sfx, setMuted, isMuted } from './sfx.js';

const SAVE_KEY = 'emberd…e.v1';
const G = { run: null, combat: null, selectedUid: null, reward: null, takenCards: false };
window.__emberdeck = G; // debug/test hook
window.__forceShop = () => { if (G.run) { G.run.shop = generateShop(G.run); showShop(); } };
window.__forceRest = () => { if (G.run) showRest(); };
window.__forceEnd = (win) => { if (G.run) { G.run.finished = win ? 'victory' : 'death'; showEnd(); } };

// ---------- boot ----------
window.addEventListener('DOMContentLoaded', () => {
  initTooltips();
  const errs = validateData();
  if (errs.length) {
    console.error('DATA ERRORS:', errs);
    const b = el('div', 'data-warn', `⚠ ${errs.length} content issue(s) — game may misbehave. See console.`);
    document.body.appendChild(b);
  }
  $id('btn-newrun').addEventListener('click', () => show('screen-class'));
  $id('btn-daily').addEventListener('click', () => {
    $id('seed-input').value = dailySeed();
    toast(`Today's seed: ${dailySeed()} — same map for everyone today.`);
    show('screen-class');
  });
  $id('btn-howto').addEventListener('click', showHowTo);
  const sndBtn = $id('btn-sound');
  const paintSnd = () => { sndBtn.textContent = isMuted() ? '🔇' : '🔊'; };
  paintSnd();
  sndBtn.addEventListener('click', () => { setMuted(!isMuted()); paintSnd(); if (!isMuted()) sfx.click(); });
  $id('btn-menu').addEventListener('click', showMenu);
  $id('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  const saved = loadSave();
  if (saved) {
    $id('btn-continue').classList.remove('hidden');
    $id('btn-continue').addEventListener('click', () => {
      G.run = deserializeRun(saved);
      document.body.dataset.char = G.run.char.id;
      if (saved.combat) {
        try {
          G.combat = deserializeCombat(saved.combat, G.run);
          show('screen-combat');
          renderCombat();
          return;
        } catch { G.combat = null; }
      }
      showMap();
    });
  }
  buildClassCards();
  try {
    const best = JSON.parse(localStorage.getItem(SAVE_KEY + '.best') || 'null');
    if (best) $id('best-line').textContent = best.win
      ? `best run: VICTORY (${best.when}) — seed ${best.seed}`
      : `best run: Act ${best.act} (${best.when})`;
  } catch {}
});

function loadSave() {
  try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; }
  catch { return null; }
}
function saveGame() {
  // note: combat is appended by callers that have one; see afterAction
  if (!G.run || G.combat) return;
  try {
    const blob = serializeRun(G.run);
    blob.combat = serializeCombat(G.combat);
    localStorage.setItem(SAVE_KEY, JSON.stringify(blob));
  } catch {}
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch {} }

// ---------- title / class ----------
function buildClassCards() {
  const wrap = $id('class-cards');
  wrap.innerHTML = '';
  for (const cls of DATA.classes) {
    const c = el('div', `class-card cls-${cls.id}`);
    c.append(el('h3', null, cls.name));
    c.append(el('p', 'class-blurb', cls.blurb));
    c.append(el('p', 'class-hp', `❤ ${cls.hp} HP`));
    const btn = el('button', 'big-btn', 'Begin');
    btn.addEventListener('click', () => startRun(cls.id));
    c.append(btn);
    wrap.append(c);
  }
}

function startRun(classId) {
  const raw = $id('seed-input').value.trim();
  const seed = raw || `e-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)}`;
  G.run = createRun({ seed, classId });
  document.body.dataset.char = classId;
  G.combat = null;
  clearSave();
  toast(`Run seed: ${seed}`);
  showMap();
}

// ---------- top bar ----------
function updateTopbar() {
  const r = G.run;
  const showTb = !!r;
  for (const id of ['tb-act', 'tb-gold', 'tb-hp']) $id(id).classList.toggle('hidden', !showTb);
  if (!r) return;
  $id('tb-act').textContent = `ACT ${r.act}`;
  $id('tb-gold').textContent = `◉ ${r.gold}`;
  $id('tb-hp').textContent = `❤ ${r.hp}/${r.maxHp}`;
}

// ---------- map ----------
const NODE_ICON = { combat: '⚔', elite: '☠', rest: '🔥', shop: '◉', event: '?', treasure: '✦', boss: '♛' };
const NODE_TIP = { combat: 'Fight', elite: 'Elite fight — better rewards', rest: 'Rest', shop: 'Shop', event: 'Unknown', treasure: 'Treasure', boss: 'BOSS' };

function showMap() {
  G.combat = null;
  updateTopbar();
  saveGame();
  const r = G.run;
  show('screen-map');
  $id('map-act-title').textContent = `Act ${r.act}`;
  if (window.__lastAct !== r.act) {
    window.__lastAct = r.act;
    const names = ['', 'THE EMBER RUINS', 'THE FROZEN DEEP', 'THE HOLLOW SPIRE'];
    if (r.act > 1) toast(`ACT ${r.act} — ${names[r.act] || ''}`, 3500);
  }
  renderRelicBar();
  renderPotionsBar();
  const wrap = $id('map-wrap');
  const nodesEl = $id('map-nodes');
  const svg = $id('map-svg');
  nodesEl.innerHTML = '';
  svg.innerHTML = '';
  const ROWH = 78, PAD = 40;
  const H = 15 * ROWH + PAD * 2;
  const W = Math.max(360, wrap.clientWidth);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.height = H + 'px';
  wrap.style.height = Math.min(window.innerHeight - 190, H) + 'px';
  const pos = (n) => {
    const row = r.map[n.row];
    const x = (n.col + 0.5) * (W / row.length);
    const y = H - PAD - n.row * ROWH;
    return { x, y };
  };
  const reach = reachable(r);
  const reachSet = new Set(reach.map(n => `${n.row},${n.col}`));
  // edges first
  for (const row of r.map) for (const n of row) {
    for (const c2 of n.next) {
      const a = pos(n), b = pos({ row: n.row + 1, col: c2 });
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      const active = reachSet.has(`${n.row},${n.col}`) && reachSet.has(`${n.row + 1},${c2}`);
      line.setAttribute('class', 'map-edge' + (active ? ' active' : ''));
      svg.append(line);
    }
  }
  for (const row of r.map) for (const n of row) {
    const { x, y } = pos(n);
    const visited = n.row === r.row && n.col === r.col;
    const canGo = reachSet.has(`${n.row},${n.col}`);
    const node = el('button', `map-node nt-${n.type}${visited ? ' visited' : ''}${canGo ? ' reachable' : ''}`);
    node.style.left = x + 'px'; node.style.top = y + 'px';
    node.textContent = NODE_ICON[n.type] || '?';
    node.setAttribute('data-tip', NODE_TIP[n.type] || '');
    if (canGo) node.addEventListener('click', () => goNode(n.row, n.col));
    nodesEl.append(node);
  }
  wrap.scrollTop = wrap.scrollHeight;
}

function renderRelicBar() {
  const bar = $id('relic-bar');
  bar.innerHTML = '';
  for (const rid of G.run.relics) {
    const r = DATA.relicById.get(rid);
    const chip = el('span', 'relic-chip', '◆');
    chip.setAttribute('data-tip', `<b>${esc(r.name)}</b><br>${esc(r.text)}`);
    bar.append(chip);
  }
}

function renderPotionsBar(targetEl) {
  const bar = targetEl || $id('potions-bar');
  bar.innerHTML = '';
  for (const pid of [...G.run.potions]) {
    const p = DATA.potionById.get(pid);
    const inCombat = !!G.combat;
    if (inCombat && !p.combat_only) continue;
    if (!inCombat && p.combat_only) continue;
    const chip = el('button', 'potion-chip', '⚗');
    chip.setAttribute('data-tip', `<b>${esc(p.name)}</b><br>${esc(p.text)}`);
    chip.addEventListener('click', () => {
      if (G.combat) {
        usePotion(G.combat, pid);
        G.run.potions = G.run.potions.filter(x => x !== pid);
        G.run.hp = Math.max(0, G.combat.player.hp);
        updateTopbar();
        renderCombat();
      } else {
        applyRunEffects(G.run, p.effects);
        G.run.potions = G.run.potions.filter(x => x !== pid);
        toast(`Used ${p.name}`);
        showMap();
      }
    });
    bar.append(chip);
  }
}

function goNode(row, col) {
  sfx.click();
  const node = enterNode(G.run, row, col);
  switch (node.type) {
    case 'combat': case 'elite': case 'boss': {
      const group = encounterFor(G.run, node.type);
      G.combat = startCombat(G.run, group);
      G.selectedUid = null;
      show('screen-combat');
      renderCombat();
      if (!localStorage.getItem(SAVE_KEY + '.taught')) {
        toast('Click an attack card, then click the enemy. Read the intent above its head.', 5000);
        try { localStorage.setItem(SAVE_KEY + '.taught', '1'); } catch {}
      }
      break;
    }
    case 'rest': showRest(); break;
    case 'shop': G.run.shop = generateShop(G.run); showShop(); break;
    case 'event': {
      const ev = pickEvent(G.run);
      if (!ev) { toast('Nothing here...'); finishNode(); break; }
      G.run.event = ev;
      showEvent();
      break;
    }
    case 'treasure': {
      const pool = DATA.relics.filter(x => !G.run.relics.includes(x.id) && !x.starter && x.rarity !== 'boss');
      const relic = G.run.rng.pick(pool);
      addRelic(G.run, relic.id);
      const gold = G.run.rng.int(15, 30);
      G.run.gold += gold;
      toast(`✦ ${relic.name} — ${relic.text}  (+◉${gold})`, 4000);
      finishNode();
      break;
    }
    default: finishNode();
  }
}

function finishNode() {
  completeNode(G.run);
  if (G.run.finished === 'victory') { showEnd(); return; }
  showMap();
}

// ---------- combat ----------
function renderCombat() {
  const C = G.combat;
  if (!C) return;
  updateTopbar();
  // enemies
  const row = $id('enemies-row');
  row.innerHTML = '';
  const intents = enemyIntents(C);
  C.enemies.forEach((e, idx) => {
    if (!e.alive) return;
    const n = el('div', 'enemy', '');
    n.dataset.idx = idx;
    const art = el('div', 'enemy-art', e.data.art || '☠');
    n.append(art);
    const intent = intents[idx];
    if (intent) {
      const badge = el('div', 'intent', intentBadge(intent));
      n.append(badge);
    }
    n.append(el('div', 'enemy-name', e.name));
    const hpbar = el('div', 'hpbar');
    const fill = el('div', 'hpfill');
    fill.style.width = `${Math.max(0, e.hp / e.maxHp * 100)}%`;
    hpbar.append(fill);
    hpbar.append(el('span', 'hptext', `${e.hp}/${e.maxHp}`));
    n.append(hpbar);
    if (e.block > 0) n.append(el('div', 'block-badge', `🛡 ${e.block}`));
    n.append(buffChips(e));
    n.addEventListener('click', () => onEnemyClick(idx));
    row.append(n);
  });
  // player
  $id('energy-num').textContent = C.player.energy;
  const hpfill = document.querySelector('#player-avatar .hpfill');
  $id('player-block').classList.toggle('hidden', C.player.block <= 0);
  $id('player-block').textContent = `🛡 ${C.player.block}`;
  const pb = $id('player-buffs');
  pb.innerHTML = '';
  pb.append(buffChips(C.player));
  // piles
  const piles = $id('piles-info');
  piles.innerHTML = '';
  const dp = el('button', 'pile-btn', `Draw ${C.player.drawPile.length}`);
  dp.addEventListener('click', () => showPileModal(C.player.drawPile, 'Draw pile'));
  const dsc = el('button', 'pile-btn', `Discard ${C.player.discard.length}`);
  dsc.addEventListener('click', () => showPileModal(C.player.discard, 'Discard pile'));
  piles.append(dp, dsc);
  if (C.player.exhaust.length) {
    const ex = el('button', 'pile-btn', `Exhaust ${C.player.exhaust.length}`);
    ex.addEventListener('click', () => showPileModal(C.player.exhaust, 'Exhaust pile'));
    piles.append(ex);
  }
  // hand
  const hand = $id('hand');
  hand.innerHTML = '';
  const cards = C.player.hand;
  const spread = Math.min(96, (window.innerWidth - 140) / Math.max(1, cards.length - 1));
  cards.forEach((inst, i) => {
    const card = liveCard(inst);
    const playable = canPlay(C, inst).ok;
    const n = cardNode(card, {
      selected: G.selectedUid === inst.uid,
      disabled: !playable,
      onClick: () => onCardClick(inst, card),
    });
    // drag-to-play: press a card, release over a target to play it
    if (playable && card.target === 'enemy') {
      n.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return; // mouse uses click flow
        G.selectedUid = inst.uid;
        n.classList.add('selected');
        n.setPointerCapture?.(e.pointerId);
      });
      n.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse' || G.selectedUid !== inst.uid) return;
        const elUnder = document.elementFromPoint(e.clientX, e.clientY);
        const enemyEl = elUnder?.closest?.('.enemy');
        if (enemyEl) {
          const idx = [...document.querySelectorAll('.enemy')].indexOf(enemyEl);
          playSelectedAt(idx);
        }
      });
    }
    n.style.setProperty('--i', i);
    n.style.setProperty('--x', `${(i - (cards.length - 1) / 2) * spread}px`);
    n.style.setProperty('--rot', `${(i - (cards.length - 1) / 2) * 3.2}deg`);
    hand.append(n);
  });
  // combat potions
  let cp = $id('combat-potions');
  if (!cp) { cp = el('div', 'potions-bar', ''); cp.id = 'combat-potions'; $id('combat-controls').prepend(cp); }
  renderPotionsBar(cp);
  $id('btn-endturn').disabled = !!C.over;
}

function buffChips(ent) {
  const wrap = el('div', 'buff-row');
  for (const [b, n] of Object.entries(ent.buffs || {})) {
    const info = BUFF_INFO[b];
    if (!info) continue;
    const chip = el('span', 'buff-chip', `${info.icon}${n}`);
    chip.style.color = info.color;
    chip.setAttribute('data-tip', `<b>${info.name} ${n}</b><br>${info.desc.replace('{n}', n)}`);
    wrap.append(chip);
  }
  return wrap;
}

function intentBadge(it) {
  switch (it.intent) {
    case 'attack': return `⚔ ${it.dmg}`;
    case 'block': return `🛡 ${it.block}`;
    case 'buff': return '⬆';
    case 'debuff': return '⬇';
    case 'attack_debuff': return `⚔${it.dmg} ⬇`;
    case 'strength_up': return '⬆';
    case 'ritual': return '🔮';
    default: return '?';
  }
}

function playSelectedAt(idx) {
  const C = G.combat;
  if (!C || G.selectedUid == null) return;
  const logMark = C.log.length;
  const r = playCard(C, G.selectedUid, idx);
  G.selectedUid = null;
  if (r.ok) { sfx.card(); showFloaters(C, logMark); }
  afterAction();
}

function onCardClick(inst, card) {
  const C = G.combat;
  if (!canPlay(C, inst).ok) return;
  if (card.target === 'enemy') {
    G.selectedUid = G.selectedUid === inst.uid ? null : inst.uid;
    renderCombat();
  } else {
    const logMark = C.log.length;
    const r = playCard(C, inst.uid);
    if (r.ok) { sfx.card(); showFloaters(C, logMark); }
    afterAction();
  }
}

// Floating damage/heal numbers over the targets of the last action.
function showFloaters(C, sinceIdx) {
  for (const e of C.log.slice(sinceIdx)) {
    if (e.t === 'damage' && e.from === 'player' && e.lost > 0) floatOver(`[data-idx="${C.enemies.findIndex(x => x.id === e.to)}"]`, `-${e.lost}`, 'float-dmg');
    if (e.t === 'self_damage') floatOver('#player-avatar', `-${e.n}`, 'float-dmg');
    if (e.t === 'heal' && e.n > 0) floatOver('#player-avatar', `+${e.n}`, 'float-heal');
    if (e.t === 'block') floatOver('#player-avatar', `🛡${e.amount}`, 'float-block');
  }
}
function showEnemyFloaters(C, sinceIdx) {
  for (const e of C.log.slice(sinceIdx)) {
    if (e.t === 'enemy_move' && (e.intent === 'attack' || e.intent === 'attack_debuff')) sfx.hit();
    if (e.t === 'enemy_move' && e.intent === 'debuff') sfx.debuff();
    if (e.t === 'enemy_move' && (e.intent === 'buff' || e.intent === 'strength_up' || e.intent === 'ritual')) sfx.buff();
  }
  const pHp = C.player.hp;
  if (C._hpBeforeEnemy != null && pHp < C._hpBeforeEnemy) floatOver('#player-avatar', `-${C._hpBeforeEnemy - pHp}`, 'float-dmg');
}
function floatOver(sel, text, cls) {
  const host = document.querySelector(sel);
  if (!host) return;
  const f = el('div', `floater ${cls}`, text);
  host.append(f);
  setTimeout(() => f.remove(), 950);
}

function onEnemyClick(idx) {
  const C = G.combat;
  if (!G.selectedUid) return;
  const inst = C.player.hand.find(i => i.uid === G.selectedUid);
  if (!inst) return;
  const logMark = C.log.length;
  const r = playCard(C, inst.uid, idx);
  if (r.ok) { sfx.card(); showFloaters(C, logMark); }
  G.selectedUid = null;
  afterAction();
}

function afterAction() {
  const C = G.combat;
  if (C.over === 'win') { winCombat(); return; }
  if (C.over === 'loss') { loseCombat(); return; }
  saveGame();
  renderCombat();
}

$id('btn-endturn')?.addEventListener('click', () => {});
document.addEventListener('keydown', (e) => {
  if (!G.combat || G.combat.over) return;
  if (!$id('screen-combat').classList.contains('hidden') === false) return;
  if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
    G.selectedUid = null;
    endTurn(G.combat);
    G.run.stats.turns++;
    afterAction();
  } else if (/^[1-9]$/.test(e.key)) {
    const inst = G.combat.player.hand[parseInt(e.key) - 1];
    if (!inst) return;
    const chk = canPlay(G.combat, inst);
    if (!chk.ok) return;
    if (chk.card.target === 'enemy') {
      const alive = G.combat.enemies.findIndex(x => x.alive);
      const logMark = G.combat.log.length;
      const r = playCard(G.combat, inst.uid, alive);
      if (r.ok) { sfx.card(); showFloaters(G.combat, logMark); }
      afterAction();
    } else {
      const logMark = G.combat.log.length;
      const r = playCard(G.combat, inst.uid);
      if (r.ok) { sfx.card(); showFloaters(G.combat, logMark); }
      afterAction();
    }
  }
});

document.addEventListener('click', (e) => {
  if (e.target.id === 'btn-endturn' && G.combat && !G.combat.over) {
    G.selectedUid = null;
    sfx.click();
    const logMark = G.combat.log.length;
    G.combat._hpBeforeEnemy = G.combat.player.hp;
    endTurn(G.combat);
    G.run.stats.turns++;
    showEnemyFloaters(G.combat, logMark);
    afterAction();
  }
});

function winCombat() {
  sfx.coin();
  const C = G.combat;
  tallyStats(C);
  const nodeType = G.run.node.type;
  G.reward = combatRewards(G.run, nodeType);
  takeRewardGold(G.run, G.reward);
  G.run.stats.kills += C.enemies.length;
  G.combat = null;
  saveGame();
  showReward();
}

function loseCombat() {
  sfx.death();
  const C = G.combat;
  tallyStats(C);
  G.run.hp = Math.max(0, C.player.hp);
  G.combat = null;
  G.run.finished = 'death';
  G.run.state = 'death';
  clearSave();
  showEnd();
}

function tallyStats(C) {
  for (const e of C.log) {
    if (e.t === 'damage' && e.from === 'player') G.run.stats.dmgDealt += e.amount || 0;
    if (e.t === 'play_card') G.run.stats.cardsPlayed++;
  }
}

// ---------- rewards ----------
function showReward() {
  updateTopbar();
  show('screen-reward');
  const body = $id('reward-body');
  body.innerHTML = '';
  const rw = G.reward;
  body.append(el('div', 'reward-gold', `+ ◉ ${rw.gold} gold`));
  if (rw.relic) {
    const relic = DATA.relicById.get(rw.relic);
    const rn = el('div', 'reward-relic', `◆ ${relic.name}`);
    rn.setAttribute('data-tip', esc(relic.text));
    body.append(rn);
    addRelic(G.run, rw.relic);
  }
  if (rw.cards.length) {
    body.append(el('h3', 'reward-h', 'Add a card to your deck'));
    const row = el('div', 'card-row');
    rw.cards.forEach(pick => {
      const def = DATA.cardById.get(pick.id);
      const card = { ...def, base: def.base || {}, _upgraded: pick.upgraded };
      let chosen = false;
      const n = cardNode(card, { onClick: () => {
        if (chosen) return;
        chosen = true;
        row.querySelectorAll('.card').forEach(c => c.classList.add('disabled'));
        n.classList.add('picked');
        G.run.deck.push(makeInstance(pick.id, pick.upgraded));
        sfx.coin();
        toast(`Added ${card.name}${pick.upgraded ? ' +' : ''}`);
      } });
      row.append(n);
    });
    body.append(row);
  }
  if (rw.potion && G.run.potions.length < 3) {
    const p = DATA.potionById.get(rw.potion);
    const btn = el('button', 'big-btn ghost', `Take potion: ${p.name}`);
    btn.setAttribute('data-tip', esc(p.text));
    btn.addEventListener('click', () => { addPotion(G.run, rw.potion); btn.disabled = true; btn.textContent = 'Taken'; });
    body.append(btn);
  }
  const cont = el('button', 'big-btn', 'Continue →');
  cont.addEventListener('click', () => finishNode());
  body.append(cont);
}

// ---------- rest ----------
function showRest() {
  show('screen-rest');
  const body = $id('rest-body');
  body.innerHTML = '';
  const healAmt = Math.floor(G.run.maxHp * 0.3);
  const h1 = el('div', 'option-card');
  h1.append(el('h3', null, `Rest — heal ${healAmt} HP`));
  h1.append(el('p', null, `❤ ${G.run.hp}/${G.run.maxHp}`));
  const b1 = el('button', 'big-btn', 'Sleep');
  b1.addEventListener('click', () => { sfx.heal(); const got = restHeal(G.run); toast(`+${got} HP`); finishNode(); });
  h1.append(b1);
  const h2 = el('div', 'option-card');
  h2.append(el('h3', null, 'Smith — upgrade a card'));
  const b2 = el('button', 'big-btn', 'Forge');
  b2.addEventListener('click', () => pickCardModal('Choose a card to upgrade', (uid) => {
    restUpgrade(G.run, uid);
    closeModal();
    toast('Card upgraded');
    finishNode();
  }, (def, inst) => def.upgradeable !== false && !inst.upgraded));
  h2.append(b2);
  body.append(h1, h2);
}

// ---------- shop ----------
function showShop() {
  show('screen-shop');
  updateTopbar();
  const body = $id('shop-body');
  body.innerHTML = '';
  const shop = G.run.shop;
  const row = el('div', 'card-row shop-row');
  shop.cards.forEach(item => {
    const def = DATA.cardById.get(item.id);
    const card = { ...def, base: def.base || {}, _upgraded: false };
    row.append(cardNode(card, {
      price: item.price,
      disabled: item.sold || G.run.gold < item.price,
      onClick: () => { if (buyShopItem(G.run, item)) { toast('Bought'); showShop(); } },
    }));
  });
  body.append(row);
  const misc = el('div', 'shop-misc');
  shop.potions.forEach(item => {
    const p = DATA.potionById.get(item.id);
    const b = el('button', 'shop-item', `⚗ ${p.name} — ◉${item.price}`);
    b.setAttribute('data-tip', esc(p.text));
    b.disabled = item.sold || G.run.gold < item.price;
    b.addEventListener('click', () => { if (buyShopItem(G.run, item)) showShop(); });
    misc.append(b);
  });
  if (shop.relic) {
    const r = DATA.relicById.get(shop.relic.id);
    const b = el('button', 'shop-item', `◆ ${r.name} — ◉${shop.relic.price}`);
    b.setAttribute('data-tip', esc(r.text));
    b.disabled = shop.relic.sold || G.run.gold < shop.relic.price;
    b.addEventListener('click', () => { if (buyShopItem(G.run, shop.relic)) showShop(); });
    misc.append(b);
  }
  const rm = el('button', 'shop-item', `✂ Remove a card — ◉${shop.removeCost}`);
  rm.disabled = shop.removed || G.run.gold < shop.removeCost;
  rm.addEventListener('click', () => pickCardModal('Remove which card?', (uid) => {
    if (shopRemoveCard(G.run, uid)) { closeModal(); toast('Card removed'); showShop(); }
  }));
  misc.append(rm);
  body.append(misc);
  const leave = el('button', 'big-btn', 'Leave →');
  leave.addEventListener('click', () => finishNode());
  body.append(leave);
}

// ---------- event ----------
function showEvent() {
  show('screen-event');
  const ev = G.run.event;
  $id('event-title').textContent = ev.name;
  const body = $id('event-body');
  body.innerHTML = '';
  body.append(el('p', 'event-text', ev.text));
  for (const opt of ev.options) {
    const b = el('button', 'event-option', opt.label);
    b.addEventListener('click', () => {
      const results = applyRunEffects(G.run, opt.effects);
      G.run.event = null;
      updateTopbar();
      const needsRemove = results.some(r => r.needsRemove);
      if (needsRemove) {
        pickCardModal('Remove which card?', (uid) => {
          const idx = G.run.deck.findIndex(i => i.uid === uid);
          if (idx >= 0) G.run.deck.splice(idx, 1);
          closeModal();
          finishNode();
        });
      } else finishNode();
    });
    body.append(b);
  }
}

// ---------- pickers / modals ----------
function pickCardModal(title, onPick, filter) {
  const wrap = el('div', 'picker');
  wrap.append(el('h3', null, title));
  const row = el('div', 'card-row scrollable');
  for (const inst of G.run.deck) {
    const def = DATA.cardById.get(inst.id);
    if (filter && !filter(def, inst)) continue;
    const card = { ...def, base: def.base || {}, _upgraded: inst.upgraded };
    row.append(cardNode(card, { small: true, onClick: () => onPick(inst.uid) }));
  }
  wrap.append(row);
  modal(wrap);
}

function showPileModal(instances, title) {
  const wrap = el('div', 'picker');
  wrap.append(el('h3', null, title));
  const row = el('div', 'card-row scrollable');
  for (const inst of instances) {
    const def = DATA.cardById.get(inst.id);
    const card = { ...def, base: def.base || {}, _upgraded: inst.upgraded };
    row.append(cardNode(card, { small: true }));
  }
  wrap.append(row);
  modal(wrap);
}

function showMenu() {
  const wrap = el('div', 'menu-modal');
  wrap.append(el('h3', null, 'Menu'));
  const deckBtn = el('button', 'big-btn ghost', 'View deck');
  deckBtn.addEventListener('click', () => {
    const inner = el('div', 'picker');
    inner.append(el('h3', null, `Deck (${G.run.deck.length} cards)`));
    const row = el('div', 'card-row scrollable');
    for (const inst of G.run.deck) {
      const def = DATA.cardById.get(inst.id);
      row.append(cardNode({ ...def, base: def.base || {}, _upgraded: inst.upgraded }, { small: true }));
    }
    inner.append(row);
    modal(inner);
  });
  const howBtn = el('button', 'big-btn ghost', 'How to play');
  howBtn.addEventListener('click', showHowTo);
  const quitBtn = el('button', 'big-btn ghost', 'Save & Quit to title');
  quitBtn.addEventListener('click', () => {
    if (G.run && !G.combat) saveGame();
    else if (G.run && G.combat) { G.run.hp = Math.max(1, G.combat.player.hp); G.combat = null; saveGame(); }
    location.reload();
  });
  wrap.append(deckBtn, howBtn, quitBtn);
  const close = el('button', 'big-btn', 'Close');
  close.addEventListener('click', closeModal);
  wrap.append(close);
  modal(wrap);
}

function showHowTo() {
  const wrap = el('div', 'howto');
  wrap.innerHTML = `
    <h3>How to play</h3>
    <p>Travel node to node through three acts. Fight, rest, trade, and grow your deck.</p>
    <ul>
      <li><b>Energy</b> (blue orb) refills each turn. Cards cost energy.</li>
      <li><b>Block</b> (🛡) absorbs damage and resets at the start of your turn.</li>
      <li>Click an attack card, then click an enemy. Skill/Power cards play on click.</li>
      <li><b>Intents</b> above enemies show their next move: ⚔ attack, 🛡 block, ⬇ debuff, ⬆ buff.</li>
      <li>Hover any icon for details. Elites and bosses drop relics — passive game-changers.</li>
      <li>Die and the run ends. Every run uses a seed — share seeds with friends for the same map.</li>
    </ul>`;
  const close = el('button', 'big-btn', 'Got it');
  close.addEventListener('click', closeModal);
  wrap.append(close);
  modal(wrap);
}

// ---------- end ----------
function showEnd() {
  show('screen-end');
  updateTopbar();
  const win = G.run.finished === 'victory';
  if (win) sfx.victory();
  try {
    const best = JSON.parse(localStorage.getItem(SAVE_KEY + '.best') || 'null');
    const cur = { act: G.run.act, win, seed: G.run.seed, when: new Date().toISOString().slice(0, 10) };
    if (!best || (win && !best.win) || (!win && !best.win && cur.act > best.act)) {
      localStorage.setItem(SAVE_KEY + '.best', JSON.stringify(cur));
    }
  } catch {}
  if (win) clearSave();
  const body = $id('end-body');
  body.innerHTML = '';
  body.append(el('h2', win ? 'end-win' : 'end-death', win ? 'THE SPIRE IS YOURS' : 'YOU FELL'));
  body.append(el('p', 'end-sub', win
    ? 'The last lord of the Emberdeck falls. Dawn finds you at the top.'
    : 'The dark keeps your cards. The mountain forgets nothing.'));
  const s = G.run.stats;
  const stats = el('div', 'end-stats');
  stats.innerHTML = `
    <div><span>Act reached</span><b>${G.run.act}</b></div>
    <div><span>Kills</span><b>${s.kills}</b></div>
    <div><span>Turns fought</span><b>${s.turns}</b></div>
    <div><span>Cards played</span><b>${s.cardsPlayed}</b></div>
    <div><span>Damage dealt</span><b>${s.dmgDealt}</b></div>
    <div><span>Deck size</span><b>${G.run.deck.length}</b></div>
    <div><span>Seed</span><b>${esc(G.run.seed)}</b></div>`;
  body.append(stats);
  const again = el('button', 'big-btn', 'Play again');
  again.addEventListener('click', () => location.reload());
  body.append(again);
}
