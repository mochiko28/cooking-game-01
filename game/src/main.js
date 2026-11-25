// Wires the canvas, menus, input, and animation frame into the playable game.
import { createKitchenAudio } from './audio-synth.js';
import { drawServiceHud } from './draw-hud.js';
import { drawRushView } from './draw-rush-view.js';
import { ticketAt } from './draw-order-board.js';
import { focusNextTicket, focusedTicket } from './order-board.js';
import { stationAt } from './kitchen-layout.js';
import { drawKitchen } from './draw-kitchen.js';
import { recipes } from './recipes.js';
import { createShift, interact, updateShift } from './game-loop.js';
import { bindKitchenInput } from './input-keyboard-mouse.js';
import { renderScreen } from './screens-title-results.js';
import { stageScreenshot } from './screenshot-scenes.js';

function renderServiceFrame(now) {
  const dt = Math.max(0, Math.min(.05, (now - last) / 1000));
  last = now;
  if (state.screen === 'play' && !state.staged) updateShift(state, dt, input.read());
  if (paintedScreen !== state.screen) {
    renderScreen(screen, state);
    paintedScreen = state.screen;
    buttons.hidden = state.screen !== 'play' || state.shot === 'rush';
    routeButton.setAttribute('aria-pressed', String(state.showRoute));
  }
  if (state.shot === 'rush') drawRushView(kitchenContext, state);
  else {
    drawKitchen(kitchenContext, state);
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

const gameShell = document.querySelector('#game-shell');
const kitchenCanvas = document.querySelector('#kitchen');
const kitchenContext = kitchenCanvas.getContext('2d');
const screen = document.querySelector('#screen');
const announcement = document.querySelector('#announcement');
const buttons = document.querySelector('#service-buttons');
const routeButton = document.querySelector('#route-button');
const soundButton = document.querySelector('#sound-button');
const audio = createKitchenAudio();
const query = new URLSearchParams(location.search);
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
