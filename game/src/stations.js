import { ingredients, pickIngredient } from './ingredients.js';
import { useChopBoard } from './chopping.js';
import { useStove } from './cooking-stove.js';
import { assembleDish, serveReadyPlate } from './plating.js';

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
  if (station.id === 'stove') return useStove(state);
  if (station.id === 'plate') return assembleDish(state);
  if (station.id === 'pass') return serveReadyPlate(state);
  if (state.cook.hand) state.cook.hand = null;
  else if (state.layers.length) state.layers = [];
  else if (state.ready) state.ready = null;
  else return 'Use the sink to clear your hands or an unfinished dish.';
  state.sound('tick');
  return 'Counter cleared.';
}
