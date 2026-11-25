// Shows the assembly checklist, plated dishes, and the lit serving window.
import { label, oval, panel, stroke } from './canvas-ink.js';
import { drawDish } from './draw-dish.js';
import { drawKitchenSign } from './draw-labels.js';
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
  panel(ctx, 592, 619, 174, 109, 7, '#41665a', '#31493d');
  for (let y = 626; y < 724; y += 10) stroke(ctx, '#b9d1ac33', 1.2, [[600, y], [758, y]]);
  const bounce = Math.max(0, 1 - (state.elapsed - state.platePop) * 7) * .13;
  drawDish(ctx, resting ? queuedPlate.layers : layers, 679, 666, 1.49 + bounce, resting ? queuedPlate.color : recipe.color, resting ? queuedPlate.shape : recipe.shape);
  const checklist = resting ? queuedPlate : recipe;
  drawKitchenSign(ctx, resting ? 'ON TRAY' : layers.length ? 'DISH IN PROGRESS' : 'NEXT DISH',
    772, 618, 153, 22, { size: 14 });
  checklist.layers.forEach((id, i) => {
    const done = resting || i < layers.length;
    const next = !resting && i === layers.length;
    if (next) panel(ctx, 773, 644 + i * 19, 151, 19, 4, '#ffe5ae');
    label(ctx, done ? '✓' : next ? '›' : '·', 781, 653 + i * 19, 19, done ? '#254f39' : '#6f452e');
    label(ctx, ingredients[id].name, 797, 653 + i * 19, 16, '#302d23');
    if (next) label(ctx, 'NEXT', 918, 653 + i * 19, 10, '#78502e', { align: 'right' });
  });
}

export function drawPass(ctx, state) {
  panel(ctx, 954, 620, 274, 104, 7, '#6e3f31', '#a9754f');
  for (let y = 627; y < 721; y += 15) stroke(ctx, '#cc88534d', 1.5, [[962, y], [1220, y]]);
  oval(ctx, 1039, 667, 78, 44, null, '#b37e56');
  if (!state.ready) {
    drawKitchenSign(ctx, 'Waiting', 1121, 645, 95, 33, { size: 16 });
    return;
  }

  drawReadyHalo(ctx, 1039, 669);
  drawDish(ctx, state.ready.layers, 1039, 663, 1.46, state.ready.color, state.ready.shape);
  drawSteam(ctx, 1039, 653, state.elapsed);
  drawReadySparkles(ctx, 1039, 669, state.elapsed);
  drawKitchenSign(ctx, 'Ready', 1125, 642, 92, 34, { size: 22 });
  label(ctx, state.ready.name, 1171, 698, 16, '#ffe5b7', { align: 'center' });
}

function drawReadyHalo(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, .59);
  const glow = ctx.createRadialGradient(0, 0, 55, 0, 0, 85);
  glow.addColorStop(0, '#ffbb6800');
  glow.addColorStop(.7, '#ffbe5a85');
  glow.addColorStop(1, '#ffc45a00');
  oval(ctx, 0, 0, 85, 85, glow);
  oval(ctx, 0, 0, 80, 80, null, '#ffd281', 2.6);
  ctx.restore();
}

function drawReadySparkles(ctx, x, y, elapsed) {
  for (const [dx, dy, size, phase] of [[-75, -25, 8, 1], [-58, 33, 5, 3], [68, -31, 7, 5], [75, 24, 6, 6]]) {
    ctx.save();
    ctx.translate(x + dx, y + dy);
    ctx.globalAlpha = .8 + .2 * Math.sin(elapsed * 4 + phase);
    ctx.fillStyle = '#fff1b4';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(1, -1, size, 0);
    ctx.quadraticCurveTo(1, 1, 0, size);
    ctx.quadraticCurveTo(-1, 1, -size, 0);
    ctx.quadraticCurveTo(-1, -1, 0, -size);
    ctx.fill();
    ctx.restore();
  }
}
