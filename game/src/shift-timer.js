// Formats the three-minute shift countdown for the service HUD.
export const shiftLength = 180;

export function readShiftClock(elapsed) {
  const seconds = Math.max(0, Math.ceil(shiftLength - elapsed));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
