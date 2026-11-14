import { bench, describe } from 'vitest';

import { Timespan } from '../timespan';
import { formatTimespan } from './format-timespan';

const origin = new Date('2023-06-01T00:00:00.000Z');
const worked = new Timespan(origin, new Date(origin.getTime() + 1_483_506_123));
const fiveHours = Timespan.fromHours(5, origin);

const emptyFormat = '';
const literalText = 'No substitutions here.';
const totalDays = '%D';
const clock = 'Time remaining: %h:%02m:%02s';
const everySpecifier = '%Y %y %B %b %W %w %D %d %H %h %M %m %S %s %L %l %f';
const fractional = '%s.%f';
const wideField = `%${64}h`;
const longLiteral = `${'x'.repeat(5_000)}%D${'x'.repeat(5_000)}`;
const unknownSpecifier = '%Q';
const trailingPercent = 'ab%';
const rejectedWidth = '%1000000h';

const wideFieldText = `${' '.repeat(63)}5`;
const longLiteralText = `${'x'.repeat(5_000)}17${'x'.repeat(5_000)}`;

/**
 * Builds the formatter's invalid-directive message.
 * @param formatString - Format string that contains the directive.
 * @param start - Index of the opening `%`.
 * @returns The expected TypeError message.
 */
function directiveError(formatString: string, start: number): string {
  return `Invalid format directive "${formatString.slice(start)}" at index ${start}.`;
}

/**
 * Asserts that formatting `formatString` returns `expected`.
 * @param formatString - Format string to render.
 * @param expected - Exact formatted text.
 * @param timespan - Timespan to format. Defaults to the worked span.
 * @returns Nothing.
 */
function expectFormat(
  formatString: string,
  expected: string,
  timespan: Timespan = worked,
): void {
  const actual = formatTimespan(formatString, timespan);
  if (actual !== expected) {
    throw new Error(`expected "${expected}", received "${actual}"`);
  }
}

/**
 * Asserts that formatting `formatString` throws `message`.
 * @param formatString - Malformed format string.
 * @param message - Expected TypeError message.
 * @returns Nothing.
 */
function expectRejected(formatString: string, message: string): void {
  try {
    formatTimespan(formatString, worked);
  } catch (error) {
    if (error instanceof TypeError && error.message === message) {
      return;
    }

    throw error;
  }

  throw new Error(message);
}

expectFormat(emptyFormat, '');
expectFormat(literalText, 'No substitutions here.');
expectFormat(totalDays, '17');
expectFormat(clock, 'Time remaining: 4:05:06');
expectFormat(
  everySpecifier,
  '0 0 0 0 2 2 17 3 412 4 24725 5 1483506 6 1483506123 123 123',
);
expectFormat(fractional, '6.123');
expectFormat(wideField, wideFieldText, fiveHours);
expectFormat(longLiteral, longLiteralText);
expectRejected(unknownSpecifier, directiveError(unknownSpecifier, 0));
expectRejected(trailingPercent, directiveError(trailingPercent, 2));
expectRejected(rejectedWidth, directiveError(rejectedWidth, 0));

describe('formatTimespan', () => {
  bench('formats an empty string', () => {
    formatTimespan(emptyFormat, worked);
  });

  bench('formats literal text', () => {
    formatTimespan(literalText, worked);
  });

  bench('formats one total', () => {
    formatTimespan(totalDays, worked);
  });

  bench('formats a padded clock', () => {
    formatTimespan(clock, worked);
  });

  bench('formats every specifier', () => {
    formatTimespan(everySpecifier, worked);
  });

  bench('formats fractional seconds', () => {
    formatTimespan(fractional, worked);
  });

  bench('formats a width of 64', () => {
    formatTimespan(wideField, fiveHours);
  });

  bench('formats a long literal around one specifier', () => {
    formatTimespan(longLiteral, worked);
  });

  bench('rejects an unknown specifier', () => {
    try {
      formatTimespan(unknownSpecifier, worked);
    } catch {
      return;
    }
  });

  bench('rejects a trailing percent', () => {
    try {
      formatTimespan(trailingPercent, worked);
    } catch {
      return;
    }
  });

  bench('rejects a width at the ceiling', () => {
    try {
      formatTimespan(rejectedWidth, worked);
    } catch {
      return;
    }
  });
});
