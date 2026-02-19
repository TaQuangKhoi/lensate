import type { AIProviderConfig } from '@/src/domain/entities/ai-provider-config';
import type { TranslationPort } from '@/src/domain/ports/translation.port';
import { CustomProvider } from '@/src/infrastructure/ai-providers/custom.provider';
import { GeminiProvider } from '@/src/infrastructure/ai-providers/gemini.provider';
import { OpenAIProvider } from '@/src/infrastructure/ai-providers/openai.provider';

export function createProvider(config: AIProviderConfig): TranslationPort {
  if (config.provider === 'gemini') {
    return new GeminiProvider(config.api_key, config.model);
  }

  if (config.provider === 'custom') {
    return new CustomProvider(config.api_key, config.model, config.base_url);
  }

  const baseURL =
    config.base_url ?? (config.provider === 'deepseek' ? 'https://api.deepseek.com/v1' : undefined);
  return new OpenAIProvider(config.api_key, config.model, baseURL);
}
