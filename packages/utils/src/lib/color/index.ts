// ─── Color Utilities ─────────────────────────────────────────────────────────

/**
 * Generates a random hex color code (excluding pure black and white).
 */
export const randomColor = (): string => {
  let color: string;
  do {
    color = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`;
  } while (color === '#000000' || color === '#ffffff');
  return color;
};

/**
 * @deprecated Use `randomColor` instead.
 */
export const generateRandomColorFn = randomColor;
