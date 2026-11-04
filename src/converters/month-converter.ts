import { DateUnitConverter } from './date-unit-converter';
import Constants from '../constants';
import { MonthUnit } from '../types';

/**
 * Represents a converter for the month unit.
 */
export class MonthConverter extends DateUnitConverter {
  /**
   * The default name of the month unit.
   */
  public readonly default: MonthUnit = 'month';

  /**
   * The plural name of the month unit.
   */
  public readonly plural: MonthUnit = 'months';

  /**
   * The abbreviated name of the month unit.
   */
  public readonly abbreviation: MonthUnit = 'M';

  /**
   * The number of milliseconds per month (-1).
   */
  public readonly millisecondsPerUnit = -1;

  /**
   * An array of aliases for the month unit.
   */
  public readonly aliases: Array<MonthUnit> = [
    'months',
    'month',
    'mos',
    'mo',
    'M',
  ];

  /**
   * Calculates the number of months between two dates.
   * @param startDate - The start date.
   * @param endDate - The end date.
   * @returns The number of months between the two dates.
   * @throws Error if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    const startYear = startDate.getUTCFullYear();
    const startMonth = startDate.getUTCMonth();
    const endYear = endDate.getUTCFullYear();
    const endMonth = endDate.getUTCMonth();

    let months =
      (endYear - startYear) * Constants.MonthsPerYear + (endMonth - startMonth);
    // Day-of-month comparison ignores time, so Jan 15 12:00 to Feb 15 11:00
    // would count as a full month. A month has elapsed only once add()
    // would land on or before the end.
    if (
      months > 0 &&
      this.add(months, startDate).getTime() > endDate.getTime()
    ) {
      months--;
    }
    return Math.floor(months);
  }

  /**
   * Adds the specified number of months to the given date.
   * @param months - The number of months to add.
   * @param startDate - The start date.
   * @returns The new date after adding the months.
   * @throws Error if the input date is invalid or if the number of months is negative.
   */
  public add(months: number, startDate: Date): Date {
    const newDate = new Date(startDate);
    const originalHours = newDate.getUTCHours();
    const originalMinutes = newDate.getUTCMinutes();
    const originalSeconds = newDate.getUTCSeconds();
    const originalMilliseconds = newDate.getUTCMilliseconds();
    // Set UTC time components to zero
    newDate.setUTCHours(0, 0, 0, 0);
    newDate.setUTCMonth(newDate.getUTCMonth() + months);
    // Restore original UTC time components
    newDate.setUTCHours(
      originalHours,
      originalMinutes,
      originalSeconds,
      originalMilliseconds,
    );
    return newDate;
  }
}
