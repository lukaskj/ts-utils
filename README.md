# @lukaskj/ts-utils

A collection of TypeScript utilities for common programming patterns and operations.

[![NPM Version](https://img.shields.io/npm/v/@lukaskj/ts-utils)](https://www.npmjs.com/package/@lukaskj/ts-utils)
[![License](https://img.shields.io/npm/l/@lukaskj/ts-utils)](https://github.com/lukaskj/ts-utils/blob/main/LICENSE)
[![Node Version](https://img.shields.io/node/v/@lukaskj/ts-utils)](https://nodejs.org)

## Installation

```bash
# Using npm
npm install @lukaskj/ts-utils

# Using yarn
yarn add @lukaskj/ts-utils

# Using bun
bun add @lukaskj/ts-utils
```

## Features
Documentation folder: [docs/](docs/)

### Error Handling

#### `tryCatchSync` and `tryCatch`
Type-safe error handling utilities inspired by Rust's Result type.

```typescript
import { tryCatchSync, tryCatch } from '@lukaskj/ts-utils';

// Synchronous usage
const { data, error } = tryCatchSync(() => someRiskyOperation());
if (error) {
  console.error(error);
} else {
  console.log(data);
}

// Asynchronous usage
const { data, error } = await tryCatch(somePromise);
if (error) {
  console.error(error);
} else {
  console.log(data);
}
```

### Terminal Colors

The package includes a color utility for terminal output:

```typescript
import colors from '@lukaskj/ts-utils/colors';

console.log(colors.red('Error message'));
console.log(colors.green('Success message'));
console.log(colors.blueBold('Important information'));
```

### JSON Utilities

#### `jsonParser`
A secure JSON parser that protects against prototype pollution.

```typescript
import { jsonParser } from '@lukaskj/ts-utils';

const result = jsonParser('{"name": "test"}');
if (result.err) {
  console.error(result.err);
} else {
  console.log(result.value);
}
```

### Type Guards

#### `isObject`
Type guard for checking if a value is a plain JavaScript object.

```typescript
import { isObject } from '@lukaskj/ts-utils';

if (isObject(value)) {
  // value is typed as Record<string, any>
  console.log(Object.keys(value));
}
```

#### `isNullOrUndefined` and `isNullOrEmptyOrUndefined`
Type guards for null/undefined checks.

```typescript
import { isNullOrUndefined, isNullOrEmptyOrUndefined } from '@lukaskj/ts-utils';

if (!isNullOrUndefined(value)) {
  // value is not null or undefined
}

if (!isNullOrEmptyOrUndefined(value)) {
  // value is not null, undefined, or empty string
}
```

### Stream Processing

#### `chunksToLines`
Converts an async iterable of chunks into lines of text.

```typescript
import { chunksToLines } from '@lukaskj/ts-utils';
import { pipeline } from 'node:stream/promises';
import { createReadStream } from 'node:fs';

const readStream = createReadStream('file.txt', { encoding: 'utf-8' });
await pipeline(readStream, chunksToLines, process.stdout);
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the package
bun run build:all

# Run linting
bun run lint
```

## Requirements

- Node.js >= 23
- Bun >= 1.2.20

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
