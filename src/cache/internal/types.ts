import type { CacheMetadata } from "../types.ts";

export type CacheWithMetadata<T = any> = {
  data: T;
  metadata: CacheMetadata;
};

export type CacheMetadataOptions = Pick<CacheMetadata, "ttlMs" | "expirationThresholdMs">;
export type CacheOptions = CacheMetadataOptions & {};
export type ValueLoader<T> = T | Promise<T> | (() => Promise<T>);
