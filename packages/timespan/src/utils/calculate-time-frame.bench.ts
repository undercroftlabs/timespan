import { bench, describe } from 'vitest';

import { TimeFrame } from '../types/timeframe';
import { calculateTimeFrame } from './calculate-time-frame';

const dateError = 'Invalid date: expected a valid Date.';
const rangeError =
  'Invalid date range: expected the start date to be less than or equal to the end date.';

const start = new Date(Date.UTC(2020, 0, 15));
const sameInstant = new Date(start.getTime());
const shortEnd = new Date(start.getTime() + ((1 * 60 + 2) * 60 + 3) * 1000 + 4);
const longEnd = new Date(Date.UTC(2022, 2, 20));
const invalidDate = new Date(Number.NaN);

function expectFrame(end: Date, expected: Partial<TimeFrame>): void {
  const actual = calculateTimeFrame(start, end);

  for (const unit of Object.keys(actual) as Array<keyof TimeFrame>) {
    const value = expected[unit];

    if (value !== undefined && actual[unit] !== value) {
      throw new Error(`expected ${value} ${unit}, received ${actual[unit]}`);
    }
  }
}

function expectRejected(
  rangeStart: Date,
  rangeEnd: Date,
  message: string,
): void {
  try {
    calculateTimeFrame(rangeStart, rangeEnd);
  } catch (error) {
    if (error instanceof Error && error.message === message) {
      return;
    }

    throw error;
  }

  throw new Error(message);
}

expectFrame(sameInstant, {
  years: 0,
  months: 0,
  weeks: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
});
expectFrame(shortEnd, {
  years: 0,
  months: 0,
  weeks: 0,
  days: 0,
  hours: 1,
  minutes: 2,
  seconds: 3,
  milliseconds: 4,
});
expectFrame(longEnd, {
  years: 2,
  months: 2,
  weeks: 0,
  days: 5,
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
});
expectRejected(start, invalidDate, dateError);
expectRejected(shortEnd, start, rangeError);

describe('calculateTimeFrame', () => {
  bench('calculates an empty span', () => {
    calculateTimeFrame(start, sameInstant);
  });

  bench('calculates a span under one day', () => {
    calculateTimeFrame(start, shortEnd);
  });

  bench('calculates a multi-year span', () => {
    calculateTimeFrame(start, longEnd);
  });

  bench('rejects an invalid end date', () => {
    try {
      calculateTimeFrame(start, invalidDate);
    } catch {
      return;
    }
  });

  bench('rejects a reversed range', () => {
    try {
      calculateTimeFrame(shortEnd, start);
    } catch {
      return;
    }
  });
});
