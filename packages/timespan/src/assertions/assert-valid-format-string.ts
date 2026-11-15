/**
 * Width or precision at or above this value is rejected.
 * 0 through 64 must be accepted. Values in between are accepted.
 */
const minimumRejectedField = 1_000_000;

const specifiers = new Set([
  'Y',
  'B',
  'W',
  'D',
  'H',
  'M',
  'S',
  'L',
  'y',
  'b',
  'w',
  'd',
  'h',
  'm',
  's',
  'l',
  'f',
]);

const flags = new Set(['0', '-', '+', ' ']);

/**
 * Reports whether `character` is an ASCII digit.
 * @param character - One UTF-16 code unit.
 * @returns True when `character` is `0` through `9`.
 */
function isDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}

/**
 * Reports whether the digit run from `start` to `end` is below the field ceiling.
 * @param formatString - Format string that contains the digit run.
 * @param start - Index of the first digit.
 * @param end - Index one past the last digit.
 * @returns True when the numeric value is below 1,000,000.
 */
function isAcceptedField(
  formatString: string,
  start: number,
  end: number,
): boolean {
  return Number(formatString.slice(start, end)) < minimumRejectedField;
}

/**
 * Reads one directive that starts at `start`.
 * `%%` is a literal percent. Every other directive is
 * `%[flags][width][.precision]specifier`.
 * @param formatString - Format string being scanned.
 * @param start - Index of the opening `%`.
 * @returns The index immediately after the directive, or `undefined` when the
 * directive is incomplete, unknown, or asks for a field of 1,000,000 or more.
 */
function readDirective(
  formatString: string,
  start: number,
): number | undefined {
  let index = start + 1;
  const { length } = formatString;

  if (index >= length) {
    return undefined;
  }

  if (formatString.charAt(index) === '%') {
    return index + 1;
  }

  while (index < length && flags.has(formatString.charAt(index))) {
    index += 1;
  }

  const widthStart = index;
  while (index < length && isDigit(formatString.charAt(index))) {
    index += 1;
  }
  if (index > widthStart && !isAcceptedField(formatString, widthStart, index)) {
    return undefined;
  }

  if (formatString.charAt(index) === '.') {
    index += 1;
    const precisionStart = index;
    while (index < length && isDigit(formatString.charAt(index))) {
      index += 1;
    }
    if (
      index === precisionStart ||
      !isAcceptedField(formatString, precisionStart, index)
    ) {
      return undefined;
    }
  }

  if (!specifiers.has(formatString.charAt(index))) {
    return undefined;
  }

  return index + 1;
}

/**
 * Reports whether every `%` in `formatString` begins a complete directive.
 * @param formatString - Candidate format string.
 * @returns True when the string is empty or contains only literal text and
 * valid directives.
 */
function isValidFormat(formatString: string): boolean {
  let index = 0;

  while (index < formatString.length) {
    if (formatString.charAt(index) !== '%') {
      index += 1;
      continue;
    }

    const nextIndex = readDirective(formatString, index);
    if (nextIndex === undefined) {
      return false;
    }

    index = nextIndex;
  }

  return true;
}

/**
 * Asserts that `value` is a format string. An empty string passes. Directives
 * must match `%[flags][width][.precision]specifier`, and `%%` is a literal
 * percent. Flags are `0`, `-`, `+`, and space. Width and precision must be
 * below 1,000,000. The string itself has no length limit. Literal text,
 * including text that resembles a unit name, is kept.
 * @param value - Value to check. `null`, `undefined`, and any other non-string
 * are rejected.
 * @throws {Error} `Invalid format string: expected a string.`
 * @throws {Error} `Invalid format string: expected a valid format string.`
 * @example
 * assertValidFormatString('%D days');
 */
export function assertValidFormatString(
  value: unknown,
): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Invalid format string: expected a string.');
  }

  if (!isValidFormat(value)) {
    throw new Error('Invalid format string: expected a valid format string.');
  }
}
