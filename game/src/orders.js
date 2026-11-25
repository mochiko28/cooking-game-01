// Manages recipes and the live order board, including VIP tickets.
import { recordService, serviceWave } from './shift.js';

function comboBonusForSharedPrep(prior, next) {
  if (prior && prior.id !== next.id && prior.layers.some(id => next.layers.includes(id))) return 2;
  return 1;
}

export { comboBonusForSharedPrep };

export function matchingRecipes(layers) {
  return recipes.filter(recipe => layers.length <= recipe.layers.length
    && layers.every((ingredient, index) => ingredient === recipe.layers[index]));
}

export function updateOrders(state, dt) {
  for (const ticket of state.orders) {
    ticket.left -= dt;
    if (ticket.vipLeft !== null) ticket.vipLeft = Math.max(0, ticket.vipLeft - dt);
  }
  const waiting = state.orders.filter(ticket => ticket.left > 0);
  if (waiting.length < state.orders.length) {
    state.missed += state.orders.length - waiting.length;
    state.combo = 0;
    state.lastServedRecipe = null;
    state.orders = waiting;
  }
  if (state.elapsed >= state.nextArrival && state.orders.length < ticketCapacity) {
    spawnOrder(state);
    state.nextArrival = state.elapsed + serviceWave(state.elapsed).interval;
    state.sound('ticket');
  }
}

export function spawnOrder(state, { recipe, left, patience, vipLeft } = {}) {
  const wave = serviceWave(state.elapsed);
  const number = state.nextTicket++;
  const opening = [recipes[0], recipes[2], recipes[1]];
  const pool = recipes.filter(item => item.layers.length >= wave.layers[0] && item.layers.length <= wave.layers[1]);
  const fresh = pool.filter(item => !state.orders.some(ticket => ticket.recipe === item));
  const choices = fresh.length ? fresh : pool;
  const choice = recipe ?? opening[number - 1] ?? choices[Math.floor(state.random() * choices.length)];
  const lifetime = patience ?? wave.patience + choice.layers.length * 4;
  state.orders.push({
    number, recipe: choice, patience: lifetime, left: left ?? lifetime,
    vipLeft: vipLeft ?? vipClock(number, state.elapsed),
  });
}

export function focusedTicket(state) {
  return state.orders.find(ticket => ticket.number === state.focusedNumber) ?? state.orders[0];
}

export function focusNextTicket(state) {
  if (!state.orders.length) return;
  const index = state.orders.indexOf(focusedTicket(state));
  state.focusedNumber = state.orders[(index + 1) % state.orders.length].number;
}

export function scoreServe(state, recipe) {
  const candidates = state.orders.filter(ticket => ticket.recipe === recipe);
  const ticket = candidates.find(order => vipTip(order)) ?? candidates[0];
  if (!ticket) {
    state.lastServedRecipe = null;
    return null;
  }
  state.orders = state.orders.filter(order => order !== ticket);
  const bonus = vipTip(ticket);
  const sharedPrepMultiplier = comboBonusForSharedPrep(state.lastServedRecipe, recipe);
  state.lastServedRecipe = recipe;
  return { coins: recordService(state, ticket, bonus, sharedPrepMultiplier), bonus, sharedPrepMultiplier };
}

export const ticketCapacity = 4;

function vipClock(number, elapsed) {
  return elapsed >= 55 && number % 3 === 0 ? vipSeconds : null;
}

function vipTip(ticket) {
  return ticket.vipLeft > 0 ? 24 : 0;
}

export const vipSeconds = 34;

export const recipes = [
  { id: 'garden', name: 'Jade Noodles', layers: ['broth', 'noodles', 'greens'], color: '#a4c581', shape: 'bowl' },
  { id: 'tide', name: 'Pink Tide', layers: ['noodles', 'shrimp', 'greens'], color: '#f28e7b', shape: 'plate' },
  { id: 'gold', name: 'Golden Egg', layers: ['noodles', 'egg'], color: '#ffd074', shape: 'plate' },
  { id: 'moon', name: 'Moon Broth', layers: ['broth', 'tofu', 'shrooms'], color: '#c5aedf', shape: 'bowl' },
  { id: 'harvest', name: 'Harvest Bowl', layers: ['noodles', 'tofu', 'shrooms', 'greens'], color: '#d3ae82', shape: 'bowl' },
  { id: 'ember', name: 'Ember Pot', layers: ['broth', 'shrimp', 'egg', 'greens'], color: '#ed9e63', shape: 'bowl' },
];
