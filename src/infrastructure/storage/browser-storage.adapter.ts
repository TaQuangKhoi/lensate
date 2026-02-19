import type { StoragePort } from '@/src/domain/ports/storage.port';

export class BrowserStorageAdapter implements StoragePort {
  async get<T>(key: string): Promise<T | null> {
    const values = await browser.storage.local.get(key);
    return (values[key] as T | undefined) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await browser.storage.local.set({ [key]: value });
  }

  async remove(key: string): Promise<void> {
    await browser.storage.local.remove(key);
  }
}
