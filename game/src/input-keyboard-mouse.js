import { stationAt } from './kitchen-layout.js';

const up = ['KeyW', 'ArrowUp'];
const down = ['KeyS', 'ArrowDown'];
const left = ['KeyA', 'ArrowLeft'];
const right = ['KeyD', 'ArrowRight'];
const use = ['KeyE', 'Space'];
const actions = [...up, ...down, ...left, ...right, ...use, 'KeyR', 'KeyP', 'KeyM', 'Escape', 'Enter'];

export function bindKitchenInput(canvas, handlers) {
  const held = new Set();
  window.addEventListener('keydown', event => {
    if (!actions.includes(event.code)) return;
    if (event.target instanceof HTMLButtonElement && ['Space', 'Enter'].includes(event.code)) return;
    event.preventDefault();
    held.add(event.code);
    if (!event.repeat) handlers.key(event.code);
  });
  window.addEventListener('keyup', event => held.delete(event.code));
  window.addEventListener('blur', () => held.clear());

  function pointedStation(event) {
    const box = canvas.getBoundingClientRect();
    return stationAt((event.clientX - box.left) * canvas.width / box.width,
      (event.clientY - box.top) * canvas.height / box.height);
  }

  canvas.addEventListener('pointermove', event => {
    const station = pointedStation(event);
    canvas.style.cursor = station ? 'pointer' : '';
    handlers.hover(station);
  });
  canvas.addEventListener('pointerleave', () => handlers.hover(null));
  canvas.addEventListener('click', event => {
    const station = pointedStation(event);
    if (station) handlers.click(station);
  });

  const pressed = codes => Number(codes.some(code => held.has(code)));
  return {
    read: () => ({ x: pressed(right) - pressed(left), y: pressed(down) - pressed(up), use: pressed(use) }),
    clear: () => held.clear(),
  };
}
