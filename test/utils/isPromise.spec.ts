/** biome-ignore-all lint/suspicious/noThenProperty: Tests */

import { describe, expect, it } from "bun:test";
import { isPromise } from "../../src/utils/isPromise";

describe("utils", () => {
  describe("isPromise", () => {
    it("should return true for native promises", () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise(Promise.resolve(42))).toBe(true);
      expect(isPromise(Promise.reject("error").catch(() => {}))).toBe(true);
      expect(
        isPromise(
          new Promise((resolve) => {
            resolve(true);
          }),
        ),
      ).toBe(true);
    });

    it("should return true for promise-like objects (thenables)", () => {
      const thenable = {
        then: (resolve: (value: unknown) => void) => {
          resolve(42);
        },
      };
      expect(isPromise(thenable)).toBe(true);

      const complexThenable = {
        then: () => {},
        catch: () => {},
        finally: () => {},
      };
      expect(isPromise(complexThenable)).toBe(true);
    });

    it("should return true for function with then method", () => {
      const fnWithThen = () => {};
      (fnWithThen as any).then = () => {};
      expect(isPromise(fnWithThen)).toBe(true);
    });

    it("should return false for null and undefined", () => {
      expect(isPromise(null)).toBe(false);
      expect(isPromise(undefined)).toBe(false);
    });

    it("should return false for primitive types", () => {
      expect(isPromise(42)).toBe(false);
      expect(isPromise("string")).toBe(false);
      expect(isPromise(true)).toBe(false);
      expect(isPromise(false)).toBe(false);
      expect(isPromise(Symbol("sym"))).toBe(false);
      expect(isPromise(123n)).toBe(false);
    });

    it("should return false for plain objects without then", () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise({ a: 1 })).toBe(false);
      expect(isPromise({ catch: () => {} })).toBe(false);
    });

    it("should return false for objects with non-function then property", () => {
      expect(isPromise({ then: 42 })).toBe(false);
      expect(isPromise({ then: "string" })).toBe(false);
      expect(isPromise({ then: null })).toBe(false);
      expect(isPromise({ then: undefined })).toBe(false);
      expect(isPromise({ then: {} })).toBe(false);
    });

    it("should return false for arrays", () => {
      expect(isPromise([])).toBe(false);
      expect(isPromise([1, 2, 3])).toBe(false);
    });

    it("should return false for functions without then method", () => {
      expect(isPromise(() => {})).toBe(false);
      expect(isPromise(function () {})).toBe(false);
      expect(isPromise(async function () {})).toBe(false);
      expect(isPromise(class {})).toBe(false);
    });

    it("should return false for built-in objects", () => {
      expect(isPromise(new Date())).toBe(false);
      expect(isPromise(new Map())).toBe(false);
      expect(isPromise(new Set())).toBe(false);
      expect(isPromise(/regex/)).toBe(false);
      expect(isPromise(new Error())).toBe(false);
    });

    it("should correctly type guard the value", () => {
      const value: unknown = Promise.resolve(42);

      if (isPromise(value)) {
        // TypeScript should recognize this as Promise<any>
        value.then((result) => {
          expect(result).toBe(42);
        });
      }
    });

    it("should work with custom Promise implementations", () => {
      class CustomPromise {
        then(onFulfilled: (value: any) => void) {
          onFulfilled(42);
        }
      }

      expect(isPromise(new CustomPromise())).toBe(true);
    });
  });
});
