import { needsCooking } from './ingredients.js';

export const simmerSeconds = 4.2;
export const burnSeconds = 7;

export function stovePhase(pot) {
  if (!pot.food) return 'empty';
  if (pot.age < simmerSeconds) return 'simmering';
  if (pot.age < simmerSeconds + burnSeconds) return 'cooked';
  return 'burnt';
}

export function updateStove(state, dt) {
  if (!state.pot.food) return;
  const phase = stovePhase(state.pot);
  state.pot.age += dt;
  if (phase !== stovePhase(state.pot)) state.sound(phase === 'simmering' ? 'ding' : 'burn');
}

export function useStove(state) {
  const { pot, cook } = state;
  if (!pot.food && needsCooking(cook.hand)) {
    pot.food = cook.hand;
    pot.age = 0;
    cook.hand = null;
    state.sound('sizzle');
    return;
  }
  const phase = stovePhase(pot);
  if (!cook.hand && ['cooked', 'burnt'].includes(phase)) {
    cook.hand = { id: pot.food.id, stage: phase === 'cooked' ? 'ready' : 'burnt' };
    pot.food = null;
    return phase === 'burnt' ? 'Burnt food goes in the sink.' : undefined;
  }
  if (phase === 'simmering') return 'Still simmering. Prep your next layer.';
  return 'Cook noodles, egg, shrimp, or chopped mushrooms here.';
}
