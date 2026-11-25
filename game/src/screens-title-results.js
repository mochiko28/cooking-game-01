import { recipes } from './recipes.js';
import { ingredients } from './ingredients.js';
import { drawDish, drawIngredient } from './draw-food.js';
import { shiftStars } from './order-board.js';

const prepLabel = { pour: 'Pour', cook: 'Cook', chop: 'Chop', both: 'Chop + cook' };

function recipeBook() {
  return `<div class="sheet book-sheet">
    <header class="sheet-header">
      <div><p class="kicker">LANTERN &amp; LADLE</p><h1>Tonight’s menu</h1></div>
      <button class="quiet" data-command="close">Close <kbd>R</kbd></button>
    </header>
    <p class="menu-instructions">Follow each recipe from left to right. Prep every layer before you plate it.</p>
    <div class="recipe-list">
    ${recipes.map(recipe => `<article class="recipe-row" style="--recipe-color:${recipe.color}">
      <div class="recipe-title">
        <canvas width="120" height="80" data-dish="${recipe.id}" aria-hidden="true"></canvas>
        <h2>${recipe.name}</h2>
      </div>
      <ol class="steps">${recipe.layers.map(id => `<li>
        <canvas width="57" height="51" data-food="${id}" aria-hidden="true"></canvas>
        <span><b>${ingredients[id].name}</b><small>${prepLabel[ingredients[id].route]}</small></span>
      </li>`).join('')}</ol>
    </article>`).join('')}
    </div>
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
  return `<div class="sheet results-sheet">
    <p class="kicker">LANTERN &amp; LADLE · END OF SHIFT</p>
    <h1>${ranks[stars]}</h1>
    <div class="stars" role="img" aria-label="${stars} out of 5 stars">
      ${Array.from({ length: 5 }, (_, index) => `<span aria-hidden="true" class="${index < stars ? 'earned' : ''}">★</span>`).join('')}
    </div>
    <div class="receipt">
      <div><strong>${state.served}</strong><span>Dishes served</span></div>
      <div><strong>${state.coins}</strong><span>Coins earned</span></div>
      <div><strong>${state.tips}</strong><span>Tips included</span></div>
    </div>
    <p class="receipt-details"><b>Best streak</b> ×${state.bestCombo} <span>◆</span> <b>Expired tickets</b> ${state.missed}</p>
    <button class="primary" data-command="start">Open again <kbd>↵</kbd></button>
  </div>`;
}

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
    drawIngredient(canvas.getContext('2d'), canvas.dataset.food, 28, 26, .82, 'ready');
  }
}
