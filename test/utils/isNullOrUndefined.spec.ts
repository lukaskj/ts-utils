import { describe, expect, it } from "bun:test";
import { faker } from "@faker-js/faker";
import { isNullOrUndefined } from "../../src/utils/isNullOrUndefined";

describe("utils", () => {
  describe("isNullOrUndefined", () => {
    it("Should return true if input is null", () => {
      const data = null;
      const expected = true;
      const result = isNullOrUndefined(data);

      expect(result).toStrictEqual(expected);
    });

    it("Should return true if input is undefined", () => {
      const data = undefined;
      const expected = true;
      const result = isNullOrUndefined(data);

      expect(result).toStrictEqual(expected);
    });

    it("Should return false if input has value", () => {
      const data = faker.string.alphanumeric(10);
      const expected = false;
      const result = isNullOrUndefined(data);

      expect(result).toStrictEqual(expected);
    });
  });
});
