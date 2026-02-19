import type { AIProviderConfig } from '@/src/domain/entities/ai-provider-config';
import type { Recipe } from '@/src/domain/entities/recipe';

export const STORAGE_KEYS = {
  recipes: 'lensate.recipes',
  activeRecipeName: 'lensate.activeRecipeName',
  providerConfig: 'lensate.providerConfig',
  encryptedApiKey: 'lensate.encryptedApiKey',
  cryptoSecret: 'lensate.cryptoSecret',
  enabledByOrigin: 'lensate.enabledByOrigin',
  cache: 'lensate.cache',
} as const;

export const DEFAULT_SYSTEM_PROMPT =
  'You are a precise translation assistant. Preserve meaning and tone. Do not add explanations.';

export const DEFAULT_PROVIDER_CONFIG: AIProviderConfig = {
  provider: 'openai',
  api_key: '',
  model: 'gpt-4o-mini',
  system_prompt: DEFAULT_SYSTEM_PROMPT,
};

export const DEFAULT_RECIPE: Recipe = {
  name: 'Sample Generic Reader',
  author: 'lensate',
  url_pattern: '*://*/*',
  rules: [
    {
      selector: 'p',
      action: 'translate',
      batch_size: 8,
      display: 'side-by-side',
    },
  ],
  ignore: ['script', 'style', 'noscript'],
  trigger: 'on_load',
};

export const SUPPORTED_PROVIDERS = ['openai', 'deepseek', 'gemini', 'custom'] as const;
