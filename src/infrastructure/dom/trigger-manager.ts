import type { Recipe } from '@/src/domain/entities/recipe';

export class TriggerManager {
  shouldRunOnLoad(recipe: Recipe): boolean {
    return recipe.trigger === 'on_load';
  }

  shouldRunOnScroll(recipe: Recipe): boolean {
    return recipe.trigger === 'on_scroll';
  }

  shouldRunOnButton(recipe: Recipe): boolean {
    return recipe.trigger === 'on_button';
  }
}
