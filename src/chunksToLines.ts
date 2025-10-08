/**
 * Converts an async iterable of string or Uint8Array chunks into an async iterable of lines.
 * Handles cases where lines may be split across multiple chunks.
 * Usage:
 * ```ts
 * import { pipeline } from "node:stream/promises";
 * import { createReadStream } from "node:fs";
 * import { chunksToLines } from "@lukaskj/lk-utils";
 *
 * const readStream = createReadStream("path/to/file.txt", { encoding: "utf-8" });
 * await pipeline(readStream, chunksToLines, process.stdout).catch((err) => {
 *   console.error(err);
 *   process.exit(1);
 * });
 * ```
 * @param chunks
 */
export async function* chunksToLines(chunks: AsyncIterable<string | Uint8Array>) {
  let previous = "";

  for await (const chunk of chunks) {
    previous += chunk;
    let eolIndex: number;

    // biome-ignore lint/suspicious/noAssignInExpressions: "explanation"
    while ((eolIndex = previous.indexOf("\n")) >= 0) {
      // this line includes the EOL
      const line = previous.slice(0, eolIndex + 1);
      yield line?.trim() ?? "";
      previous = previous.slice(eolIndex + 1);
    }
  }

  if (previous.length > 0) {
    yield previous;
  }
}
