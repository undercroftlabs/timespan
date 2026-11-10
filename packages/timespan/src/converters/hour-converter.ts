import { DateUnitConverter } from './date-unit-converter';
import Constants from '../constants';
import { HourUnit } from '../types';

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
   * @throws Error if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    return Math.floor(
      (endDate.getTime() - startDate.getTime()) / this.millisecondsPerUnit,
    );
  }

  /**
   * Adds the specified number of hours to the given date.
   * @param hours - The number of hours to add.
   * @param startDate - The start date.
   * @returns The new date after adding the hours.
   * @throws Error if the input date is invalid or if the number of hours is negative.
   */
  public add(hours: number, startDate: Date): Date {
    return new Date(startDate.getTime() + hours * this.millisecondsPerUnit);
  }
}
