// Stages fixed game states for the four deterministic presentation screenshots.
import { spawnOrder } from './order-board.js';
import { recipes } from './recipes.js';
import { shiftLength } from './shift-timer.js';

export function stageScreenshot(state, scene) {
  if (!['cover', 'rush', 'recipes', 'results'].includes(scene)) return;
  const [garden, tide, gold, moon, harvest, ember] = recipes;
  state.staged = true;
  state.shot = scene;
  state.screen = 'play';
  state.elapsed = 94;
  state.orders = [];
  state.nextTicket = 7;
  state.coins = 238;
  state.served = 4;
  state.combo = 3;
  state.layers = ['broth', 'noodles'];
  state.ready = tide;
  state.pots = [
    { food: { id: 'egg', stage: 'raw' }, age: 2.8 },
    { food: { id: 'shrimp', stage: 'raw' }, age: 9.7 },
  ];
  state.cook.x = 436;
  state.cook.y = 432;
  state.cook.facing = -1;
  state.cook.hand = { id: 'greens', stage: 'raw' };

  if (scene === 'rush') {
    state.elapsed = 113;
    state.coins = 466;
    state.served = 7;
    state.combo = 5;
    state.pots.reverse();
    state.pots[1] = { food: { id: 'noodles', stage: 'raw' }, age: 3.3 };
    state.cook.hand = null;
    state.showRoute = false;
  }

  const rush = scene === 'rush';
  [rush ? ember : garden, tide, rush ? harvest : gold, moon].forEach((recipe, index) => {
    const left = (rush ? [10, 22, 26, 41] : [42, 49, 23, 57])[index];
    spawnOrder(state, { recipe, left, patience: 64, vipLeft: index === 2 ? (rush ? 11 : 17) : undefined });
  });
  if (scene === 'recipes') state.screen = 'recipes';
  if (scene === 'results') {
    state.screen = 'results';
    state.elapsed = shiftLength;
    state.served = 9;
    state.coins = 698;
    state.tips = 302;
    state.bestCombo = 6;
    state.missed = 2;
  }
}
