import { bench, describe } from 'vitest';

import Constants from '../constants';
import { assertMaxInputLength } from './assert-max-input-length';

const rejectionMessage = `Invalid input string: expected at most ${Constants.MaxInputStringLength} characters.`;

const emptyString = '';
const shortDuration = '1 day';
const exactMaximum = 'a'.repeat(Constants.MaxInputStringLength);
const onePastMaximum = 'a'.repeat(Constants.MaxInputStringLength + 1);
const farPastMaximum = 'a'.repeat(Constants.MaxInputStringLength * 2);
const nullInput = null;
const undefinedInput = undefined;
const numericInput = 123;

function expectAccepted(value: string): void {
  assertMaxInputLength(value);
}

function expectRejected(value: unknown): void {
  try {
    assertMaxInputLength(value);
  } catch (error) {
    if (error instanceof Error && error.message === rejectionMessage) {
      return;
    }

    throw error;
  }

  throw new Error(rejectionMessage);
}

expectAccepted(emptyString);
expectAccepted(shortDuration);
expectAccepted(exactMaximum);
expectRejected(onePastMaximum);
expectRejected(farPastMaximum);
expectRejected(nullInput);
expectRejected(undefinedInput);
expectRejected(numericInput);

if (
  exactMaximum.length !== Constants.MaxInputStringLength ||
  onePastMaximum.length !== Constants.MaxInputStringLength + 1
) {
  throw new Error(
    `Expected lengths ${Constants.MaxInputStringLength} and ${Constants.MaxInputStringLength + 1}.`,
  );
}

describe('assertMaxInputLength', () => {
  bench('accepts an empty string', () => {
    assertMaxInputLength(emptyString);
  });

  bench('accepts a short duration', () => {
    assertMaxInputLength(shortDuration);
  });

  bench('accepts a string at the maximum length', () => {
    assertMaxInputLength(exactMaximum);
  });

  bench('rejects one character past the maximum', () => {
    try {
      assertMaxInputLength(onePastMaximum);
    } catch {
      return;
    }
  });

  bench('rejects a string far past the maximum', () => {
    try {
      assertMaxInputLength(farPastMaximum);
    } catch {
      return;
    }
  });

  bench('rejects null', () => {
    try {
      assertMaxInputLength(nullInput);
    } catch {
      return;
    }
  });

  bench('rejects undefined', () => {
    try {
      assertMaxInputLength(undefinedInput);
    } catch {
      return;
    }
  });

  bench('rejects numeric input', () => {
    try {
      assertMaxInputLength(numericInput);
    } catch {
      return;
    }
  });
});
