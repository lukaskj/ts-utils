import { isPromise } from "node:util/types";
import { isCallable } from "../utils/isCallable.ts";
import type { CacheMetadataOptions, CacheOptions, CacheWithMetadata, ValueLoader } from "./internal/types.ts";
import type { CacheMetadata, ICacheAdapter } from "./types.ts";

const defaultCacheOptions: CacheOptions = {
  expirationThresholdMs: 0,
  ttlMs: 60 * 60 * 1000,
};

export class Cache<TAdapter extends ICacheAdapter | undefined = undefined> {
  private inMemoryCache: Map<string, CacheWithMetadata> = new Map();
  private readonly options: CacheOptions;
  private readonly adapter?: TAdapter;

  constructor(defaultOptions?: Partial<CacheOptions>);
  constructor(adapter?: TAdapter, defaultOptions?: Partial<CacheOptions>);
  constructor(adapter?: TAdapter | Partial<CacheOptions>, defaultOptions?: Partial<CacheOptions>) {
    const options = adapter && !("getValue" in adapter) ? (adapter as Partial<CacheOptions>) : defaultOptions;
    if (adapter && "getValue" in adapter && "setValue" in adapter) {
      this.adapter = adapter as TAdapter;
    }

    this.options = {
      ...defaultCacheOptions,
      ...options,
    };
  }

  private async getFromAdapter<T>(cacheKey: string): Promise<T | undefined> {
    if (!this.adapter) {
      return undefined;
    }

    return this.adapter.getValue(cacheKey);
  }

  private async saveToAdapter<T>(cacheKey: string, value: T): Promise<void> {
    if (!this.adapter) {
      return;
    }

    return this.adapter.setValue<T>(cacheKey, value);
  }

  public async get<T>(
    cacheKey: string,
    valueLoader?: ValueLoader<T>,
    options: Partial<CacheMetadataOptions> = {},
  ): Promise<T | undefined> {
    const mergedOptions = this.mergeOptions(options);

    // Try in-memory cache first
    const cachedValue = this.tryGetFromMemory<T>(cacheKey);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    // Load fresh value from loader function first
    const freshValue = await this.tryGetFromValueLoader(valueLoader);
    if (freshValue !== undefined) {
      await this.cacheValue(cacheKey, freshValue, mergedOptions);

      return freshValue;
    }

    // Try adapter cache second
    const adapterValue = await this.tryGetFromAdapter<T>(cacheKey);
    if (adapterValue !== undefined) {
      await this.cacheValue(cacheKey, adapterValue, mergedOptions);

      return adapterValue;
    }
  }

  private mergeOptions(options: Partial<CacheMetadataOptions>): CacheMetadataOptions {
    return {
      ttlMs: this.options.ttlMs,
      expirationThresholdMs: this.options.expirationThresholdMs,
      ...options,
    };
  }

  private tryGetFromMemory<T>(cacheKey: string): T | undefined {
    const cached = this.inMemoryCache.get(cacheKey);

    if (cached && !this.isExpired(cached.metadata)) {
      return cached.data as T;
    }

    return undefined;
  }

  private async tryGetFromAdapter<T>(cacheKey: string): Promise<T | undefined> {
    const cached = await this.getFromAdapter<CacheWithMetadata<T>>(cacheKey);

    if (cached && !this.isExpired(cached.metadata)) {
      this.inMemoryCache.set(cacheKey, cached);
      return cached.data;
    }

    return undefined;
  }

  private async tryGetFromValueLoader<T>(valueLoader?: ValueLoader<T>): Promise<T | undefined> {
    if (valueLoader === undefined) {
      return undefined;
    }

    if (isCallable(valueLoader)) {
      return await valueLoader();
    }

    if (isPromise(valueLoader)) {
      return await valueLoader;
    }

    return valueLoader;
  }

  private async cacheValue<T>(cacheKey: string, value: T, options: CacheMetadataOptions): Promise<void> {
    const cacheData = this.createCacheEntry(value, options);

    await this.saveToAdapter(cacheKey, cacheData);
    this.inMemoryCache.set(cacheKey, cacheData);
  }

  private createCacheEntry<T>(value: T, options: CacheMetadataOptions): CacheWithMetadata<T> {
    const now = Date.now();
    let expiresAt: number;
    if (options.ttlMs < 0) {
      expiresAt = -1;
    } else {
      expiresAt = now + options.ttlMs - options.expirationThresholdMs;
    }

    return {
      data: value,
      metadata: {
        createdAt: now,
        ttlMs: options.ttlMs,
        expirationThresholdMs: options.expirationThresholdMs,
        expiresAt,
      },
    };
  }

  private isExpired(metadata?: CacheMetadata): boolean {
    if (!metadata) {
      return true;
    }

    if (metadata.expiresAt < 0) {
      return false;
    }

    const expirationTime =
      metadata.expiresAt ?? (metadata.createdAt && metadata.ttlMs ? metadata.createdAt + metadata.ttlMs : undefined);

    if (expirationTime === undefined) {
      return true;
    }

    return Date.now() >= expirationTime;
  }
}
