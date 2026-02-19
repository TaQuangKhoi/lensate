import type { CryptoPort } from '@/src/domain/ports/crypto.port';
import type { StoragePort } from '@/src/domain/ports/storage.port';
import { STORAGE_KEYS } from '@/src/shared/constants/defaults';
import { APIKeyError } from '@/src/shared/errors/lensate-error';

export class ManageAPIKeyUseCase {
  constructor(
    private readonly storage: StoragePort,
    private readonly crypto: CryptoPort,
  ) {}

  async save(apiKey: string): Promise<void> {
    if (!apiKey.trim()) {
      throw new APIKeyError('API key cannot be empty.');
    }
    const encrypted = await this.crypto.encrypt(apiKey.trim());
    await this.storage.set(STORAGE_KEYS.encryptedApiKey, encrypted);
  }

  async read(): Promise<string> {
    const encrypted = await this.storage.get<string>(STORAGE_KEYS.encryptedApiKey);
    if (!encrypted) {
      return '';
    }
    return this.crypto.decrypt(encrypted);
  }
}
