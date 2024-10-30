import { isArray } from 'lodash';
import { ErrorType, GenericObjectType } from './generics';

/**
 * verifies object is null or undefined, if 'yes' return true.
 * @param value type any
 * @returns boolean
 */
export const isNullOrUndefined = (value: any): boolean => {
  return value === null || value === undefined;
};

/**
 *
 * @param value
 * @returns
 */
export const isDate = (value: any): boolean => {
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
export const isObject = (value: any): boolean => {
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
export const isEmpty = (value: any): boolean => {
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
  return isNullOrUndefined(value) || isEmpty(value);
};

/**
 * verifies object is empty & it's props, if 'yes' return true.
 * @param value type any
 * @returns boolean
 */
export const isEmptyInDepth = (value?: any): boolean => {
  if (isNullOrUndefined(value)) {
    return true;
  } else {
    let emptyValues = 0;
    Object.entries(value).every(([key, v]) => {
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
            emptyValues += Object.entries(value).length <= 0 ? 1 : 0;
          }

          break;
      }
    });
    return Object.entries(value).length === emptyValues;
  }
};

export type UnCapitalizeObjectKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
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
export const objectDifferenceByProps = (
  sourceObject: any,
  destinationObject: any
): {
  property: string;
  destinationValue: object | string | number | Date;
  sourceValue: object | string | number | Date;
}[] => {
  const diffProps: {
    property: string;
    destinationValue: object | string | number | Date;
    sourceValue: object | string | number | Date;
  }[] = [];

  if (
    isNullOrUndefinedEmpty(sourceObject) &&
    isNullOrUndefinedEmpty(destinationObject)
  ) {
    return diffProps;
  }

  for (const prop in sourceObject) {
    if (
      // eslint-disable-next-line no-prototype-builtins
      sourceObject.hasOwnProperty(prop) &&
      // eslint-disable-next-line no-prototype-builtins
      destinationObject.hasOwnProperty(prop)
    ) {
      switch (typeof sourceObject[prop]) {
        case 'object':
          objectDifferenceByProps(sourceObject[prop], destinationObject[prop]);
          break;

        default:
          if (sourceObject[prop] !== destinationObject[prop]) {
            diffProps.push({
              property: prop,
              sourceValue: sourceObject[prop],
              destinationValue: destinationObject[prop],
            });
          }
          break;
      }
    }
  }

  return diffProps;
};

export const genericObjectTypeFn = <T extends string, U>(
  key: T,
  rValue: U
): GenericObjectType<T, U> => ({ [key]: rValue } as GenericObjectType<T, U>);

/**
 *
 * @param arr1
 * @param arr2
 * @returns { result: boolean; error: ErrorType }
 */
export const compareObjectArraysWithTypeSafe = <T extends object[]>(
  arr1: T[],
  arr2: T[]
): { result: boolean; error: ErrorType } => {
  if (arr1.length !== arr2.length) {
    return {
      result: false,
      error: `compare object array length are not matched`,
    };
  }

  for (let i = 0; i < arr1.length; i++) {
    const obj1 = arr1[i];
    const obj2 = arr2[i];

    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return { result: false, error: `compare objects length are not matched` };
    }

    for (const key in obj1) {
      if (!(key in obj2)) {
        return {
          result: false,
          error: `compare object key not exists in other`,
        };
      }

      if (typeof obj1[key] !== typeof obj2[key]) {
        return { result: false, error: `compare object type are not matched` };
      }
      return { result: true, error: null };
    }
  }
  return { result: true, error: null };
};

/**
 * @description bring the element to the first by searchWith
 * @param items Type of array
 * @param key key of the object inside the array
 * @param searchWith search key either string, number or boolean
 * @param isConvertStringToLowerCase by default is true
 * @returns modified object array
 */
export const shiftToFristWith = <T>(
  items: T[],
  key: keyof T,
  searchWith: string | number | boolean,
  isConvertStringToLowerCase = true
): T[] => {
  items.forEach((value, index) => {
    switch (typeof value[key]) {
      case 'string':
        if (
          isConvertStringToLowerCase
            ? (value[key] as string).toLowerCase() ===
              (searchWith as string).toLowerCase()
            : value[key] === searchWith
        ) {
          items.splice(index, 1);
          items.unshift(value);
        }
        break;

      case 'boolean':
        if (value[key] === searchWith) {
          items.splice(index, 1);
          items.unshift(value);
        }
        break;

      case 'number':
        if (value[key] === searchWith) {
          items.splice(index, 1);
          items.unshift(value);
        }
        break;

      default:
        break;
    }
  });
  return items;
};

/**
 * @description Return `true` if the property values match in the collection of objects.
 * @param object T
 * @param collection T[]
 * @param prop key of T
 * @returns boolean
 */
export const checkObjectPropValueExistsInCollection = <T>(
  object: T,
  collection: T[],
  prop: keyof T
) => collection.some((c) => c[prop] === object[prop]);

/**
 *
 * @param minutes number of minutes
 * @param unitOfHours like 'h', 'hrs'
 * @param unitOfminutes like 'min', 'm'
 * @returns
 */
export const convertMinutesToTimeText = (
  minutes: number,
  unitOfHours: string,
  unitOfminutes: string
) => {
  return `${Math.floor(minutes / 60)} ${unitOfHours} ${Math.floor(
    minutes % 60
  )} ${unitOfminutes}`;
};

/**
 *
 * @param text
 * @param seperator
 * @returns
 */
export const firstLetterFromString = (
  text: string,
  seperator = ' '
): string => {
  return text
    ? text
        .split(`${seperator}`)
        .map((s) => (s ? s[0].toUpperCase() : ''))
        .join('')
    : ``;
};
