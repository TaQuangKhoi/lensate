import type { Recipe } from '@/src/domain/entities/recipe';

export type LensateMessage =
  | { type: 'lensate/toggle-origin'; origin: string; enabled: boolean }
  | { type: 'lensate/set-active-recipe'; recipeName: string }
  | { type: 'lensate/update-recipes'; recipes: Recipe[] }
  | { type: 'lensate/refresh' };

export async function sendLensateMessage(message: LensateMessage): Promise<void> {
  await browser.runtime.sendMessage(message);
}
