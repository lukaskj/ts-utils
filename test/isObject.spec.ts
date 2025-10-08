import { describe, expect, it } from "bun:test";
import { isObject } from "../src/isObject";

describe("isObject", () => {
  it("should return true for plain objects", () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject(Object.create(null))).toBe(true);
    expect(isObject(new Object())).toBe(true);
  });

  it("should return false for arrays", () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
    expect(isObject([])).toBe(false);
  });

  it("should return false for null", () => {
    expect(isObject(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isObject(undefined)).toBe(false);
  });

  it("should return false for primitive types", () => {
    expect(isObject(42)).toBe(false);
    expect(isObject("string")).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
    expect(isObject(Symbol("sym"))).toBe(false);
    expect(isObject(123n)).toBe(false);
  });

  it("should return false for built-in objects", () => {
    expect(isObject(new Date())).toBe(false);
    expect(isObject(new Map())).toBe(false);
    expect(isObject(new Set())).toBe(false);
    expect(isObject(new WeakMap())).toBe(false);
    expect(isObject(new WeakSet())).toBe(false);
    expect(isObject(/regex/)).toBe(false);
  });

  it("should return false for functions", () => {
    expect(isObject(() => {})).toBe(false);
    expect(isObject(function () {})).toBe(false);
    expect(isObject(async () => {})).toBe(false);
    expect(isObject(class {})).toBe(false);
  });

  it("should return true for class instances", () => {
    class TestClass {}
    expect(isObject(new TestClass())).toBe(true);
  });
});
