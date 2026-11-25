export const shiftLength = 180;

export function readShiftClock(elapsed) {
  const seconds = Math.max(0, Math.ceil(shiftLength - elapsed));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function rushDifficulty(elapsed) {
  const pressure = Math.min(1, elapsed / (shiftLength - 12));
  return {
    pressure,
    interval: 23 - pressure * 15,
    patience: 86 - pressure * 45,
    tier: pressure < .33 ? 'WARM-UP' : pressure < .68 ? 'DINNER WAVE' : 'FULL RUSH',
  };
}
