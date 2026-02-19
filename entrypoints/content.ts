import { TextBatchingService } from '@/src/application/services/text-batching.service';
import { TranslationOrchestrator } from '@/src/application/services/translation-orchestrator';
import { ConfigureProviderUseCase } from '@/src/application/use-cases/configure-provider.use-case';
import { ManageAPIKeyUseCase } from '@/src/application/use-cases/manage-api-key.use-case';
import { ManageRecipesUseCase } from '@/src/application/use-cases/manage-recipes.use-case';
import { TranslatePageUseCase } from '@/src/application/use-cases/translate-page.use-case';
import type { Recipe } from '@/src/domain/entities/recipe';
import { DOMAdapter } from '@/src/infrastructure/dom/dom.adapter';
import { createProvider } from '@/src/infrastructure/ai-providers/provider.factory';
import { BrowserStorageAdapter } from '@/src/infrastructure/storage/browser-storage.adapter';
import { CacheAdapter } from '@/src/infrastructure/storage/cache.adapter';
import { WebCryptoAdapter } from '@/src/infrastructure/storage/web-crypto.adapter';
import { DEFAULT_RECIPE, STORAGE_KEYS } from '@/src/shared/constants/defaults';

function matchRecipe(url: string, recipe: Recipe): boolean {
  const pattern = recipe.url_pattern
    .replace(/[.+?^${}()|[\]\\-]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${pattern}$`).test(url);
}

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const storage = new BrowserStorageAdapter();
    const recipesUseCase = new ManageRecipesUseCase(storage);
    const providerUseCase = new ConfigureProviderUseCase(storage);
    const crypto = new WebCryptoAdapter(storage);
    const apiKeyUseCase = new ManageAPIKeyUseCase(storage, crypto);

    const origin = window.location.origin;
    const enabledByOrigin = (await storage.get<Record<string, boolean>>(STORAGE_KEYS.enabledByOrigin)) ?? {};
    if (enabledByOrigin[origin] === false) return;

    const recipes = await recipesUseCase.list();
    const activeRecipeName = await storage.get<string>(STORAGE_KEYS.activeRecipeName);
    const recipe =
      recipes.find((item) => item.name === activeRecipeName && matchRecipe(window.location.href, item)) ??
      recipes.find((item) => matchRecipe(window.location.href, item)) ??
      (matchRecipe(window.location.href, DEFAULT_RECIPE) ? DEFAULT_RECIPE : null);

    if (!recipe) return;

    const providerConfig = await providerUseCase.getConfig();
    const apiKey = await apiKeyUseCase.read();
    if (!apiKey) return;
    const translator = createProvider({ ...providerConfig, api_key: apiKey });

    const dom = new DOMAdapter(recipe.ignore);
    const cache = new CacheAdapter(storage);
    const translatePage = new TranslatePageUseCase(dom, translator, cache, new TextBatchingService());
    const orchestrator = new TranslationOrchestrator(translatePage, dom);

    await orchestrator.run(recipe, providerConfig.system_prompt ?? '');
  },
});
