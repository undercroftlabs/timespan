import { bench, describe } from 'vitest';

import { SecondConverter } from './second-converter';

const converter = new SecondConverter();
const rangeError =
  'Invalid date range: expected the start date to be less than or equal to the end date.';
const dateError = 'Invalid date: expected a valid Date.';
const amountError =
  'Invalid number of seconds: expected zero or a positive number.';
const rangeLimitError =
  'Invalid number of seconds: expected a result within the representable date range.';

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
    throw new Error(`expected ${expected} seconds, received ${actual}`);
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

describe('SecondConverter', () => {
  bench('counts zero seconds between equal instants', () => {
    converter.between(start, sameInstant);
  });

  bench('counts one second', () => {
    converter.between(start, oneUnit);
  });

  bench('counts a partial second as zero', () => {
    converter.between(start, partialUnit);
  });

  bench('counts one thousand seconds', () => {
    converter.between(start, thousandUnits);
  });

  bench('counts one million seconds', () => {
    converter.between(start, millionUnits);
  });

  bench('adds zero seconds', () => {
    converter.add(0, start);
  });

  bench('adds one second', () => {
    converter.add(1, start);
  });

  bench('adds one thousand seconds', () => {
    converter.add(1000, start);
  });

  bench('rejects a reversed second range', () => {
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

  bench('rejects a negative second count', () => {
    try {
      converter.add(negativeAmount, start);
    } catch {
      return;
    }
  });

  bench('rejects a non-finite second count', () => {
    try {
      converter.add(nonFiniteAmount, start);
    } catch {
      return;
    }
  });

  bench('rejects a second count past the representable range', () => {
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
