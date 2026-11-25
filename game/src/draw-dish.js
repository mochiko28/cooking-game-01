// Builds plated dishes from illustrated layers, lacquered broth, and ceramic rims.
import { oval, stroke } from './canvas-ink.js';
import { drawIngredient } from './draw-food.js';

const placements = {
  noodles: [-6, 0, 1.03], greens: [22, -10, .62], egg: [17, 9, .70],
  tofu: [-20, 7, .67], shrimp: [-15, -8, .67], shrooms: [13, -6, .68],
};

function gloss(ctx, x, y, rx, ry, begin, end, color, width) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, begin, end);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function drawDish(ctx, layers, x, y, scale = 1, color = '#80bfa7', shape = 'bowl') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const depth = shape === 'bowl' ? 10 : 5;
  const soup = layers.includes('broth');
  oval(ctx, 1, 15, 55, 29, '#112b226b');
  const ceramic = ctx.createLinearGradient(-44, 0, 20, 42);
  ceramic.addColorStop(0, '#fff4d9');
  ceramic.addColorStop(.28, color);
  ceramic.addColorStop(1, '#32534b');
  oval(ctx, 0, depth, 53, 31, ceramic, '#283c33', 2.5);
  const rim = ctx.createLinearGradient(0, -28, 0, 29);
  rim.addColorStop(0, '#fff9e8');
  rim.addColorStop(.56, '#f3ddb4');
  rim.addColorStop(1, '#fff5d6');
  oval(ctx, 0, -1, 52, 29, rim, '#355a4d', 2.1);
  oval(ctx, 0, -1, 47, 25, null, color, 2);
  const fill = ctx.createLinearGradient(-17, -22, 13, 21);
  fill.addColorStop(0, soup ? '#8d371d' : '#baa47d');
  fill.addColorStop(.40, soup ? '#e08532' : '#f9e7c6');
  fill.addColorStop(1, soup ? '#ad511e' : '#dfbe93');
  oval(ctx, 0, -1, 43, 22, fill, soup ? '#8b4c2f' : '#c9ab80', 1.5);
  gloss(ctx, 0, -1, 50, 27, 3.42, 4.85, '#fffef2', 1.8);
  if (soup) {
    gloss(ctx, -1, -1, 38, 17, 2.66, 3.93, '#ffcf71', 2.1);
    gloss(ctx, 1, 0, 38, 17, .15, .92, '#f9af59', 1.7);
    for (const [dx, dy, size] of [[-28, 8, 3], [28, -5, 4], [33, -2, 2], [-9, 13, 2], [15, -14, 2]]) {
      oval(ctx, dx, dy, size, size * .46, '#f3b360', '#b86030', .7);
    }
  }
  for (const id of layers) {
    if (id === 'broth') continue;
    const [px, py, size] = placements[id];
    const solo = layers.length === 1;
    drawIngredient(ctx, id, solo ? 0 : px, solo ? 0 : py, size, 'ready');
  }
  if (layers.length > 1) {
    for (const [dx, dy, angle] of [[-26, 8, .4], [25, 8, -.4], [18, 13, -.2], [-15, -13, -.4], [-4, -11, .7], [31, 2, .2]]) {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(angle);
      oval(ctx, 0, 0, 3, 1.65, '#5b9b51', '#376442', .65);
      stroke(ctx, '#d4dc88', .7, [[-1.6, 0], [.2, -.5]]);
      ctx.restore();
    }
    for (const [dx, dy] of [[-13, 3], [4, -10], [10, 5], [-17, 9], [21, -5]]) oval(ctx, dx, dy, 1.4, .85, '#ffedb9');
  }
  ctx.restore();
}
