// Defines the kitchen layout and handles ingredient prep, plating, and service.
import { matchingRecipes, scoreServe } from './orders.js';
import { comboMultiplier } from './shift.js';

function assembleRecipeLayers(state) {
  if (state.cook.hand?.stage !== 'ready') return 'Bring a prepared ingredient to the plating counter.';
  const layers = [...state.layers, state.cook.hand.id];
  const choices = matchingRecipes(layers);
  if (!choices.length) return 'That layer does not fit. Check the ticket order.';
  const completed = choices.find(recipe => recipe.layers.length === layers.length);
  if (completed && state.queuedPlate) return 'Serve a dish at the window to free the tray.';
  const { simmer } = state.cook.hand;
  if (simmer) state.layerSimmers.push(simmer);
  state.layers = completed ? [] : layers;
  state.cook.hand = null;
  if (completed) {
    if (state.ready) {
      state.queuedPlate = completed;
      state.queuedSimmers = state.layerSimmers;
    } else {
      state.ready = completed;
      state.readySimmers = state.layerSimmers;
    }
    state.layerSimmers = [];
  }
  state.platePop = state.elapsed;
  burst(state, completed && !state.queuedPlate ? 1039 : 679, 660, '#ffce72', completed ? 18 : 8);
  state.sound(completed ? 'ding' : 'tick');
}

export function useStation(state, station) {
  if (station.kind === 'ingredient') {
    if (state.cook.hand?.id === station.id && state.cook.hand.stage === pickIngredient(station.id).stage) {
      state.cook.hand = null;
      return 'Ingredient returned.';
    }
    if (state.cook.hand) return 'Use what you are carrying or clear it at the sink.';
    state.cook.hand = pickIngredient(station.id);
    state.sound('tick');
    return `Picked up ${ingredients[station.id].name.toLowerCase()}.`;
  }
  if (station.id === 'chop') return useChopBoard(state);
  if (station.kind === 'burner') return useStove(state, station.index);
  if (station.id === 'plate') return assembleRecipeLayers(state);
  if (station.id === 'pass') return serveReadyPlate(state);
  if (state.cook.hand) state.cook.hand = null;
  else if (state.layers.length) {
    state.layers = [];
    state.layerSimmers = [];
  } else if (state.queuedPlate) {
    state.queuedPlate = null;
    state.queuedSimmers = null;
  } else if (state.ready) {
    state.ready = null;
    state.readySimmers = null;
  } else return 'Use the sink to clear your hands or an unfinished dish.';
  state.sound('tick');
  return 'Counter cleared.';
}

export const ingredients = {
  broth: { name: 'Broth', route: 'pour', hue: '#e69243' },
  noodles: { name: 'Noodles', route: 'cook', hue: '#f4c766' },
  greens: { name: 'Greens', route: 'chop', hue: '#83bb69' },
  egg: { name: 'Egg', route: 'cook', hue: '#f9dfab' },
  tofu: { name: 'Tofu', route: 'chop', hue: '#eac695' },
  shrimp: { name: 'Shrimp', route: 'cook', hue: '#f5846e' },
  shrooms: { name: 'Mushrooms', route: 'both', hue: '#d0ab83' },
};

export function pickIngredient(id) {
  return { id, stage: ingredients[id].route === 'pour' ? 'ready' : 'raw' };
}

export function needsChopping(food) {
  return food?.stage === 'raw' && ['chop', 'both'].includes(ingredients[food.id].route);
}

export function needsCooking(food) {
  return food && ((food.stage === 'raw' && ingredients[food.id].route === 'cook')
    || (food.stage === 'chopped' && ingredients[food.id].route === 'both'));
}

export const floorBounds = { left: 82, top: 372, right: 1158, bottom: 556 };

export const pantry = Object.keys(ingredients).map((id, index) => ({
  id, kind: 'ingredient', x: 45 + 172 * index, y: 252, w: 158, h: 92,
  standX: 124 + 172 * index, standY: 372,
}));

export const burners = [0, 1].map(index => ({
  id: `burner-${index + 1}`, kind: 'burner', index,
  x: 296 + 138 * index, y: 582, w: 138, h: 156,
  standX: 365 + 138 * index, standY: 556,
}));

export const worktops = [
  { id: 'chop', label: 'CHOP BOARD', x: 42, y: 582, w: 244, h: 156, standX: 164, standY: 556 },
  { id: 'stove', label: 'STOVE', x: 296, y: 582, w: 276, h: 156 },
  { id: 'plate', label: 'PLATING COUNTER', x: 582, y: 582, w: 352, h: 156, standX: 758, standY: 556 },
  { id: 'pass', label: 'SERVING WINDOW', x: 944, y: 582, w: 294, h: 156, standX: 1091, standY: 556 },
];

export const sink = { id: 'sink', label: 'SINK', x: 1180, y: 418, w: 58, h: 93, standX: 1158, standY: 465 };
export const coverIsland = { x: 553, y: 415, w: 151, h: 65 };
const stations = [...pantry, ...burners, ...worktops.filter(station => station.id !== 'stove'), sink];

export function stationAt(x, y) {
  return stations.find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
}

export function nearbyStation(player) {
  let closest;
  let distance = 47;
  for (const station of stations) {
    const gap = Math.hypot(player.x - station.standX, player.y - station.standY);
    if (gap < distance) {
      distance = gap;
      closest = station;
    }
  }
  return closest;
}

export function chopIngredient(state) {
  const board = state.board;
  if (!board.food || board.cuts >= cutsNeeded) return;
  board.cuts++;
  board.mark = state.elapsed;
  burst(state, 144, 653, ingredients[board.food.id].hue);
  burst(state, 151, 647, '#fff2ab', 5);
  state.sound('chop');
  if (board.cuts === cutsNeeded) {
    board.food.stage = ingredients[board.food.id].route === 'both'
      ? 'chopped' : 'ready';
    state.sound('tick');
  }
}

function useChopBoard(state) {
  const { board, cook } = state;
  if (cook.hand && !board.food && needsChopping(cook.hand)) {
    board.food = cook.hand;
    cook.hand = null;
    board.cuts = 0;
  }
  if (board.food && board.cuts < cutsNeeded) {
    chopIngredient(state);
  } else if (board.food && !cook.hand) {
    cook.hand = board.food;
    board.food = null;
    board.cuts = 0;
  } else {
    return 'Bring greens, tofu, or mushrooms to chop.';
  }
}

export function holdToChop(state) {
  if (state.elapsed - state.board.mark >= .24) chopIngredient(state);
}

const cutsNeeded = 4;

export function stovePhase(pot) {
  if (!pot.food) return 'empty';
  if (pot.age < simmerSeconds) return 'simmering';
  if (burnTime(pot) > 0) return 'cooked';
  return 'burnt';
}

export function burnTime(pot) {
  return Math.max(0, simmerSeconds + burnSeconds - pot.age);
}

export function updateStove(state, dt) {
  for (const pot of state.pots) {
    if (!pot.food) continue;
    const phase = stovePhase(pot);
    const before = burnTime(pot);
    pot.age += dt;
    if (phase !== stovePhase(pot)) state.sound(phase === 'simmering' ? 'ding' : 'burn');
    else if (phase === 'cooked' && before > 2 && burnTime(pot) <= 2) state.sound('warning');
  }
}

function useStove(state, index) {
  const pot = state.pots[index];
  const { cook } = state;
  if (!pot.food && needsCooking(cook.hand)) {
    pot.food = cook.hand;
    pot.startedAt = state.elapsed;
    pot.age = 0;
    cook.hand = null;
    state.sound('sizzle');
    return;
  }
  const phase = stovePhase(pot);
  if (!cook.hand && (phase === 'cooked' || phase === 'burnt')) {
    cook.hand = { id: pot.food.id, stage: phase === 'cooked' ? 'ready' : 'burnt',
      simmer: { index, startedAt: pot.startedAt } };
    pot.food = null;
    state.sound('tick');
    return phase === 'burnt' ? 'Burnt food goes in the sink.' : undefined;
  }
  if (phase === 'simmering') return 'Still simmering. Prep your next layer.';
  if (phase !== 'empty') return 'Free a hand to lift this burner.';
  return 'Cook noodles, egg, shrimp, or chopped mushrooms here.';
}

export const simmerSeconds = 4.2;
const burnSeconds = 7;

function serveReadyPlate(state) {
  if (!state.ready) return 'Finish a dish at the plating counter first.';
  const recipe = state.ready;
  const simmers = state.readySimmers;
  const tipsBefore = state.tips;
  const service = scoreServe(state, recipe);
  state.ready = state.queuedPlate;
  state.readySimmers = state.queuedSimmers;
  state.queuedPlate = null;
  state.queuedSimmers = null;
  if (!service) return `No ticket for ${recipe.name}. The dish was cleared.`;
  if (simmers?.length) {
    const usedBurners = new Set(simmers.map(simmer => simmer.index));
    const route = usedBurners.size === burners.length ? 'both' : usedBurners.has(0) ? 'left' : 'right';
    state.servedByRoute[route]++;
    if (route === 'both') {
      // Each overlap replaces time the dish would have spent simmering in sequence.
      const starts = simmers.map(simmer => simmer.startedAt).sort((a, b) => a - b);
      for (let i = 1; i < starts.length; i++) {
        state.simmerSecondsSaved += Math.max(0, simmerSeconds - (starts[i] - starts[i - 1]));
      }
    }
  }
  state.servePop = {
    at: state.elapsed,
    recipe,
    tip: (state.tips - tipsBefore) / service.sharedPrepMultiplier,
    multiplier: service.sharedPrepMultiplier,
  };
  state.sound('serve');
  burst(state, 1039, 656, '#ffdb79', 22);
  const details = service.bonus ? 'VIP bonus!' : state.combo > 1 ? `×${comboMultiplier(state.combo)} tips` : 'Order served!';
  const sharedPrep = `${service.sharedPrepMultiplier}× tips · shared ingredient${service.bonus ? ' · VIP bonus!' : ''}`;
  return `+${service.coins} coins  ·  ${service.sharedPrepMultiplier > 1 ? sharedPrep : details}`;
}

function burst(state, x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = state.visualRandom() * Math.PI * 2;
    const speed = 30 + state.visualRandom() * 90;
    state.particles.push({
      x, y, color, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed - 40,
      left: .27 + state.visualRandom() * .26,
    });
  }
}

export function moveParticles(state, dt) {
  for (const bit of state.particles) {
    bit.x += bit.dx * dt;
    bit.y += bit.dy * dt;
    bit.dy += 185 * dt;
    bit.left -= dt;
  }
  state.particles = state.particles.filter(bit => bit.left > 0);
}
