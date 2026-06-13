let audioContext = null;
let enabled = true;
let volume = 0.65;

function context() {
  if (!enabled || typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!audioContext) audioContext = new AudioContextCtor();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function tone({ frequency = 420, duration = 0.08, gain = 0.045, type = "sine", slide = 0, delay = 0 }) {
  const ctx = context();
  if (!ctx) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), start + duration);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1050, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain * volume, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function initAudio() {
  context();
}

export function setSoundEnabled(value) {
  enabled = Boolean(value);
}

export function playMove() {
  tone({ frequency: 220, duration: 0.045, gain: 0.020, type: "triangle", slide: -22 });
  tone({ frequency: 132, duration: 0.055, gain: 0.014, type: "sine", delay: 0.016 });
}

export function playCapture() {
  tone({ frequency: 185, duration: 0.065, gain: 0.026, type: "triangle", slide: -55 });
  tone({ frequency: 340, duration: 0.035, gain: 0.014, type: "sine", delay: 0.022 });
}

export function playCheck() {
  tone({ frequency: 420, duration: 0.06, gain: 0.022, type: "sine" });
  tone({ frequency: 620, duration: 0.045, gain: 0.014, type: "triangle", delay: 0.045 });
}

export function playGameOver() {
  tone({ frequency: 300, duration: 0.12, gain: 0.038, type: "triangle" });
  tone({ frequency: 225, duration: 0.16, gain: 0.032, type: "sine", delay: 0.10 });
}

export function playIllegal() {
  tone({ frequency: 118, duration: 0.045, gain: 0.012, type: "triangle", slide: -18 });
}

export function playStart() {
  tone({ frequency: 240, duration: 0.07, gain: 0.032, type: "triangle" });
  tone({ frequency: 420, duration: 0.09, gain: 0.03, type: "sine", delay: 0.055 });
}

export function playToggle() {
  tone({ frequency: 520, duration: 0.035, gain: 0.018, type: "sine" });
}
