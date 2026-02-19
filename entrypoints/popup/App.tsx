import { useEffect, useState } from 'react';
import { ConfigureProviderUseCase } from '@/src/application/use-cases/configure-provider.use-case';
import { ManageAPIKeyUseCase } from '@/src/application/use-cases/manage-api-key.use-case';
import { ManageRecipesUseCase } from '@/src/application/use-cases/manage-recipes.use-case';
import type { AIProviderConfig } from '@/src/domain/entities/ai-provider-config';
import type { Recipe } from '@/src/domain/entities/recipe';
import { BrowserStorageAdapter } from '@/src/infrastructure/storage/browser-storage.adapter';
import { WebCryptoAdapter } from '@/src/infrastructure/storage/web-crypto.adapter';
import {
  DEFAULT_PROVIDER_CONFIG,
  DEFAULT_RECIPE,
  STORAGE_KEYS,
  SUPPORTED_PROVIDERS,
} from '@/src/shared/constants/defaults';
import { sendLensateMessage } from '@/src/shared/messaging/messages';

const storage = new BrowserStorageAdapter();
const recipesUseCase = new ManageRecipesUseCase(storage);
const providerUseCase = new ConfigureProviderUseCase(storage);
const apiKeyUseCase = new ManageAPIKeyUseCase(storage, new WebCryptoAdapter(storage));

function App() {
  const [enabled, setEnabled] = useState(true);
  const [provider, setProvider] = useState<AIProviderConfig>(DEFAULT_PROVIDER_CONFIG);
  const [apiKey, setApiKey] = useState('');
  const [recipeText, setRecipeText] = useState(JSON.stringify(DEFAULT_RECIPE, null, 2));
  const [status, setStatus] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const loadedProvider = await providerUseCase.getConfig();
      const loadedKey = await apiKeyUseCase.read();
      const recipes = await recipesUseCase.list();
      const tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
      const origin = tab?.url ? new URL(tab.url).origin : '';
      const enabledByOrigin =
        (await storage.get<Record<string, boolean>>(STORAGE_KEYS.enabledByOrigin)) ?? {};
      setEnabled(origin ? enabledByOrigin[origin] !== false : true);
      setProvider(loadedProvider);
      setApiKey(loadedKey);
      setRecipeText(JSON.stringify(recipes[0] ?? DEFAULT_RECIPE, null, 2));
    })();
  }, []);

  const saveProvider = async () => {
    await providerUseCase.setConfig(provider);
    if (apiKey.trim()) {
      await apiKeyUseCase.save(apiKey);
    }
    setStatus('Saved provider settings.');
    setSaved(true);
    setTimeout(() => setSaved(false), 700);
  };

  const importRecipe = async () => {
    const parsed = recipesUseCase.parseRecipe(recipeText);
    await recipesUseCase.saveAll([parsed]);
    await storage.set(STORAGE_KEYS.activeRecipeName, parsed.name);
    setStatus('Recipe imported.');
  };

  const toggleCurrentSite = async (nextEnabled: boolean) => {
    const tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
    if (!tab?.url) return;
    setEnabled(nextEnabled);
    await sendLensateMessage({
      type: 'lensate/toggle-origin',
      origin: new URL(tab.url).origin,
      enabled: nextEnabled,
    });
    setStatus(nextEnabled ? 'Enabled for this site.' : 'Disabled for this site.');
  };

  return (
    <main className="popup">
      <h1>Lensate</h1>

      <label className="field checkbox">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => void toggleCurrentSite(event.target.checked)}
        />
        Enable on current site
      </label>

      <label className="field">
        Provider
        <select
          value={provider.provider}
          onChange={(event) => {
            const nextProvider = event.target.value;
            if (SUPPORTED_PROVIDERS.includes(nextProvider as (typeof SUPPORTED_PROVIDERS)[number])) {
              setProvider((prev) => ({ ...prev, provider: nextProvider }));
            }
          }}
        >
          {SUPPORTED_PROVIDERS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Model
        <input
          value={provider.model}
          onChange={(event) => setProvider((prev) => ({ ...prev, model: event.target.value }))}
        />
      </label>

      <label className="field">
        API key (encrypted in browser.storage.local)
        <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} />
      </label>

      <label className="field">
        System prompt
        <textarea
          rows={3}
          value={provider.system_prompt ?? ''}
          onChange={(event) =>
            setProvider((prev) => ({ ...prev, system_prompt: event.target.value }))
          }
        />
      </label>

      <button type="button" className={`btn-save${saved ? ' saved' : ''}`} onClick={() => void saveProvider()}>
        Save Provider
      </button>

      <label className="field">
        Recipe JSON
        <textarea
          rows={10}
          value={recipeText}
          onChange={(event) => setRecipeText(event.target.value)}
        />
      </label>

      <button type="button" onClick={() => void importRecipe()}>
        Import Recipe
      </button>

      <button type="button" onClick={() => void sendLensateMessage({ type: 'lensate/refresh' })}>
        Refresh Page
      </button>

      {status && <p className="status">{status}</p>}
    </main>
  );
}

export default App;
