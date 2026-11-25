// Renders the title, recipe book, pause menu, and shift results.
import { comboBonusForSharedPrep, recipes } from './orders.js';
import { comboMultiplier, serviceWaves, shiftStars } from './shift.js';
import { ingredients } from './stations.js';
import { drawDish, drawIngredient } from './paint.js';

export function renderScreen(element, state) {
  element.hidden = state.screen === 'play';
  if (element.hidden) return;
  const screens = {
    title: titleScreen,
    recipes: () => recipeBook(state.shot === 'recipes'),
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
    drawIngredient(canvas.getContext('2d'), canvas.dataset.food, canvas.width / 2, canvas.height / 2, 2.4, 'ready');
  }
}

function recipeBook(staged) {
  const first = recipes.find(recipe => recipe.id === 'garden');
  const second = recipes.find(recipe => recipe.id === 'tide');
  const shared = 'greens';
  const multiplier = comboBonusForSharedPrep(first, second);
  return `<div class="sheet book-sheet${staged ? ' recipe-showcase' : ''}">
    <header class="sheet-header">
      <h1>${Object.keys(ingredients).length} Ingredients → ${recipes.length} Dishes</h1>
      <button class="quiet" data-command="close">Close <kbd>R</kbd></button>
    </header>
    <ul class="recipe-grid">
      ${recipes.map(recipe => `<li class="recipe-card${recipe === first || recipe === second ? ' combo-card' : ''}" style="--recipe-color:${recipe.color}">
        <div class="recipe-title">
          <h2>${recipe.name}</h2>
          <canvas width="60" height="37" data-dish="${recipe.id}" aria-hidden="true"></canvas>
        </div>
        <ol class="recipe-layers" aria-label="Assembly order">
          ${recipe.layers.map(id => {
            const food = ingredients[id];
            const linked = (recipe === first || recipe === second) && id === shared;
            return `<li${linked ? ' class="shared-ingredient"' : ''} title="${food.name} · ${ingredientPrepLabel[food.route]}">
              <span class="visually-hidden">${food.name}, ${ingredientPrepLabel[food.route]}</span>
              <canvas width="148" height="130" data-food="${id}" aria-hidden="true"></canvas>
            </li>`;
          }).join('')}
        </ol>
      </li>`).join('')}
    </ul>
    <p class="recipe-combo">
      <span aria-hidden="true">Serve both back-to-back</span>
      <strong aria-hidden="true">Shared ${ingredients[shared].name} → ${multiplier}× tips</strong>
      <span class="visually-hidden">Serve ${first.name} and ${second.name} back-to-back. The second dish earns ${multiplier} times its tip because both use ${ingredients[shared].name.toLowerCase()}.</span>
    </p>
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
  const showcase = state.shot === 'results';
  const rating = `<div class="stars" role="img" aria-label="${stars} out of 5 stars">
    ${Array.from({ length: 5 }, (_, index) => `<span aria-hidden="true" class="${index < stars ? 'earned' : ''}">★</span>`).join('')}
  </div>`;
  const waveMax = Math.max(1, ...state.servedByWave);
  const waveChart = `<section class="wave-chart" aria-label="Dishes served per wave">
    ${showcase ? '' : '<h2>Dishes per wave</h2>'}
    <ul>
      ${serviceWaves.map((wave, index) => `<li style="--wave-color:${wave.color}">
        <span class="wave-name">${showcase ? wave.name.replace('Dinner ', '') : wave.name}</span>
        <span class="wave-cadence">Order every <b>${wave.interval}s</b></span>
        <strong>${state.servedByWave[index]}</strong>
        <div class="wave-track" aria-hidden="true"><i style="width:${100 * state.servedByWave[index] / waveMax}%"></i></div>
      </li>`).join('')}
    </ul>
  </section>`;
  const multiplier = comboMultiplier(state.bestCombo);
  if (showcase) {
    return `<div class="sheet results-sheet results-showcase">
      <header><h1>Shift Results</h1>${rating}</header>
      <div class="receipt">
        <div><strong>${state.served}</strong><span>Dishes</span></div>
        <div><strong>${state.tips}</strong><span>Tips</span></div>
        <div><strong>x${multiplier}</strong><span>Combo</span></div>
      </div>
      ${waveChart}
      <button class="primary" data-command="start">Play again</button>
    </div>`;
  }
  const ranks = ['Quiet closing', 'First plate out', 'Finding your feet', 'Dinner delivered', 'Market favorite', 'Night market legend'];
  return `<div class="sheet results-sheet">
    <h1>Shift Results</h1>
    <div class="result-overview">
      <div class="result-rating">
        ${rating}
        <p class="result-rank">${ranks[stars]}</p>
      </div>
      ${waveChart}
    </div>
    <div class="receipt">
      <div><strong>${state.served}</strong><span>Dishes served</span></div>
      <div><strong>${state.tips}</strong><span>Tips</span></div>
      <div><strong>${state.bestCombo}</strong><span>Best combo</span></div>
      <div><strong>×${multiplier}</strong><span>Best multiplier</span></div>
    </div>
    <p class="receipt-details"><b>Coins earned</b> ${state.coins} <span>◆</span> <b>Expired tickets</b> ${state.missed}</p>
    <button class="primary" data-command="start">Open again <kbd>↵</kbd></button>
  </div>`;
}

const ingredientPrepLabel = { pour: 'Pour', cook: 'Cook', chop: 'Chop', both: 'Chop + cook' };
