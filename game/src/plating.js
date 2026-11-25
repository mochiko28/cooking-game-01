// Assembles dishes in recipe order and advances finished plates through the pass.
import { matchingRecipes } from './recipes.js';
import { scoreServe } from './order-board.js';
import { comboMultiplier } from './combo-streak.js';
import { burst } from './particles.js';

export function assembleDish(state) {
  if (state.cook.hand?.stage !== 'ready') return 'Bring a prepared ingredient to the plating counter.';
  const layers = [...state.layers, state.cook.hand.id];
  const choices = matchingRecipes(layers);
  if (!choices.length) return 'That layer does not fit. Check the ticket order.';
  const completed = choices.find(recipe => recipe.layers.length === layers.length);
  if (completed && state.queuedPlate) return 'Serve a dish at the window to free the tray.';
  state.layers = completed ? [] : layers;
  state.cook.hand = null;
  if (completed) {
    if (state.ready) state.queuedPlate = completed;
    else state.ready = completed;
  }
  state.platePop = state.elapsed;
  burst(state, completed && !state.queuedPlate ? 1039 : 679, 660, '#ffce72', completed ? 18 : 8);
  state.sound(completed ? 'ding' : 'tick');
}

export function serveReadyPlate(state) {
  if (!state.ready) return 'Finish a dish at the plating counter first.';
  const recipe = state.ready;
  const service = scoreServe(state, recipe);
  state.ready = state.queuedPlate;
  state.queuedPlate = null;
  if (!service) return `No ticket for ${recipe.name}. The dish was cleared.`;
  state.sound('serve');
  burst(state, 1039, 656, '#ffdb79', 22);
  const details = service.bonus ? 'VIP bonus!' : state.combo > 1 ? `×${comboMultiplier(state.combo)} tips` : 'Order served!';
  return `+${service.coins} coins  ·  ${details}`;
}
