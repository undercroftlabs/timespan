/**
 * Checks if a value is a valid `Date` instance.
 * @param value - The value to check.
 * @returns True if the value is a valid `Date`.
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}
