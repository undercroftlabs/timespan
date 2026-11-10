import { TimeFrame } from '../types/timeframe';
import { isValidTimeUnit } from '../type-utils/is-valid-time-unit';
import { getConverter } from '../unit-conversion-map';

/**
 * Calculates a string representation of a TimeFrame.
 * @param timeFrame - The TimeFrame object to convert.
 * @returns A string representation of the TimeFrame.
 */
export function timeFrameToString(timeFrame: TimeFrame): string {
  const timespanParts: string[] = [];

  // Iterate through the timeFrame and generate the string parts for non-zero values
  for (const unit of Object.keys(timeFrame)) {
    const numericValue = Number(timeFrame[unit]);
    // Check if the value is non-zero and append to the timespanParts
    if (numericValue !== 0 && isValidTimeUnit(unit)) {
      const abbreviation = getConverter(unit).abbreviation;
      timespanParts.push(`${numericValue}${abbreviation}`);
    }
  }
  return timespanParts.join(' ');
}
