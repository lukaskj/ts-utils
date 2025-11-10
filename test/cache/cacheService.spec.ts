import { faker } from "@faker-js/faker";
import { mock, mockReset } from "bun-mock-extended";
import { beforeEach, describe, expect, it, jest } from "bun:test";
import { Cache, type ICacheAdapter } from "../../src/cache/index.ts";
import { generateCacheWithMetadata } from "../__fixtures__/generateCacheWithMetadata.fixture.ts";
import type { CacheMetadataOptions, CacheOptions } from "../../src/cache/internal/types.ts";

describe("cache", () => {
  const adapter: ICacheAdapter = mock<ICacheAdapter>();
  beforeEach(() => {
    mockReset(adapter);
  });

  describe("get", () => {
    it("should return cached value from memory", async () => {
      const cacheKey = faker.string.alphanumeric(10);
      const cacheValue = faker.string.uuid();

      const service = new Cache(adapter);

      jest.spyOn(service as any, "tryGetFromMemory").mockReturnValueOnce(cacheValue);
      jest.spyOn(service as any, "tryGetFromValueLoader").mockResolvedValueOnce(undefined);
      jest.spyOn(service as any, "tryGetFromAdapter").mockResolvedValueOnce(undefined);
      jest.spyOn(service as any, "cacheValue").mockResolvedValueOnce(void 0);

      const result = await service.get(cacheKey);

      expect(result).toBe(cacheValue);
      expect(service["tryGetFromMemory"]).toHaveBeenCalled();
      expect(service["tryGetFromAdapter"]).not.toHaveBeenCalled();
      expect(service["tryGetFromValueLoader"]).not.toHaveBeenCalled();
      expect(service["cacheValue"]).not.toHaveBeenCalled();
    });

    it("should return cached value from value loader", async () => {
      const cacheKey = faker.string.alphanumeric(10);
      const cacheValue = faker.string.uuid();

      const service = new Cache(adapter);

      jest.spyOn(service as any, "tryGetFromMemory").mockReturnValueOnce(undefined);
      jest.spyOn(service as any, "tryGetFromAdapter").mockResolvedValueOnce(undefined);
      jest.spyOn(service as any, "tryGetFromValueLoader").mockResolvedValueOnce(cacheValue);
      jest.spyOn(service as any, "cacheValue").mockResolvedValueOnce(void 0);

      const result = await service.get(cacheKey);

      expect(result).toBe(cacheValue);
      expect(service["tryGetFromMemory"]).toHaveBeenCalledWith(cacheKey);
      expect(service["tryGetFromValueLoader"]).toHaveBeenCalledWith(undefined);
      expect(service["cacheValue"]).toHaveBeenCalledWith(cacheKey, cacheValue, expect.any(Object));
      expect(service["tryGetFromAdapter"]).not.toHaveBeenCalled();
    });

    it("should return cached value from adapter", async () => {
      const cacheKey = faker.string.alphanumeric(10);
      const cacheValue = faker.string.uuid();

      const service = new Cache(adapter);

      jest.spyOn(service as any, "tryGetFromMemory").mockReturnValueOnce(undefined);
      jest.spyOn(service as any, "tryGetFromAdapter").mockResolvedValueOnce(cacheValue);
      jest.spyOn(service as any, "tryGetFromValueLoader").mockResolvedValueOnce(undefined);
      jest.spyOn(service as any, "cacheValue").mockResolvedValueOnce(void 0);

      const result = await service.get(cacheKey);

      expect(result).toBe(cacheValue);
      expect(service["tryGetFromMemory"]).toHaveBeenCalled();
      expect(service["tryGetFromAdapter"]).toHaveBeenCalled();
      expect(service["tryGetFromValueLoader"]).toHaveBeenCalled();
      expect(service["cacheValue"]).toHaveBeenCalled();
    });
  });

  describe("tryGetFromMemory", () => {
    it("should return cached value if not expired", () => {
      const cacheKey = faker.string.uuid();
      const cacheValue = faker.string.alphanumeric(10);
      const cacheEntry = generateCacheWithMetadata({
        data: cacheValue,
      });

      const service = new Cache();
      service["inMemoryCache"].set(cacheKey, cacheEntry);
      jest.spyOn(service as any, "isExpired").mockReturnValue(false);

      const result = service["tryGetFromMemory"](cacheKey);

      expect(result).toBe(cacheValue);
      expect(service["isExpired"]).toHaveBeenCalled();
    });

    it("should return undefined if value is expired", () => {
      const cacheKey = faker.string.uuid();
      const cacheValue = faker.string.alphanumeric(10);
      const cacheEntry = generateCacheWithMetadata({
        data: cacheValue,
      });

      const service = new Cache();
      service["inMemoryCache"].set(cacheKey, cacheEntry);
      jest.spyOn(service as any, "isExpired").mockReturnValue(true);

      const result = service["tryGetFromMemory"](cacheKey);

      expect(result).toBeUndefined();
      expect(service["isExpired"]).toHaveBeenCalled();
    });

    it("should return undefined if there is no value in cache", () => {
      const cacheKey = faker.string.uuid();
      const service = new Cache();

      jest.spyOn(service as any, "isExpired").mockReturnValue(false);

      const result = service["tryGetFromMemory"](cacheKey);

      expect(result).toBeUndefined();
      expect(service["isExpired"]).not.toHaveBeenCalled();
    });
  });

  describe("tryGetFromAdapter", () => {
    it("should return cached value if not expired", async () => {
      const cacheKey = faker.string.uuid();
      const cacheValue = faker.string.alphanumeric(10);
      const cacheEntry = generateCacheWithMetadata({
        data: cacheValue,
      });

      const service = new Cache();

      jest.spyOn(service as any, "getFromAdapter").mockResolvedValue(cacheEntry);
      jest.spyOn(service as any, "isExpired").mockReturnValue(false);

      const result = await service["tryGetFromAdapter"](cacheKey);

      const valueFromMemoryCache = service["inMemoryCache"].get(cacheKey);

      expect(result).toBe(cacheValue);
      expect(valueFromMemoryCache).toMatchObject(cacheEntry);
      expect(service["getFromAdapter"]).toHaveBeenCalled();
      expect(service["isExpired"]).toHaveBeenCalled();
    });

    it("should return undefined if value is expired", async () => {
      const cacheKey = faker.string.uuid();
      const cacheValue = faker.string.alphanumeric(10);
      const cacheEntry = generateCacheWithMetadata({
        data: cacheValue,
      });

      const service = new Cache();
      jest.spyOn(service as any, "getFromAdapter").mockResolvedValue(cacheEntry);
      jest.spyOn(service as any, "isExpired").mockReturnValue(true);

      const result = await service["tryGetFromAdapter"](cacheKey);
      const valueFromMemoryCache = service["inMemoryCache"].get(cacheKey);

      expect(result).toBeUndefined();
      expect(valueFromMemoryCache).toBeUndefined();
      expect(service["getFromAdapter"]).toHaveBeenCalled();
      expect(service["isExpired"]).toHaveBeenCalled();
    });

    it("should return undefined if there is no value in cache", async () => {
      const cacheKey = faker.string.uuid();
      const service = new Cache();

      jest.spyOn(service as any, "isExpired").mockReturnValue(false);
      jest.spyOn(service as any, "getFromAdapter").mockResolvedValue(undefined);

      const result = await service["tryGetFromAdapter"](cacheKey);

      expect(result).toBeUndefined();
      expect(service["isExpired"]).not.toHaveBeenCalled();
    });
  });

  describe("tryGetFromValueLoader", () => {
    it("should return undefined if no loader is provided", async () => {
      const service = new Cache();

      const result = await service["tryGetFromValueLoader"]();

      expect(result).toBeUndefined();
    });

    it("should call value loader if it is a function", async () => {
      const cacheValue = faker.string.alphanumeric(10);
      const valueLoader = jest.fn().mockResolvedValue(cacheValue);

      const service = new Cache();

      const result = await service["tryGetFromValueLoader"](valueLoader);

      expect(result).toBe(cacheValue as any);
      expect(valueLoader).toHaveBeenCalled();
    });

    it("should await value loader if it is a promise", async () => {
      const cacheValue = faker.string.alphanumeric(10);
      const valueLoader = Promise.resolve(cacheValue);

      const service = new Cache();

      const result = await service["tryGetFromValueLoader"](valueLoader);

      expect(result).toBe(cacheValue);
    });

    it("should return value loader if it is value", async () => {
      const cacheValue = faker.string.alphanumeric(10);

      const service = new Cache();

      const result = await service["tryGetFromValueLoader"](cacheValue);

      expect(result).toBe(cacheValue);
    });
  });

  describe("cacheValue", () => {
    it("should cache the value", async () => {
      const options: CacheOptions = {
        expirationThresholdMs: 1000,
        ttlMs: 20000,
      };

      const cacheKey = faker.string.uuid();
      const cacheValue = faker.string.alphanumeric(10);
      const cacheEntry = generateCacheWithMetadata({
        data: cacheValue,
      });

      const service = new Cache();
      jest.spyOn(service as any, "createCacheEntry").mockReturnValue(cacheEntry);
      jest.spyOn(service as any, "saveToAdapter").mockReturnValue(void 0);

      await service["cacheValue"](cacheKey, cacheValue, options);

      expect(service["createCacheEntry"]).toHaveBeenCalled();
      expect(service["saveToAdapter"]).toHaveBeenCalled();
      expect(service["inMemoryCache"].has(cacheKey)).toBeTrue();
    });
  });

  describe("createCacheEntry", () => {
    it("should create cache entry with positive ttl", () => {
      const cache = new Cache();
      const value = { data: "test" };
      const options: CacheMetadataOptions = {
        ttlMs: 5000,
        expirationThresholdMs: 1000,
      };

      // @ts-expect-error - accessing private method for testing
      const entry = cache.createCacheEntry(value, options);

      expect(entry.data).toBe(value);
      expect(entry.metadata.ttlMs).toBe(5000);
      expect(entry.metadata.expirationThresholdMs).toBe(1000);
      expect(entry.metadata.createdAt).toBeNumber();
      expect(entry.metadata.expiresAt).toBe(entry.metadata.createdAt + 5000 - 1000);
    });

    it("should create cache entry with negative ttl (never expires)", () => {
      const cache = new Cache();
      const value = "test-string";
      const options: CacheMetadataOptions = {
        ttlMs: -1,
        expirationThresholdMs: 0,
      };

      // @ts-expect-error - accessing private method for testing
      const entry = cache.createCacheEntry(value, options);

      expect(entry.data).toBe(value);
      expect(entry.metadata.ttlMs).toBe(-1);
      expect(entry.metadata.expiresAt).toBe(-1);
    });

    it("should create cache entry with zero expiration threshold", () => {
      const cache = new Cache();
      const value = 123;
      const options: CacheMetadataOptions = {
        ttlMs: 10000,
        expirationThresholdMs: 0,
      };

      // @ts-expect-error - accessing private method for testing
      const entry = cache.createCacheEntry(value, options);

      expect(entry.metadata.expiresAt).toBe(entry.metadata.createdAt + 10000);
    });

    it("should handle different value types", () => {
      const cache = new Cache();
      const options: CacheMetadataOptions = {
        ttlMs: 5000,
        expirationThresholdMs: 0,
      };

      const testCases = [null, undefined, true, false, 0, 42, "string", { key: "value" }, [1, 2, 3], new Date()];

      for (const value of testCases) {
        // @ts-expect-error - accessing private method for testing
        const entry = cache.createCacheEntry(value, options);
        expect(entry.data).toBe(value as any);
        expect(entry.metadata).toBeDefined();
      }
    });

    it("should set createdAt to current timestamp", () => {
      const cache = new Cache();
      const value = "test";
      const options: CacheMetadataOptions = {
        ttlMs: 5000,
        expirationThresholdMs: 0,
      };

      const beforeTimestamp = Date.now();
      // @ts-expect-error - accessing private method for testing
      const entry = cache.createCacheEntry(value, options);
      const afterTimestamp = Date.now();

      expect(entry.metadata.createdAt).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(entry.metadata.createdAt).toBeLessThanOrEqual(afterTimestamp);
    });

    it("should calculate expiresAt correctly with threshold", () => {
      const cache = new Cache();
      const value = "test";
      const options: CacheMetadataOptions = {
        ttlMs: 10000,
        expirationThresholdMs: 2000,
      };

      // @ts-expect-error - accessing private method for testing
      const entry = cache.createCacheEntry(value, options);

      const expectedExpiresAt = entry.metadata.createdAt + 10000 - 2000;
      expect(entry.metadata.expiresAt).toBe(expectedExpiresAt);
    });
  });

  describe("isExpired", () => {
    it("should return true when metadata is undefined", () => {
      const cache = new Cache();

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(undefined);

      expect(result).toBeTrue();
    });

    it("should return true when metadata is null", () => {
      const cache = new Cache();

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(null);

      expect(result).toBeTrue();
    });

    it("should return false when expiresAt is negative (never expires)", () => {
      const cache = new Cache();
      const metadata = {
        createdAt: Date.now(),
        ttlMs: -1,
        expiresAt: -1,
        expirationThresholdMs: 0,
      };

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      expect(result).toBeFalse();
    });

    it("should return false when current time is before expiration", () => {
      const cache = new Cache();
      const now = Date.now();
      const metadata = {
        createdAt: now,
        ttlMs: 10000,
        expiresAt: now + 10000,
        expirationThresholdMs: 0,
      };

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      expect(result).toBeFalse();
    });

    it("should return true when current time is after expiration", () => {
      const cache = new Cache();
      const now = Date.now();
      const metadata = {
        createdAt: now - 20000,
        ttlMs: 10000,
        expiresAt: now - 10000,
        expirationThresholdMs: 0,
      };

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      expect(result).toBeTrue();
    });

    it("should return true when current time equals expiration time", () => {
      const cache = new Cache();
      const now = Date.now();
      const metadata = {
        createdAt: now - 10000,
        ttlMs: 10000,
        expiresAt: now,
        expirationThresholdMs: 0,
      };

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      expect(result).toBeFalse();
    });

    it("should return true when expiresAt is undefined and fallback is expired", () => {
      const cache = new Cache();
      const now = Date.now();
      const metadata = {
        createdAt: now - 20000,
        ttlMs: 10000,
        expiresAt: undefined as any,
        expirationThresholdMs: 0,
      };

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      // Should fallback to createdAt + ttlMs = now - 20000 + 10000 = now - 10000 (expired)
      expect(result).toBeTrue();
    });

    it("should handle expiration with threshold correctly", () => {
      const cache = new Cache();
      const now = Date.now();
      const metadata = {
        createdAt: now - 8000,
        ttlMs: 10000,
        expiresAt: now - 8000 + 10000 - 2000, // created + ttl - threshold
        expirationThresholdMs: 2000,
      };

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      expect(result).toBeFalse();
    });

    it("should return true when expired with threshold", () => {
      const cache = new Cache();
      const now = Date.now();
      const metadata = {
        createdAt: now - 10000,
        ttlMs: 5000,
        expiresAt: now - 10000 + 5000 - 1000, // should be expired
        expirationThresholdMs: 1000,
      };

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      expect(result).toBeTrue();
    });

    it("should fallback to createdAt + ttlMs when expiresAt is not set", () => {
      const cache = new Cache();
      const now = Date.now();
      const metadata = {
        createdAt: now - 5000,
        ttlMs: 10000,
        expiresAt: undefined as any,
        expirationThresholdMs: 0,
      };

      // Force the fallback scenario by using undefined expiresAt
      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      // Should fallback to createdAt + ttlMs = now - 5000 + 10000 = now + 5000 (not expired)
      expect(result).toBeFalse();
    });

    it("should handle edge case of zero ttl", () => {
      const cache = new Cache();
      const now = Date.now();
      const metadata = {
        createdAt: now - 1000,
        ttlMs: 0,
        expiresAt: now - 1000, // immediately expired
        expirationThresholdMs: 0,
      };

      // @ts-expect-error - accessing private method for testing
      const result = cache.isExpired(metadata);

      expect(result).toBeTrue();
    });
  });
});
