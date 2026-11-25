// Tracks the shift clock, wave schedule, and service score.

export function serviceWave(elapsed) {
  return serviceWaves.findLast(wave => elapsed >= wave.start);
}

export function recordService(state, ticket, vipBonus, sharedPrepMultiplier = 1) {
  const freshness = Math.max(0, ticket.left / ticket.patience);
  state.combo++;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served++;
  state.servedByWave[serviceWaves.indexOf(serviceWave(state.elapsed))]++;
  const tip = Math.floor((4 + 16 * freshness + vipBonus) * comboMultiplier(state.combo)) * sharedPrepMultiplier;
  const coins = 26 + ticket.recipe.layers.length * 6 + tip;
  state.tips += tip;
  state.coins += coins;
  return coins;
}

export function comboMultiplier(streak) {
  return Math.min(3, 1 + Math.max(0, streak - 1) * .5);
}

export function shiftStars(state) {
  return [1, 3, 5, 7, 9].filter(goal => state.served >= goal).length;
}

export function readShiftClock(elapsed) {
  const seconds = Math.max(0, Math.ceil(shiftLength - elapsed));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export const shiftLength = 180;

export const serviceWaves = [
  { name: 'Opening', start: 0, interval: 21, patience: 74, layers: [2, 3], color: '#bde495' },
  { name: 'Dinner Rush', start: 55, interval: 14, patience: 62, layers: [2, 4], color: '#ffd081' },
  { name: 'Last Call', start: 123, interval: 9, patience: 49, layers: [3, 4], color: '#ffa088' },
];
