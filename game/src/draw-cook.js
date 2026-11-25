// Paints the cook sprite, walking bounce, and carried ingredient.
import { oval, panel, stroke } from './canvas-ink.js';
import { drawIngredient } from './draw-food.js';

export function drawCook(ctx, state) {
  const cook = state.cook;
  const bob = cook.moving ? Math.sin(state.elapsed * 25) * 3 : 0;
  ctx.save();
  ctx.translate(cook.x, cook.y - 5 + bob);
  ctx.scale(cook.facing * 1.43, 1.43);
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
    oval(ctx, 36, 15, 25, 17, '#684b33');
    oval(ctx, 36, 10, 24, 17, '#fff0d2', '#466e57');
    drawIngredient(ctx, cook.hand.id, 36, 8, .75, cook.hand.stage);
    oval(ctx, 18, 15, 5, 4, '#e3a773', '#67402d', 1.3);
  }
  ctx.restore();
}
