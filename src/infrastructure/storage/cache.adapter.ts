import type { CacheEntry } from '@/src/domain/entities/cache-entry';
import type { CachePort } from '@/src/domain/ports/cache.port';
import type { StoragePort } from '@/src/domain/ports/storage.port';
import { STORAGE_KEYS } from '@/src/shared/constants/defaults';

type CacheMap = Record<string, CacheEntry>;

export class CacheAdapter implements CachePort {
  constructor(
    private readonly storage: StoragePort,
    private readonly maxEntries = 500,
  ) {}

  async lookup(hash: string): Promise<CacheEntry | null> {
    const cache = await this.readMap();
    return cache[hash] ?? null;
  }

  async store(hash: string, entry: CacheEntry): Promise<void> {
    const cache = await this.readMap();
    cache[hash] = entry;
    this.evictIfNeeded(cache);
    await this.storage.set(STORAGE_KEYS.cache, cache);
  }

  async clear(): Promise<void> {
    await this.storage.set(STORAGE_KEYS.cache, {});
  }

  private async readMap(): Promise<CacheMap> {
    return (await this.storage.get<CacheMap>(STORAGE_KEYS.cache)) ?? {};
  }

  private evictIfNeeded(cache: CacheMap): void {
    const entries = Object.entries(cache);
    if (entries.length <= this.maxEntries) return;
    entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, entries.length - this.maxEntries)
      .forEach(([key]) => {
        delete cache[key];
      });
  }
}
