import { bench, describe } from 'vitest';

import { MonthConverter } from './month-converter';

const converter = new MonthConverter();
const rangeError =
  'Invalid date range: expected the start date to be less than or equal to the end date.';
const dateError = 'Invalid date: expected a valid Date.';
const amountError =
  'Invalid number of months: expected zero or a positive number.';
const rangeLimitError =
  'Invalid number of months: expected a result within the representable date range.';

const start = new Date(Date.UTC(2020, 0, 15, 12, 30, 45, 123));
const sameInstant = new Date(start.getTime());
const beforeAnniversary = new Date(Date.UTC(2020, 1, 14, 12, 30, 45, 123));
const exactAnniversary = new Date(Date.UTC(2020, 1, 15, 12, 30, 45, 123));
const fourteenMonths = new Date(Date.UTC(2021, 2, 15, 12, 30, 45, 123));
const monthEnd = new Date(Date.UTC(2020, 0, 31, 12, 30, 45, 123));
const clampedLeapMonth = new Date(Date.UTC(2020, 1, 29, 12, 30, 45, 123));
const clampedCommonMonth = new Date(Date.UTC(2021, 1, 28, 12, 30, 45, 123));
const commonMonthEnd = new Date(Date.UTC(2021, 0, 31, 12, 30, 45, 123));
const invalidDate = new Date(Number.NaN);
const negativeAmount = -1;
const nonFiniteAmount = Number.NaN;
const overflowMonths = 12_000_000;

function expectBetween(
  rangeStart: Date,
  rangeEnd: Date,
  expected: number,
): void {
  const actual = converter.between(rangeStart, rangeEnd);
  if (actual !== expected) {
    throw new Error(`expected ${expected} months, received ${actual}`);
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
expectBetween(start, fourteenMonths, 14);
expectAdded(0, start, start);
expectAdded(1, start, exactAnniversary);
expectAdded(1, monthEnd, clampedLeapMonth);
expectAdded(1, commonMonthEnd, clampedCommonMonth);
expectRejected(() => converter.between(exactAnniversary, start), rangeError);
expectRejected(() => converter.between(start, invalidDate), rangeError);
expectRejected(() => converter.add(negativeAmount, start), amountError);
expectRejected(() => converter.add(nonFiniteAmount, start), amountError);
expectRejected(() => converter.add(overflowMonths, start), rangeLimitError);
expectRejected(() => converter.add(1, invalidDate), dateError);

describe('MonthConverter', () => {
  bench('counts zero months between equal instants', () => {
    converter.between(start, sameInstant);
  });

  bench('counts an anniversary that has not landed', () => {
    converter.between(start, beforeAnniversary);
  });

  bench('counts one exact anniversary', () => {
    converter.between(start, exactAnniversary);
  });

  bench('counts a fourteen-month span', () => {
    converter.between(start, fourteenMonths);
  });

  bench('adds zero months', () => {
    converter.add(0, start);
  });

  bench('adds one month', () => {
    converter.add(1, start);
  });

  bench('clamps a month-end onto a leap day', () => {
    converter.add(1, monthEnd);
  });

  bench('clamps a month-end onto a short February', () => {
    converter.add(1, commonMonthEnd);
  });

  bench('rejects a reversed month range', () => {
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

  bench('rejects a negative month count', () => {
    try {
      converter.add(negativeAmount, start);
    } catch {
      return;
    }
  });

  bench('rejects a non-finite month count', () => {
    try {
      converter.add(nonFiniteAmount, start);
    } catch {
      return;
    }
  });

  bench('rejects a month count past the representable range', () => {
    try {
      converter.add(overflowMonths, start);
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
