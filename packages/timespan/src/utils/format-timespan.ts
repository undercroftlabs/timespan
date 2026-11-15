import { TimeFrame } from '../types/timeframe';
import { Timespan } from '../timespan';

/**
 * Width or precision at or above this value is rejected.
 * 0 through 64 are accepted.
 */
const minimumRejectedField = 1_000_000;

const specifierCharacters = [
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
] as const;

type Specifier = (typeof specifierCharacters)[number];

const specifiers: ReadonlySet<string> = new Set(specifierCharacters);

/**
 * Reports whether `character` is a supported time-unit specifier.
 * @param character - One UTF-16 code unit.
 * @returns True when `character` is a known specifier.
 */
function isSpecifier(character: string): character is Specifier {
  return specifiers.has(character);
}

interface Flags {
  zero: boolean;
  left: boolean;
  plus: boolean;
  space: boolean;
}

interface Directive {
  flags: Flags;
  width: number | undefined;
  precision: number | undefined;
  specifier: Specifier;
  end: number;
}

/**
 * Builds the TypeError for a directive that starts at `start`.
 * The message includes the directive text and its index.
 * @param formatString - Format string that contains the directive.
 * @param start - Index of the opening `%`.
 * @returns The error to throw.
 */
function invalidDirective(formatString: string, start: number): TypeError {
  return new TypeError(
    `Invalid format directive "${formatString.slice(start)}" at index ${start}.`,
  );
}

/**
 * Reports whether `character` is an ASCII digit.
 * @param character - One UTF-16 code unit.
 * @returns True when `character` is `0` through `9`.
 */
function isDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}

/**
 * Reads an optional width or precision and rejects values at or above the ceiling.
 * @param formatString - Format string that contains the digit run.
 * @param directiveStart - Index of the opening `%`, used in the error.
 * @param start - Index of the first digit.
 * @param end - Index one past the last digit.
 * @returns The numeric field value.
 * @throws {TypeError} When the field is 1,000,000 or greater.
 */
function readField(
  formatString: string,
  directiveStart: number,
  start: number,
  end: number,
): number {
  const field = Number(formatString.slice(start, end));
  if (!(field < minimumRejectedField)) {
    throw invalidDirective(formatString, directiveStart);
  }
  return field;
}

/**
 * Reads the flag run that follows `%`.
 * @param formatString - Format string being scanned.
 * @param index - Index of the first character after `%`.
 * @returns The flags and the index of the first non-flag character.
 */
function readFlags(
  formatString: string,
  index: number,
): { flags: Flags; index: number } {
  const flags: Flags = {
    zero: false,
    left: false,
    plus: false,
    space: false,
  };

  while (index < formatString.length) {
    const character = formatString.charAt(index);
    if (character === '0') {
      flags.zero = true;
    } else if (character === '-') {
      flags.left = true;
    } else if (character === '+') {
      flags.plus = true;
    } else if (character === ' ') {
      flags.space = true;
    } else {
      break;
    }
    index += 1;
  }

  return { flags, index };
}

/**
 * Reads one directive that starts at `start`. `%%` is handled by the caller.
 * @param formatString - Format string being scanned.
 * @param start - Index of the opening `%`.
 * @returns The parsed directive. `end` is the index after the specifier.
 * @throws {TypeError} When the directive is incomplete, unknown, or too wide.
 */
function readDirective(formatString: string, start: number): Directive {
  const flagsAt = readFlags(formatString, start + 1);
  const { flags } = flagsAt;
  let index = flagsAt.index;

  const widthStart = index;
  while (index < formatString.length && isDigit(formatString.charAt(index))) {
    index += 1;
  }
  const width =
    index > widthStart
      ? readField(formatString, start, widthStart, index)
      : undefined;

  let precision: number | undefined;
  if (formatString.charAt(index) === '.') {
    index += 1;
    const precisionStart = index;
    while (index < formatString.length && isDigit(formatString.charAt(index))) {
      index += 1;
    }
    if (index === precisionStart) {
      throw invalidDirective(formatString, start);
    }
    precision = readField(formatString, start, precisionStart, index);
  }

  const specifier = formatString.charAt(index);
  if (!isSpecifier(specifier)) {
    throw invalidDirective(formatString, start);
  }

  return { flags, width, precision, specifier, end: index + 1 };
}

/**
 * Resolves a specifier from the existing total converters or the cached frame.
 * @param specifier - Supported time-unit specifier.
 * @param timespan - Timespan being formatted.
 * @param frame - Cached `toTimeframe()` value for this call.
 * @returns The nonnegative numeric value for the specifier.
 */
function resolveValue(
  specifier: Specifier,
  timespan: Timespan,
  frame: TimeFrame,
): number {
  switch (specifier) {
    case 'Y':
      return timespan.toYears();
    case 'y':
      return frame.years;
    case 'B':
      return timespan.toMonths();
    case 'b':
      return frame.months;
    case 'W':
      return timespan.toWeeks();
    case 'w':
      return frame.weeks;
    case 'D':
      return timespan.toDays();
    case 'd':
      return frame.days;
    case 'H':
      return timespan.toHours();
    case 'h':
      return frame.hours;
    case 'M':
      return timespan.toMinutes();
    case 'm':
      return frame.minutes;
    case 'S':
      return timespan.toSeconds();
    case 's':
      return frame.seconds;
    case 'L':
      return timespan.toMilliseconds();
    case 'l':
    case 'f':
      return frame.milliseconds;
  }
}

/**
 * Formats an integer specifier's digits.
 * Precision is a minimum digit count and never truncates. Precision 0 prints
 * a numeric zero as no digits. The zero flag with precision 0 also clears a
 * nonzero value, which `%05.0h` and `%+05.0h` require.
 * @param value - Nonnegative integer value.
 * @param precision - Minimum digits, or `undefined` when the directive has none.
 * @param zero - Whether the zero flag is set.
 * @returns The digit characters, without a sign.
 */
function integerDigits(
  value: number,
  precision: number | undefined,
  zero: boolean,
): string {
  if (precision === 0 && (value === 0 || zero)) {
    return '';
  }

  const digits = String(value);
  if (precision !== undefined && precision > digits.length) {
    return digits.padStart(precision, '0');
  }
  return digits;
}

/**
 * Formats `%f` as fractional-second digits. The default precision is 3.
 * Extra precision extends with zeros. Smaller precision truncates.
 * @param milliseconds - Millisecond component, normally 0 through 999.
 * @param precision - Number of fractional digits.
 * @returns The digit characters, without a decimal point or sign.
 */
function fractionalDigits(milliseconds: number, precision: number): string {
  if (precision === 0) {
    return '';
  }

  const base = String(milliseconds).padStart(3, '0');
  if (precision <= base.length) {
    return base.slice(0, precision);
  }
  return base + '0'.repeat(precision - base.length);
}

/**
 * Applies the sign, then width, justification, and zero padding.
 * Integer precision disables zero padding. `%f` keeps it. `-` disables it for both.
 * @param digits - Digit characters for the field.
 * @param directive - Parsed directive.
 * @returns The rendered field.
 */
function applyWidth(digits: string, directive: Directive): string {
  const { flags, width, precision, specifier } = directive;
  const sign = flags.plus ? '+' : flags.space ? ' ' : '';
  const body = sign + digits;

  if (width === undefined || body.length >= width) {
    return body;
  }

  const pad = width - body.length;
  if (flags.left) {
    return body + ' '.repeat(pad);
  }

  const zeroPad = flags.zero && (precision === undefined || specifier === 'f');
  if (zeroPad) {
    return sign + '0'.repeat(pad) + digits;
  }
  return ' '.repeat(pad) + body;
}

/**
 * Renders one parsed directive.
 * @param directive - Parsed directive.
 * @param timespan - Timespan being formatted.
 * @param frame - Cached `toTimeframe()` value for this call.
 * @returns The replacement text.
 */
function renderDirective(
  directive: Directive,
  timespan: Timespan,
  frame: TimeFrame,
): string {
  const value = resolveValue(directive.specifier, timespan, frame);
  const digits =
    directive.specifier === 'f'
      ? fractionalDigits(value, directive.precision ?? 3)
      : integerDigits(value, directive.precision, directive.flags.zero);
  return applyWidth(digits, directive);
}

/**
 * Formats `timespan` by substituting directives in `formatString`.
 * Literal text is copied unchanged. `%%` is a literal percent.
 * @param formatString - Caller-supplied format string.
 * @param timespan - Timespan whose totals and components are read.
 * @returns The formatted text.
 * @throws {TypeError} When a directive is incomplete, unknown, or requests a
 * width or precision of 1,000,000 or more.
 * @example
 * formatTimespan('%D days', timespan);
 */
export function formatTimespan(
  formatString: string,
  timespan: Timespan,
): string {
  const frame = timespan.toTimeframe();
  const parts: string[] = [];
  let index = 0;

  while (index < formatString.length) {
    if (formatString.charAt(index) !== '%') {
      const next = formatString.indexOf('%', index);
      const end = next === -1 ? formatString.length : next;
      parts.push(formatString.slice(index, end));
      index = end;
      continue;
    }

    if (formatString.charAt(index + 1) === '%') {
      parts.push('%');
      index += 2;
      continue;
    }

    const directive = readDirective(formatString, index);
    parts.push(renderDirective(directive, timespan, frame));
    index = directive.end;
  }

  return parts.join('');
}
