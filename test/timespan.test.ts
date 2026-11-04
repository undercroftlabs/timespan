// noinspection DuplicatedCode

import { Timespan } from '../src';

describe('Timespan', () => {
  const start = new Date('2022-01-01T06:24:00Z');
  const end = new Date('2023-02-21T10:52:00Z');

  describe('constructor', () => {
    it('should throw an error if the start date is greater than the end date', () => {
      const startDate = new Date('2023-06-01');
      const endDate = new Date('2023-05-31');
      expect(() => new Timespan(startDate, endDate)).toThrow(
        'Start date cannot be greater than end date.',
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
      const startDate = '2023-05-01' as any;
      expect(() => Timespan.fromUnits(5, 'year', startDate)).toThrow(
        'Invalid date input.',
      );
    });

    it('should throw an error for negative day input', () => {
      const startDate = new Date('2023-05-01');
      expect(() => Timespan.fromUnits(-5, 'year', startDate)).toThrow(
        'Invalid unit input -5.',
      );
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
      }).toThrow('Invalid date unit: x');
    });

    it('should throw an error for invalid unit', () => {
      expect(() => Timespan.fromString('5 unknownUnit')).toThrowError(
        'Invalid date unit: unknownUnit.',
      );
    });

    it('should throw an error when the input has no unit', () => {
      expect(() => Timespan.fromString('5')).toThrowError('Invalid unit');
    });

    it('should parse a valid string again after a parse throws', () => {
      const startDate = new Date(Date.UTC(2020, 0, 1));
      const first = Timespan.fromString('1h', startDate);

      expect(first.toString()).toBe('1h');
      expect(() => Timespan.fromString('1h 2x', startDate)).toThrow(
        'Invalid date unit: x.',
      );

      const third = Timespan.fromString('1h', startDate);
      expect(third.toString()).toBe('1h');
      expect(third.toMilliseconds()).toBe(first.toMilliseconds());
    });

    it('should throw an error for input exceeding mac length', () => {
      expect(() => Timespan.fromString(''.padEnd(100, '1'))).toThrowError(
        'Invalid input string',
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
        expect(() => Timespan.fromString(character)).toThrowError(
          'Invalid input string',
        );
      },
    );

    it('should throw an error for input that contains invalid character " Hello World"', () => {
      expect(() => Timespan.fromString(' Hello World')).toThrowError(
        'Invalid date unit: Hello',
      );
    });

    it('should throw an error for input that contains invalid character "Hello\\tWorld"', () => {
      expect(() => Timespan.fromString('Hello\tWorld')).toThrowError(
        'Invalid date unit: Hello',
      );
    });

    it('should throw an error for input that contains invalid character "Hello\\nWorld"', () => {
      expect(() => Timespan.fromString('Hello\nWorld')).toThrowError(
        'Invalid date unit: Hello',
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
  });
});
