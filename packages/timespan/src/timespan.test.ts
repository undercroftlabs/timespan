// noinspection DuplicatedCode

import { Timespan } from '../src';
import { formatTimespan } from './utils/format-timespan';

/**
 * Deterministic mulberry32 PRNG so fuzz runs are reproducible.
 * @param seed - Initial 32-bit seed.
 * @returns A function that yields the next value in the range `[0, 1)`.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('Timespan', () => {
  const start = new Date('2022-01-01T06:24:00Z');
  const end = new Date('2023-02-21T10:52:00Z');

  describe('constructor', () => {
    it('should throw an error if the start date is greater than the end date', () => {
      const startDate = new Date('2023-06-01');
      const endDate = new Date('2023-05-31');
      expect(() => new Timespan(startDate, endDate)).toThrow(
        'Invalid date range: expected the start date to be less than or equal to the end date.',
      );
    });

    it('should allow a zero-length span', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const timespan = new Timespan(startDate, new Date(startDate));
      expect(timespan.toMilliseconds()).toBe(0);
      expect(timespan.toString()).toBe('');
      expect(timespan.toTimeframe()).toEqual({
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
    });

    it('should represent a 1ms span', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const timespan = new Timespan(
        startDate,
        new Date(startDate.getTime() + 1),
      );
      expect(timespan.toMilliseconds()).toBe(1);
      expect(timespan.toString()).toBe('1ms');
    });

    it('should throw an error for an invalid Date', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => new Timespan(new Date('not a date'), startDate)).toThrow(
        'Invalid date: expected a valid Date.',
      );
      expect(() => new Timespan(startDate, new Date(Number.NaN))).toThrow(
        'Invalid date: expected a valid Date.',
      );
    });
  });

  describe('start', () => {
    it('should return the start date', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.start.toISOString()).toBe(start.toISOString());
    });
  });

  describe('end', () => {
    it('should return the end date', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.end.toISOString()).toBe(end.toISOString());
    });
  });

  describe('immutability', () => {
    it('should ignore mutations of the dates passed to the constructor', () => {
      const startDate = new Date('2023-01-15T00:00:00.000Z');
      const endDate = new Date('2023-02-15T00:00:00.000Z');
      const timespan = new Timespan(startDate, endDate);

      startDate.setUTCFullYear(1999);
      endDate.setUTCFullYear(1999);

      expect(timespan.start.toISOString()).toBe('2023-01-15T00:00:00.000Z');
      expect(timespan.end.toISOString()).toBe('2023-02-15T00:00:00.000Z');
    });

    it('should ignore mutations of the date returned by start', () => {
      const timespan = new Timespan(start, end);
      timespan.start.setUTCFullYear(1999);
      expect(timespan.start.toISOString()).toBe(start.toISOString());
    });

    it('should ignore mutations of the date returned by end', () => {
      const timespan = new Timespan(start, end);
      timespan.end.setUTCFullYear(1999);
      expect(timespan.end.toISOString()).toBe(end.toISOString());
    });

    it('should ignore mutations of the timeframe returned by toTimeframe', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      timeframe.years = 99;
      timeframe.months = 99;

      expect(timespan.toTimeframe().years).toBe(1);
      expect(timespan.toTimeframe().months).toBe(1);
      expect(timespan.toString()).toBe('1y 1M 2w 6d 4h 28m');
    });
  });

  describe('fromUnits', () => {
    it('should throw an error for invalid date input', () => {
      const startDate = '2023-05-01' as unknown as Date;
      expect(() => Timespan.fromUnits(5, 'year', startDate)).toThrow(
        'Invalid date: expected a valid Date.',
      );
    });

    it('should throw an error for negative day input', () => {
      const startDate = new Date('2023-05-01');
      expect(() => Timespan.fromUnits(-5, 'year', startDate)).toThrow(
        'Invalid unit input -5.',
      );
    });

    it('should create a zero span from zero units', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(Timespan.fromDays(0, startDate).toMilliseconds()).toBe(0);
      expect(Timespan.fromMilliseconds(0, startDate).toMilliseconds()).toBe(0);
    });

    it('should support fractional fixed-length units', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(Timespan.fromHours(1.5, startDate).toMilliseconds()).toBe(
        5_400_000,
      );
      expect(Timespan.fromDays(1.5, startDate).toHours()).toBe(36);
      expect(Timespan.fromMinutes(0.25, startDate).toSeconds()).toBe(15);
    });

    it('should floor unit conversions to whole units', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const halfWeek = Timespan.fromWeeks(0.5, startDate);
      expect(halfWeek.toMilliseconds()).toBe(302_400_000);
      expect(halfWeek.toDays()).toBe(3);
    });

    it('should truncate a fractional month to none', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const timespan = Timespan.fromMonths(0.5, startDate);
      expect(timespan.end.toISOString()).toBe(startDate.toISOString());
    });

    it('should round-trip a large day count', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(Timespan.fromDays(365_000, startDate).toDays()).toBe(365_000);
    });

    it('should throw an error for a negative amount in every factory', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromMilliseconds(-1, startDate)).toThrow(
        'Invalid unit input -1.',
      );
      expect(() => Timespan.fromSeconds(-1, startDate)).toThrow(
        'Invalid unit input -1.',
      );
      expect(() => Timespan.fromMinutes(-1, startDate)).toThrow(
        'Invalid unit input -1.',
      );
      expect(() => Timespan.fromHours(-1, startDate)).toThrow(
        'Invalid unit input -1.',
      );
      expect(() => Timespan.fromDays(-1, startDate)).toThrow(
        'Invalid unit input -1.',
      );
      expect(() => Timespan.fromWeeks(-1, startDate)).toThrow(
        'Invalid unit input -1.',
      );
      expect(() => Timespan.fromMonths(-1, startDate)).toThrow(
        'Invalid unit input -1.',
      );
      expect(() => Timespan.fromYears(-1, startDate)).toThrow(
        'Invalid unit input -1.',
      );
    });

    it('should throw an error for an invalid unit passed to fromUnits or toUnit', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() =>
        Timespan.fromUnits(1, 'fortnights' as unknown as 'days', startDate),
      ).toThrow('Invalid time unit: expected a recognized time unit.');
      const timespan = Timespan.fromDays(1, startDate);
      expect(() => timespan.toUnit('fortnights' as unknown as 'days')).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
    });

    it('should agree across factories for equivalent spans', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const weeks = Timespan.fromWeeks(2, startDate);
      const days = Timespan.fromDays(14, startDate);
      const hours = Timespan.fromHours(336, startDate);
      const minutes = Timespan.fromMinutes(20_160, startDate);
      expect(weeks.toMilliseconds()).toBe(days.toMilliseconds());
      expect(days.toMilliseconds()).toBe(hours.toMilliseconds());
      expect(hours.toMilliseconds()).toBe(minutes.toMilliseconds());
    });

    it('should floor a sub-unit remainder', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const timespan = Timespan.fromMilliseconds(90_061, startDate);
      expect(timespan.toSeconds()).toBe(90);
      expect(timespan.toMinutes()).toBe(1);
      expect(timespan.toTimeframe()).toEqual({
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 1,
        seconds: 30,
        milliseconds: 61,
      });
    });
  });

  describe('toTimeframe', () => {
    it('should return the time span in milliseconds', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      expect(timeframe.milliseconds).toBe(0);
    });

    it('should return the time span in seconds', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      expect(timeframe.seconds).toBe(0);
    });

    it('should return the time span in minutes', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      expect(timeframe.minutes).toBe(28);
    });

    it('should return the time span in hours', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      expect(timeframe.hours).toBe(4);
    });

    it('should return the time span in days', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      expect(timeframe.days).toBe(6);
    });

    it('should return the time span in weeks', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      expect(timeframe.weeks).toBe(2);
    });

    it('should return the time span in months', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      expect(timeframe.months).toBe(1);
    });

    it('should return the time span in years', () => {
      const timespan = new Timespan(start, end);
      const timeframe = timespan.toTimeframe();
      expect(timeframe.years).toBe(1);
    });
  });

  describe('toString', () => {
    it('should return the string representation of the timespan', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toString()).toBe('1y 1M 2w 6d 4h 28m');
    });
  });

  describe('toUnit', () => {
    it('should return the time span in the specified unit', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toUnit('milliseconds')).toBe(35958480000);
    });
  });

  describe('toMilliseconds', () => {
    it('should return the time span in milliseconds', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toMilliseconds()).toBe(35958480000);
    });
  });

  describe('toSeconds', () => {
    it('should return the time span in seconds', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toSeconds()).toBe(35958480);
    });
  });

  describe('toMinutes', () => {
    it('should return the time span in minutes', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toMinutes()).toBe(599308);
    });
  });

  describe('toHours', () => {
    it('should return the time span in hours', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toHours()).toBe(9988);
    });
  });

  describe('toDays', () => {
    it('should return the time span in days', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toDays()).toBe(416);
    });
  });

  describe('toWeeks', () => {
    it('should return the time span in weeks', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toWeeks()).toBe(59);
    });
  });

  describe('toMonths', () => {
    it('should return the time span in months', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toMonths()).toBe(13);
    });
  });

  describe('toYears', () => {
    it('should return the time span in years', () => {
      const timespan = new Timespan(start, end);
      expect(timespan.toYears()).toBe(1);
    });
  });

  describe('fromString', () => {
    const blacklistedCharacters = [
      '!',
      '@',
      '#',
      '$',
      '%',
      '^',
      '&',
      '*',
      '(',
      ')',
      '~',
      '+',
      '-',
      '=',
      '[',
      ']',
      '{',
      '}',
      '|',
      '\\',
      ';',
      ':',
      "'",
      '"',
      ',',
      '.',
      '<',
      '>',
      '?',
      '/',
      '*',
      '^',
      '#',
      '你',
      '好',
      '世',
      '界',
    ];

    const allowedStrings = [
      [
        '1years 1months 2weeks 5days 17hours 58minutes 43seconds 200milliseconds',
        '1y 1M 2w 5d 17h 58m 43s 200ms',
      ],
      [
        '1year 1month 2week 5day 17hour 58minute 43second 200millisecond',
        '1y 1M 2w 5d 17h 58m 43s 200ms',
      ],
      [
        '1yrs 1mos 2wks 5dys 17hrs 58mins 43secs 200msec',
        '1y 1M 2w 5d 17h 58m 43s 200ms',
      ],
      [
        '1yr 1mo 2wk 5dy 17hr 58min 43sec 200mss',
        '1y 1M 2w 5d 17h 58m 43s 200ms',
      ],
      ['1y 1M 2w 5d 17h 58m 43s 200ms', '1y 1M 2w 5d 17h 58m 43s 200ms'],
    ];

    it('should create a Timespan object from a valid string input', () => {
      const baseDate = new Date(Date.UTC(2000, 0, 1));
      const timespan = Timespan.fromString(
        '1y 2M 3w 4d 5h 6m 7s 8ms',
        baseDate,
      );

      // Check the properties of the Timespan object
      expect(timespan.toYears()).toBe(1);
      expect(timespan.toMonths()).toBe(14);
      expect(timespan.toWeeks()).toBe(64);
      expect(timespan.toDays()).toBe(450);
      expect(timespan.toHours()).toBe(10805);
      expect(timespan.toMinutes()).toBe(648306);
      expect(timespan.toSeconds()).toBe(38898367);
      expect(timespan.toMilliseconds()).toBe(38898367008);

      // Check the string representation of the Timespan object
      expect(timespan.toString()).toBe('1y 2M 3w 4d 5h 6m 7s 8ms');
    });

    it('should handle singular and plural units', () => {
      const baseDate = new Date(Date.UTC(2000, 0, 1));
      const timespan = Timespan.fromString(
        '2years 1month 3weeks 4days',
        baseDate,
      );

      // Check the properties of the Timespan object
      expect(timespan.toYears()).toBe(2);
      expect(timespan.toMonths()).toBe(25);
      expect(timespan.toWeeks()).toBe(112);
      expect(timespan.toDays()).toBe(787);

      // Check the string representation of the Timespan object
      expect(timespan.toString()).toBe('2y 1M 3w 4d');
    });

    it('should handle different unit abbreviations', () => {
      const baseDate = new Date(Date.UTC(2000, 0, 1));
      const timespan = Timespan.fromString(
        '1yr 2mos 3wks 4dys 5hrs 6mins 7secs 8mss',
        baseDate,
      );

      // Check the properties of the Timespan object
      expect(timespan.toYears()).toBe(1);
      expect(timespan.toMonths()).toBe(14);
      expect(timespan.toWeeks()).toBe(64);
      expect(timespan.toDays()).toBe(450);
      expect(timespan.toHours()).toBe(10805);
      expect(timespan.toMinutes()).toBe(648306);
      expect(timespan.toSeconds()).toBe(38898367);
      expect(timespan.toMilliseconds()).toBe(38898367008);

      // Check the string representation of the Timespan object
      expect(timespan.toString()).toBe('1y 2M 3w 4d 5h 6m 7s 8ms');
    });

    it('should throw an error for an invalid unit', () => {
      expect(() => {
        Timespan.fromString('1y 2M 3w 4d 5x');
      }).toThrow('Invalid time unit: expected a recognized time unit.');
    });

    it('should throw an error for invalid unit', () => {
      expect(() => Timespan.fromString('5 unknownUnit')).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
    });

    it('should throw an error when the input has no unit', () => {
      expect(() => Timespan.fromString('5')).toThrow('Invalid unit');
      expect(() => Timespan.fromString('42')).toThrow('Invalid unit');
    });

    it('should parse a valid string again after a parse throws', () => {
      const startDate = new Date(Date.UTC(2020, 0, 1));
      const first = Timespan.fromString('1h', startDate);

      expect(first.toString()).toBe('1h');
      expect(() => Timespan.fromString('1h 2x', startDate)).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );

      const third = Timespan.fromString('1h', startDate);
      expect(third.toString()).toBe('1h');
      expect(third.toMilliseconds()).toBe(first.toMilliseconds());
    });

    it('should throw an error for input exceeding mac length', () => {
      expect(() => Timespan.fromString(''.padEnd(100, '1'))).toThrow(
        'Invalid input string: expected at most 75 characters.',
      );
    });

    it.each(allowedStrings)(
      'should return the correct string for %s',
      (inputString, expectedString) => {
        const outputString = Timespan.fromString(inputString).toString();
        expect(outputString).toBe(expectedString);
      },
    );

    it.each(blacklistedCharacters)(
      'should throw an error for input that contains invalid character %s',
      (character) => {
        expect(() => Timespan.fromString(character)).toThrow(
          'Invalid input string',
        );
      },
    );

    it('should throw an error for input that contains invalid character " Hello World"', () => {
      expect(() => Timespan.fromString(' Hello World')).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
    });

    it('should throw an error for input that contains invalid character "Hello\\tWorld"', () => {
      expect(() => Timespan.fromString('Hello\tWorld')).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
    });

    it('should throw an error for input that contains invalid character "Hello\\nWorld"', () => {
      expect(() => Timespan.fromString('Hello\nWorld')).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
    });

    it('should parse units with no separating space', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(Timespan.fromString('1h30m', startDate).toMinutes()).toBe(90);
    });

    it('should tolerate runs of spaces, tabs, and newlines between units', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(
        Timespan.fromString('  1h\t30m\n15s  ', startDate).toSeconds(),
      ).toBe(5415);
    });

    it('should distinguish months (M) from minutes (m)', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(Timespan.fromString('1M', startDate).end.toISOString()).toBe(
        '2023-07-15T12:00:00.000Z',
      );
      expect(Timespan.fromString('1m', startDate).toMinutes()).toBe(1);
    });

    it('should throw an error for an empty string', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('', startDate)).toThrow(
        'Invalid input string: expected letters, digits, and whitespace only.',
      );
    });

    it('should throw an error for a whitespace-only string', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('   ', startDate)).toThrow(
        'Invalid unit',
      );
    });

    it('should throw an error for an unknown unit abbreviation', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('1x', startDate)).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
      expect(() => Timespan.fromString('1fortnight', startDate)).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
    });

    it('should reject unit abbreviations that differ only by case', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('1H', startDate)).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
      expect(() => Timespan.fromString('1MS', startDate)).toThrow(
        'Invalid time unit: expected a recognized time unit.',
      );
    });

    it('should throw an error for a signed value', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('-1h', startDate)).toThrow(
        'Invalid input string: expected letters, digits, and whitespace only.',
      );
      expect(() => Timespan.fromString('+1h', startDate)).toThrow(
        'Invalid input string: expected letters, digits, and whitespace only.',
      );
    });

    it('should accept an input of exactly the maximum length', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const input = `1h${' '.repeat(73)}`;
      expect(input.length).toBe(75);
      expect(Timespan.fromString(input, startDate).toHours()).toBe(1);
    });

    it('should reject an input one character over the maximum length', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const input = `${'1h '.repeat(25)} `;
      expect(input.length).toBe(76);
      expect(() => Timespan.fromString(input, startDate)).toThrow(
        'Invalid input string: expected at most 75 characters.',
      );
    });

    it('should parse the largest 10-digit value', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(
        Timespan.fromString('9999999999ms', startDate).toMilliseconds(),
      ).toBe(9_999_999_999);
    });

    it('should throw an error for an 11-digit value', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('99999999999ms', startDate)).toThrow(
        'Invalid input string',
      );
    });

    it('should throw an error for a bare unit with no value', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('h', startDate)).toThrow(
        'Invalid input string',
      );
    });

    it('should throw an error when a unit is repeated', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('1h 2h', startDate)).toThrow(
        'Duplicate date unit: h.',
      );
      expect(() => Timespan.fromString('30m 30m', startDate)).toThrow(
        'Duplicate date unit: m.',
      );
      expect(() => Timespan.fromString('1h 30m 2hours', startDate)).toThrow(
        'Duplicate date unit: hours.',
      );
    });

    it('should reject a fractional value in a string', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('1.5h', startDate)).toThrow(
        'Invalid input string: expected letters, digits, and whitespace only.',
      );
      expect(() => Timespan.fromString('0.5d', startDate)).toThrow(
        'Invalid input string: expected letters, digits, and whitespace only.',
      );
    });

    it('should produce a zero span for an all-zero input', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const timespan = Timespan.fromString('0d 0h 0m', startDate);
      expect(timespan.toMilliseconds()).toBe(0);
      expect(timespan.end.getTime()).toBe(startDate.getTime());
    });

    it('should throw an error when a huge year value overflows the Date range', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(() => Timespan.fromString('9999999999y', startDate)).toThrow(
        'Invalid number of years: expected a result within the representable date range.',
      );
    });
  });

  describe('addToDate', () => {
    const startDate = new Date('2022-01-01T00:00:00Z');

    it('should add milliseconds to a date', () => {
      const amountToAdd = 500;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromMilliseconds(amountToAdd, startDate);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toMilliseconds()).toBe(expected);
    });

    it('should add seconds to a date', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromSeconds(amountToAdd, startDate);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toSeconds()).toBe(expected);
    });

    it('should add minutes to a date', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromMinutes(amountToAdd, startDate);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toMinutes()).toBe(expected);
    });

    it('should add hours to a date', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromHours(amountToAdd, startDate);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toHours()).toBe(expected);
    });

    it('should add days to a date', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromDays(amountToAdd, startDate);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toDays()).toBe(expected);
    });

    it('should add weeks to a date', () => {
      const amountToAdd = 2;
      const updatedDate = Timespan.fromWeeks(amountToAdd, startDate);
      const expected = 2;
      expect(updatedDate.toWeeks()).toBe(expected);
    });

    it('should add months to a date', () => {
      const amountToAdd = 3;
      const updatedDate = Timespan.fromMonths(amountToAdd, startDate);
      const expected = 3;
      expect(updatedDate.toMonths()).toBe(expected);
    });

    it('should add years to a date', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromYears(amountToAdd, startDate);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toYears()).toBe(expected);
    });

    it('should create timespan from specified units', () => {
      const amountToAdd = 500;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromUnits(amountToAdd, 'milliseconds');
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toMilliseconds()).toBe(expected);
    });

    it('should create timespan from milliseconds', () => {
      const amountToAdd = 500;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromMilliseconds(amountToAdd);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toMilliseconds()).toBe(expected);
    });

    it('should create timespan from seconds', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromSeconds(amountToAdd);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toSeconds()).toBe(expected);
    });

    it('should create timespan from minutes', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromMinutes(amountToAdd);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toMinutes()).toBe(expected);
    });

    it('should create timespan from hours', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromHours(amountToAdd);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toHours()).toBe(expected);
    });

    it('should create timespan from days', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromDays(amountToAdd);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toDays()).toBe(expected);
    });

    it('should create timespan from weeks', () => {
      const amountToAdd = 2;
      const updatedDate = Timespan.fromWeeks(amountToAdd);
      const expected = 2;
      expect(updatedDate.toWeeks()).toBe(expected);
    });

    it('should create timespan from months', () => {
      const amountToAdd = 3;
      const updatedDate = Timespan.fromMonths(amountToAdd);
      const expected = 3;
      expect(updatedDate.toMonths()).toBe(expected);
    });

    it('should create timespan from years', () => {
      const amountToAdd = 2;
      const startDateInMilliseconds = startDate.getTime();
      const endDateInMilliseconds = new Date(
        startDate.getTime() + amountToAdd,
      ).getTime();
      const updatedDate = Timespan.fromYears(amountToAdd);
      const expected = endDateInMilliseconds - startDateInMilliseconds;
      expect(updatedDate.toYears()).toBe(expected);
    });
  });

  describe('equals', () => {
    it('should return true for equal timespans checked by duration', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(start, end);
      expect(timespan1.equals(timespan2)).toBe(true);
    });

    it('should return false for different timespans checked by duration', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-22T10:52:00Z'),
      );
      expect(timespan1.equals(timespan2)).toBe(false);
    });

    it('should return true for equal timespans checked by range', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(start, end);
      expect(timespan1.equals(timespan2, 'range')).toBe(true);
    });

    it('should return false for different timespans checked by range', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-22T10:52:00Z'),
      );
      expect(timespan1.equals(timespan2, 'range')).toBe(false);
    });
  });

  describe('static equals', () => {
    it('should return true for equal timespans checked by duration', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(start, end);
      expect(Timespan.equals(timespan1, timespan2)).toBe(true);
    });

    it('should return false for different timespans checked by duration', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-22T10:52:00Z'),
      );
      expect(Timespan.equals(timespan1, timespan2)).toBe(false);
    });

    it('should return true for equal timespans checked by range', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(start, end);
      expect(Timespan.equals(timespan1, timespan2, 'range')).toBe(true);
    });

    it('should return false for different timespans checked by range', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-22T10:52:00Z'),
      );
      expect(Timespan.equals(timespan1, timespan2, 'range')).toBe(false);
    });

    it('should treat equal durations on different dates as equal by duration', () => {
      const timespan1 = Timespan.fromDays(
        2,
        new Date('2023-01-01T00:00:00.000Z'),
      );
      const timespan2 = Timespan.fromDays(
        2,
        new Date('2024-05-05T00:00:00.000Z'),
      );
      expect(timespan1.equals(timespan2)).toBe(true);
      expect(Timespan.equals(timespan1, timespan2)).toBe(true);
    });

    it('should treat equal durations on different dates as different by range', () => {
      const timespan1 = Timespan.fromDays(
        2,
        new Date('2023-01-01T00:00:00.000Z'),
      );
      const timespan2 = Timespan.fromDays(
        2,
        new Date('2024-05-05T00:00:00.000Z'),
      );
      expect(timespan1.equals(timespan2, 'range')).toBe(false);
      expect(timespan1.equals(timespan1, 'range')).toBe(true);
      expect(Timespan.equals(timespan1, timespan2, 'range')).toBe(false);
    });
  });

  describe('compareTo', () => {
    it('should return 0 if the timespan is equal to the provided timespan', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(start, end);
      expect(timespan1.compareTo(timespan2)).toBe(0);
    });
    it('should return -1 if the timespan is less than to the provided timespan', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-22T10:52:00Z'),
      );
      expect(timespan1.compareTo(timespan2)).toBe(-1);
    });
    it('should return 1 if the timespan is greater than to the provided timespan', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-22T10:52:00Z'),
      );
      expect(timespan2.compareTo(timespan1)).toBe(1);
    });
  });

  describe('static compareTo', () => {
    it('should return 0 if the timespan is equal to the provided timespan', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(start, end);
      expect(Timespan.compareTo(timespan1, timespan2)).toBe(0);
    });
    it('should return -1 if the timespan is less than to the provided timespan', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-22T10:52:00Z'),
      );
      expect(Timespan.compareTo(timespan1, timespan2)).toBe(-1);
    });
    it('should return 1 if the timespan is greater than to the provided timespan', () => {
      const timespan1 = new Timespan(start, end);
      const timespan2 = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-22T10:52:00Z'),
      );
      expect(Timespan.compareTo(timespan2, timespan1)).toBe(1);
    });

    it('should stay antisymmetric for random durations', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const rand = mulberry32(42);
      for (let i = 0; i < 50; i++) {
        const left = Timespan.fromMilliseconds(
          Math.floor(rand() * 1e9),
          startDate,
        );
        const right = Timespan.fromMilliseconds(
          Math.floor(rand() * 1e9),
          startDate,
        );
        expect(left.compareTo(right) + right.compareTo(left)).toBe(0);
        expect(left.equals(right)).toBe(left.compareTo(right) === 0);
      }
    });
  });

  describe('calendar arithmetic', () => {
    it('should not report a full year for a 1-day span crossing New Year', () => {
      const timespan = new Timespan(
        new Date('2022-12-31T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z'),
      );
      expect(timespan.toDays()).toBe(1);
      expect(timespan.toYears()).toBe(0);
      expect(timespan.toString()).toBe('1d');
      for (const value of Object.values(timespan.toTimeframe())) {
        expect(value).toBeGreaterThanOrEqual(0);
      }
    });

    it('should count a year only once the anniversary is reached', () => {
      const startDate = new Date('2022-06-15T00:00:00.000Z');
      expect(
        new Timespan(startDate, new Date('2023-06-14T00:00:00.000Z')).toYears(),
      ).toBe(0);
      expect(
        new Timespan(startDate, new Date('2023-06-15T00:00:00.000Z')).toYears(),
      ).toBe(1);
    });

    it('should count a month only once the full month has elapsed', () => {
      const startDate = new Date('2023-01-15T12:00:00.000Z');
      expect(
        new Timespan(
          startDate,
          new Date('2023-02-15T11:00:00.000Z'),
        ).toMonths(),
      ).toBe(0);
      expect(
        new Timespan(
          startDate,
          new Date('2023-02-15T12:00:00.000Z'),
        ).toMonths(),
      ).toBe(1);
    });

    it('should clamp month addition at the end of a non-leap February', () => {
      expect(
        Timespan.fromMonths(
          1,
          new Date('2023-01-31T00:00:00.000Z'),
        ).end.toISOString(),
      ).toBe('2023-02-28T00:00:00.000Z');
      expect(
        Timespan.fromString(
          '1M',
          new Date('2023-01-31T00:00:00.000Z'),
        ).end.toISOString(),
      ).toBe('2023-02-28T00:00:00.000Z');
    });

    it('should clamp month addition at the end of a leap February', () => {
      expect(
        Timespan.fromMonths(
          1,
          new Date('2024-01-31T00:00:00.000Z'),
        ).end.toISOString(),
      ).toBe('2024-02-29T00:00:00.000Z');
    });

    it('should clamp month addition into a 30-day month', () => {
      expect(
        Timespan.fromMonths(
          1,
          new Date('2023-03-31T00:00:00.000Z'),
        ).end.toISOString(),
      ).toBe('2023-04-30T00:00:00.000Z');
    });

    it('should land on the same day when added months do not cross a short month', () => {
      expect(
        Timespan.fromMonths(
          2,
          new Date('2023-01-31T00:00:00.000Z'),
        ).end.toISOString(),
      ).toBe('2023-03-31T00:00:00.000Z');
    });

    it('should clamp a year added to February 29', () => {
      const startDate = new Date('2020-02-29T00:00:00.000Z');
      expect(Timespan.fromYears(1, startDate).end.toISOString()).toBe(
        '2021-02-28T00:00:00.000Z',
      );
      expect(Timespan.fromString('1y', startDate).end.toISOString()).toBe(
        '2021-02-28T00:00:00.000Z',
      );
    });

    it('should count two days from February 28 in 2000 and one day in 2100', () => {
      const leap = new Timespan(
        new Date('2000-02-28T00:00:00.000Z'),
        new Date('2000-03-01T00:00:00.000Z'),
      );
      expect(leap.toDays()).toBe(2);
      const common = new Timespan(
        new Date('2100-02-28T00:00:00.000Z'),
        new Date('2100-03-01T00:00:00.000Z'),
      );
      expect(common.toDays()).toBe(1);
    });

    it('should decompose 366 days across a non-leap year boundary as 1y 1d', () => {
      const startDate = new Date('2023-01-01T00:00:00.000Z');
      const timespan = new Timespan(
        startDate,
        new Date(startDate.getTime() + 366 * 86_400_000),
      );
      expect(timespan.toString()).toBe('1y 1d');
    });

    it('should decompose exactly 8 days as 1w 1d', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(Timespan.fromDays(8, startDate).toString()).toBe('1w 1d');
    });

    it('should decompose exactly 7 days as 1w', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      expect(Timespan.fromDays(7, startDate).toString()).toBe('1w');
    });
  });

  describe('fuzz', () => {
    const millisecondsPerUnit = {
      weeks: 604_800_000,
      days: 86_400_000,
      hours: 3_600_000,
      minutes: 60_000,
      seconds: 1000,
    };

    it('should preserve total milliseconds and floor every fixed unit', () => {
      const rand = mulberry32(20261103);
      for (let i = 0; i < 250; i++) {
        const startDate = new Date(
          Date.UTC(2021 + Math.floor(rand() * 3), 5, 15) +
            Math.floor(rand() * 86_400_000),
        );
        const offset = Math.floor(rand() * 27 * 86_400_000);
        const timespan = new Timespan(
          startDate,
          new Date(startDate.getTime() + offset),
        );
        expect(timespan.toMilliseconds()).toBe(offset);
        expect(timespan.toSeconds()).toBe(
          Math.floor(offset / millisecondsPerUnit.seconds),
        );
        expect(timespan.toMinutes()).toBe(
          Math.floor(offset / millisecondsPerUnit.minutes),
        );
        expect(timespan.toHours()).toBe(
          Math.floor(offset / millisecondsPerUnit.hours),
        );
        expect(timespan.toDays()).toBe(
          Math.floor(offset / millisecondsPerUnit.days),
        );
        expect(timespan.toWeeks()).toBe(
          Math.floor(offset / millisecondsPerUnit.weeks),
        );
      }
    });

    it('should decompose into a timeframe that recomposes to the same duration', () => {
      const rand = mulberry32(20261103);
      for (let i = 0; i < 250; i++) {
        const startDate = new Date(
          Date.UTC(2021 + Math.floor(rand() * 3), 5, 15) +
            Math.floor(rand() * 86_400_000),
        );
        const offset = Math.floor(rand() * 27 * 86_400_000);
        const timespan = new Timespan(
          startDate,
          new Date(startDate.getTime() + offset),
        );
        const timeframe = timespan.toTimeframe();
        expect(timeframe.years).toBe(0);
        expect(timeframe.months).toBe(0);
        const recomposed =
          timeframe.weeks * millisecondsPerUnit.weeks +
          timeframe.days * millisecondsPerUnit.days +
          timeframe.hours * millisecondsPerUnit.hours +
          timeframe.minutes * millisecondsPerUnit.minutes +
          timeframe.seconds * millisecondsPerUnit.seconds +
          timeframe.milliseconds;
        expect(recomposed).toBe(offset);
      }
    });

    it('should round-trip through toString and fromString', () => {
      const rand = mulberry32(20261103);
      for (let i = 0; i < 250; i++) {
        const startDate = new Date(
          Date.UTC(2021 + Math.floor(rand() * 3), 5, 15) +
            Math.floor(rand() * 86_400_000),
        );
        const offset = 1 + Math.floor(rand() * 27 * 86_400_000);
        const timespan = new Timespan(
          startDate,
          new Date(startDate.getTime() + offset),
        );
        const parsed = Timespan.fromString(timespan.toString(), startDate);
        expect(parsed.toMilliseconds()).toBe(offset);
      }
    });

    it('should parse generated strings deterministically', () => {
      const units = ['y', 'M', 'w', 'd', 'h', 'm', 's', 'ms'];
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const rand = mulberry32(777);
      for (let i = 0; i < 200; i++) {
        const parts: string[] = [];
        const used = new Set<number>();
        const count = 1 + Math.floor(rand() * 4);
        for (let j = 0; j < count; j++) {
          const index = Math.floor(rand() * units.length);
          if (used.has(index)) {
            continue;
          }
          used.add(index);
          parts.push(`${1 + Math.floor(rand() * 50)}${units[index]}`);
        }
        const input = parts.join(' ');
        const first = Timespan.fromString(input, startDate);
        const second = Timespan.fromString(input, startDate);
        expect(first.end.getTime()).toBe(second.end.getTime());
        expect(first.end.getTime()).toBeGreaterThan(startDate.getTime());
        expect(first.toMilliseconds()).toBe(
          first.end.getTime() - startDate.getTime(),
        );
      }
    });

    it('should survive interleaved failures without corrupting later parses', () => {
      const startDate = new Date('2023-06-15T12:00:00.000Z');
      const rand = mulberry32(31337);
      for (let i = 0; i < 100; i++) {
        const good = `${1 + Math.floor(rand() * 90)}d`;
        expect(Timespan.fromString(good, startDate).toDays()).toBeGreaterThan(
          0,
        );
        expect(() => Timespan.fromString('1h 2bogus', startDate)).toThrow(
          'Invalid time unit: expected a recognized time unit.',
        );
        expect(Timespan.fromString(good, startDate).toMilliseconds()).toBe(
          Timespan.fromString(good, startDate).toMilliseconds(),
        );
      }
    });
  });

  describe('format', () => {
    const origin = new Date('2023-06-01T00:00:00.000Z');
    const timespan = new Timespan(
      origin,
      new Date(origin.getTime() + 1_483_506_123),
    );

    it('returns the formatTimespan result from the instance and static methods', () => {
      const formatString = '%D days';
      expect(timespan.format(formatString)).toBe(
        formatTimespan(formatString, timespan),
      );
      expect(Timespan.format(formatString, timespan)).toBe(
        timespan.format(formatString),
      );
    });

    it('delegates the static method to the instance method', () => {
      const span = new Timespan(origin, new Date(origin.getTime()));
      const original = span.format;
      span.format = (formatString: string) => `delegated:${formatString}`;
      try {
        expect(Timespan.format('%D days', span)).toBe('delegated:%D days');
      } finally {
        span.format = original;
      }
    });

    it('does not change the timespan when formatting', () => {
      const calendar = new Timespan(
        new Date('2022-01-01T06:24:00Z'),
        new Date('2023-02-21T10:52:00Z'),
      );
      const start = calendar.start.toISOString();
      const end = calendar.end.toISOString();
      const text = calendar.toString();
      const frame = calendar.toTimeframe();

      calendar.format('%Y');
      Timespan.format('%D', calendar);

      expect(calendar.start.toISOString()).toBe(start);
      expect(calendar.end.toISOString()).toBe(end);
      expect(calendar.toString()).toBe(text);
      expect(calendar.toTimeframe()).toEqual(frame);
      expect(text).toBe('1y 1M 2w 6d 4h 28m');
    });
  });
});
