import { recipes } from './recipes.js';
import { rushDifficulty } from './shift-timer.js';

export function spawnOrder(state, recipe = null, remaining = null, total = null) {
  const pressure = rushDifficulty(state.elapsed);
  const number = state.nextTicket++;
  const opening = [recipes[0], recipes[2], recipes[1]];
  const index = Math.floor(state.random() * recipes.length);
  const choice = recipe ?? opening[number - 1] ?? recipes[index];
  const patience = total ?? (pressure.patience + choice.layers.length * 4);
  state.orders.push({ number, recipe: choice, patience, left: remaining ?? patience });
}

export function updateOrderBoard(state, dt) {
  for (const ticket of state.orders) ticket.left -= dt;
  const waiting = state.orders.filter(ticket => ticket.left > 0);
  if (waiting.length < state.orders.length) {
    state.missed += state.orders.length - waiting.length;
    state.combo = 0;
    state.orders = waiting;
  }
  if (state.elapsed >= state.nextArrival && state.orders.length < 4) {
    spawnOrder(state);
    state.nextArrival = state.elapsed + rushDifficulty(state.elapsed).interval;
    state.sound('ticket');
  }
}

export function scoreServe(state, recipe) {
  const index = state.orders.findIndex(ticket => ticket.recipe.id === recipe.id);
  if (index < 0) return false;
  const [ticket] = state.orders.splice(index, 1);
  const fresh = ticket.left / ticket.patience;
  state.combo = fresh >= .47 ? state.combo + 1 : 0;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served++;
  const tip = Math.floor(15 * fresh) + Math.min(5, state.combo) * 3;
  const coins = 26 + recipe.layers.length * 6 + tip;
  state.coins += coins;
  state.tips += tip;
  return coins;
}

export function shiftStars(state) {
  return [1, 3, 5, 7, 9].filter(goal => state.served >= goal).length;
}
