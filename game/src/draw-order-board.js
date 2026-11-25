// Draws the live order rail and maps ticket clicks to ticket numbers.
import { label, meter, oval, panel, palette } from './draw-primitives.js';
import { drawDish } from './draw-dish.js';
import { drawIngredient } from './draw-food.js';
import { focusedTicket, ticketCapacity } from './order-board.js';
import { vipSeconds } from './vip-tickets.js';

export function drawOrderBoard(ctx, state) {
  panel(ctx, 20, 92, 1240, 112, 12, '#203930', '#725d47', 2);
  label(ctx, 'ORDER BOARD', 37, 106, 21, palette.light);
  const focus = focusedTicket(state);
  if (focus && state.showRoute) {
    oval(ctx, 218, 106, 4, 4, palette.gold);
    label(ctx, `NEXT ROUTE  /  ${focus.recipe.name.toUpperCase()}`, 230, 106, 15, palette.gold);
  }
  const cover = state.shot === 'cover';
  label(ctx, `${state.orders.length} / ${ticketCapacity} TICKETS`, cover ? 1092 : 1242, 106, 16, '#ced8bd', { align: 'right' });
  for (let i = 0; i < ticketCapacity; i++) {
    const x = ticketRailX + ticketSpacing * i;
    const ticket = state.orders[i];
    if (cover && ticket && i === ticketCapacity - 1) drawIncoming(ctx, ticket, x, state.coverMotion);
    else if (ticket) drawTicket(ctx, ticket, x, ticket === focus, cover ? state.coverMotion : null);
    else panel(ctx, x, ticketY, ticketWidth, ticketHeight, 7, '#19322a', '#416253');
  }
}

function drawIncoming(ctx, ticket, x, motion) {
  const remaining = 1 - Math.min(1, motion / .5);
  const offset = Math.round(320 * remaining ** 3);
  panel(ctx, x, ticketY, ticketWidth, ticketHeight, 7, '#19322a', '#416253');
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, ticketY - 2, ticketWidth + 2, ticketHeight + 4);
  ctx.clip();
  drawTicket(ctx, ticket, x + offset, false);
  ctx.restore();
  const chipX = 1120 + Math.min(10, Math.round(offset * .23));
  panel(ctx, chipX, 95, 112, 20, 6, '#bc5038', '#ffd083', 1.5);
  label(ctx, '+1 ORDER', chipX + 56, 105, 17, '#fff1d1', { align: 'center' });
}

export function ticketAt(state, x, y) {
  if (y < ticketY || y > ticketY + ticketHeight || x < ticketRailX || (x - ticketRailX) % ticketSpacing > ticketWidth) return null;
  return state.orders[Math.floor((x - ticketRailX) / ticketSpacing)] ?? null;
}

function drawTicket(ctx, ticket, x, focused, motion = null) {
  const y = ticketY;
  const vip = ticket.vipLeft !== null;
  const activeBonus = vip && ticket.vipLeft > 0;
  const progress = ticket.left / ticket.patience;
  const urgent = motion !== null && activeBonus && progress <= .34;
  const flash = urgent && Math.cos(motion * Math.PI * 4) < 0;
  const color = activeBonus ? '#ffe0bc' : '#fff0d3';
  const outline = urgent ? '#f28b67' : focused ? '#ffba4e' : '#998264';
  panel(ctx, x, y, ticketWidth, ticketHeight, 6, color, outline, urgent || focused ? 4 : 1.5);
  panel(ctx, x + 7, y + 7, 63, 55, 6, ticket.recipe.color);
  drawDish(ctx, ticket.recipe.layers, x + 38, y + 34, .51, ticket.recipe.color, ticket.recipe.shape);
  label(ctx, ticket.recipe.name, x + 79, y + 20, 22, palette.ink);
  ticket.recipe.layers.forEach((id, index) => {
    if (index) label(ctx, '›', x + 76 + index * 38, y + 50, 17, '#8d5c40');
    drawIngredient(ctx, id, x + 96 + index * 38, y + 49, .46, 'ready');
  });
  meter(ctx, x + 7, y + 65, ticketWidth - 14, urgent ? 10 : 8, progress, flash ? '#ff4738' : patienceColor(progress), urgent ? '#a95e4e' : '#d2b797');
  if (urgent) {
    const markerX = x + 207 + Math.sin(motion * 34) * 3;
    oval(ctx, markerX, y + 48, 13, 13, '#b32e27');
    label(ctx, '!', markerX, y + 49, 22, '#fff0d7', { align: 'center' });
  }
  if (vip) {
    const time = Math.ceil(ticket.vipLeft);
    panel(ctx, x + 229, y + 7, 56, 54, 5, activeBonus ? '#963b2c' : '#6c5a4d');
    label(ctx, 'VIP', x + 257, y + 23, 17, palette.light, { align: 'center' });
    label(ctx, activeBonus ? `${time}s` : '—', x + 257, y + 45, 18, '#ffd28e', { align: 'center' });
    if (activeBonus) meter(ctx, x + 233, y + 55, 48, 3, ticket.vipLeft / vipSeconds, '#ffd28e', '#65342b');
  } else if (focused) {
    label(ctx, '◆', x + 275, y + 18, 17, '#88612c', { align: 'center' });
  }
}

function patienceColor(progress) {
  if (progress <= .34) return '#ce422e';
  if (progress <= .68) return '#b7721c';
  return '#3c8754';
}

const ticketRailX = 36;
const ticketY = 119;
const ticketSpacing = 304;
const ticketWidth = 292;
const ticketHeight = 79;
