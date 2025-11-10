import { faker } from "@faker-js/faker";
import type { CacheWithMetadata } from "../../src/cache/internal/types";
import type { CacheMetadata } from "../../src";

export function generateCacheWithMetadata(data?: Partial<CacheWithMetadata>): CacheWithMetadata {
  return {
    data: data?.data ?? faker.word.words(5),
    metadata: generateCacheMetadata(data?.metadata),
  };
}

export function generateCacheMetadata(data?: Partial<CacheMetadata>): CacheMetadata {
  return {
    createdAt: Date.now(),
    expirationThresholdMs: 0,
    expiresAt: Date.now(),
    ttlMs: -1,
    ...data,
  };
}
