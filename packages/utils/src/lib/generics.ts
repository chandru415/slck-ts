export type GenericObjectType<T extends string, U> = {
  [key in T]: U;
};

export type ErrorType = string | object | null | number | boolean;

export interface PathQueryParams {
  [key: string]: string | number | Date | boolean;
}

export type SlckHttpVerb = 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH'; // Union type for HTTP methods

export interface EndpointConfig {
  uri: string; // Base URL or endpoint URI
  verb: SlckHttpVerb; // HTTP method
  pathParams?: PathQueryParams[]; // Path parameters, optional
  queryParams?: PathQueryParams[]; // Query parameters, optional
  body?: Record<string, any> | string | null; // Request body (flexible for structured or raw data)
}

export type UnCapitalizeObjectKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key in keyof T as Uncapitalize<key & string>]: T[key] extends Object
    ? UnCapitalizeObjectKeys<T[key]>
    : T[key];
};

export type Scale = {
  value: number;
  name: string;
  plural?: string;
};

export const SCALES: Scale[] = [
  { value: 1e15, name: 'quadrillion' },
  { value: 1e12, name: 'trillion' },
  { value: 1e9, name: 'billion' },
  { value: 1e6, name: 'million' },
  { value: 1e3, name: 'thousand' },
];

export const UNITS: string[] = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];
export const TEENS: string[] = [
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
export const TENS: string[] = [
  '',
  'ten',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];


export type CompareOptions = {
  skipKeys?: string[];
  compareKeys?: string[];
  ignoreArrayOrder?: boolean;
};
