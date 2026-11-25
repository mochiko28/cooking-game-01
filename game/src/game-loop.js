// Creates deterministic shift state and advances the simulation and player.
import { shiftLength } from './shift-timer.js';
import { spawnOrder, updateOrderBoard } from './order-board.js';
import { walkCook, walkToStation } from './player-cook.js';
import { holdToChop } from './chopping.js';
import { updateStove } from './cooking-stove.js';
import { moveParticles } from './particles.js';
import { nearbyStation } from './kitchen-layout.js';
import { useStation } from './stations.js';

export function createShift(seed, sound, announce) {
  const state = {
    elapsed: 0, screen: 'title', orders: [], nextTicket: 1, nextArrival: 14,
    coins: 0, tips: 0, served: 0, missed: 0, combo: 0, bestCombo: 0,
    focusedNumber: null, showRoute: true,
    cook: { x: 198, y: 419, facing: 1, moving: false, hand: null },
    board: { food: null, cuts: 0, mark: -10 },
    pots: Array.from({ length: 2 }, () => ({ food: null, age: 0 })),
    layers: [], ready: null, queuedPlate: null, platePop: -10, particles: [], target: null, hover: null,
    mouseChop: false, notice: '', noticeUntil: 0, staged: false,
    random: randomSequence(seed), visualRandom: randomSequence(seed + 89), sound, announce,
  };
  spawnOrder(state);
  return state;
}

export function interact(state, station = nearbyStation(state.cook)) {
  if (!station) return;
  const notice = useStation(state, station);
  if (notice) {
    state.notice = notice;
    state.noticeUntil = state.elapsed + 2.7;
    state.announce(notice);
  }
}

export function updateShift(state, dt, controls) {
  const second = Math.ceil(shiftLength - state.elapsed);
  state.elapsed = Math.min(shiftLength, state.elapsed + dt);
  if (state.elapsed >= shiftLength) {
    state.screen = 'results';
    state.sound('serve');
    return;
  }
  if (second <= 11 && Math.ceil(shiftLength - state.elapsed) < second) state.sound('warning');
  updateOrderBoard(state, dt);
  updateStove(state, dt);
  moveParticles(state, dt);
  if (controls.x || controls.y) {
    state.target = null;
    state.mouseChop = false;
  }
  if (state.target) {
    const arrived = walkToStation(state, dt);
    if (arrived) {
      interact(state, arrived);
      state.mouseChop = arrived.id === 'chop';
    }
  } else {
    walkCook(state, controls.x, controls.y, dt);
  }
  if ((state.mouseChop || controls.use) && nearbyStation(state.cook)?.id === 'chop') holdToChop(state);
}

function randomSequence(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
