// Draws the service HUD and ticket rail, and renders the game menus.
import { focusedTicket, recipes, ticketCapacity, vipSeconds } from './orders.js';
import {
  comboMultiplier, readShiftClock, serviceWave, serviceWaves, shiftLength, shiftStars,
} from './shift.js';
import { ingredients } from './stations.js';
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

  drawShiftTimer(ctx, state.elapsed);

  panel(ctx, 1036, 15, 224, 69, 9, '#213e33', '#49675a');
  oval(ctx, 1058, 37, 11, 11, '#eeb667', '#ffdb8a');
  label(ctx, '$', 1058, 38, 14, '#5e3928', { align: 'center' });
  label(ctx, String(state.coins), 1075, 37, 25, palette.light);
  label(ctx, `${state.served} served`, 1246, 37, 16, '#cbdbc3', { align: 'right' });
  label(ctx, `×${comboMultiplier(state.combo)} TIPS`, 1050, 66, 20, palette.gold);
  label(ctx, `${state.combo} streak`, 1246, 66, 16, palette.light, { align: 'right' });

  drawOrderBoard(ctx, state);
}

function drawShiftTimer(ctx, elapsed) {
  const remaining = Math.max(0, shiftLength - elapsed);
  const urgent = remaining < 30;
  const color = urgent ? '#ff9b59' : '#ffda8b';
  panel(ctx, 799, 11, 225, 74, 10, urgent ? '#5f3329' : '#2f3c2e', urgent ? '#e98352' : '#a78550', 2);
  const x = 841;
  const y = 48;
  oval(ctx, x, y, 25, 25, '#1e2c26', urgent ? '#90533d' : '#637358', 6);
  if (remaining > 0) {
    const start = -Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x, y, 25, start, start + 2 * Math.PI * remaining / shiftLength);
    ctx.strokeStyle = color;
    ctx.lineWidth = urgent ? 7 + Math.sin(elapsed * 10) : 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  const angle = -Math.PI / 2 + 2 * Math.PI * (elapsed % 60) / 60;
  stroke(ctx, color, 2.5, [[x, y], [x + Math.cos(angle) * 14, y + Math.sin(angle) * 14]]);
  oval(ctx, x, y, 2.7, 2.7, color);
  label(ctx, 'SHIFT TIMER', 945, 29, 17, color, { align: 'center' });
  label(ctx, readShiftClock(elapsed), 945, 59, 44, '#fff0d7', { align: 'center', face: 'monospace' });
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

export function renderScreen(element, state) {
  element.hidden = state.screen === 'play';
  if (element.hidden) return;
  const screens = {
    title: titleScreen,
    recipes: recipeBook,
    results: () => resultsScreen(state),
    pause: () => `<div class="sheet pause-sheet">
      <p class="kicker">LANTERN &amp; LADLE</p><h1>Service paused</h1>
      <button class="primary" data-command="close">Resume <kbd>P</kbd></button>
      <button class="quiet" data-command="recipes">Tonight’s menu <kbd>R</kbd></button>
    </div>`,
  };
  element.innerHTML = screens[state.screen]();
  for (const canvas of element.querySelectorAll('[data-dish]')) {
    const recipe = recipes.find(item => item.id === canvas.dataset.dish);
    drawDish(canvas.getContext('2d'), recipe.layers, canvas.width / 2, canvas.height * .46, canvas.width / 120, recipe.color, recipe.shape);
  }
  for (const canvas of element.querySelectorAll('[data-food]')) {
    drawIngredient(canvas.getContext('2d'), canvas.dataset.food, canvas.width / 2, canvas.height / 2, 1.52, 'ready');
  }
}

function recipeBook() {
  const foods = Object.entries(ingredients);
  return `<div class="sheet book-sheet">
    <header class="sheet-header">
      <div><p class="book-label">Recipe Book</p><h1>${foods.length} ingredients → ${recipes.length} dishes</h1></div>
      <button class="quiet" data-command="close">Close <kbd>R</kbd></button>
    </header>
    <table class="recipe-matrix" aria-label="Ingredients used in each dish">
      <thead>
        <tr>
          <th scope="col" class="dish-column">Dish</th>
          ${foods.map(([id, food]) => `<th scope="col" title="${ingredientPrepLabel[food.route]}">
            <canvas width="106" height="65" data-food="${id}" aria-hidden="true"></canvas>
            <span>${food.name}</span>
          </th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${recipes.map(recipe => `<tr class="recipe-row">
          <th scope="row">
            <div class="recipe-dish">
              <canvas width="104" height="64" data-dish="${recipe.id}" style="--recipe-color:${recipe.color}" aria-hidden="true"></canvas>
              <strong>${recipe.name}</strong>
            </div>
          </th>
          ${foods.map(([id, food]) => {
            const step = recipe.layers.indexOf(id) + 1;
            return step
              ? `<td><span class="recipe-dot" style="--ingredient-color:${food.hue}" role="img" aria-label="Assembly step ${step}">${step}</span></td>`
              : '<td></td>';
          }).join('')}
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function titleScreen() {
  return `<div class="sheet title-sheet">
    <div class="title-copy">
      <p class="kicker">A NIGHT MARKET COOKING GAME</p>
      <h1>Lantern<br><i>&amp; Ladle</i></h1>
      <p>Three minutes of dinner service. Chop crisp toppings, mind the simmer, and clear the order rail before the lanterns go out.</p>
      <button class="primary" data-command="start">Open the stall <kbd>↵</kbd></button>
      <button class="quiet" data-command="recipes">Tonight’s menu <kbd>R</kbd></button>
    </div>
    <div class="title-side">
      <canvas class="title-dish" width="455" height="320" data-dish="garden" aria-hidden="true"></canvas>
      <div class="controls-card">
        <p><b>Walk</b><span>WASD / Arrows</span></p>
        <p><b>Use / Hold to chop</b><span>E / Space</span></p>
        <p><b>Walk &amp; use</b><span>Click a station</span></p>
      </div>
    </div>
  </div>`;
}

function resultsScreen(state) {
  const stars = shiftStars(state);
  const ranks = ['Quiet closing', 'First plate out', 'Finding your feet', 'Dinner delivered', 'Market favorite', 'Night market legend'];
  const waveMax = Math.max(1, ...state.servedByWave);
  return `<div class="sheet results-sheet">
    <h1>Shift Results</h1>
    <div class="result-overview">
      <div class="result-rating">
        <div class="stars" role="img" aria-label="${stars} out of 5 stars">
          ${Array.from({ length: 5 }, (_, index) => `<span aria-hidden="true" class="${index < stars ? 'earned' : ''}">★</span>`).join('')}
        </div>
        <p class="result-rank">${ranks[stars]}</p>
      </div>
      <section class="wave-chart" aria-label="Dishes served per wave">
        <h2>Dishes per wave</h2>
        <ul>
          ${serviceWaves.map((wave, index) => `<li>
            <span>${wave.name}</span>
            <div class="wave-track" aria-hidden="true"><i style="width:${100 * state.servedByWave[index] / waveMax}%;background:${wave.color}"></i></div>
            <strong>${state.servedByWave[index]}</strong>
          </li>`).join('')}
        </ul>
      </section>
    </div>
    <div class="receipt">
      <div><strong>${state.served}</strong><span>Dishes served</span></div>
      <div><strong>${state.tips}</strong><span>Tips</span></div>
      <div><strong>${state.bestCombo}</strong><span>Best combo</span></div>
      <div><strong>×${comboMultiplier(state.bestCombo)}</strong><span>Best multiplier</span></div>
    </div>
    <p class="receipt-details"><b>Coins earned</b> ${state.coins} <span>◆</span> <b>Expired tickets</b> ${state.missed}</p>
    <button class="primary" data-command="start">Open again <kbd>↵</kbd></button>
  </div>`;
}

const ingredientPrepLabel = { pour: 'Pour', cook: 'Cook', chop: 'Chop', both: 'Chop + cook' };
