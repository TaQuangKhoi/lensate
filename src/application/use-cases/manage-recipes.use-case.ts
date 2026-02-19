import type { Recipe } from '@/src/domain/entities/recipe';
import type { StoragePort } from '@/src/domain/ports/storage.port';
import { recipeSchema } from '@/src/domain/validation/recipe.schema';
import { STORAGE_KEYS } from '@/src/shared/constants/defaults';
import { RecipeValidationError } from '@/src/shared/errors/lensate-error';

export class ManageRecipesUseCase {
  constructor(private readonly storage: StoragePort) {}

  async list(): Promise<Recipe[]> {
    return (await this.storage.get<Recipe[]>(STORAGE_KEYS.recipes)) ?? [];
  }

  async saveAll(recipes: Recipe[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.recipes, recipes);
  }

  parseRecipe(jsonText: string): Recipe {
    let raw: unknown;
    try {
      raw = JSON.parse(jsonText);
    } catch {
      throw new RecipeValidationError('Recipe JSON is invalid.');
    }
    const parsed = recipeSchema.safeParse(raw);
    if (!parsed.success) {
      throw new RecipeValidationError(parsed.error.issues.map((issue) => issue.message).join('\n'));
    }
    return parsed.data;
  }
}
