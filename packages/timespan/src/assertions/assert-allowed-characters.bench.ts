import { bench, describe } from 'vitest';

import { assertAllowedCharacters } from './assert-allowed-characters';

/**
 * `AllowedCharactersRegexPattern` is `/^[a-zA-Z0-9\s]+$/` with no `g` or `y`
 * flag, so `RegExp.test` does not mutate `lastIndex`.
 */
const rejectionMessage =
  'Invalid input string: expected letters, digits, and whitespace only.';

const shortNumeric = '123';
const shortAlphabetic = 'day';
const shortMixed = '1d 2h';
const mediumDuration = '1y 2M 3w 4d 5h 6m 7s 8ms';
const longDuration = '1y 2M 3w 4d 5h 6m 7s 8ms '.repeat(40);
const whitespaceOnly = '   ';
const mixedJavaScriptWhitespace = ' \t\n';

const emptyString = '';
const nullInput = null;
const undefinedInput = undefined;
const numericInput = 123;
const invalidAtBeginning = '@123days';
const invalidInMiddle = '123@days';
const invalidAtEnd = '123days@';
const longInvalid = `${'a'.repeat(1000)}@`;

function expectAccepted(value: string): void {
  assertAllowedCharacters(value);
}

function expectRejected(value: unknown): void {
  try {
    assertAllowedCharacters(value);
  } catch (error) {
    if (error instanceof Error && error.message === rejectionMessage) {
      return;
    }

    throw error;
  }

  throw new Error(rejectionMessage);
}

expectAccepted(shortNumeric);
expectAccepted(shortAlphabetic);
expectAccepted(shortMixed);
expectAccepted(mediumDuration);
expectAccepted(longDuration);
expectAccepted(whitespaceOnly);
expectAccepted(mixedJavaScriptWhitespace);

expectRejected(emptyString);
expectRejected(nullInput);
expectRejected(undefinedInput);
expectRejected(numericInput);
expectRejected(invalidAtBeginning);
expectRejected(invalidInMiddle);
expectRejected(invalidAtEnd);
expectRejected(longInvalid);

if (longDuration.length !== 1000 || longInvalid.length !== 1001) {
  throw new Error(
    `Expected a 1000-character duration and a 1001-character rejection, received ${longDuration.length} and ${longInvalid.length}.`,
  );
}

describe('assertAllowedCharacters', () => {
  bench('accepts short numeric input', () => {
    assertAllowedCharacters(shortNumeric);
  });

  bench('accepts short alphabetic input', () => {
    assertAllowedCharacters(shortAlphabetic);
  });

  bench('accepts short mixed input', () => {
    assertAllowedCharacters(shortMixed);
  });

  bench('accepts medium duration input', () => {
    assertAllowedCharacters(mediumDuration);
  });

  bench('accepts long duration input', () => {
    assertAllowedCharacters(longDuration);
  });

  bench('accepts whitespace-only input', () => {
    assertAllowedCharacters(whitespaceOnly);
  });

  bench('accepts mixed JavaScript whitespace', () => {
    assertAllowedCharacters(mixedJavaScriptWhitespace);
  });

  bench('rejects empty string', () => {
    try {
      assertAllowedCharacters(emptyString);
    } catch {
      return;
    }
  });

  bench('rejects null', () => {
    try {
      assertAllowedCharacters(nullInput);
    } catch {
      return;
    }
  });

  bench('rejects undefined', () => {
    try {
      assertAllowedCharacters(undefinedInput);
    } catch {
      return;
    }
  });

  bench('rejects numeric input', () => {
    try {
      assertAllowedCharacters(numericInput);
    } catch {
      return;
    }
  });

  bench('rejects invalid character at the beginning', () => {
    try {
      assertAllowedCharacters(invalidAtBeginning);
    } catch {
      return;
    }
  });

  bench('rejects invalid character in the middle', () => {
    try {
      assertAllowedCharacters(invalidInMiddle);
    } catch {
      return;
    }
  });

  bench('rejects invalid character at the end', () => {
    try {
      assertAllowedCharacters(invalidAtEnd);
    } catch {
      return;
    }
  });

  bench('rejects long input with invalid final character', () => {
    try {
      assertAllowedCharacters(longInvalid);
    } catch {
      return;
    }
  });
});
