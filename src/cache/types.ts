export interface ICacheAdapter {
  getValue<T>(key: string): T | undefined | Promise<T | undefined>;
  setValue<T>(key: string, value: T): void | Promise<void>;
}

export type CacheMetadata = {
  createdAt: number;
  ttlMs: number;
  expiresAt: number;
  expirationThresholdMs: number;
};
