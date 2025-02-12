import { isArray } from 'lodash';
import { EndpointConfig, ErrorType, GenericObjectType, UnCapitalizeObjectKeys } from './generics';

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
    Object.entries(value).forEach(([key, v]) => {
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
export const compareObjectArraysWithTypeSafe = <T extends object>(
  arr1: T[],
  arr2: T[]
): { result: boolean; error: ErrorType } => {
  if (arr1.length !== arr2.length) {
    return {
      result: false,
      error: `Array lengths do not match`,
    };
  }

  for (let i = 0; i < arr1.length; i++) {
    const obj1 = arr1[i];
    const obj2 = arr2[i];

    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return {
        result: false,
        error: `Object at index ${i} has a different number of keys.`,
      };
    }

    for (const key in obj1) {
      if (!(key in obj2)) {
        return {
          result: false,
          error: `Key "${key}" in object at index ${i} does not exist in the other object.`,
        };
      }

      if (typeof obj1[key] !== typeof obj2[key]) {
        return {
          result: false,
          error: `Key "${key}" in object at index ${i} has a type mismatch.`,
        };
      }
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
export const convertFirstLetterToUpper = (
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

/**
 *
 * @param data is a collection of T
 * @param childrenKey children key property in K
 * @param valueKey value key which used for split or run logic
 * @param valueKeyForTree value to holds the conversion value from valueKey
 * @param delimiter string spearator
 * @returns a collection of K
 */
export const constructTreeRecursively = <T, K>(
  data: T[],
  childrenKey: keyof K,
  valueKey: keyof T,
  valueKeyForTree: keyof K,
  delimiter = '.'
): K[] => {
  const root: K[] = [];

  data.forEach((obj) => {
    const parts = (obj[valueKey] as string).split(delimiter);
    addPathToTreeRecursively<K, T>(
      parts,
      obj,
      root,
      childrenKey,
      valueKeyForTree
    );
  });

  return root;
};

const addPathToTreeRecursively = <K, T>(
  parts: string[],
  rootobjectReference: T,
  nodeList: K[],
  childrenKey: keyof K,
  valueKey: keyof K,
  delimiter = '.'
) => {
  if (parts.length === 0) {
    return;
  }
  const [current, ...rest] = parts;

  // Find the current node in the existing tree
  let node = nodeList.find((n) => n[valueKey] === current);

  if (!node) {
    // If the node doesn't exist, create it
    node = {
      ...rootobjectReference,
      [valueKey]: current,
      [childrenKey]: [],
    } as K;

    nodeList.push(node);
  }

  const children = node[childrenKey] as K[];

  // Recurse for the rest of the parts
  addPathToTreeRecursively(
    rest,
    rootobjectReference,
    children,
    childrenKey,
    valueKey,
    delimiter
  );
};

export const addSpacesToCamelCase = (input: string) => {
  return input.replace(/([A-Z])/g, ' $1').trim();
};

export const isEndpointConfig = (value: any): value is EndpointConfig => {
  return (
    typeof value === 'object' &&
    typeof value.uri === 'string' &&
    ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'].includes(value.verb) &&
    (value.pathParams === undefined ||
      (Array.isArray(value.pathParams) &&
        value.pathParams.every(
          (param: { key: any }) =>
            typeof param.key === 'string' &&
            Object.prototype.hasOwnProperty.call(param, 'value')
        ))) &&
    (value.queryParams === undefined ||
      (Array.isArray(value.queryParams) &&
        value.queryParams.every(
          (param: { key: any }) =>
            typeof param.key === 'string' &&
            Object.prototype.hasOwnProperty.call(param, 'value')
        ))) &&
    (value.body === undefined ||
      typeof value.body === 'object' ||
      typeof value.body === 'string' ||
      value.body === null)
  );
};

export const trimObjectValues = (obj: any, seen = new WeakSet()): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (seen.has(obj)) {
    return obj;
  }
  seen.add(obj);
  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        result[key] = value.trim();
      } else if (typeof value === 'object' && value !== null) {
        result[key] = trimObjectValues(value, seen);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

export const hasValidDateFn = (date: string | Date): boolean => {
  return date !== '0001-01-01T00:00:00';
};
