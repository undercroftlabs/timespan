import { TimeFrame } from './types/timeframe';
import { TimeUnit } from './types';
import { calculateTimeFrame, timeFrameToString } from './utils';
import { getConverter } from './unit-conversion-map';
import { createTimeframe } from './type-utils/create-timeframe';
import * as Assertions from './assertions';
import Constants from './constants';

/**
 * Represents a time span between two dates.
 */
export class Timespan {
  /**
   * The start of the time span.
   */
  private readonly startDate: Date;

  /**
   * The end of the time span.
   */
  private readonly endDate: Date;

  /**
   * We precalculate the string value when the Timespan
   * is created so you don't incur as much memory cost generating
   * it when you want to use it.
   */
  private readonly stringValue: string;

  /**
   * We go ahead and generate the TimeFrame when the Timespan
   * is created. This way you can go ahead and get the timeframe
   * at only point without incurring any extra memory cost.
   */
  private readonly timeFrame: TimeFrame;

  /**
   * Create a new Timespan instance.
   * @param start - The start date of the timespan.
   * @param end - The end date of the timespan.
   */
  constructor(start: Date, end: Date) {
    Assertions.assertValidDate(start);
    Assertions.assertValidDate(end);
    Assertions.assertValidDateRange(start, end);
    this.startDate = new Date(start.getTime());
    this.endDate = new Date(end.getTime());
    this.timeFrame = calculateTimeFrame(this.startDate, this.endDate);
    this.stringValue = timeFrameToString(this.timeFrame);
  }

  /**
   * Get the start date of the timespan.
   * @returns The start date.
   */
  public get start(): Date {
    return new Date(this.startDate.getTime());
  }

  /**
   * Get the end date of the timespan.
   * @returns The end date.
   */
  public get end(): Date {
    return new Date(this.endDate.getTime());
  }

  /**
   * Create a Timespan instance from a string input.
   * @example - "1y 2M 3w 4d 5h 6m 7s 8ms"
   * @example - "1yr 2mos 3wks 4dys 5hrs 6mins 7secs 8mss"
   * @example - "2years 1month 3weeks 4days"
   * @param input - The input string representing the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan instance representing the parsed timespan.
   * @throws Error if the input is invalid or contains an invalid unit.
   */
  public static fromString = (input: string, startDate?: Date): Timespan => {
    const start = startDate ? startDate : new Date();
    Assertions.assertValidDate(start);
    Assertions.assertMaxInputLength(input);
    Assertions.assertAllowedCharacters(input);

    const timeframe: TimeFrame = createTimeframe();

    // Clone the pattern per call. The shared constant is global, so a throw
    // mid-parse would otherwise leave lastIndex advanced for the next call.
    const pattern = new RegExp(
      Constants.InputRegexPattern.source,
      Constants.InputRegexPattern.flags,
    );

    // Start matching the regex.
    let match = pattern.exec(input);

    // Check to see if we don't have a match.
    if (!match) {
      throw new Error(`Invalid unit`);
    }

    // The pattern is unanchored and the value group may be empty, so a
    // match can ignore leftover digits ("99999999999ms") or accept a bare
    // unit ("h") and produce a span the caller cannot tell from zero.
    let consumed = '';

    // Loop over the matches as we make more matches.
    while (match) {
      const rawValue = match[Constants.InputRegexValueIndex];
      const unit: string = match[Constants.InputRegexUnitIndex];
      Assertions.assertValidTimeUnit(unit);
      if (rawValue.length === 0) {
        throw new Error('Invalid input string');
      }
      const value = Number(rawValue);
      const plural = getConverter(unit).plural;
      timeframe[plural] = value;
      consumed += match[0];

      // Match the next and run the loop again.
      match = pattern.exec(input);
    }

    if (consumed !== input.replace(/\s+/g, '')) {
      throw new Error('Invalid input string');
    }

    // Set the end date to however many milliseconds we have calculated.
    const endDate = new Date(start);

    endDate.setUTCFullYear(endDate.getUTCFullYear() + timeframe.years);
    endDate.setUTCMonth(endDate.getUTCMonth() + timeframe.months);
    endDate.setUTCDate(
      endDate.getUTCDate() + timeframe.weeks * Constants.DaysPerWeek,
    );
    endDate.setUTCDate(endDate.getUTCDate() + timeframe.days);
    endDate.setUTCHours(endDate.getUTCHours() + timeframe.hours);
    endDate.setUTCMinutes(endDate.getUTCMinutes() + timeframe.minutes);
    endDate.setUTCSeconds(endDate.getUTCSeconds() + timeframe.seconds);
    endDate.setUTCMilliseconds(
      endDate.getUTCMilliseconds() + timeframe.milliseconds,
    );

    // Return the new timespan to the consumer. Since the timespan does all
    // timeframe and string calculations on initialization, our job here is done.
    return new Timespan(start, endDate);
  };

  /**
   * Creates a Timespan from the specified number of units.
   * @param amount - The number of the specified units.
   * @param unit - The unit of time.
   * @param startDate - The date to start from.
   * @returns A Timespan object representing the specified number of time units.
   */
  public static fromUnits = (
    amount: number,
    unit: TimeUnit,
    startDate?: Date,
  ): Timespan => {
    const start = startDate || new Date();
    Assertions.assertValidDate(start);
    Assertions.assertValidTimeUnit(unit);
    if (amount < 0) {
      throw new Error(`Invalid unit input ${amount}.`);
    }
    const converter = getConverter(unit);
    const endDate = converter.add(amount, start);
    Assertions.assertValidDateRange(start, endDate);
    return new Timespan(start, endDate);
  };

  /**
   * Creates a Timespan object from a specified number of milliseconds.
   * @param millis - The number of milliseconds for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of milliseconds.
   */
  public static fromMilliseconds = (
    millis: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(millis, 'milliseconds', startDate);

  /**
   * Creates a Timespan object from a specified number of seconds.
   * @param seconds - The number of seconds for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of seconds.
   */
  public static fromSeconds = (seconds: number, startDate?: Date): Timespan =>
    this.fromUnits(seconds, 'seconds', startDate);

  /**
   * Creates a Timespan object from a specified number of minutes.
   * @param minutes - The number of minutes for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of minutes.
   */
  public static fromMinutes = (minutes: number, startDate?: Date): Timespan =>
    this.fromUnits(minutes, 'minutes', startDate);

  /**
   * Creates a Timespan object from a specified number of hours.
   * @param hours - The number of hours for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of hours.
   */
  public static fromHours = (hours: number, startDate?: Date): Timespan =>
    this.fromUnits(hours, 'hours', startDate);

  /**
   * Creates a Timespan object from a specified number of days.
   * @param days - The number of days for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of days.
   */
  public static fromDays = (days: number, startDate?: Date): Timespan =>
    this.fromUnits(days, 'days', startDate);

  /**
   * Creates a Timespan object from a specified number of weeks.
   * @param weeks - The number of weeks for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of weeks.
   */
  public static fromWeeks = (weeks: number, startDate?: Date): Timespan =>
    this.fromUnits(weeks, 'weeks', startDate);

  /**
   * Creates a Timespan object from a specified number of months.
   * @param months - The number of months for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of months.
   */
  public static fromMonths = (months: number, startDate?: Date): Timespan =>
    this.fromUnits(months, 'months', startDate);

  /**
   * Creates a Timespan object from a specified number of years.
   * @param years - The number of years for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of years.
   */
  public static fromYears = (years: number, startDate?: Date): Timespan =>
    this.fromUnits(years, 'years', startDate);

  /**
   * Check if two timespans are equal.
   * @param ts1 - The first Timespan to compare.
   * @param ts2 - The second Timespan to compare.
   * @param compareBy - The method of comparison: 'range' for start and end dates, 'duration' for total duration.
   * @returns True if the two timespans are equal, false otherwise.
   */
  public static equals(
    ts1: Timespan,
    ts2: Timespan,
    compareBy: 'range' | 'duration' = 'duration',
  ): boolean {
    return ts1.equals(ts2, compareBy);
  }

  /**
   * Compare two timespans.
   * @param ts1 - The first Timespan to compare.
   * @param ts2 - The second Timespan to compare.
   * @returns A negative number if ts1 is less than ts2, a positive number if
   * ts1 is greater than ts2, and 0 if they are equal.
   */
  public static compareTo = (ts1: Timespan, ts2: Timespan): number => {
    return ts1.compareTo(ts2);
  };

  /**
   * Convert the timespan to a TimeFrame object.
   * @returns The TimeFrame object representing the timespan.
   */
  public toTimeframe = (): TimeFrame => ({ ...this.timeFrame });

  /**
   * Convert the timespan to a string representation.
   * @returns The string representation of the timespan.
   */
  public toString = (): string => this.stringValue;

  /**
   * Convert the timespan to the specified unit of measurement.
   * @param unit - The unit of time
   * @returns The duration in the specified time unit.
   */
  public toUnit = (unit: TimeUnit): number => {
    Assertions.assertValidTimeUnit(unit);
    const converter = getConverter(unit);
    return converter.between(this.startDate, this.endDate);
  };

  /**
   * Convert the timespan to the total duration in milliseconds.
   * @returns The duration in milliseconds.
   */
  public toMilliseconds = (): number => this.toUnit('milliseconds');

  /**
   * Convert the timespan to the total duration in seconds.
   * @returns The duration in seconds.
   */
  public toSeconds = (): number => this.toUnit('seconds');

  /**
   * Convert the timespan to the total duration in minutes.
   * @returns The duration in minutes.
   */
  public toMinutes = (): number => this.toUnit('minutes');

  /**
   * Convert the timespan to the total duration in hours.
   * @returns The duration in hours.
   */
  public toHours = (): number => this.toUnit('hours');

  /**
   * Convert the timespan to the total duration in days.
   * @returns The duration in days.
   */
  public toDays = (): number => this.toUnit('days');

  /**
   * Convert the timespan to the total duration in weeks.
   * @returns The duration in weeks.
   */
  public toWeeks = (): number => this.toUnit('weeks');

  /**
   * Convert the timespan to the total duration in months.
   * @returns The duration in months.
   */
  public toMonths = (): number => this.toUnit('months');

  /**
   * Convert the timespan to the total duration in years.
   * @returns The duration in years.
   */
  public toYears = (): number => this.toUnit('years');

  /**
   * Check if two timespans are equal.
   * @param other - The other Timespan to compare with.
   * @param compareBy - The method of comparison: 'range' for start and end dates, 'duration' for total duration.
   * @returns True if the two timespans are equal, false otherwise.
   */
  public equals(
    other: Timespan,
    compareBy: 'range' | 'duration' = 'duration',
  ): boolean {
    if (compareBy === 'range') {
      return (
        this.start.getTime() === other.start.getTime() &&
        this.end.getTime() === other.end.getTime()
      );
    }
    return this.toMilliseconds() === other.toMilliseconds();
  }

  /**
   * Compare this timespan to another timespan.
   * @param other - The other Timespan to compare with.
   * @returns A negative number if this timespan is less than the other,
   */
  public compareTo = (other: Timespan): number => {
    const thisMillis = this.toMilliseconds();
    const otherMillis = other.toMilliseconds();
    if (thisMillis < otherMillis) {
      return -1;
    }
    if (thisMillis > otherMillis) {
      return 1;
    }
    return 0;
  };
}
