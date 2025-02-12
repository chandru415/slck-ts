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
