// Synthesizes the kitchen sound cues.

export function createKitchenAudio() {
  let context;
  let muted = false;
  const sounds = {
    chop: [[185, 62, .055, 'triangle']],
    tick: [[520, 700, .07, 'sine']],
    ticket: [[540, 475, .12, 'triangle']],
    sizzle: [[140, 430, .24, 'sawtooth']],
    warning: [[342, 290, .15, 'triangle']],
    burn: [[230, 86, .32, 'triangle']],
    ding: [[880, 930, .22, 'sine'], [1320, 1310, .25, 'sine', .065]],
    serve: [[660, 660, .16, 'sine'], [880, 880, .20, 'sine', .075], [1320, 1320, .28, 'sine', .15]],
  };
  return {
    unlock() {
      try {
        context ??= new AudioContext();
        if (context.state === 'suspended') context.resume().catch(() => {});
      } catch {
        return;
      }
    },
    toggle() {
      muted = !muted;
      return muted;
    },
    play(event) {
      if (!context || muted || context.state !== 'running') return;
      for (const [from, to, length, shape, delay = 0] of sounds[event] ?? []) {
        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const volume = context.createGain();
        oscillator.type = shape;
        oscillator.frequency.setValueAtTime(from, start);
        oscillator.frequency.exponentialRampToValueAtTime(to, start + length);
        volume.gain.setValueAtTime(.0001, start);
        volume.gain.exponentialRampToValueAtTime(event === 'sizzle' ? .022 : .09, start + .009);
        volume.gain.exponentialRampToValueAtTime(.0001, start + length);
        oscillator.connect(volume).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + length);
      }
    },
  };
}
