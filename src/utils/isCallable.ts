export function isCallable(value: any): value is CallableFunction {
  return typeof value === "function";
}
