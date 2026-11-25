// Paints the cook sprite, walking bounce, and carried ingredient.
import { oval, panel, stroke } from './draw-primitives.js';
import { drawIngredient } from './draw-food.js';

export function drawCook(ctx, state) {
  const cook = state.cook;
  const bob = cook.moving ? Math.sin(state.elapsed * 25) * 3 : 0;
  ctx.save();
  ctx.translate(cook.x, cook.y - 5 + bob);
  ctx.scale(cook.facing * 1.43, 1.43);
  if (state.shot === 'cover') {
    stroke(ctx, '#ffdf968f', 2.5, [[-59, 5], [-44, 1]]);
    stroke(ctx, '#ffedbfcc', 3, [[-49, -5], [-28, -9]]);
    stroke(ctx, '#ffedbf88', 2, [[-42, 13], [-31, 10]]);
  }
  oval(ctx, 0, 21, 27, 12, '#0c261f70');
  oval(ctx, -11, 18, 7, 8, '#26352c');
  oval(ctx, 10, 17, 7, 8, '#26352c');
  oval(ctx, 0, 7, 19, 20, '#bc563e', '#4d3d2d', 2);
  panel(ctx, -9, 6, 19, 17, 4, '#ffdfac');
  oval(ctx, 19, 5, 7, 10, '#d8925d', '#513d2c');
  oval(ctx, 0, -9, 17, 15, '#db9a63', '#593c2a');
  oval(ctx, -14, -23, 8, 8, '#fff0d5', '#b89675');
  oval(ctx, -1, -29, 13, 11, '#fff0d5', '#b89675');
  oval(ctx, 12, -24, 9, 8, '#fff0d5', '#b89675');
  panel(ctx, -15, -24, 31, 13, 4, '#fff0d5');
  stroke(ctx, '#4e3d31', 2, [[-12, -12], [14, -12]]);
  oval(ctx, 9, -6, 2.3, 2.3, '#483428');
  stroke(ctx, '#a65940', 1.8, [[9, 0], [12, 0]]);
  if (cook.hand) {
    oval(ctx, 38, 14, 27, 19, '#d8ae73', '#384439', 2);
    oval(ctx, 38, 8, 28, 16, '#fff0d2', '#466e57');
    oval(ctx, 38, 7, 23, 12, '#90714c');
    drawIngredient(ctx, cook.hand.id, 38, 5, .85, cook.hand.stage);
    oval(ctx, 17, 18, 7, 5, '#e3a773', '#67402d', 1.3);
  }
  ctx.restore();
}
