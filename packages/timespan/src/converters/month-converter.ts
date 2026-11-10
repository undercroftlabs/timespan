import { assertValidDate } from '../assertions/assert-valid-date';
import { assertValidDateRange } from '../assertions/assert-valid-date-range';
import Constants from '../constants';
import { MonthUnit } from '../types';
import { DateUnitConverter } from './date-unit-converter';

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
   * @throws {Error} if the input dates are invalid or if the start date is greater than the end date.
   */
  public between(startDate: Date, endDate: Date): number {
    assertValidDateRange(startDate, endDate);

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
   * @throws {Error} if the input date is invalid or if the number of months is negative.
   */
  public add(months: number, startDate: Date): Date {
    assertValidDate(startDate);

    if (!Number.isFinite(months) || months < 0) {
      throw new Error(
        'Invalid number of months: expected zero or a positive number.',
      );
    }

    const newDate = new Date(startDate.getTime());
    const originalDay = newDate.getUTCDate();
    const originalHours = newDate.getUTCHours();
    const originalMinutes = newDate.getUTCMinutes();
    const originalSeconds = newDate.getUTCSeconds();
    const originalMilliseconds = newDate.getUTCMilliseconds();

    // Move to the first of the month first so setUTCMonth cannot overflow
    // into a later month (Jan 31 + 1 month would otherwise become Mar 3).
    newDate.setUTCDate(1);
    newDate.setUTCMonth(newDate.getUTCMonth() + months);
    const lastDayOfMonth = new Date(
      Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth() + 1, 0),
    ).getUTCDate();
    newDate.setUTCDate(Math.min(originalDay, lastDayOfMonth));
    newDate.setUTCHours(
      originalHours,
      originalMinutes,
      originalSeconds,
      originalMilliseconds,
    );
    const time = newDate.getTime();
    if (
      !Number.isFinite(time) ||
      time > Constants.MaxSafeTimestamp ||
      time < Constants.MinSafeTimestamp
    ) {
      throw new Error(
        'Invalid number of months: expected a result within the representable date range.',
      );
    }
    return newDate;
  }
}
