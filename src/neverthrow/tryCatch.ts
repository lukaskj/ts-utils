// https://gist.github.com/t3dotgg/a486c4ae66d32bf17c09c73609dacc5b
// Types for the result object with discriminated union
type ResultSuccess<T> = {
  data: T;
  error: null;
};

type ResultError<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = ResultSuccess<T> | ResultError<E>;

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
 * const {data, error} = tryCatch(() => someRiskyOperation());
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log(data);
 * }
 */
export function tryCatchSync<T, E extends Error>(fn: () => T): Result<T, E> {
  try {
    const data = fn();
    return { data: data as T, error: null };
  } catch (error) {
    return { data: null, error: error as E };
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
 * const {data, error} = await tryCatch(somePromise);
 * if (error) {
 *   console.error(result.error);
 * } else {
 *   console.log(data);
 * }
 */
export async function tryCatch<T, E extends Error>(promise: Promise<T>): PromiseResult<T, E> {
  try {
    const data = await promise;
    return { data: data as T, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

/**
 * Type guard to check if a Result object represents a successful operation
 *
 * @template T - The type of the successful result value
 * @template E - The type of the error value, defaults to Error
 * @param {Result<T, E>} result - The Result object to check
 * @returns {result is ResultSuccess<T>} True if the result is successful (error is null), false otherwise
 *
 * @example
 * const result = tryCatch(() => someOperation());
 * if (isSuccess(result)) {
 *   console.log(result.data); // TypeScript knows result.data is T
 * }
 */
export function isSuccess<T, E = Error>(result: Result<T, E>): result is ResultSuccess<T> {
  return result.error === null;
}

/**
 * Type guard to check if a Result object represents a failed operation
 *
 * @template T - The type of the successful result value
 * @template E - The type of the error value, defaults to Error
 * @param {Result<T, E>} result - The Result object to check
 * @returns {result is ResultError<E>} True if the result is an error (error is not null), false otherwise
 *
 * @example
 * const result = tryCatch(() => someOperation());
 * if (isError(result)) {
 *   console.error(result.error); // TypeScript knows result.error is E
 * }
 */
export function isError<T, E = Error>(result: Result<T, E>): result is ResultError<E> {
  return result.error !== null;
}
