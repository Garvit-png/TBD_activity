/**
 * TBD Sound Engine — Web Audio API
 * All sounds synthesized procedurally, no audio files needed.
 */

let ctx = null;

export function initAudio() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function getCtx() {
  if (!ctx) return null;
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* ── helpers ── */
function makeGain(vol = 0.5) {
  const g = getCtx().createGain();
  g.gain.value = vol;
  g.connect(getCtx().destination);
  return g;
}

function osc(type, freq, startTime, duration, vol = 0.4, dest) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, startTime);
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  o.connect(g);
  g.connect(dest || c.destination);
  o.start(startTime);
  o.stop(startTime + duration + 0.01);
}

/* ── SOUNDS ── */

/** Single keystroke click — short low beep */
export function playKeyClick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('square', 440 + Math.random() * 80, now, 0.04, 0.08);
}

/** Boot beep — single clean tone on startup */
export function playBootBeep() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('sine', 880, now, 0.12, 0.3);
  osc('sine', 1320, now + 0.13, 0.1, 0.2);
}

/** OK line sound — short high tick */
export function playOkTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('square', 600, now, 0.03, 0.06);
}

/** WARN sound — descending two-tone */
export function playWarn() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('sawtooth', 500, now, 0.08, 0.15);
  osc('sawtooth', 350, now + 0.07, 0.1, 0.12);
}

/** Section header — slightly louder click */
export function playSectionBeep() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('square', 520, now, 0.06, 0.12);
  osc('square', 780, now + 0.04, 0.04, 0.08);
}

/** Error popup — short buzzy static burst */
export function playErrorBuzz() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // White-noise burst via buffer
  const bufSize = c.sampleRate * 0.06;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(0.35, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  // Band-pass filter to make it sound more electronic
  const bpf = c.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 1200 + Math.random() * 800;
  bpf.Q.value = 0.8;
  src.connect(bpf);
  bpf.connect(g);
  g.connect(c.destination);
  src.start(now);
  src.stop(now + 0.07);
}

/** Error flood escalation — rapid buzz sequence */
export function playErrorEscalate() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  for (let i = 0; i < 3; i++) {
    osc('sawtooth', 200 + i * 80, now + i * 0.04, 0.04, 0.18);
  }
}

/** HEHE — dramatic low boom + glitch */
export function playHeheSound() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // Low boom
  osc('sine', 80, now, 0.5, 0.5);
  osc('sine', 120, now, 0.4, 0.4);
  // Glitch bursts
  for (let i = 0; i < 6; i++) {
    const t = now + 0.1 + i * 0.07;
    osc('square', 300 + Math.random() * 400, t, 0.04, 0.2);
  }
}

/** No-jokes chime — gentle descending */
export function playNoJokes() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [880, 660, 440].forEach((f, i) => {
    osc('sine', f, now + i * 0.15, 0.2, 0.15);
  });
}

/** Welcome reveal — rising arpeggio */
export function playWelcomeReveal() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [261, 329, 392, 523, 659].forEach((f, i) => {
    osc('sine', f, now + i * 0.07, 0.25, 0.2);
  });
}

/** Final TBD reveal — cinematic swell */
export function playTBDReveal() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  // Deep low bass hit
  osc('sine', 55, now, 0.8, 0.6);
  osc('sine', 110, now, 0.6, 0.4);

  // Rising harmonics
  [220, 330, 440, 550, 660].forEach((f, i) => {
    osc('sine', f, now + 0.1 + i * 0.1, 0.5, 0.25);
  });

  // High shimmer
  osc('sine', 1320, now + 0.6, 0.4, 0.15);
  osc('sine', 1760, now + 0.7, 0.3, 0.12);
}

/** Screen transition flash — quick thud */
export function playFlash() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('sawtooth', 150, now, 0.15, 0.4);
  osc('sine', 80, now, 0.2, 0.5);
}

/** Progress complete — upward beep */
export function playProgressDone() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('sine', 660, now, 0.1, 0.3);
  osc('sine', 880, now + 0.08, 0.15, 0.3);
  osc('sine', 1320, now + 0.18, 0.2, 0.25);
}

/** Passcode digit typed */
export function playDigit() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('square', 800 + Math.random() * 200, now, 0.05, 0.12);
}

/** Passcode wrong — low descending buzz */
export function playWrongCode() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('sawtooth', 300, now,        0.12, 0.3);
  osc('sawtooth', 200, now + 0.1,  0.15, 0.3);
  osc('sawtooth', 120, now + 0.22, 0.18, 0.25);
}

/** Passcode correct — triumphant chime */
export function playCorrectCode() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    osc('sine', f, now + i * 0.09, 0.3, 0.25);
  });
}

/** Button runs away — whoosh */
export function playRunaway() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(600, now);
  o.frequency.exponentialRampToValueAtTime(80, now + 0.25);
  g.gain.setValueAtTime(0.3, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  o.connect(g); g.connect(c.destination);
  o.start(now); o.stop(now + 0.26);
}

/** Real START clicked — power-on sound */
export function playPowerOn() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('sine', 220, now,       0.15, 0.4);
  osc('sine', 440, now + 0.1, 0.2,  0.4);
  osc('sine', 880, now + 0.2, 0.25, 0.35);
  osc('sine', 1760,now + 0.3, 0.3,  0.3);
}

/** Level card hover ping */
export function playPing() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  osc('sine', 1200, now, 0.08, 0.1);
}

/** Level unlock — access granted */
export function playAccessGranted() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [440, 554, 659, 880, 1108].forEach((f, i) => {
    osc('sine', f, now + i * 0.07, 0.25, 0.2);
  });
}
