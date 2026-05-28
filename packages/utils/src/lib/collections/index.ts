// ─── Array & Collection Utilities ─────────────────────────────────────────────

/**
 * Moves the first element matching the search criteria to the front of the array.
 * Returns a new array — does NOT mutate the original.
 */
export const shiftToFirst = <T>(
  items: T[],
  key: keyof T,
  searchWith: string | number | boolean,
  caseInsensitive = true,
): T[] => {
  const result = [...items];
  const index = result.findIndex((item) => {
    const val = item[key];
    if (typeof val === 'string' && typeof searchWith === 'string') {
      return caseInsensitive
        ? val.toLowerCase() === searchWith.toLowerCase()
        : val === searchWith;
    }
    return val === searchWith;
  });

  if (index > 0) {
    const [found] = result.splice(index, 1);
    result.unshift(found);
  }

  return result;
};

/**
 * @deprecated Use `shiftToFirst` instead.
 */
export const shiftToFristWith = shiftToFirst;

/**
 * Filters source array to items whose key value exists in the selection array.
 */
export function selectMatchingByKeys<
  TSource extends Record<string, unknown>,
  TMatch extends Record<string, unknown>,
>(
  sourceArray: TSource[],
  selectionArray: TMatch[],
  sourceKey: keyof TSource,
  matchKey: keyof TMatch,
): TSource[] {
  const selectedValues = new Set<unknown>(
    selectionArray.map((item) => item[matchKey]),
  );
  return sourceArray.filter((item) => selectedValues.has(item[sourceKey]));
}

/**
 * @deprecated Use `selectMatchingByKeys` instead.
 */
export const selectMatchingObjectsByKeys = selectMatchingByKeys;

/**
 * Returns true if an object's property value exists in the given collection.
 */
export const existsInCollection = <T>(
  object: T,
  collection: T[],
  prop: keyof T,
): boolean => collection.some((c) => c[prop] === object[prop]);

/**
 * @deprecated Use `existsInCollection` instead.
 */
export const checkObjectPropValueExistsInCollection = existsInCollection;

/**
 * Returns an array of multiples of a given number within a range [start, end].
 */
export const multiplesInRange = (
  start: number,
  end: number,
  multiple: number,
): number[] => {
  const result: number[] = [];
  const first = Math.ceil(start / multiple) * multiple;
  for (let i = first; i <= end; i += multiple) {
    result.push(i);
  }
  return result;
};

/**
 * @deprecated Use `multiplesInRange` instead.
 */
export const generateMultiplesInRange = multiplesInRange;

/**
 * Builds a tree structure from a flat array using a delimiter-based path key.
 */
export const buildTree = <TItem, TNode extends Record<string, unknown>>(
  data: TItem[],
  childrenKey: keyof TNode,
  valueKey: keyof TItem,
  nodeValueKey: keyof TNode,
  delimiter = '.',
): TNode[] => {
  const root: TNode[] = [];

  for (const obj of data) {
    const parts = String(obj[valueKey]).split(delimiter);
    addToTree(parts, obj, root, childrenKey, nodeValueKey, delimiter);
  }

  return root;
};

/**
 * @deprecated Use `buildTree` instead.
 */
export const constructTreeRecursively = buildTree;

function addToTree<TItem, TNode extends Record<string, unknown>>(
  parts: string[],
  rootRef: TItem,
  nodeList: TNode[],
  childrenKey: keyof TNode,
  valueKey: keyof TNode,
  delimiter: string,
): void {
  if (parts.length === 0) return;
  const [current, ...rest] = parts;

  let node = nodeList.find((n) => n[valueKey] === current);

  if (!node) {
    node = {
      ...rootRef,
      [valueKey]: current,
      [childrenKey]: [],
    } as unknown as TNode;
    nodeList.push(node);
  }

  const children = node[childrenKey] as unknown as TNode[];
  addToTree(rest, rootRef, children, childrenKey, valueKey, delimiter);
}

/**
 * Creates a single-key object from a key-value pair (typed).
 */
export const keyValueObject = <T extends string, U>(
  key: T,
  value: U,
): Record<T, U> => ({ [key]: value } as Record<T, U>);

/**
 * @deprecated Use `keyValueObject` instead.
 */
export const genericObjectTypeFn = keyValueObject;

// ─── Tree Filter ─────────────────────────────────────────────────────────────

/**
 * Recursively filters a tree structure by a search string across specified keys.
 * Returns matching nodes with ancestors preserved (auto-expanded).
 *
 * @param nodes - The root-level tree nodes.
 * @param searchText - String to search for (case-insensitive).
 * @param keys - Object keys to search within.
 * @param childrenKey - The key holding child nodes (default: 'children').
 */
export function filterTree<
  T extends Record<string, unknown>,
>(
  nodes: T[],
  searchText: string,
  keys: (keyof T)[],
  childrenKey: keyof T = 'children' as keyof T,
): T[] {
  const text = searchText.trim().toLowerCase();
  if (!text) return nodes;

  const matchItem = (item: T): boolean =>
    keys.some((key) => {
      const val = item[key];
      return val != null && String(val).toLowerCase().includes(text);
    });

  const filterNodes = (items: T[]): T[] =>
    items
      .map((item) => {
        const children = Array.isArray(item[childrenKey])
          ? filterNodes(item[childrenKey] as T[])
          : [];
        if (matchItem(item) || children.length > 0) {
          return {
            ...item,
            [childrenKey]: children,
            expanded: children.length > 0 || Boolean((item as Record<string, unknown>).expanded),
          } as T;
        }
        return null;
      })
      .filter((i): i is T => i !== null);

  return filterNodes(nodes);
}
