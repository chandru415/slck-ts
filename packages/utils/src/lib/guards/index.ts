// ─── Type Guards ─────────────────────────────────────────────────────────────
// Pure functions, no dependencies. All use `unknown` with proper narrowing.

/**
 * Returns true if the value is null or undefined.
 */
export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

/**
 * @deprecated Use `isNil` instead.
 */
export const isNullOrUndefined = (value: unknown): value is null | undefined =>
  isNil(value);

/**
 * Returns true if the value is a valid Date or a parseable date string.
 */
export const isDate = (value: unknown): boolean => {
  if (value instanceof Date) return !isNaN(value.getTime());
  if (typeof value === 'string' || typeof value === 'number') {
    return !isNaN(new Date(value).getTime());
  }
  return false;
};

/**
 * Returns true if the value resembles an ISO 8601 date string or a Date object.
 */
export const isDateLike = (value: unknown): boolean => {
  if (!value) return false;
  if (value instanceof Date) return true;
  return (
    typeof value === 'string' &&
    !isNaN(Date.parse(value)) &&
    /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)
  );
};

/**
 * Returns true if the value is a non-null object (excludes arrays).
 */
export const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Returns true if the value is empty (null, undefined, empty string, empty array, empty object).
 */
export const isEmpty = (value: unknown): boolean => {
  if (isNil(value)) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

/**
 * Returns true if the value has a numeric `length` property.
 */
export const hasValidLength = (value: unknown): boolean =>
  value != null && typeof (value as { length?: unknown }).length === 'number';

/**
 * Returns true if the value is null, undefined, or empty.
 */
export const isNilOrEmpty = (value: unknown): boolean =>
  isNil(value) || isEmpty(value);

/**
 * @deprecated Use `isNilOrEmpty` instead.
 */
export const isNullOrUndefinedEmpty = (value: unknown): boolean =>
  isNilOrEmpty(value);

/**
 * Returns true if every property of the object is falsy/empty.
 */
export const isEmptyInDepth = (value: unknown): boolean => {
  if (isNil(value)) return true;
  if (!isObject(value)) return isEmpty(value);

  const entries = Object.entries(value);
  if (entries.length === 0) return true;

  return entries.every(([, v]) => {
    if (typeof v === 'boolean') return v === false;
    if (typeof v === 'string') return v.length === 0;
    if (isNil(v)) return true;
    if (isObject(v)) return Object.keys(v).length === 0;
    return false;
  });
};

/**
 * Returns true if the value is a valid ISO date string that is NOT the .NET default date.
 */
export const hasValidDate = (date: string | Date): boolean =>
  String(date) !== '0001-01-01T00:00:00';

/**
 * Type guard for EndpointConfig shape.
 */
export const isEndpointConfig = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['path'] === 'string' &&
    typeof obj['verb'] === 'string' &&
    ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'].includes(obj['verb'] as string)
  );
};
