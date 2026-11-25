// Runs two independently timed burners and handles loading, lifting, and burning.
import { needsCooking } from './ingredients.js';

export const simmerSeconds = 4.2;
const burnSeconds = 7;

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

export function useStove(state, index) {
  const pot = state.pots[index];
  const { cook } = state;
  if (!pot.food && needsCooking(cook.hand)) {
    pot.food = cook.hand;
    pot.age = 0;
    cook.hand = null;
    state.sound('sizzle');
    return;
  }
  const phase = stovePhase(pot);
  if (!cook.hand && (phase === 'cooked' || phase === 'burnt')) {
    cook.hand = { id: pot.food.id, stage: phase === 'cooked' ? 'ready' : 'burnt' };
    pot.food = null;
    state.sound('tick');
    return phase === 'burnt' ? 'Burnt food goes in the sink.' : undefined;
  }
  if (phase === 'simmering') return 'Still simmering. Prep your next layer.';
  if (phase !== 'empty') return 'Free a hand to lift this burner.';
  return 'Cook noodles, egg, shrimp, or chopped mushrooms here.';
}
