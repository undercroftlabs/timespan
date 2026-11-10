import { DateUnitConverter } from './date-unit-converter';
import Constants from '../constants';
import { DayUnit } from '../types';

/**
 * Represents a converter for the day unit.
 */
export class DayConverter extends DateUnitConverter {
  /**
   * The default name of the day unit.
   */
  public readonly default: DayUnit = 'day';

  /**
   * The plural name of the day unit.
   */
  public readonly plural: DayUnit = 'days';

  /**
   * The abbreviated name of the day unit.
   */
  public readonly abbreviation: DayUnit = 'd';

  /**
   * The number of milliseconds per day.
   */
  public readonly millisecondsPerUnit =
    Constants.HoursPerDay *
    Constants.MinutesPerHour *
    Constants.SecondsPerMinute *
    Constants.MillisecondsPerSecond;

  /**
   * An array of aliases for the day unit.
   */
  public readonly aliases: Array<DayUnit> = ['day', 'days', 'dys', 'dy', 'd'];

  /**
   * Calculates the number of days between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of days between the two dates.
   * @throws Error if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    const startMillis = startDate.getTime();
    const endMillis = endDate.getTime();

    const dayCount = Math.floor(
      (endMillis - startMillis) / this.millisecondsPerUnit,
    );

    return Math.floor(dayCount);
  }

  /**
   * Adds the specified number of days to the given date.
   * @param days - The number of days to add.
   * @param startDate - The start date.
   * @returns The new date after adding the days.
   * @throws Error if the input date is invalid or if the number of days is negative.
   */
  public add(days: number, startDate: Date): Date {
    return new Date(startDate.getTime() + days * this.millisecondsPerUnit);
  }
}
