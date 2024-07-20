import { forIn, isArray } from 'lodash';
import { DifferenceByProps, ErrorType, GenericObjectType } from './generics';

/**
 * @description verifies object is null or undefined, if 'yes' return true.
 * @param value type any
 * @returns boolean
 */
export const isNullOrUndefined = (value: unknown): boolean => {
  return value === null || value === undefined;
};

/**
 *
 * @param value
 * @returns
 */
export const isDate = (value: Date | string | number): boolean => {
  try {
    return !isNaN(new Date(value).getTime());
  } catch (e) {
    return false;
  }
};

/**
 *
 * @param value
 * @returns
 */
export const isObject = (value: unknown): boolean => {
  return !isNullOrUndefined(value) ? typeof value === 'object' : false;
};

/**
 * Add leading '0' to the either to month or day
 * @param value type number
 * @returns number or string
 */
export const leadZeroForMonthOrDay = (value: number): number | string => {
  return value < 10 ? `0${value}` : value;
};

/**
 *
 * @param value
 * @returns
 */
export const objectNonShadowCopy = (value: any): any => {
  return JSON.parse(JSON.stringify(value));
};

export const objectNonShadowCopy = <T>(value: any): T => {
  return JSON.parse(JSON.stringify(value));
};

/**
 * Calculate number of days, hours, minutes and seconds remaining for given seconds
 * @param value type 'number'
 * @returns an object consists number of days, hours, minutes and seconds remaining
 */
export const daysTimeFromSeconds = (
  seconds: number
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
  };
};

/**
 *
 * @param value
 * @returns
 */
export const remainingDaysHoursFormTwoDates = (
  startDate: Date,
  finish: Date
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} | null => {
  try {
    if (finish.getTime() > startDate.getTime()) {
      return daysTimeFromSeconds(
        (finish.getTime() - startDate.getTime()) / 1000
      );
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

/**
 *
 * @param value
 * @returns
 */
export const remainingDaysHoursFormSeconds = (
  seconds: number
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} | null => {
  try {
    return daysTimeFromSeconds(seconds);
  } catch (error) {
    return null;
  }
};

/**
 * verifies object length equals to 0, if 'yes' return true.
 * @param value type any
 * @returns boolean
 */
export const isEmpty = (value: string | object[]): boolean => {
  // we don't check for string here so it also works with arrays
  return value == null || value.length === 0;
};

export const hasValidLength = (value: any): boolean => {
  // non-strict comparison is intentional, to check for both `null` and `undefined` values
  return value != null && typeof value.length === 'number';
};

/**
 * verifies object is null or undefined and length equals to 0, if 'yes' return true.
 * @param value type any
 * @returns boolean
 */
export const isNullOrUndefinedEmpty = (value: any): boolean => {
  return isNullOrUndefined(value) && isEmpty(value);
};

/**
 * verifies object is empty & it's props, if 'yes' return true.
 * @param value type any
 * @returns boolean
 */
export const isEmptyInDepth = <T>(value: T): boolean => {
  if (isNullOrUndefined(value)) {
    return true;
  } else {
    let keyLength = 0;
    let emptyValues = 0;
    forIn(value, (v, key) => {
      keyLength += 1;
      switch (typeof v) {
        case 'boolean':
          emptyValues += v === false ? 1 : 0;
          break;

        case 'string':
          emptyValues += v.length <= 0 ? 1 : 0;
          break;
        case 'object':
          if (isNullOrUndefined(v)) {
            emptyValues += 1;
          } else {
            emptyValues += v.length <= 0 ? 1 : 0;
          }

          break;
      }
    });
    return keyLength === emptyValues;
  }
};

export type UnCapitalizeObjectKeys<T> = {
  [key in keyof T as Uncapitalize<key & string>]: T[key] extends Object
    ? UnCapitalizeObjectKeys<T[key]>
    : T[key];
};

/**
 *
 * @param obj
 * @returns camelCase notation object
 */
export const toCamelCaseKeys = <T extends object>(
  obj: T
): UnCapitalizeObjectKeys<T> | UnCapitalizeObjectKeys<T[]> => {
  return isArray(obj)
    ? obj.map((o) => toCamelCaseKeys(o))
    : camelCaseKeysHelper(obj);
};

export const camelCaseKeysHelper = <T extends object>(
  obj: T
): UnCapitalizeObjectKeys<T> => {
  const entries = Object.entries(obj);

  const mappedEntries = entries.map(([k, v]) => [
    `${k.slice(0, 1).toLowerCase()}${k.slice(1)}`,
    isObject(v) ? toCamelCaseKeys(v) : v,
  ]);

  return Object.fromEntries(mappedEntries) as UnCapitalizeObjectKeys<T>;
};

/** difference between two objects
 * return an array object with differed property its source object
 * and its destination object values respectively
 */
export const objectDifferenceByProps = <T extends object>(
  sourceObject: T | null,
  destinationObject: T | null
): DifferenceByProps<T> => {
  const differenceProps: {
    property: string;
    destinationValue: T[keyof T];
    sourceValue: T[keyof T];
  }[] = [];

  if (isNullOrUndefined(sourceObject) || isNullOrUndefined(destinationObject)) {
    return {
      status: false,
      differenceProps,
      error: `source or destination is null `,
    };
  }

  if (
    Object.keys(sourceObject!).length !== Object.keys(destinationObject!).length
  ) {
    return {
      differenceProps,
      status: false,
      error: `object props length not matched`,
    };
  }

  if (
    !isNullOrUndefined(sourceObject) &&
    !isNullOrUndefined(destinationObject)
  ) {
    for (const prop in sourceObject) {
      if (prop in sourceObject && prop in destinationObject!) {
        switch (typeof sourceObject[prop]) {
          case 'object':
            objectDifferenceByProps(
              sourceObject[prop],
              destinationObject![prop] as object
            );

            break;

          default:
            if (sourceObject[prop] !== destinationObject![prop]) {
              differenceProps.push({
                property: prop,
                sourceValue: sourceObject[prop],
                destinationValue: destinationObject![prop],
              });
            }
            break;
        }
      }
    }
  }

  return {
    status: true,
    differenceProps,
    error: ``,
  };
};

export const genericObjectTypeFn = <T extends string, U>(
  key: T,uynii
  rValue: U
): GenericObjectType<T, U> => ({ [key]: rValue } as GenericObjectType<T, U>);

/**
 * @description
 * @param arr1
 * @param arr2
 * @returns
 */
export const compareObjectArraysWithTypeSafe = <T extends object[]>(
  arr1: T[],
  arr2: T[]
): { status: boolean; error: ErrorType } => {
  if (arr1.length !== arr2.length) {
    return { status: false, error: `arg array length not matched` };
  }

  for (let i = 0; i < arr1.length; i++) {
    const obj1 = arr1[i];
    const obj2 = arr2[i];

    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return { status: false, error: `object props length not matched` };
    }

    for (const key in obj1) {
      if (!(key in obj2)) {
        return {
          status: false,
          error: `object key does not exits in compared array object`,
        };
      }

      if (typeof obj1[key] !== typeof obj2[key]) {
        return { status: false, error: `object type does not matched` };
      }
      return { status: false, error: null };
    }
  }
  return { status: false, error: null };
};
