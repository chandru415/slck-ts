import type { CompareOptions, ErrorType } from '../types';
import { isNil, isNilOrEmpty, isObject, isEmptyInDepth } from '../guards';

// ─── Object Comparison ───────────────────────────────────────────────────────

/**
 * Returns the differences between two objects as an array of property-level diffs.
 */
export const objectDifferenceByProps = (
  sourceObject: Record<string, unknown>,
  destinationObject: Record<string, unknown>,
): {
  property: string;
  sourceValue: unknown;
  destinationValue: unknown;
}[] => {
  const diffProps: {
    property: string;
    sourceValue: unknown;
    destinationValue: unknown;
  }[] = [];

  if (isNilOrEmpty(sourceObject) && isNilOrEmpty(destinationObject)) {
    return diffProps;
  }

  for (const prop in sourceObject) {
    if (
      Object.prototype.hasOwnProperty.call(sourceObject, prop) &&
      Object.prototype.hasOwnProperty.call(destinationObject, prop)
    ) {
      if (
        isObject(sourceObject[prop]) &&
        isObject(destinationObject[prop])
      ) {
        const nested = objectDifferenceByProps(
          sourceObject[prop] as Record<string, unknown>,
          destinationObject[prop] as Record<string, unknown>,
        );
        diffProps.push(...nested.map((d) => ({ ...d, property: `${prop}.${d.property}` })));
      } else if (sourceObject[prop] !== destinationObject[prop]) {
        diffProps.push({
          property: prop,
          sourceValue: sourceObject[prop],
          destinationValue: destinationObject[prop],
        });
      }
    }
  }

  return diffProps;
};

/**
 * Type-safe comparison of two object arrays. Returns result and error message if mismatch.
 */
export const compareObjectArrays = <T extends object>(
  arr1: T[],
  arr2: T[],
): { result: boolean; error: ErrorType } => {
  if (arr1.length !== arr2.length) {
    return { result: false, error: 'Array lengths do not match' };
  }

  for (let i = 0; i < arr1.length; i++) {
    const obj1 = arr1[i];
    const obj2 = arr2[i];
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return { result: false, error: `Object at index ${i} has a different number of keys.` };
    }

    for (const key of keys1) {
      if (!(key in obj2)) {
        return { result: false, error: `Key "${key}" at index ${i} does not exist in the other object.` };
      }
      if (typeof (obj1 as Record<string, unknown>)[key] !== typeof (obj2 as Record<string, unknown>)[key]) {
        return { result: false, error: `Key "${key}" at index ${i} has a type mismatch.` };
      }
    }
  }

  return { result: true, error: null };
};

/**
 * @deprecated Use `compareObjectArrays` instead.
 */
export const compareObjectArraysWithTypeSafe = compareObjectArrays;

/**
 * Deep comparison across multiple objects. Returns common values and differences.
 */
export function extractCommonAndDifferentValues(
  objects: Record<string, unknown>[],
  options: CompareOptions = {},
): { same: Record<string, unknown>; diff: Record<string, unknown> } {
  if (!objects || objects.length < 2) return { same: {}, diff: {} };

  const { skipKeys = [], compareKeys, ignoreArrayOrder = false } = options;
  const same: Record<string, unknown> = {};
  const diff: Record<string, unknown> = {};

  const allKeys = Array.from(
    new Set(objects.flatMap((obj) => extractKeys(obj))),
  ).filter((key) => {
    if (compareKeys) return compareKeys.includes(key);
    return !skipKeys.includes(key);
  });

  for (const key of allKeys) {
    const values = objects.map((obj) => getByPath(obj, key));
    const allEqual = values.every((val) => isEqualDeep(val, values[0], ignoreArrayOrder));
    setByPath(allEqual ? same : diff, key, values[0]);
  }

  return { same, diff };
}

/**
 * Checks whether there are duplicate objects based on one or more keys.
 */
export const hasDuplicateByKeys = <T extends Record<string, unknown>>(
  arr: T[],
  ...keys: (keyof T)[]
): boolean => {
  const seen = new Set<string>();
  for (const item of arr) {
    const keyCombo = keys.map((key) => String(item[key])).join('|');
    if (seen.has(keyCombo)) return true;
    seen.add(keyCombo);
  }
  return false;
};

/**
 * Checks if any record in the array has empty values for the given compare keys.
 */
export const isAnyRecordWithEmptyValues = <T extends Record<string, unknown>>(
  records: T[],
  compareKeys: (keyof T)[],
  skipKeys: (keyof T)[] = [],
): boolean => {
  return records.some((record) =>
    compareKeys
      .filter((key) => !skipKeys.includes(key))
      .some((key) => isEmptyInDepth(record[key])),
  );
};

// ─── Internal Helpers ────────────────────────────────────────────────────────

function extractKeys(obj: unknown, prefix = ''): string[] {
  if (!isObject(obj)) return [];
  return Object.entries(obj).flatMap(([key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (isObject(val)) return extractKeys(val, fullKey);
    return fullKey;
  });
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (isObject(o) ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function setByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    current[k] = (current[k] as Record<string, unknown>) || {};
    current = current[k] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function isEqualDeep(a: unknown, b: unknown, ignoreOrder: boolean): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (ignoreOrder) {
      return a.length === b.length && [...a].sort().toString() === [...b].sort().toString();
    }
    return JSON.stringify(a) === JSON.stringify(b);
  }
  if (isObject(a) && isObject(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return a === b;
}
