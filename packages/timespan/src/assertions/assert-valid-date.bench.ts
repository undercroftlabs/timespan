import { bench, describe } from 'vitest';

import { assertValidDate } from './assert-valid-date';

const rejectionMessage = 'Invalid date: expected a valid Date.';

const epoch = new Date(0);
const typicalDate = new Date(Date.UTC(2020, 0, 15, 12, 30, 45, 123));
const distantDate = new Date(Date.UTC(275760, 8, 13));
const invalidDate = new Date(Number.NaN);
const nullInput = null;
const undefinedInput = undefined;
const timestampInput = 1_579_096_245_123;
const dateString = '2020-01-15T12:30:45.123Z';

function expectAccepted(value: Date): void {
  assertValidDate(value);
}

function expectRejected(value: unknown): void {
  try {
    assertValidDate(value);
  } catch (error) {
    if (error instanceof Error && error.message === rejectionMessage) {
      return;
    }

    throw error;
  }

  throw new Error(rejectionMessage);
}

expectAccepted(epoch);
expectAccepted(typicalDate);
expectAccepted(distantDate);
expectRejected(invalidDate);
expectRejected(nullInput);
expectRejected(undefinedInput);
expectRejected(timestampInput);
expectRejected(dateString);

describe('assertValidDate', () => {
  bench('accepts the epoch', () => {
    assertValidDate(epoch);
  });

  bench('accepts a typical timestamp', () => {
    assertValidDate(typicalDate);
  });

  bench('accepts a distant valid date', () => {
    assertValidDate(distantDate);
  });

  bench('rejects an invalid Date', () => {
    try {
      assertValidDate(invalidDate);
    } catch {
      return;
    }
  });

  bench('rejects null', () => {
    try {
      assertValidDate(nullInput);
    } catch {
      return;
    }
  });

  bench('rejects undefined', () => {
    try {
      assertValidDate(undefinedInput);
    } catch {
      return;
    }
  });

  bench('rejects a numeric timestamp', () => {
    try {
      assertValidDate(timestampInput);
    } catch {
      return;
    }
  });

  bench('rejects a date string', () => {
    try {
      assertValidDate(dateString);
    } catch {
      return;
    }
  });
});
