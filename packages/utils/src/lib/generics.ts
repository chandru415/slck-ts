export type GenericObjectType<T extends string, U> = {
  [key in T]: U;
};

export type ErrorType = string | object | null | number | boolean;

interface DifferenceProps<T> {
  property: string;
  destinationValue: T[keyof T];
  sourceValue: T[keyof T];
}

export interface DifferenceByProps<T> {
  differenceProps: DifferenceProps<T>[];
  status: boolean;
  error: ErrorType;
}
