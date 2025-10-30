import sjs from "secure-json-parse";

/**
 * Safely parses JSON input using secure-json-parse with prototype pollution protection.
 * @param {any} input - The input to be parsed as JSON
 * @returns {{ value?: any, err?: Error }} An object containing either the parsed value or an error if parsing failed
 */
export function jsonParser(input: any) {
  try {
    return { value: sjs.parse(input, { protoAction: "remove" }) };
  } catch (err) {
    return { err };
  }
}
