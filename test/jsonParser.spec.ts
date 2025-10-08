import { describe, expect, it } from "bun:test";
import { jsonParser } from "../src/jsonParser";

describe("jsonParser", () => {
  it("should successfully parse valid JSON", () => {
    const input = '{"name": "test", "value": 123}';
    const result = jsonParser(input);
    expect(result).toHaveProperty("value");
    expect(result.value).toEqual({ name: "test", value: 123 });
  });

  it("should handle arrays", () => {
    const input = '[1, 2, "three"]';
    const result = jsonParser(input);
    expect(result).toHaveProperty("value");
    expect(result.value).toEqual([1, 2, "three"]);
  });

  it("should handle nested objects", () => {
    const input = '{"outer": {"inner": "value"}}';
    const result = jsonParser(input);
    expect(result).toHaveProperty("value");
    expect(result.value).toEqual({ outer: { inner: "value" } });
  });

  it("should handle primitive values", () => {
    expect(jsonParser("123").value).toBe(123);
    expect(jsonParser("true").value).toBe(true);
    expect(jsonParser("false").value).toBe(false);
    expect(jsonParser("null").value).toBe(null);
    expect(jsonParser('"string"').value).toBe("string");
  });

  it("should return error for invalid JSON", () => {
    const input = '{"invalid": "json",}'; // trailing comma
    const result = jsonParser(input);
    expect(result).toHaveProperty("err");
    expect(result.err).toBeInstanceOf(Error);
  });

  it("should return error for incomplete JSON", () => {
    const input = '{"unclosed": "object"';
    const result = jsonParser(input);
    expect(result).toHaveProperty("err");
    expect(result.err).toBeInstanceOf(Error);
  });

  it("should prevent prototype pollution", () => {
    const input = '{"__proto__": {"polluted": true}}';
    const result = jsonParser(input);
    expect(result).toHaveProperty("value");
    expect(result.value).toEqual({});
  });

  it("should handle empty objects and arrays", () => {
    expect(jsonParser("{}").value).toEqual({});
    expect(jsonParser("[]").value).toEqual([]);
  });
});
