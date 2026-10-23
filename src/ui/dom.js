// Small DOM helpers, tooltip, toast, modal.
export function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

export function $id(id) { return document.getElementById(id); }

export function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')); $id(id).classList.remove('hidden'); }

let toastTimer = null;
export function toast(msg, ms = 2200) {
  const t = $id('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
}

// Lightweight tooltip: single shared element, follows hover targets with data-tip.
let tipEl = null;
export function initTooltips() {
  tipEl = el('div', 'tooltip hidden');
  document.body.appendChild(tipEl);
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tip]');
    if (!target) { tipEl.classList.add('hidden'); return; }
    tipEl.innerHTML = target.getAttribute('data-tip');
    tipEl.classList.remove('hidden');
    positionTip(target);
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-tip]')) tipEl.classList.add('hidden');
  });
}
function positionTip(target) {
  const r = target.getBoundingClientRect();
  const tr = tipEl.getBoundingClientRect();
  let x = r.left + r.width / 2 - tr.width / 2;
  let y = r.top - tr.height - 8;
  if (y < 4) y = r.bottom + 8;
  x = Math.max(4, Math.min(x, window.innerWidth - tr.width - 4));
  tipEl.style.left = x + 'px';
  tipEl.style.top = y + 'px';
}

export function modal(htmlOrNode, onClose) {
  const m = $id('modal');
  const body = $id('modal-body');
  body.innerHTML = '';
  body.append(htmlOrNode);
  m.classList.remove('hidden');
  m._onClose = onClose || null;
}
export function closeModal() {
  const m = $id('modal');
  m.classList.add('hidden');
  if (m._onClose) { const cb = m._onClose; m._onClose = null; cb(); }
}

export function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
