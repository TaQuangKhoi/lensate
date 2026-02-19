import type { AIProviderConfig } from '@/src/domain/entities/ai-provider-config';
import type { StoragePort } from '@/src/domain/ports/storage.port';
import { DEFAULT_PROVIDER_CONFIG, STORAGE_KEYS } from '@/src/shared/constants/defaults';

export class ConfigureProviderUseCase {
  constructor(private readonly storage: StoragePort) {}

  async getConfig(): Promise<AIProviderConfig> {
    const config = await this.storage.get<AIProviderConfig>(STORAGE_KEYS.providerConfig);
    return config ?? DEFAULT_PROVIDER_CONFIG;
  }

  async setConfig(config: AIProviderConfig): Promise<void> {
    await this.storage.set(STORAGE_KEYS.providerConfig, config);
  }
}
