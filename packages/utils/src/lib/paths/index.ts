// ─── Path & URL Utilities ────────────────────────────────────────────────────
// Pure functions for path manipulation, filename extraction, and URL normalization.

/**
 * Extracts the filename from a file path (supports both Windows `\` and Unix `/`).
 * Returns 'Unknown File' for empty/invalid paths.
 *
 * @example extractFileName('C:\\Users\\docs\\report.pdf') → 'report.pdf'
 * @example extractFileName('/home/user/file.txt') → 'file.txt'
 */
export const extractFileName = (path: string): string => {
  if (!path) return 'Unknown File';
  const parts = path.split(/[\\\/]/);
  return parts[parts.length - 1] || 'Unknown File';
};

/**
 * Joins non-empty string segments with a separator (default: ' > ').
 * Trims each segment; skips null/undefined.
 *
 * @example buildHierarchy(['Project', 'Phase', undefined, 'Task']) → 'Project > Phase > Task'
 */
export const buildHierarchy = (
  segments: (string | undefined | null)[],
  separator = ' > ',
): string =>
  segments
    .map((s) => s?.trim())
    .filter((s): s is string => s != null && s.length > 0)
    .join(separator);

/**
 * Normalizes a URL into an app-relative path.
 * - Absolute URLs → pathname + search + hash
 * - Hash-based URLs (`/#/`, `#/`) → stripped to path
 * - Already relative → ensures leading `/`
 *
 * Returns '' for null/empty input.
 */
export const normalizeUrl = (url: string | null | undefined): string => {
  if (!url || !url.trim()) return '';

  const trimmed = url.trim();

  // Absolute URL → extract pathname + search + hash
  if (/^https?:\/\//i.test(trimmed)) {
    // Strip protocol + host (everything up to the first `/` after `://host`)
    const afterProtocol = trimmed.replace(/^https?:\/\/[^\/]+/i, '');
    return afterProtocol || '/';
  }

  // Hash-based navigation
  if (trimmed.startsWith('/#/')) return trimmed.substring(2);
  if (trimmed.startsWith('#/')) return trimmed.substring(1);
  if (trimmed.startsWith('#')) return `/${trimmed.substring(1)}`;

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

/**
 * Returns a comparable URL by stripping query string and hash.
 * Useful for route matching regardless of query params.
 *
 * @example toComparableUrl('/users?page=1#top') → '/users'
 */
export const toComparableUrl = (url: string): string => {
  const normalized = normalizeUrl(url);
  return normalized.split('?')[0].split('#')[0];
};

/**
 * Builds incremental paths from a full Windows-style path.
 *
 * @example buildIncrementalPaths('C:\\Users\\docs\\file.txt')
 *   → ['C:\\', 'C:\\Users\\', 'C:\\Users\\docs\\', 'C:\\Users\\docs\\file.txt\\']
 */
export const buildIncrementalPaths = (fullPath: string): string[] => {
  if (!fullPath) return [];

  const parts = fullPath.split('\\').filter(Boolean);
  const drive = parts[0] + '\\';

  return parts.slice(1).reduce<string[]>(
    (acc, part) => [...acc, acc[acc.length - 1] + part + '\\'],
    [drive],
  );
};
