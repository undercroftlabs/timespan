import { bench, describe } from 'vitest';

import { assertValidTimeUnit } from './assert-valid-time-unit';

const rejectionMessage = 'Invalid time unit: expected a recognized time unit.';

const shortAlias = 'd';
const pluralName = 'days';
const longestAlias = 'milliseconds';
const unknownUnit = 'decade';
const emptyString = '';
const nullInput = null;
const undefinedInput = undefined;
const numericInput = 1;

function expectAccepted(unit: string): void {
  assertValidTimeUnit(unit);
}

function expectRejected(unit: unknown): void {
  try {
    assertValidTimeUnit(unit);
  } catch (error) {
    if (error instanceof Error && error.message === rejectionMessage) {
      return;
    }

    throw error;
  }

  throw new Error(rejectionMessage);
}

expectAccepted(shortAlias);
expectAccepted(pluralName);
expectAccepted(longestAlias);
expectRejected(unknownUnit);
expectRejected(emptyString);
expectRejected(nullInput);
expectRejected(undefinedInput);
expectRejected(numericInput);

describe('assertValidTimeUnit', () => {
  bench('accepts a one-character alias', () => {
    assertValidTimeUnit(shortAlias);
  });

  bench('accepts a plural unit name', () => {
    assertValidTimeUnit(pluralName);
  });

  bench('accepts the longest alias', () => {
    assertValidTimeUnit(longestAlias);
  });

  bench('rejects an unknown unit', () => {
    try {
      assertValidTimeUnit(unknownUnit);
    } catch {
      return;
    }
  });

  bench('rejects an empty string', () => {
    try {
      assertValidTimeUnit(emptyString);
    } catch {
      return;
    }
  });

  bench('rejects null', () => {
    try {
      assertValidTimeUnit(nullInput);
    } catch {
      return;
    }
  });

  bench('rejects undefined', () => {
    try {
      assertValidTimeUnit(undefinedInput);
    } catch {
      return;
    }
  });

  bench('rejects numeric input', () => {
    try {
      assertValidTimeUnit(numericInput);
    } catch {
      return;
    }
  });
});
