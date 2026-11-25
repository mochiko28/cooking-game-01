// Paces ticket arrivals and brings more involved recipes into each service wave.
export const serviceWaves = [
  { name: 'Opening', start: 0, interval: 21, patience: 74, layers: [2, 3], color: '#bde495' },
  { name: 'Dinner Rush', start: 55, interval: 14, patience: 62, layers: [2, 4], color: '#ffd081' },
  { name: 'Last Call', start: 123, interval: 9, patience: 49, layers: [3, 4], color: '#ffa088' },
];

export function serviceWave(elapsed) {
  return serviceWaves.findLast(wave => elapsed >= wave.start);
}
