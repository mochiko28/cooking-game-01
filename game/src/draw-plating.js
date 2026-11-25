// Shows the assembly checklist, plated dishes, and the lit serving window.
import { label, oval, panel, stroke } from './canvas-ink.js';
import { drawDish } from './draw-dish.js';
import { drawSteam } from './draw-steam.js';
import { ingredients } from './ingredients.js';
import { focusedTicket } from './order-board.js';
import { matchingRecipes } from './recipes.js';

export function drawPlating(ctx, state) {
  const { layers, queuedPlate } = state;
  const choices = matchingRecipes(layers);
  const focus = focusedTicket(state)?.recipe;
  const recipe = choices.includes(focus) ? focus : choices.find(option => state.orders.some(ticket => ticket.recipe === option)) ?? choices[0];
  const resting = queuedPlate && !layers.length;
  panel(ctx, 594, 620, 150, 105, 7, '#597c6b', '#42594c');
  for (let y = 626; y < 724; y += 10) stroke(ctx, '#b9d1ac55', 1.2, [[600, y], [738, y]]);
  const bounce = Math.max(0, 1 - (state.elapsed - state.platePop) * 7) * .13;
  drawDish(ctx, resting ? queuedPlate.layers : layers, 667, 667, 1.18 + bounce, resting ? queuedPlate.color : recipe.color, resting ? queuedPlate.shape : recipe.shape);
  const checklist = resting ? queuedPlate : recipe;
  label(ctx, resting ? 'ON TRAY' : layers.length ? 'DISH IN PROGRESS' : 'NEXT DISH', 756, 629, 17, '#3b2c23');
  checklist.layers.forEach((id, i) => {
    const done = resting || i < layers.length;
    const next = !resting && i === layers.length;
    if (next) panel(ctx, 751, 640 + i * 20, 174, 20, 4, '#ffe5ae');
    label(ctx, done ? '✓' : next ? '›' : '·', 759, 650 + i * 20, 20, done ? '#254f39' : '#6f452e');
    label(ctx, ingredients[id].name, 784, 650 + i * 20, 18, '#302d23');
    if (next) label(ctx, 'NEXT', 918, 650 + i * 20, 11, '#78502e', { align: 'right' });
  });
}

export function drawPass(ctx, state) {
  panel(ctx, 954, 620, 274, 104, 7, '#6e3f31', '#a9754f');
  for (let y = 627; y < 721; y += 15) stroke(ctx, '#cc88534d', 1.5, [[962, y], [1220, y]]);
  oval(ctx, 1026, 667, 68, 43, null, '#b37e56');
  if (!state.ready) {
    label(ctx, 'WAITING', 1209, 663, 21, '#ffe0b2', { align: 'right' });
    return;
  }

  const glow = ctx.createRadialGradient(1025, 664, 10, 1025, 664, 88);
  glow.addColorStop(0, '#ffce7ded');
  glow.addColorStop(1, '#ffc45a00');
  oval(ctx, 1025, 666, 79, 50, glow);
  drawDish(ctx, state.ready.layers, 1026, 661, 1.16, state.ready.color, state.ready.shape);
  drawSteam(ctx, 1026, 651, state.elapsed);
  panel(ctx, 1100, 639, 111, 43, 6, '#ffcd69', '#fff0ae', 2);
  label(ctx, 'READY', 1155, 661, 25, '#382b20', { align: 'center' });
  label(ctx, state.ready.name, 1155, 702, 17, '#ffe5b7', { align: 'center' });
}
