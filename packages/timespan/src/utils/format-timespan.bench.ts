import { bench, describe } from 'vitest';

import { Timespan } from '../timespan';
import { formatTimespan } from './format-timespan';

const origin = new Date('2023-06-01T00:00:00.000Z');
const worked = new Timespan(origin, new Date(origin.getTime() + 1_483_506_123));

const literalOnly = 'Time remaining until tomorrow.';
const singleComponent = '%h';
const singleTotal = '%H';
const multipleComponents = '%d days, %h hours, %m minutes';
const mixedValues = '%D days (%H hours), %h remaining hours';
const naturalSentence = '%D days, %h hours, and %m minutes remaining.';
const zeroPadded = '%02h:%02m:%02s';
const flagsAndPrecision = '%+08.4H';
const fractionalSeconds = '%s.%.3f';
const escapedPercent = '100%% complete';
const repeatedSpecifiers = '%h %h %h %h %h';
const calendarTotals = '%Y years and %B months';
const mixedTotalAndComponent = '%D days equals %H complete hours.';
const longLiteral = `${'Remaining time: '.repeat(62)}%D days.`;
const manySubstitutions = '%h '.repeat(100);
const unknownSpecifier = '%Q';

const variedSentences = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(
  (mark) => `${mark}: %D days, %h hours, and %m minutes remaining.`,
);

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
 * @returns Nothing.
 */
function expectFormat(formatString: string, expected: string): void {
  const actual = formatTimespan(formatString, worked);
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

expectFormat(literalOnly, 'Time remaining until tomorrow.');
expectFormat(singleComponent, '4');
expectFormat(singleTotal, '412');
expectFormat(multipleComponents, '3 days, 4 hours, 5 minutes');
expectFormat(mixedValues, '17 days (412 hours), 4 remaining hours');
expectFormat(naturalSentence, '17 days, 4 hours, and 5 minutes remaining.');
expectFormat(zeroPadded, '04:05:06');
expectFormat(flagsAndPrecision, '   +0412');
expectFormat(fractionalSeconds, '6.123');
expectFormat(escapedPercent, '100% complete');
expectFormat(repeatedSpecifiers, '4 4 4 4 4');
expectFormat(calendarTotals, '0 years and 0 months');
expectFormat(mixedTotalAndComponent, '17 days equals 412 complete hours.');
expectFormat(longLiteral, `${'Remaining time: '.repeat(62)}17 days.`);
expectFormat(manySubstitutions, '4 '.repeat(100));
expectFormat(
  variedSentences[0],
  'A: 17 days, 4 hours, and 5 minutes remaining.',
);
expectRejected(unknownSpecifier, directiveError(unknownSpecifier, 0));

if (worked.format(zeroPadded) !== formatTimespan(zeroPadded, worked)) {
  throw new Error('Timespan.format and formatTimespan disagreed.');
}

if (longLiteral.length !== 1_000) {
  throw new Error(
    `Expected a 1,000-character format string, received ${longLiteral.length}.`,
  );
}

describe('formatTimespan', () => {
  describe('Literal Text', () => {
    bench('literal-only string', () => {
      formatTimespan(literalOnly, worked);
    });

    bench('escaped percentages', () => {
      formatTimespan(escapedPercent, worked);
    });

    bench('long literal text', () => {
      formatTimespan(longLiteral, worked);
    });
  });

  describe('Specifier Resolution', () => {
    bench('single component', () => {
      formatTimespan(singleComponent, worked);
    });

    bench('single total', () => {
      formatTimespan(singleTotal, worked);
    });

    bench('multiple components', () => {
      formatTimespan(multipleComponents, worked);
    });

    bench('mixed totals and components', () => {
      formatTimespan(mixedValues, worked);
    });

    bench('repeated specifiers', () => {
      formatTimespan(repeatedSpecifiers, worked);
    });

    bench('calendar-aware totals', () => {
      formatTimespan(calendarTotals, worked);
    });
  });

  describe('Numeric Formatting', () => {
    bench('zero-padded fields', () => {
      formatTimespan(zeroPadded, worked);
    });

    bench('flags and precision', () => {
      formatTimespan(flagsAndPrecision, worked);
    });

    bench('fractional seconds', () => {
      formatTimespan(fractionalSeconds, worked);
    });
  });

  describe('Scaling', () => {
    bench('many substitutions', () => {
      formatTimespan(manySubstitutions, worked);
    });

    bench('repeats one sentence', () => {
      for (let index = 0; index < variedSentences.length; index += 1) {
        formatTimespan(naturalSentence, worked);
      }
    });

    bench('formats different templates', () => {
      for (const formatString of variedSentences) {
        formatTimespan(formatString, worked);
      }
    });
  });

  describe('Invalid Input', () => {
    bench('invalid format', () => {
      try {
        formatTimespan(unknownSpecifier, worked);
      } catch {
        return;
      }
    });
  });
});

describe('Timespan.format', () => {
  bench('single component', () => {
    worked.format(singleComponent);
  });

  bench('natural-language sentence', () => {
    worked.format(naturalSentence);
  });

  bench('zero-padded clock', () => {
    worked.format(zeroPadded);
  });

  bench('mixed total and component values', () => {
    worked.format(mixedTotalAndComponent);
  });

  bench('fractional seconds', () => {
    worked.format(fractionalSeconds);
  });

  bench('literal-only string', () => {
    worked.format(literalOnly);
  });

  bench('many substitutions', () => {
    worked.format(manySubstitutions);
  });

  bench('invalid format', () => {
    try {
      worked.format(unknownSpecifier);
    } catch {
      return;
    }
  });
});
