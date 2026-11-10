import { isValidTimeUnit } from '../type-utils/is-valid-time-unit';
import { TimeUnit } from '../types';

/**
 * Asserts that the given unit is part of the time unit conversion table.
 * @param unit - The time unit to validate.
 * @throws Error if the unit is not recognized.
 */
export function assertValidTimeUnit(unit: unknown): asserts unit is TimeUnit {
  if (!isValidTimeUnit(unit)) {
    throw new Error(`Invalid date unit: ${unit}.`);
  }
}
