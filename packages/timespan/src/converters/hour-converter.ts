import { assertValidDate } from '../assertions/assert-valid-date';
import { assertValidDateRange } from '../assertions/assert-valid-date-range';
import Constants from '../constants';
import { HourUnit } from '../types';
import { DateUnitConverter } from './date-unit-converter';

/**
 * Represents a converter for the hour unit.
 */
export class HourConverter extends DateUnitConverter {
  /**
   * The default name of the hour unit.
   */
  public readonly default: HourUnit = 'hour';

  /**
   * The plural name of the hour unit.
   */
  public readonly plural: HourUnit = 'hours';

  /**
   * The abbreviated name of the hour unit.
   */
  public readonly abbreviation: HourUnit = 'h';

  /**
   * The number of milliseconds per hour.
   */
  public readonly millisecondsPerUnit =
    Constants.MinutesPerHour *
    Constants.SecondsPerMinute *
    Constants.MillisecondsPerSecond;

  /**
   * An array of aliases for the hour unit.
   */
  public readonly aliases: Array<HourUnit> = [
    'hours',
    'hour',
    'hrs',
    'hr',
    'h',
  ];

  /**
   * Calculates the number of hours between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of hours between the two dates.
   * @throws {Error} if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    assertValidDateRange(startDate, endDate);

    const startMillis = startDate.getTime();
    const endMillis = endDate.getTime();

    const hourCount = Math.floor(
      (endMillis - startMillis) / this.millisecondsPerUnit,
    );

    return Math.floor(hourCount);
  }

  /**
   * Adds the specified number of hours to the given date.
   * @param hours - The number of hours to add.
   * @param startDate - The start date.
   * @returns The new date after adding the hours.
   * @throws {Error} if the input date is invalid or if the number of hours is negative.
   */
  public add(hours: number, startDate: Date): Date {
    assertValidDate(startDate);

    if (!Number.isFinite(hours) || hours < 0) {
      throw new Error(
        'Invalid number of hours: expected zero or a positive number.',
      );
    }

    return new Date(startDate.getTime() + hours * this.millisecondsPerUnit);
  }
}
