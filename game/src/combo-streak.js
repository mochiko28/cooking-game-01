// Scores continuous service and applies a capped streak multiplier to tips.
export function comboMultiplier(streak) {
  return Math.min(3, 1 + Math.max(0, streak - 1) * .5);
}

export function recordService(state, ticket, vipBonus) {
  const freshness = Math.max(0, ticket.left / ticket.patience);
  state.combo++;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served++;
  const tip = Math.floor((4 + 16 * freshness + vipBonus) * comboMultiplier(state.combo));
  const coins = 26 + ticket.recipe.layers.length * 6 + tip;
  state.tips += tip;
  state.coins += coins;
  return coins;
}

export function shiftStars(state) {
  return [1, 3, 5, 7, 9].filter(goal => state.served >= goal).length;
}
