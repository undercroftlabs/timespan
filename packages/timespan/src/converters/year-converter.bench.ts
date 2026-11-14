import { bench, describe } from 'vitest';

import { YearConverter } from './year-converter';

const converter = new YearConverter();
const rangeError =
  'Invalid date range: expected the start date to be less than or equal to the end date.';
const dateError = 'Invalid date: expected a valid Date.';
const amountError =
  'Invalid number of years: expected zero or a positive number.';
const rangeLimitError =
  'Invalid number of years: expected a result within the representable date range.';

const start = new Date(Date.UTC(2020, 5, 15, 12, 30, 45, 123));
const sameInstant = new Date(start.getTime());
const exactAnniversary = new Date(Date.UTC(2021, 5, 15, 12, 30, 45, 123));
const beforeAnniversary = new Date(Date.UTC(2021, 5, 14, 12, 30, 45, 123));
const fiftyYearAnniversary = new Date(Date.UTC(2070, 5, 15, 12, 30, 45, 123));
const leapDay = new Date(Date.UTC(2020, 1, 29, 12, 30, 45, 123));
const leapDayPlusOneYear = new Date(Date.UTC(2021, 1, 28, 12, 30, 45, 123));
const leapDayPlusFourYears = new Date(Date.UTC(2024, 1, 29, 12, 30, 45, 123));
const invalidDate = new Date(Number.NaN);
const negativeAmount = -1;
const nonFiniteAmount = Number.NaN;
const overflowYears = 1_000_000;

function expectBetween(
  rangeStart: Date,
  rangeEnd: Date,
  expected: number,
): void {
  const actual = converter.between(rangeStart, rangeEnd);
  if (actual !== expected) {
    throw new Error(`expected ${expected} years, received ${actual}`);
  }
}

function expectAdded(amount: number, rangeStart: Date, expected: Date): void {
  const actual = converter.add(amount, rangeStart).getTime();
  if (actual !== expected.getTime()) {
    throw new Error(
      `expected ${expected.toISOString()}, received ${new Date(actual).toISOString()}`,
    );
  }
}

function expectRejected(run: () => void, message: string): void {
  try {
    run();
  } catch (error) {
    if (error instanceof Error && error.message === message) {
      return;
    }

    throw error;
  }

  throw new Error(message);
}

expectBetween(start, sameInstant, 0);
expectBetween(start, beforeAnniversary, 0);
expectBetween(start, exactAnniversary, 1);
expectBetween(start, fiftyYearAnniversary, 50);
expectBetween(leapDay, leapDayPlusOneYear, 1);
expectBetween(leapDay, leapDayPlusFourYears, 4);
expectAdded(0, start, start);
expectAdded(1, start, exactAnniversary);
expectAdded(1, leapDay, leapDayPlusOneYear);
expectAdded(4, leapDay, leapDayPlusFourYears);
expectRejected(() => converter.between(exactAnniversary, start), rangeError);
expectRejected(() => converter.between(start, invalidDate), rangeError);
expectRejected(() => converter.add(negativeAmount, start), amountError);
expectRejected(() => converter.add(nonFiniteAmount, start), amountError);
expectRejected(() => converter.add(overflowYears, start), rangeLimitError);
expectRejected(() => converter.add(1, invalidDate), dateError);

describe('YearConverter', () => {
  bench('counts zero years between equal instants', () => {
    converter.between(start, sameInstant);
  });

  bench('counts an anniversary that has not landed', () => {
    converter.between(start, beforeAnniversary);
  });

  bench('counts one exact anniversary', () => {
    converter.between(start, exactAnniversary);
  });

  bench('counts a fifty-year anniversary', () => {
    converter.between(start, fiftyYearAnniversary);
  });

  bench('counts one year from a leap day', () => {
    converter.between(leapDay, leapDayPlusOneYear);
  });

  bench('counts four years between leap days', () => {
    converter.between(leapDay, leapDayPlusFourYears);
  });

  bench('adds zero years', () => {
    converter.add(0, start);
  });

  bench('adds one year', () => {
    converter.add(1, start);
  });

  bench('adds one year to a leap day', () => {
    converter.add(1, leapDay);
  });

  bench('adds four years to a leap day', () => {
    converter.add(4, leapDay);
  });

  bench('rejects a reversed year range', () => {
    try {
      converter.between(exactAnniversary, start);
    } catch {
      return;
    }
  });

  bench('rejects an invalid end date', () => {
    try {
      converter.between(start, invalidDate);
    } catch {
      return;
    }
  });

  bench('rejects a negative year count', () => {
    try {
      converter.add(negativeAmount, start);
    } catch {
      return;
    }
  });

  bench('rejects a non-finite year count', () => {
    try {
      converter.add(nonFiniteAmount, start);
    } catch {
      return;
    }
  });

  bench('rejects a year count past the representable range', () => {
    try {
      converter.add(overflowYears, start);
    } catch {
      return;
    }
  });

  bench('rejects an invalid start date', () => {
    try {
      converter.add(1, invalidDate);
    } catch {
      return;
    }
  });
});
