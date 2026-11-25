// Wires the browser controls, service simulation, and rendering into the playable game.
import { focusNextTicket, focusedTicket, recipes, spawnOrder, updateOrders } from './orders.js';
import { serviceWaves, shiftLength } from './shift.js';
import { routeForTicket } from './route.js';
import { holdToChop, moveParticles, nearbyStation, stationAt, updateStove, useStation } from './stations.js';
import { bindKitchenInput, walkCook, walkToStation } from './cook.js';
import { createKitchenAudio } from './audio.js';
import { drawKitchen } from './kitchen.js';
import { drawServiceHud, renderScreen, ticketAt } from './ui.js';
import { coverRoutePlan, drawRushView, moveCoverCook, stageScreenshot } from './shots.js';

export function startGame() {
  function renderServiceFrame(now) {
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000));
    last = now;
    if (state.screen === 'play' && !state.staged) updateShift(state, dt, input.read());
    if (state.shot === 'cover' && !stillShot) {
      state.coverMotion = (state.coverMotion + dt) % 3;
      moveCoverCook(state);
    }
    if (state.shot === 'rush' && !stillShot) state.rushMotion += dt;
    if (paintedScreen !== state.screen) {
      renderScreen(screen, state);
      paintedScreen = state.screen;
      buttons.hidden = state.screen !== 'play' || state.shot === 'rush';
      routeButton.setAttribute('aria-pressed', String(state.showRoute));
    }
    if (state.shot === 'rush') drawRushView(kitchenContext, state);
    else {
      let route = null;
      if (state.showRoute && state.screen === 'play') {
        route = state.shot === 'cover' ? coverPlan : routeForTicket(state);
      }
      drawKitchen(kitchenContext, state, route);
      drawServiceHud(kitchenContext, state);
    }
    requestAnimationFrame(renderServiceFrame);
  }

  function showServiceScreen(next) {
    state.screen = next;
    state.target = null;
    state.mouseChop = false;
    input.clear();
  }

  function handleServiceCommand(action) {
    audio.unlock();
    if (action === 'start') {
      state = newShift();
      state.notice = `Start ${recipes[0].name} by pouring broth at the plating counter.`;
      state.noticeUntil = 7;
      showServiceScreen('play');
    }
    if (action === 'recipes') {
      if (state.screen === 'recipes') showServiceScreen(previousScreen);
      else {
        previousScreen = state.screen;
        showServiceScreen('recipes');
      }
    }
    if (action === 'pause') {
      if (state.screen === 'play') showServiceScreen('pause');
      else if (state.screen === 'pause') showServiceScreen('play');
    }
    if (action === 'close') showServiceScreen(state.screen === 'recipes' ? previousScreen : 'play');
    if (action === 'route') {
      state.showRoute = !state.showRoute;
      routeButton.setAttribute('aria-pressed', String(state.showRoute));
    }
    if (action === 'sound') {
      const muted = audio.toggle();
      soundButton.setAttribute('aria-pressed', String(muted));
      soundButton.innerHTML = `Sound ${muted ? 'off' : 'on'} <kbd>M</kbd>`;
    }
    if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur();
  }

  function resizeStage() {
    gameShell.style.setProperty('--stage-scale', Math.min(innerWidth / 1280, innerHeight / 800));
  }

  const gameShell = document.querySelector('.stage');
  const kitchenCanvas = document.querySelector('#kitchen-game');
  const kitchenContext = kitchenCanvas.getContext('2d');
  const screen = document.querySelector('#screen');
  const announcement = document.querySelector('#announcement');
  const buttons = document.querySelector('#service-buttons');
  const routeButton = document.querySelector('#route-button');
  const soundButton = document.querySelector('#sound-button');
  const audio = createKitchenAudio();
  const coverPlan = coverRoutePlan();
  const query = new URLSearchParams(location.search);
  const stillShot = query.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seed = Number(query.get('seed') ?? new Date().getDate());
  const newShift = () => createShift(seed, audio.play, message => { announcement.textContent = message; });
  let state = newShift();
  let previousScreen = 'title';
  let paintedScreen;
  stageScreenshot(state, query.get('shot'));

  const input = bindKitchenInput(kitchenCanvas, {
    key(code) {
      if (code === 'KeyT' && state.screen === 'play') handleServiceCommand('route');
      if (code === 'KeyQ' && state.screen === 'play') {
        focusNextTicket(state);
        const ticket = focusedTicket(state);
        if (ticket) announcement.textContent = `Focused ${ticket.recipe.name}.`;
      }
      if (code === 'KeyR') handleServiceCommand('recipes');
      if (code === 'KeyP') handleServiceCommand('pause');
      if (code === 'KeyM') handleServiceCommand('sound');
      if (code === 'Escape') handleServiceCommand(state.screen === 'recipes' ? 'close' : 'pause');
      if (['Enter', 'Space'].includes(code) && ['title', 'results'].includes(state.screen)) {
        handleServiceCommand('start');
        return;
      }
      if (['KeyE', 'Space'].includes(code) && state.screen === 'play') {
        audio.unlock();
        state.target = null;
        state.mouseChop = false;
        interact(state);
      }
    },
    click(x, y) {
      if (state.screen !== 'play' || state.staged) return;
      const ticket = ticketAt(state, x, y);
      if (ticket) {
        state.focusedNumber = ticket.number;
        announcement.textContent = `Focused ${ticket.recipe.name}.`;
        return;
      }
      const station = stationAt(x, y);
      if (station) {
        audio.unlock();
        state.mouseChop = false;
        state.target = station;
      }
    },
    hover(station, x, y) {
      kitchenCanvas.style.cursor = !state.staged && state.screen === 'play' && (station || ticketAt(state, x, y)) ? 'pointer' : '';
      if (!state.staged) state.hover = station;
    },
  });

  screen.addEventListener('click', event => {
    const action = event.target.closest('button')?.dataset.command;
    if (action) handleServiceCommand(action);
  });
  buttons.querySelector('#book-button').onclick = () => handleServiceCommand('recipes');
  buttons.querySelector('#pause-button').onclick = () => handleServiceCommand('pause');
  routeButton.onclick = () => handleServiceCommand('route');
  soundButton.onclick = () => handleServiceCommand('sound');
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === 'play' && !state.staged) showServiceScreen('pause');
  });

  resizeStage();
  window.addEventListener('resize', resizeStage);

  let last = performance.now();
  renderServiceFrame(last);
}

function createShift(seed, sound, announce) {
  const state = {
    elapsed: 0, screen: 'title', orders: [], nextTicket: 1, nextArrival: 14,
    coins: 0, tips: 0, served: 0, servedByWave: serviceWaves.map(() => 0), missed: 0, combo: 0, bestCombo: 0,
    lastServedRecipe: null,
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

function interact(state, station = nearbyStation(state.cook)) {
  if (!station) return;
  const notice = useStation(state, station);
  if (notice) {
    state.notice = notice;
    state.noticeUntil = state.elapsed + 2.7;
    state.announce(notice);
  }
}

function updateShift(state, dt, controls) {
  const second = Math.ceil(shiftLength - state.elapsed);
  state.elapsed = Math.min(shiftLength, state.elapsed + dt);
  if (state.elapsed >= shiftLength) {
    state.screen = 'results';
    state.sound('serve');
    return;
  }
  if (second <= 11 && Math.ceil(shiftLength - state.elapsed) < second) state.sound('warning');
  updateOrders(state, dt);
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

startGame();
