import { bench, describe } from 'vitest';

import { MinuteConverter } from './minute-converter';

const converter = new MinuteConverter();
const rangeError =
  'Invalid date range: expected the start date to be less than or equal to the end date.';
const dateError = 'Invalid date: expected a valid Date.';
const amountError =
  'Invalid number of minutes: expected zero or a positive number.';
const rangeLimitError =
  'Invalid number of minutes: expected a result within the representable date range.';

const start = new Date(Date.UTC(2020, 0, 15, 12, 30, 45, 123));
const sameInstant = new Date(start.getTime());
const oneUnit = new Date(start.getTime() + converter.millisecondsPerUnit);
const partialUnit = new Date(
  start.getTime() + converter.millisecondsPerUnit - 1,
);
const thousandUnits = new Date(
  start.getTime() + converter.millisecondsPerUnit * 1000,
);
const millionUnits = new Date(
  start.getTime() + converter.millisecondsPerUnit * 1_000_000,
);
const invalidDate = new Date(Number.NaN);
const negativeAmount = -1;
const nonFiniteAmount = Number.NaN;
const overflowAmount =
  Math.floor((8.64e15 - start.getTime()) / converter.millisecondsPerUnit) + 1;

function expectBetween(end: Date, expected: number): void {
  const actual = converter.between(start, end);
  if (actual !== expected) {
    throw new Error(`expected ${expected} minutes, received ${actual}`);
  }
}

function expectAdded(amount: number, expected: Date): void {
  const actual = converter.add(amount, start).getTime();
  if (actual !== expected.getTime()) {
    throw new Error(`expected ${expected.getTime()}, received ${actual}`);
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

expectBetween(sameInstant, 0);
expectBetween(oneUnit, 1);
expectBetween(partialUnit, 0);
expectBetween(thousandUnits, 1000);
expectBetween(millionUnits, 1_000_000);
expectAdded(0, start);
expectAdded(1, oneUnit);
expectAdded(1000, thousandUnits);
expectRejected(() => converter.between(oneUnit, start), rangeError);
expectRejected(() => converter.between(start, invalidDate), rangeError);
expectRejected(() => converter.add(negativeAmount, start), amountError);
expectRejected(() => converter.add(nonFiniteAmount, start), amountError);
expectRejected(() => converter.add(overflowAmount, start), rangeLimitError);
expectRejected(() => converter.add(1, invalidDate), dateError);

describe('MinuteConverter', () => {
  bench('counts zero minutes between equal instants', () => {
    converter.between(start, sameInstant);
  });

  bench('counts one minute', () => {
    converter.between(start, oneUnit);
  });

  bench('counts a partial minute as zero', () => {
    converter.between(start, partialUnit);
  });

  bench('counts one thousand minutes', () => {
    converter.between(start, thousandUnits);
  });

  bench('counts one million minutes', () => {
    converter.between(start, millionUnits);
  });

  bench('adds zero minutes', () => {
    converter.add(0, start);
  });

  bench('adds one minute', () => {
    converter.add(1, start);
  });

  bench('adds one thousand minutes', () => {
    converter.add(1000, start);
  });

  bench('rejects a reversed minute range', () => {
    try {
      converter.between(oneUnit, start);
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

  bench('rejects a negative minute count', () => {
    try {
      converter.add(negativeAmount, start);
    } catch {
      return;
    }
  });

  bench('rejects a non-finite minute count', () => {
    try {
      converter.add(nonFiniteAmount, start);
    } catch {
      return;
    }
  });

  bench('rejects a minute count past the representable range', () => {
    try {
      converter.add(overflowAmount, start);
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
