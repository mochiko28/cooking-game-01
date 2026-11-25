// Defines the pantry and which prep stages each ingredient requires.
export const ingredients = {
  broth: { name: 'Broth', route: 'pour', hue: '#e69243' },
  noodles: { name: 'Noodles', route: 'cook', hue: '#f4c766' },
  greens: { name: 'Greens', route: 'chop', hue: '#83bb69' },
  egg: { name: 'Egg', route: 'cook', hue: '#f9dfab' },
  tofu: { name: 'Tofu', route: 'chop', hue: '#eac695' },
  shrimp: { name: 'Shrimp', route: 'cook', hue: '#f5846e' },
  shrooms: { name: 'Mushrooms', route: 'both', hue: '#d0ab83' },
};

export function pickIngredient(id) {
  return { id, stage: ingredients[id].route === 'pour' ? 'ready' : 'raw' };
}

export function needsChopping(food) {
  return food?.stage === 'raw' && ['chop', 'both'].includes(ingredients[food.id].route);
}

export function needsCooking(food) {
  return food && ((food.stage === 'raw' && ingredients[food.id].route === 'cook')
    || (food.stage === 'chopped' && ingredients[food.id].route === 'both'));
}
