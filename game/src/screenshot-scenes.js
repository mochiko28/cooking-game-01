import { spawnOrder } from './order-board.js';
import { recipes } from './recipes.js';
import { shiftLength } from './shift-timer.js';
import { burst } from './particles.js';

export function stageScreenshot(state, scene) {
  if (!['cover', 'rush', 'recipes', 'results'].includes(scene)) return;
  const [garden, tide, gold, moon, ember] = recipes;
  state.staged = true;
  state.screen = 'play';
  state.elapsed = 94;
  state.orders = [];
  state.nextTicket = 9;
  state.coins = 238;
  state.served = 4;
  state.combo = 3;
  state.layers = ['broth', 'noodles'];
  state.ready = tide;
  state.pot = { food: { id: 'egg', stage: 'raw' }, age: 2.5 };
  state.cook.x = 640;
  state.cook.y = 495;
  state.cook.hand = { id: 'greens', stage: 'ready' };

  if (scene === 'rush') {
    state.elapsed = 158;
    state.camera = 'prep';
    state.coins = 466;
    state.served = 8;
    state.cook.x = 162;
    state.cook.y = 511;
    state.cook.hand = null;
    state.board = { food: { id: 'greens', stage: 'raw' }, cuts: 3, mark: state.elapsed - .07 };
    state.pot = { food: { id: 'shrimp', stage: 'raw' }, age: 3.4 };
    state.ready = null;
    burst(state, 147, 609, '#e1eb91', 14);
    for (const bit of state.particles) {
      bit.x += bit.dx * .18;
      bit.y += bit.dy * .18;
    }
  }

  const urgent = scene === 'rush';
  [garden, tide, urgent ? ember : gold, moon].forEach((recipe, index) => {
    const remaining = urgent ? [10, 17, 26, 36][index] : [30, 49, 23, 57][index];
    spawnOrder(state, recipe, remaining, 64);
  });
  if (scene === 'recipes') state.screen = 'recipes';
  if (scene === 'results') {
    state.screen = 'results';
    state.elapsed = shiftLength;
    state.served = 9;
    state.coins = 534;
    state.tips = 136;
    state.bestCombo = 6;
    state.missed = 2;
  }
}
