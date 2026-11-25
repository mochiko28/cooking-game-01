// Schedules service tickets, tracks focus, and matches delivered dishes to orders.
import { recipes } from './recipes.js';
import { serviceWave } from './service-waves.js';
import { recordService } from './combo-streak.js';
import { vipClock, vipTip } from './vip-tickets.js';

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

export function updateOrderBoard(state, dt) {
  for (const ticket of state.orders) {
    ticket.left -= dt;
    if (ticket.vipLeft !== null) ticket.vipLeft = Math.max(0, ticket.vipLeft - dt);
  }
  const waiting = state.orders.filter(ticket => ticket.left > 0);
  if (waiting.length < state.orders.length) {
    state.missed += state.orders.length - waiting.length;
    state.combo = 0;
    state.orders = waiting;
  }
  if (state.elapsed >= state.nextArrival && state.orders.length < ticketCapacity) {
    spawnOrder(state);
    state.nextArrival = state.elapsed + serviceWave(state.elapsed).interval;
    state.sound('ticket');
  }
}

export function scoreServe(state, recipe) {
  const candidates = state.orders.filter(ticket => ticket.recipe === recipe);
  const ticket = candidates.find(order => vipTip(order)) ?? candidates[0];
  if (!ticket) return null;
  state.orders = state.orders.filter(order => order !== ticket);
  const bonus = vipTip(ticket);
  return { coins: recordService(state, ticket, bonus), bonus };
}

export const ticketCapacity = 4;
