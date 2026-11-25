// Defines the six dishes and matches an ordered prefix of plated layers.
export const recipes = [
  { id: 'garden', name: 'Jade Noodles', layers: ['broth', 'noodles', 'greens'], color: '#a4c581', shape: 'bowl' },
  { id: 'tide', name: 'Pink Tide', layers: ['noodles', 'shrimp', 'greens'], color: '#f28e7b', shape: 'plate' },
  { id: 'gold', name: 'Golden Egg', layers: ['noodles', 'egg'], color: '#ffd074', shape: 'plate' },
  { id: 'moon', name: 'Moon Broth', layers: ['broth', 'tofu', 'shrooms'], color: '#c5aedf', shape: 'bowl' },
  { id: 'harvest', name: 'Harvest Bowl', layers: ['noodles', 'tofu', 'shrooms', 'greens'], color: '#d3ae82', shape: 'bowl' },
  { id: 'ember', name: 'Ember Pot', layers: ['broth', 'shrimp', 'egg', 'greens'], color: '#ed9e63', shape: 'bowl' },
];

export function matchingRecipes(layers) {
  return recipes.filter(recipe => layers.length <= recipe.layers.length
    && layers.every((ingredient, index) => ingredient === recipe.layers[index]));
}
