/**
 * @deprecated Use node:util/types::isPromise
 * @param value unknown
 * @returns
 */
export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    "then" in value &&
    typeof value.then === "function"
  );
}
