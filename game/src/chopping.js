// Tracks chopping progress and converts produce into its next prep stage.
import { ingredients, needsChopping } from './ingredients.js';
import { burst } from './particles.js';

export function chopIngredient(state) {
  const board = state.board;
  if (!board.food || board.cuts >= cutsNeeded) return;
  board.cuts++;
  board.mark = state.elapsed;
  burst(state, 144, 653, ingredients[board.food.id].hue);
  burst(state, 151, 647, '#fff2ab', 5);
  state.sound('chop');
  if (board.cuts === cutsNeeded) {
    board.food.stage = ingredients[board.food.id].route === 'both'
      ? 'chopped' : 'ready';
    state.sound('tick');
  }
}

export function useChopBoard(state) {
  const { board, cook } = state;
  if (cook.hand && !board.food && needsChopping(cook.hand)) {
    board.food = cook.hand;
    cook.hand = null;
    board.cuts = 0;
  }
  if (board.food && board.cuts < cutsNeeded) {
    chopIngredient(state);
  } else if (board.food && !cook.hand) {
    cook.hand = board.food;
    board.food = null;
    board.cuts = 0;
  } else {
    return 'Bring greens, tofu, or mushrooms to chop.';
  }
}

export function holdToChop(state) {
  if (state.elapsed - state.board.mark >= .24) chopIngredient(state);
}

const cutsNeeded = 4;
