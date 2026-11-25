// Builds the title, recipe book, pause menu, and end-of-shift receipt.
import { recipes } from './recipes.js';
import { ingredients } from './ingredients.js';
import { drawDish } from './draw-dish.js';
import { drawIngredient } from './draw-food.js';
import { comboMultiplier, shiftStars } from './combo-streak.js';
import { serviceWaves } from './service-waves.js';

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
