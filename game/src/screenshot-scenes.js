// Stages fixed game states for the four deterministic presentation screenshots.
import { spawnOrder } from './order-board.js';
import { chopIngredient } from './chopping.js';
import { moveParticles } from './particles.js';
import { recipes } from './recipes.js';
import { shiftLength } from './shift-timer.js';
import { worktops } from './kitchen-layout.js';
import { routePoint, routeSegment } from './draw-route.js';

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

  if (scene === 'cover') stageCover(state);

  if (scene === 'rush') {
    state.elapsed = 153;
    state.coins = 466;
    state.served = 7;
    state.combo = 5;
    state.pots[0].age = 13;
    state.pots[0].food.id = 'shrimp';
    state.pots[1] = { food: { id: 'noodles', stage: 'raw' }, age: 3.3 };
    state.showRoute = false;
  }

  const rush = scene === 'rush';
  const rail = rush ? [ember, tide, harvest, moon, gold, garden] : [garden, tide, gold, moon];
  rail.forEach((recipe, index) => {
    const left = (rush ? [5, 36, 12, 49, 18, 9] : [42, 49, 21, 57])[index];
    spawnOrder(state, { recipe, left, patience: 64, vipLeft: index === 2 ? (rush ? 11 : 17) : undefined });
  });
  if (scene === 'recipes') state.screen = 'recipes';
  if (scene === 'results') {
    state.screen = 'results';
    state.elapsed = shiftLength;
    state.served = 9;
    state.servedByWave = [2, 4, 3];
    state.coins = 698;
    state.tips = 302;
    state.bestCombo = 6;
    state.missed = 2;
  }
}

function stageCover(state) {
  const chop = worktops.find(station => station.id === 'chop');
  const plate = worktops.find(station => station.id === 'plate');
  const from = routePoint(chop);
  const to = routePoint(plate);
  const [x, y] = routeSegment(from, to).map((control, axis) => (from[axis] + 2 * control + to[axis]) / 4);
  Object.assign(state.cook, { x, y: y - 20, facing: 1, hand: { id: 'greens', stage: 'ready' } });
  state.board.food = { id: 'tofu', stage: 'raw' };
  state.board.cuts = 1;
  state.elapsed -= .13;
  chopIngredient(state);
  moveParticles(state, .13);
  state.elapsed += .13;
}
