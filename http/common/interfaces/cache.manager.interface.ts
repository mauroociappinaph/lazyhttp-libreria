
export interface ICacheManager {
  invalidateCache(pattern: string): void;
  invalidateCacheByTags(tags: string[]): void;
}
