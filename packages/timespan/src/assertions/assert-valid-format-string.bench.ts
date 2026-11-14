import { bench, describe } from 'vitest';

import Constants from '../constants';
import { assertValidFormatString } from './assert-valid-format-string';

const invalidLength = `Invalid input string: expected at most ${Constants.MaxInputStringLength} characters.`;
const invalidFormat = 'Invalid format string: expected a valid format string.';

const emptyString = '';
const literalText = 'No substitutions here.';
const workedExample = 'Time remaining: %h:%02m:%02s';
const everySpecifier = '%Y %y %B %b %W %w %D %d %H %h %M %m %S %s %L %l %f';
const exactMaximum = `${'a'.repeat(Constants.MaxInputStringLength - 2)}%D`;
const onePastMaximum = 'a'.repeat(Constants.MaxInputStringLength + 1);
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
expectAccepted(exactMaximum);
expectRejected(onePastMaximum, invalidLength);
expectRejected(unknownSpecifier, invalidFormat);
expectRejected(trailingPercent, invalidFormat);
expectRejected(rejectedWidth, invalidFormat);
expectRejected(nullInput, invalidLength);
expectRejected(undefinedInput, invalidLength);
expectRejected(numericInput, invalidLength);

if (exactMaximum.length !== Constants.MaxInputStringLength) {
  throw new Error(
    `Expected a format string of length ${Constants.MaxInputStringLength}.`,
  );
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

  bench('accepts a string at the maximum length', () => {
    assertValidFormatString(exactMaximum);
  });

  bench('rejects one character past the maximum', () => {
    try {
      assertValidFormatString(onePastMaximum);
    } catch {
      return;
    }
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
