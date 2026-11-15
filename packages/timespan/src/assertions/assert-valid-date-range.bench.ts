import { bench, describe } from 'vitest';

import { assertValidDateRange } from './assert-valid-date-range';

const rejectionMessage =
  'Invalid date range: expected the start date to be less than or equal to the end date.';

const start = new Date(Date.UTC(2020, 0, 15, 12, 30, 45, 123));
const sameInstant = new Date(start.getTime());
const oneMillisecondLater = new Date(start.getTime() + 1);
const distantEnd = new Date(Date.UTC(2100, 0, 1));
const invalidDate = new Date(Number.NaN);
const nullInput = null;
const dateString = '2020-01-15T12:30:45.123Z';

function expectAccepted(rangeStart: Date, rangeEnd: Date): void {
  assertValidDateRange(rangeStart, rangeEnd);
}

function expectRejected(rangeStart: unknown, rangeEnd: unknown): void {
  try {
    assertValidDateRange(rangeStart, rangeEnd);
  } catch (error) {
    if (error instanceof Error && error.message === rejectionMessage) {
      return;
    }

    throw error;
  }

  throw new Error(rejectionMessage);
}

expectAccepted(start, sameInstant);
expectAccepted(start, oneMillisecondLater);
expectAccepted(start, distantEnd);
expectRejected(oneMillisecondLater, start);
expectRejected(invalidDate, start);
expectRejected(start, invalidDate);
expectRejected(nullInput, start);
expectRejected(dateString, start);

describe('assertValidDateRange', () => {
  bench('accepts equal instants', () => {
    assertValidDateRange(start, sameInstant);
  });

  bench('accepts a one-millisecond span', () => {
    assertValidDateRange(start, oneMillisecondLater);
  });

  bench('accepts a multi-decade span', () => {
    assertValidDateRange(start, distantEnd);
  });

  bench('rejects a reversed range', () => {
    try {
      assertValidDateRange(oneMillisecondLater, start);
    } catch {
      return;
    }
  });

  bench('rejects an invalid start date', () => {
    try {
      assertValidDateRange(invalidDate, start);
    } catch {
      return;
    }
  });

  bench('rejects an invalid end date', () => {
    try {
      assertValidDateRange(start, invalidDate);
    } catch {
      return;
    }
  });

  bench('rejects null', () => {
    try {
      assertValidDateRange(nullInput, start);
    } catch {
      return;
    }
  });

  bench('rejects a date string', () => {
    try {
      assertValidDateRange(dateString, start);
    } catch {
      return;
    }
  });
});
