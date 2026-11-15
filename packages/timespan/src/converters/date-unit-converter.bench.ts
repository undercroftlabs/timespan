import { bench, describe } from 'vitest';

import { TimeUnit } from '../types/time-unit';
import { DateUnitConverter } from './date-unit-converter';

const rejectionMessage = 'Invalid year: expected a finite integer.';

class LeapYearProbe extends DateUnitConverter {
  public readonly default = 'year';

  public readonly plural = 'years';

  public readonly abbreviation = 'y';

  public readonly aliases: Array<TimeUnit> = ['year'];

  public readonly millisecondsPerUnit = 0;

  public between(): number {
    return 0;
  }

  public add(_value: number, startDate: Date): Date {
    return startDate;
  }
}

const converter = new LeapYearProbe();
const commonYear = 2023;
const leapYear = 2024;
const centuryYear = 1900;
const quadricentennialYear = 2000;
const yearZero = 0;
const negativeLeapYear = -4;
const fractionalYear = 1.5;
const nonFiniteYear = Number.NaN;
const infiniteYear = Number.POSITIVE_INFINITY;

function expectLeap(year: number, expected: boolean): void {
  const actual = converter.isLeapYear(year);
  if (actual !== expected) {
    throw new Error(
      `expected ${year} leap status ${expected}, received ${actual}`,
    );
  }
}

function expectRejected(year: number): void {
  try {
    converter.isLeapYear(year);
  } catch (error) {
    if (error instanceof Error && error.message === rejectionMessage) {
      return;
    }

    throw error;
  }

  throw new Error(rejectionMessage);
}

expectLeap(commonYear, false);
expectLeap(leapYear, true);
expectLeap(centuryYear, false);
expectLeap(quadricentennialYear, true);
expectLeap(yearZero, true);
expectLeap(negativeLeapYear, true);
expectRejected(fractionalYear);
expectRejected(nonFiniteYear);
expectRejected(infiniteYear);

describe('DateUnitConverter', () => {
  bench('reports a common year', () => {
    converter.isLeapYear(commonYear);
  });

  bench('reports a leap year', () => {
    converter.isLeapYear(leapYear);
  });

  bench('reports a century year', () => {
    converter.isLeapYear(centuryYear);
  });

  bench('reports a quadricentennial year', () => {
    converter.isLeapYear(quadricentennialYear);
  });

  bench('reports year zero', () => {
    converter.isLeapYear(yearZero);
  });

  bench('reports a negative leap year', () => {
    converter.isLeapYear(negativeLeapYear);
  });

  bench('rejects a fractional year', () => {
    try {
      converter.isLeapYear(fractionalYear);
    } catch {
      return;
    }
  });

  bench('rejects NaN', () => {
    try {
      converter.isLeapYear(nonFiniteYear);
    } catch {
      return;
    }
  });

  bench('rejects Infinity', () => {
    try {
      converter.isLeapYear(infiniteYear);
    } catch {
      return;
    }
  });
});
