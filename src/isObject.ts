/**
 * Type guard that checks if the input is a plain JavaScript object.
 * @param {any} input - The value to check
 * @returns {boolean} True if the input is a plain object, false otherwise
 * @typeParam {Record<string, any>} Type guard narrows the input type to a string-keyed object
 */
export function isObject(input: any): input is Record<string, any> {
  return Object.prototype.toString.apply(input) === "[object Object]";
}
