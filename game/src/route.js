// Chooses the shortest valid route for the focused ticket.
import { focusedTicket } from './orders.js';
import { burners, needsChopping, needsCooking, pantry, pickIngredient, sink, stovePhase, worktops } from './stations.js';
import { cookSpeed } from './cook.js';

function prepAndServeRoutes(state, ticket) {
  if (!ticket) return [];
  const { recipe } = ticket;
  const { hand } = state.cook;
  if (state.ready === recipe || state.queuedPlate === recipe) return [[pass]];
  if (state.layers.some((layer, index) => layer !== recipe.layers[index])) return [[sink]];
  const id = recipe.layers[state.layers.length];
  if (!id) return [[pass]];
  if (hand && (hand.id !== id || hand.stage === 'burnt')) return [[sink]];

  const finishing = state.layers.length === recipe.layers.length - 1;
  if (finishing && state.queuedPlate) return [[pass]];

  const { options, blocked } = layerRoutes(state, id);
  if (blocked) return options;
  return options.flatMap(prep => {
    const assembly = [...prep, plate];
    if (!finishing) return [assembly];
    const route = [...assembly, pass];
    if (!state.ready) return [route];

    // The dish on the pass can go out between any two prep steps, or both
    // dishes can go out together after plating. Prep order stays fixed.
    return [route, ...assembly.map((_, index) => [
      ...assembly.slice(0, index), pass, ...assembly.slice(index), pass,
    ])];
  });
}

export function chooseFastestRoute(cook, routes) {
  let best = [];
  let shortest = Infinity;
  for (const route of routes) {
    const seconds = estimateRouteSeconds(cook, route);
    if (seconds < shortest) {
      best = route;
      shortest = seconds;
    }
  }
  return best;
}

export function routeForTicket(state, ticket = focusedTicket(state)) {
  return chooseFastestRoute(state.cook, prepAndServeRoutes(state, ticket));
}

export function estimateRouteSeconds(cook, stations) {
  let { x, y } = cook;
  let distance = 0;
  for (const { standX, standY } of stations) {
    distance += Math.hypot(standX - x, standY - y);
    x = standX;
    y = standY;
  }
  return distance / (cook.speed ?? cookSpeed);
}

function layerRoutes(state, id) {
  const { hand } = state.cook;
  const preparedBurners = burners.filter(({ index }) => state.pots[index].food?.id === id && stovePhase(state.pots[index]) !== 'burnt');
  if (!hand && preparedBurners.length) return { options: preparedBurners.map(burner => [burner]) };

  const onBoard = !hand && state.board.food?.id === id;
  const food = hand ?? (onBoard ? state.board.food : pickIngredient(id));
  const chopping = needsChopping(food);
  if (chopping && state.board.food && !onBoard) return { options: [[hand ? sink : chop]], blocked: true };

  const stations = [];
  if (!hand && !onBoard) stations.push(pantry.find(station => station.id === id));
  if (onBoard || chopping) stations.push(chop);
  if (needsCooking(food) || (id === 'shrooms' && food.stage === 'raw')) {
    const available = burners.filter(({ index }) => !state.pots[index].food);
    if (!available.length) {
      const firstToLift = burners.toSorted((a, b) => state.pots[b.index].age - state.pots[a.index].age)[0];
      return { options: [[hand ? sink : firstToLift]], blocked: true };
    }
    return { options: available.map(burner => [...stations, burner]) };
  }
  return { options: [stations] };
}

const [chop, , plate, pass] = worktops;
