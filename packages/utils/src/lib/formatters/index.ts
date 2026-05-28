import { SCALES, TEENS, TENS, UNITS } from '../types';

// ─── Time Formatters ─────────────────────────────────────────────────────────

export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Converts seconds into days, hours, minutes, and seconds.
 */
export const timeFromSeconds = (seconds: number): TimeParts => ({
  days: Math.floor(seconds / 86400),
  hours: Math.floor(seconds / 3600) % 24,
  minutes: Math.floor(seconds / 60) % 60,
  seconds: seconds % 60,
});

/**
 * @deprecated Use `timeFromSeconds` instead.
 */
export const daysTimeFromSeconds = timeFromSeconds;

/**
 * Calculates time remaining between two dates.
 * Returns null if endDate is before startDate.
 */
export const timeBetweenDates = (
  startDate: Date,
  endDate: Date,
): TimeParts | null => {
  if (endDate.getTime() <= startDate.getTime()) return null;
  return timeFromSeconds((endDate.getTime() - startDate.getTime()) / 1000);
};

/**
 * @deprecated Use `timeBetweenDates` instead.
 */
export const remainingDaysHoursFormTwoDates = timeBetweenDates;

/**
 * Formats minutes into a human-readable time string.
 * @example minutesToTimeText(130, 'h', 'min') → '2 h 10 min'
 */
export const minutesToTimeText = (
  minutes: number,
  hourUnit: string,
  minuteUnit: string,
): string =>
  `${Math.floor(minutes / 60)} ${hourUnit} ${Math.floor(minutes % 60)} ${minuteUnit}`;

/**
 * @deprecated Use `minutesToTimeText` instead.
 */
export const convertMinutesToTimeText = minutesToTimeText;

// ─── Number Formatters ───────────────────────────────────────────────────────

/**
 * Pads a number with a leading zero if less than 10.
 */
export const padZero = (value: number): string =>
  value < 10 ? `0${value}` : String(value);

/**
 * @deprecated Use `padZero` instead.
 */
export const leadZeroForMonthOrDay = padZero;

/**
 * Converts a number to its English text representation.
 * Supports integers from -1e18 to 1e18.
 */
export function numberToText(num: number): string {
  if (!Number.isFinite(num)) throw new Error('Input must be a finite number');
  if (!Number.isSafeInteger(num)) throw new Error('Input must be a safe integer');
  if (Math.abs(num) > 1e18) throw new Error('Number too large — max absolute value is 1e18');

  if (num === 0) return 'zero';
  if (num < 0) return `minus ${numberToText(-num)}`;

  let remaining = num;
  let result = '';

  for (const scale of SCALES) {
    if (remaining >= scale.value) {
      const scaleAmount = Math.floor(remaining / scale.value);
      result += `${convertLessThanThousand(scaleAmount)} ${scale.name}`;
      remaining %= scale.value;
      if (remaining > 0) {
        result += remaining < 100 ? ' and ' : ', ';
      }
    }
  }

  if (remaining > 0) {
    result += convertLessThanThousand(remaining);
  }

  return result.trim();
}

function convertLessThanThousand(num: number): string {
  let result = '';
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundreds > 0) {
    result += `${UNITS[hundreds]} hundred`;
    if (remainder > 0) result += ' and ';
  }

  if (remainder > 0) {
    result += convertLessThanHundred(remainder);
  }

  return result;
}

function convertLessThanHundred(num: number): string {
  if (num < 10) return UNITS[num];
  if (num < 20) return TEENS[num - 10];
  const tens = Math.floor(num / 10);
  const units = num % 10;
  return units === 0 ? TENS[tens] : `${TENS[tens]}-${UNITS[units]}`;
}
