// Card DOM builder — shared by combat hand, rewards, shop, deck viewer.
import { el } from './dom.js';
import { renderText } from '../engine/effects.js';

const TYPE_ART = {
  attack: 'linear-gradient(160deg, #5a1f1a 0%, #8a3324 45%, #2a0f0c 100%)',
  skill: 'linear-gradient(160deg, #16324a 0%, #24506e 45%, #0a1826 100%)',
  power: 'linear-gradient(160deg, #3a2255 0%, #5c3a82 45%, #1a0f28 100%)',
};
const RARITY_GLOW = {
  basic: 'rgba(140,140,140,.25)', common: 'rgba(120,170,220,.35)',
  uncommon: 'rgba(160,120,220,.45)', rare: 'rgba(230,180,80,.55)',
  boss: 'rgba(230,90,60,.55)', shop: 'rgba(90,200,140,.4)', starter: 'rgba(140,140,140,.25)',
};

export function cardNode(card, opts = {}) {
  // card: live card (with base/_upgraded) OR plain def; opts: {onClick, selected, disabled, price, small}
  const n = el('div', `card type-${card.type} rarity-${card.rarity}${opts.small ? ' small' : ''}${opts.selected ? ' selected' : ''}${opts.disabled ? ' disabled' : ''}`);
  n.style.setProperty('--glow', RARITY_GLOW[card.rarity] || 'rgba(0,0,0,0)');
  const cost = el('div', 'card-cost', String(card.cost));
  const name = el('div', 'card-name', card.name + (card._upgraded ? ' +' : ''));
  const art = el('div', 'card-art');
  art.style.background = TYPE_ART[card.type] || TYPE_ART.skill;
  art.textContent = cardIcon(card);
  const text = el('div', 'card-text');
  text.innerHTML = renderText(card).replace(/\n/g, '<br>');
  n.append(cost, name, art, text);
  const kw = (card.keywords || []).filter(k => k !== 'unplayable');
  const extra = [];
  if (card.exhaust) extra.push('exhaust');
  if (card.innate) extra.push('innate');
  if (card.ethereal) extra.push('ethereal');
  if (card.retain) extra.push('retain');
  const all = [...new Set([...kw, ...extra])];
  if (all.length) n.append(el('div', 'card-kw', all.join(' · ')));
  if (opts.price != null) n.append(el('div', 'card-price', `◉ ${opts.price}`));
  if (opts.onClick) n.addEventListener('click', () => { if (!opts.disabled) opts.onClick(); });
  return n;
}

function cardIcon(card) {
  if (card.type === 'attack') return '⚔';
  if (card.type === 'power') return '✦';
  return (card.effects || []).some(v => v.t === 'block') ? '🛡' : '✧';
}

export function miniCardRow(card, onPick, disabled) {
  const n = cardNode(card, { small: true, onClick: onPick, disabled });
  return n;
}
