/** biome-ignore-all lint/complexity/noBannedTypes: a */
export type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
export type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type ClassConstructor<T> = { new (): T };
export type Self<T> = ClassConstructor<T>;

export type AnyObject = { [key: string]: any };
export type AnyType = string | number | boolean | AnyObject;
