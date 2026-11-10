import { getTimeUnits } from '../unit-conversion-map';
import { TimeUnit } from '../types';

/**
 * Checks if the provided unit is a valid input for date unit calculations.
 * @param value - The time unit to check.
 * @returns True if the unit is valid.
 */
export function isValidTimeUnit(value: unknown): value is TimeUnit {
  return getTimeUnits().includes(value as TimeUnit);
}
