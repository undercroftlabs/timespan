import { assertValidDate } from '../assertions/assert-valid-date';
import { assertValidDateRange } from '../assertions/assert-valid-date-range';
import Constants from '../constants';
import { MinuteUnit } from '../types';
import { DateUnitConverter } from './date-unit-converter';

/**
 * Represents a converter for the minute unit.
 */
export class MinuteConverter extends DateUnitConverter {
  /**
   * The default name of the minute unit.
   */
  public readonly default: MinuteUnit = 'minute';

  /**
   * The plural name of the minute unit.
   */
  public readonly plural: MinuteUnit = 'minutes';

  /**
   * The abbreviated name of the minute unit.
   */
  public readonly abbreviation: MinuteUnit = 'm';

  /**
   * The number of milliseconds per minute (60 * 1000).
   */
  public readonly millisecondsPerUnit =
    Constants.SecondsPerMinute * Constants.MillisecondsPerSecond;

  /**
   * An array of aliases for the minute unit.
   */
  public readonly aliases: Array<MinuteUnit> = [
    'minutes',
    'minute',
    'mins',
    'min',
    'm',
  ];

  /**
   * Calculates the number of minutes between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of minutes between the two dates.
   * @throws {Error} if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    assertValidDateRange(startDate, endDate);

    const startMillis = startDate.getTime();
    const endMillis = endDate.getTime();

    const minuteCount = Math.floor(
      (endMillis - startMillis) / this.millisecondsPerUnit,
    );

    return Math.floor(minuteCount);
  }

  /**
   * Adds the specified number of minutes to the given date.
   * @param minutes - The number of minutes to add.
   * @param startDate - The start date.
   * @returns The new date after adding the minutes.
   * @throws {Error} if the input date is invalid or if the number of minutes is negative.
   */
  public add(minutes: number, startDate: Date): Date {
    assertValidDate(startDate);

    if (minutes < 0) {
      throw new Error(
        'Invalid number of minutes: expected zero or a positive number.',
      );
    }

    return new Date(startDate.getTime() + minutes * this.millisecondsPerUnit);
  }
}
