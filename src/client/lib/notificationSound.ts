// Son de notif court généré à la volée — deux notes douces, pas de fichier asset.
// Web Audio API : nécessite un geste utilisateur préalable pour démarrer l'AudioContext
// (les navigateurs modernes le bloquent autrement).

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Joue une note brève (sinus) avec enveloppe ADSR douce. */
function playTone(c: AudioContext, freq: number, startAt: number, duration: number, gain = 0.18) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startAt);

  g.gain.setValueAtTime(0, startAt);
  g.gain.linearRampToValueAtTime(gain, startAt + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(g).connect(c.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/** Carillon doux à deux notes — pour signaler un nouveau scan. */
export function playScanChime() {
  const c = ensureCtx();
  if (!c) return;
  const t = c.currentTime;
  playTone(c, 880, t, 0.18); // A5
  playTone(c, 1318.5, t + 0.12, 0.22); // E6
}

/** À appeler une fois sur un geste utilisateur (clic) pour débloquer le son sur Safari/iOS. */
export function unlockAudio() {
  ensureCtx();
}
