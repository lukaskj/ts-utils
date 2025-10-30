import { describe, expect, it } from "bun:test";
import { chunksToLines } from "../../src/utils/chunksToLines";

describe("utils", () => {
  describe("chunksToLines", () => {
    it("should process a single chunk with one line", async () => {
      const chunks = ["hello world\n"];
      const lines = [];

      for await (const line of chunksToLines(chunks as any)) {
        lines.push(line);
      }

      expect(lines).toEqual(["hello world"]);
    });

    it("should process multiple chunks that form a single line", async () => {
      const chunks = ["hel", "lo ", "world\n"];
      const lines = [];

      for await (const line of chunksToLines(chunks as any)) {
        lines.push(line);
      }

      expect(lines).toEqual(["hello world"]);
    });

    it("should process multiple lines across different chunks", async () => {
      const chunks = ["line1\nli", "ne2\nline", "3\n"];
      const lines = [];

      for await (const line of chunksToLines(chunks as any)) {
        lines.push(line);
      }

      expect(lines).toEqual(["line1", "line2", "line3"]);
    });

    it("should handle empty chunks", async () => {
      const chunks = ["", "line1\n", "", "line2\n"];
      const lines = [];

      for await (const line of chunksToLines(chunks as any)) {
        lines.push(line);
      }

      expect(lines).toEqual(["line1", "line2"]);
    });

    it("should handle chunk without final newline", async () => {
      const chunks = ["line1\n", "line2"];
      const lines = [];

      for await (const line of chunksToLines(chunks as any)) {
        lines.push(line);
      }

      expect(lines).toEqual(["line1", "line2"]);
    });
  });
});
