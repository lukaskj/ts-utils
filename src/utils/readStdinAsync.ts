/**
 * Reads data from standard input (stdin) asynchronously until the stream ends.
 * @returns {Promise<string>} A promise that resolves with the complete string of data read from stdin.
 */
export async function readStdinAsync(): Promise<string> {
  let data = "";
  for await (const chunk of process.stdin) {
    data += chunk;
  }

  return data;
}

/**
 * Creates an async generator that yields chunks from an async iterable source.
 * @param chunks - An async iterable source of string or Uint8Array chunks
 * @yields {string | Uint8Array} Each chunk from the input source
 * @returns {AsyncGenerator<string | Uint8Array, void, unknown>} An async generator that yields the input chunks
 */
export async function* readStdin(
  chunks: AsyncIterable<string | Uint8Array>,
): AsyncGenerator<string | Uint8Array, void, unknown> {
  for await (const chunk of chunks) {
    yield chunk;
  }

  return;
}
