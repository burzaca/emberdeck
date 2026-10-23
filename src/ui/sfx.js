// Tiny procedural sound engine — no assets, WebAudio only.
let ctx = null;
let muted = false;
try { muted = localStorage.getItem('emberdeck.muted') === '1'; } catch {}
export function setMuted(m) { muted = m; try { localStorage.setItem('emberdeck.muted', m ? '1' : '0'); } catch {} }
export function isMuted() { return muted; }
function ac() {
  if (muted) return null;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ f = 440, f2 = null, t = 0.15, type = 'sine', vol = 0.2, delay = 0, curve = 'exp' }) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  const start = a.currentTime + delay;
  o.frequency.setValueAtTime(f, start);
  if (f2 != null) {
    if (curve === 'exp') o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), start + t);
    else o.frequency.linearRampToValueAtTime(Math.max(1, f2), start + t);
  }
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + t);
  o.connect(g).connect(a.destination);
  o.start(start); o.stop(start + t + 0.02);
}

function noise({ t = 0.12, vol = 0.15, delay = 0, hp = 800 }) {
  const a = ac();
  if (!a) return;
  const buf = a.createBuffer(1, a.sampleRate * t, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = hp;
  const g = a.createGain();
  g.gain.setValueAtTime(vol, a.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + delay + t);
  src.connect(f).connect(g).connect(a.destination);
  src.start(a.currentTime + delay);
}

export const sfx = {
  click: () => tone({ f: 660, t: 0.05, vol: 0.08, type: 'triangle' }),
  card: () => { tone({ f: 300, f2: 500, t: 0.08, vol: 0.1, type: 'triangle' }); noise({ t: 0.06, vol: 0.05, hp: 2000 }); },
  hit: () => { tone({ f: 180, f2: 60, t: 0.12, vol: 0.22, type: 'sawtooth' }); noise({ t: 0.08, vol: 0.12, hp: 400 }); },
  block: () => tone({ f: 520, f2: 380, t: 0.1, vol: 0.12, type: 'square' }),
  heal: () => { tone({ f: 440, t: 0.12, vol: 0.1 }); tone({ f: 660, t: 0.15, vol: 0.1, delay: 0.08 }); },
  buff: () => { tone({ f: 392, t: 0.1, vol: 0.08 }); tone({ f: 587, t: 0.12, vol: 0.08, delay: 0.07 }); },
  debuff: () => { tone({ f: 400, f2: 250, t: 0.18, vol: 0.1, type: 'sawtooth' }); },
  die: () => { tone({ f: 220, f2: 55, t: 0.5, vol: 0.25, type: 'sawtooth' }); noise({ t: 0.3, vol: 0.15, hp: 200 }); },
  coin: () => { tone({ f: 988, t: 0.06, vol: 0.1 }); tone({ f: 1319, t: 0.1, vol: 0.1, delay: 0.05 }); },
  error: () => tone({ f: 160, t: 0.15, vol: 0.12, type: 'square' }),
  victory: () => {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f, i) => tone({ f, t: 0.25, vol: 0.12, delay: i * 0.13, type: 'triangle' }));
  },
  death: () => {
    const notes = [392, 330, 262, 196];
    notes.forEach((f, i) => tone({ f, t: 0.4, vol: 0.15, delay: i * 0.25, type: 'sawtooth' }));
  },
};
