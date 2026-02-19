import type { CacheEntry } from '../entities/cache-entry';

export interface CachePort {
  lookup(hash: string): Promise<CacheEntry | null>;
  store(hash: string, entry: CacheEntry): Promise<void>;
  clear(): Promise<void>;
}
