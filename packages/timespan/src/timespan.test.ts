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

  describe('toJSON', () => {
    const start = new Date('2022-01-01T06:24:00.000Z');
    const end = new Date('2023-02-21T10:52:00.123Z');
    const timespan = new Timespan(start, end);
    const expected = {
      $type: 'Timespan',
      start: '2022-01-01T06:24:00.000Z',
      end: '2023-02-21T10:52:00.123Z',
    };

    it('returns the type and both instants as ISO strings', () => {
      expect(timespan.toJSON()).toEqual(expected);
    });

    it('returns the same value from the static method', () => {
      expect(Timespan.toJSON(timespan)).toEqual(timespan.toJSON());
      expect(Timespan.toJSON(timespan)).toEqual(expected);
    });

    it('delegates the static method to the instance method', () => {
      const span = new Timespan(start, end);
      const original = span.toJSON;
      span.toJSON = () => ({
        $type: 'Timespan',
        start: 'delegated-start',
        end: 'delegated-end',
      });
      try {
        expect(Timespan.toJSON(span)).toEqual({
          $type: 'Timespan',
          start: 'delegated-start',
          end: 'delegated-end',
        });
      } finally {
        span.toJSON = original;
      }
    });

    it('is the value JSON.stringify uses for a timespan', () => {
      expect(JSON.parse(JSON.stringify(timespan))).toEqual(expected);
      expect(JSON.parse(JSON.stringify({ span: timespan }))).toEqual({
        span: expected,
      });
    });

    it('returns a new object on each call', () => {
      const first = timespan.toJSON();
      const second = timespan.toJSON();
      first.start = 'changed';
      first.end = 'changed';
      expect(first).not.toBe(second);
      expect(second).toEqual(expected);
      expect(timespan.toJSON()).toEqual(expected);
    });

    it('does not change the timespan', () => {
      const startInstant = timespan.start.toISOString();
      const endInstant = timespan.end.toISOString();
      const text = timespan.toString();
      const frame = timespan.toTimeframe();

      timespan.toJSON();
      Timespan.toJSON(timespan);

      expect(timespan.start.toISOString()).toBe(startInstant);
      expect(timespan.end.toISOString()).toBe(endInstant);
      expect(timespan.toString()).toBe(text);
      expect(timespan.toTimeframe()).toEqual(frame);
      expect(text).toBe('1y 1M 2w 6d 4h 28m 123ms');
    });

    it('keeps a zero-length span and a pre-epoch instant', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const beforeEpoch = new Timespan(new Date(-1), epoch);

      expect(zero.toJSON()).toEqual({
        $type: 'Timespan',
        start: '1970-01-01T00:00:00.000Z',
        end: '1970-01-01T00:00:00.000Z',
      });
      expect(Timespan.toJSON(beforeEpoch)).toEqual({
        $type: 'Timespan',
        start: '1969-12-31T23:59:59.999Z',
        end: '1970-01-01T00:00:00.000Z',
      });
    });
  });

  describe('fromJSON', () => {
    const start = new Date('2022-01-01T06:24:00.000Z');
    const end = new Date('2023-02-21T10:52:00.123Z');
    const timespan = new Timespan(start, end);
    const json = {
      $type: 'Timespan' as const,
      start: '2022-01-01T06:24:00.000Z',
      end: '2023-02-21T10:52:00.123Z',
    };

    /**
     * Asserts that `restored` is the same range as `original`.
     * @param restored - Timespan produced by `fromJSON`.
     * @param original - Timespan that produced the JSON.
     * @returns Nothing.
     */
    function expectSameRange(restored: Timespan, original: Timespan): void {
      expect(restored).not.toBe(original);
      expect(restored.start.toISOString()).toBe(original.start.toISOString());
      expect(restored.end.toISOString()).toBe(original.end.toISOString());
      expect(restored.toString()).toBe(original.toString());
      expect(restored.toTimeframe()).toEqual(original.toTimeframe());
      expect(restored.equals(original, 'range')).toBe(true);
    }

    it('builds a timespan from the start and end strings', () => {
      const restored = Timespan.fromJSON(json);
      expectSameRange(restored, timespan);
      expect(restored.toJSON()).toEqual(json);
    });

    it('ignores extra fields and does not change the supplied object', () => {
      const supplied = { ...json, label: 'kept', milliseconds: 1 };
      const snapshot = { ...supplied };
      const restored = Timespan.fromJSON(supplied);

      expectSameRange(restored, timespan);
      expect(supplied).toEqual(snapshot);
    });

    it('round-trips toJSON through fromJSON', () => {
      expectSameRange(Timespan.fromJSON(timespan.toJSON()), timespan);
      expectSameRange(Timespan.fromJSON(Timespan.toJSON(timespan)), timespan);
      expect(Timespan.fromJSON(timespan.toJSON()).toJSON()).toEqual(
        timespan.toJSON(),
      );
    });

    it('round-trips JSON.stringify through JSON.parse and fromJSON', () => {
      const parsed: unknown = JSON.parse(JSON.stringify(timespan));
      const restored = Timespan.fromJSON(parsed);

      expectSameRange(restored, timespan);
      expect(JSON.parse(JSON.stringify(restored))).toEqual(timespan.toJSON());
    });

    it('round-trips a zero-length span and a pre-epoch instant', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const beforeEpoch = new Timespan(new Date(-1), epoch);

      expectSameRange(Timespan.fromJSON(zero.toJSON()), zero);
      expectSameRange(Timespan.fromJSON(beforeEpoch.toJSON()), beforeEpoch);
    });

    describe('rejected values', () => {
      const invalidJson = 'Invalid Timespan JSON.';
      const invalidDate = 'Invalid date: expected a valid Date.';
      const invalidDateRange =
        'Invalid date range: expected the start date to be less than or equal to the end date.';

      test.each`
        label              | value
        ${'null'}          | ${null}
        ${'undefined'}     | ${undefined}
        ${'json text'}     | ${JSON.stringify(json)}
        ${'array'}         | ${[json]}
        ${'missing type'}  | ${{ start: json.start, end: json.end }}
        ${'wrong type'}    | ${{ ...json, $type: 'timespan' }}
        ${'missing start'} | ${{ $type: 'Timespan', end: json.end }}
        ${'numeric end'}   | ${{ ...json, end: 0 }}
      `(
        'throws "Invalid Timespan JSON." for $label',
        ({ value }: { value: unknown }) => {
          expect(() => Timespan.fromJSON(value)).toThrow(
            new TypeError(invalidJson),
          );
        },
      );

      test.each`
        label            | value
        ${'bad start'}   | ${{ $type: 'Timespan', start: 'not-a-date', end: json.end }}
        ${'bad end'}     | ${{ $type: 'Timespan', start: json.start, end: 'not-a-date' }}
        ${'empty start'} | ${{ $type: 'Timespan', start: '', end: json.end }}
      `(
        'throws "Invalid date: expected a valid Date." for $label',
        ({ value }: { value: unknown }) => {
          expect(() => Timespan.fromJSON(value)).toThrow(
            new Error(invalidDate),
          );
        },
      );

      it('throws when the start is after the end', () => {
        expect(() =>
          Timespan.fromJSON({
            $type: 'Timespan',
            start: json.end,
            end: json.start,
          }),
        ).toThrow(new Error(invalidDateRange));
      });
    });
  });

  describe('parse', () => {
    const start = new Date('2022-01-01T06:24:00.000Z');
    const end = new Date('2023-02-21T10:52:00.123Z');
    const timespan = new Timespan(start, end);
    const jsonText = JSON.stringify(timespan);

    /**
     * Asserts that `restored` is the same range as `original`.
     * @param restored - Timespan produced by `parse`.
     * @param original - Timespan that produced the JSON text.
     * @returns Nothing.
     */
    function expectSameRange(restored: Timespan, original: Timespan): void {
      expect(restored).toBeInstanceOf(Timespan);
      expect(restored).not.toBe(original);
      expect(restored.start.toISOString()).toBe(original.start.toISOString());
      expect(restored.end.toISOString()).toBe(original.end.toISOString());
      expect(restored.toString()).toBe(original.toString());
      expect(restored.toTimeframe()).toEqual(original.toTimeframe());
      expect(restored.equals(original, 'range')).toBe(true);
    }

    it('parses the JSON text of a timespan', () => {
      const restored = Timespan.parse(jsonText);
      expectSameRange(restored, timespan);
      expect(restored.toJSON()).toEqual(timespan.toJSON());
    });

    it('parses text with surrounding whitespace', () => {
      expectSameRange(Timespan.parse(`\n  ${jsonText}\n`), timespan);
    });

    it('round-trips a zero-length span and a pre-epoch instant', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const beforeEpoch = new Timespan(new Date(-1), epoch);

      expectSameRange(Timespan.parse(JSON.stringify(zero)), zero);
      expectSameRange(Timespan.parse(JSON.stringify(beforeEpoch)), beforeEpoch);
    });

    it('throws when the text is not JSON', () => {
      expect(() => Timespan.parse('')).toThrow(SyntaxError);
      expect(() => Timespan.parse('{')).toThrow(SyntaxError);
      expect(() => Timespan.parse('not json')).toThrow(SyntaxError);
    });

    it('throws when the parsed value is not Timespan JSON', () => {
      expect(() => Timespan.parse('null')).toThrow(
        new TypeError('Invalid Timespan JSON.'),
      );
      expect(() => Timespan.parse(JSON.stringify({ span: timespan }))).toThrow(
        new TypeError('Invalid Timespan JSON.'),
      );
    });

    it('throws when a date string cannot be parsed', () => {
      expect(() =>
        Timespan.parse(
          JSON.stringify({
            $type: 'Timespan',
            start: 'not-a-date',
            end: end.toISOString(),
          }),
        ),
      ).toThrow(new Error('Invalid date: expected a valid Date.'));
    });

    it('throws when the start is after the end', () => {
      expect(() =>
        Timespan.parse(
          JSON.stringify({
            $type: 'Timespan',
            start: end.toISOString(),
            end: start.toISOString(),
          }),
        ),
      ).toThrow(
        new Error(
          'Invalid date range: expected the start date to be less than or equal to the end date.',
        ),
      );
    });
  });

  describe('reviver', () => {
    const start = new Date('2022-01-01T06:24:00.000Z');
    const end = new Date('2023-02-21T10:52:00.123Z');
    const timespan = new Timespan(start, end);

    /**
     * Asserts that `restored` is the same range as `original`.
     * @param restored - Value produced by the reviver.
     * @param original - Timespan that produced the JSON.
     * @returns Nothing.
     */
    function expectRevivedTimespan(
      restored: unknown,
      original: Timespan,
    ): void {
      expect(restored).toBeInstanceOf(Timespan);
      const span = restored as Timespan;
      expect(span.start.toISOString()).toBe(original.start.toISOString());
      expect(span.end.toISOString()).toBe(original.end.toISOString());
      expect(span.toString()).toBe(original.toString());
      expect(span.equals(original, 'range')).toBe(true);
    }

    it('revives a timespan object and ignores the key', () => {
      expectRevivedTimespan(Timespan.reviver('', timespan.toJSON()), timespan);
      expectRevivedTimespan(
        Timespan.reviver('span', timespan.toJSON()),
        timespan,
      );
    });

    it('leaves values that are not Timespan objects unchanged', () => {
      expect(Timespan.reviver('type', 'Timespan')).toBe('Timespan');
      expect(Timespan.reviver('count', 2)).toBe(2);
      expect(Timespan.reviver('flag', true)).toBe(true);
      expect(Timespan.reviver('empty', null)).toBeNull();
      expect(Timespan.reviver('items', [])).toEqual([]);
      expect(
        Timespan.reviver('other', {
          $type: 'Other',
          start: start.toISOString(),
          end: end.toISOString(),
        }),
      ).toEqual({
        $type: 'Other',
        start: start.toISOString(),
        end: end.toISOString(),
      });
      expect(
        Timespan.reviver('legacy', {
          type: 'Timespan',
          start: start.toISOString(),
          end: end.toISOString(),
        }),
      ).toEqual({
        type: 'Timespan',
        start: start.toISOString(),
        end: end.toISOString(),
      });
    });

    it('revives timespans inside objects and arrays during JSON.parse', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const payload = {
        label: 'kept',
        count: 2,
        flag: true,
        empty: null,
        span: timespan,
        items: [timespan, zero],
      };
      const revived = JSON.parse(JSON.stringify(payload), Timespan.reviver) as {
        label: string;
        count: number;
        flag: boolean;
        empty: null;
        span: Timespan;
        items: Timespan[];
      };

      expect(revived.label).toBe('kept');
      expect(revived.count).toBe(2);
      expect(revived.flag).toBe(true);
      expect(revived.empty).toBeNull();
      expectRevivedTimespan(revived.span, timespan);
      expectRevivedTimespan(revived.items[0], timespan);
      expectRevivedTimespan(revived.items[1], zero);
    });

    it('revives a top-level timespan during JSON.parse', () => {
      const revived: unknown = JSON.parse(
        JSON.stringify(timespan),
        Timespan.reviver,
      );
      expectRevivedTimespan(revived, timespan);
    });

    it('throws when a Timespan object has an invalid date', () => {
      expect(() =>
        JSON.parse(
          JSON.stringify({
            span: {
              $type: 'Timespan',
              start: 'not-a-date',
              end: end.toISOString(),
            },
          }),
          Timespan.reviver,
        ),
      ).toThrow(new Error('Invalid date: expected a valid Date.'));
    });
  });

  describe('stringify', () => {
    const start = new Date('2022-01-01T06:24:00.000Z');
    const end = new Date('2023-02-21T10:52:00.123Z');
    const timespan = new Timespan(start, end);

    it('returns the JSON text of toJSON', () => {
      expect(Timespan.stringify(timespan)).toBe(
        JSON.stringify(timespan.toJSON()),
      );
      expect(JSON.parse(Timespan.stringify(timespan))).toEqual(
        timespan.toJSON(),
      );
    });

    it('round-trips through parse', () => {
      const restored = Timespan.parse(Timespan.stringify(timespan));
      expect(restored).not.toBe(timespan);
      expect(restored.equals(timespan, 'range')).toBe(true);
      expect(restored.toJSON()).toEqual(timespan.toJSON());
    });

    it('stringifies a zero-length span and a pre-epoch instant', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const beforeEpoch = new Timespan(new Date(-1), epoch);

      expect(JSON.parse(Timespan.stringify(zero))).toEqual(zero.toJSON());
      expect(JSON.parse(Timespan.stringify(beforeEpoch))).toEqual(
        beforeEpoch.toJSON(),
      );
    });

    it('does not change the timespan', () => {
      const startInstant = timespan.start.toISOString();
      const endInstant = timespan.end.toISOString();
      const text = timespan.toString();

      Timespan.stringify(timespan);

      expect(timespan.start.toISOString()).toBe(startInstant);
      expect(timespan.end.toISOString()).toBe(endInstant);
      expect(timespan.toString()).toBe(text);
    });
  });

  describe('isTimespanJSON', () => {
    const json = {
      $type: 'Timespan' as const,
      start: '2022-01-01T06:24:00.000Z',
      end: '2023-02-21T10:52:00.123Z',
    };

    it('accepts the object produced by toJSON', () => {
      const timespan = new Timespan(new Date(json.start), new Date(json.end));
      expect(Timespan.isTimespanJSON(timespan.toJSON())).toBe(true);
      expect(
        Timespan.isTimespanJSON(JSON.parse(Timespan.stringify(timespan))),
      ).toBe(true);
    });

    it('accepts any strings, extra fields, and a reversed range', () => {
      expect(
        Timespan.isTimespanJSON({ ...json, label: 'kept', milliseconds: 1 }),
      ).toBe(true);
      expect(
        Timespan.isTimespanJSON({ $type: 'Timespan', start: '', end: '' }),
      ).toBe(true);
      expect(
        Timespan.isTimespanJSON({
          $type: 'Timespan',
          start: 'not-a-date',
          end: 'also-not-a-date',
        }),
      ).toBe(true);
      expect(
        Timespan.isTimespanJSON({
          $type: 'Timespan',
          start: json.end,
          end: json.start,
        }),
      ).toBe(true);
    });

    it('rejects values that are not Timespan JSON', () => {
      const timespan = new Timespan(new Date(json.start), new Date(json.end));
      expect(Timespan.isTimespanJSON(timespan)).toBe(false);
      expect(Timespan.isTimespanJSON(null)).toBe(false);
      expect(Timespan.isTimespanJSON(undefined)).toBe(false);
      expect(Timespan.isTimespanJSON(JSON.stringify(json))).toBe(false);
      expect(Timespan.isTimespanJSON([json])).toBe(false);
      expect(
        Timespan.isTimespanJSON({ start: json.start, end: json.end }),
      ).toBe(false);
      expect(Timespan.isTimespanJSON({ ...json, $type: 'timespan' })).toBe(
        false,
      );
      expect(Timespan.isTimespanJSON({ ...json, start: 0 })).toBe(false);
      expect(
        Timespan.isTimespanJSON({
          type: 'Timespan',
          start: json.start,
          end: json.end,
        }),
      ).toBe(false);
    });

    it('does not throw or change the supplied object', () => {
      const supplied = { ...json };
      expect(Timespan.isTimespanJSON(supplied)).toBe(true);
      expect(supplied).toEqual(json);
      expect(Timespan.isTimespanJSON(null)).toBe(false);
    });
  });

  describe('clone', () => {
    const start = new Date('2022-01-01T06:24:00.000Z');
    const end = new Date('2023-02-21T10:52:00.123Z');
    const timespan = new Timespan(start, end);

    /**
     * Asserts that `cloned` is a distinct timespan with the same range.
     * @param cloned - Timespan produced by `clone`.
     * @param original - Timespan that was cloned.
     * @returns Nothing.
     */
    function expectSameRange(cloned: Timespan, original: Timespan): void {
      expect(cloned).toBeInstanceOf(Timespan);
      expect(cloned).not.toBe(original);
      expect(cloned.start.toISOString()).toBe(original.start.toISOString());
      expect(cloned.end.toISOString()).toBe(original.end.toISOString());
      expect(cloned.toString()).toBe(original.toString());
      expect(cloned.toTimeframe()).toEqual(original.toTimeframe());
      expect(cloned.toJSON()).toEqual(original.toJSON());
      expect(cloned.equals(original, 'range')).toBe(true);
      expect(cloned.equals(original)).toBe(true);
    }

    it('returns a new timespan with the same range', () => {
      expectSameRange(timespan.clone(), timespan);
    });

    it('returns the same range from the static method', () => {
      const cloned = Timespan.clone(timespan);
      expectSameRange(cloned, timespan);
      expect(cloned.toJSON()).toEqual(timespan.clone().toJSON());
    });

    it('delegates the static method to the instance method', () => {
      const span = new Timespan(start, end);
      const replacement = new Timespan(new Date(0), new Date(1));
      const original = span.clone;
      span.clone = () => replacement;
      try {
        expect(Timespan.clone(span)).toBe(replacement);
      } finally {
        span.clone = original;
      }
    });

    it('does not change the original timespan', () => {
      const startInstant = timespan.start.toISOString();
      const endInstant = timespan.end.toISOString();
      const text = timespan.toString();
      const frame = timespan.toTimeframe();

      timespan.clone();
      Timespan.clone(timespan);

      expect(timespan.start.toISOString()).toBe(startInstant);
      expect(timespan.end.toISOString()).toBe(endInstant);
      expect(timespan.toString()).toBe(text);
      expect(timespan.toTimeframe()).toEqual(frame);
    });

    it('does not let a caller change the clone through its dates', () => {
      const cloned = timespan.clone();

      cloned.start.setUTCFullYear(1999);
      cloned.end.setUTCFullYear(1999);

      expect(cloned.start.toISOString()).toBe(start.toISOString());
      expect(cloned.end.toISOString()).toBe(end.toISOString());
      expect(timespan.start.toISOString()).toBe(start.toISOString());
      expect(timespan.end.toISOString()).toBe(end.toISOString());
    });

    it('returns a distinct timespan on each call', () => {
      const first = timespan.clone();
      const second = timespan.clone();
      expect(first).not.toBe(second);
      expect(first.clone()).not.toBe(first);
      expectSameRange(first, second);
    });

    it('clones a zero-length span and a pre-epoch instant', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const beforeEpoch = new Timespan(new Date(-1), epoch);

      expectSameRange(zero.clone(), zero);
      expectSameRange(Timespan.clone(beforeEpoch), beforeEpoch);
    });
  });
});

describe('Timespan JSON Interoperability', () => {
  const start = new Date('2022-01-01T06:24:00.000Z');
  const end = new Date('2023-02-21T10:52:00.123Z');
  const timespan = new Timespan(start, end);
  const json = {
    $type: 'Timespan',
    start: '2022-01-01T06:24:00.000Z',
    end: '2023-02-21T10:52:00.123Z',
  };

  /**
   * Asserts that native JSON parsing rebuilt `original`.
   * @param restored - Value returned by `JSON.parse`.
   * @param original - Timespan that was serialized.
   * @returns Nothing.
   */
  function expectReconstructed(restored: unknown, original: Timespan): void {
    expect(restored).toBeInstanceOf(Timespan);
    const span = restored as Timespan;
    expect(span).not.toBe(original);
    expect(span.start.getTime()).toBe(original.start.getTime());
    expect(span.end.getTime()).toBe(original.end.getTime());
    expect(span.start.toISOString()).toBe(original.start.toISOString());
    expect(span.end.toISOString()).toBe(original.end.toISOString());
    expect(span.equals(original, 'range')).toBe(true);
    expect(span.toJSON()).toEqual(original.toJSON());
  }

  describe('JSON.stringify()', () => {
    it('serializes a timespan as its JSON object', () => {
      expect(JSON.stringify(timespan)).toBe(JSON.stringify(json));
      expect(JSON.parse(JSON.stringify(timespan))).toEqual(json);
    });

    it('serializes a timespan property as a plain object', () => {
      expect(JSON.parse(JSON.stringify({ span: timespan }))).toEqual({
        span: json,
      });
    });

    it('serializes a zero-length span and a pre-epoch instant', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const beforeEpoch = new Timespan(new Date(-1), epoch);

      expect(JSON.parse(JSON.stringify(zero))).toEqual({
        $type: 'Timespan',
        start: '1970-01-01T00:00:00.000Z',
        end: '1970-01-01T00:00:00.000Z',
      });
      expect(JSON.parse(JSON.stringify(beforeEpoch))).toEqual({
        $type: 'Timespan',
        start: '1969-12-31T23:59:59.999Z',
        end: '1970-01-01T00:00:00.000Z',
      });
    });
  });

  describe('JSON.parse()', () => {
    const text = JSON.stringify(timespan);

    it('returns a plain object when no reviver is supplied', () => {
      const parsed: unknown = JSON.parse(text);

      expect(parsed).not.toBeInstanceOf(Timespan);
      expect(parsed).toEqual(json);
    });

    it('returns a Timespan when the reviver is supplied', () => {
      expectReconstructed(JSON.parse(text, Timespan.reviver), timespan);
    });

    it('leaves values that are not Timespan objects unchanged', () => {
      const parsed: unknown = JSON.parse(
        JSON.stringify({
          label: 'kept',
          count: 2,
          flag: true,
          empty: null,
          other: { type: 'Timespan', start: json.start, end: json.end },
        }),
        Timespan.reviver,
      );

      expect(parsed).toEqual({
        label: 'kept',
        count: 2,
        flag: true,
        empty: null,
        other: { type: 'Timespan', start: json.start, end: json.end },
      });
    });
  });

  describe('Round-trip Serialization', () => {
    it('reconstructs the instance and the original dates', () => {
      const restored: unknown = JSON.parse(
        JSON.stringify(timespan),
        Timespan.reviver,
      );

      expectReconstructed(restored, timespan);
      expect(timespan.start.getTime()).toBe(start.getTime());
      expect(timespan.end.getTime()).toBe(end.getTime());
    });

    it('does not change the original timespan', () => {
      const startInstant = timespan.start.getTime();
      const endInstant = timespan.end.getTime();
      const text = timespan.toString();

      JSON.parse(JSON.stringify(timespan), Timespan.reviver);

      expect(timespan.start.getTime()).toBe(startInstant);
      expect(timespan.end.getTime()).toBe(endInstant);
      expect(timespan.toString()).toBe(text);
    });

    it('round-trips a zero-length span and a pre-epoch instant', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const beforeEpoch = new Timespan(new Date(-1), epoch);

      expectReconstructed(
        JSON.parse(JSON.stringify(zero), Timespan.reviver),
        zero,
      );
      expectReconstructed(
        JSON.parse(JSON.stringify(beforeEpoch), Timespan.reviver),
        beforeEpoch,
      );
    });
  });

  describe('Nested Serialization', () => {
    it('revives timespans inside an object and an array', () => {
      const epoch = new Date(0);
      const zero = new Timespan(epoch, new Date(epoch.getTime()));
      const revived = JSON.parse(
        JSON.stringify({
          label: 'kept',
          span: timespan,
          items: [timespan, zero, null, 'plain'],
        }),
        Timespan.reviver,
      ) as {
        label: string;
        span: Timespan;
        items: [Timespan, Timespan, null, string];
      };

      expect(revived.label).toBe('kept');
      expectReconstructed(revived.span, timespan);
      expectReconstructed(revived.items[0], timespan);
      expectReconstructed(revived.items[1], zero);
      expect(revived.items[2]).toBeNull();
      expect(revived.items[3]).toBe('plain');
    });

    it('revives a timespan nested under another object', () => {
      const revived = JSON.parse(
        JSON.stringify({ group: { span: timespan } }),
        Timespan.reviver,
      ) as { group: { span: Timespan } };

      expect(revived.group).not.toBeInstanceOf(Timespan);
      expectReconstructed(revived.group.span, timespan);
    });
  });

  describe('Invalid JSON Data', () => {
    it('throws SyntaxError before the reviver sees text that is not JSON', () => {
      expect(() => JSON.parse('{', Timespan.reviver)).toThrow(SyntaxError);
      expect(() => JSON.parse('not json', Timespan.reviver)).toThrow(
        SyntaxError,
      );
    });

    it('throws when a recognized timespan is missing a field', () => {
      expect(() =>
        JSON.parse(
          JSON.stringify({ $type: 'Timespan', start: json.start }),
          Timespan.reviver,
        ),
      ).toThrow(new TypeError('Invalid Timespan JSON.'));
    });

    it('throws when a date string cannot be parsed', () => {
      expect(() =>
        JSON.parse(
          JSON.stringify({
            span: {
              $type: 'Timespan',
              start: 'not-a-date',
              end: json.end,
            },
          }),
          Timespan.reviver,
        ),
      ).toThrow(new Error('Invalid date: expected a valid Date.'));
    });

    it('throws when the start is after the end', () => {
      expect(() =>
        JSON.parse(
          JSON.stringify({
            $type: 'Timespan',
            start: json.end,
            end: json.start,
          }),
          Timespan.reviver,
        ),
      ).toThrow(
        new Error(
          'Invalid date range: expected the start date to be less than or equal to the end date.',
        ),
      );
    });
  });
});
