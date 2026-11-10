import { DateUnitConverter } from './date-unit-converter';
import Constants from '../constants';
import { WeekUnit } from '../types';

/**
 * Represents a converter for the week unit.
 */
export class WeekConverter extends DateUnitConverter {
  /**
   * The default name of the week unit.
   */
  public readonly default: WeekUnit = 'week';

  /**
   * The plural name of the week unit.
   */
  public readonly plural: WeekUnit = 'weeks';

  /**
   * The abbreviated name of the week unit.
   */
  public readonly abbreviation: WeekUnit = 'w';

  /**
   * The number of milliseconds per week.
   */
  public readonly millisecondsPerUnit =
    Constants.DaysPerWeek *
    Constants.HoursPerDay *
    Constants.MinutesPerHour *
    Constants.SecondsPerMinute *
    Constants.MillisecondsPerSecond;

  /**
   * An array of aliases for the week unit.
   */
  public readonly aliases: Array<WeekUnit> = [
    'w',
    'wk',
    'wks',
    'week',
    'weeks',
  ];

  /**
   * Calculates the number of weeks between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of weeks between the two dates.
   * @throws Error if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    return Math.floor(
      (endDate.getTime() - startDate.getTime()) / this.millisecondsPerUnit,
    );
  }

  /**
   * Adds the specified number of weeks to the given date.
   * @param weeks - The number of weeks to add.
   * @param startDate - The start date.
   * @returns The new date after adding the weeks.
   * @throws Error if the input date is invalid or if the number of weeks is negative.
   */
  public add(weeks: number, startDate: Date): Date {
    const weeksInMilliseconds = weeks * this.millisecondsPerUnit;
    const addedMilliseconds = startDate.getTime() + weeksInMilliseconds;
    return new Date(addedMilliseconds);
  }
}
