/**
 * Message thrown for a non-Date or an Invalid Date.
 */
export const invalidDateMessage = 'Invalid date: expected a valid Date.';

/**
 * Asserts that `value` is a `Date` whose time value is finite.
 * `Invalid Date` is rejected, as is any non-`Date`.
 * @param value - Value to check. `null`, `undefined`, date strings, timestamps,
 * and any other non-`Date` are rejected.
 * @throws {Error} `Invalid date: expected a valid Date.`
 * @example
 * assertValidDate(new Date('2020-01-01T00:00:00.000Z'));
 */
export function assertValidDate(value: unknown): asserts value is Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(invalidDateMessage);
  }
}
