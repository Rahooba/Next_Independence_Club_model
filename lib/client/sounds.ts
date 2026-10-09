// Lightweight sound effects generated with the Web Audio API (no mp3 files needed).
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.18) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export type SoundName = 'step' | 'celebrate' | 'green' | 'yellow' | 'red' | 'notify' | 'coupon';

// Call from a user gesture (click/tap) so browsers allow later sounds (e.g. teacher notifications)
export function unlockAudio(): boolean {
  const c = getCtx();
  return !!c && c.state === 'running';
}

export function playSound(name: SoundName) {
  switch (name) {
    case 'step': // نغمة نجاح قصيرة
      tone(660, 0, 0.14, 'sine');
      tone(880, 0.12, 0.22, 'sine');
      break;
    case 'celebrate': // احتفال بعد إنهاء كل الخطوات
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.28, 'triangle'));
      tone(1319, 0.55, 0.5, 'triangle');
      break;
    case 'green': // أخضر: نغمة صاعدة هادية
      tone(523, 0, 0.15, 'sine');
      tone(784, 0.13, 0.28, 'sine');
      break;
    case 'yellow': // أصفر: نغمتين تنبيه
      tone(587, 0, 0.16, 'square', 0.1);
      tone(587, 0.22, 0.2, 'square', 0.1);
      break;
    case 'red': // أحمر: نغمة منخفضة أعلى صوتاً (تنبيه)
      tone(300, 0, 0.22, 'sawtooth', 0.14);
      tone(220, 0.2, 0.22, 'sawtooth', 0.14);
      tone(300, 0.4, 0.3, 'sawtooth', 0.14);
      break;
    case 'coupon': // استخدام كوبون: صوت عملة مميز
      tone(988, 0, 0.1, 'square', 0.1);
      tone(1319, 0.09, 0.1, 'square', 0.1);
      tone(1568, 0.18, 0.3, 'square', 0.1);
      break;
    case 'notify': // إشعار للمعلم
      tone(784, 0, 0.12, 'sine');
      tone(1047, 0.1, 0.2, 'sine');
      break;
  }
}
