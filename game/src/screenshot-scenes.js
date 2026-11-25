// Stages fixed game states for the four deterministic presentation screenshots.
import { spawnOrder } from './order-board.js';
import { chopIngredient } from './chopping.js';
import { moveParticles } from './particles.js';
import { recipes } from './recipes.js';
import { shiftLength } from './shift-timer.js';
import { burners, worktops } from './kitchen-layout.js';
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
    const left = (rush ? [5, 36, 12, 49, 18, 9] : [42, 49, scene === 'cover' ? 13 : 21, 57])[index];
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
  Object.assign(state.cook, { facing: 1, moving: true, hand: { id: 'greens', stage: 'ready' } });
  state.board.food = { id: 'greens', stage: 'raw' };
  state.board.cuts = 3;
  state.pots[1].age = 11.5;
  state.coverMotion = .32;
  moveCoverCook(state);
  state.elapsed -= .13;
  chopIngredient(state);
  moveParticles(state, .13);
  state.elapsed += .13;
}

export function moveCoverCook(state) {
  const progress = ((state.coverMotion + 1.18) % 3) / 3;
  const mix = (from, to) => from + (to - from) * progress;
  const [x, y] = coverStart.map((value, axis) => mix(mix(value, coverControl[axis]), mix(coverControl[axis], coverEnd[axis])));
  state.cook.x = x;
  state.cook.y = y - 20;
}

const [chop] = worktops;
const coverStart = routePoint(chop);
const coverEnd = routePoint(burners[1]);
const coverControl = routeSegment(coverStart, coverEnd);
