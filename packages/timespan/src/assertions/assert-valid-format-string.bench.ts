import { bench, describe } from 'vitest';

import { assertValidFormatString } from './assert-valid-format-string';

const invalidType = 'Invalid format string: expected a string.';
const invalidFormat = 'Invalid format string: expected a valid format string.';

const emptyString = '';
const literalText = 'No substitutions here.';
const workedExample = 'Time remaining: %h:%02m:%02s';
const everySpecifier = '%Y %y %B %b %W %w %D %d %H %h %M %m %S %s %L %l %f';
const longSentence = `${'Remaining time: '.repeat(40)}%D days.`;
const unknownSpecifier = '%Q';
const trailingPercent = 'ab%';
const rejectedWidth = '%1000000h';
const nullInput = null;
const undefinedInput = undefined;
const numericInput = 123;

/**
 * Asserts that `value` is accepted.
 * @param value - Format string that must pass.
 * @returns Nothing.
 */
function expectAccepted(value: string): void {
  assertValidFormatString(value);
}

/**
 * Asserts that `value` is rejected with `message`.
 * @param value - Value that must fail.
 * @param message - Expected error message.
 * @returns Nothing.
 */
function expectRejected(value: unknown, message: string): void {
  try {
    assertValidFormatString(value);
  } catch (error) {
    if (error instanceof Error && error.message === message) {
      return;
    }

    throw error;
  }

  throw new Error(message);
}

expectAccepted(emptyString);
expectAccepted(literalText);
expectAccepted(workedExample);
expectAccepted(everySpecifier);
expectAccepted(longSentence);
expectRejected(unknownSpecifier, invalidFormat);
expectRejected(trailingPercent, invalidFormat);
expectRejected(rejectedWidth, invalidFormat);
expectRejected(nullInput, invalidType);
expectRejected(undefinedInput, invalidType);
expectRejected(numericInput, invalidType);

if (longSentence.length <= 75) {
  throw new Error('Expected a format string longer than 75 characters.');
}

describe('assertValidFormatString', () => {
  bench('accepts an empty string', () => {
    assertValidFormatString(emptyString);
  });

  bench('accepts literal text', () => {
    assertValidFormatString(literalText);
  });

  bench('accepts a worked example', () => {
    assertValidFormatString(workedExample);
  });

  bench('accepts every specifier', () => {
    assertValidFormatString(everySpecifier);
  });

  bench('accepts a long sentence', () => {
    assertValidFormatString(longSentence);
  });

  bench('rejects an unknown specifier', () => {
    try {
      assertValidFormatString(unknownSpecifier);
    } catch {
      return;
    }
  });

  bench('rejects a trailing percent', () => {
    try {
      assertValidFormatString(trailingPercent);
    } catch {
      return;
    }
  });

  bench('rejects a width at the ceiling', () => {
    try {
      assertValidFormatString(rejectedWidth);
    } catch {
      return;
    }
  });

  bench('rejects null', () => {
    try {
      assertValidFormatString(nullInput);
    } catch {
      return;
    }
  });

  bench('rejects undefined', () => {
    try {
      assertValidFormatString(undefinedInput);
    } catch {
      return;
    }
  });

  bench('rejects numeric input', () => {
    try {
      assertValidFormatString(numericInput);
    } catch {
      return;
    }
  });
});
