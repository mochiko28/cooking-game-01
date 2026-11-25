// Plans a station sequence for the next layer of the focused ticket.
import { focusedTicket } from './order-board.js';
import { burners, pantry, sink, worktops } from './kitchen-layout.js';
import { needsChopping, needsCooking, pickIngredient } from './ingredients.js';
import { stovePhase } from './cooking-stove.js';

const [chop, , plate, pass] = worktops;

export function routeForTicket(state, ticket = focusedTicket(state)) {
  if (!ticket) return [];
  const { recipe } = ticket;
  const { hand } = state.cook;
  if (state.ready === recipe || state.queuedPlate === recipe) return [pass];
  if (state.layers.some((layer, index) => layer !== recipe.layers[index])) return [sink];
  const id = recipe.layers[state.layers.length];
  if (!id) return [pass];
  if (hand && (hand.id !== id || hand.stage === 'burnt')) return [sink];

  const finishing = state.layers.length === recipe.layers.length - 1;
  if (finishing && state.queuedPlate) return [pass];

  const route = layerRoute(state, id);
  if (route.blocked) return route.stations;
  const visits = [...route.stations, plate];
  if (finishing) visits.push(pass);
  return visits;
}

function layerRoute(state, id) {
  const { hand } = state.cook;
  const preparedBurner = burners.find(({ index }) => state.pots[index].food?.id === id && stovePhase(state.pots[index]) !== 'burnt');
  if (!hand && preparedBurner) return { stations: [preparedBurner] };

  const onBoard = !hand && state.board.food?.id === id;
  const food = hand ?? (onBoard ? state.board.food : pickIngredient(id));
  const chopping = onBoard || needsChopping(food);
  if (chopping && state.board.food && !onBoard) return { stations: [hand ? sink : chop], blocked: true };

  const stations = [];
  if (!hand && !onBoard) stations.push(pantry.find(station => station.id === id));
  if (chopping) stations.push(chop);
  if (needsCooking(food) || (id === 'shrooms' && food.stage === 'raw')) {
    const available = burners.filter(({ index }) => !state.pots[index].food);
    const from = stations.at(-1)?.standX ?? state.cook.x;
    const closest = available.toSorted((a, b) => Math.abs(a.standX - from) - Math.abs(b.standX - from))[0];
    if (!closest) {
      const firstToLift = burners.toSorted((a, b) => state.pots[b.index].age - state.pots[a.index].age)[0];
      return { stations: [hand ? sink : firstToLift], blocked: true };
    }
    stations.push(closest);
  }
  return { stations };
}
