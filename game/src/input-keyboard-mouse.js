// Normalizes keyboard and pointer input into kitchen controls.
import { stationAt } from './kitchen-layout.js';

const up = ['KeyW', 'ArrowUp'];
const down = ['KeyS', 'ArrowDown'];
const left = ['KeyA', 'ArrowLeft'];
const right = ['KeyD', 'ArrowRight'];
const use = ['KeyE', 'Space'];
const actions = [...up, ...down, ...left, ...right, ...use, 'KeyR', 'KeyQ', 'KeyT', 'KeyP', 'KeyM', 'Escape', 'Enter'];

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

  function canvasPoint(event) {
    const box = canvas.getBoundingClientRect();
    return [(event.clientX - box.left) * canvas.width / box.width,
      (event.clientY - box.top) * canvas.height / box.height];
  }

  canvas.addEventListener('pointermove', event => {
    const [x, y] = canvasPoint(event);
    handlers.hover(stationAt(x, y), x, y);
  });
  canvas.addEventListener('pointerleave', () => {
    canvas.style.cursor = '';
    handlers.hover(null, -1, -1);
  });
  canvas.addEventListener('click', event => handlers.click(...canvasPoint(event)));

  const pressed = codes => Number(codes.some(code => held.has(code)));
  return {
    read: () => ({ x: pressed(right) - pressed(left), y: pressed(down) - pressed(up), use: pressed(use) }),
    clear: () => held.clear(),
  };
}
