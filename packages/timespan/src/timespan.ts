import { TimeFrame } from './types/timeframe';
import { TimeUnit } from './types/time-unit';
import { calculateTimeFrame } from './utils/calculate-time-frame';
import { timeFrameToString } from './utils/timeframe-to-string';
import { getConverter } from './utils/unit-conversion-map';
import { assertValidDate } from './assertions/assert-valid-date';
import { assertValidDateRange } from './assertions/assert-valid-date-range';
import { assertValidTimeUnit } from './assertions/assert-valid-time-unit';
import { assertAllowedCharacters } from './assertions/assert-allowed-characters';
import { assertMaxInputLength } from './assertions/assert-max-input-length';
import { assertValidFormatString } from './assertions/assert-valid-format-string';
import { formatTimespan } from './utils/format-timespan';
import Constants from './constants';
import { TimespanJson } from './types/timespan-json';
import { assertValidTimespanJson } from './assertions/assert-valid-timespan-json';
import { isTimespanJson } from './type-guards/is-timespan-json';

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
    assertValidDate(start);
    assertValidDate(end);
    assertValidDateRange(start, end);
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
   * @throws {Error} if the input is invalid, contains an invalid unit, repeats a unit, or uses a fractional value. Use the unit factories (for example fromHours) for fractions of fixed-length units.
   */
  public static readonly fromString = (
    input: string,
    startDate?: Date,
  ): Timespan => {
    const start = startDate ? startDate : new Date();
    assertValidDate(start);
    assertMaxInputLength(input);
    assertAllowedCharacters(input);

    const timeframe: TimeFrame = {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };

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
    const seenUnits = new Set<string>();

    // Loop over the matches as we make more matches.
    while (match) {
      const rawValue = match[Constants.InputRegexValueIndex];
      const unit: string = match[Constants.InputRegexUnitIndex];
      assertValidTimeUnit(unit);
      if (rawValue.length === 0) {
        throw new Error('Invalid input string');
      }
      const value = Number(rawValue);
      const plural = getConverter(unit).plural;
      if (seenUnits.has(plural)) {
        throw new Error(`Duplicate date unit: ${unit}.`);
      }
      seenUnits.add(plural);
      timeframe[plural] = value;
      consumed += match[0];

      // Match the next and run the loop again.
      match = pattern.exec(input);
    }

    if (consumed !== input.replace(/\s+/g, '')) {
      throw new Error('Invalid input string');
    }

    // Apply units through the converters so year/month addition clamps the
    // same way as fromYears / fromMonths instead of overflowing via Date setters.
    const units: Array<
      | 'years'
      | 'months'
      | 'weeks'
      | 'days'
      | 'hours'
      | 'minutes'
      | 'seconds'
      | 'milliseconds'
    > = [
      'years',
      'months',
      'weeks',
      'days',
      'hours',
      'minutes',
      'seconds',
      'milliseconds',
    ];
    let endDate = new Date(start);
    for (const unit of units) {
      const amount = timeframe[unit];
      if (amount !== 0) {
        endDate = getConverter(unit).add(amount, endDate);
      }
    }

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
  public static readonly fromUnits = (
    amount: number,
    unit: TimeUnit,
    startDate?: Date,
  ): Timespan => {
    const start = startDate || new Date();
    assertValidDate(start);
    assertValidTimeUnit(unit);
    if (amount < 0) {
      throw new Error(`Invalid unit input ${amount}.`);
    }
    const converter = getConverter(unit);
    const endDate = converter.add(amount, start);
    assertValidDateRange(start, endDate);
    return new Timespan(start, endDate);
  };

  /**
   * Creates a Timespan object from a specified number of milliseconds.
   * @param millis - The number of milliseconds for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of milliseconds.
   */
  public static readonly fromMilliseconds = (
    millis: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(millis, 'milliseconds', startDate);

  /**
   * Creates a Timespan object from a specified number of seconds.
   * @param seconds - The number of seconds for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of seconds.
   */
  public static readonly fromSeconds = (
    seconds: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(seconds, 'seconds', startDate);

  /**
   * Creates a Timespan object from a specified number of minutes.
   * @param minutes - The number of minutes for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of minutes.
   */
  public static readonly fromMinutes = (
    minutes: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(minutes, 'minutes', startDate);

  /**
   * Creates a Timespan object from a specified number of hours.
   * @param hours - The number of hours for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of hours.
   */
  public static readonly fromHours = (
    hours: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(hours, 'hours', startDate);

  /**
   * Creates a Timespan object from a specified number of days.
   * @param days - The number of days for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of days.
   */
  public static readonly fromDays = (
    days: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(days, 'days', startDate);

  /**
   * Creates a Timespan object from a specified number of weeks.
   * @param weeks - The number of weeks for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of weeks.
   */
  public static readonly fromWeeks = (
    weeks: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(weeks, 'weeks', startDate);

  /**
   * Creates a Timespan object from a specified number of months.
   * @param months - The number of months for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of months.
   */
  public static readonly fromMonths = (
    months: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(months, 'months', startDate);

  /**
   * Creates a Timespan object from a specified number of years.
   * @param years - The number of years for the timespan.
   * @param startDate - Optional start date for the timespan. If not provided, the current date is used.
   * @returns A Timespan object representing the specified number of years.
   */
  public static readonly fromYears = (
    years: number,
    startDate?: Date,
  ): Timespan => this.fromUnits(years, 'years', startDate);

  /**
   * Check if two timespans are equal.
   * @param ts1 - The first Timespan to compare.
   * @param ts2 - The second Timespan to compare.
   * @param compareBy - The method of comparison: 'range' for start and end dates, 'duration' for total duration.
   * @returns True if the two timespans are equal, false otherwise.
   */
  public static readonly equals = (
    ts1: Timespan,
    ts2: Timespan,
    compareBy: 'range' | 'duration' = 'duration',
  ): boolean => ts1.equals(ts2, compareBy);

  /**
   * Compare two timespans.
   * @param ts1 - The first Timespan to compare.
   * @param ts2 - The second Timespan to compare.
   * @returns A negative number if ts1 is less than ts2, a positive number if
   * ts1 is greater than ts2, and 0 if they are equal.
   */
  public static readonly compareTo = (ts1: Timespan, ts2: Timespan): number =>
    ts1.compareTo(ts2);

  /**
   * Format a timespan with a caller-supplied format string.
   * Directives use `%[flags][width][.precision]specifier`. `%%` is a literal
   * percent. Uppercase specifiers are totals (`%D` days) and lowercase
   * specifiers are timeframe components (`%d` days). `%f` is fractional seconds.
   * Width and precision must be below 1,000,000. The format string itself has
   * no length limit.
   * @param formatString - The format string to use.
   * @param timespan - The timespan to format.
   * @returns The formatted text.
   * @throws {Error} `Invalid format string: expected a string.`
   * @throws {Error} `Invalid format string: expected a valid format string.`
   * @example
   * Timespan.format('%D days', timespan);
   */
  public static readonly format = (
    formatString: string,
    timespan: Timespan,
  ): string => timespan.format(formatString);

  /**
   * Convert a timespan to its JSON object.
   * The object is `{ $type: 'Timespan', start, end }`, with both instants as
   * ISO strings. `JSON.stringify` calls the instance method for a timespan value.
   * @param timespan - The timespan to convert.
   * @returns The JSON object for the timespan.
   * @example
   * Timespan.toJSON(timespan);
   */
  public static readonly toJSON = (timespan: Timespan): TimespanJson =>
    timespan.toJSON();

  /**
   * Create a timespan from a JSON object.
   * The object must have `$type: 'Timespan'` and string `start` and `end`
   * values. The strings must be parseable dates, and the start must not be
   * after the end. Extra fields are ignored.
   * @param json - The JSON object to read.
   * @returns A timespan covering the parsed instants.
   * @throws {TypeError} `Invalid Timespan JSON.`
   * @throws {Error} `Invalid date: expected a valid Date.`
   * @throws {Error} `Invalid date range: expected the start date to be less than or equal to the end date.`
   * @example
   * Timespan.fromJSON(timespan.toJSON());
   */
  public static readonly fromJSON = (json: unknown): Timespan => {
    assertValidTimespanJson(json);
    return new Timespan(new Date(json.start), new Date(json.end));
  };

  /**
   * Create a timespan from a JSON string.
   * The text must be one Timespan JSON object. Use `reviver` when a timespan
   * is nested inside a larger JSON value.
   * @param jsonString - JSON text for one timespan.
   * @returns A timespan covering the parsed instants.
   * @throws {SyntaxError} When `jsonString` is not JSON.
   * @throws {TypeError} `Invalid Timespan JSON.`
   * @throws {Error} `Invalid date: expected a valid Date.`
   * @throws {Error} `Invalid date range: expected the start date to be less than or equal to the end date.`
   * @example
   * Timespan.parse(Timespan.stringify(timespan));
   */
  public static readonly parse = (jsonString: string): Timespan => {
    return Timespan.fromJSON(JSON.parse(jsonString));
  };

  /**
   * Revive Timespan JSON objects while parsing a larger JSON value.
   * Pass this function as the reviver to `JSON.parse`. Objects whose `$type`
   * is `Timespan` become timespans. Every other value is returned unchanged.
   * @param _key - Property name supplied by `JSON.parse`. The root key is `''`.
   * The reviver does not use it.
   * @param value - The value `JSON.parse` has built for this property.
   * @returns A timespan when `value` is Timespan JSON, otherwise `value`.
   * @throws {TypeError} `Invalid Timespan JSON.`
   * @throws {Error} `Invalid date: expected a valid Date.`
   * @throws {Error} `Invalid date range: expected the start date to be less than or equal to the end date.`
   * @example
   * JSON.parse(text, Timespan.reviver);
   */
  public static readonly reviver = (_key: string, value: unknown): unknown => {
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      '$type' in value &&
      value.$type === 'Timespan'
    ) {
      return Timespan.fromJSON(value);
    }
    return value;
  };

  /**
   * Convert a timespan to a JSON string.
   * This is `JSON.stringify` of the timespan, so the text is the object from
   * `toJSON`.
   * @param timespan - The timespan to convert.
   * @returns JSON text for the timespan.
   * @example
   * Timespan.stringify(timespan);
   */
  public static readonly stringify = (timespan: Timespan): string => {
    return JSON.stringify(timespan);
  };

  /**
   * Report whether a value has the Timespan JSON shape.
   * This checks the serialized shape, not whether reconstruction will succeed.
   * `$type` must be `Timespan`, and `start` and `end` must be strings. The
   * strings are not parsed as dates, and the start is not compared with the
   * end, so a true result can still make `fromJSON` throw. A `Timespan`
   * instance itself returns false.
   * @param value - The value to inspect.
   * @returns True when `value` matches the Timespan JSON shape.
   * @example
   * Timespan.isTimespanJSON(timespan.toJSON());
   */
  public static readonly isTimespanJSON = (
    value: unknown,
  ): value is TimespanJson => {
    return isTimespanJson(value);
  };

  /**
   * Convert the timespan to a TimeFrame object.
   * @returns The TimeFrame object representing the timespan.s
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
    assertValidTimeUnit(unit);
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

  /**
   * Format this timespan with a caller-supplied format string.
   * See `Timespan.format` for the directive grammar. `Timespan.format` calls
   * this method.
   * @param formatString - The format string to use.
   * @returns The formatted text.
   * @throws {Error} `Invalid format string: expected a string.`
   * @throws {Error} `Invalid format string: expected a valid format string.`
   * @example
   * timespan.format('%h:%02m:%02s');
   */
  public format = (formatString: string): string => {
    assertValidFormatString(formatString);
    return formatTimespan(formatString, this);
  };

  /**
   * Convert this timespan to its JSON object.
   * `JSON.stringify` calls this method. The result is
   * `{ $type: 'Timespan', start, end }`, with both instants as ISO strings.
   * @returns The JSON object for this timespan.
   * @example
   * timespan.toJSON();
   */
  public toJSON = (): TimespanJson => {
    return {
      $type: 'Timespan',
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
    };
  };
}
