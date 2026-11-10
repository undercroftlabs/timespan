import Constants from '../constants';

/**
 * Asserts that `value` is a non-empty string of ASCII letters, digits, and
 * JavaScript whitespace (`\s`), including a whitespace-only string.
 * @param value - Value to check. `null`, `undefined`, `''`, and any other
 * non-string are rejected.
 * @throws {Error} `Invalid input string: expected letters, digits, and whitespace only.`
 * @example
 * assertAllowedCharacters('1 day');
 */
export function assertAllowedCharacters(
  value: unknown,
): asserts value is string {
  if (
    typeof value !== 'string' ||
    !Constants.AllowedCharactersRegexPattern.test(value)
  ) {
    throw new Error(
      'Invalid input string: expected letters, digits, and whitespace only.',
    );
  }
}
