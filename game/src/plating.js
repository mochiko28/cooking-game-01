import { matchingRecipes } from './recipes.js';
import { scoreServe } from './order-board.js';
import { burst } from './particles.js';

export function assembleDish(state) {
  if (state.cook.hand?.stage !== 'ready') return 'Bring a prepared ingredient to the plating counter.';
  const layers = [...state.layers, state.cook.hand.id];
  const choices = matchingRecipes(layers);
  if (!choices.length) return 'That layer does not fit. Check the ticket order.';
  const completed = choices.find(recipe => recipe.layers.length === layers.length);
  if (completed && state.ready) return 'Serve or clear the dish in the window first.';
  state.layers = completed ? [] : layers;
  state.cook.hand = null;
  if (completed) state.ready = completed;
  state.platePop = state.elapsed;
  burst(state, completed ? 1030 : 684, 614, '#ffce72', completed ? 18 : 8);
  state.sound(completed ? 'ding' : 'tick');
}

export function serveReadyPlate(state) {
  if (!state.ready) return 'Finish a dish at the plating counter first.';
  const coins = scoreServe(state, state.ready);
  if (!coins) {
    const named = state.ready.name;
    state.ready = null;
    return `No ticket for ${named}. The dish was cleared.`;
  }
  state.ready = null;
  state.sound('serve');
  burst(state, 1044, 610, '#ffdb79', 22);
  return `+${coins} coins${state.combo >= 2 ? `  ·  ×${state.combo} streak` : '  ·  Order served!'}`;
}
