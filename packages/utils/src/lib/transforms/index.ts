import type { UnCapitalizeObjectKeys } from '../types';
import { isNil, isObject } from '../guards';

// ─── Object Key Transforms ───────────────────────────────────────────────────

/**
 * Recursively converts all object keys to camelCase (first letter lowered).
 * Handles both single objects and arrays of objects.
 */
export const toCamelCaseKeys = <T extends object>(
  obj: T,
): UnCapitalizeObjectKeys<T> | UnCapitalizeObjectKeys<T[]> => {
  if (Array.isArray(obj)) {
    return obj.map((o) => toCamelCaseKeys(o)) as UnCapitalizeObjectKeys<T[]>;
  }
  return camelCaseKeysHelper(obj);
};

const camelCaseKeysHelper = <T extends object>(
  obj: T,
): UnCapitalizeObjectKeys<T> => {
  const entries = Object.entries(obj);
  const mappedEntries = entries.map(([k, v]) => [
    `${k.slice(0, 1).toLowerCase()}${k.slice(1)}`,
    isObject(v) ? toCamelCaseKeys(v as object) : v,
  ]);
  return Object.fromEntries(mappedEntries) as UnCapitalizeObjectKeys<T>;
};

// ─── Value Transforms ────────────────────────────────────────────────────────

/**
 * Deep clones an object using JSON serialization.
 * Does NOT handle circular references, Dates, or functions.
 */
export const deepClone = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value));

/**
 * @deprecated Use `deepClone` instead.
 */
export const objectNonShadowCopy = deepClone;

/**
 * Recursively trims all string values in an object.
 * Handles circular references via WeakSet.
 */
export const trimObjectValues = <T>(obj: T, seen = new WeakSet()): T => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (seen.has(obj as object)) return obj;
  seen.add(obj as object);

  const result = (Array.isArray(obj) ? [] : {}) as Record<string, unknown>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as Record<string, unknown>)[key];
      if (typeof value === 'string') {
        result[key] = value.trim();
      } else if (typeof value === 'object' && value !== null) {
        result[key] = trimObjectValues(value, seen);
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
};

// ─── String Transforms ───────────────────────────────────────────────────────

/**
 * Adds a space before each uppercase letter in a camelCase/PascalCase string.
 */
export const addSpacesToCamelCase = (input: string): string =>
  input.replace(/([A-Z])/g, ' $1').trim();

/**
 * Extracts the first letter from each word, upper-cased.
 */
export const initials = (text: string, separator = ' '): string =>
  text
    ? text
        .split(separator)
        .map((s) => (s ? s[0].toUpperCase() : ''))
        .join('')
    : '';

/**
 * @deprecated Use `initials` instead.
 */
export const convertFirstLetterToUpper = initials;

/**
 * Converts a string from camelCase, PascalCase, snake_case, or kebab-case
 * into a human-readable Title Case string.
 *
 * @param value - The input string to format
 * @param acronyms - Optional set or array of acronyms to preserve (e.g., ['ID', 'API'])
 */
export const toReadableTitle = (
  value: string,
  acronyms?: Set<string> | string[],
): string => {
  const acronymSet = acronyms
    ? new Set(
        (Array.isArray(acronyms) ? acronyms : [...acronyms]).map((a) =>
          a.toUpperCase(),
        ),
      )
    : undefined;

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      const upperWord = word.toUpperCase();
      if (acronymSet?.has(upperWord)) return upperWord;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Returns true if a string is a palindrome (ignoring non-alphanumeric chars).
 */
export const isPalindrome = (str: string): boolean => {
  const cleaned = str.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  return cleaned === cleaned.split('').reverse().join('');
};

// ─── Case Transforms ─────────────────────────────────────────────────────────

/**
 * Converts a string to Title Case (each word capitalized).
 * @example toTitleCase('hello world') → 'Hello World'
 */
export const toTitleCase = (str: string): string =>
  str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Converts a string to sentence case (lowercase, first char upper).
 * @example toSentenceCase('HELLO WORLD') → 'Hello world'
 */
export const toSentenceCase = (str: string): string =>
  str
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

/**
 * Converts a field/property name into a human-readable header.
 * Handles snake_case, camelCase, and PascalCase.
 * @example formatHeader('user_firstName') → 'User First Name'
 */
export const formatHeader = (field: string): string =>
  field
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .replace(/^./, (m) => m.toUpperCase())
    .trim();

/**
 * Separates camelCase/PascalCase into words with Title Case.
 * @example insertSpacesBetween('firstName') → 'First Name'
 */
export const insertSpacesBetween = (value: string): string =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (txt) => txt.toUpperCase());

// ─── Value Coercion ──────────────────────────────────────────────────────────

/**
 * Normalizes any value to a trimmed, lowercased string.
 * Returns '' for null/undefined.
 */
export const normalizeString = (val: unknown): string =>
  (val == null ? '' : String(val)).trim().toLowerCase();

/**
 * Coerces any value to a number; returns 0 for NaN.
 */
export const safeNumber = (val: unknown): number => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

/**
 * Splits a comma-separated string into a trimmed, non-empty array.
 * Returns [] for null/undefined/empty input.
 * @example splitByComma('a, b, , c') → ['a', 'b', 'c']
 */
export const splitByComma = (input: string | null | undefined): string[] => {
  if (!input) return [];
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/**
 * Converts hours and minutes into total minutes.
 */
export const toMinutes = (hours = 0, minutes = 0): number =>
  Number(hours) * 60 + Number(minutes);
