import { isValidDate } from '../type-utils/is-valid-date';

/**
 * Asserts that a value is a valid `Date`.
 * @param value - The value to check.
 * @throws Error if the value is not a valid date.
 */
export function assertValidDate(value: unknown): asserts value is Date {
  if (!isValidDate(value)) {
    throw new Error('Invalid date input.');
  }
}
