/**
 * Generates a random hex color code (excluding white and black).
 * @returns A random hex color code as a string.
 */
export const generateRandomColorFn = (): string => {
  let color: string;
  do {
    // Generate a random hex color code
    color = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`;
  } while (color === '#000000' || color === '#FFFFFF'); // Exclude black and white
  return color;
};
