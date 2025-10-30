export const isNullOrUndefined = (value: any): value is null | undefined => value === null || value === undefined;

export function isNullOrEmptyOrUndefined(value?: any | null): value is null | undefined {
  return value === undefined || value === null || value === "" || value.toString().trim() === "";
}
