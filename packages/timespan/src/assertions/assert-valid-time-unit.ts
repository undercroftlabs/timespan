import { TimeUnit } from '../types';
import { getTimeUnits } from '../utils/unit-conversion-map';

/**
 * Asserts that `unit` is an alias in the time unit conversion table.
 * @param unit - Value to check. `null`, `undefined`, unknown names, and any
 * other non-unit are rejected.
 * @throws {Error} `Invalid time unit: expected a recognized time unit.`
 * @example
 * assertValidTimeUnit('day');
 */
export function assertValidTimeUnit(unit: unknown): asserts unit is TimeUnit {
  if (!getTimeUnits().includes(unit as TimeUnit)) {
    throw new Error('Invalid time unit: expected a recognized time unit.');
  }
}
