import { TimeUnit } from '../types';
import { DateUnitConverter } from './date-unit-converter';

const maxTimestamp = 8.64e15;
const minTimestamp = -8.64e15;
const invalidYear = 'Invalid year: expected a finite integer.';
const invalidAmount =
  'Invalid number of days: expected zero or a positive number.';
const invalidTimestamp =
  'Invalid number of days: expected a result within the representable date range.';

class ExposedConverter extends DateUnitConverter {
  public readonly default = 'day';
  public readonly plural = 'days';
  public readonly abbreviation = 'd';
  public readonly aliases: Array<TimeUnit> = ['day', 'days', 'd'];
  public readonly millisecondsPerUnit = 86_400_000;

  public between(startDate: Date, endDate: Date): number {
    return endDate.getTime() - startDate.getTime();
  }

  public add(value: number, startDate: Date): Date {
    return new Date(startDate.getTime() + value);
  }

  public checkAmount(amount: number): void {
    this.assertAddAmount(amount);
  }

  public timestampInRange(time: number): boolean {
    return this.isTimestampInRange(time);
  }

  public checkTimestamp(time: number): void {
    this.assertTimestampInRange(time);
  }
}

describe('DateUnitConverter', () => {
  let converter: ExposedConverter;

  beforeEach(() => {
    converter = new ExposedConverter();
  });

  describe('isLeapYear', () => {
    describe('accepted years', () => {
      test.each`
        label                                 | year       | leap
        ${'year zero'}                        | ${0}       | ${true}
        ${'negative zero'}                    | ${-0}      | ${true}
        ${'year four'}                        | ${4}       | ${true}
        ${'a common year'}                    | ${2021}    | ${false}
        ${'a year divisible by four'}         | ${2020}    | ${true}
        ${'the year before a leap'}           | ${2019}    | ${false}
        ${'2024'}                             | ${2024}    | ${true}
        ${'a century that is not 400'}        | ${1900}    | ${false}
        ${'2100'}                             | ${2100}    | ${false}
        ${'a year divisible by 400'}          | ${2000}    | ${true}
        ${'1600'}                             | ${1600}    | ${true}
        ${'2400'}                             | ${2400}    | ${true}
        ${'year 100'}                         | ${100}     | ${false}
        ${'year 400'}                         | ${400}     | ${true}
        ${'four years before year zero'}      | ${-4}      | ${true}
        ${'a negative century'}               | ${-100}    | ${false}
        ${'a negative year divisible by 400'} | ${-400}    | ${true}
        ${'the year before a negative leap'}  | ${-401}    | ${false}
        ${'the maximum representable year'}   | ${275760}  | ${true}
        ${'the minimum representable year'}   | ${-271821} | ${false}
      `('reports $label', ({ year, leap }: { year: number; leap: boolean }) => {
        expect(converter.isLeapYear(year)).toBe(leap);
      });
    });

    describe('rejected values', () => {
      const bigintValue = Function('return 1n')();

      test.each`
        label                         | year
        ${'NaN'}                      | ${Number.NaN}
        ${'Infinity'}                 | ${Number.POSITIVE_INFINITY}
        ${'negative Infinity'}        | ${Number.NEGATIVE_INFINITY}
        ${'a fractional year'}        | ${2000.5}
        ${'a fractional common year'} | ${2021.2}
        ${'null'}                     | ${null}
        ${'undefined'}                | ${undefined}
        ${'a numeric string'}         | ${'2000'}
        ${'a common-year string'}     | ${'1900'}
        ${'an empty string'}          | ${''}
        ${'true'}                     | ${true}
        ${'false'}                    | ${false}
        ${'a bigint'}                 | ${bigintValue}
        ${'a plain object'}           | ${{}}
        ${'a Date'}                   | ${new Date('2000-01-01T00:00:00.000Z')}
      `('throws for $label', ({ year }: { year: number }) => {
        expect(() => converter.isLeapYear(year)).toThrow(
          new Error(invalidYear),
        );
      });
    });
  });

  describe('assertAddAmount', () => {
    describe('accepted amounts', () => {
      test.each`
        label                      | amount
        ${'zero'}                  | ${0}
        ${'negative zero'}         | ${-0}
        ${'a fraction'}            | ${0.5}
        ${'one'}                   | ${1}
        ${'a large finite number'} | ${Number.MAX_VALUE}
      `('accepts $label', ({ amount }: { amount: number }) => {
        expect(() => converter.checkAmount(amount)).not.toThrow();
      });
    });

    describe('rejected values', () => {
      const bigintValue = Function('return 1n')();

      test.each`
        label                    | amount
        ${'negative one'}        | ${-1}
        ${'a negative fraction'} | ${-0.5}
        ${'NaN'}                 | ${Number.NaN}
        ${'Infinity'}            | ${Number.POSITIVE_INFINITY}
        ${'negative Infinity'}   | ${Number.NEGATIVE_INFINITY}
        ${'a numeric string'}    | ${'1'}
        ${'an empty string'}     | ${''}
        ${'true'}                | ${true}
        ${'false'}               | ${false}
        ${'null'}                | ${null}
        ${'undefined'}           | ${undefined}
        ${'a bigint'}            | ${bigintValue}
        ${'a plain object'}      | ${{}}
      `('throws for $label', ({ amount }: { amount: number }) => {
        expect(() => converter.checkAmount(amount)).toThrow(
          new Error(invalidAmount),
        );
      });
    });
  });

  describe('isTimestampInRange', () => {
    test.each`
      label                         | time                        | inRange
      ${'the epoch'}                | ${0}                        | ${true}
      ${'negative zero'}            | ${-0}                       | ${true}
      ${'one millisecond'}          | ${1}                        | ${true}
      ${'a fractional millisecond'} | ${1.5}                      | ${true}
      ${'the minimum instant'}      | ${minTimestamp}             | ${true}
      ${'the maximum instant'}      | ${maxTimestamp}             | ${true}
      ${'one before the minimum'}   | ${minTimestamp - 1}         | ${false}
      ${'one past the maximum'}     | ${maxTimestamp + 1}         | ${false}
      ${'NaN'}                      | ${Number.NaN}               | ${false}
      ${'Infinity'}                 | ${Number.POSITIVE_INFINITY} | ${false}
      ${'negative Infinity'}        | ${Number.NEGATIVE_INFINITY} | ${false}
    `(
      'reports $label',
      ({ time, inRange }: { time: number; inRange: boolean }) => {
        expect(converter.timestampInRange(time)).toBe(inRange);
      },
    );
  });

  describe('assertTimestampInRange', () => {
    describe('accepted timestamps', () => {
      test.each`
        label                    | time
        ${'the epoch'}           | ${0}
        ${'negative zero'}       | ${-0}
        ${'the minimum instant'} | ${minTimestamp}
        ${'the maximum instant'} | ${maxTimestamp}
      `('accepts $label', ({ time }: { time: number }) => {
        expect(() => converter.checkTimestamp(time)).not.toThrow();
      });
    });

    describe('rejected values', () => {
      test.each`
        label                       | time
        ${'one before the minimum'} | ${minTimestamp - 1}
        ${'one past the maximum'}   | ${maxTimestamp + 1}
        ${'NaN'}                    | ${Number.NaN}
        ${'Infinity'}               | ${Number.POSITIVE_INFINITY}
        ${'negative Infinity'}      | ${Number.NEGATIVE_INFINITY}
        ${'a numeric string'}       | ${'0'}
        ${'null'}                   | ${null}
        ${'undefined'}              | ${undefined}
      `('throws for $label', ({ time }: { time: number }) => {
        expect(() => converter.checkTimestamp(time)).toThrow(
          new Error(invalidTimestamp),
        );
      });
    });
  });
});
