export function isPrimitive(value: unknown): boolean {
  return (typeof value !== "object" && typeof value !== "function") || value === null || value instanceof Date;
}
