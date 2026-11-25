// Draws the service status and order rail above the kitchen, and handles ticket hit testing.
import { comboBonusForSharedPrep, focusedTicket, ticketCapacity, vipSeconds } from './orders.js';
import { comboMultiplier, readShiftClock, serviceWave, serviceWaves, shiftLength } from './shift.js';
import { ingredients } from './stations.js';
import { platingRecipe } from './worktops.js';
import { drawDish, drawIngredient, label, meter, oval, palette, panel, stroke } from './paint.js';

export function drawServiceHud(ctx, state) {
  const wave = serviceWave(state.elapsed);
  const waveName = wave.name.toUpperCase();
  const waveIndex = serviceWaves.indexOf(wave);
  drawStallLantern(ctx, 57, 47);
  label(ctx, 'LANTERN & LADLE', 105, 42, 43, palette.light, { face: 'Georgia, serif' });
  label(ctx, 'NIGHT MARKET KITCHEN', 108, 71, 15, '#b9ceba');

  const rushCover = state.shot === 'cover';
  panel(ctx, 564, 15, 223, 69, 9, rushCover ? '#5c3428' : '#213e33', rushCover ? '#d88f52' : '#49675a');
  label(ctx, rushCover ? `${waveName} ${waveIndex + 1}/${serviceWaves.length}` : waveName, 675, 36, 24, wave.color, { align: 'center' });
  if (rushCover) {
    const level = 4 + state.coverMotion / 1.8;
    for (let i = 0; i < 6; i++) {
      const height = 8 + i * 3;
      panel(ctx, 579 + i * 33, 73 - height, 27, height, 3, '#734a36');
      const fill = height * Math.max(0, Math.min(1, level - i));
      if (fill > 0) panel(ctx, 579 + i * 33, 73 - fill, 27, fill, 2, i < 3 ? '#ffd181' : '#ff9b63');
    }
  } else {
    for (let i = 0; i < serviceWaves.length; i++) {
      const current = serviceWaves[i].start;
      const next = serviceWaves[i + 1]?.start ?? shiftLength;
      meter(ctx, 579 + 67 * i, 59, 60, 9, (state.elapsed - current) / (next - current), wave.color, '#4b6254');
    }
  }

  drawShiftTimer(ctx, state.elapsed, rushCover ? state.coverMotion : null);

  panel(ctx, 1036, 15, 224, 69, 9, '#213e33', '#49675a');
  oval(ctx, 1058, 37, 11, 11, '#eeb667', '#ffdb8a');
  label(ctx, '$', 1058, 38, 14, '#5e3928', { align: 'center' });
  label(ctx, String(state.coins), 1075, 37, 25, palette.light);
  label(ctx, `${state.served} served`, 1246, 37, rushCover ? 22 : 16, '#cbdbc3', { align: 'right' });
  label(ctx, `×${comboMultiplier(state.combo)} TIPS`, 1050, 66, 20, palette.gold);
  label(ctx, `${state.combo} streak`, 1246, 66, rushCover ? 22 : 16, palette.light, { align: 'right' });

  drawOrderBoard(ctx, state);
}

function drawShiftTimer(ctx, elapsed, coverMotion) {
  const cover = coverMotion !== null;
  elapsed += coverMotion ?? 0;
  const remaining = Math.max(0, shiftLength - elapsed);
  const urgent = cover || remaining < 30;
  const color = urgent ? '#ff9b59' : '#ffda8b';
  const pulse = (1 + Math.cos((coverMotion ?? 0) * 2 * Math.PI)) / 2;
  panel(ctx, 799, 11, 225, 74, 10, urgent ? '#5f3329' : '#2f3c2e', urgent ? '#e98352' : '#a78550', 2);
  const x = 841;
  const y = 48;
  oval(ctx, x, y, 25, 25, '#1e2c26', urgent ? '#90533d' : '#637358', 6);
  if (remaining > 0) {
    const start = -Math.PI / 2;
    const end = start + 2 * Math.PI * remaining / shiftLength;
    ctx.save();
    if (cover) {
      ctx.shadowColor = '#ff772f';
      ctx.shadowBlur = 9 + pulse * 13;
    }
    ctx.beginPath();
    ctx.arc(x, y, 25, start, end);
    ctx.strokeStyle = color;
    ctx.lineWidth = cover ? 8 : urgent ? 7 + Math.sin(elapsed * 10) : 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    if (cover) oval(ctx, x + Math.cos(end) * 25, y + Math.sin(end) * 25, 4.5, 4.5, '#ffe4a1');
    ctx.restore();
  }
  const angle = -Math.PI / 2 + 2 * Math.PI * (elapsed % 60) / 60;
  stroke(ctx, color, 2.5, [[x, y], [x + Math.cos(angle) * 14, y + Math.sin(angle) * 14]]);
  oval(ctx, x, y, 2.7, 2.7, color);
  label(ctx, 'SHIFT TIMER', cover ? 880 : 945, 29, cover ? 19 : 17, color, { align: cover ? 'left' : 'center' });
  label(ctx, readShiftClock(elapsed), cover ? 873 : 945, 59, cover ? 37 : 44, '#fff0d7', { align: cover ? 'left' : 'center', face: 'monospace' });
  if (cover) {
    ctx.save();
    ctx.globalAlpha = .78 + pulse * .22;
    label(ctx, '-0:01', 1015, 64, 19, '#ffba85', { align: 'right', face: 'monospace' });
    ctx.restore();
  }
}

function drawStallLantern(ctx, x, y) {
  const light = ctx.createRadialGradient(x, y, 7, x, y, 43);
  light.addColorStop(0, '#ffc15d7a');
  light.addColorStop(1, '#ffbd5900');
  oval(ctx, x, y, 42, 39, light);
  stroke(ctx, '#edb56e', 3, [[x, y - 29], [x, y + 27]]);
  panel(ctx, x - 24, y - 19, 48, 37, 14, '#d95839', '#ffc882', 2);
  oval(ctx, x, y, 12, 18, null, '#ffad66', 2);
  stroke(ctx, '#ffc57a', 2, [[x - 22, y], [x + 22, y]]);
  stroke(ctx, '#ec9b61', 2, [[x - 6, y + 25], [x + 6, y + 25]]);
}

function drawOrderBoard(ctx, state) {
  panel(ctx, 20, 92, 1240, 112, 12, '#203930', '#725d47', 2);
  const focus = focusedTicket(state);
  const cover = state.shot === 'cover';
  const link = state.screen === 'play' && state.layers.length && state.orders.length >= 2 ? sharedPrepLink(state) : null;
  label(ctx, 'ORDER BOARD', 37, 106, cover ? 24 : 21, palette.light);
  if (!cover && focus && state.showRoute) {
    oval(ctx, 218, 106, 4, 4, palette.gold);
    label(ctx, `NEXT ROUTE  /  ${focus.recipe.name.toUpperCase()}`, 230, 106, 15, palette.gold);
  }
  if (!link) {
    label(ctx, `${state.orders.length} / ${ticketCapacity} TICKETS`, cover ? 1092 : 1242, 106, cover ? 19 : 16, '#ced8bd', { align: 'right' });
  }
  for (let i = 0; i < ticketCapacity; i++) {
    const x = ticketRailX + ticketSpacing * i;
    const ticket = state.orders[i];
    if (cover && ticket && i === ticketCapacity - 1) drawIncoming(ctx, ticket, x, state.coverMotion);
    else if (ticket) drawTicket(ctx, ticket, x, ticket === focus, cover ? state.coverMotion : null);
    else panel(ctx, x, ticketY, ticketWidth, ticketHeight, 7, '#19322a', '#416253');
  }
  if (link) drawSharedPrepLink(ctx, link, cover);
}

function sharedPrepLink(state) {
  const recipe = platingRecipe(state);
  const { orders } = state;
  const active = orders.findIndex(ticket => ticket.recipe === recipe && ticket.left > 0);
  // Prefer the upcoming layers so the label can point to the prep shown at the counter.
  const layers = [...recipe.layers.slice(state.layers.length), ...state.layers];
  for (const ingredient of layers) {
    const matching = orders.flatMap((ticket, index) => ticket.left > 0 && ticket.recipe.layers.includes(ingredient) ? [index] : []);
    const first = matching.includes(active) ? active : matching[0];
    if (first === undefined) continue;
    for (const second of matching) {
      const multiplier = comboBonusForSharedPrep(orders[first].recipe, orders[second].recipe);
      if (multiplier > 1) return { first, second, ingredient, multiplier };
    }
  }
  return null;
}

function drawSharedPrepLink(ctx, { first, second, ingredient, multiplier }, cover) {
  const title = `SHARED ${ingredients[ingredient].name.toUpperCase()} → ${multiplier}× TIPS`;
  ctx.font = '800 23px system-ui';
  const width = Math.ceil(ctx.measureText(title).width) + 26;
  const start = ticketRailX + Math.min(first, second) * ticketSpacing + ticketDishX;
  const end = ticketRailX + Math.max(first, second) * ticketSpacing + ticketDishX;
  const badgeX = Math.min((cover ? 1108 : 1242) - width, Math.max(cover ? 218 : 575, (start + end - width) / 2));
  const badgeCenter = badgeX + width / 2;
  const railY = ticketY - 3;
  const bracket = [[start, ticketY + 12], [start, railY], [end, railY], [end, ticketY + 12]];
  stroke(ctx, palette.night, 9, bracket);
  stroke(ctx, palette.mint, 5, bracket);
  if (badgeCenter > end) stroke(ctx, palette.mint, 5, [[end, railY], [badgeCenter, railY]]);
  panel(ctx, badgeX, 92, width, 24, 6, '#e3fa99');
  label(ctx, title, badgeCenter, 104, 23, palette.ink, { align: 'center' });
}

function drawIncoming(ctx, ticket, x, motion) {
  const remaining = 1 - Math.min(1, motion / .56);
  const offset = Math.round((ticketWidth + 4) * remaining ** 3);
  panel(ctx, x, ticketY, ticketWidth, ticketHeight, 7, '#19322a', '#416253');
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, ticketY - 2, ticketWidth + 2, ticketHeight + 4);
  ctx.clip();
  drawTicket(ctx, ticket, x + offset, false, motion);
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
  const cover = motion !== null;
  const vip = ticket.vipLeft !== null;
  const activeBonus = vip && ticket.vipLeft > 0;
  const progress = Math.max(0, ticket.left - (motion === null ? 0 : motion * 4)) / ticket.patience;
  const urgent = motion !== null && activeBonus && progress <= .34;
  const flash = urgent && Math.cos(motion * Math.PI * 4) < 0;
  const color = activeBonus ? '#ffe0bc' : '#fff0d3';
  const outline = urgent ? '#f28b67' : focused ? '#ffba4e' : '#998264';
  panel(ctx, x, y, ticketWidth, ticketHeight, 6, color, outline, urgent || focused ? 4 : 1.5);
  panel(ctx, x + 7, y + 7, 63, 55, 6, ticket.recipe.color);
  drawDish(ctx, ticket.recipe.layers, x + ticketDishX, y + 34, .51, ticket.recipe.color, ticket.recipe.shape);
  label(ctx, ticket.recipe.name, x + 79, y + 20, motion === null ? 22 : vip ? 24 : 26, palette.ink);
  const iconSpacing = cover ? 57 : 38;
  ticket.recipe.layers.forEach((id, index) => {
    const iconX = x + 96 + index * iconSpacing;
    if (!cover && index) label(ctx, '›', iconX - 20, y + 47, 17, '#8d5c40');
    drawIngredient(ctx, id, iconX, y + 46, cover ? .72 : .46, 'ready');
  });
  const barWidth = ticketWidth - 14;
  const fill = motion === null ? patienceColor(progress) : urgent ? (flash ? '#ff4b3d' : '#ff6254')
    : progress < .7 ? '#f3ac49' : '#90d496';
  const track = motion === null ? '#d2b797' : urgent ? '#843528' : '#465649';
  meter(ctx, x + 7, y + 62, barWidth, 12, progress, fill, track);
  if (motion !== null && progress > 0) {
    const tip = x + 3 + barWidth * progress;
    stroke(ctx, urgent ? '#ffcbab' : '#fff0bf', 3, [[tip, y + 65], [tip, y + 71]]);
  }
  if (urgent) {
    const markerX = x + 207 + Math.sin(motion * 34) * 3;
    oval(ctx, markerX, y + 48, 13, 13, '#b32e27');
    label(ctx, '!', markerX, y + 49, 22, '#fff0d7', { align: 'center' });
  }
  if (vip) {
    const time = Math.ceil(ticket.vipLeft - (motion ?? 0));
    const background = activeBonus ? (flash ? '#a83025' : '#963b2c') : '#6c5a4d';
    panel(ctx, x + 229, y + 7, 56, 54, 5, background);
    label(ctx, 'VIP', x + 257, y + 23, motion === null ? 17 : 19, palette.light, { align: 'center' });
    label(ctx, activeBonus ? `${time}s` : '—', x + 257, y + 45, motion === null ? 18 : 21, '#ffd28e', { align: 'center' });
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
const ticketDishX = 38;
