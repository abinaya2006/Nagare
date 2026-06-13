// ─── Web Audio API piano note synthesizer ────────────────────────────────────

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _ctx;
}

/**
 * Plays a soft piano-like note using a triangle oscillator + envelope.
 * frequency: Hz of the note (e.g. 440 = A4)
 * volume:    0.0 – 1.0 (default 0.18 — subtle)
 */
export function playNote(frequency: number, volume = 0.18, duration = 0.8): void {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const osc    = ctx.createOscillator();
    const gain   = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type      = 'triangle';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Soft low-pass makes it feel piano-like
    filter.type            = 'lowpass';
    filter.frequency.value = 2200;
    filter.Q.value         = 0.8;

    // Gentle attack → sustain → release envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume,      ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(volume * 0.6, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001,  ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Web Audio unavailable (SSR, restricted context) — fail silently
  }
}

/**
 * Plays a two-note ambient chime (for page transitions).
 */
export function playChime(baseFreq = 440): void {
  playNote(baseFreq, 0.12, 1.0);
  setTimeout(() => playNote(baseFreq * 1.5, 0.08, 1.2), 180);
}

/**
 * Plays a short completion arpeggio.
 */
export function playCompletion(): void {
  const notes = [261, 329, 392, 523]; // C4 E4 G4 C5
  notes.forEach((freq, i) => {
    setTimeout(() => playNote(freq, 0.14, 1.0), i * 160);
  });
}
