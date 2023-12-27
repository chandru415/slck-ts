export type GenericObjectType<T extends string, U> = {
  [key in T]: U;
};

export type ErrorType = string | object | null | number | boolean;
