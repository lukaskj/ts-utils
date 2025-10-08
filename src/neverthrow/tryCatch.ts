// https://gist.github.com/t3dotgg/a486c4ae66d32bf17c09c73609dacc5b
// Types for the result object with discriminated union
// type Success<T> = {
//   data: T;
//   error: null;
// };

// type Failure<E> = {
//   data: null;
//   error: E;
// };

// export type Result<T, E = Error> = Success<T> | Failure<E>;

export type Result<T, E> = [undefined, E] | [T, undefined];
export type PromiseResult<T, E> = Promise<Result<T, E>>;

/**
 * Wraps a synchronous function in a try-catch block and returns a Result tuple containing either the returned value or the caught error
 *
 * @template T - The type of the successful result value
 * @template E - The type of the error value, must extend Error
 * @param {() => T} fn - The function to be executed
 * @returns {Result<T, E>} A tuple containing either [data, undefined] or [undefined, error]
 *
 * @example
 * const [data, error] = tryCatch(() => someRiskyOperation());
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log(data);
 * }
 */
export function tryCatch<T, E extends Error>(fn: () => T): Result<T, E> {
  try {
    const data = fn();
    return [data as T, undefined];
  } catch (error) {
    return [undefined, error as E];
  }
}

/**
 * Wraps a Promise in a try-catch block and returns a Result object containing either the resolved data or the caught error
 *
 * @template T - The type of the successful result value
 * @template E - The type of the error value, defaults to Error
 * @param {Promise<T>} promise - The promise to be executed
 * @returns {Promise<Result<T, E>>} A Promise that resolves to a Result object containing either the data or error
 *
 * @example
 * const {data, error} = await tryCatchAsync(somePromise);
 * if (error) {
 *   console.error(result.error);
 * } else {
 *   console.log(data);
 * }
 */
export async function tryCatchAsync<T, E extends Error>(promise: Promise<T>): PromiseResult<T, E> {
  try {
    const data = await promise;
    return [data as T, undefined];
  } catch (error) {
    return [undefined, error as E];
  }
}
