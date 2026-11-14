import type { TimespanJson } from '../types/timespan-json';
import { isTimespanJson } from '../type-guards/is-timespan-json';

/**
 * Asserts that the supplied value is a valid Timespan JSON object.
 * @param value - The value to validate.
 * @throws {TypeError} If the value is not valid Timespan JSON.
 */
export function assertValidTimespanJson(
  value: unknown,
): asserts value is TimespanJson {
  if (!isTimespanJson(value)) {
    throw new TypeError('Invalid Timespan JSON.');
  }
}
