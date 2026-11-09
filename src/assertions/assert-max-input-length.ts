import Constants from '../constants';

/**
 * Asserts that `value` is a string of at most `MaxInputStringLength` (75)
 * UTF-16 code units. An empty string passes.
 *
 * @param value - Value to check. `null`, `undefined`, and any other non-string
 * are rejected.
 * @throws Error `Invalid input string: expected at most 75 characters.`
 * @example
 * assertMaxInputLength('1 day');
 */
export function assertMaxInputLength(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length > Constants.MaxInputStringLength) {
    throw new Error(
      `Invalid input string: expected at most ${Constants.MaxInputStringLength} characters.`,
    );
  }
}
