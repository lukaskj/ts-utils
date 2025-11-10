# Cache Service

A flexible caching service with support for in-memory caching and optional persistent storage adapters.

## Features

- **Two-tier caching**: In-memory cache with optional persistent adapter
- **TTL (Time-To-Live) support**: Automatic expiration of cached values
- **Expiration threshold**: Pre-expire cache entries to allow for refreshing before actual expiration
- **Flexible value loaders**: Support for functions, promises, or direct values
- **Type-safe**: Full TypeScript support with generics

## Installation

```typescript
import { Cache } from "lk-utils/cache";
```

## Basic Usage

### Creating a Cache Instance

```typescript
// Simple in-memory cache
const cache = new Cache();

// Cache with custom options
const cache = new Cache({
  ttlMs: 5 * 60 * 1000, // 5 minutes
  expirationThresholdMs: 30 * 1000, // 30 seconds
});
```

### Storing and Retrieving Values

```typescript
// Store a value using the value loader
const result = await cache.get("user:123", async () => {
  return await fetchUserFromDatabase(123);
});

// Subsequent calls will return the cached value
const cachedResult = await cache.get("user:123");
```

## Configuration Options

### CacheOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ttlMs` | `number` | `3600000` (1 hour) | Time-to-live in milliseconds. Set to `-1` for no expiration. |
| `expirationThresholdMs` | `number` | `0` | Threshold before actual expiration to consider cache stale. |

### Per-Request Options

You can override the default TTL and expiration threshold on a per-request basis:

```typescript
await cache.get(
  "temporary:data",
  () => fetchData(),
  {
    ttlMs: 60 * 1000, // 1 minute
    expirationThresholdMs: 0,
  }
);
```

## Using Cache Adapters

Cache adapters allow you to persist cached data beyond the application's memory. Implement the `ICacheAdapter` interface to create custom adapters.

### Creating a Custom Adapter

```typescript
import type { ICacheAdapter } from "lk-utils/cache";

class RedisCacheAdapter implements ICacheAdapter {
  constructor(private redisClient: RedisClient) {}

  async getValue<T>(key: string): Promise<T | undefined> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : undefined;
  }

  async setValue<T>(key: string, value: T): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value));
  }
}

// Use the adapter
const adapter = new RedisCacheAdapter(redisClient);
const cache = new Cache(adapter);
```

### File System Adapter Example

```typescript
import { readFile, writeFile } from "fs/promises";
import type { ICacheAdapter } from "lk-utils/cache";

class FileSystemAdapter implements ICacheAdapter {
  constructor(private basePath: string) {}

  async getValue<T>(key: string): Promise<T | undefined> {
    try {
      const data = await readFile(`${this.basePath}/${key}.json`, "utf-8");
      return JSON.parse(data);
    } catch {
      return undefined;
    }
  }

  async setValue<T>(key: string, value: T): Promise<void> {
    await writeFile(`${this.basePath}/${key}.json`, JSON.stringify(value));
  }
}

const cache = new Cache(new FileSystemAdapter("./cache"));
```

## Value Loaders

The `get` method accepts three types of value loaders:

### Function Loader

```typescript
const value = await cache.get("key", async () => {
  return await expensiveOperation();
});
```

### Promise Loader

```typescript
const promise = expensiveOperation();
const value = await cache.get("key", promise);
```

### Direct Value

```typescript
const value = await cache.get("key", "direct value");
```

### No Loader (Retrieve Only)

```typescript
// Only returns cached value, doesn't compute new one
const value = await cache.get("key");
```

## Cache Behavior

### Cache Lookup Order

When calling `get`, the cache service checks sources in this order:

1. **In-memory cache**: Fastest, checked first
2. **Value loader**: If provided, executes to get fresh data
3. **Adapter cache**: If adapter is configured, retrieves from persistent storage

### Expiration Strategy

The cache uses a proactive expiration strategy:

- **TTL (Time-To-Live)**: Defines how long a value is valid
- **Expiration Threshold**: Allows pre-expiring values before actual TTL

The effective expiration time is calculated as:
```
expiresAt = createdAt + ttlMs - expirationThresholdMs
```

#### Example: Expiration Threshold

```typescript
const cache = new Cache({
  ttlMs: 60 * 60 * 1000, // 1 hour
  expirationThresholdMs: 5 * 60 * 1000, // 5 minutes
});

// Cache entry expires 55 minutes after creation
// This allows for cache refresh before users experience stale data
```

### Never Expiring Cache

Set `ttlMs` to `-1` for cache entries that never expire:

```typescript
const cache = new Cache({ ttlMs: -1 });

await cache.get("static:config", () => loadStaticConfig());
// This value will never expire from the cache
```

## Advanced Examples

### User Profile Cache with Refresh

```typescript
const profileCache = new Cache(adapter, {
  ttlMs: 15 * 60 * 1000, // 15 minutes
  expirationThresholdMs: 2 * 60 * 1000, // 2 minutes (refresh at 13 min mark)
});

async function getUserProfile(userId: string) {
  return await profileCache.get(`profile:${userId}`, async () => {
    console.log("Fetching profile from database...");
    return await db.users.findById(userId);
  });
}
```

### API Response Cache

```typescript
const apiCache = new Cache(new FileSystemAdapter("./cache/api"), {
  ttlMs: 5 * 60 * 1000, // 5 minutes
});

async function fetchExternalData(endpoint: string) {
  return await apiCache.get(`api:${endpoint}`, async () => {
    const response = await fetch(`https://api.example.com/${endpoint}`);
    return await response.json();
  });
}
```

### Multi-layer Cache Strategy

```typescript
// Layer 1: Fast, short-lived memory cache
const memCache = new Cache({
  ttlMs: 60 * 1000, // 1 minute
});

// Layer 2: Persistent, longer-lived cache
const persistentCache = new Cache(adapter, {
  ttlMs: 60 * 60 * 1000, // 1 hour
});

async function getCachedData(key: string) {
  // Try memory cache first
  let data = await memCache.get(key);
  if (data) return data;

  // Fall back to persistent cache with loader
  return await persistentCache.get(key, async () => {
    const freshData = await fetchData();
    // Also populate memory cache
    await memCache.get(key, freshData);
    return freshData;
  });
}
```

## Type Definitions

### ICacheAdapter

```typescript
interface ICacheAdapter {
  getValue<T>(key: string): T | undefined | Promise<T | undefined>;
  setValue<T>(key: string, value: T): void | Promise<void>;
}
```

### CacheMetadata

```typescript
type CacheMetadata = {
  createdAt: number;
  ttlMs: number;
  expiresAt: number;
  expirationThresholdMs: number;
};
```

### ValueLoader

```typescript
type ValueLoader<T> = T | Promise<T> | (() => Promise<T>);
```
