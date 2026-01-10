import { describe, expect, it } from "bun:test";
import { tryCatchSync, tryCatch, isSuccess, isError, type Result } from "../../src/neverthrow/tryCatch";

describe("neverthrow", () => {
  describe("tryCatchSync", () => {
    it("should return success result for functions that don't throw", () => {
      const result = tryCatchSync(() => 42);

      expect(result.data).toBe(42);
      expect(result.error).toBeNull();
    });

    it("should return success result for functions returning objects", () => {
      const obj = { foo: "bar", num: 123 };
      const result = tryCatchSync(() => obj);

      expect(result.data).toEqual(obj);
      expect(result.error).toBeNull();
    });

    it("should return success result for functions returning null", () => {
      const result = tryCatchSync(() => null);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it("should return success result for functions returning undefined", () => {
      const result = tryCatchSync(() => undefined);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeNull();
    });

    it("should return error result when function throws", () => {
      const error = new Error("Something went wrong");
      const result = tryCatchSync(() => {
        throw error;
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe(error);
    });

    it("should return error result when function throws custom error", () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "CustomError";
        }
      }

      const error = new CustomError("Custom error message");
      const result = tryCatchSync<never, CustomError>(() => {
        throw error;
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe(error);
      expect(result.error?.name).toBe("CustomError");
    });

    it("should return error result when function throws string", () => {
      const result = tryCatchSync(() => {
        throw "String error";
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe("String error" as any);
    });

    it("should catch errors in JSON parsing", () => {
      const result = tryCatchSync(() => JSON.parse("invalid json"));

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(SyntaxError);
    });
  });

  describe("tryCatch", () => {
    it("should return success result for resolved promises", async () => {
      const result = await tryCatch(Promise.resolve(42));

      expect(result.data).toBe(42);
      expect(result.error).toBeNull();
    });

    it("should return success result for async functions that resolve", async () => {
      const asyncFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "success";
      };

      const result = await tryCatch(asyncFn());

      expect(result.data).toBe("success");
      expect(result.error).toBeNull();
    });

    it("should return success result for promises resolving to objects", async () => {
      const obj = { foo: "bar", num: 123 };
      const result = await tryCatch(Promise.resolve(obj));

      expect(result.data).toEqual(obj);
      expect(result.error).toBeNull();
    });

    it("should return success result for promises resolving to null", async () => {
      const result = await tryCatch(Promise.resolve(null));

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it("should return success result for promises resolving to undefined", async () => {
      const result = await tryCatch(Promise.resolve(undefined));

      expect(result.data).toBeUndefined();
      expect(result.error).toBeNull();
    });

    it("should return error result for rejected promises", async () => {
      const error = new Error("Promise rejected");
      const result = await tryCatch(Promise.reject(error));

      expect(result.data).toBeNull();
      expect(result.error).toBe(error);
    });

    it("should return error result for async functions that throw", async () => {
      const error = new Error("Async error");
      const asyncFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw error;
      };

      const result = await tryCatch(asyncFn());

      expect(result.data).toBeNull();
      expect(result.error).toBe(error);
    });

    it("should return error result for custom error types", async () => {
      class CustomAsyncError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "CustomAsyncError";
        }
      }

      const error = new CustomAsyncError("Custom async error");
      const result = await tryCatch<never, CustomAsyncError>(Promise.reject(error));

      expect(result.data).toBeNull();
      expect(result.error).toBe(error);
      expect(result.error?.name).toBe("CustomAsyncError");
    });

    it("should return error result when promise rejects with string", async () => {
      const result = await tryCatch(Promise.reject("String error"));

      expect(result.data).toBeNull();
      expect(result.error).toBe("String error" as any);
    });

    it("should handle async fetch-like operations", async () => {
      const mockFetch = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { status: 200, data: "fetched data" };
      };

      const result = await tryCatch(mockFetch());

      expect(result.data).toEqual({ status: 200, data: "fetched data" });
      expect(result.error).toBeNull();
    });
  });

  describe("isSuccess", () => {
    it("should return true for success results", () => {
      const result: Result<number> = { data: 42, error: null };

      expect(isSuccess(result)).toBe(true);
    });

    it("should return false for error results", () => {
      const result: Result<number> = { data: null, error: new Error("Failed") };

      expect(isSuccess(result)).toBe(false);
    });

    it("should narrow type to ResultSuccess when true", () => {
      const result = tryCatchSync(() => 42);

      if (isSuccess(result)) {
        // TypeScript should know result.data is number here
        const value: number = result.data;
        expect(value).toBe(42);
        expect(result.error).toBeNull();
      }
    });

    it("should work with async results", async () => {
      const result = await tryCatch(Promise.resolve("success"));

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe("success");
      }
    });

    it("should work with custom error types", () => {
      class CustomError extends Error {}
      const result: Result<string, CustomError> = { data: "test", error: null };

      expect(isSuccess(result)).toBe(true);
    });

    it("should handle results with data being null/undefined", () => {
      const nullResult = tryCatchSync(() => null);
      expect(isSuccess(nullResult)).toBe(true);

      const undefinedResult = tryCatchSync(() => undefined);
      expect(isSuccess(undefinedResult)).toBe(true);
    });
  });

  describe("isError", () => {
    it("should return true for error results", () => {
      const result: Result<number> = { data: null, error: new Error("Failed") };

      expect(isError(result)).toBe(true);
    });

    it("should return false for success results", () => {
      const result: Result<number> = { data: 42, error: null };

      expect(isError(result)).toBe(false);
    });

    it("should narrow type to ResultError when true", () => {
      const error = new Error("Something went wrong");
      const result = tryCatchSync(() => {
        throw error;
      });

      if (isError(result)) {
        // TypeScript should know result.error is Error here
        const err: Error = result.error;
        expect(err).toBe(error);
        expect(result.data).toBeNull();
      }
    });

    it("should work with async results", async () => {
      const error = new Error("Async failed");
      const result = await tryCatch(Promise.reject(error));

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error).toBe(error);
      }
    });

    it("should work with custom error types", () => {
      class CustomError extends Error {
        code: number;
        constructor(message: string, code: number) {
          super(message);
          this.code = code;
        }
      }

      const error = new CustomError("Custom", 500);
      const result: Result<string, CustomError> = { data: null, error };

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.code).toBe(500);
      }
    });

    it("should handle non-Error error types", () => {
      const result: Result<number, string> = { data: null, error: "string error" };

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error).toBe("string error");
      }
    });
  });

  describe("integration scenarios", () => {
    it("should work with tryCatch and isSuccess pattern", () => {
      const result = tryCatchSync(() => JSON.parse('{"foo": "bar"}'));

      if (isSuccess(result)) {
        expect(result.data).toEqual({ foo: "bar" });
      } else {
        throw new Error("Should not reach here");
      }
    });

    it("should work with tryCatch and isError pattern", () => {
      const result = tryCatchSync(() => JSON.parse("invalid"));

      if (isError(result)) {
        expect(result.error).toBeInstanceOf(SyntaxError);
      } else {
        throw new Error("Should not reach here");
      }
    });

    it("should work with tryCatch and type guards", async () => {
      const successResult = await tryCatch(Promise.resolve(100));
      expect(isSuccess(successResult)).toBe(true);
      expect(isError(successResult)).toBe(false);

      const errorResult = await tryCatch(Promise.reject(new Error("fail")));
      expect(isSuccess(errorResult)).toBe(false);
      expect(isError(errorResult)).toBe(true);
    });

    it("should handle chained operations with type guards", () => {
      const parseJson = (str: string) => tryCatchSync(() => JSON.parse(str));

      const result1 = parseJson('{"value": 42}');
      if (isSuccess(result1)) {
        const doubled = tryCatchSync(() => result1.data.value * 2);
        if (isSuccess(doubled)) {
          expect(doubled.data).toBe(84);
        }
      }
    });

    it("should handle async chained operations", async () => {
      const fetchData = async (id: number) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (id < 0) throw new Error("Invalid ID");
        return { id, name: `Item ${id}` };
      };

      const result1 = await tryCatch(fetchData(1));
      expect(isSuccess(result1)).toBe(true);

      const result2 = await tryCatch(fetchData(-1));
      expect(isError(result2)).toBe(true);
    });
  });
});
