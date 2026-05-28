// ─── Generic Utility Types ───────────────────────────────────────────────────

/**
 * Creates an object type with a single key of type T mapped to value of type U.
 */
export type GenericObjectType<T extends string, U> = {
  [key in T]: U;
};

/**
 * Broad error representation for cross-project use.
 */
export type ErrorType = string | object | null | number | boolean;

// ─── HTTP Types ──────────────────────────────────────────────────────────────

/**
 * HTTP verbs supported by API configurations.
 */
export const HttpVerb = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
} as const;

export type HttpVerb = (typeof HttpVerb)[keyof typeof HttpVerb];

/**
 * Path or query parameters for URL construction.
 */
export interface PathQueryParams {
  [key: string]: string | number | Date | boolean;
}

/**
 * Configuration for a single API endpoint.
 */
export interface EndpointConfig {
  /** Relative path (e.g., 'tenants/:id/users') */
  path: string;
  /** HTTP method */
  verb: HttpVerb;
}

/**
 * A typed registry of endpoint keys to their config.
 */
export type EndpointRegistry = Record<string, EndpointConfig>;

/**
 * Legacy endpoint configuration (backward-compatible).
 * @deprecated Use `EndpointConfig` with `path` instead of `uri`.
 */
export interface LegacyEndpointConfig {
  uri: string;
  verb: HttpVerb;
  pathParams?: PathQueryParams[];
  queryParams?: PathQueryParams[];
  body?: Record<string, unknown> | string | null;
}

// ─── Key Casing Utilities ────────────────────────────────────────────────────

/**
 * Recursively uncapitalizes all object keys.
 */
export type UnCapitalizeObjectKeys<T> = {
  [key in keyof T as Uncapitalize<key & string>]: T[key] extends object
    ? UnCapitalizeObjectKeys<T[key]>
    : T[key];
};

// ─── Comparison Types ────────────────────────────────────────────────────────

/**
 * Options for deep object comparison.
 */
export interface CompareOptions {
  /** Keys to ignore during comparison */
  skipKeys?: string[];
  /** If provided, only these keys are compared */
  compareKeys?: string[];
  /** Whether to ignore array element order */
  ignoreArrayOrder?: boolean;
}

// ─── Number-to-Text Scales ───────────────────────────────────────────────────

export interface Scale {
  value: number;
  name: string;
  plural?: string;
}

export const SCALES: Scale[] = [
  { value: 1e15, name: 'quadrillion' },
  { value: 1e12, name: 'trillion' },
  { value: 1e9, name: 'billion' },
  { value: 1e6, name: 'million' },
  { value: 1e3, name: 'thousand' },
];

export const UNITS: string[] = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
];

export const TEENS: string[] = [
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen',
];

export const TENS: string[] = [
  '', 'ten', 'twenty', 'thirty', 'forty', 'fifty',
  'sixty', 'seventy', 'eighty', 'ninety',
];

// ─── API Response Types (cross-project) ──────────────────────────────────────

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  errors?: string[];
  timestamp?: string;
}

/**
 * Paginated API response.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Sort descriptor for API queries.
 */
export interface SortDescriptor {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter descriptor for API queries.
 */
export interface FilterDescriptor {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'startsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: unknown;
}

/**
 * Combined query parameters for list endpoints.
 */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sort?: SortDescriptor[];
  filters?: FilterDescriptor[];
  search?: string;
}
