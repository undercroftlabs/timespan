import { TimeUnit } from '../types';
import { TimeFrame } from '../types/timeframe';
import { getConverter } from './unit-conversion-map';

/**
 * Timeframe fields in display order. Aliases such as `y` are not fields.
 */
const canonicalUnits: readonly TimeUnit[] = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds',
];

/**
 * Calculates a string representation of a TimeFrame.
 * @param timeFrame - The TimeFrame object to convert.
 * @returns A string representation of the TimeFrame.
 * @throws {Error} `Invalid number of <unit>: expected zero or a positive number.`
 */
export function timeFrameToString(timeFrame: TimeFrame): string {
  const timespanParts: string[] = [];

  for (const unit of canonicalUnits) {
    if (!Object.hasOwn(timeFrame, unit)) {
      continue;
    }
    const value = timeFrame[unit];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new Error(
        `Invalid number of ${unit}: expected zero or a positive number.`,
      );
    }
    if (value !== 0) {
      timespanParts.push(`${value}${getConverter(unit).abbreviation}`);
    }
  }
  return timespanParts.join(' ');
}
