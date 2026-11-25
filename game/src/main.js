import { createKitchenAudio } from './audio-synth.js';
import { drawServiceHud } from './draw-hud.js';
import { drawKitchen } from './draw-kitchen.js';
import { createShift, interact, updateShift } from './game-loop.js';
import { bindKitchenInput } from './input-keyboard-mouse.js';
import { renderScreen } from './screens-title-results.js';
import { stageScreenshot } from './screenshot-scenes.js';

const shell = document.querySelector('#game-shell');
const canvas = document.querySelector('#kitchen');
const ctx = canvas.getContext('2d');
const screen = document.querySelector('#screen');
const announcement = document.querySelector('#announcement');
const buttons = document.querySelector('#service-buttons');
const soundButton = document.querySelector('#sound-button');
const audio = createKitchenAudio();
const query = new URLSearchParams(location.search);
const seed = Number(query.get('seed') ?? new Date().getDate());
const newShift = () => createShift(seed, audio.play, message => { announcement.textContent = message; });
let state = newShift();
let previousScreen = 'title';
let paintedScreen;
stageScreenshot(state, query.get('shot'));

function changeScreen(next) {
  state.screen = next;
  state.target = null;
  state.mouseChop = false;
  input.clear();
}

function command(action) {
  audio.unlock();
  if (action === 'start') {
    state = newShift();
    state.notice = 'Start Jade Noodles by pouring broth at the plating counter.';
    state.noticeUntil = 7;
    changeScreen('play');
  }
  if (action === 'recipes') {
    if (state.screen === 'recipes') changeScreen(previousScreen);
    else {
      previousScreen = state.screen;
      changeScreen('recipes');
    }
  }
  if (action === 'pause') {
    if (state.screen === 'play') changeScreen('pause');
    else if (state.screen === 'pause') changeScreen('play');
  }
  if (action === 'close') changeScreen(state.screen === 'recipes' ? previousScreen : 'play');
  if (action === 'sound') {
    const muted = audio.toggle();
    soundButton.setAttribute('aria-pressed', String(muted));
    soundButton.innerHTML = `Sound ${muted ? 'off' : 'on'} <kbd>M</kbd>`;
  }
  if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur();
}

const input = bindKitchenInput(canvas, {
  key(code) {
    if (code === 'KeyR') command('recipes');
    if (code === 'KeyP') command('pause');
    if (code === 'KeyM') command('sound');
    if (code === 'Escape') command(state.screen === 'recipes' ? 'close' : 'pause');
    if (['Enter', 'Space'].includes(code) && ['title', 'results'].includes(state.screen)) {
      command('start');
      return;
    }
    if (['KeyE', 'Space'].includes(code) && state.screen === 'play') {
      audio.unlock();
      state.target = null;
      state.mouseChop = false;
      interact(state);
    }
  },
  click(station) {
    if (state.screen !== 'play' || state.staged) return;
    audio.unlock();
    state.mouseChop = false;
    state.target = station;
  },
  hover(station) {
    if (!state.staged) state.hover = station;
  },
});

screen.addEventListener('click', event => {
  const action = event.target.closest('button')?.dataset.command;
  if (action) command(action);
});
buttons.querySelector('#book-button').onclick = () => command('recipes');
buttons.querySelector('#pause-button').onclick = () => command('pause');
soundButton.onclick = () => command('sound');
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.screen === 'play' && !state.staged) changeScreen('pause');
});

function resizeStage() {
  shell.style.setProperty('--stage-scale', Math.min(innerWidth / 1280, innerHeight / 800));
}
resizeStage();
window.addEventListener('resize', resizeStage);

let last = performance.now();
function frame(now) {
  const dt = Math.max(0, Math.min(.05, (now - last) / 1000));
  last = now;
  if (state.screen === 'play' && !state.staged) updateShift(state, dt, input.read());
  if (paintedScreen !== state.screen) {
    renderScreen(screen, state);
    paintedScreen = state.screen;
    buttons.hidden = state.screen !== 'play';
  }
  drawKitchen(ctx, state);
  drawServiceHud(ctx, state);
  requestAnimationFrame(frame);
}
frame(last);
